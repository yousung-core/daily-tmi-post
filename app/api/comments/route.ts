import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { safeParseJSON } from "@/lib/api-helpers";
import { isValidUUID } from "@/lib/validation";
import { validateComment } from "@/lib/profanity";
import { rateLimit } from "@/lib/rate-limit";
import { captureError } from "@/lib/logger";
import { triggerCommentModeration } from "@/lib/comment-moderation";
import type { CommentRow, UserProfileRow, Comment, UserProfile } from "@/lib/types";

function toUserProfile(row: UserProfileRow): UserProfile {
  return {
    id: row.id,
    nickname: row.nickname,
    avatarUrl: row.avatar_url ?? undefined,
    provider: row.provider,
    isBanned: row.is_banned,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toComment(
  row: CommentRow & { user_profiles?: UserProfileRow },
  likeCount: number,
  isLikedByMe: boolean,
  replies?: Comment[]
): Comment {
  return {
    id: row.id,
    articleId: row.article_id,
    userId: row.user_id,
    parentId: row.parent_id ?? undefined,
    content: row.is_deleted ? "" : row.content,
    isDeleted: row.is_deleted,
    isHidden: false,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    userProfile: row.user_profiles ? toUserProfile(row.user_profiles) : undefined,
    likeCount,
    isLikedByMe,
    replies,
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const articleId = searchParams.get("articleId");
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get("pageSize") || "20", 10)));

  if (!articleId || !isValidUUID(articleId)) {
    return NextResponse.json({ error: "유효하지 않은 articleId입니다." }, { status: 400 });
  }

  try {
    const supabase = createSupabaseAdminClient();

    // 현재 사용자 확인 (좋아요 여부 표시용, 미인증도 허용)
    const serverClient = await createSupabaseServerClient();
    const { data: { user } } = await serverClient.auth.getUser();
    const userId = user?.id;

    // 최상위 댓글 조회
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data: topComments, count, error } = await supabase
      .from("comments")
      .select("*, user_profiles(*)", { count: "exact" })
      .eq("article_id", articleId)
      .is("parent_id", null)
      .eq("is_hidden", false)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      captureError("api.comments.list", error);
      return NextResponse.json({ error: "댓글을 불러오지 못했습니다." }, { status: 500 });
    }

    const commentIds = (topComments ?? []).map((c) => c.id);

    // 대댓글 일괄 조회
    let repliesMap: Record<string, (CommentRow & { user_profiles?: UserProfileRow })[]> = {};
    if (commentIds.length > 0) {
      const { data: replies } = await supabase
        .from("comments")
        .select("*, user_profiles(*)")
        .in("parent_id", commentIds)
        .eq("is_hidden", false)
        .order("created_at", { ascending: true })
        .limit(200);

      for (const reply of replies ?? []) {
        const pid = reply.parent_id;
        if (!pid) continue;
        if (!repliesMap[pid]) repliesMap[pid] = [];
        repliesMap[pid].push(reply);
      }
    }

    // 좋아요 수 조회
    const allIds = [
      ...commentIds,
      ...Object.values(repliesMap).flat().map((r) => r.id),
    ];

    let likeCounts: Record<string, number> = {};
    let myLikes = new Set<string>();

    if (allIds.length > 0) {
      // 좋아요 카운트 + 내 좋아요 여부를 단일 쿼리로 조회
      const { data: likes } = await supabase
        .from("comment_likes")
        .select("comment_id, user_id")
        .in("comment_id", allIds);

      for (const like of likes ?? []) {
        likeCounts[like.comment_id] = (likeCounts[like.comment_id] || 0) + 1;
        if (userId && like.user_id === userId) {
          myLikes.add(like.comment_id);
        }
      }
    }

    // 조립
    const comments: Comment[] = (topComments ?? []).map((row) => {
      const replies = (repliesMap[row.id] ?? []).map((r) =>
        toComment(r, likeCounts[r.id] || 0, myLikes.has(r.id))
      );
      return toComment(row, likeCounts[row.id] || 0, myLikes.has(row.id), replies);
    });

    return NextResponse.json({ comments, total: count ?? 0 });
  } catch (err) {
    captureError("api.comments.list", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const serverClient = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await serverClient.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    // 밴 확인
    const supabase = createSupabaseAdminClient();
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("is_banned")
      .eq("id", user.id)
      .single();

    if (profile?.is_banned) {
      return NextResponse.json({ error: "활동이 제한된 계정입니다." }, { status: 403 });
    }

    // Rate Limit
    const rl = await rateLimit(`comment:${user.id}`, 10, 300);
    if (!rl.success) {
      return NextResponse.json(
        { error: "댓글 작성이 너무 빈번합니다. 잠시 후 다시 시도해주세요." },
        { status: 429 }
      );
    }

    const body = await safeParseJSON(request);
    if (!body) {
      return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
    }

    const { articleId, content, parentId } = body as {
      articleId: unknown;
      content: unknown;
      parentId?: unknown;
    };

    if (!articleId || typeof articleId !== "string" || !isValidUUID(articleId)) {
      return NextResponse.json({ error: "유효하지 않은 articleId입니다." }, { status: 400 });
    }
    if (!content || typeof content !== "string") {
      return NextResponse.json({ error: "필수 항목이 누락되었습니다." }, { status: 400 });
    }
    if (parentId && (typeof parentId !== "string" || !isValidUUID(parentId))) {
      return NextResponse.json({ error: "유효하지 않은 parentId입니다." }, { status: 400 });
    }

    // 욕설 필터
    const validation = validateComment(content);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // 대댓글: 부모 댓글 확인 (1단계만 허용)
    if (parentId) {
      const { data: parent } = await supabase
        .from("comments")
        .select("id, parent_id")
        .eq("id", parentId)
        .single();

      if (!parent) {
        return NextResponse.json({ error: "원본 댓글을 찾을 수 없습니다." }, { status: 404 });
      }
      if (parent.parent_id) {
        return NextResponse.json({ error: "대댓글에는 답글을 달 수 없습니다." }, { status: 400 });
      }
    }

    const { data: comment, error: insertError } = await supabase
      .from("comments")
      .insert({
        article_id: articleId,
        user_id: user.id,
        parent_id: parentId || null,
        content: content.trim(),
      })
      .select("*, user_profiles(*)")
      .single();

    if (insertError) {
      captureError("api.comments.create", insertError);
      return NextResponse.json({ error: "댓글 작성에 실패했습니다." }, { status: 500 });
    }

    // 백그라운드 AI 모더레이션 (fire-and-forget)
    triggerCommentModeration(comment.id, content.trim());

    return NextResponse.json({
      comment: toComment(comment, 0, false, []),
    });
  } catch (err) {
    captureError("api.comments.create", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

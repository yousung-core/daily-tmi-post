import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { captureError } from "@/lib/logger";
import { ReportedComment } from "@/lib/types";

export async function GET(request: NextRequest) {
  const auth = await verifyAdmin();
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  const VALID_STATUSES = ["pending", "resolved", "dismissed"] as const;
  const { searchParams } = request.nextUrl;
  const rawStatus = searchParams.get("status") || "pending";
  if (!VALID_STATUSES.includes(rawStatus as (typeof VALID_STATUSES)[number])) {
    return NextResponse.json({ error: "유효하지 않은 상태 값입니다." }, { status: 400 });
  }
  const status = rawStatus;
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "20", 10)));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  try {
    const supabase = createSupabaseAdminClient();

    // 신고 목록 조회 (댓글 + 작성자 + 기사 조인)
    // LEFT JOIN (comments → user_profiles/articles) 으로 삭제된 댓글도 표시
    const { data: reports, count, error } = await supabase
      .from("comment_reports")
      .select(
        `
        id, user_id, reason, status, created_at,
        comments (
          id, content, is_deleted, created_at, article_id,
          user_profiles (id, nickname, avatar_url, is_banned),
          articles (id, title)
        )
      `,
        { count: "exact" }
      )
      .eq("status", status)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      captureError("api.admin.comments.list", error);
      return NextResponse.json(
        { error: "신고 목록을 불러오지 못했습니다." },
        { status: 500 }
      );
    }

    // 신고자 닉네임 일괄 조회
    const reporterIds = [
      ...new Set(
        (reports ?? [])
          .map((r) => (r as Record<string, unknown>).user_id as string)
          .filter(Boolean)
      ),
    ];
    let reporterMap: Record<string, string> = {};
    if (reporterIds.length > 0) {
      const { data: reporters } = await supabase
        .from("user_profiles")
        .select("id, nickname")
        .in("id", reporterIds);
      reporterMap = Object.fromEntries(
        (reporters ?? []).map((r: { id: string; nickname: string }) => [r.id, r.nickname])
      );
    }

    // camelCase 변환 (안전한 옵셔널 체이닝)
    const items: ReportedComment[] = (reports ?? []).map((r) => {
      const row = r as Record<string, unknown>;
      const comment = (row.comments ?? {}) as Record<string, unknown>;
      const author = (comment.user_profiles ?? null) as Record<string, unknown> | null;
      const article = (comment.articles ?? null) as Record<string, unknown> | null;
      const userId = String(row.user_id ?? "");

      return {
        reportId: String(row.id ?? ""),
        reportReason: String(row.reason ?? ""),
        reportStatus: (row.status as "pending" | "resolved" | "dismissed") ?? "pending",
        reportedAt: String(row.created_at ?? ""),
        reporterNickname: reporterMap[userId] || "알 수 없음",
        commentId: String(comment.id ?? ""),
        commentContent: String(comment.content ?? ""),
        commentCreatedAt: String(comment.created_at ?? ""),
        commentIsDeleted: Boolean(comment.is_deleted),
        authorId: author ? String(author.id ?? "") : "",
        authorNickname: author ? String(author.nickname ?? "알 수 없음") : "알 수 없음",
        authorAvatarUrl: author?.avatar_url ? String(author.avatar_url) : undefined,
        authorIsBanned: author ? Boolean(author.is_banned) : false,
        articleId: article ? String(article.id ?? "") : "",
        articleTitle: article ? String(article.title ?? "삭제된 기사") : "삭제된 기사",
      };
    });

    return NextResponse.json({ reports: items, total: count ?? 0 });
  } catch (err) {
    captureError("api.admin.comments.list", err);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

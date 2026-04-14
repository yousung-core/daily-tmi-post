import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { captureError } from "@/lib/logger";
import type { HiddenComment } from "@/lib/types";

export async function GET(request: NextRequest) {
  const auth = await verifyAdmin();
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "20", 10)));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  try {
    const supabase = createSupabaseAdminClient();

    const { data, count, error } = await supabase
      .from("comments")
      .select(
        `
        id, content, hidden_reason, created_at, article_id,
        user_profiles (id, nickname, avatar_url, is_banned),
        articles (id, title)
      `,
        { count: "exact" }
      )
      .eq("is_hidden", true)
      .eq("is_deleted", false)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      captureError("api.admin.comments.hidden.list", error);
      return NextResponse.json(
        { error: "숨김 댓글 목록을 불러오지 못했습니다." },
        { status: 500 }
      );
    }

    const items: HiddenComment[] = (data ?? []).map((row) => {
      const r = row as Record<string, unknown>;
      const author = (r.user_profiles ?? null) as Record<string, unknown> | null;
      const article = (r.articles ?? null) as Record<string, unknown> | null;

      return {
        commentId: String(r.id ?? ""),
        commentContent: String(r.content ?? ""),
        commentCreatedAt: String(r.created_at ?? ""),
        hiddenReason: String(r.hidden_reason ?? ""),
        authorId: author ? String(author.id ?? "") : "",
        authorNickname: author ? String(author.nickname ?? "알 수 없음") : "알 수 없음",
        authorAvatarUrl: author?.avatar_url ? String(author.avatar_url) : undefined,
        authorIsBanned: author ? Boolean(author.is_banned) : false,
        articleId: article ? String(article.id ?? "") : "",
        articleTitle: article ? String(article.title ?? "삭제된 기사") : "삭제된 기사",
      };
    });

    return NextResponse.json({ comments: items, total: count ?? 0 });
  } catch (err) {
    captureError("api.admin.comments.hidden.list", err);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

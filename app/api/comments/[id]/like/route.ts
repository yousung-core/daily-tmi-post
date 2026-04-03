import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { captureError } from "@/lib/logger";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const serverClient = await createSupabaseServerClient();
    const { data: { user } } = await serverClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const { id: commentId } = await params;
    const supabase = createSupabaseAdminClient();

    // 기존 좋아요 확인
    const { data: existing } = await supabase
      .from("comment_likes")
      .select("id")
      .eq("comment_id", commentId)
      .eq("user_id", user.id)
      .single();

    if (existing) {
      // 좋아요 취소
      await supabase.from("comment_likes").delete().eq("id", existing.id);
    } else {
      // 좋아요 추가
      const { error } = await supabase
        .from("comment_likes")
        .insert({ comment_id: commentId, user_id: user.id });

      if (error) {
        captureError("api.comments.like", error);
        return NextResponse.json({ error: "좋아요에 실패했습니다." }, { status: 500 });
      }
    }

    // 현재 좋아요 수 조회
    const { count } = await supabase
      .from("comment_likes")
      .select("*", { count: "exact", head: true })
      .eq("comment_id", commentId);

    return NextResponse.json({
      liked: !existing,
      count: count ?? 0,
    });
  } catch (err) {
    captureError("api.comments.like", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

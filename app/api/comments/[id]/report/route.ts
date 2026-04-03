import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { captureError } from "@/lib/logger";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const serverClient = await createSupabaseServerClient();
    const { data: { user } } = await serverClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const { id: commentId } = await params;
    const { reason } = await request.json();

    if (!reason || typeof reason !== "string" || reason.trim().length === 0) {
      return NextResponse.json({ error: "신고 사유를 입력해주세요." }, { status: 400 });
    }
    if (reason.length > 200) {
      return NextResponse.json({ error: "신고 사유는 200자 이내로 작성해주세요." }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();

    const { error } = await supabase
      .from("comment_reports")
      .insert({
        comment_id: commentId,
        user_id: user.id,
        reason: reason.trim(),
      });

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "이미 신고한 댓글입니다." }, { status: 400 });
      }
      captureError("api.comments.report", error);
      return NextResponse.json({ error: "신고에 실패했습니다." }, { status: 500 });
    }

    return NextResponse.json({ message: "신고가 접수되었습니다." });
  } catch (err) {
    captureError("api.comments.report", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { isValidUUID } from "@/lib/validation";
import { verifyOrigin } from "@/lib/api-helpers";
import { captureError } from "@/lib/logger";

// 관리자 댓글 소프트 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const originError = verifyOrigin(request);
  if (originError) return originError;

  const auth = await verifyAdmin();
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  const { id } = await params;

  if (!isValidUUID(id)) {
    return NextResponse.json({ error: "유효하지 않은 ID입니다." }, { status: 400 });
  }

  try {
    const supabase = createSupabaseAdminClient();

    // 댓글 존재 확인
    const { data: comment } = await supabase
      .from("comments")
      .select("id, is_deleted")
      .eq("id", id)
      .single();

    if (!comment) {
      return NextResponse.json({ error: "댓글을 찾을 수 없습니다." }, { status: 404 });
    }
    if (comment.is_deleted) {
      return NextResponse.json({ error: "이미 삭제된 댓글입니다." }, { status: 400 });
    }

    // 소프트 삭제
    const { error } = await supabase
      .from("comments")
      .update({ is_deleted: true, content: "" })
      .eq("id", id);

    if (error) {
      captureError("api.admin.comments.delete", error);
      return NextResponse.json({ error: "삭제에 실패했습니다." }, { status: 500 });
    }

    // 해당 댓글의 대기 중인 신고를 모두 resolved 처리
    await supabase
      .from("comment_reports")
      .update({ status: "resolved" })
      .eq("comment_id", id)
      .eq("status", "pending");

    return NextResponse.json({ message: "댓글이 삭제되었습니다." });
  } catch (err) {
    captureError("api.admin.comments.delete", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

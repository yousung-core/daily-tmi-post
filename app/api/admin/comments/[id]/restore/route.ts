import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { isValidUUID } from "@/lib/validation";
import { verifyOrigin } from "@/lib/api-helpers";
import { captureError } from "@/lib/logger";

// 숨김 댓글 복원
export async function PATCH(
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

    const { data: comment } = await supabase
      .from("comments")
      .select("id, is_hidden, is_deleted")
      .eq("id", id)
      .single();

    if (!comment) {
      return NextResponse.json({ error: "댓글을 찾을 수 없습니다." }, { status: 404 });
    }
    if (!comment.is_hidden) {
      return NextResponse.json({ error: "숨김 상태가 아닌 댓글입니다." }, { status: 400 });
    }
    if (comment.is_deleted) {
      return NextResponse.json({ error: "이미 삭제된 댓글입니다." }, { status: 400 });
    }

    const { error } = await supabase
      .from("comments")
      .update({ is_hidden: false, hidden_reason: null })
      .eq("id", id);

    if (error) {
      captureError("api.admin.comments.restore", error);
      return NextResponse.json({ error: "복원에 실패했습니다." }, { status: 500 });
    }

    return NextResponse.json({ message: "댓글이 복원되었습니다." });
  } catch (err) {
    captureError("api.admin.comments.restore", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

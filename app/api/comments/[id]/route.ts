import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { validateComment } from "@/lib/profanity";
import { captureError } from "@/lib/logger";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const serverClient = await createSupabaseServerClient();
    const { data: { user } } = await serverClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const { id } = await params;
    const { content } = await request.json();

    if (!content) {
      return NextResponse.json({ error: "내용을 입력해주세요." }, { status: 400 });
    }

    const validation = validateComment(content);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();

    // 본인 확인
    const { data: comment } = await supabase
      .from("comments")
      .select("user_id")
      .eq("id", id)
      .single();

    if (!comment) {
      return NextResponse.json({ error: "댓글을 찾을 수 없습니다." }, { status: 404 });
    }
    if (comment.user_id !== user.id) {
      return NextResponse.json({ error: "본인의 댓글만 수정할 수 있습니다." }, { status: 403 });
    }

    const { error } = await supabase
      .from("comments")
      .update({ content: content.trim(), updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      captureError("api.comments.update", error);
      return NextResponse.json({ error: "수정에 실패했습니다." }, { status: 500 });
    }

    return NextResponse.json({ message: "수정되었습니다." });
  } catch (err) {
    captureError("api.comments.update", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const serverClient = await createSupabaseServerClient();
    const { data: { user } } = await serverClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const { id } = await params;
    const supabase = createSupabaseAdminClient();

    const { data: comment } = await supabase
      .from("comments")
      .select("user_id")
      .eq("id", id)
      .single();

    if (!comment) {
      return NextResponse.json({ error: "댓글을 찾을 수 없습니다." }, { status: 404 });
    }
    if (comment.user_id !== user.id) {
      return NextResponse.json({ error: "본인의 댓글만 삭제할 수 있습니다." }, { status: 403 });
    }

    // 소프트 삭제
    const { error } = await supabase
      .from("comments")
      .update({ is_deleted: true, content: "", updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      captureError("api.comments.delete", error);
      return NextResponse.json({ error: "삭제에 실패했습니다." }, { status: 500 });
    }

    return NextResponse.json({ message: "삭제되었습니다." });
  } catch (err) {
    captureError("api.comments.delete", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

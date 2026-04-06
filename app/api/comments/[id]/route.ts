import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getAuthenticatedUser, requireAuth, safeParseJSON } from "@/lib/api-helpers";
import { isValidUUID } from "@/lib/validation";
import { validateComment } from "@/lib/profanity";
import { rateLimit } from "@/lib/rate-limit";
import { captureError } from "@/lib/logger";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await getAuthenticatedUser();
    const authError = requireAuth(authResult);
    if (authError) return authError;
    const user = authResult.user!;

    const { id } = await params;

    if (!isValidUUID(id)) {
      return NextResponse.json({ error: "유효하지 않은 ID입니다." }, { status: 400 });
    }

    const body = await safeParseJSON(request);
    if (!body) {
      return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
    }

    const { content } = body as { content: unknown };

    if (!content || typeof content !== "string") {
      return NextResponse.json({ error: "내용을 입력해주세요." }, { status: 400 });
    }

    const validation = validateComment(content);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Rate limiting
    const rateLimitResult = await rateLimit(`comment-edit:${user.id}`, 20, 60);
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: "너무 많은 요청입니다. 잠시 후 다시 시도해��세요." }, { status: 429 });
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

    // updated_at은 DB 트리거가 자동 갱신, user_id 이중 검증
    const { data: updated, error } = await supabase
      .from("comments")
      .update({ content: content.trim() })
      .eq("id", id)
      .eq("user_id", user.id)
      .select("id")
      .single();

    if (error || !updated) {
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
    const authResult = await getAuthenticatedUser();
    const authError = requireAuth(authResult);
    if (authError) return authError;
    const user = authResult.user!;

    const { id } = await params;

    if (!isValidUUID(id)) {
      return NextResponse.json({ error: "유효하지 않은 ID입니다." }, { status: 400 });
    }

    // Rate limiting
    const rateLimitResult = await rateLimit(`comment-edit:${user.id}`, 20, 60);
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: "너무 많은 요청입니다. 잠시 후 다시 시도해주세요." }, { status: 429 });
    }

    const supabase = createSupabaseAdminClient();

    const { data: comment } = await supabase
      .from("comments")
      .select("user_id, is_deleted")
      .eq("id", id)
      .single();

    if (!comment) {
      return NextResponse.json({ error: "댓글을 찾을 수 없습니다." }, { status: 404 });
    }
    if (comment.user_id !== user.id) {
      return NextResponse.json({ error: "본인의 댓글만 삭제할 수 있습니다." }, { status: 403 });
    }
    if (comment.is_deleted) {
      return NextResponse.json({ error: "이미 삭제된 댓글입니다." }, { status: 400 });
    }

    // 소프트 삭제 (updated_at은 DB 트리거가 자동 갱신, user_id 이중 검증)
    const { data: deleted, error } = await supabase
      .from("comments")
      .update({ is_deleted: true, content: "" })
      .eq("id", id)
      .eq("user_id", user.id)
      .select("id")
      .single();

    if (error || !deleted) {
      captureError("api.comments.delete", error);
      return NextResponse.json({ error: "삭제에 실패했습니다." }, { status: 500 });
    }

    return NextResponse.json({ message: "삭제되었습니다." });
  } catch (err) {
    captureError("api.comments.delete", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

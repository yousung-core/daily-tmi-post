import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getAuthenticatedUser, requireAuth, safeParseJSON } from "@/lib/api-helpers";
import { isValidUUID } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";
import { captureError } from "@/lib/logger";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await getAuthenticatedUser();
    const authError = requireAuth(authResult);
    if (authError) return authError;
    const user = authResult.user!;

    const { id: commentId } = await params;

    if (!isValidUUID(commentId)) {
      return NextResponse.json({ error: "���효하지 않은 ID입니다." }, { status: 400 });
    }

    const body = await safeParseJSON(request);
    if (!body) {
      return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
    }

    const { reason } = body as { reason: string };

    if (!reason || typeof reason !== "string" || reason.trim().length === 0) {
      return NextResponse.json({ error: "신고 사유를 입력해주세요." }, { status: 400 });
    }
    if (reason.length > 200) {
      return NextResponse.json({ error: "신고 사유는 200자 이내로 작성해주세요." }, { status: 400 });
    }

    // Rate limiting
    const rateLimitResult = await rateLimit(`report:${user.id}`, 5, 300);
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: "너무 많은 신고 요청입니다. 잠시 후 다시 시도해주세요." }, { status: 429 });
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

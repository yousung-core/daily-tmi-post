import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getAuthenticatedUser, requireAuth } from "@/lib/api-helpers";
import { isValidUUID } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";
import { captureError } from "@/lib/logger";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await getAuthenticatedUser();
    const authError = requireAuth(authResult);
    if (authError) return authError;
    const user = authResult.user!;

    const { id: commentId } = await params;

    if (!isValidUUID(commentId)) {
      return NextResponse.json({ error: "유효하지 않은 ID입니다." }, { status: 400 });
    }

    // Rate limiting
    const rateLimitResult = await rateLimit(`like:${user.id}`, 30, 60);
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: "너무 많은 요청입니다. 잠시 후 다시 시도해주세요." }, { status: 429 });
    }

    const supabase = createSupabaseAdminClient();

    // 원자적 토글 RPC 호출
    const { data, error } = await supabase.rpc("toggle_comment_like", {
      p_comment_id: commentId,
      p_user_id: user.id,
    });

    if (error) {
      captureError("api.comments.like", error);
      return NextResponse.json({ error: "좋아요에 실패했습니다." }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    captureError("api.comments.like", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

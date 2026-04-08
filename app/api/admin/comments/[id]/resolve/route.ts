import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { isValidUUID } from "@/lib/validation";
import { safeParseJSON, verifyOrigin } from "@/lib/api-helpers";
import { captureError } from "@/lib/logger";

// 신고 처리 (resolved: 처리 완료, dismissed: 무시)
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

  const body = await safeParseJSON(request);
  if (!body) {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const { action } = body as { action: unknown };
  const VALID_ACTIONS = ["resolved", "dismissed"] as const;
  if (!action || typeof action !== "string" || !VALID_ACTIONS.includes(action as (typeof VALID_ACTIONS)[number])) {
    return NextResponse.json(
      { error: "action은 'resolved' 또는 'dismissed'여야 합니다." },
      { status: 400 }
    );
  }

  try {
    const supabase = createSupabaseAdminClient();

    const { data: report } = await supabase
      .from("comment_reports")
      .select("id, status")
      .eq("id", id)
      .single();

    if (!report) {
      return NextResponse.json({ error: "신고를 찾을 수 없습니다." }, { status: 404 });
    }
    if (report.status !== "pending") {
      return NextResponse.json({ error: "이미 처리된 신고입니다." }, { status: 409 });
    }

    const { error } = await supabase
      .from("comment_reports")
      .update({ status: action })
      .eq("id", id);

    if (error) {
      captureError("api.admin.comments.resolve", error);
      return NextResponse.json({ error: "처리에 실패했습니다." }, { status: 500 });
    }

    return NextResponse.json({
      message: action === "resolved" ? "신고가 처리되었습니다." : "신고가 무시되었습니다.",
    });
  } catch (err) {
    captureError("api.admin.comments.resolve", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

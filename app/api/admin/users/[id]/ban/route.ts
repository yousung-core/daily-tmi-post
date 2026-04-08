import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { isValidUUID } from "@/lib/validation";
import { safeParseJSON, verifyOrigin } from "@/lib/api-helpers";
import { captureError } from "@/lib/logger";

// 사용자 차단/차단 해제
export async function POST(
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

  const { banned } = body as { banned: unknown };
  if (typeof banned !== "boolean") {
    return NextResponse.json({ error: "banned는 boolean이어야 합니다." }, { status: 400 });
  }

  try {
    const supabase = createSupabaseAdminClient();

    // 사용자 존재 확인
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("id, is_banned")
      .eq("id", id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "사용자를 찾을 수 없습니다." }, { status: 404 });
    }

    if (profile.is_banned === banned) {
      return NextResponse.json({
        message: banned ? "이미 차단된 사용자입니다." : "차단되지 않은 사용자입니다.",
      });
    }

    const { error } = await supabase
      .from("user_profiles")
      .update({ is_banned: banned })
      .eq("id", id);

    if (error) {
      captureError("api.admin.users.ban", error);
      return NextResponse.json({ error: "처리에 실패했습니다." }, { status: 500 });
    }

    return NextResponse.json({
      message: banned ? "사용자가 차단되었습니다." : "차단이 해제되었습니다.",
      banned,
    });
  } catch (err) {
    captureError("api.admin.users.ban", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

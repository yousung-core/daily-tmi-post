import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "./supabase-server";
import { createSupabaseAdminClient } from "./supabase-admin";

/**
 * 인증된 사용자 정보 + ban 상태를 한번에 조회
 */
export async function getAuthenticatedUser() {
  const serverClient = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await serverClient.auth.getUser();

  if (error || !user) return { user: null, isBanned: false };

  const admin = createSupabaseAdminClient();
  const { data: profile } = await admin
    .from("user_profiles")
    .select("is_banned")
    .eq("id", user.id)
    .single();

  return { user, isBanned: profile?.is_banned ?? false };
}

/**
 * 인증 + ban 체크 결과를 검증하여 에러 응답 또는 null(통과) 반환
 */
export function requireAuth(
  authResult: Awaited<ReturnType<typeof getAuthenticatedUser>>
) {
  if (!authResult.user) {
    return NextResponse.json(
      { error: "로그인이 필요합니다." },
      { status: 401 }
    );
  }
  if (authResult.isBanned) {
    return NextResponse.json(
      { error: "차단된 사용자입니다." },
      { status: 403 }
    );
  }
  return null;
}

/**
 * request.json()을 안전하게 파싱 (실패 시 null 반환)
 */
export async function safeParseJSON(
  request: Request
): Promise<Record<string, unknown> | null> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

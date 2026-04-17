import { NextRequest, NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "./supabase-server";
import { createSupabaseAdminClient } from "./supabase-admin";
import { captureError } from "./logger";
import { siteUrl } from "./env";

/**
 * user_profiles가 없는 인증 사용자에 대해 프로필을 자동 생성
 * DB 트리거(handle_new_user)와 동일한 메타데이터 추출 로직
 */
function maskEmailId(email: string | undefined): string {
  if (!email || !email.includes("@")) return "익명";
  const localPart = email.split("@")[0];
  const len = localPart.length;
  if (len === 0) return "익명";
  if (len <= 2) return "*".repeat(len);
  if (len === 3) return localPart[0] + "**";
  const half = Math.ceil(len / 2);
  return localPart.slice(0, half) + "*".repeat(len - half);
}

async function ensureUserProfile(user: User): Promise<void> {
  const meta = user.user_metadata ?? {};
  const nickname = maskEmailId(user.email);
  const avatarUrl = meta.avatar_url || meta.picture || null;
  const provider = meta.provider || user.app_metadata?.provider || "email";

  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("user_profiles").upsert(
    {
      id: user.id,
      nickname,
      avatar_url: avatarUrl,
      provider,
    },
    { onConflict: "id", ignoreDuplicates: true }
  );

  if (error) {
    captureError("ensureUserProfile", error);
  }
}

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

  if (!profile) {
    await ensureUserProfile(user);
    const { data: retryProfile } = await admin
      .from("user_profiles")
      .select("is_banned")
      .eq("id", user.id)
      .single();
    return { user, isBanned: retryProfile?.is_banned ?? false };
  }

  return { user, isBanned: profile.is_banned ?? false };
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
 * Origin 헤더를 검증하여 CSRF 공격 방지
 * Origin이 존재하고 허용된 도메인과 다르면 403 반환, 통과 시 null 반환
 */
export function verifyOrigin(request: NextRequest): NextResponse | null {
  const origin = request.headers.get("origin");

  // state-changing 요청에는 Origin 헤더 필수
  if (!origin) {
    return NextResponse.json(
      { error: "허용되지 않은 요청입니다." },
      { status: 403 }
    );
  }

  try {
    const reqOrigin = new URL(origin).origin;
    const allowedOrigin = new URL(siteUrl).origin;
    if (reqOrigin !== allowedOrigin) {
      return NextResponse.json(
        { error: "허용되지 않은 요청입니다." },
        { status: 403 }
      );
    }
  } catch {
    return NextResponse.json(
      { error: "허용되지 않은 요청입니다." },
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

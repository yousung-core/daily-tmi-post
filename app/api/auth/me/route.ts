import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-helpers";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import type { UserProfileRow } from "@/lib/types";

/**
 * 현재 인증 사용자의 프로필 조회 (없으면 자동 생성)
 * getAuthenticatedUser() 내부에서 ensureUserProfile이 동작
 */
export async function GET() {
  const { user, isBanned } = await getAuthenticatedUser();

  if (!user) {
    return NextResponse.json({ profile: null }, { status: 401 });
  }

  if (isBanned) {
    return NextResponse.json({ profile: null, banned: true }, { status: 403 });
  }

  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return NextResponse.json({ profile: data as UserProfileRow | null });
}

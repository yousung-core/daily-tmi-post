// ==========================================
// 관리자 인증 헬퍼 (API 라우트에서 사용)
// ==========================================

import { createSupabaseServerClient } from "./supabase-server";
import { createSupabaseAdminClient } from "./supabase-admin";
import { captureError } from "./logger";

export async function verifyAdmin(): Promise<{
  authenticated: boolean;
  email?: string;
  error?: string;
}> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user?.email) {
    return { authenticated: false, error: "인증되지 않은 요청입니다." };
  }

  const adminClient = createSupabaseAdminClient();
  const { data: admin, error: queryError } = await adminClient
    .from("admins")
    .select("id")
    .eq("email", user.email)
    .single();

  if (queryError) {
    captureError("admin-auth.verifyAdmin", queryError, { email: user.email });
    return { authenticated: false, error: "인증 확인 중 오류가 발생했습니다." };
  }

  if (!admin) {
    return { authenticated: false, error: "관리자 권한이 없습니다." };
  }

  return { authenticated: true, email: user.email };
}

// ==========================================
// Supabase 관리자 클라이언트 (Service Role Key)
// RLS 우회 — 서버 사이드 전용, 절대 클라이언트에 노출 금지
// ==========================================

import { createClient } from "@supabase/supabase-js";
import { getSupabaseUrl, getSupabaseServiceRoleKey } from "./env";

export function createSupabaseAdminClient() {
  return createClient(getSupabaseUrl(), getSupabaseServiceRoleKey(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

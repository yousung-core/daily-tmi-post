// ==========================================
// 환경 변수 중앙 관리 및 런타임 검증
// ==========================================

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. Check your .env.local file.`
    );
  }
  return value;
}

// 필수 — 첫 접근 시 검증 (lazy evaluation으로 테스트 환경 호환)
let _supabaseUrl: string | undefined;
let _supabaseAnonKey: string | undefined;

export function getSupabaseUrl(): string {
  if (!_supabaseUrl) _supabaseUrl = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  return _supabaseUrl;
}

export function getSupabaseAnonKey(): string {
  if (!_supabaseAnonKey) _supabaseAnonKey = requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  return _supabaseAnonKey;
}

// 필수 (관리자 기능) — 첫 접근 시 검증
let _supabaseServiceRoleKey: string | undefined;

export function getSupabaseServiceRoleKey(): string {
  if (!_supabaseServiceRoleKey)
    _supabaseServiceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  return _supabaseServiceRoleKey;
}

// 선택 — production에서 미설정 시 경고
export const siteUrl: string = (() => {
  const val = process.env.NEXT_PUBLIC_SITE_URL;
  if (!val && process.env.NODE_ENV === "production") {
    console.warn(
      "[env] NEXT_PUBLIC_SITE_URL is not set in production. Falling back to http://localhost:3000."
    );
  }
  return val || "http://localhost:3000";
})();

// 선택 — 카카오 SDK (미설정 시 공유 기능 비활성화)
export const kakaoJsKey = process.env.NEXT_PUBLIC_KAKAO_JS_KEY ?? "";

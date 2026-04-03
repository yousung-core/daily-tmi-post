// ==========================================
// Supabase 브라우저 클라이언트 (쿠키 기반 세션)
// 클라이언트 컴포넌트에서 인증용 (로그인 폼 등)
// ==========================================
// Next.js는 NEXT_PUBLIC_* 를 정적 리터럴로 접근해야 브라우저에 인라인함.
// env.ts의 requireEnv()는 동적 접근이라 브라우저에서 작동하지 않음.

import { createBrowserClient } from "@supabase/ssr";

export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

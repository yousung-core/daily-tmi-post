import { createSupabaseAdminClient } from "./supabase-admin";
import { captureError } from "./logger";

// ==========================================
// 인메모리 폴백 (Supabase 장애 시 사용)
// 주의: serverless 환경에서는 cold start 시 초기화됨.
// Supabase가 primary rate limiter이며, 이 fallback은
// Supabase 장애 시에만 사용되는 보조 수단.
// 더 강력한 fallback이 필요하면 @vercel/kv 도입을 검토할 것.
// ==========================================

interface RateLimitEntry {
  count: number;
  windowStart: number;
  windowMs: number;
}

const fallbackStore = new Map<string, RateLimitEntry>();
const MAX_STORE_SIZE = 5000;
let lastCleanup = Date.now();
const CLEANUP_INTERVAL = 60_000; // 1분마다 정리

function cleanupExpiredEntries(): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, entry] of fallbackStore) {
    if (now >= entry.windowStart + entry.windowMs) {
      fallbackStore.delete(key);
    }
  }
}

function fallbackRateLimit(
  identifier: string,
  limit: number,
  windowMs: number
): { success: boolean; remaining: number } {
  cleanupExpiredEntries();

  // 스토어 크기 초과 시 가장 오래된 항목부터 삭제
  if (fallbackStore.size >= MAX_STORE_SIZE) {
    const now = Date.now();
    for (const [key, entry] of fallbackStore) {
      if (now >= entry.windowStart + entry.windowMs) {
        fallbackStore.delete(key);
      }
      if (fallbackStore.size < MAX_STORE_SIZE) break;
    }
    // 그래도 초과면 가장 오래된 항목 제거 (Map은 삽입 순서 보장)
    if (fallbackStore.size >= MAX_STORE_SIZE) {
      const oldest = fallbackStore.keys().next().value;
      if (oldest) fallbackStore.delete(oldest);
    }
  }

  const now = Date.now();
  const entry = fallbackStore.get(identifier);

  // 윈도우 만료 또는 첫 요청
  if (!entry || now >= entry.windowStart + entry.windowMs) {
    fallbackStore.set(identifier, { count: 1, windowStart: now, windowMs });
    return { success: true, remaining: limit - 1 };
  }

  if (entry.count >= limit) {
    return { success: false, remaining: 0 };
  }

  entry.count++;
  return { success: true, remaining: limit - entry.count };
}

// ==========================================
// Supabase 기반 Rate Limiting
// ==========================================

export async function rateLimit(
  identifier: string,
  limit: number = 5,
  windowSeconds: number = 900 // 15분
): Promise<{ success: boolean; remaining: number }> {
  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase.rpc("check_rate_limit", {
      p_identifier: identifier,
      p_limit: limit,
      p_window_seconds: windowSeconds,
    });

    if (error) {
      captureError("rateLimit.rpc", error, { identifier, limit, windowSeconds });
      return fallbackRateLimit(identifier, limit, windowSeconds * 1000);
    }

    return {
      success: data.success,
      remaining: data.remaining,
    };
  } catch (err) {
    captureError("rateLimit.unexpected", err, { identifier, limit, windowSeconds });
    return fallbackRateLimit(identifier, limit, windowSeconds * 1000);
  }
}

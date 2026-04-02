import { supabase } from "./supabase";
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
  resetTime: number;
}

const fallbackStore = new Map<string, RateLimitEntry>();
const MAX_STORE_SIZE = 10000;

function cleanupExpiredEntries(): void {
  const now = Date.now();
  for (const [key, entry] of fallbackStore) {
    if (now >= entry.resetTime) fallbackStore.delete(key);
  }
}

function fallbackRateLimit(
  identifier: string,
  limit: number,
  windowMs: number
): { success: boolean; remaining: number } {
  if (fallbackStore.size > MAX_STORE_SIZE) {
    cleanupExpiredEntries();
  }

  const now = Date.now();
  const entry = fallbackStore.get(identifier);

  if (!entry || now >= entry.resetTime) {
    fallbackStore.set(identifier, { count: 1, resetTime: now + windowMs });
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

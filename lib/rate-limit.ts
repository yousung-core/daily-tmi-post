import { supabase } from "./supabase";

// ==========================================
// 인메모리 폴백 (Supabase 장애 시 사용)
// ==========================================

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const fallbackStore = new Map<string, RateLimitEntry>();

function fallbackRateLimit(
  identifier: string,
  limit: number,
  windowMs: number
): { success: boolean; remaining: number } {
  // 메모리 누수 방지
  if (fallbackStore.size > 1000) {
    const now = Date.now();
    for (const [key, entry] of fallbackStore) {
      if (now >= entry.resetTime) fallbackStore.delete(key);
    }
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
      console.error("[rateLimit] Supabase RPC error:", error.message);
      return fallbackRateLimit(identifier, limit, windowSeconds * 1000);
    }

    return {
      success: data.success,
      remaining: data.remaining,
    };
  } catch (err) {
    console.error("[rateLimit] unexpected error:", err);
    return fallbackRateLimit(identifier, limit, windowSeconds * 1000);
  }
}

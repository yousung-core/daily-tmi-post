import { NextRequest, NextResponse } from "next/server";
import { validateSubmission } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";
import { supabase } from "@/lib/supabase";
import { verifyOrigin } from "@/lib/api-helpers";
import { captureError } from "@/lib/logger";

export async function POST(request: NextRequest) {
  // Origin 검증 (CSRF 방지)
  const originError = verifyOrigin(request);
  if (originError) return originError;

  // Rate limiting - IP 기반
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "anonymous";

  const rateLimitResult = await rateLimit(`submit:${ip}`);
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: "너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요." },
      {
        status: 429,
        headers: { "Retry-After": "900" },
      }
    );
  }

  // JSON 파싱
  let body: unknown;
  try {
    body = await request.json();
  } catch (err) {
    captureError("api.submit.parseJSON", err);
    return NextResponse.json(
      { error: "잘못된 요청 형식입니다." },
      { status: 400 }
    );
  }

  // 서버 사이드 검증
  const result = validateSubmission(body);
  if (!result.valid) {
    return NextResponse.json(
      { error: "입력값이 올바르지 않습니다.", errors: result.errors },
      { status: 400 }
    );
  }

  // Supabase insert (SECURITY DEFINER RPC로 삽입)
  const { error } = await supabase.rpc("insert_submission", {
    p_email: result.data.email,
    p_category: result.data.category,
    p_title: result.data.title,
    p_event_date: result.data.eventDate,
    p_location: result.data.location || null,
    p_content: result.data.content,
    p_message: result.data.message || null,
    p_image_url: result.data.imageUrl || null,
  });

  if (error) {
    captureError("api.submit", error);
    return NextResponse.json(
      { error: "신청 중 오류가 발생했습니다. 다시 시도해주세요." },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { message: "신청이 완료되었습니다." },
    { status: 201 }
  );
}

import { NextRequest, NextResponse } from "next/server";
import { validateSubmission } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";
import { supabase, toSubmissionRow } from "@/lib/supabase";
import { captureError } from "@/lib/logger";

export async function POST(request: NextRequest) {
  // Rate limiting - IP 기반
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "anonymous";

  const rateLimitResult = await rateLimit(ip);
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
  } catch {
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

  // Supabase insert
  const submissionData = toSubmissionRow({
    email: result.data.email,
    category: result.data.category,
    title: result.data.title,
    eventDate: result.data.eventDate,
    location: result.data.location,
    content: result.data.content,
    message: result.data.message,
  });

  const { error } = await supabase.from("submissions").insert(submissionData);

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

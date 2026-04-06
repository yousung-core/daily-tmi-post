import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { rateLimit } from "@/lib/rate-limit";
import { captureError } from "@/lib/logger";
import { IMAGE_CONFIG } from "@/lib/image-validation";

const MAX_BODY_SIZE = 6 * 1024 * 1024; // 6MB (약간의 FormData 오버헤드 포함)

// Magic bytes로 실제 파일 형식 확인
function detectImageType(
  buffer: Buffer
): "image/jpeg" | "image/png" | "image/webp" | null {
  if (buffer.length < 4) return null;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }
  // PNG: 89 50 4E 47
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return "image/png";
  }
  // WebP: RIFF....WEBP
  if (
    buffer.length >= 12 &&
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return "image/webp";
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    // Content-Length 사전 체크 (메모리 로드 전 차단)
    const contentLength = parseInt(
      request.headers.get("content-length") || "0"
    );
    if (contentLength > MAX_BODY_SIZE) {
      return NextResponse.json(
        { error: `파일 크기는 ${IMAGE_CONFIG.maxSizeMB}MB 이하여야 합니다.` },
        { status: 413 }
      );
    }

    // Rate limiting (IP 기반, 15분에 5회)
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown";
    const rateLimitResult = await rateLimit(`upload:${ip}`, 5, 900);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "너무 많은 업로드 요청입니다. 잠시 후 다시 시도해주세요." },
        { status: 429 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("image");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "이미지 파일이 필요합니다." },
        { status: 400 }
      );
    }

    // MIME 타입 체크 (클라이언트 헤더 기반)
    if (
      !IMAGE_CONFIG.allowedTypes.includes(
        file.type as (typeof IMAGE_CONFIG.allowedTypes)[number]
      )
    ) {
      return NextResponse.json(
        { error: "JPG, PNG, WebP 형식만 업로드 가능합니다." },
        { status: 400 }
      );
    }
    if (file.size > IMAGE_CONFIG.maxSizeBytes) {
      return NextResponse.json(
        {
          error: `이미지 크기는 ${IMAGE_CONFIG.maxSizeMB}MB 이하여야 합니다.`,
        },
        { status: 400 }
      );
    }

    // 파일 읽기 + Magic bytes 검증
    const rawBuffer = Buffer.from(await file.arrayBuffer());
    const detectedType = detectImageType(rawBuffer);

    if (!detectedType) {
      return NextResponse.json(
        { error: "유효하지 않은 이미지 파일입니다." },
        { status: 400 }
      );
    }

    // sharp 리사이징/압축 (limitInputPixels로 PNG bomb 방어)
    const buffer = await sharp(rawBuffer, { limitInputPixels: 50_000_000 })
      .resize(1280, null, { withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();

    const fileName = `submissions/${crypto.randomUUID()}.webp`;

    // Supabase Storage 업로드
    const supabase = createSupabaseAdminClient();
    const { error: uploadError } = await supabase.storage
      .from("article-images")
      .upload(fileName, buffer, {
        contentType: "image/webp",
        upsert: false,
      });

    if (uploadError) {
      captureError("api.upload.image", uploadError);
      return NextResponse.json(
        { error: "이미지 업로드에 실패했습니다." },
        { status: 500 }
      );
    }

    // 공개 URL 생성
    const {
      data: { publicUrl },
    } = supabase.storage.from("article-images").getPublicUrl(fileName);

    return NextResponse.json({ imageUrl: publicUrl }, { status: 201 });
  } catch (err) {
    captureError("api.upload.image", err);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

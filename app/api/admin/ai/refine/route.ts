import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";
import { refineArticle, RefineInput } from "@/lib/ai";
import { safeParseJSON } from "@/lib/api-helpers";
import { captureError } from "@/lib/logger";
import { SubmissionCategory } from "@/lib/types";
import { VALID_CATEGORIES } from "@/lib/constants";

export async function POST(request: NextRequest) {
  const auth = await verifyAdmin();
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  try {
    const body = await safeParseJSON(request);
    if (!body) {
      return NextResponse.json({ error: "잘못된 요청 형식입니다." }, { status: 400 });
    }
    const { category, title, content, eventDate, location, message } = body;

    if (!title || !content || !category || !eventDate) {
      return NextResponse.json(
        { error: "필수 항목이 누락되었습니다. (category, title, content, eventDate)" },
        { status: 400 }
      );
    }

    if (!VALID_CATEGORIES.includes(category as SubmissionCategory)) {
      return NextResponse.json(
        { error: "유효하지 않은 카테고리입니다." },
        { status: 400 }
      );
    }

    const input: RefineInput = {
      category: category as SubmissionCategory,
      title: title as string,
      content: content as string,
      eventDate: eventDate as string,
      location: (location as string) || undefined,
      message: (message as string) || undefined,
    };

    const result = await refineArticle(input);

    return NextResponse.json({ result });
  } catch (err) {
    captureError("api.admin.ai.refine", err);
    const message = err instanceof Error ? err.message : String(err);
    const isOverloaded = message.includes("503") || message.includes("429") || message.includes("high demand");
    return NextResponse.json(
      { error: isOverloaded
          ? "AI 서비스가 일시적으로 과부하 상태입니다. 잠시 후 다시 시도해주세요."
          : "AI 기사 다듬기에 실패했습니다. 잠시 후 다시 시도해주세요."
      },
      { status: isOverloaded ? 503 : 500 }
    );
  }
}

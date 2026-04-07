import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";
import { refineArticle, RefineInput } from "@/lib/ai";
import { captureError } from "@/lib/logger";
import { SubmissionCategory } from "@/lib/types";

const VALID_CATEGORIES: SubmissionCategory[] = [
  "finance", "life", "culture", "fitness", "people", "travel", "tech", "food",
];

export async function POST(request: NextRequest) {
  const auth = await verifyAdmin();
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { category, title, content, eventDate, location, message } = body;

    if (!title || !content || !category || !eventDate) {
      return NextResponse.json(
        { error: "필수 항목이 누락되었습니다. (category, title, content, eventDate)" },
        { status: 400 }
      );
    }

    if (!VALID_CATEGORIES.includes(category)) {
      return NextResponse.json(
        { error: "유효하지 않은 카테고리입니다." },
        { status: 400 }
      );
    }

    const input: RefineInput = {
      category,
      title,
      content,
      eventDate,
      location: location || undefined,
      message: message || undefined,
    };

    const result = await refineArticle(input);

    return NextResponse.json({ result });
  } catch (err) {
    captureError("api.admin.ai.refine", err);
    return NextResponse.json(
      { error: "AI 기사 다듬기에 실패했습니다. 잠시 후 다시 시도해주세요." },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { safeParseJSON } from "@/lib/api-helpers";
import { isValidUUID } from "@/lib/validation";
import { captureError } from "@/lib/logger";
import { VALID_CATEGORIES } from "@/lib/constants";
import type { SubmissionCategory } from "@/lib/types";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdmin();
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  const { id } = await params;
  if (!isValidUUID(id)) {
    return NextResponse.json({ error: "유효하지 않은 ID입니다." }, { status: 400 });
  }

  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "기사를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json({ article: data });
  } catch (err) {
    captureError("api.admin.articles.detail", err);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdmin();
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  const { id } = await params;
  if (!isValidUUID(id)) {
    return NextResponse.json({ error: "유효하지 않은 ID입니다." }, { status: 400 });
  }

  try {
    const body = await safeParseJSON(request);
    if (!body) {
      return NextResponse.json({ error: "잘못된 요청 형식입니다." }, { status: 400 });
    }
    const { title, content, excerpt, category, imageUrl } = body as Record<string, unknown>;

    // 입력값 검증
    if (title !== undefined) {
      if (typeof title !== "string" || title.length === 0) {
        return NextResponse.json({ error: "제목을 입력해주세요." }, { status: 400 });
      }
      if (title.length > 500) {
        return NextResponse.json({ error: "제목은 500자 이내여야 합니다." }, { status: 400 });
      }
    }
    if (content !== undefined && typeof content !== "string") {
      return NextResponse.json({ error: "본문은 문자열이어야 합니다." }, { status: 400 });
    }
    if (excerpt !== undefined && typeof excerpt !== "string") {
      return NextResponse.json({ error: "요약은 문자열이어야 합니다." }, { status: 400 });
    }
    if (category !== undefined && !VALID_CATEGORIES.includes(category as SubmissionCategory)) {
      return NextResponse.json({ error: "유효하지 않은 카테고리입니다." }, { status: 400 });
    }

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (title !== undefined) updates.title = title;
    if (content !== undefined) updates.content = content;
    if (excerpt !== undefined) updates.excerpt = excerpt;
    if (category !== undefined) updates.category = category;
    if (imageUrl !== undefined) {
      if (typeof imageUrl !== "string") {
        return NextResponse.json({ error: "이미지 URL은 문자열이어야 합니다." }, { status: 400 });
      }
      if (imageUrl !== "") {
        const supabaseStoragePrefix = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/article-images/`;
        if (!imageUrl.startsWith(supabaseStoragePrefix)) {
          return NextResponse.json({ error: "유효하지 않은 이미지 URL입니다." }, { status: 400 });
        }
      }
      updates.image_url = imageUrl || null;
    }

    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("articles")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      captureError("api.admin.articles.update", error);
      return NextResponse.json(
        { error: "기사 수정에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({ article: data });
  } catch (err) {
    captureError("api.admin.articles.update", err);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdmin();
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  const { id } = await params;
  if (!isValidUUID(id)) {
    return NextResponse.json({ error: "유효하지 않은 ID입니다." }, { status: 400 });
  }

  try {
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.from("articles").delete().eq("id", id);

    if (error) {
      captureError("api.admin.articles.delete", error);
      return NextResponse.json(
        { error: "기사 삭제에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "기사가 삭제되었습니다." });
  } catch (err) {
    captureError("api.admin.articles.delete", err);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

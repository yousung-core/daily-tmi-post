import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { generateSlug } from "@/lib/slug";
import { isValidUUID } from "@/lib/validation";
import { captureError } from "@/lib/logger";
import { sendApprovalEmail, sendRejectionEmail } from "@/lib/email";
import { getArticleUrl } from "@/lib/utils";
import { VALID_CATEGORIES } from "@/lib/constants";

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
      .from("submissions")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "신청을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json({ submission: data });
  } catch (err) {
    captureError("api.admin.submissions.detail", err);
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
    const body = await request.json();
    const { action, title, content, excerpt, adminNote } = body;

    if (!action || !["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "올바른 작업을 지정해주세요. (approve/reject)" },
        { status: 400 }
      );
    }

    const supabase = createSupabaseAdminClient();

    // 신청 조회
    const { data: submission, error: fetchError } = await supabase
      .from("submissions")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !submission) {
      return NextResponse.json(
        { error: "신청을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    if (submission.status !== "pending") {
      return NextResponse.json(
        { error: "이미 처리된 신청입니다." },
        { status: 400 }
      );
    }

    if (action === "reject") {
      const { error: updateError } = await supabase
        .from("submissions")
        .update({
          status: "rejected",
          admin_note: adminNote || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (updateError) {
        captureError("api.admin.submissions.reject", updateError);
        return NextResponse.json(
          { error: "반려 처리에 실패했습니다." },
          { status: 500 }
        );
      }

      // 반려 이메일 발송 (fire-and-forget)
      sendRejectionEmail({
        to: submission.email,
        submissionTitle: submission.title,
        adminNote: adminNote || "사유가 명시되지 않았습니다.",
      });

      return NextResponse.json({ message: "신청이 반려되었습니다." });
    }

    // 승인: article 먼저 생성 → 성공 시 submission 업데이트
    // (article 생성이 핵심이므로 먼저 시도, 실패해도 submission 상태 안전)
    const articleTitle = title || submission.title;
    const articleContent = content || submission.content;

    if (typeof articleTitle !== "string" || articleTitle.length > 500) {
      return NextResponse.json(
        { error: "제목은 500자 이내여야 합니다." },
        { status: 400 }
      );
    }

    if (!VALID_CATEGORIES.includes(submission.category)) {
      return NextResponse.json(
        { error: "유효하지 않은 카테고리입니다." },
        { status: 400 }
      );
    }

    const articleExcerpt =
      excerpt || articleContent.substring(0, 100).replace(/\s+/g, " ").trim();
    const slug = generateSlug(submission.category);

    const { data: article, error: insertError } = await supabase
      .from("articles")
      .insert({
        submission_id: id,
        slug,
        title: articleTitle,
        content: articleContent,
        excerpt: articleExcerpt,
        category: submission.category,
        image_url: submission.image_url,
      })
      .select()
      .single();

    if (insertError) {
      captureError("api.admin.submissions.approve.insert", insertError);
      return NextResponse.json(
        { error: "기사 생성에 실패했습니다." },
        { status: 500 }
      );
    }

    // article 생성 성공 후 submission 상태 업데이트
    const { error: updateError } = await supabase
      .from("submissions")
      .update({
        status: "approved",
        admin_note: adminNote || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (updateError) {
      // submission 업데이트 실패 — article은 이미 생성됨 (로그만 남김)
      captureError("api.admin.submissions.approve.update", updateError, {
        articleId: article.id,
      });
    }

    // 승인 이메일 발송 (fire-and-forget)
    sendApprovalEmail({
      to: submission.email,
      articleTitle: articleTitle,
      articleUrl: getArticleUrl({
        slug: article.slug,
        category: article.category,
        publishedAt: article.published_at,
      }),
    });

    return NextResponse.json({
      message: "신청이 승인되었습니다.",
      article,
    });
  } catch (err) {
    captureError("api.admin.submissions.patch", err);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

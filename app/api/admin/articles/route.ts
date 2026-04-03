import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { captureError } from "@/lib/logger";

export async function GET(request: NextRequest) {
  const auth = await verifyAdmin();
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "20", 10)));
  const category = searchParams.get("category");
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  try {
    const supabase = createSupabaseAdminClient();

    let query = supabase
      .from("articles")
      .select("*", { count: "exact" })
      .order("published_at", { ascending: false });

    if (category) {
      query = query.eq("category", category);
    }

    const { data, count, error } = await query.range(from, to);

    if (error) {
      captureError("api.admin.articles.list", error);
      return NextResponse.json(
        { error: "기사 목록을 불러오지 못했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({ articles: data ?? [], total: count ?? 0 });
  } catch (err) {
    captureError("api.admin.articles.list", err);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

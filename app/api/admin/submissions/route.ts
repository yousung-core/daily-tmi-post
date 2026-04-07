import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { captureError } from "@/lib/logger";

export async function GET(request: NextRequest) {
  const auth = await verifyAdmin();
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  const VALID_STATUSES = ["pending", "approved", "rejected"] as const;
  const { searchParams } = request.nextUrl;
  const rawStatus = searchParams.get("status") || "pending";
  if (!VALID_STATUSES.includes(rawStatus as (typeof VALID_STATUSES)[number])) {
    return NextResponse.json({ error: "유효하지 않은 상태 값입니다." }, { status: 400 });
  }
  const status = rawStatus;
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "20", 10)));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  try {
    const supabase = createSupabaseAdminClient();

    const { data, count, error } = await supabase
      .from("submissions")
      .select("*", { count: "exact" })
      .eq("status", status)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      captureError("api.admin.submissions.list", error);
      return NextResponse.json(
        { error: "신청 목록을 불러오지 못했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({ submissions: data ?? [], total: count ?? 0 });
  } catch (err) {
    captureError("api.admin.submissions.list", err);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

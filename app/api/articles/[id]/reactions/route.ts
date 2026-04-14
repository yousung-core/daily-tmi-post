import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getAuthenticatedUser, requireAuth, safeParseJSON } from "@/lib/api-helpers";
import { isValidUUID } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";
import { captureError } from "@/lib/logger";
import type { ReactionType, ArticleReactionState, ArticleReaction } from "@/lib/types";

const VALID_REACTIONS: ReactionType[] = ["like", "funny", "sad", "cheer", "surprise"];

async function getReactionState(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  articleId: string,
  userId?: string
): Promise<ArticleReactionState> {
  const { data: reactions } = await supabase
    .from("article_reactions")
    .select("reaction_type")
    .eq("article_id", articleId);

  const counts: Record<string, number> = {};
  for (const r of reactions ?? []) {
    counts[r.reaction_type] = (counts[r.reaction_type] || 0) + 1;
  }

  const reactionList: ArticleReaction[] = VALID_REACTIONS.map((type) => ({
    reactionType: type,
    count: counts[type] || 0,
  }));

  let myReaction: ReactionType | undefined;
  if (userId) {
    const { data: mine } = await supabase
      .from("article_reactions")
      .select("reaction_type")
      .eq("article_id", articleId)
      .eq("user_id", userId)
      .single();

    if (mine) {
      myReaction = mine.reaction_type as ReactionType;
    }
  }

  return { reactions: reactionList, myReaction };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: articleId } = await params;

  if (!isValidUUID(articleId)) {
    return NextResponse.json({ error: "유효하지 않은 ID입니다." }, { status: 400 });
  }

  try {
    const serverClient = await createSupabaseServerClient();
    const supabase = createSupabaseAdminClient();

    const { data: { user } } = await serverClient.auth.getUser();
    const state = await getReactionState(supabase, articleId, user?.id);

    return NextResponse.json(state);
  } catch (err) {
    captureError("api.articles.reactions.get", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await getAuthenticatedUser();
    const authError = requireAuth(authResult);
    if (authError) return authError;
    const user = authResult.user!;

    const { id: articleId } = await params;

    if (!isValidUUID(articleId)) {
      return NextResponse.json({ error: "유효하지 않은 ID입니다." }, { status: 400 });
    }

    const body = await safeParseJSON(request);
    if (!body) {
      return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
    }

    const { reactionType } = body as { reactionType: string };

    if (!VALID_REACTIONS.includes(reactionType as ReactionType)) {
      return NextResponse.json({ error: "유효하지 않은 리액션입니다." }, { status: 400 });
    }

    // Rate limiting
    const rateLimitResult = await rateLimit(`reaction:${user.id}`, 30, 60);
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: "너무 많은 요청입니다. 잠시 후 다시 시도해주세요." }, { status: 429 });
    }

    // RPC는 auth.uid()를 검증하므로 사용자 JWT가 포함된 server client로 호출
    const serverClient = await createSupabaseServerClient();
    const { error: rpcError } = await serverClient.rpc("toggle_article_reaction", {
      p_article_id: articleId,
      p_user_id: user.id,
      p_reaction_type: reactionType,
    });

    if (rpcError) {
      captureError("api.articles.reactions.toggle", rpcError);
      return NextResponse.json({ error: "리액션에 실패했습니다." }, { status: 500 });
    }

    // 업데이트된 상태 반환 (admin client로 전체 조회)
    const supabase = createSupabaseAdminClient();
    const state = await getReactionState(supabase, articleId, user.id);
    return NextResponse.json(state);
  } catch (err) {
    captureError("api.articles.reactions.post", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

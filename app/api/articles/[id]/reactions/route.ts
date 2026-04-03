import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { captureError } from "@/lib/logger";
import type { ReactionType, ArticleReactionState, ArticleReaction } from "@/lib/types";

const VALID_REACTIONS: ReactionType[] = ["like", "funny", "sad", "cheer", "surprise"];

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: articleId } = await params;

  try {
    const supabase = createSupabaseAdminClient();

    // 리액션 카운트
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

    // 현재 사용자의 리액션
    let myReaction: ReactionType | undefined;
    const serverClient = await createSupabaseServerClient();
    const { data: { user } } = await serverClient.auth.getUser();

    if (user) {
      const { data: mine } = await supabase
        .from("article_reactions")
        .select("reaction_type")
        .eq("article_id", articleId)
        .eq("user_id", user.id)
        .single();

      if (mine) {
        myReaction = mine.reaction_type as ReactionType;
      }
    }

    const state: ArticleReactionState = { reactions: reactionList, myReaction };
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
    const serverClient = await createSupabaseServerClient();
    const { data: { user } } = await serverClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const { id: articleId } = await params;
    const { reactionType } = await request.json();

    if (!VALID_REACTIONS.includes(reactionType)) {
      return NextResponse.json({ error: "유효하지 않은 리액션입니다." }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();

    // 기존 리액션 확인
    const { data: existing } = await supabase
      .from("article_reactions")
      .select("id, reaction_type")
      .eq("article_id", articleId)
      .eq("user_id", user.id)
      .single();

    if (existing) {
      if (existing.reaction_type === reactionType) {
        // 같은 리액션 → 제거
        await supabase.from("article_reactions").delete().eq("id", existing.id);
      } else {
        // 다른 리액션 → 변경
        await supabase
          .from("article_reactions")
          .update({ reaction_type: reactionType })
          .eq("id", existing.id);
      }
    } else {
      // 새 리액션
      const { error } = await supabase
        .from("article_reactions")
        .insert({
          article_id: articleId,
          user_id: user.id,
          reaction_type: reactionType,
        });

      if (error) {
        captureError("api.articles.reactions.create", error);
        return NextResponse.json({ error: "리액션에 실패했습니다." }, { status: 500 });
      }
    }

    // 업데이트된 상태 반환
    const { data: reactions } = await supabase
      .from("article_reactions")
      .select("reaction_type")
      .eq("article_id", articleId);

    const counts: Record<string, number> = {};
    for (const r of reactions ?? []) {
      counts[r.reaction_type] = (counts[r.reaction_type] || 0) + 1;
    }

    const { data: mine } = await supabase
      .from("article_reactions")
      .select("reaction_type")
      .eq("article_id", articleId)
      .eq("user_id", user.id)
      .single();

    const state: ArticleReactionState = {
      reactions: VALID_REACTIONS.map((type) => ({
        reactionType: type,
        count: counts[type] || 0,
      })),
      myReaction: mine ? (mine.reaction_type as ReactionType) : undefined,
    };

    return NextResponse.json(state);
  } catch (err) {
    captureError("api.articles.reactions.post", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

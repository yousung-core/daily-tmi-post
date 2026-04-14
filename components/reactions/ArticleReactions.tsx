"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import type {
  ArticleReactionState,
  ReactionType,
} from "@/lib/types";
import { reactionLabels, reactionEmojis } from "@/lib/types";
import { LoginPromptModal, useLoginPrompt } from "@/components/LoginPrompt";

const REACTION_TYPES: ReactionType[] = ["like", "funny", "sad", "cheer", "surprise"];

interface ArticleReactionsProps {
  articleId: string;
}

export default function ArticleReactions({ articleId }: ArticleReactionsProps) {
  const { user } = useAuth();
  const [state, setState] = useState<ArticleReactionState>({
    reactions: REACTION_TYPES.map((type) => ({ reactionType: type, count: 0 })),
  });
  const [loadingType, setLoadingType] = useState<ReactionType | null>(null);
  const [fetchError, setFetchError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const loginPrompt = useLoginPrompt();

  useEffect(() => {
    setFetchError(false);
    const controller = new AbortController();
    fetch(`/api/articles/${articleId}/reactions`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error("fetch failed");
        return res.json();
      })
      .then((data) => {
        if (data.reactions) setState(data);
        else setFetchError(true);
      })
      .catch((err) => {
        if (err.name !== "AbortError") setFetchError(true);
      });
    return () => controller.abort();
  }, [articleId, retryKey]);

  const handleReaction = async (type: ReactionType) => {
    if (!user) {
      loginPrompt.prompt("로그인 후 리액션을 남길 수 있습니다.");
      return;
    }
    if (loadingType) return;

    setLoadingType(type);
    try {
      const res = await fetch(`/api/articles/${articleId}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reactionType: type }),
      });
      const data = await res.json();
      if (res.ok && data.reactions) {
        setState(data);
      } else if (!res.ok) {
        toast.error(data.error);
      }
    } catch {
      toast.error("리액션에 실패했습니다.");
    } finally {
      setLoadingType(null);
    }
  };

  if (fetchError) {
    return (
      <div className="mt-6 text-center">
        <p className="text-xs text-red-500 mb-1">리액션을 불러오지 못했습니다.</p>
        <button type="button" onClick={() => setRetryKey((k) => k + 1)} className="text-xs text-ink-500 hover:text-ink-700 underline">다시 시도</button>
      </div>
    );
  }

  return (
    <div className="mt-6 flex flex-nowrap justify-center gap-1.5 sm:gap-2">
      <LoginPromptModal open={loginPrompt.open} onClose={loginPrompt.close} message={loginPrompt.message} />
      {state.reactions.map(({ reactionType, count }) => {
        const isActive = state.myReaction === reactionType;
        const ariaProps = {
          "aria-label": `${reactionLabels[reactionType]} 리액션${isActive ? " 취소" : ""}`,
          "aria-pressed": isActive ? "true" : "false",
        } as const;
        return (
          <button
            type="button"
            key={reactionType}
            onClick={() => handleReaction(reactionType)}
            disabled={loadingType !== null}
            {...ariaProps}
            className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm border transition-all disabled:opacity-60 min-h-[44px] sm:min-h-0 ${
              isActive
                ? "border-ink-600 bg-ink-800 text-parchment-100 shadow-sm"
                : "border-parchment-400 bg-parchment-100/80 text-ink-700 hover:border-ink-400 hover:bg-parchment-200"
            }`}
          >
            <span>{reactionEmojis[reactionType]}</span>
            <span className="text-xs hidden sm:inline">{reactionLabels[reactionType]}</span>
            {count > 0 && (
              <span className={`text-xs font-medium ${isActive ? "text-parchment-200" : "text-ink-500"}`}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

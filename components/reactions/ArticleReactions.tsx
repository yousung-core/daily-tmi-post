"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import type {
  ArticleReactionState,
  ReactionType,
} from "@/lib/types";
import { reactionLabels, reactionEmojis } from "@/lib/types";

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

  useEffect(() => {
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
  }, [articleId]);

  const handleReaction = async (type: ReactionType) => {
    if (!user) {
      toast("로그인 후 리액션을 남길 수 있습니다.");
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
      <p className="mt-6 text-center text-xs text-red-500">
        리액션을 불러오지 못했습니다.
      </p>
    );
  }

  return (
    <div className="mt-6 flex flex-wrap justify-center gap-2">
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
            className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm border transition-all disabled:opacity-60 ${
              isActive
                ? "border-ink-600 bg-ink-800 text-parchment-100 shadow-sm"
                : "border-parchment-400 bg-parchment-100/80 text-ink-700 hover:border-ink-400 hover:bg-parchment-200"
            }`}
          >
            <span>{reactionEmojis[reactionType]}</span>
            <span className="text-xs">{reactionLabels[reactionType]}</span>
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

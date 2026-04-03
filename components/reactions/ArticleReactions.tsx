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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/articles/${articleId}/reactions`)
      .then((res) => res.json())
      .then((data) => {
        if (data.reactions) setState(data);
      })
      .catch(() => {});
  }, [articleId]);

  const handleReaction = async (type: ReactionType) => {
    if (!user) {
      toast("로그인 후 리액션을 남길 수 있습니다.");
      return;
    }
    if (loading) return;

    setLoading(true);
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
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 flex flex-wrap justify-center gap-2">
      {state.reactions.map(({ reactionType, count }) => {
        const isActive = state.myReaction === reactionType;
        return (
          <button
            key={reactionType}
            onClick={() => handleReaction(reactionType)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm border transition-all ${
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

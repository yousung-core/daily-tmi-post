"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

interface CommentLikeButtonProps {
  commentId: string;
  initialCount: number;
  initialLiked: boolean;
}

export default function CommentLikeButton({
  commentId,
  initialCount,
  initialLiked,
}: CommentLikeButtonProps) {
  const { user } = useAuth();
  const [count, setCount] = useState(initialCount);
  const [liked, setLiked] = useState(initialLiked);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    if (!user) {
      toast("로그인 후 좋아요를 누를 수 있습니다.");
      return;
    }

    setLoading(true);
    // 옵티미스틱 업데이트
    setLiked(!liked);
    setCount((prev) => (liked ? prev - 1 : prev + 1));

    try {
      const res = await fetch(`/api/comments/${commentId}/like`, {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) {
        // 롤백
        setLiked(liked);
        setCount(initialCount);
        toast.error(data.error);
        return;
      }

      setLiked(data.liked);
      setCount(data.count);
    } catch {
      setLiked(liked);
      setCount(initialCount);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`flex items-center gap-1 text-xs transition-colors ${
        liked ? "text-red-500" : "text-ink-400 hover:text-ink-600"
      }`}
    >
      <span>{liked ? "\u2764\uFE0F" : "\u2661"}</span>
      {count > 0 && <span>{count}</span>}
    </button>
  );
}

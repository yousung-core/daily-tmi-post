"use client";

import { useState, useRef, useEffect } from "react";
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

  // 서버에서 확인된 마지막 값 추적 (롤백용)
  const confirmedRef = useRef({ count: initialCount, liked: initialLiked });

  // Props 변경 시 동기화 (부모가 refetch한 경우)
  useEffect(() => {
    setCount(initialCount);
    setLiked(initialLiked);
    confirmedRef.current = { count: initialCount, liked: initialLiked };
  }, [initialCount, initialLiked]);

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
        // 서버 확인 값으로 롤백
        setLiked(confirmedRef.current.liked);
        setCount(confirmedRef.current.count);
        toast.error(data.error);
        return;
      }

      // 서버 확인 값으로 갱신
      setLiked(data.liked);
      setCount(data.count);
      confirmedRef.current = { count: data.count, liked: data.liked };
    } catch {
      setLiked(confirmedRef.current.liked);
      setCount(confirmedRef.current.count);
      toast.error("좋아요에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const ariaProps = {
    "aria-label": liked ? "좋아요 취소" : "좋아요",
    "aria-pressed": liked ? "true" : "false",
  } as const;

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={loading}
      {...ariaProps}
      className={`flex items-center gap-1 text-xs transition-colors ${
        liked ? "text-red-500" : "text-ink-400 hover:text-ink-600"
      }`}
    >
      <span>{liked ? "\u2764\uFE0F" : "\u2661"}</span>
      {count > 0 && <span>{count}</span>}
    </button>
  );
}

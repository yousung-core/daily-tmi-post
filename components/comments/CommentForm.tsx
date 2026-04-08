"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { COMMENT_MAX_LENGTH } from "@/lib/constants";

interface CommentFormProps {
  articleId: string;
  parentId?: string;
  onSuccess: () => void;
  onCancel?: () => void;
  placeholder?: string;
}

export default function CommentForm({
  articleId,
  parentId,
  onSuccess,
  onCancel,
  placeholder = "댓글을 작성해주세요",
}: CommentFormProps) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const counterId = parentId ? `reply-count-${parentId}` : "comment-char-count";

  if (!user) {
    return (
      <div className="text-sm text-ink-500 py-3 text-center border border-parchment-300 rounded-md bg-parchment-100/50">
        로그인 후 댓글을 작성할 수 있습니다.
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId, content: content.trim(), parentId }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error);
        return;
      }

      setContent("");
      onSuccess();
    } catch {
      toast.error("댓글 작성에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        maxLength={COMMENT_MAX_LENGTH}
        rows={parentId ? 2 : 3}
        aria-label={parentId ? "답글 입력" : "댓글 입력"}
        aria-describedby={counterId}
        className="w-full px-3 py-2 text-sm border border-parchment-400 rounded-md bg-white/80 resize-none focus:outline-none focus:ring-2 focus:ring-ink-300"
      />
      <div className="flex items-center justify-between">
        <span id={counterId} className="text-xs text-ink-400" aria-live="polite">{content.length}/{COMMENT_MAX_LENGTH}</span>
        <div className="flex gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-3 py-2.5 sm:py-1.5 text-sm sm:text-xs text-ink-600 hover:text-ink-800 min-h-[44px] sm:min-h-0"
            >
              취소
            </button>
          )}
          <button
            type="submit"
            disabled={submitting || !content.trim()}
            className="px-4 py-2.5 sm:py-1.5 text-sm sm:text-xs bg-ink-800 text-parchment-100 rounded-md hover:bg-ink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px] sm:min-h-0"
          >
            {submitting ? "작성 중..." : parentId ? "답글" : "댓글 작성"}
          </button>
        </div>
      </div>
    </form>
  );
}

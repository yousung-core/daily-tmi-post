"use client";

import { useEffect, useState, useCallback } from "react";
import type { Comment } from "@/lib/types";
import CommentForm from "./CommentForm";
import CommentItem from "./CommentItem";

interface CommentSectionProps {
  articleId: string;
}

export default function CommentSection({ articleId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pageSize = 20;

  const fetchComments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/comments?articleId=${articleId}&page=${page}&pageSize=${pageSize}`
      );
      const data = await res.json();
      if (res.ok) {
        setComments(data.comments);
        setTotal(data.total);
      } else {
        setError(data.error);
      }
    } catch {
      setError("댓글을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [articleId, page]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <section className="mt-8 pt-6 border-t-2 border-ink-800">
      <h2 className="text-lg font-bold text-ink-800 mb-4">
        댓글 {total > 0 && <span className="text-ink-500 font-normal">({total})</span>}
      </h2>

      <CommentForm articleId={articleId} onSuccess={fetchComments} />

      <div className="mt-6 divide-y divide-parchment-300">
        {loading ? (
          <div className="text-center py-8 text-ink-400 text-sm">불러오는 중...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-500 text-sm">{error}</div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-ink-400 text-sm">
            첫 번째 댓글을 남겨보세요!
          </div>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              articleId={articleId}
              onRefresh={fetchComments}
            />
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-3 py-1.5 text-xs rounded border border-parchment-400 disabled:opacity-50 hover:bg-parchment-200"
          >
            이전
          </button>
          <span className="px-3 py-1.5 text-xs text-ink-500">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="px-3 py-1.5 text-xs rounded border border-parchment-400 disabled:opacity-50 hover:bg-parchment-200"
          >
            다음
          </button>
        </div>
      )}
    </section>
  );
}

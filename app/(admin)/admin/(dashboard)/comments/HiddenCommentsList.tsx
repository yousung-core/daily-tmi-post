"use client";

import { useEffect, useState, useRef } from "react";
import { HiddenComment } from "@/lib/types";

export default function HiddenCommentsList() {
  const [comments, setComments] = useState<HiddenComment[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [fetchTrigger, setFetchTrigger] = useState(0);
  const pageSize = 20;

  const fetchControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    fetchControllerRef.current?.abort();
    const controller = new AbortController();
    fetchControllerRef.current = controller;

    setLoading(true);
    setError(null);
    fetch(
      `/api/admin/comments/hidden?page=${currentPage}&pageSize=${pageSize}`,
      { signal: controller.signal }
    )
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (ok) {
          setComments(data.comments);
          setTotal(data.total);
        } else {
          setError(data.error || "목록을 불러오지 못했습니다.");
        }
      })
      .catch((err) => {
        if ((err as Error).name !== "AbortError") {
          setError("네트워크 오류가 발생했습니다.");
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [currentPage, fetchTrigger]);

  const totalPages = Math.ceil(total / pageSize);

  const handleRestore = async (commentId: string) => {
    if (!confirm("이 댓글을 복원하시겠습니까?")) return;
    if (actionLoading) return;

    setActionLoading(commentId);
    try {
      const res = await fetch(`/api/admin/comments/${commentId}/restore`, {
        method: "PATCH",
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "복원에 실패했습니다.");
      }
    } catch {
      alert("네트워크 오류가 발생했습니다.");
    } finally {
      setActionLoading(null);
      setFetchTrigger((n) => n + 1);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm("이 댓글을 삭제하시겠습니까?")) return;
    if (actionLoading) return;

    setActionLoading(`del-${commentId}`);
    try {
      const res = await fetch(`/api/admin/comments/${commentId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "삭제에 실패했습니다.");
      }
    } catch {
      alert("네트워크 오류가 발생했습니다.");
    } finally {
      setActionLoading(null);
      setFetchTrigger((n) => n + 1);
    }
  };

  const handleToggleBan = async (userId: string, currentlyBanned: boolean) => {
    const action = currentlyBanned ? "차단 해제" : "차단";
    if (!confirm(`이 사용자를 ${action}하시겠습니까?`)) return;
    if (actionLoading) return;

    setActionLoading(`ban-${userId}`);
    try {
      const res = await fetch(`/api/admin/users/${userId}/ban`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ banned: !currentlyBanned }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "처리에 실패했습니다.");
      }
    } catch {
      alert("네트워크 오류가 발생했습니다.");
    } finally {
      setActionLoading(null);
      setFetchTrigger((n) => n + 1);
    }
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-3">{error}</p>
        <button
          onClick={() => setFetchTrigger((n) => n + 1)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          다시 시도
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-12 text-gray-500" aria-live="polite">
        불러오는 중...
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        AI에 의해 숨겨진 댓글이 없습니다.
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {comments.map((comment) => (
          <article
            key={comment.commentId}
            className="bg-white rounded-lg border border-gray-200 p-4"
          >
            {/* 헤더: AI 판단 정보 */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium bg-amber-100 text-amber-800 rounded-full">
                  AI 판단: {comment.hiddenReason}
                </span>
              </div>
              {comment.authorIsBanned && (
                <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded shrink-0">
                  차단됨
                </span>
              )}
            </div>

            {/* 댓글 내용 */}
            <div className="bg-gray-50 rounded-md p-3 mb-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-gray-800">
                  {comment.authorNickname}
                </span>
                <time
                  dateTime={comment.commentCreatedAt}
                  className="text-xs text-gray-400"
                >
                  {new Date(comment.commentCreatedAt).toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </time>
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                {comment.commentContent}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                기사: {comment.articleTitle}
              </p>
            </div>

            {/* 액션 버튼 */}
            <div className="flex flex-wrap gap-2">
              <button
                aria-label="댓글 복원"
                onClick={() => handleRestore(comment.commentId)}
                disabled={actionLoading !== null}
                className="px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {actionLoading === comment.commentId ? "처리 중..." : "복원"}
              </button>
              <button
                aria-label="댓글 삭제"
                onClick={() => handleDelete(comment.commentId)}
                disabled={actionLoading !== null}
                className="px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {actionLoading === `del-${comment.commentId}` ? "처리 중..." : "삭제"}
              </button>
              <button
                aria-label={`${comment.authorNickname} 사용자 ${comment.authorIsBanned ? "차단 해제" : "차단"}`}
                onClick={() =>
                  handleToggleBan(comment.authorId, comment.authorIsBanned)
                }
                disabled={actionLoading !== null}
                className={`px-3 py-2 text-sm font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                  comment.authorIsBanned
                    ? "text-green-700 bg-green-50 border border-green-200 hover:bg-green-100"
                    : "text-orange-700 bg-orange-50 border border-orange-200 hover:bg-orange-100"
                }`}
              >
                {actionLoading === `ban-${comment.authorId}`
                  ? "처리 중..."
                  : comment.authorIsBanned
                  ? "차단 해제"
                  : "사용자 차단"}
              </button>
            </div>
          </article>
        ))}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <nav aria-label="페이지 탐색" className="flex justify-center gap-2 mt-6">
          <button
            type="button"
            onClick={() => setCurrentPage((p) => p - 1)}
            disabled={currentPage <= 1}
            className="px-4 py-3 text-sm rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            이전
          </button>
          <span className="px-4 py-3 text-sm text-gray-600" aria-current="page">
            {currentPage} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setCurrentPage((p) => p + 1)}
            disabled={currentPage >= totalPages}
            className="px-4 py-3 text-sm rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            다음
          </button>
        </nav>
      )}
    </>
  );
}

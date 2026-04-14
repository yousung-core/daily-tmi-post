"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { ReportedComment } from "@/lib/types";

type StatusTab = "pending" | "resolved" | "dismissed";

const statusTabs: { value: StatusTab; label: string }[] = [
  { value: "pending", label: "대기중" },
  { value: "resolved", label: "처리됨" },
  { value: "dismissed", label: "무시됨" },
];

export default function ReportedCommentsList() {
  const searchParams = useSearchParams();
  const [currentStatus, setCurrentStatus] = useState<StatusTab>(
    (searchParams.get("status") as StatusTab) || "pending"
  );
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page") || "1", 10)
  );

  const [reports, setReports] = useState<ReportedComment[]>([]);
  const [total, setTotal] = useState(0);
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
      `/api/admin/comments?status=${currentStatus}&page=${currentPage}&pageSize=${pageSize}`,
      { signal: controller.signal }
    )
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (ok) {
          setReports(data.reports);
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
  }, [currentStatus, currentPage, fetchTrigger]);

  const totalPages = Math.ceil(total / pageSize);

  const setStatus = (status: StatusTab) => {
    setCurrentStatus(status);
    setCurrentPage(1);
  };

  const setPage = (page: number) => {
    setCurrentPage(page);
  };

  // 댓글 삭제 (관리자)
  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("이 댓글을 삭제하시겠습니까?")) return;
    if (actionLoading) return; // 이중 클릭 방지

    setActionLoading(commentId);
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

  // 신고 무시
  const handleDismissReport = async (reportId: string) => {
    if (actionLoading) return;

    setActionLoading(reportId);
    try {
      const res = await fetch(`/api/admin/comments/${reportId}/resolve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "dismissed" }),
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

  // 사용자 차단/해제
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

  return (
    <div>
      {/* 상태 탭 */}
      <div role="tablist" className="flex gap-1 mb-6 border-b border-gray-200">
        {statusTabs.map((tab) => (
          <button
            key={tab.value}
            role="tab"
            aria-selected={currentStatus === tab.value}
            onClick={() => setStatus(tab.value)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              currentStatus === tab.value
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 콘텐츠 */}
      <div role="tabpanel">
        {error ? (
          <div className="text-center py-12">
            <p className="text-red-600 mb-3">{error}</p>
            <button
              onClick={() => setFetchTrigger((n) => n + 1)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              다시 시도
            </button>
          </div>
        ) : loading ? (
          <div className="text-center py-12 text-gray-500" aria-live="polite">
            불러오는 중...
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            {currentStatus === "pending"
              ? "대기 중인 신고가 없습니다."
              : currentStatus === "resolved"
              ? "처리된 신고가 없습니다."
              : "무시된 신고가 없습니다."}
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {reports.map((report) => (
                <article
                  key={report.reportId}
                  className="bg-white rounded-lg border border-gray-200 p-4"
                >
                  {/* 헤더: 신고 정보 */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-500 mb-1">
                        <span className="font-medium text-gray-700">
                          {report.reporterNickname}
                        </span>
                        <span>님이 신고</span>
                        <time dateTime={report.reportedAt}>
                          {new Date(report.reportedAt).toLocaleDateString("ko-KR", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </time>
                      </div>
                      <p className="text-sm text-red-600">
                        신고 사유: {report.reportReason}
                      </p>
                    </div>
                    {report.authorIsBanned && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded shrink-0">
                        차단됨
                      </span>
                    )}
                  </div>

                  {/* 댓글 내용 */}
                  <div className="bg-gray-50 rounded-md p-3 mb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-800">
                        {report.authorNickname}
                      </span>
                      <time
                        dateTime={report.commentCreatedAt}
                        className="text-xs text-gray-400"
                      >
                        {new Date(report.commentCreatedAt).toLocaleDateString("ko-KR")}
                      </time>
                    </div>
                    {report.commentIsDeleted ? (
                      <p className="text-sm text-gray-400 italic">삭제된 댓글입니다.</p>
                    ) : (
                      <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                        {report.commentContent}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      기사: {report.articleTitle}
                    </p>
                  </div>

                  {/* 액션 버튼 */}
                  {currentStatus === "pending" && (
                    <div className="flex flex-wrap gap-2">
                      {!report.commentIsDeleted && (
                        <button
                          aria-label={`"${report.commentContent.slice(0, 20)}..." 댓글 삭제`}
                          onClick={() => handleDeleteComment(report.commentId)}
                          disabled={actionLoading !== null}
                          className="px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {actionLoading === report.commentId
                            ? "처리 중..."
                            : "댓글 삭제"}
                        </button>
                      )}
                      <button
                        aria-label={`${report.authorNickname} 사용자 ${report.authorIsBanned ? "차단 해제" : "차단"}`}
                        onClick={() =>
                          handleToggleBan(report.authorId, report.authorIsBanned)
                        }
                        disabled={actionLoading !== null}
                        className={`px-3 py-2 text-sm font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                          report.authorIsBanned
                            ? "text-green-700 bg-green-50 border border-green-200 hover:bg-green-100"
                            : "text-orange-700 bg-orange-50 border border-orange-200 hover:bg-orange-100"
                        }`}
                      >
                        {actionLoading === `ban-${report.authorId}`
                          ? "처리 중..."
                          : report.authorIsBanned
                          ? "차단 해제"
                          : "사용자 차단"}
                      </button>
                      <button
                        aria-label="신고 무시"
                        onClick={() => handleDismissReport(report.reportId)}
                        disabled={actionLoading !== null}
                        className="px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {actionLoading === report.reportId
                          ? "처리 중..."
                          : "무시"}
                      </button>
                    </div>
                  )}
                </article>
              ))}
            </div>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <nav aria-label="페이지 탐색" className="flex justify-center gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setPage(currentPage - 1)}
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
                  onClick={() => setPage(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="px-4 py-3 text-sm rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  다음
                </button>
              </nav>
            )}
          </>
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { SubmissionRow } from "@/lib/types";
import { submissionCategoryLabels, SubmissionCategory } from "@/lib/types";

type StatusTab = "pending" | "approved" | "rejected";

const statusTabs: { value: StatusTab; label: string }[] = [
  { value: "pending", label: "대기중" },
  { value: "approved", label: "승인됨" },
  { value: "rejected", label: "반려됨" },
];

export default function SubmissionsList() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentStatus = (searchParams.get("status") as StatusTab) || "pending";
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  const [submissions, setSubmissions] = useState<SubmissionRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pageSize = 20;

  useEffect(() => {
    const fetchSubmissions = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/admin/submissions?status=${currentStatus}&page=${currentPage}&pageSize=${pageSize}`
        );
        const data = await res.json();
        if (res.ok) {
          setSubmissions(data.submissions);
          setTotal(data.total);
        } else {
          setError(data.error || "목록을 불러오지 못했습니다.");
        }
      } catch {
        setError("네트워크 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, [currentStatus, currentPage]);

  const totalPages = Math.ceil(total / pageSize);

  const setStatus = (status: StatusTab) => {
    router.push(`/admin/submissions?status=${status}`);
  };

  const setPage = (page: number) => {
    router.push(
      `/admin/submissions?status=${currentStatus}&page=${page}`
    );
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">신청 관리</h1>

      {/* 상태 탭 */}
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {statusTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatus(tab.value)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              currentStatus === tab.value
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 테이블 */}
      {error ? (
        <div className="text-center py-12">
          <p className="text-red-600 mb-3">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            다시 시도
          </button>
        </div>
      ) : loading ? (
        <div className="text-center py-12 text-gray-500">불러오는 중...</div>
      ) : submissions.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {currentStatus === "pending"
            ? "대기 중인 신청이 없습니다."
            : currentStatus === "approved"
            ? "승인된 신청이 없습니다."
            : "반려된 신청이 없습니다."}
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">
                    제목
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">
                    카테고리
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">
                    이메일
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">
                    신청일
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {submissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="font-medium text-gray-900 line-clamp-1">
                        {sub.title}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {submissionCategoryLabels[
                        sub.category as SubmissionCategory
                      ] || sub.category}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{sub.email}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(sub.created_at).toLocaleDateString("ko-KR")}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/submissions/${sub.id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        상세보기
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                onClick={() => setPage(currentPage - 1)}
                disabled={currentPage <= 1}
                className="px-3 py-1.5 text-sm rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                이전
              </button>
              <span className="px-3 py-1.5 text-sm text-gray-600">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setPage(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="px-3 py-1.5 text-sm rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                다음
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

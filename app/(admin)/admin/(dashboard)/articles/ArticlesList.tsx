"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ArticleRow, submissionCategoryLabels, SubmissionCategory } from "@/lib/types";

export default function ArticlesList() {
  const searchParams = useSearchParams();
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page") || "1", 10)
  );

  const [articles, setArticles] = useState<ArticleRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
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
      `/api/admin/articles?page=${currentPage}&pageSize=${pageSize}`,
      { signal: controller.signal }
    )
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (ok) {
          setArticles(data.articles);
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

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`"${title}" 기사를 삭제하시겠습니까?`)) return;

    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/articles/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("기사가 삭제되었습니다.");
        setFetchTrigger((n) => n + 1);
      } else {
        const data = await res.json().catch(() => null);
        toast.error(data?.error || "기사 삭제에 실패했습니다.");
      }
    } catch {
      toast.error("기사 삭제 중 오류가 발생했습니다.");
    } finally {
      setDeleting(null);
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">기사 관리</h1>

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
        <div className="text-center py-12 text-gray-500">불러오는 중...</div>
      ) : articles.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          발행된 기사가 없습니다.
        </div>
      ) : (
        <>
          {/* 모바일 카드 뷰 */}
          <div className="sm:hidden space-y-3">
            {articles.map((article) => (
              <div key={article.id} className="bg-white rounded-lg border border-gray-200 p-4 space-y-2">
                <span className="font-medium text-gray-900 text-sm line-clamp-2 block">{article.title}</span>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
                  <span>{submissionCategoryLabels[article.category as SubmissionCategory] || article.category}</span>
                  <span>조회 {article.view_count.toLocaleString()}</span>
                  <span>{new Date(article.published_at).toLocaleDateString("ko-KR")}</span>
                </div>
                <div className="flex gap-3 pt-1">
                  <Link
                    href={`/admin/articles/${article.id}/edit`}
                    className="text-blue-600 hover:text-blue-800 font-medium text-sm min-h-[44px] flex items-center"
                  >
                    수정
                  </Link>
                  <button
                    onClick={() => handleDelete(article.id, article.title)}
                    disabled={deleting === article.id}
                    className="text-red-600 hover:text-red-800 font-medium text-sm disabled:opacity-50 min-h-[44px] flex items-center"
                  >
                    {deleting === article.id ? "삭제 중..." : "삭제"}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* 데스크톱 테이블 */}
          <div className="hidden sm:block bg-white rounded-lg border border-gray-200 overflow-x-auto">
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
                    조회수
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">
                    발행일
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {articles.map((article) => (
                  <tr key={article.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="font-medium text-gray-900 line-clamp-1">
                        {article.title}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {submissionCategoryLabels[
                        article.category as SubmissionCategory
                      ] || article.category}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {article.view_count.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(article.published_at).toLocaleDateString(
                        "ko-KR"
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Link
                          href={`/admin/articles/${article.id}/edit`}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          수정
                        </Link>
                        <button
                          onClick={() =>
                            handleDelete(article.id, article.title)
                          }
                          disabled={deleting === article.id}
                          className="text-red-600 hover:text-red-800 font-medium disabled:opacity-50"
                        >
                          {deleting === article.id ? "삭제 중..." : "삭제"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                onClick={() => setCurrentPage((p) => p - 1)}
                disabled={currentPage <= 1}
                className="px-4 py-2.5 text-sm rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                이전
              </button>
              <span className="px-4 py-2.5 text-sm text-gray-600">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={currentPage >= totalPages}
                className="px-4 py-2.5 text-sm rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
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

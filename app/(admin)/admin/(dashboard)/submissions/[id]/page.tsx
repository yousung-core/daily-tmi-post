"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import { SubmissionRow, submissionCategoryLabels, SubmissionCategory } from "@/lib/types";

interface AiResult {
  title: string;
  content: string;
  excerpt: string;
}

export default function SubmissionDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [submission, setSubmission] = useState<SubmissionRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // 승인 시 편집 가능한 필드
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editExcerpt, setEditExcerpt] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // AI 다듬기 상태
  const [aiResult, setAiResult] = useState<AiResult | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        const res = await fetch(`/api/admin/submissions/${id}`);
        const data = await res.json();
        if (res.ok) {
          setSubmission(data.submission);
          setEditTitle(data.submission.title);
          setEditContent(data.submission.content);
          setEditExcerpt(
            data.submission.content
              .substring(0, 100)
              .replace(/\s+/g, " ")
              .trim()
          );
        }
      } catch {
        // 에러
      } finally {
        setLoading(false);
      }
    };
    fetchSubmission();
  }, [id]);

  // 성공 메시지 후 자동 이동
  useEffect(() => {
    if (message?.type === "success" && (message.text.includes("승인") || message.text.includes("반려"))) {
      const timer = setTimeout(() => router.push("/admin/submissions"), 2000);
      return () => clearTimeout(timer);
    }
  }, [message, router]);

  const handleAction = async (action: "approve" | "reject") => {
    if (action === "reject" && !adminNote.trim()) {
      setMessage({ type: "error", text: "반려 사유를 입력해주세요." });
      return;
    }

    setProcessing(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/submissions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          title: editTitle,
          content: editContent,
          excerpt: editExcerpt,
          adminNote: adminNote || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: "error", text: data.error });
        return;
      }

      setMessage({
        type: "success",
        text:
          action === "approve"
            ? "승인되었습니다. 기사가 발행되었습니다."
            : "반려되었습니다.",
      });

      // useEffect에서 message 감지 후 자동 이동
    } catch {
      setMessage({ type: "error", text: "처리 중 오류가 발생했습니다." });
    } finally {
      setProcessing(false);
    }
  };

  const handleAiRefine = async () => {
    if (!submission) return;

    setAiLoading(true);
    setAiError(null);
    setAiResult(null);

    try {
      const res = await fetch("/api/admin/ai/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: submission.category,
          title: submission.title,
          content: submission.content,
          eventDate: submission.event_date,
          location: submission.location || undefined,
          message: submission.message || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setAiError(data.error || "AI 다듬기에 실패했습니다.");
        return;
      }

      setAiResult(data.result);
    } catch {
      setAiError("AI 다듬기 요청 중 오류가 발생했습니다.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleAiApply = () => {
    if (!aiResult) return;
    setEditTitle(aiResult.title);
    setEditContent(aiResult.content);
    setEditExcerpt(aiResult.excerpt);
    setAiResult(null);
    setMessage({ type: "success", text: "AI 결과가 적용되었습니다." });
  };

  const handleAiDismiss = () => {
    setAiResult(null);
    setAiError(null);
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-500">불러오는 중...</div>;
  }

  if (!submission) {
    return (
      <div className="text-center py-12 text-gray-500">
        신청을 찾을 수 없습니다.
      </div>
    );
  }

  const isPending = submission.status === "pending";
  const categoryLabel =
    submissionCategoryLabels[submission.category as SubmissionCategory] ||
    submission.category;

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="text-gray-500 hover:text-gray-700 text-sm"
        >
          &larr; 목록으로
        </button>
        <h1 className="text-2xl font-bold text-gray-900">신청 상세</h1>
        <span
          className={`text-xs px-2 py-1 rounded-full font-medium ${
            submission.status === "pending"
              ? "bg-yellow-100 text-yellow-800"
              : submission.status === "approved"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {submission.status === "pending"
            ? "대기중"
            : submission.status === "approved"
            ? "승인됨"
            : "반려됨"}
        </span>
      </div>

      {message && (
        <div
          className={`mb-6 px-4 py-3 rounded-md text-sm ${
            message.type === "success"
              ? "bg-green-50 border border-green-200 text-green-700"
              : "bg-red-50 border border-red-200 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* 신청 정보 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">이메일</span>
            <p className="font-medium">{submission.email}</p>
          </div>
          <div>
            <span className="text-gray-500">카테고리</span>
            <p className="font-medium">{categoryLabel}</p>
          </div>
          <div>
            <span className="text-gray-500">이벤트 날짜</span>
            <p className="font-medium">{submission.event_date}</p>
          </div>
          <div>
            <span className="text-gray-500">장소</span>
            <p className="font-medium">{submission.location || "-"}</p>
          </div>
          <div>
            <span className="text-gray-500">신청일</span>
            <p className="font-medium">
              {new Date(submission.created_at).toLocaleString("ko-KR")}
            </p>
          </div>
        </div>

        {submission.image_url && (
          <div className="col-span-2 text-sm">
            <span className="text-gray-500">첨부 이미지</span>
            <div className="mt-2">
              <Image
                src={submission.image_url}
                alt="첨부 이미지"
                width={448}
                height={252}
                className="rounded border border-gray-200 max-w-full h-auto"
              />
            </div>
          </div>
        )}

        {submission.message && (
          <div className="text-sm">
            <span className="text-gray-500">신청자 메시지</span>
            <p className="mt-1 p-3 bg-gray-50 rounded-md whitespace-pre-wrap">
              {submission.message}
            </p>
          </div>
        )}

        {submission.admin_note && !isPending && (
          <div className="text-sm">
            <span className="text-gray-500">관리자 메모</span>
            <p className="mt-1 p-3 bg-gray-50 rounded-md">
              {submission.admin_note}
            </p>
          </div>
        )}
      </div>

      {/* 승인 시 편집 가능한 기사 내용 */}
      {isPending && (
        <>
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            기사 내용 (승인 시 발행)
          </h2>

          {/* AI 다듬기 섹션 */}
          <div className="bg-indigo-50 rounded-lg border border-indigo-200 p-5 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-indigo-900">
                AI 기사 다듬기
              </h3>
              <span className="text-xs text-indigo-500">
                Gemini AI가 뉴스 기사 스타일로 다듬어줍니다
              </span>
            </div>

            <button
              onClick={handleAiRefine}
              disabled={aiLoading}
              className="w-full px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {aiLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  AI가 기사를 다듬고 있습니다...
                </>
              ) : aiResult ? (
                "다시 생성하기"
              ) : (
                "AI로 기사 다듬기"
              )}
            </button>

            {aiError && (
              <div className="mt-3 px-3 py-2 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
                {aiError}
              </div>
            )}

            {/* AI 결과 미리보기 */}
            {aiResult && (
              <div className="mt-4 space-y-3">
                <div className="bg-white rounded-md border border-indigo-200 p-4 space-y-3">
                  <div>
                    <span className="text-xs font-medium text-indigo-600 uppercase tracking-wide">
                      AI 제목
                    </span>
                    <p className="mt-1 text-sm font-semibold text-gray-900">
                      {aiResult.title}
                    </p>
                  </div>
                  <hr className="border-indigo-100" />
                  <div>
                    <span className="text-xs font-medium text-indigo-600 uppercase tracking-wide">
                      AI 본문
                    </span>
                    <p className="mt-1 text-sm text-gray-800 whitespace-pre-wrap break-words leading-relaxed">
                      {aiResult.content}
                    </p>
                  </div>
                  <hr className="border-indigo-100" />
                  <div>
                    <span className="text-xs font-medium text-indigo-600 uppercase tracking-wide">
                      AI 요약
                    </span>
                    <p className="mt-1 text-sm text-gray-600">
                      {aiResult.excerpt}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleAiApply}
                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    적용하기
                  </button>
                  <button
                    onClick={handleAiDismiss}
                    className="px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    무시
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 space-y-4">
            <div>
              <label htmlFor="sub-title" className="block text-sm font-medium text-gray-700 mb-1">
                제목
              </label>
              <input
                id="sub-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="sub-content" className="block text-sm font-medium text-gray-700 mb-1">
                본문
              </label>
              <textarea
                id="sub-content"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={10}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none md:resize-y"
              />
            </div>
            <div>
              <label htmlFor="sub-excerpt" className="block text-sm font-medium text-gray-700 mb-1">
                요약 (미리보기용)
              </label>
              <textarea
                id="sub-excerpt"
                value={editExcerpt}
                onChange={(e) => setEditExcerpt(e.target.value)}
                rows={2}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none md:resize-y"
              />
            </div>
            <div>
              <label htmlFor="sub-admin-note" className="block text-sm font-medium text-gray-700 mb-1">
                관리자 메모 (선택, 반려 시 필수)
              </label>
              <textarea
                id="sub-admin-note"
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                rows={3}
                placeholder="승인/반려 사유를 입력하세요"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none md:resize-y"
              />
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="flex flex-col md:flex-row gap-3">
            <button
              onClick={() => handleAction("approve")}
              disabled={processing}
              className="px-6 py-2.5 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {processing ? "처리 중..." : "승인 (기사 발행)"}
            </button>
            <button
              onClick={() => handleAction("reject")}
              disabled={processing}
              className="px-6 py-2.5 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {processing ? "처리 중..." : "반려"}
            </button>
          </div>
        </>
      )}

      {/* 이미 처리된 경우 원본 표시 */}
      {!isPending && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-bold text-gray-900">신청 원본</h2>
          <div>
            <span className="text-sm text-gray-500">제목</span>
            <p className="font-medium">{submission.title}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">본문</span>
            <p className="mt-1 whitespace-pre-wrap text-sm">
              {submission.content}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

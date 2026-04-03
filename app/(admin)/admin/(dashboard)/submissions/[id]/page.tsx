"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { SubmissionRow, submissionCategoryLabels, SubmissionCategory } from "@/lib/types";

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

      // 2초 후 목록으로 이동
      setTimeout(() => router.push("/admin/submissions"), 2000);
    } catch {
      setMessage({ type: "error", text: "처리 중 오류가 발생했습니다." });
    } finally {
      setProcessing(false);
    }
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
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                제목
              </label>
              <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                본문
              </label>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={10}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                요약 (미리보기용)
              </label>
              <textarea
                value={editExcerpt}
                onChange={(e) => setEditExcerpt(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                관리자 메모 (선택, 반려 시 필수)
              </label>
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                rows={3}
                placeholder="승인/반려 사유를 입력하세요"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
              />
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="flex gap-3">
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

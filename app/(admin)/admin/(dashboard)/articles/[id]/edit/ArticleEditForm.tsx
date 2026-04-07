"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import {
  ArticleRow,
  SubmissionCategory,
  submissionCategoryLabels,
} from "@/lib/types";

const categories = Object.entries(submissionCategoryLabels) as [
  SubmissionCategory,
  string
][];

export default function ArticleEditForm() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<ArticleRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [category, setCategory] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const res = await fetch(`/api/admin/articles/${id}`);
        const data = await res.json();
        if (res.ok) {
          const a = data.article as ArticleRow;
          setArticle(a);
          setTitle(a.title);
          setContent(a.content);
          setExcerpt(a.excerpt || "");
          setCategory(a.category);
          setImageUrl(a.image_url || "");
        } else {
          setMessage({ type: "error", text: data.error || "기사를 불러오지 못했습니다." });
        }
      } catch {
        setMessage({ type: "error", text: "기사를 불러오는 중 오류가 발생했습니다." });
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/articles/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, excerpt, category, imageUrl: imageUrl || null }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: "error", text: data.error });
        return;
      }

      setMessage({ type: "success", text: "기사가 수정되었습니다." });
    } catch {
      setMessage({ type: "error", text: "수정 중 오류가 발생했습니다." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-500">불러오는 중...</div>;
  }

  if (!article) {
    return (
      <div className="text-center py-12 text-gray-500">
        기사를 찾을 수 없습니다.
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="text-gray-500 hover:text-gray-700 text-sm"
        >
          &larr; 목록으로
        </button>
        <h1 className="text-2xl font-bold text-gray-900">기사 수정</h1>
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

      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <div>
          <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700 mb-1">
            제목
          </label>
          <input
            id="edit-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="edit-category" className="block text-sm font-medium text-gray-700 mb-1">
            카테고리
          </label>
          <select
            id="edit-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categories.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="edit-excerpt" className="block text-sm font-medium text-gray-700 mb-1">
            요약
          </label>
          <textarea
            id="edit-excerpt"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={2}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none md:resize-y"
          />
        </div>
        <div>
          <label htmlFor="edit-content" className="block text-sm font-medium text-gray-700 mb-1">
            본문
          </label>
          <textarea
            id="edit-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={15}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none md:resize-y font-mono"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            이미지
          </label>
          {imageUrl && (
            <div className="mb-2">
              <Image
                src={imageUrl}
                alt="기사 이미지"
                width={320}
                height={180}
                className="rounded border border-gray-200 max-w-full h-auto"
              />
            </div>
          )}
          <div className="flex items-center gap-2">
            <label className="px-3 py-1.5 text-xs border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition-colors">
              {isUploading ? "업로드 중..." : "이미지 변경"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                disabled={isUploading}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setIsUploading(true);
                  try {
                    const form = new FormData();
                    form.append("image", file);
                    const res = await fetch("/api/upload/image", { method: "POST", body: form });
                    const data = await res.json();
                    if (res.ok) {
                      setImageUrl(data.imageUrl);
                    } else {
                      setMessage({ type: "error", text: data.error || "이미지 업로드 실패" });
                    }
                  } catch {
                    setMessage({ type: "error", text: "이미지 업로드 실패" });
                  } finally {
                    setIsUploading(false);
                    e.target.value = "";
                  }
                }}
              />
            </label>
            {imageUrl && (
              <button
                type="button"
                onClick={() => setImageUrl("")}
                className="text-xs text-red-500 hover:text-red-700"
              >
                이미지 제거
              </button>
            )}
          </div>
        </div>
        <div className="text-xs text-gray-400">
          슬러그: {article.slug} | 조회수: {article.view_count.toLocaleString()}{" "}
          | 발행일:{" "}
          {new Date(article.published_at).toLocaleString("ko-KR")}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3 mt-6">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? "저장 중..." : "저장"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors"
        >
          취소
        </button>
      </div>
    </div>
  );
}

"use client";

import { Suspense, useState } from "react";
import ReportedCommentsList from "./ReportedCommentsList";
import HiddenCommentsList from "./HiddenCommentsList";

type MainTab = "reports" | "hidden";

const mainTabs: { value: MainTab; label: string }[] = [
  { value: "reports", label: "신고 관리" },
  { value: "hidden", label: "AI 숨김" },
];

export default function CommentsPage() {
  const [activeTab, setActiveTab] = useState<MainTab>("reports");

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">댓글 관리</h1>

      {/* 메인 탭 */}
      <div role="tablist" className="flex gap-1 mb-6 border-b border-gray-200">
        {mainTabs.map((tab) => (
          <button
            key={tab.value}
            role="tab"
            aria-selected={activeTab === tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.value
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 콘텐츠 */}
      <Suspense
        fallback={
          <div className="text-center py-12 text-gray-500">불러오는 중...</div>
        }
      >
        {activeTab === "reports" ? (
          <ReportedCommentsList />
        ) : (
          <HiddenCommentsList />
        )}
      </Suspense>
    </div>
  );
}

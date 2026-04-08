"use client";

import Link from "next/link";
import CategoryNav from "./CategoryNav";
import SearchBar from "./SearchBar";
import LoginDropdown from "./LoginDropdown";

export default function Header() {
  const today = new Date();
  const dateString = today.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  return (
    <header className="border-b-2 border-ink-800 bg-parchment-100/90 relative z-10">
      {/* 상단 정보 바 */}
      <div className="border-b border-parchment-400 py-1">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-wrap justify-between items-center gap-y-1 text-xs text-ink-600">
            <span>당신의 특별한 순간을 뉴스로</span>
            <div className="hidden sm:flex items-center gap-3">
              <SearchBar />
              <span className="hidden md:inline">{dateString}</span>
              <LoginDropdown />
            </div>
            <div className="flex sm:hidden items-center">
              <LoginDropdown />
            </div>
            <div className="w-full sm:hidden">
              <SearchBar />
            </div>
          </div>
        </div>
      </div>

      {/* 메인 로고 */}
      <div className="py-6 text-center border-b border-parchment-400">
        <div className="container mx-auto px-4 max-w-6xl">
          <Link href="/" className="inline-block">
            <h1 className="headline-accent text-3xl sm:text-5xl md:text-7xl text-ink-800 mb-2">
              Daily TMI Post
            </h1>
          </Link>
          <p className="text-sm text-ink-600 italic font-body">
            &ldquo;Your Story, Our Headlines&rdquo;
          </p>
          <p className="text-xs text-ink-500 mt-1">
            {dateString}
          </p>
        </div>
      </div>

      {/* 카테고리 네비게이션 */}
      <CategoryNav />
    </header>
  );
}

"use client";

import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-2xl mx-auto text-center py-16 px-4">
      <div className="text-7xl mb-6">!</div>
      <h1 className="headline text-3xl md:text-4xl mb-4">
        앗! 페이지를 불러올 수 없습니다!
      </h1>
      <p className="text-ink-600 mb-2">
        페이지를 불러오는 중 오류가 발생했습니다.
      </p>
      <p className="text-sm text-ink-500 mb-8">
        {error.message || "알 수 없는 오류가 발생했습니다."}
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={reset}
          className="px-6 py-3 bg-accent-gold text-parchment-100 font-semibold hover:bg-accent-crimson transition-colors"
        >
          다시 시도
        </button>
        <Link
          href="/"
          className="px-6 py-3 border-2 border-ink-800 text-ink-800 font-semibold hover:bg-ink-800 hover:text-parchment-100 transition-colors"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}

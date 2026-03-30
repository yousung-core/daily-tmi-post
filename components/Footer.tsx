import Link from "next/link";
import {
  SubmissionCategory,
  submissionCategoryLabels,
} from "@/lib/types";

const categories: SubmissionCategory[] = [
  "finance",
  "life",
  "culture",
  "fitness",
  "people",
  "travel",
  "tech",
  "food",
];

export default function Footer() {
  return (
    <footer className="border-t-2 border-ink-800 bg-parchment-200/90 mt-8 relative z-10">
      <div className="container mx-auto px-4 max-w-6xl py-6">
        {/* 카테고리 링크 */}
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-3 text-sm mb-6">
          {categories.map((category, index) => (
            <span key={category} className="flex items-center">
              <Link
                href={`/articles/${category}`}
                className="text-ink-600 hover:text-accent-crimson transition-colors"
              >
                {submissionCategoryLabels[category]}
              </Link>
              {index < categories.length - 1 && (
                <span className="text-ink-400 ml-4">|</span>
              )}
            </span>
          ))}
        </div>

        {/* 구분선 */}
        <div className="border-t border-parchment-400 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-ink-500">
            {/* 회사 정보 */}
            <div className="text-center md:text-left">
              <p>
                <span className="font-semibold">Daily TMI Post</span>
                <span className="mx-2">|</span>
                Contact: daily.tmi@example.com
              </p>
            </div>

            {/* 저작권 */}
            <div className="text-center md:text-right">
              <p>&copy; {new Date().getFullYear()} Daily TMI Post. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

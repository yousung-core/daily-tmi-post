"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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

export default function CategoryNav() {
  const pathname = usePathname();

  return (
    <nav className="relative py-2 overflow-x-auto" role="navigation" aria-label="카테고리 네비게이션">
      <div className="container mx-auto px-4 max-w-6xl">
        <ul className="flex justify-center gap-1 md:gap-3 min-w-max">
          {categories.map((category) => (
            <li key={category}>
              <Link
                href={`/articles/${category}`}
                prefetch={false}
                className={`px-3 py-2.5 md:py-2 text-xs md:text-sm font-headline font-semibold tracking-wide transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-crimson focus-visible:ring-offset-2
                  ${pathname === `/articles/${category}`
                    ? "text-accent-crimson border-b-2 border-accent-crimson"
                    : "text-ink-700 hover:text-accent-crimson"
                  }`}
              >
                {submissionCategoryLabels[category]}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-parchment-100 to-transparent pointer-events-none sm:hidden" aria-hidden="true" />
    </nav>
  );
}

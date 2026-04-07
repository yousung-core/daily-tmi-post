import Link from "next/link";
import { searchArticles } from "@/lib/supabase";
import { submissionCategoryIcons, submissionCategoryLabels } from "@/lib/types";
import { getArticleUrl } from "@/lib/utils";

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    page?: string;
  }>;
}

export async function generateMetadata({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  return {
    title: q ? `"${q}" 검색 결과 | Daily TMI Post` : "검색 | Daily TMI Post",
  };
}

export const revalidate = 0;

const PAGE_SIZE = 12;

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q, page: pageParam } = await searchParams;
  const query = q?.trim() || "";
  const parsedPage = parseInt(pageParam || "1", 10);
  const currentPage = Number.isNaN(parsedPage) ? 1 : Math.max(1, parsedPage);

  if (!query) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">🔍</div>
        <h1 className="headline text-3xl mb-3">기사 검색</h1>
        <p className="text-ink-600">상단 검색창에 검색어를 입력해주세요</p>
      </div>
    );
  }

  const { articles, total } = await searchArticles(query, currentPage, PAGE_SIZE);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div>
      <nav className="mb-6">
        <Link
          href="/"
          className="text-sm text-ink-600 hover:text-accent-crimson transition-colors"
        >
          &larr; 홈으로 돌아가기
        </Link>
      </nav>

      <header className="text-center mb-8 pb-6 border-b-2 border-ink-800">
        <h1 className="headline text-3xl md:text-4xl mb-3">
          &ldquo;{query}&rdquo; 검색 결과
        </h1>
        <p className="text-ink-600">
          총 {total}개의 기사를 찾았습니다
        </p>
      </header>

      {articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <article
              key={article.id}
              className="article-card bg-parchment-100 border border-parchment-400 p-4 flex flex-col"
            >
              <div className="aspect-[16/10] bg-parchment-200 border border-parchment-300 flex items-center justify-center mb-3">
                <span className="text-4xl" role="img" aria-label={submissionCategoryLabels[article.category]}>{submissionCategoryIcons[article.category]}</span>
              </div>
              <Link href={getArticleUrl(article)} className="flex-1">
                <h3 className="headline text-lg mb-2 hover:text-accent-crimson transition-colors line-clamp-2">
                  {article.title}
                </h3>
              </Link>
              <p className="text-sm text-ink-600 mb-3 line-clamp-2">
                {article.excerpt}
              </p>
              <div className="flex items-center gap-2 text-xs text-ink-500 mt-auto pt-3 border-t border-parchment-300">
                <span>👁 {article.viewCount}</span>
                <span>·</span>
                <span>{new Date(article.publishedAt).toLocaleDateString("ko-KR")}</span>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-parchment-100 border border-parchment-400">
          <div className="text-4xl mb-4">📭</div>
          <p className="text-ink-600 mb-4">
            &ldquo;{query}&rdquo;에 대한 검색 결과가 없습니다
          </p>
          <Link href="/submit" className="text-accent-crimson hover:underline font-semibold">
            직접 기사를 작성해보세요 &rarr;
          </Link>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          {currentPage > 1 && (
            <Link
              href={`/search?q=${encodeURIComponent(query)}&page=${currentPage - 1}`}
              className="px-4 py-2 border-2 border-ink-800 text-ink-800 text-sm font-semibold hover:bg-ink-800 hover:text-parchment-100 transition-colors"
            >
              &larr; 이전
            </Link>
          )}
          <span className="px-4 py-2 text-sm text-ink-600">
            {currentPage} / {totalPages} 페이지
          </span>
          {currentPage < totalPages && (
            <Link
              href={`/search?q=${encodeURIComponent(query)}&page=${currentPage + 1}`}
              className="px-4 py-2 border-2 border-ink-800 text-ink-800 text-sm font-semibold hover:bg-ink-800 hover:text-parchment-100 transition-colors"
            >
              다음 &rarr;
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

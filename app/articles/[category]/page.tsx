import { notFound } from "next/navigation";
import Link from "next/link";
import { getArticlesByCategory, ArticleSortOption } from "@/lib/supabase";
import {
  SubmissionCategory,
  submissionCategoryLabels,
  submissionCategoryIcons,
} from "@/lib/types";
import { getArticleUrl } from "@/lib/utils";

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
  searchParams: Promise<{
    page?: string;
    sort?: string;
  }>;
}

const validCategories: SubmissionCategory[] = [
  "finance", "life", "culture", "fitness", "people", "travel", "tech", "food"
];

const PAGE_SIZE = 13; // 리드 1 + 그리드 12

export const dynamicParams = true;

export async function generateMetadata({ params }: CategoryPageProps) {
  const { category: categoryParam } = await params;
  if (!validCategories.includes(categoryParam as SubmissionCategory)) {
    return { title: "Category Not Found" };
  }
  const category = categoryParam as SubmissionCategory;
  return {
    title: submissionCategoryLabels[category],
    description: `${submissionCategoryLabels[category]} 관련 최신 기사`,
  };
}

export const revalidate = 60;

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { category: categoryParam } = await params;
  const { page: pageParam, sort: sortParam } = await searchParams;

  if (!validCategories.includes(categoryParam as SubmissionCategory)) {
    notFound();
  }

  const category = categoryParam as SubmissionCategory;
  const parsedPage = parseInt(pageParam || "1", 10);
  const currentPage = Number.isNaN(parsedPage) ? 1 : Math.max(1, parsedPage);
  const sort: ArticleSortOption = sortParam === "popular" ? "popular" : "latest";
  const { articles, total } = await getArticlesByCategory(category, currentPage, PAGE_SIZE, sort);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const leadArticle = articles[0] ?? null;
  const subArticles = articles.slice(1, 4);
  const gridArticles = articles.slice(4);

  // 페이지 번호 계산
  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }
  const pageNumbers = Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage + i
  );

  const sortUrl = (s: ArticleSortOption) =>
    `/articles/${category}?sort=${s}${currentPage > 1 ? `&page=${currentPage}` : ""}`;

  const pageUrl = (p: number) =>
    `/articles/${category}?sort=${sort}${p > 1 ? `&page=${p}` : ""}`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8">
      {/* 메인 콘텐츠 */}
      <div>
      {/* 리드 기사 영역 */}
      {leadArticle && currentPage === 1 ? (
        <section className="mb-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            {/* 리드 기사 */}
            <article className="article-card bg-parchment-100 border-2 border-ink-800 p-6 flex flex-col">
              <div className="aspect-[16/10] bg-parchment-200 border border-parchment-400 flex items-center justify-center mb-4">
                <div className="text-center text-ink-400">
                  <div className="text-6xl mb-2" role="img" aria-label={submissionCategoryLabels[leadArticle.category]}>
                    {submissionCategoryIcons[leadArticle.category]}
                  </div>
                  <p className="text-sm italic">{submissionCategoryLabels[leadArticle.category]}</p>
                </div>
              </div>
              <Link href={getArticleUrl(leadArticle)}>
                <h2 className="headline text-2xl md:text-3xl mb-3 hover:text-accent-crimson transition-colors">
                  {leadArticle.title}
                </h2>
              </Link>
              <p className="text-ink-600 mb-4 flex-1">{leadArticle.excerpt}</p>
              <div className="flex items-center gap-4 text-sm text-ink-500 mt-auto">
                <span>👁 {leadArticle.viewCount}</span>
                <span>{new Date(leadArticle.publishedAt).toLocaleDateString("ko-KR")}</span>
              </div>
            </article>

            {/* 서브 기사 */}
            <div className="bg-parchment-100 border border-parchment-400 p-6 flex flex-col justify-between">
              {subArticles.length > 0 ? (
                subArticles.map((article, index) => (
                  <article
                    key={article.id}
                    className={`article-card py-4 ${index !== 0 ? "border-t border-parchment-400" : "pt-0"} ${index === subArticles.length - 1 ? "pb-0" : ""}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="shrink-0 w-16 h-16 bg-parchment-200 border border-parchment-300 flex items-center justify-center">
                        <span className="text-2xl" role="img" aria-label={submissionCategoryLabels[article.category]}>{submissionCategoryIcons[article.category]}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link href={getArticleUrl(article)}>
                          <h3 className="headline text-base mb-1 hover:text-accent-crimson transition-colors line-clamp-2">
                            {article.title}
                          </h3>
                        </Link>
                        <div className="text-xs text-ink-500">
                          👁 {article.viewCount} · {new Date(article.publishedAt).toLocaleDateString("ko-KR")}
                        </div>
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <div className="flex items-center justify-center h-full text-ink-500 italic text-sm">
                  아직 더 많은 기사가 없습니다
                </div>
              )}
            </div>
          </div>
        </section>
      ) : null}

      {/* 정렬 + 기사 수 바 */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-ink-800">
        <span className="text-sm text-ink-500">
          총 <strong className="text-ink-800">{total}</strong>개의 기사
        </span>
        <div className="flex items-center gap-2 text-sm">
          <Link
            href={sortUrl("latest")}
            className={`px-4 py-2 font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-800 focus-visible:ring-offset-2 ${
              sort === "latest"
                ? "bg-ink-800 text-parchment-100"
                : "text-ink-600 hover:text-ink-800 border border-parchment-400"
            }`}
          >
            최신순
          </Link>
          <Link
            href={sortUrl("popular")}
            className={`px-4 py-2 font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-800 focus-visible:ring-offset-2 ${
              sort === "popular"
                ? "bg-ink-800 text-parchment-100"
                : "text-ink-600 hover:text-ink-800 border border-parchment-400"
            }`}
          >
            조회순
          </Link>
        </div>
      </div>

      {/* 기사 그리드 */}
      {(currentPage === 1 ? gridArticles : articles).length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(currentPage === 1 ? gridArticles : articles).map((article) => (
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
      ) : articles.length === 0 ? (
        <div className="text-center py-12 bg-parchment-100 border border-parchment-400">
          <div className="text-4xl mb-4">📭</div>
          <p className="text-ink-600 mb-4">
            아직 이 카테고리에 게시된 기사가 없습니다
          </p>
          <Link href="/submit" className="text-accent-crimson hover:underline font-semibold">
            첫 번째 기사를 작성해보세요 &rarr;
          </Link>
        </div>
      ) : null}

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <nav className="flex items-center justify-center gap-2 mt-10" aria-label="페이지네이션">
          {currentPage > 1 && (
            <Link
              href={pageUrl(currentPage - 1)}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center text-sm text-ink-600 hover:text-ink-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-800 focus-visible:ring-offset-2"
              aria-label="이전 페이지"
            >
              &larr;
            </Link>
          )}
          {startPage > 1 && (
            <>
              <Link
                href={pageUrl(1)}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center text-sm border border-parchment-400 text-ink-600 hover:bg-ink-800 hover:text-parchment-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-800 focus-visible:ring-offset-2"
              >
                1
              </Link>
              {startPage > 2 && (
                <span className="min-w-[44px] min-h-[44px] flex items-center justify-center text-sm text-ink-400">...</span>
              )}
            </>
          )}
          {pageNumbers.map((num) => (
            <Link
              key={num}
              href={pageUrl(num)}
              className={`min-w-[44px] min-h-[44px] flex items-center justify-center text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-800 focus-visible:ring-offset-2 ${
                num === currentPage
                  ? "bg-ink-800 text-parchment-100"
                  : "border border-parchment-400 text-ink-600 hover:bg-ink-800 hover:text-parchment-100"
              }`}
              aria-current={num === currentPage ? "page" : undefined}
            >
              {num}
            </Link>
          ))}
          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && (
                <span className="min-w-[44px] min-h-[44px] flex items-center justify-center text-sm text-ink-400">...</span>
              )}
              <Link
                href={pageUrl(totalPages)}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center text-sm border border-parchment-400 text-ink-600 hover:bg-ink-800 hover:text-parchment-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-800 focus-visible:ring-offset-2"
              >
                {totalPages}
              </Link>
            </>
          )}
          {currentPage < totalPages && (
            <Link
              href={pageUrl(currentPage + 1)}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center text-sm text-ink-600 hover:text-ink-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-800 focus-visible:ring-offset-2"
              aria-label="다음 페이지"
            >
              &rarr;
            </Link>
          )}
        </nav>
      )}

      {/* 기사 신청 유도 */}
      <div className="mt-12 p-6 bg-parchment-100 border-2 border-accent-gold text-center">
        <p className="text-ink-700 mb-3">
          {submissionCategoryIcons[category]} {submissionCategoryLabels[category]} 소식이 있으신가요?
        </p>
        <Link
          href={`/submit?category=${category}`}
          className="inline-block px-6 py-2 bg-accent-gold text-parchment-100 font-semibold hover:bg-accent-crimson transition-colors"
        >
          기사 신청하기
        </Link>
      </div>
      </div>

      {/* 사이드바 */}
      <aside className="hidden lg:block">
        <div className="sticky top-8 space-y-6">
          {/* 기사 신청 */}
          <div className="bg-parchment-100 border-2 border-accent-gold p-6 text-center">
            <div className="text-4xl mb-4">📰</div>
            <h3 className="headline-accent text-xl mb-3 text-ink-800">
              기사 신청하기
            </h3>
            <p className="text-sm text-ink-600 mb-4">
              당신의 특별한 순간을<br />
              뉴스로 만들어드립니다
            </p>
            <Link
              href={`/submit?category=${category}`}
              className="block w-full py-3 bg-accent-gold text-parchment-100 font-semibold hover:bg-accent-crimson transition-colors"
            >
              지금 신청하기
            </Link>
          </div>

        </div>
      </aside>
    </div>
  );
}

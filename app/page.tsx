import Link from "next/link";
import {
  submissionCategoryLabels,
  submissionCategoryIcons,
  SubmissionCategory,
} from "@/lib/types";
import { getLatestArticles, getFeaturedArticles, getArticleCount } from "@/lib/supabase";

export const revalidate = 60; // 60초마다 재검증

export default async function HomePage() {
  // 병렬로 실행하되, 개별 실패 시에도 페이지 렌더 가능
  const [countResult, latestResult, featuredResult] = await Promise.allSettled([
    getArticleCount(),
    getLatestArticles(6),
    getFeaturedArticles(5),
  ]);
  const articleCount = countResult.status === "fulfilled" ? countResult.value : 0;
  const latestArticles = latestResult.status === "fulfilled" ? latestResult.value : [];
  const featuredArticles = featuredResult.status === "fulfilled" ? featuredResult.value : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8">
      {/* 메인 콘텐츠 */}
      <div className="space-y-12">
        {/* 헤드라인 배너 */}
        <section className="fade-in py-4 border-b-2 border-ink-800">
          <p className="text-sm text-ink-600">
            📰 총 <strong>{articleCount}</strong>개의 특별한 이야기가 게시되었습니다
          </p>
        </section>

        {/* 메인 기사 (Featured) */}
        {featuredArticles.length > 0 ? (
          <section className="fade-in-delay-1">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
              {/* 대표 기사 */}
              <div className="flex flex-col">
                <div className="ornamental-divider mb-6">
                  <span className="px-4 headline-accent text-lg text-ink-600">MAIN TMI</span>
                </div>
                <article className="article-card bg-parchment-100 border-2 border-ink-800 p-6 flex-1 flex flex-col">
                  <div className="aspect-[16/10] bg-parchment-200 border border-parchment-400 flex items-center justify-center mb-4">
                    <div className="text-center text-ink-400">
                      <div className="text-5xl mb-2" role="img" aria-label={submissionCategoryLabels[featuredArticles[0].category]}>
                        {submissionCategoryIcons[featuredArticles[0].category]}
                      </div>
                      <p className="text-sm italic">Featured Article</p>
                    </div>
                  </div>
                  <span className="category-tag text-accent-crimson mb-2 inline-block">
                    {submissionCategoryLabels[featuredArticles[0].category]}
                  </span>
                  <Link href={`/news/${featuredArticles[0].slug}`}>
                    <h2 className="headline text-2xl md:text-3xl mb-3 hover:text-accent-crimson transition-colors">
                      {featuredArticles[0].title}
                    </h2>
                  </Link>
                  <p className="text-ink-600 mb-4 flex-1">{featuredArticles[0].excerpt}</p>
                  <div className="flex items-center gap-4 text-sm text-ink-500 mt-auto">
                    <span>👁 {featuredArticles[0].viewCount}</span>
                    <span>
                      {new Date(featuredArticles[0].publishedAt).toLocaleDateString("ko-KR")}
                    </span>
                  </div>
                </article>
              </div>

              {/* 서브 기사들 */}
              <div className="flex flex-col">
                <div className="ornamental-divider mb-6">
                  <span className="px-4 headline-accent text-lg text-ink-600">MORE TMI</span>
                </div>
                <div className="bg-parchment-100 border border-parchment-400 p-6 flex-1 flex flex-col justify-between">
                  {featuredArticles.slice(1, 5).map((article, index) => (
                    <article
                      key={article.id}
                      className={`article-card py-3 ${index !== 0 ? 'border-t border-parchment-400' : 'pt-0'} ${index === 3 ? 'pb-0' : ''}`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg" role="img" aria-label={submissionCategoryLabels[article.category]}>{submissionCategoryIcons[article.category]}</span>
                        <span className="category-tag text-xs text-accent-gold">
                          {submissionCategoryLabels[article.category]}
                        </span>
                      </div>
                      <Link href={`/news/${article.slug}`}>
                        <h3 className="headline text-base mb-1 hover:text-accent-crimson transition-colors line-clamp-1">
                          {article.title}
                        </h3>
                      </Link>
                      <div className="text-xs text-ink-500">
                        👁 {article.viewCount} · {new Date(article.publishedAt).toLocaleDateString("ko-KR")}
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section className="fade-in-delay-1">
            <div className="text-center py-12 bg-parchment-100 border border-parchment-400">
              <div className="text-6xl mb-4">📭</div>
              <h2 className="headline text-2xl mb-2">아직 게시된 기사가 없습니다</h2>
              <p className="text-ink-600 mb-4">첫 번째 기사의 주인공이 되어보세요!</p>
              <Link
                href="/submit"
                className="inline-block px-6 py-3 bg-accent-gold text-parchment-100 font-semibold hover:bg-accent-crimson transition-colors"
              >
                기사 신청하기
              </Link>
            </div>
          </section>
        )}

        {/* 최신 기사 목록 */}
        {latestArticles.length > 0 && (
          <section className="fade-in-delay-2">
            <div className="ornamental-divider mb-8">
              <span className="px-4 headline-accent text-lg text-ink-600">LATEST TMI</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestArticles.map((article) => (
                <article
                  key={article.id}
                  className="article-card bg-parchment-100 border border-parchment-400 p-4 flex flex-col"
                >
                  <div className="aspect-[16/10] bg-parchment-200 border border-parchment-300 flex items-center justify-center mb-3">
                    <span className="text-4xl" role="img" aria-label={submissionCategoryLabels[article.category]}>
                      {submissionCategoryIcons[article.category]}
                    </span>
                  </div>
                  <span className="category-tag text-xs text-accent-gold mb-2 inline-block self-start">
                    {submissionCategoryLabels[article.category]}
                  </span>
                  <Link href={`/news/${article.slug}`} className="flex-1">
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
          </section>
        )}
      </div>

      {/* 사이드바 */}
      <aside className="fade-in-delay-3 hidden lg:block">
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
            href="/submit"
            className="block w-full py-3 bg-accent-gold text-parchment-100 font-semibold hover:bg-accent-crimson transition-colors"
          >
            지금 신청하기
          </Link>
        </div>
      </aside>
    </div>
  );
}

import { notFound } from "next/navigation";
import Link from "next/link";
import { getPublishedArticlesByCategory } from "@/lib/mockArticles";
import {
  SubmissionCategory,
  submissionCategoryLabels,
  submissionCategoryIcons,
} from "@/lib/types";

interface CategoryPageProps {
  params: {
    category: string;
  };
}

const validCategories: SubmissionCategory[] = ["celebration", "event", "achievement", "other"];

export function generateStaticParams() {
  return validCategories.map((category) => ({
    category,
  }));
}

export function generateMetadata({ params }: CategoryPageProps) {
  if (!validCategories.includes(params.category as SubmissionCategory)) {
    return { title: "Category Not Found" };
  }
  const category = params.category as SubmissionCategory;
  return {
    title: `${submissionCategoryLabels[category]} | Daily TMI Post`,
    description: `${submissionCategoryLabels[category]} 관련 최신 기사`,
  };
}

export default function CategoryPage({ params }: CategoryPageProps) {
  if (!validCategories.includes(params.category as SubmissionCategory)) {
    notFound();
  }

  const category = params.category as SubmissionCategory;
  const articles = getPublishedArticlesByCategory(category);

  const categoryDescriptions: Record<SubmissionCategory, string> = {
    celebration: "결혼, 승진, 합격, 출산 등 축하할 일들",
    event: "생일, 기념일, 졸업 등 특별한 날들",
    achievement: "수상, 자격증 취득, 목표 달성 등 자랑스러운 성과",
    other: "자유롭게 작성된 특별한 이야기들",
  };

  return (
    <div>
      {/* 상단 네비게이션 */}
      <nav className="mb-6">
        <Link
          href="/"
          className="text-sm text-ink-600 hover:text-accent-crimson transition-colors"
        >
          &larr; 홈으로 돌아가기
        </Link>
      </nav>

      {/* 카테고리 헤더 */}
      <header className="text-center mb-8 pb-6 border-b-2 border-ink-800">
        <div className="text-6xl mb-4">{submissionCategoryIcons[category]}</div>
        <h1 className="headline text-4xl md:text-5xl mb-3">
          {submissionCategoryLabels[category]}
        </h1>
        <p className="text-ink-600 max-w-xl mx-auto">
          {categoryDescriptions[category]}
        </p>
      </header>

      {/* 기사 수 */}
      <div className="text-center mb-6">
        <span className="text-sm text-ink-500">
          총 {articles.length}개의 기사
        </span>
      </div>

      {/* 기사 목록 */}
      {articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <article
              key={article.id}
              className="article-card bg-parchment-100 border border-parchment-400 p-4 flex flex-col"
            >
              <div className="aspect-[16/10] bg-parchment-200 border border-parchment-300 flex items-center justify-center mb-3">
                <span className="text-4xl">{submissionCategoryIcons[article.category]}</span>
              </div>
              <Link href={`/news/${article.slug}`} className="flex-1">
                <h3 className="headline text-lg mb-2 hover:text-accent-crimson transition-colors line-clamp-2">
                  {article.title}
                </h3>
              </Link>
              <p className="text-sm text-ink-600 mb-3 line-clamp-2">
                {article.excerpt}
              </p>
              <div className="flex items-center gap-2 text-xs text-ink-500 mt-auto pt-3 border-t border-parchment-300">
                <span>👤 {article.protagonistName}</span>
                <span>·</span>
                <span>👁 {article.viewCount}</span>
                <span>·</span>
                <span>{new Date(article.createdAt).toLocaleDateString("ko-KR")}</span>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-parchment-100 border border-parchment-400">
          <div className="text-4xl mb-4">📭</div>
          <p className="text-ink-600 mb-4">
            아직 이 카테고리에 게시된 기사가 없습니다
          </p>
          <Link href="/submit" className="text-accent-crimson hover:underline font-semibold">
            첫 번째 기사를 작성해보세요 &rarr;
          </Link>
        </div>
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

      {/* 하단 네비게이션 */}
      <div className="text-center mt-8">
        <Link href="/" className="btn-vintage inline-block">
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}

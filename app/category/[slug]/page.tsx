import { notFound } from "next/navigation";
import Link from "next/link";
import { getArticlesByCategory, getAllCategories } from "@/lib/articles";
import { Category, categoryLabels, categoryLabelsEn } from "@/lib/types";
import ArticleList from "@/components/ArticleList";

interface CategoryPageProps {
  params: {
    slug: string;
  };
}

export function generateStaticParams() {
  const categories = getAllCategories();
  return categories.map((category) => ({
    slug: category,
  }));
}

export function generateMetadata({ params }: CategoryPageProps) {
  const categories = getAllCategories();
  if (!categories.includes(params.slug as Category)) {
    return { title: "Category Not Found" };
  }
  const category = params.slug as Category;
  return {
    title: `${categoryLabelsEn[category]} | Daily TMI Post`,
    description: `${categoryLabels[category]} 관련 최신 기사`,
  };
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const categories = getAllCategories();

  if (!categories.includes(params.slug as Category)) {
    notFound();
  }

  const category = params.slug as Category;
  const articles = getArticlesByCategory(category);

  // 카테고리별 설명
  const categoryDescriptions: Record<Category, string> = {
    ministry: "마법부의 공식 발표, 정책 변화, 그리고 정부 관련 소식",
    quidditch: "프로 퀴디치 리그 소식, 경기 결과, 선수 인터뷰",
    hogwarts: "호그와트 마법학교의 최신 소식과 학교 행사",
    "dark-arts": "어둠의 마법 관련 사건, 단속 소식, 경고",
    creatures: "마법 생물 발견, 보호 활동, 관련 연구",
    opinion: "전문가 기고, 사설, 독자 투고",
  };

  return (
    <div>
      {/* 상단 네비게이션 */}
      <nav className="mb-6">
        <Link
          href="/"
          className="text-sm text-ink-600 hover:text-accent-crimson transition-colors"
        >
          &larr; Back to Home
        </Link>
      </nav>

      {/* 카테고리 헤더 */}
      <header className="text-center mb-8 pb-6 border-b-2 border-ink-800">
        <div className="category-tag text-accent-gold mb-4 inline-block text-sm">
          CATEGORY
        </div>
        <h1 className="headline text-4xl md:text-5xl mb-3">
          {categoryLabelsEn[category]}
        </h1>
        <p className="text-lg text-ink-600 italic">
          {categoryLabels[category]}
        </p>
        <p className="text-sm text-ink-500 mt-2 max-w-xl mx-auto">
          {categoryDescriptions[category]}
        </p>
      </header>

      {/* 기사 수 */}
      <div className="text-center mb-6">
        <span className="text-sm text-ink-500">
          {articles.length}개의 기사
        </span>
      </div>

      {/* 기사 목록 */}
      <ArticleList articles={articles} showFeatured={false} />

      {/* 하단 네비게이션 */}
      <div className="text-center mt-12">
        <Link href="/" className="btn-vintage inline-block">
          Return to Front Page
        </Link>
      </div>
    </div>
  );
}

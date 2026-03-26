import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getPublishedArticleBySlug,
  getAllPublishedArticles,
} from "@/lib/mockArticles";
import { submissionCategoryLabels, submissionCategoryIcons } from "@/lib/types";
import ShareButtons from "@/components/ShareButtons";

interface NewsPageProps {
  params: {
    slug: string;
  };
}

export function generateStaticParams() {
  const articles = getAllPublishedArticles();
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

export function generateMetadata({ params }: NewsPageProps) {
  const article = getPublishedArticleBySlug(params.slug);
  if (!article) {
    return { title: "Article Not Found" };
  }
  return {
    title: `${article.title} | Daily TMI Post`,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: "article",
    },
  };
}

export default function NewsPage({ params }: NewsPageProps) {
  const article = getPublishedArticleBySlug(params.slug);

  if (!article) {
    notFound();
  }

  const formattedDate = new Date(article.createdAt).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  // 콘텐츠를 단락으로 분리
  const paragraphs = article.content.split("\n\n").filter(Boolean);

  return (
    <article className="max-w-3xl mx-auto">
      {/* 상단 네비게이션 */}
      <nav className="mb-6">
        <Link
          href="/"
          className="text-sm text-ink-600 hover:text-accent-crimson transition-colors"
        >
          &larr; 홈으로 돌아가기
        </Link>
      </nav>

      {/* 기사 헤더 */}
      <header className="text-center mb-8 pb-6 border-b-2 border-ink-800">
        {/* 카테고리 */}
        <Link
          href={`/articles/${article.category}`}
          className="category-tag text-accent-crimson hover:bg-accent-crimson hover:text-parchment-100 transition-colors mb-4 inline-block"
        >
          {submissionCategoryIcons[article.category]} {submissionCategoryLabels[article.category]}
        </Link>

        {/* 제목 */}
        <h1 className="headline text-3xl md:text-4xl lg:text-5xl mb-4 leading-tight">
          {article.title}
        </h1>

        {/* 발췌문 */}
        <p className="text-lg text-ink-600 italic mb-6">
          {article.excerpt}
        </p>

        {/* 메타 정보 */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4 text-sm text-ink-500">
          <span className="font-semibold">👤 {article.protagonistName}</span>
          <span className="hidden md:inline">|</span>
          <time dateTime={article.createdAt}>{formattedDate}</time>
          <span className="hidden md:inline">|</span>
          <span>👁 조회수 {article.viewCount}</span>
        </div>
      </header>

      {/* 이미지 */}
      <figure className="mb-8">
        <div className="aspect-[16/9] bg-parchment-200 border-2 border-parchment-400 flex items-center justify-center">
          <div className="text-center text-ink-400">
            <div className="text-7xl mb-2">
              {submissionCategoryIcons[article.category]}
            </div>
            <p className="text-sm italic">{submissionCategoryLabels[article.category]}</p>
          </div>
        </div>
        <figcaption className="text-center text-xs text-ink-500 mt-2 italic">
          Daily TMI Post
        </figcaption>
      </figure>

      {/* 기사 본문 */}
      <div className="prose prose-lg max-w-none">
        {paragraphs.map((paragraph, index) => {
          // 마크다운 굵은 텍스트 처리
          const processedText = paragraph.replace(
            /\*\*(.*?)\*\*/g,
            '<strong>$1</strong>'
          );

          // 첫 단락에 드롭캡 적용
          if (index === 0) {
            return (
              <p
                key={index}
                className="drop-cap text-lg leading-relaxed mb-4"
                dangerouslySetInnerHTML={{ __html: processedText }}
              />
            );
          }

          // 인용문 (따옴표로 시작하는 줄)
          if (paragraph.startsWith('"') || paragraph.startsWith('"')) {
            return (
              <blockquote
                key={index}
                className="border-l-4 border-accent-gold pl-4 italic my-6 text-ink-600"
                dangerouslySetInnerHTML={{ __html: processedText }}
              />
            );
          }

          // 일반 단락
          return (
            <p
              key={index}
              className="text-lg leading-relaxed mb-4 text-ink-700"
              dangerouslySetInnerHTML={{ __html: processedText }}
            />
          );
        })}
      </div>

      {/* 공유 버튼 */}
      <div className="mt-12 py-6 border-t border-b border-parchment-400">
        <ShareButtons
          title={article.title}
          url={`https://dailytmipost.com/news/${article.slug}`}
          description={article.excerpt}
        />
      </div>

      {/* CTA */}
      <div className="mt-8 p-6 bg-parchment-100 border-2 border-accent-gold text-center">
        <p className="text-ink-700 mb-3">
          ✨ 당신의 특별한 순간도 뉴스로 만들어보세요!
        </p>
        <Link
          href="/submit"
          className="inline-block px-6 py-2 bg-accent-gold text-parchment-100 font-semibold hover:bg-accent-crimson transition-colors"
        >
          기사 신청하기
        </Link>
      </div>

      {/* 하단 구분선 */}
      <div className="ornamental-divider mt-8 mb-8">
        <span className="text-2xl">&#x2767;</span>
      </div>

      {/* 하단 네비게이션 */}
      <footer className="text-center">
        <Link href="/" className="btn-vintage inline-block">
          홈으로 돌아가기
        </Link>
      </footer>
    </article>
  );
}

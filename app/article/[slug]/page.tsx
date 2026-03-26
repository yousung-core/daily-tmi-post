import { notFound } from "next/navigation";
import Link from "next/link";
import { getArticleBySlug, getAllArticles } from "@/lib/articles";
import { categoryLabelsEn } from "@/lib/types";
import ShareButtons from "@/components/ShareButtons";

interface ArticlePageProps {
  params: {
    slug: string;
  };
}

export function generateStaticParams() {
  const articles = getAllArticles();
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

export function generateMetadata({ params }: ArticlePageProps) {
  const article = getArticleBySlug(params.slug);
  if (!article) {
    return { title: "Article Not Found" };
  }
  return {
    title: `${article.title} | Daily TMI Post`,
    description: article.excerpt,
  };
}

export default function ArticlePage({ params }: ArticlePageProps) {
  const article = getArticleBySlug(params.slug);

  if (!article) {
    notFound();
  }

  const formattedDate = new Date(article.publishedAt).toLocaleDateString("ko-KR", {
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
          &larr; Back to Home
        </Link>
      </nav>

      {/* 기사 헤더 */}
      <header className="text-center mb-8 pb-6 border-b-2 border-ink-800">
        {/* 카테고리 */}
        <Link
          href={`/category/${article.category}`}
          className="category-tag text-accent-crimson hover:bg-accent-crimson hover:text-parchment-100 transition-colors mb-4 inline-block"
        >
          {categoryLabelsEn[article.category]}
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
          <span className="font-semibold">By {article.author}</span>
          <span className="hidden md:inline">|</span>
          <time dateTime={article.publishedAt}>{formattedDate}</time>
        </div>
      </header>

      {/* 이미지 */}
      <figure className="mb-8">
        <div className="aspect-[16/9] bg-parchment-200 border-2 border-parchment-400 flex items-center justify-center">
          <div className="text-center text-ink-400">
            <div className="text-6xl mb-2">&#x1F4F0;</div>
            <p className="text-sm italic">Article Image</p>
          </div>
        </div>
        <figcaption className="text-center text-xs text-ink-500 mt-2 italic">
          Daily TMI Post Archive
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

          // 소제목 (** 로 시작하는 줄)
          if (paragraph.startsWith("**") && paragraph.endsWith("**")) {
            return (
              <h2 key={index} className="headline text-xl mt-8 mb-4 text-ink-800">
                {paragraph.replace(/\*\*/g, "")}
              </h2>
            );
          }

          // 리스트 아이템
          if (paragraph.startsWith("-") || paragraph.match(/^\d+\./)) {
            const items = paragraph.split("\n").filter(Boolean);
            return (
              <ul key={index} className="list-disc list-inside mb-4 space-y-1">
                {items.map((item, i) => (
                  <li
                    key={i}
                    className="text-ink-700"
                    dangerouslySetInnerHTML={{
                      __html: item
                        .replace(/^[-\d.]+\s*/, "")
                        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>"),
                    }}
                  />
                ))}
              </ul>
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
          url={`https://dailytmipost.com/article/${article.slug}`}
          description={article.excerpt}
        />
      </div>

      {/* 하단 구분선 */}
      <div className="ornamental-divider mt-8 mb-8">
        <span className="text-2xl">&#x2767;</span>
      </div>

      {/* 하단 네비게이션 */}
      <footer className="text-center">
        <Link href="/" className="btn-vintage inline-block">
          Return to Front Page
        </Link>
      </footer>
    </article>
  );
}

import Link from "next/link";
import { Article, categoryLabels, categoryLabelsEn } from "@/lib/types";

interface ArticleCardProps {
  article: Article;
  featured?: boolean;
}

export default function ArticleCard({ article, featured = false }: ArticleCardProps) {
  const formattedDate = new Date(article.publishedAt).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  if (featured) {
    return (
      <article className="article-card bg-parchment-100 border-2 border-ink-800 p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* 이미지 영역 */}
          <div className="md:w-1/2">
            <div className="aspect-[4/3] bg-parchment-300 border border-parchment-400 flex items-center justify-center">
              <div className="text-center text-ink-500">
                <div className="text-4xl mb-2">&#x1F4F0;</div>
                <p className="text-sm italic">Image Placeholder</p>
              </div>
            </div>
          </div>

          {/* 콘텐츠 영역 */}
          <div className="md:w-1/2 flex flex-col justify-center">
            <div className="mb-2">
              <Link
                href={`/category/${article.category}`}
                className="category-tag text-accent-crimson hover:bg-accent-crimson hover:text-parchment-100 transition-colors"
              >
                {categoryLabelsEn[article.category]}
              </Link>
            </div>

            <Link href={`/article/${article.slug}`}>
              <h2 className="headline text-2xl md:text-3xl mb-3 hover:text-accent-crimson transition-colors">
                {article.title}
              </h2>
            </Link>

            <p className="text-ink-600 mb-4 line-clamp-3">
              {article.excerpt}
            </p>

            <div className="flex items-center gap-4 text-sm text-ink-500">
              <span className="font-semibold">{article.author}</span>
              <span>|</span>
              <time dateTime={article.publishedAt}>{formattedDate}</time>
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="article-card bg-parchment-100 border border-parchment-400 p-4 h-full flex flex-col">
      {/* 이미지 영역 */}
      <div className="aspect-[16/10] bg-parchment-200 border border-parchment-300 flex items-center justify-center mb-4">
        <div className="text-center text-ink-400">
          <div className="text-2xl mb-1">&#x1F4F0;</div>
          <p className="text-xs italic">Image</p>
        </div>
      </div>

      {/* 카테고리 */}
      <div className="mb-2">
        <Link
          href={`/category/${article.category}`}
          className="category-tag text-xs text-accent-gold hover:bg-accent-gold hover:text-parchment-100 transition-colors"
        >
          {categoryLabelsEn[article.category]}
        </Link>
      </div>

      {/* 제목 */}
      <Link href={`/article/${article.slug}`} className="flex-1">
        <h3 className="headline text-lg mb-2 hover:text-accent-crimson transition-colors line-clamp-2">
          {article.title}
        </h3>
      </Link>

      {/* 발췌문 */}
      <p className="text-sm text-ink-600 mb-3 line-clamp-2">
        {article.excerpt}
      </p>

      {/* 메타 정보 */}
      <div className="flex items-center gap-2 text-xs text-ink-500 mt-auto pt-3 border-t border-parchment-300">
        <span>{article.author}</span>
        <span>&#x2022;</span>
        <time dateTime={article.publishedAt}>{formattedDate}</time>
      </div>
    </article>
  );
}

import { Article } from "@/lib/types";
import ArticleCard from "./ArticleCard";

interface ArticleListProps {
  articles: Article[];
  showFeatured?: boolean;
}

export default function ArticleList({ articles, showFeatured = true }: ArticleListProps) {
  const featuredArticles = articles.filter((a) => a.featured);
  const regularArticles = showFeatured
    ? articles.filter((a) => !a.featured)
    : articles;

  return (
    <div className="space-y-8">
      {/* Featured 기사 */}
      {showFeatured && featuredArticles.length > 0 && (
        <section>
          <div className="ornamental-divider mb-6">
            <span className="px-4 headline text-lg text-ink-600">FEATURED</span>
          </div>
          <div className="space-y-6">
            {featuredArticles.map((article) => (
              <ArticleCard key={article.id} article={article} featured />
            ))}
          </div>
        </section>
      )}

      {/* 일반 기사 */}
      {regularArticles.length > 0 && (
        <section>
          <div className="ornamental-divider mb-6">
            <span className="px-4 headline text-lg text-ink-600">LATEST NEWS</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </section>
      )}

      {articles.length === 0 && (
        <div className="text-center py-12">
          <p className="text-ink-500 italic">No articles found.</p>
        </div>
      )}
    </div>
  );
}

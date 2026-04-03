import { Suspense } from "react";
import ArticlesList from "./ArticlesList";

export default function ArticlesPage() {
  return (
    <Suspense
      fallback={
        <div className="text-center py-12 text-gray-500">불러오는 중...</div>
      }
    >
      <ArticlesList />
    </Suspense>
  );
}

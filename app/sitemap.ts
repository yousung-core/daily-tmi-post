import { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";
import { SubmissionCategory, submissionCategoryLabels } from "@/lib/types";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  // 정적 페이지
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/submit`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  // 카테고리 페이지
  const categories = Object.keys(
    submissionCategoryLabels
  ) as SubmissionCategory[];
  const categoryPages: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${baseUrl}/articles/${cat}`,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  // 기사 페이지 (Supabase에서 조회)
  const { data } = await supabase
    .from("articles")
    .select("slug, published_at")
    .order("published_at", { ascending: false });

  const articlePages: MetadataRoute.Sitemap = (data ?? []).map((article) => ({
    url: `${baseUrl}/news/${article.slug}`,
    lastModified: new Date(article.published_at),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticPages, ...categoryPages, ...articlePages];
}

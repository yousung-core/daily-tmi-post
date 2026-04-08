import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getArticleBySlug, incrementViewCount } from "@/lib/supabase";
import { submissionCategoryLabels, submissionCategoryIcons } from "@/lib/types";
import { parseBoldMarkdown } from "@/lib/markdown";
import ShareButtons from "@/components/ShareButtons";
import ArticleReactions from "@/components/reactions/ArticleReactions";
import CommentSection from "@/components/comments/CommentSection";
import { captureError } from "@/lib/logger";
import { siteUrl } from "@/lib/env";
import { getArticleUrl, getArticleFullUrl } from "@/lib/utils";

interface NewsPageProps {
  params: Promise<{
    category: string;
    date: string;
    slug: string;
  }>;
}

// 동적 라우트 - 빌드 시 Supabase 호출 제거
// 개별 페이지는 요청 시 동적으로 생성됨
export const dynamicParams = true;

export async function generateMetadata({ params }: NewsPageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) {
    return { title: "Article Not Found" };
  }

  const canonicalUrl = getArticleFullUrl(siteUrl, article);
  const ogImageUrl = `${canonicalUrl}/opengraph-image`;

  return {
    title: article.title,
    description: article.excerpt,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: "article",
      url: canonicalUrl,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt,
      images: [ogImageUrl],
    },
  };
}

export const revalidate = 60;

export default async function NewsPage({ params }: NewsPageProps) {
  const { category, date, slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  // URL의 category/date가 실제 기사와 불일치하면 정규 URL로 리다이렉트
  const canonicalPath = getArticleUrl(article);
  const currentPath = `/news/${category}/${date}/${slug}`;
  if (canonicalPath !== currentPath) {
    redirect(canonicalPath);
  }

  // 조회수 증가 (fire-and-forget, 에러 시 로깅만)
  incrementViewCount(article.id).catch((err) =>
    captureError("viewCount", err, { articleId: article.id })
  );

  const formattedDate = new Date(article.publishedAt).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  // 콘텐츠를 단락으로 분리
  const paragraphs = article.content.split(/\n{1,2}/).filter(Boolean);

  const articleFullUrl = getArticleFullUrl(siteUrl, article);

  const ogImageUrl = `${articleFullUrl}/opengraph-image`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.excerpt,
    datePublished: article.publishedAt,
    image: {
      "@type": "ImageObject",
      url: ogImageUrl,
      width: 1200,
      height: 630,
    },
    author: {
      "@type": "Organization",
      name: "Daily TMI Post",
    },
    publisher: {
      "@type": "Organization",
      name: "Daily TMI Post",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": articleFullUrl,
    },
  };

  return (
    <article className="max-w-3xl mx-auto">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
          <span aria-hidden="true">{submissionCategoryIcons[article.category]}</span> {submissionCategoryLabels[article.category]}
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
          <time dateTime={article.publishedAt}>{formattedDate}</time>
          <span className="hidden md:inline">|</span>
          <span>👁 조회수 {article.viewCount}</span>
        </div>
      </header>

      {/* 이미지 */}
      <figure className="mb-8">
        {article.imageUrl ? (
          <div className="aspect-[4/3] sm:aspect-[16/9] border-2 border-parchment-400 overflow-hidden rounded relative">
            <Image
              src={article.imageUrl}
              alt={article.title}
              fill
              sizes="(max-width: 768px) 100vw, 800px"
              className="object-cover"
            />
          </div>
        ) : (
          <div className="aspect-[4/3] sm:aspect-[16/9] bg-parchment-200 border-2 border-parchment-400 flex items-center justify-center">
            <div className="text-center text-ink-400">
              <div className="text-7xl mb-2" role="img" aria-label={submissionCategoryLabels[article.category]}>
                {submissionCategoryIcons[article.category]}
              </div>
              <p className="text-sm italic">{submissionCategoryLabels[article.category]}</p>
            </div>
          </div>
        )}
        <figcaption className="text-center text-xs text-ink-500 mt-2 italic">
          Daily TMI Post
        </figcaption>
      </figure>

      {/* 기사 본문 */}
      <div className="prose prose-lg max-w-none">
        {paragraphs.map((paragraph, index) => {
          // 첫 단락에 드롭캡 적용
          // 인용문 (따옴표로 시작하는 줄)
          if (paragraph.startsWith('"') || paragraph.startsWith('\u201C')) {
            return (
              <blockquote
                key={index}
                className="border-l-4 border-accent-gold pl-4 italic my-6 text-ink-600"
              >
                {parseBoldMarkdown(paragraph)}
              </blockquote>
            );
          }

          // 일반 단락
          return (
            <p key={index} className="text-lg leading-relaxed mb-4 text-ink-700">
              {parseBoldMarkdown(paragraph)}
            </p>
          );
        })}
      </div>

      {/* 공유 버튼 */}
      <div className="mt-12 py-6 border-t border-b border-parchment-400">
        <ShareButtons
          title={article.title}
          url={articleFullUrl}
          description={article.excerpt}
        />
      </div>

      {/* 리액션 */}
      <ArticleReactions articleId={article.id} />

      {/* 댓글 */}
      <CommentSection articleId={article.id} />

      {/* CTA */}
      <div className="mt-8 p-4 sm:p-6 bg-parchment-100 border-2 border-accent-gold text-center">
        <p className="text-ink-700 mb-3">
          당신의 특별한 순간도 뉴스로 만들어보세요!
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

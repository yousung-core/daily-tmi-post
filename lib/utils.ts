import type { PublishedArticle } from './types'

type ArticleForUrl = Pick<PublishedArticle, 'slug' | 'category' | 'publishedAt'>

export function getArticleUrl(article: ArticleForUrl): string {
  const d = new Date(article.publishedAt)
  const yyyymmdd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
  return `/news/${article.category}/${yyyymmdd}/${article.slug}`
}

export function getArticleFullUrl(
  baseSiteUrl: string,
  article: ArticleForUrl
): string {
  return `${baseSiteUrl}${getArticleUrl(article)}`
}

import { createClient } from '@supabase/supabase-js'
import {
  Submission,
  SubmissionRow,
  PublishedArticle,
  ArticleRow,
  SubmissionCategory
} from './types'
import { captureError } from './logger'
import { getSupabaseUrl, getSupabaseAnonKey } from './env'

// 타임아웃 설정 (5초)
export const supabase = createClient(getSupabaseUrl(), getSupabaseAnonKey(), {
  global: {
    fetch: (url, options = {}) => {
      return fetch(url, {
        ...options,
        signal: AbortSignal.timeout(5000),
      })
    },
  },
})

// ==========================================
// Submission 변환 함수
// ==========================================

// 프론트엔드 → DB (저장 시)
export function toSubmissionRow(
  data: Omit<Submission, 'id' | 'status' | 'adminNote' | 'createdAt' | 'updatedAt'>
): Omit<SubmissionRow, 'id' | 'status' | 'admin_note' | 'created_at' | 'updated_at'> {
  return {
    email: data.email,
    category: data.category,
    title: data.title,
    event_date: data.eventDate,
    location: data.location ?? null,
    content: data.content,
    message: data.message ?? null,
    image_url: data.imageUrl ?? null,
  }
}

// DB → 프론트엔드 (조회 시)
export function toSubmission(row: SubmissionRow): Submission {
  return {
    id: row.id,
    email: row.email,
    category: row.category as SubmissionCategory,
    title: row.title,
    eventDate: row.event_date,
    location: row.location ?? undefined,
    content: row.content,
    message: row.message ?? undefined,
    imageUrl: row.image_url ?? undefined,
    status: row.status as Submission['status'],
    adminNote: row.admin_note ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

// ==========================================
// Article 변환 함수
// ==========================================

// DB → 프론트엔드 (조회 시)
export function toArticle(row: ArticleRow): PublishedArticle {
  return {
    id: row.id,
    submissionId: row.submission_id,
    slug: row.slug,
    title: row.title,
    content: row.content,
    excerpt: row.excerpt ?? '',
    category: row.category as SubmissionCategory,
    imageUrl: row.image_url ?? undefined,
    viewCount: row.view_count,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

// ==========================================
// Article 조회 함수
// ==========================================

export async function getLatestArticles(limit = 6): Promise<PublishedArticle[]> {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .order('published_at', { ascending: false })
    .limit(limit)

  if (error) {
    captureError('supabase.getLatestArticles', error)
    throw new Error(`기사 목록을 불러오지 못했습니다: ${error.message}`)
  }
  return (data ?? []).map(toArticle)
}

export async function getArticleCount(): Promise<number> {
  const { count, error } = await supabase
    .from('articles')
    .select('*', { count: 'exact', head: true })

  if (error) {
    captureError('supabase.getArticleCount', error)
    throw new Error(`기사 수를 불러오지 못했습니다: ${error.message}`)
  }
  return count ?? 0
}

export async function getArticleBySlug(slug: string): Promise<PublishedArticle | null> {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) {
    // PGRST116 = row not found (single() with no result)
    if (error.code === 'PGRST116') return null
    captureError('supabase.getArticleBySlug', error, { slug })
    throw new Error(`기사를 불러오지 못했습니다: ${error.message}`)
  }
  return data ? toArticle(data) : null
}

export type ArticleSortOption = 'latest' | 'popular'

export async function getArticlesByCategory(
  category: SubmissionCategory,
  page = 1,
  pageSize = 12,
  sort: ArticleSortOption = 'latest'
): Promise<{ articles: PublishedArticle[]; total: number }> {
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const orderColumn = sort === 'popular' ? 'view_count' : 'published_at'

  const { data, error, count } = await supabase
    .from('articles')
    .select('*', { count: 'exact' })
    .eq('category', category)
    .order(orderColumn, { ascending: false })
    .range(from, to)

  if (error) {
    captureError('supabase.getArticlesByCategory', error, { category, page, sort })
    throw new Error(`카테고리별 기사를 불러오지 못했습니다: ${error.message}`)
  }
  return {
    articles: (data ?? []).map(toArticle),
    total: count ?? 0,
  }
}

export async function getFeaturedArticles(limit = 5): Promise<PublishedArticle[]> {
  // 서버사이드 RPC 스코어링 시도
  const { data: rpcData, error: rpcError } = await supabase
    .rpc('get_featured_articles', { p_limit: limit })

  if (!rpcError && rpcData) {
    return (rpcData as ArticleRow[]).map(toArticle)
  }

  // RPC 미존재 또는 실패 시 JS 폴백
  if (rpcError) {
    captureError('supabase.getFeaturedArticles.rpc', rpcError)
  }

  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .order('published_at', { ascending: false })
    .limit(50)

  if (error) {
    captureError('supabase.getFeaturedArticles', error)
    throw new Error(`추천 기사를 불러오지 못했습니다: ${error.message}`)
  }

  const now = Date.now()
  const HALF_LIFE_DAYS = 7
  const lambda = Math.LN2 / HALF_LIFE_DAYS

  return (data ?? [])
    .map(row => {
      const publishedTime = new Date(row.published_at).getTime()
      const ageInDays = (now - publishedTime) / (1000 * 60 * 60 * 24)
      const score = (row.view_count ?? 0) * Math.exp(-lambda * ageInDays)
      return { row, score, publishedTime }
    })
    .sort((a, b) => b.score - a.score || b.publishedTime - a.publishedTime)
    .slice(0, limit)
    .map(({ row }) => toArticle(row))
}

export async function searchArticles(
  query: string,
  page = 1,
  pageSize = 12
): Promise<{ articles: PublishedArticle[]; total: number }> {
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  // PostgREST 예약 문자 + Postgres FTS 연산자 제거
  const sanitized = query.replace(/[,(). &|!<>:*'"\\]/g, ' ').replace(/\s+/g, ' ').trim()
  if (!sanitized) {
    return { articles: [], total: 0 }
  }

  // Full-Text Search 시도 (GIN 인덱스 활용)
  // type: 'plain'은 plainto_tsquery()를 사용하므로 평문 그대로 전달
  const { data, error, count } = await supabase
    .from('articles')
    .select('*', { count: 'exact' })
    .textSearch('search_vector', sanitized, { type: 'plain', config: 'simple' })
    .order('published_at', { ascending: false })
    .range(from, to)

  if (!error) {
    return {
      articles: (data ?? []).map(toArticle),
      total: count ?? 0,
    }
  }

  // FTS 실패 시 ILIKE fallback (search_vector 컬럼 미존재 등)
  captureError('supabase.searchArticles.fts', error, { query })
  const pattern = `%${sanitized}%`

  const fallback = await supabase
    .from('articles')
    .select('*', { count: 'exact' })
    .or(`title.ilike.${pattern},excerpt.ilike.${pattern},content.ilike.${pattern}`)
    .order('published_at', { ascending: false })
    .range(from, to)

  if (fallback.error) {
    captureError('supabase.searchArticles.ilike', fallback.error, { query })
    throw new Error(`검색 중 오류가 발생했습니다: ${fallback.error.message}`)
  }
  return {
    articles: (fallback.data ?? []).map(toArticle),
    total: fallback.count ?? 0,
  }
}

export async function incrementViewCount(articleId: string): Promise<void> {
  try {
    const { error } = await supabase.rpc('increment_view_count', { article_id: articleId })
    if (error) {
      captureError('supabase.incrementViewCount', error, { articleId })
    }
  } catch (err) {
    captureError('supabase.incrementViewCount', err, { articleId })
  }
}

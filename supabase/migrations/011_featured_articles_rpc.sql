-- ==========================================
-- 011: Featured 기사 서버사이드 스코어링 RPC
-- 시간 감쇠(half-life 7일) + 조회수 기반 스코어링을 DB에서 처리
-- ==========================================

CREATE OR REPLACE FUNCTION get_featured_articles(
  p_limit INTEGER DEFAULT 5
) RETURNS SETOF articles AS $$
BEGIN
  RETURN QUERY
    SELECT *
    FROM public.articles
    ORDER BY
      (view_count * exp(-0.099021 * extract(epoch FROM (NOW() - published_at)) / 86400.0)) DESC,
      published_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE SECURITY INVOKER SET search_path = public;

GRANT EXECUTE ON FUNCTION get_featured_articles(INTEGER) TO anon, authenticated;

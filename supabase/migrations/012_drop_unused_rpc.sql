-- ==========================================
-- 012: 미사용 RPC 정리
-- get_comment_count: Supabase 쿼리의 count: "exact" 옵션으로 대체되어 미사용
-- ==========================================

DROP FUNCTION IF EXISTS get_comment_count(uuid);

-- ==========================================
-- AI 댓글 모더레이션: is_hidden, hidden_reason 컬럼 추가
-- ==========================================

ALTER TABLE comments ADD COLUMN IF NOT EXISTS is_hidden boolean NOT NULL DEFAULT false;
ALTER TABLE comments ADD COLUMN IF NOT EXISTS hidden_reason text;

-- 숨김 댓글 조회용 부분 인덱스
CREATE INDEX IF NOT EXISTS idx_comments_is_hidden ON comments(is_hidden) WHERE is_hidden = true;

-- get_comment_count RPC 업데이트: 숨김 댓글 제외
CREATE OR REPLACE FUNCTION get_comment_count(p_article_id uuid)
RETURNS integer AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::integer FROM comments
    WHERE article_id = p_article_id AND is_deleted = false AND is_hidden = false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

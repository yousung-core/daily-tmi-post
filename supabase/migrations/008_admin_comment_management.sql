-- ==========================================
-- 008: 관리자 댓글/신고 관리 기능
-- ==========================================

-- comment_reports에 처리 상태 컬럼 추가
ALTER TABLE comment_reports ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending'
  CHECK (status IN ('pending', 'resolved', 'dismissed'));

-- 이미 존재하는 신고 중 댓글이 삭제된 건은 resolved 처리
UPDATE comment_reports cr
SET status = 'resolved'
WHERE EXISTS (
  SELECT 1 FROM comments c
  WHERE c.id = cr.comment_id AND c.is_deleted = true
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_comment_reports_status ON comment_reports(status);
CREATE INDEX IF NOT EXISTS idx_comment_reports_created_at ON comment_reports(created_at DESC);

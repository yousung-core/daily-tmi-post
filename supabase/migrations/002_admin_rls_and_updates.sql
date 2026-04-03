-- ==========================================
-- 관리자 시스템 지원을 위한 스키마 업데이트
-- ==========================================

-- articles 테이블에 updated_at 추가 (편집 추적용)
ALTER TABLE articles ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- RLS 활성화
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- 공개 읽기: 누구나 발행된 기사 조회 가능
CREATE POLICY "articles_public_read" ON articles
  FOR SELECT USING (true);

-- 공개 쓰기: 누구나 기사 신청 가능
CREATE POLICY "submissions_public_insert" ON submissions
  FOR INSERT WITH CHECK (true);

-- 조회수 업데이트: increment_view_count RPC 함수가 SECURITY DEFINER이므로
-- 별도의 UPDATE 정책 불필요 (RPC가 RLS를 우회함)

-- rate_limits: 공개 접근 (rate limit 체크용)
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rate_limits_public_access" ON rate_limits
  FOR ALL USING (true)
  WITH CHECK (true);

-- ==========================================
-- 참고: service_role 키는 RLS를 우회하므로
-- 관리자 전용 정책은 별도로 필요하지 않음.
-- 위 정책들은 anon 키를 통한 공개 접근만 제어.
-- ==========================================

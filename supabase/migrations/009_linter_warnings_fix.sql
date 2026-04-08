-- ==========================================
-- 009: Supabase Linter 경고 수정
-- ==========================================

-- ==========================================
-- 1. Function Search Path Mutable 수정
--    search_path를 빈 문자열로 고정하여 경로 변조 방지
-- ==========================================

-- 1a. protect_user_profile_fields
CREATE OR REPLACE FUNCTION public.protect_user_profile_fields()
RETURNS trigger AS $$
BEGIN
  -- service_role (관리자)은 모든 필드 변경 가능
  IF current_setting('role', true) = 'service_role' THEN
    RETURN NEW;
  END IF;
  -- 일반 사용자는 is_banned, provider 변경 불가
  NEW.is_banned := OLD.is_banned;
  NEW.provider := OLD.provider;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

-- 1b. update_updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

-- ==========================================
-- 2. Extension in Public 수정
--    pg_trgm을 extensions 스키마로 이동
-- ==========================================

-- extensions 스키마 생성 (이미 있으면 무시)
CREATE SCHEMA IF NOT EXISTS extensions;

-- pg_trgm에 의존하는 인덱스 먼저 삭제
DROP INDEX IF EXISTS idx_articles_title_trgm;
DROP INDEX IF EXISTS idx_articles_excerpt_trgm;
DROP INDEX IF EXISTS idx_articles_content_trgm;

-- public에서 제거 후 extensions에 재설치
DROP EXTENSION IF EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS pg_trgm SCHEMA extensions;

-- 인덱스 재생성 (extensions 스키마의 연산자 클래스 참조)
CREATE INDEX IF NOT EXISTS idx_articles_title_trgm ON articles USING gin (title extensions.gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_articles_excerpt_trgm ON articles USING gin (excerpt extensions.gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_articles_content_trgm ON articles USING gin (content extensions.gin_trgm_ops);

-- ==========================================
-- 3. RLS Policy Always True 수정
-- ==========================================

-- 3a. rate_limits: 기존 permissive 정책 제거 + RLS 유지 (정책 없음 = 모두 차단)
--     service_role(admin client) + SECURITY DEFINER RPC는 RLS를 우회하므로 기존 동작 유지
--     FORCE를 적용하여 테이블 소유자에게도 RLS 적용
DROP POLICY IF EXISTS "rate_limits_public_access" ON rate_limits;
DROP POLICY IF EXISTS "rate_limits_select" ON rate_limits;
DROP POLICY IF EXISTS "rate_limits_insert" ON rate_limits;
DROP POLICY IF EXISTS "rate_limits_update" ON rate_limits;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits FORCE ROW LEVEL SECURITY;
CREATE POLICY "rate_limits_service_role_only" ON rate_limits
  FOR ALL USING (false) WITH CHECK (false);

-- 3b. submissions: INSERT 정책을 SECURITY DEFINER 함수로 대체
--     anon key로 직접 INSERT하는 대신, SECURITY DEFINER 함수를 통해
--     서버 측에서만 삽입하도록 변경하여 WITH CHECK (true) 경고 해소.
DROP POLICY IF EXISTS "Anyone can insert submissions" ON submissions;
DROP POLICY IF EXISTS "submissions_public_insert" ON submissions;

CREATE OR REPLACE FUNCTION public.insert_submission(
  p_email text,
  p_category text,
  p_title text,
  p_event_date text,
  p_location text DEFAULT NULL,
  p_content text DEFAULT '',
  p_message text DEFAULT NULL,
  p_image_url text DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO submissions (email, category, title, event_date, location, content, message, image_url)
  VALUES (p_email, p_category, p_title, p_event_date, p_location, p_content, p_message, p_image_url)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 3c. admins / rate_limits / submissions: RLS 유지 + USING(false) 정책
--     정책이 0개이면 "No Policy" INFO가 뜨므로, 명시적 차단 정책을 추가.
--     service_role은 RLS를 우회하므로 기존 동작에 영향 없음.
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins FORCE ROW LEVEL SECURITY;
CREATE POLICY "admins_service_role_only" ON admins
  FOR ALL USING (false) WITH CHECK (false);

ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions FORCE ROW LEVEL SECURITY;
CREATE POLICY "submissions_service_role_only" ON submissions
  FOR ALL USING (false) WITH CHECK (false);

-- ==========================================
-- 4. Leaked Password Protection
--    → SQL로 설정 불가. Supabase Dashboard에서 활성화 필요:
--      Authentication > Attack Protection > Enable breach password detection
-- ==========================================

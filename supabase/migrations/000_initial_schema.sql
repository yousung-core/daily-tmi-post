-- ==========================================
-- Daily TMI Post - 초기 데이터베이스 스키마
-- ==========================================

-- submissions: 사용자 기사 신청
CREATE TABLE IF NOT EXISTS submissions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  category text NOT NULL,
  title text NOT NULL,
  event_date text NOT NULL,
  location text,
  content text NOT NULL,
  message text,
  image_url text,
  status text NOT NULL DEFAULT 'pending',
  admin_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- articles: 발행된 기사
CREATE TABLE IF NOT EXISTS articles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id uuid NOT NULL REFERENCES submissions(id),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  content text NOT NULL,
  excerpt text,
  category text NOT NULL,
  image_url text,
  view_count integer NOT NULL DEFAULT 0,
  published_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at DESC);

-- rate_limits: API 요청 제한
CREATE TABLE IF NOT EXISTS rate_limits (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier text NOT NULL UNIQUE,
  request_count integer NOT NULL DEFAULT 0,
  window_start timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier ON rate_limits(identifier);

-- admins: 관리자
CREATE TABLE IF NOT EXISTS admins (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ==========================================
-- RPC Functions
-- ==========================================

-- 조회수 증가
CREATE OR REPLACE FUNCTION increment_view_count(article_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE articles SET view_count = view_count + 1 WHERE id = article_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Rate Limit 체크
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_identifier text,
  p_limit integer,
  p_window_seconds integer
)
RETURNS jsonb AS $$
DECLARE
  v_count integer;
  v_window_start timestamptz;
  v_now timestamptz := now();
BEGIN
  SELECT request_count, window_start
  INTO v_count, v_window_start
  FROM rate_limits
  WHERE identifier = p_identifier;

  IF NOT FOUND OR v_now > v_window_start + (p_window_seconds || ' seconds')::interval THEN
    INSERT INTO rate_limits (identifier, request_count, window_start)
    VALUES (p_identifier, 1, v_now)
    ON CONFLICT (identifier) DO UPDATE
      SET request_count = 1, window_start = v_now;
    RETURN jsonb_build_object('success', true, 'remaining', p_limit - 1);
  END IF;

  IF v_count >= p_limit THEN
    RETURN jsonb_build_object('success', false, 'remaining', 0);
  END IF;

  UPDATE rate_limits SET request_count = request_count + 1
  WHERE identifier = p_identifier;

  RETURN jsonb_build_object('success', true, 'remaining', p_limit - v_count - 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

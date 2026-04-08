-- ==========================================
-- Daily TMI Post - Database Schema
-- ==========================================
-- Supabase SQL Editor에서 실행하세요.
-- ==========================================

-- 기사 신청 테이블
CREATE TABLE submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  title VARCHAR(100) NOT NULL,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location VARCHAR(255),
  content TEXT NOT NULL,
  message TEXT,
  image_url TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  admin_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 게시된 기사 테이블
CREATE TABLE articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id UUID REFERENCES submissions(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  category VARCHAR(50) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  image_url TEXT,
  view_count INTEGER DEFAULT 0,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 관리자 테이블
CREATE TABLE admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 인덱스
-- ==========================================

-- 신청 목록 조회 최적화
CREATE INDEX idx_submissions_status ON submissions(status);
CREATE INDEX idx_submissions_created_at ON submissions(created_at DESC);
CREATE INDEX idx_submissions_category ON submissions(category);

-- 기사 목록 조회 최적화
CREATE INDEX idx_articles_slug ON articles(slug);
CREATE INDEX idx_articles_category ON articles(category);
CREATE INDEX idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX idx_articles_category_published ON articles(category, published_at DESC);

-- 기사 검색 최적화 (ilike '%keyword%' 용)
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_articles_title_trgm ON articles USING GIN (title gin_trgm_ops);
CREATE INDEX idx_articles_excerpt_trgm ON articles USING GIN (excerpt gin_trgm_ops);
CREATE INDEX idx_articles_content_trgm ON articles USING GIN (content gin_trgm_ops);

-- ==========================================
-- RLS (Row Level Security) 정책
-- ==========================================

-- RLS 활성화
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- 누구나 기사 신청 가능
CREATE POLICY "Anyone can insert submissions"
  ON submissions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- TODO: 관리자 인증 구현 후 아래 정책 추가
-- CREATE POLICY "Admins can read submissions"
--   ON submissions FOR SELECT
--   TO authenticated
--   USING (auth.email() IN (SELECT email FROM admins));

-- 누구나 게시된 기사 조회 가능
CREATE POLICY "Anyone can read articles"
  ON articles FOR SELECT
  TO anon, authenticated
  USING (true);

-- ==========================================
-- RPC 함수 (조회수 증가)
-- ==========================================

CREATE OR REPLACE FUNCTION increment_view_count(article_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE articles
  SET view_count = view_count + 1
  WHERE id = article_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 누구나 조회수 증가 함수 호출 가능
GRANT EXECUTE ON FUNCTION increment_view_count(UUID) TO anon, authenticated;

-- ==========================================
-- Rate Limiting (요청 제한)
-- ==========================================

-- Rate Limit 테이블
CREATE TABLE rate_limits (
  identifier TEXT NOT NULL,
  window_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  count INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (identifier, window_start)
);

-- 정리용 인덱스
CREATE INDEX idx_rate_limits_window ON rate_limits(window_start);

-- RLS 활성화
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- API 라우트(anon)에서 RPC를 통해서만 접근하므로 직접 SELECT/INSERT 정책 불필요
-- SECURITY DEFINER 함수가 RLS를 우회함

-- 원자적 체크-앤-증가 RPC 함수
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_identifier TEXT,
  p_limit INTEGER DEFAULT 5,
  p_window_seconds INTEGER DEFAULT 900
) RETURNS JSON AS $$
DECLARE
  v_window_start TIMESTAMPTZ;
  v_count INTEGER;
BEGIN
  -- 현재 윈도우 시작 시각 계산
  v_window_start := to_timestamp(
    floor(extract(epoch FROM NOW()) / p_window_seconds) * p_window_seconds
  );

  -- 삽입 또는 카운트 증가 (원자적 처리)
  INSERT INTO rate_limits (identifier, window_start, count)
  VALUES (p_identifier, v_window_start, 1)
  ON CONFLICT (identifier, window_start)
  DO UPDATE SET count = rate_limits.count + 1
  RETURNING count INTO v_count;

  -- 오래된 항목 확률적 정리 (1% 확률)
  IF random() < 0.01 THEN
    DELETE FROM rate_limits WHERE window_start < NOW() - INTERVAL '1 hour';
  END IF;

  RETURN json_build_object(
    'success', v_count <= p_limit,
    'remaining', GREATEST(0, p_limit - v_count)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 누구나 Rate Limit 함수 호출 가능
GRANT EXECUTE ON FUNCTION check_rate_limit(TEXT, INTEGER, INTEGER) TO anon, authenticated;

-- ==========================================
-- Full-Text Search 지원
-- 'simple' config는 한국어 공백 기반 토큰화를 지원합니다.
-- 더 정밀한 한국어 형태소 분석이 필요하면 pg_bigm 확장을 고려하세요.
-- ==========================================

-- tsvector 컬럼 추가
ALTER TABLE articles ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- 기존 데이터 채우기 (title: 가중치 A, excerpt: B, content: C)
UPDATE articles SET search_vector =
  setweight(to_tsvector('simple', coalesce(title, '')), 'A') ||
  setweight(to_tsvector('simple', coalesce(excerpt, '')), 'B') ||
  setweight(to_tsvector('simple', coalesce(content, '')), 'C');

-- GIN 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_articles_search_vector
  ON articles USING gin(search_vector);

-- INSERT/UPDATE 시 자동 갱신 트리거
CREATE OR REPLACE FUNCTION articles_search_vector_trigger()
RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('simple', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(NEW.excerpt, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(NEW.content, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_articles_search_vector ON articles;
CREATE TRIGGER trg_articles_search_vector
  BEFORE INSERT OR UPDATE OF title, excerpt, content ON articles
  FOR EACH ROW
  EXECUTE FUNCTION articles_search_vector_trigger();

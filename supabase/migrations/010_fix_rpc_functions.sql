-- ==========================================
-- 010: RPC 함수 버그 수정
-- - check_rate_limit: request_count → count 컬럼명 수정
-- - insert_submission: search_path = '' → public 수정
-- ==========================================

-- 1. check_rate_limit 함수 재생성
--    rate_limits 테이블의 실제 컬럼명은 "count"이므로 이에 맞게 수정
--    또한 원자적 UPSERT 방식(schema.sql 기준)으로 통일
DROP FUNCTION IF EXISTS check_rate_limit(text, integer, integer);

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
  INSERT INTO public.rate_limits (identifier, window_start, count)
  VALUES (p_identifier, v_window_start, 1)
  ON CONFLICT (identifier, window_start)
  DO UPDATE SET count = public.rate_limits.count + 1
  RETURNING count INTO v_count;

  -- 오래된 항목 확률적 정리 (1% 확률)
  IF random() < 0.01 THEN
    DELETE FROM public.rate_limits WHERE window_start < NOW() - INTERVAL '1 hour';
  END IF;

  RETURN json_build_object(
    'success', v_count <= p_limit,
    'remaining', GREATEST(0, p_limit - v_count)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION check_rate_limit(TEXT, INTEGER, INTEGER) TO anon, authenticated;

-- 2. insert_submission 함수 재생성
--    SET search_path = '' → SET search_path = public 수정
--    빈 search_path로 인해 submissions 테이블을 찾지 못하는 문제 해결
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
  INSERT INTO public.submissions (email, category, title, event_date, location, content, message, image_url)
  VALUES (p_email, p_category, p_title, p_event_date::timestamptz, p_location, p_content, p_message, p_image_url)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.insert_submission(text, text, text, text, text, text, text, text) TO anon, authenticated;

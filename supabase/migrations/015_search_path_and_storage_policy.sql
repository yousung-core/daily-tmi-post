-- ==========================================
-- 015: Linter 경고 수정 — search_path 고정 + Storage 정책 제거
-- ==========================================

-- ==========================================
-- 1. Function Search Path Mutable 수정
--    search_path를 고정하여 경로 변조 방지
-- ==========================================

-- 1a. handle_new_user — SECURITY DEFINER이므로 search_path 필수
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, nickname, avatar_url, provider)
  VALUES (
    NEW.id,
    public.mask_email_id(NEW.email),
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture'
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'provider',
      'email'
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 1b. get_comment_count
CREATE OR REPLACE FUNCTION public.get_comment_count(p_article_id uuid)
RETURNS integer AS $$
BEGIN
  RETURN (
    SELECT count(*)::integer
    FROM public.comments
    WHERE article_id = p_article_id
      AND is_deleted = false
  );
END;
$$ LANGUAGE plpgsql SET search_path = '';

-- 1c. mask_email_id
CREATE OR REPLACE FUNCTION public.mask_email_id(email text)
RETURNS text AS $$
DECLARE
  local_part text;
  len integer;
  half integer;
BEGIN
  IF email IS NULL OR email = '' OR position('@' in email) = 0 THEN
    RETURN '익명';
  END IF;

  local_part := split_part(email, '@', 1);
  len := char_length(local_part);

  IF len = 0 THEN
    RETURN '익명';
  ELSIF len <= 2 THEN
    RETURN repeat('*', len);
  ELSIF len = 3 THEN
    RETURN substring(local_part, 1, 1) || '**';
  ELSE
    half := ceil(len::numeric / 2)::integer;
    RETURN substring(local_part, 1, half) || repeat('*', len - half);
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE SET search_path = '';

-- ==========================================
-- 2. Storage Bucket 불필요한 SELECT 정책 제거
--    퍼블릭 버킷은 URL 접근에 SELECT 정책 불필요
--    파일 목록 노출 방지
-- ==========================================
DROP POLICY IF EXISTS "Anyone can read article images" ON storage.objects;

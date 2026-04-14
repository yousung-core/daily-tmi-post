-- ==========================================
-- 닉네임을 이메일 ID 마스킹으로 변경
-- ==========================================

-- 1단계: 마스킹 헬퍼 함수
CREATE OR REPLACE FUNCTION mask_email_id(email text)
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
$$ LANGUAGE plpgsql IMMUTABLE;

-- 2단계: handle_new_user() 트리거 함수 교체
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, nickname, avatar_url, provider)
  VALUES (
    NEW.id,
    mask_email_id(NEW.email),
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3단계: 기존 사용자 닉네임 일괄 마이그레이션
UPDATE public.user_profiles up
SET nickname = mask_email_id(au.email),
    updated_at = now()
FROM auth.users au
WHERE up.id = au.id;

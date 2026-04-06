-- ==========================================
-- 005: 2차 코드 리뷰 수정
-- HIGH 4건 + MEDIUM 관련 SQL 수정
-- ==========================================

-- ==========================================
-- 1. handle_new_user: NULLIF로 빈 문자열 처리 + EXCEPTION 범위 축소
-- ==========================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, nickname, avatar_url, provider)
  VALUES (
    NEW.id,
    left(COALESCE(
      NULLIF(NEW.raw_user_meta_data->>'full_name', ''),
      NULLIF(NEW.raw_user_meta_data->>'name', ''),
      NULLIF(split_part(NEW.email, '@', 1), ''),
      'User_' || left(NEW.id::text, 8)
    ), 50),  -- 50자 제한 적용
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
EXCEPTION WHEN unique_violation THEN
  -- 프로필이 이미 존재하는 경우만 무시
  RAISE WARNING 'handle_new_user: profile already exists for user %', NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ==========================================
-- 2. protect_user_profile_fields: service_role은 허용
-- ==========================================

CREATE OR REPLACE FUNCTION protect_user_profile_fields()
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
$$ LANGUAGE plpgsql;

-- ==========================================
-- 3. toggle_article_reaction: auth.uid() 검증 + ban 체크
-- ==========================================

CREATE OR REPLACE FUNCTION toggle_article_reaction(
  p_article_id uuid,
  p_user_id uuid,
  p_reaction_type text
)
RETURNS jsonb AS $$
DECLARE
  v_existing_type text;
  v_action text;
BEGIN
  -- 호출자 = p_user_id 검증
  IF auth.uid() IS NULL OR auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- 차단 사용자 체크
  IF EXISTS (SELECT 1 FROM user_profiles WHERE id = p_user_id AND is_banned = true) THEN
    RAISE EXCEPTION 'User is banned';
  END IF;

  -- FOR UPDATE로 행 잠금하여 동시성 문제 방지
  SELECT reaction_type INTO v_existing_type
  FROM article_reactions
  WHERE article_id = p_article_id AND user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    INSERT INTO article_reactions (article_id, user_id, reaction_type)
    VALUES (p_article_id, p_user_id, p_reaction_type)
    ON CONFLICT (article_id, user_id) DO UPDATE
      SET reaction_type = EXCLUDED.reaction_type;
    v_action := 'created';
  ELSIF v_existing_type = p_reaction_type THEN
    DELETE FROM article_reactions
    WHERE article_id = p_article_id AND user_id = p_user_id;
    v_action := 'removed';
  ELSE
    UPDATE article_reactions SET reaction_type = p_reaction_type
    WHERE article_id = p_article_id AND user_id = p_user_id;
    v_action := 'changed';
  END IF;

  RETURN jsonb_build_object('action', v_action);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ==========================================
-- 4. toggle_comment_like: auth.uid() 검증 + ban 체크
-- ==========================================

CREATE OR REPLACE FUNCTION toggle_comment_like(
  p_comment_id uuid,
  p_user_id uuid
)
RETURNS jsonb AS $$
DECLARE
  v_found boolean;
  v_count integer;
BEGIN
  -- 호출자 = p_user_id 검증
  IF auth.uid() IS NULL OR auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- 차단 사용자 체크
  IF EXISTS (SELECT 1 FROM user_profiles WHERE id = p_user_id AND is_banned = true) THEN
    RAISE EXCEPTION 'User is banned';
  END IF;

  SELECT true INTO v_found
  FROM comment_likes
  WHERE comment_id = p_comment_id AND user_id = p_user_id
  FOR UPDATE;

  IF v_found THEN
    DELETE FROM comment_likes
    WHERE comment_id = p_comment_id AND user_id = p_user_id;
  ELSE
    INSERT INTO comment_likes (comment_id, user_id)
    VALUES (p_comment_id, p_user_id)
    ON CONFLICT (comment_id, user_id) DO NOTHING;
  END IF;

  SELECT COUNT(*)::integer INTO v_count
  FROM comment_likes WHERE comment_id = p_comment_id;

  RETURN jsonb_build_object(
    'liked', NOT COALESCE(v_found, false),
    'count', v_count
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ==========================================
-- 5. 정책 idempotency (재실행 안전)
-- ==========================================

DROP POLICY IF EXISTS "comments_admin_read" ON comments;
CREATE POLICY "comments_admin_read" ON comments FOR SELECT
  USING (EXISTS (SELECT 1 FROM admins WHERE email = auth.jwt()->>'email'));

DROP POLICY IF EXISTS "comment_reports_admin_read" ON comment_reports;
CREATE POLICY "comment_reports_admin_read" ON comment_reports FOR SELECT
  USING (EXISTS (SELECT 1 FROM admins WHERE email = auth.jwt()->>'email'));

-- ==========================================
-- 6. 기존 데이터 안전 조치 (긴 닉네임 자르기)
-- ==========================================

UPDATE user_profiles SET nickname = left(nickname, 50) WHERE char_length(nickname) > 50;

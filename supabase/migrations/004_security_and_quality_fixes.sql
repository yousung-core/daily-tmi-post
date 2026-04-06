-- ==========================================
-- 004: 보안 및 품질 개선
-- Phase 4 코드 리뷰 결과 수정 사항
-- ==========================================

-- ==========================================
-- 0. 기존 함수 시그니처 충돌 방지를 위한 DROP
-- ==========================================

DROP FUNCTION IF EXISTS check_rate_limit(text, integer, integer);
DROP FUNCTION IF EXISTS increment_view_count(uuid);
DROP FUNCTION IF EXISTS get_comment_count(uuid);

-- ==========================================
-- 1. SECURITY DEFINER 함수들에 search_path 설정
-- ==========================================

-- 1a. handle_new_user() 수정: search_path + nickname fallback + 에러 안전
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  BEGIN
    INSERT INTO public.user_profiles (id, nickname, avatar_url, provider)
    VALUES (
      NEW.id,
      COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'name',
        split_part(NEW.email, '@', 1),
        'User_' || left(NEW.id::text, 8)
      ),
      COALESCE(
        NEW.raw_user_meta_data->>'avatar_url',
        NEW.raw_user_meta_data->>'picture'
      ),
      COALESCE(
        NEW.raw_user_meta_data->>'provider',
        'email'
      )
    );
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user failed for user %: %', NEW.id, SQLERRM;
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 1b. get_comment_count() 수정: INVOKER로 변경 (DEFINER 불필요)
CREATE OR REPLACE FUNCTION get_comment_count(p_article_id uuid)
RETURNS integer AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::integer FROM comments
    WHERE article_id = p_article_id AND is_deleted = false
  );
END;
$$ LANGUAGE plpgsql SECURITY INVOKER SET search_path = public;

-- 1c. increment_view_count: search_path 추가
CREATE OR REPLACE FUNCTION increment_view_count(article_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE articles SET view_count = view_count + 1 WHERE id = article_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 1d. check_rate_limit: search_path 추가
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ==========================================
-- 2. 원자적 토글 RPC 함수
-- ==========================================

-- 2a. toggle_article_reaction: 리액션 토글 (레이스 컨디션 방지)
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
  -- FOR UPDATE로 행 잠금하여 동시성 문제 방지
  SELECT reaction_type INTO v_existing_type
  FROM article_reactions
  WHERE article_id = p_article_id AND user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    INSERT INTO article_reactions (article_id, user_id, reaction_type)
    VALUES (p_article_id, p_user_id, p_reaction_type);
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

-- 2b. toggle_comment_like: 좋아요 토글 (레이스 컨디션 방지)
CREATE OR REPLACE FUNCTION toggle_comment_like(
  p_comment_id uuid,
  p_user_id uuid
)
RETURNS jsonb AS $$
DECLARE
  v_found boolean;
  v_count integer;
BEGIN
  SELECT true INTO v_found
  FROM comment_likes
  WHERE comment_id = p_comment_id AND user_id = p_user_id
  FOR UPDATE;

  IF v_found THEN
    DELETE FROM comment_likes
    WHERE comment_id = p_comment_id AND user_id = p_user_id;
  ELSE
    INSERT INTO comment_likes (comment_id, user_id)
    VALUES (p_comment_id, p_user_id);
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
-- 3. RLS 정책 수정
-- ==========================================

-- 3a. INSERT 정책에 ban 체크 추가
DROP POLICY IF EXISTS "comments_auth_insert" ON comments;
CREATE POLICY "comments_auth_insert" ON comments FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND NOT EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_banned = true)
  );

DROP POLICY IF EXISTS "comment_likes_auth_insert" ON comment_likes;
CREATE POLICY "comment_likes_auth_insert" ON comment_likes FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND NOT EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_banned = true)
  );

DROP POLICY IF EXISTS "article_reactions_auth_insert" ON article_reactions;
CREATE POLICY "article_reactions_auth_insert" ON article_reactions FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND NOT EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_banned = true)
  );

DROP POLICY IF EXISTS "comment_reports_auth_insert" ON comment_reports;
CREATE POLICY "comment_reports_auth_insert" ON comment_reports FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND NOT EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_banned = true)
  );

-- 3b. 프로필 업데이트: is_banned, provider 변경 방지 트리거
CREATE OR REPLACE FUNCTION protect_user_profile_fields()
RETURNS trigger AS $$
BEGIN
  NEW.is_banned := OLD.is_banned;
  NEW.provider := OLD.provider;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_protect_profile ON user_profiles;
CREATE TRIGGER trg_protect_profile
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION protect_user_profile_fields();

-- 3c. 관리자 신고 조회 정책
CREATE POLICY "comment_reports_admin_read" ON comment_reports FOR SELECT
  USING (EXISTS (SELECT 1 FROM admins WHERE email = auth.jwt()->>'email'));

-- 3d. Soft-delete 댓글 가시성 제한
DROP POLICY IF EXISTS "comments_public_read" ON comments;
CREATE POLICY "comments_public_read" ON comments FOR SELECT
  USING (is_deleted = false OR user_id = auth.uid());
CREATE POLICY "comments_admin_read" ON comments FOR SELECT
  USING (EXISTS (SELECT 1 FROM admins WHERE email = auth.jwt()->>'email'));

-- 3e. 댓글 업데이트 WITH CHECK 강화
DROP POLICY IF EXISTS "comments_own_update" ON comments;
CREATE POLICY "comments_own_update" ON comments FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ==========================================
-- 4. updated_at 자동 갱신 트리거
-- ==========================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER trg_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_comments_updated_at ON comments;
CREATE TRIGGER trg_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ==========================================
-- 5. 인덱스 최적화
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_article_reactions_user_id ON article_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_user_id ON comment_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_comment_reports_comment_id ON comment_reports(comment_id);

-- 단일 created_at 인덱스를 복합 인덱스로 교체
DROP INDEX IF EXISTS idx_comments_created_at;
CREATE INDEX IF NOT EXISTS idx_comments_article_created ON comments(article_id, created_at DESC);

-- ==========================================
-- 6. 컬럼 길이 제약
-- ==========================================

ALTER TABLE user_profiles ADD CONSTRAINT chk_nickname_length
  CHECK (char_length(nickname) BETWEEN 1 AND 50);

-- soft-delete 시 content를 ''로 설정하므로 하한 0
ALTER TABLE comments ADD CONSTRAINT chk_content_length
  CHECK (char_length(content) BETWEEN 0 AND 5000);

ALTER TABLE comment_reports ADD CONSTRAINT chk_reason_length
  CHECK (char_length(reason) BETWEEN 1 AND 500);

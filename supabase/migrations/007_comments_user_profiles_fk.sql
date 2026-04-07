-- 007: comments → user_profiles FK 추가
-- PostgREST가 comments와 user_profiles 간 조인을 인식하려면
-- 명시적 FK 관계가 필요함 (기존 FK는 auth.users만 참조)
-- 실행 후 Supabase Dashboard > Settings > API > Reload Schema Cache 필요

ALTER TABLE comments
  ADD CONSTRAINT comments_user_profiles_fkey
  FOREIGN KEY (user_id) REFERENCES user_profiles(id);

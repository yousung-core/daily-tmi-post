-- ==========================================
-- 소셜 로그인 + 댓글/리액션 시스템
-- ==========================================

-- user_profiles: auth.users와 1:1 연결
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname text NOT NULL,
  avatar_url text,
  provider text NOT NULL DEFAULT 'email',
  is_banned boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_nickname ON user_profiles(nickname);

-- comments: 댓글 + 대댓글 (parent_id로 1단계 대댓글)
CREATE TABLE IF NOT EXISTS comments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id uuid NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES comments(id) ON DELETE CASCADE,
  content text NOT NULL,
  is_deleted boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_comments_article_id ON comments(article_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);

-- comment_likes: 댓글 좋아요 (유저당 1개)
CREATE TABLE IF NOT EXISTS comment_likes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id uuid NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(comment_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_id ON comment_likes(comment_id);

-- article_reactions: 기사 리액션 (유저당 1개, 5종류)
CREATE TABLE IF NOT EXISTS article_reactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id uuid NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction_type text NOT NULL CHECK (reaction_type IN ('like', 'funny', 'sad', 'cheer', 'surprise')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(article_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_article_reactions_article_id ON article_reactions(article_id);

-- comment_reports: 댓글 신고 (유저당 댓글 1건)
CREATE TABLE IF NOT EXISTS comment_reports (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id uuid NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(comment_id, user_id)
);

-- ==========================================
-- RLS
-- ==========================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_reports ENABLE ROW LEVEL SECURITY;

-- user_profiles
CREATE POLICY "user_profiles_public_read" ON user_profiles FOR SELECT USING (true);
CREATE POLICY "user_profiles_own_insert" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "user_profiles_own_update" ON user_profiles FOR UPDATE USING (auth.uid() = id);

-- comments
CREATE POLICY "comments_public_read" ON comments FOR SELECT USING (true);
CREATE POLICY "comments_auth_insert" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "comments_own_update" ON comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "comments_own_delete" ON comments FOR DELETE USING (auth.uid() = user_id);

-- comment_likes
CREATE POLICY "comment_likes_public_read" ON comment_likes FOR SELECT USING (true);
CREATE POLICY "comment_likes_auth_insert" ON comment_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "comment_likes_own_delete" ON comment_likes FOR DELETE USING (auth.uid() = user_id);

-- article_reactions
CREATE POLICY "article_reactions_public_read" ON article_reactions FOR SELECT USING (true);
CREATE POLICY "article_reactions_auth_insert" ON article_reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "article_reactions_own_update" ON article_reactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "article_reactions_own_delete" ON article_reactions FOR DELETE USING (auth.uid() = user_id);

-- comment_reports
CREATE POLICY "comment_reports_own_read" ON comment_reports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "comment_reports_auth_insert" ON comment_reports FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ==========================================
-- 트리거: auth.users 생성 시 user_profiles 자동 생성
-- ==========================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, nickname, avatar_url, provider)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
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
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ==========================================
-- RPC: 댓글 수 조회
-- ==========================================

CREATE OR REPLACE FUNCTION get_comment_count(p_article_id uuid)
RETURNS integer AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::integer FROM comments
    WHERE article_id = p_article_id AND is_deleted = false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

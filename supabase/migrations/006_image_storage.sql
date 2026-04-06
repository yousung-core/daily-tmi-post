-- ==========================================
-- 006: Supabase Storage - 기사 이미지 버킷
-- ==========================================

INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('article-images', 'article-images', true, 6291456)  -- 6MB 제한
ON CONFLICT (id) DO NOTHING;

-- 업로드는 submissions/ 경로만 허용 (경로 제한)
CREATE POLICY "Anyone can upload article images"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    bucket_id = 'article-images'
    AND (storage.foldername(name))[1] = 'submissions'
  );

-- 누구나 이미지 조회 가능 (공개 버킷)
CREATE POLICY "Anyone can read article images"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'article-images');

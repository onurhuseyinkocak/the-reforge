
-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('life-area-photos', 'life-area-photos', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('community-images', 'community-images', true);

-- Storage policies for life-area-photos
CREATE POLICY "Anyone can view life area photos" ON storage.objects FOR SELECT USING (bucket_id = 'life-area-photos');
CREATE POLICY "Authenticated users can upload life area photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'life-area-photos' AND auth.uid() IS NOT NULL);
CREATE POLICY "Users can delete own life area photos" ON storage.objects FOR DELETE USING (bucket_id = 'life-area-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for community-images
CREATE POLICY "Anyone can view community images" ON storage.objects FOR SELECT USING (bucket_id = 'community-images');
CREATE POLICY "Authenticated users can upload community images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'community-images' AND auth.uid() IS NOT NULL);
CREATE POLICY "Users can delete own community images" ON storage.objects FOR DELETE USING (bucket_id = 'community-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add photo_urls to life_area_entries
ALTER TABLE public.life_area_entries ADD COLUMN photo_urls jsonb DEFAULT '[]'::jsonb;

-- Add columns to community_posts
ALTER TABLE public.community_posts ADD COLUMN image_url text;
ALTER TABLE public.community_posts ADD COLUMN likes_count integer NOT NULL DEFAULT 0;
ALTER TABLE public.community_posts ADD COLUMN post_type text NOT NULL DEFAULT 'text';

-- Create community_likes table
CREATE TABLE public.community_likes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

ALTER TABLE public.community_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view likes" ON public.community_likes FOR SELECT USING (true);
CREATE POLICY "Users can insert own likes" ON public.community_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own likes" ON public.community_likes FOR DELETE USING (auth.uid() = user_id);

-- Create ai_analysis_reports table
CREATE TABLE public.ai_analysis_reports (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  analysis_date date NOT NULL DEFAULT CURRENT_DATE,
  area text,
  summary text NOT NULL,
  risk_level text NOT NULL DEFAULT 'low',
  recommendations jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_analysis_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all reports" ON public.ai_analysis_reports FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Students can view own reports" ON public.ai_analysis_reports FOR SELECT USING (auth.uid() = user_id);

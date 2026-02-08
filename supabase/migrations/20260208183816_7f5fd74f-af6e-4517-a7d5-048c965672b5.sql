
-- 1. Applications table
CREATE TABLE public.applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  age integer,
  situation_ratings jsonb DEFAULT '{}'::jsonb,
  commitment_answers jsonb DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'pending',
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Public can insert applications (no auth required)
CREATE POLICY "Anyone can submit application"
  ON public.applications FOR INSERT
  WITH CHECK (true);

-- Admins can view/update applications
CREATE POLICY "Admins can view applications"
  ON public.applications FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update applications"
  ON public.applications FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete applications"
  ON public.applications FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 2. Life area entries table
CREATE TABLE public.life_area_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  area text NOT NULL,
  metrics jsonb DEFAULT '{}'::jsonb,
  entry_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.life_area_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own life entries"
  ON public.life_area_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own life entries"
  ON public.life_area_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own life entries"
  ON public.life_area_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all life entries"
  ON public.life_area_entries FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 3. Resources table
CREATE TABLE public.resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  content_url text,
  content_type text NOT NULL DEFAULT 'article',
  phase_required integer NOT NULL DEFAULT 1,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view resources"
  ON public.resources FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage resources"
  ON public.resources FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 4. Community posts table
CREATE TABLE public.community_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  content text NOT NULL,
  phase_group integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view posts"
  ON public.community_posts FOR SELECT
  USING (true);

CREATE POLICY "Users can create own posts"
  ON public.community_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts"
  ON public.community_posts FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all posts"
  ON public.community_posts FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 5. Add new columns to checkins
ALTER TABLE public.checkins 
  ADD COLUMN IF NOT EXISTS day_rating integer,
  ADD COLUMN IF NOT EXISTS priority_review text,
  ADD COLUMN IF NOT EXISTS gratitude text;

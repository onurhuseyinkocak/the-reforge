
-- Unique constraint for life_area_entries upsert
ALTER TABLE public.life_area_entries ADD CONSTRAINT life_area_entries_user_area_date_unique UNIQUE (user_id, area, entry_date);

-- Foreign key for community_posts to profiles
ALTER TABLE public.community_posts ADD CONSTRAINT community_posts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.community_posts 
  ADD CONSTRAINT community_posts_profile_fkey 
  FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;
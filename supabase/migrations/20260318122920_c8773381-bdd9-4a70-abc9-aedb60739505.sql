
-- 1. Add missing columns to profiles
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS xp integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS level integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS streak_freezes_remaining integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS streak_freeze_used_at timestamptz,
  ADD COLUMN IF NOT EXISTS streak_freeze_resets_at timestamptz,
  ADD COLUMN IF NOT EXISTS subscription_plan text NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS subscription_status text NOT NULL DEFAULT 'inactive';

-- 2. Create add_xp RPC function
CREATE OR REPLACE FUNCTION public.add_xp(p_user_id uuid, p_amount integer, p_source text DEFAULT NULL, p_description text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_xp integer;
  new_level integer;
BEGIN
  UPDATE public.profiles
  SET xp = GREATEST(0, xp + p_amount)
  WHERE user_id = p_user_id
  RETURNING xp INTO new_xp;

  -- Level up every 100 XP
  new_level := GREATEST(1, (new_xp / 100) + 1);
  UPDATE public.profiles SET level = new_level WHERE user_id = p_user_id;
END;
$$;

-- 3. Create guilds table
CREATE TABLE IF NOT EXISTS public.guilds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  level integer NOT NULL DEFAULT 1,
  xp integer NOT NULL DEFAULT 0,
  member_count integer NOT NULL DEFAULT 0,
  heat_score integer NOT NULL DEFAULT 0,
  is_public boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.guilds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Guilds are viewable by all authenticated users"
  ON public.guilds FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Guild creators can update their guild"
  ON public.guilds FOR UPDATE
  TO authenticated USING (created_by = auth.uid());

CREATE POLICY "Authenticated users can create guilds"
  ON public.guilds FOR INSERT
  TO authenticated WITH CHECK (created_by = auth.uid());

-- 4. Create guild_members table
CREATE TABLE IF NOT EXISTS public.guild_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id uuid NOT NULL REFERENCES public.guilds(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'member',
  is_active boolean NOT NULL DEFAULT true,
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(guild_id, user_id)
);

ALTER TABLE public.guild_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Guild members are viewable by authenticated users"
  ON public.guild_members FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Users can join guilds"
  ON public.guild_members FOR INSERT
  TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own membership"
  ON public.guild_members FOR UPDATE
  TO authenticated USING (user_id = auth.uid());

-- 5. Create guild_messages table
CREATE TABLE IF NOT EXISTS public.guild_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id uuid NOT NULL REFERENCES public.guilds(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.guild_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Guild messages are viewable by guild members"
  ON public.guild_messages FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Guild members can send messages"
  ON public.guild_messages FOR INSERT
  TO authenticated WITH CHECK (user_id = auth.uid());

-- 6. Create guild_quests table
CREATE TABLE IF NOT EXISTS public.guild_quests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id uuid NOT NULL REFERENCES public.guilds(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  xp_reward integer NOT NULL DEFAULT 50,
  completion_rate integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  due_date timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.guild_quests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Guild quests are viewable by authenticated users"
  ON public.guild_quests FOR SELECT
  TO authenticated USING (true);

-- 7. Create guild_challenges table
CREATE TABLE IF NOT EXISTS public.guild_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenger_guild_id uuid NOT NULL REFERENCES public.guilds(id) ON DELETE CASCADE,
  challenged_guild_id uuid NOT NULL REFERENCES public.guilds(id) ON DELETE CASCADE,
  challenger_score integer NOT NULL DEFAULT 0,
  challenged_score integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  ends_at timestamptz
);

ALTER TABLE public.guild_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Guild challenges are viewable by authenticated users"
  ON public.guild_challenges FOR SELECT
  TO authenticated USING (true);

-- 8. Create buddy_pairs table
CREATE TABLE IF NOT EXISTS public.buddy_pairs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a uuid NOT NULL,
  user_b uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_a, user_b)
);

ALTER TABLE public.buddy_pairs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Buddy pairs are viewable by participants"
  ON public.buddy_pairs FOR SELECT
  TO authenticated USING (user_a = auth.uid() OR user_b = auth.uid());

CREATE POLICY "Users can create buddy requests"
  ON public.buddy_pairs FOR INSERT
  TO authenticated WITH CHECK (user_a = auth.uid() OR user_b = auth.uid());

CREATE POLICY "Participants can update buddy pairs"
  ON public.buddy_pairs FOR UPDATE
  TO authenticated USING (user_a = auth.uid() OR user_b = auth.uid());

-- 9. Create subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  lemon_squeezy_id text UNIQUE,
  lemon_squeezy_customer_id text,
  plan text NOT NULL DEFAULT 'free',
  status text NOT NULL DEFAULT 'active',
  current_period_start timestamptz,
  current_period_end timestamptz,
  trial_ends_at timestamptz,
  cancel_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscriptions"
  ON public.subscriptions FOR SELECT
  TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Service can manage subscriptions"
  ON public.subscriptions FOR ALL
  TO service_role USING (true);

-- 10. Trigger to update updated_at on guilds
CREATE TRIGGER update_guilds_updated_at
  BEFORE UPDATE ON public.guilds
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_buddy_pairs_updated_at
  BEFORE UPDATE ON public.buddy_pairs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

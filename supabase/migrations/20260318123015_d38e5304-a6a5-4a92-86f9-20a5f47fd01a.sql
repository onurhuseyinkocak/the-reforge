
-- Drop and recreate guild_quests with full schema
DROP TABLE IF EXISTS public.guild_quests CASCADE;

CREATE TABLE public.guild_quests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id uuid NOT NULL REFERENCES public.guilds(id) ON DELETE CASCADE,
  created_by uuid NOT NULL,
  title text NOT NULL,
  description text,
  quest_type text NOT NULL DEFAULT 'weekly',
  target_value integer,
  current_value integer NOT NULL DEFAULT 0,
  points_reward integer NOT NULL DEFAULT 50,
  xp_reward integer NOT NULL DEFAULT 50,
  starts_at timestamptz NOT NULL DEFAULT now(),
  ends_at timestamptz,
  due_date timestamptz,
  status text NOT NULL DEFAULT 'active',
  completion_rate integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.guild_quests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Guild quests viewable by authenticated users"
  ON public.guild_quests FOR SELECT TO authenticated USING (true);

CREATE POLICY "Guild members can create quests"
  ON public.guild_quests FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());

CREATE POLICY "Guild members can update quests"
  ON public.guild_quests FOR UPDATE TO authenticated USING (created_by = auth.uid());

-- Drop and recreate guild_challenges with full schema
DROP TABLE IF EXISTS public.guild_challenges CASCADE;

CREATE TABLE public.guild_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenger_id uuid NOT NULL REFERENCES public.guilds(id) ON DELETE CASCADE,
  challenged_id uuid NOT NULL REFERENCES public.guilds(id) ON DELETE CASCADE,
  challenge_type text NOT NULL DEFAULT 'spark_duel',
  challenger_score integer NOT NULL DEFAULT 0,
  challenged_score integer NOT NULL DEFAULT 0,
  winner_id uuid,
  status text NOT NULL DEFAULT 'pending',
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.guild_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Guild challenges viewable by authenticated users"
  ON public.guild_challenges FOR SELECT TO authenticated USING (true);

-- Create guild_quest_participants table
CREATE TABLE IF NOT EXISTS public.guild_quest_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_id uuid NOT NULL REFERENCES public.guild_quests(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'assigned',
  proof_url text,
  proof_note text,
  completed_at timestamptz,
  reviewed_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(quest_id, user_id)
);

ALTER TABLE public.guild_quest_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Quest participants viewable by authenticated users"
  ON public.guild_quest_participants FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can manage their quest participation"
  ON public.guild_quest_participants FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their quest participation"
  ON public.guild_quest_participants FOR UPDATE TO authenticated USING (user_id = auth.uid());

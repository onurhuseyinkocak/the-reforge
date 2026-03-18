-- ============================================
-- THE FORGE — LONCA (GUILD) SİSTEMİ
-- Migration: 20260318000000_guild_system
-- ============================================

-- Loncalar
CREATE TABLE guilds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  motto TEXT,
  description TEXT,
  emblem_url TEXT,
  emblem_config JSONB DEFAULT '{}',
  guild_type TEXT NOT NULL DEFAULT 'open' CHECK (guild_type IN ('open', 'application', 'invite')),
  rules JSONB DEFAULT '[]',
  level INTEGER DEFAULT 1,
  total_points INTEGER DEFAULT 0,
  season_points INTEGER DEFAULT 0,
  treasury_points INTEGER DEFAULT 0,
  heat_level INTEGER DEFAULT 50 CHECK (heat_level BETWEEN 0 AND 100),
  tier TEXT DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'diamond', 'obsidian')),
  max_members INTEGER DEFAULT 5,
  member_count INTEGER DEFAULT 0,
  min_streak_requirement INTEGER DEFAULT 0,
  min_phase_requirement INTEGER DEFAULT 1,
  min_score_requirement INTEGER DEFAULT 0,
  founder_id UUID REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Guild Members
CREATE TABLE guild_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id UUID REFERENCES guilds(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'raw' CHECK (role IN ('blacksmith', 'striker', 'tempered', 'heated', 'raw')),
  joined_at TIMESTAMPTZ DEFAULT now(),
  promoted_at TIMESTAMPTZ,
  contribution_points INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  UNIQUE(guild_id, user_id)
);

-- Guild Quests
CREATE TABLE guild_quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id UUID REFERENCES guilds(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT,
  quest_type TEXT NOT NULL CHECK (quest_type IN ('weekly', 'challenge', 'brotherhood', 'external', 'sprint')),
  target_value INTEGER,
  current_value INTEGER DEFAULT 0,
  points_reward INTEGER NOT NULL DEFAULT 100,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed', 'cancelled')),
  completion_rate DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Guild Quest Participants
CREATE TABLE guild_quest_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_id UUID REFERENCES guild_quests(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'assigned' CHECK (status IN ('assigned', 'accepted', 'in_progress', 'proof_submitted', 'approved', 'rejected')),
  proof_url TEXT,
  proof_note TEXT,
  completed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id),
  UNIQUE(quest_id, user_id)
);

-- Seasons
CREATE TABLE seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  season_number INTEGER NOT NULL,
  year INTEGER NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Season Results
CREATE TABLE season_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id UUID REFERENCES seasons(id) ON DELETE CASCADE,
  guild_id UUID REFERENCES guilds(id) ON DELETE CASCADE,
  final_score INTEGER NOT NULL DEFAULT 0,
  final_tier TEXT NOT NULL DEFAULT 'bronze',
  tier_change TEXT CHECK (tier_change IN ('ascend', 'hold', 'descend')),
  rank_in_tier INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(season_id, guild_id)
);

-- Guild Challenges
CREATE TABLE guild_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenger_id UUID REFERENCES guilds(id),
  challenged_id UUID REFERENCES guilds(id),
  challenge_type TEXT NOT NULL CHECK (challenge_type IN ('spark_duel', 'heat_wave', 'iron_week', 'blacksmith_bet')),
  challenger_score INTEGER DEFAULT 0,
  challenged_score INTEGER DEFAULT 0,
  winner_id UUID REFERENCES guilds(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'live', 'completed')),
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Alliances
CREATE TABLE alliances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  emblem_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE alliance_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alliance_id UUID REFERENCES alliances(id) ON DELETE CASCADE,
  guild_id UUID REFERENCES guilds(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(alliance_id, guild_id)
);

-- Guild Messages
CREATE TABLE guild_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id UUID REFERENCES guilds(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  channel TEXT DEFAULT 'general' CHECK (channel IN ('general', 'command', 'forge_room', 'war_room')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Guild Heat Log
CREATE TABLE guild_heat_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id UUID REFERENCES guilds(id) ON DELETE CASCADE,
  change_amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  new_value INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Weekly Rankings Snapshot
CREATE TABLE weekly_rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id UUID REFERENCES guilds(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  rank_position INTEGER NOT NULL,
  score INTEGER NOT NULL,
  is_forge_of_week BOOLEAN DEFAULT false,
  is_rising_fire BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(guild_id, week_start)
);

-- INDEXES
CREATE INDEX idx_guild_members_guild ON guild_members(guild_id) WHERE is_active = true;
CREATE INDEX idx_guild_members_user ON guild_members(user_id) WHERE is_active = true;
CREATE INDEX idx_guild_quests_guild ON guild_quests(guild_id, status);
CREATE INDEX idx_guild_messages_guild ON guild_messages(guild_id, channel, created_at DESC);
CREATE INDEX idx_guilds_tier_points ON guilds(tier, season_points DESC) WHERE is_active = true;
CREATE INDEX idx_guild_challenges_status ON guild_challenges(status, starts_at);
CREATE INDEX idx_season_results_season ON season_results(season_id, final_tier, rank_in_tier);
CREATE INDEX idx_weekly_rankings_week ON weekly_rankings(week_start, rank_position);

-- RLS
ALTER TABLE guilds ENABLE ROW LEVEL SECURITY;
ALTER TABLE guild_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE guild_quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE guild_quest_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE season_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE guild_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE alliances ENABLE ROW LEVEL SECURITY;
ALTER TABLE alliance_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE guild_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE guild_heat_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_rankings ENABLE ROW LEVEL SECURITY;

-- RLS Policies: guilds readable by all authenticated, writable by founder
CREATE POLICY "Guilds are viewable by authenticated users" ON guilds FOR SELECT TO authenticated USING (true);
CREATE POLICY "Guilds are creatable by authenticated users" ON guilds FOR INSERT TO authenticated WITH CHECK (auth.uid() = founder_id);
CREATE POLICY "Guilds are updatable by founder or striker" ON guilds FOR UPDATE TO authenticated USING (
  auth.uid() = founder_id OR EXISTS (
    SELECT 1 FROM guild_members WHERE guild_members.guild_id = guilds.id AND guild_members.user_id = auth.uid() AND guild_members.role IN ('blacksmith', 'striker') AND guild_members.is_active = true
  )
);

-- RLS Policies: guild_members
CREATE POLICY "Guild members viewable by authenticated" ON guild_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can join guilds" ON guild_members FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Members can update own record" ON guild_members FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- RLS Policies: guild_quests
CREATE POLICY "Guild quests viewable by members" ON guild_quests FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM guild_members WHERE guild_members.guild_id = guild_quests.guild_id AND guild_members.user_id = auth.uid() AND guild_members.is_active = true)
);
CREATE POLICY "Guild quests creatable by tempered+" ON guild_quests FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM guild_members WHERE guild_members.guild_id = guild_quests.guild_id AND guild_members.user_id = auth.uid() AND guild_members.role IN ('blacksmith', 'striker', 'tempered') AND guild_members.is_active = true)
);

-- RLS Policies: guild_quest_participants
CREATE POLICY "Quest participants viewable by guild" ON guild_quest_participants FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM guild_quests gq JOIN guild_members gm ON gm.guild_id = gq.guild_id WHERE gq.id = guild_quest_participants.quest_id AND gm.user_id = auth.uid() AND gm.is_active = true)
);
CREATE POLICY "Users can update own quest participation" ON guild_quest_participants FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Quest participants insertable by tempered+" ON guild_quest_participants FOR INSERT TO authenticated WITH CHECK (true);

-- RLS Policies: seasons (read-only for users)
CREATE POLICY "Seasons viewable by all authenticated" ON seasons FOR SELECT TO authenticated USING (true);

-- RLS Policies: season_results (read-only)
CREATE POLICY "Season results viewable by all authenticated" ON season_results FOR SELECT TO authenticated USING (true);

-- RLS Policies: guild_challenges
CREATE POLICY "Challenges viewable by authenticated" ON guild_challenges FOR SELECT TO authenticated USING (true);
CREATE POLICY "Challenges creatable by blacksmith/striker" ON guild_challenges FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM guild_members WHERE guild_members.guild_id = guild_challenges.challenger_id AND guild_members.user_id = auth.uid() AND guild_members.role IN ('blacksmith', 'striker') AND guild_members.is_active = true)
);

-- RLS Policies: alliances
CREATE POLICY "Alliances viewable by authenticated" ON alliances FOR SELECT TO authenticated USING (true);
CREATE POLICY "Alliance members viewable by authenticated" ON alliance_members FOR SELECT TO authenticated USING (true);

-- RLS Policies: guild_messages
CREATE POLICY "Guild messages viewable by members" ON guild_messages FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM guild_members WHERE guild_members.guild_id = guild_messages.guild_id AND guild_members.user_id = auth.uid() AND guild_members.is_active = true)
);
CREATE POLICY "Guild messages insertable by members" ON guild_messages FOR INSERT TO authenticated WITH CHECK (
  auth.uid() = user_id AND EXISTS (SELECT 1 FROM guild_members WHERE guild_members.guild_id = guild_messages.guild_id AND guild_members.user_id = auth.uid() AND guild_members.is_active = true)
);

-- RLS Policies: guild_heat_log (read-only)
CREATE POLICY "Heat log viewable by guild members" ON guild_heat_log FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM guild_members WHERE guild_members.guild_id = guild_heat_log.guild_id AND guild_members.user_id = auth.uid() AND guild_members.is_active = true)
);

-- RLS Policies: weekly_rankings (read-only)
CREATE POLICY "Weekly rankings viewable by all" ON weekly_rankings FOR SELECT TO authenticated USING (true);

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE guild_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE guild_members;
ALTER PUBLICATION supabase_realtime ADD TABLE guilds;

-- Updated_at trigger for guilds
CREATE TRIGGER update_guilds_updated_at BEFORE UPDATE ON guilds FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

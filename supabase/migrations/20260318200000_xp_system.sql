-- Add XP column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;

-- XP log table
CREATE TABLE xp_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  source TEXT NOT NULL, -- 'checkin', 'task', 'life_area', 'community', 'guild_quest', 'streak_bonus'
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE xp_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own xp" ON xp_log FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Service can insert xp" ON xp_log FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_xp_log_user ON xp_log(user_id, created_at DESC);

-- Function to add XP and auto-level
CREATE OR REPLACE FUNCTION add_xp(p_user_id UUID, p_amount INTEGER, p_source TEXT, p_description TEXT DEFAULT NULL)
RETURNS void AS $$
DECLARE
  new_xp INTEGER;
  new_level INTEGER;
BEGIN
  -- Add XP
  UPDATE profiles SET xp = xp + p_amount WHERE user_id = p_user_id RETURNING xp INTO new_xp;

  -- Calculate level (every 100 XP = 1 level)
  new_level := GREATEST(1, new_xp / 100);
  UPDATE profiles SET level = new_level WHERE user_id = p_user_id;

  -- Log
  INSERT INTO xp_log (user_id, amount, source, description) VALUES (p_user_id, p_amount, p_source, p_description);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

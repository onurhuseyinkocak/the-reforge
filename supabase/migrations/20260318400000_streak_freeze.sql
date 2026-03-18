ALTER TABLE profiles ADD COLUMN IF NOT EXISTS streak_freezes_remaining INTEGER DEFAULT 1;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS streak_freeze_used_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS streak_freeze_resets_at TIMESTAMPTZ;

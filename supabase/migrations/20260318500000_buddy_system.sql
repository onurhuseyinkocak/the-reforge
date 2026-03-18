CREATE TABLE buddy_pairs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_b UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'ended')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_a, user_b)
);

ALTER TABLE buddy_pairs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own buddy pairs" ON buddy_pairs FOR SELECT TO authenticated
  USING (auth.uid() = user_a OR auth.uid() = user_b);
CREATE POLICY "Users can create buddy requests" ON buddy_pairs FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_a);
CREATE POLICY "Users can update buddy pairs they're in" ON buddy_pairs FOR UPDATE TO authenticated
  USING (auth.uid() = user_a OR auth.uid() = user_b);

CREATE INDEX idx_buddy_user_a ON buddy_pairs(user_a, status);
CREATE INDEX idx_buddy_user_b ON buddy_pairs(user_b, status);

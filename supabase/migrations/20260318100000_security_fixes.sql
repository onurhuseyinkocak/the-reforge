-- ============================================================
-- THE FORGE — P1 Security Fixes Migration
-- 2026-03-18
-- ============================================================

-- ────────────────────────────────────────────────
-- 1. Applications table: spam prevention
--    Add UNIQUE constraint on email to prevent duplicate applications
-- ────────────────────────────────────────────────

ALTER TABLE public.applications
  ADD CONSTRAINT applications_email_unique UNIQUE (email);

-- ────────────────────────────────────────────────
-- 2. Achievements table: remove self-insert exploit
--    Users should NOT be able to insert their own achievements.
--    Only service_role (backend/edge functions) can insert.
--    Keep SELECT policy intact.
-- ────────────────────────────────────────────────

DROP POLICY IF EXISTS "Users can insert own achievements" ON public.achievements;

-- ────────────────────────────────────────────────
-- 3. Add missing performance indexes
-- ────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_checkins_user_date
  ON checkins(user_id, checkin_date);

CREATE INDEX IF NOT EXISTS idx_student_tasks_user
  ON student_tasks(user_id);

CREATE INDEX IF NOT EXISTS idx_messages_receiver_read
  ON messages(receiver_id, is_read);

CREATE INDEX IF NOT EXISTS idx_life_area_entries_user_date
  ON life_area_entries(user_id, entry_date);

CREATE INDEX IF NOT EXISTS idx_profiles_status
  ON profiles(status);

CREATE INDEX IF NOT EXISTS idx_payments_status_due
  ON payments(status, due_date);

-- ============================================
-- THE FORGE — Add missing fields to checkins
-- Migration: 20260318200000_checkins_add_missing_fields
-- ============================================
-- These fields were collected in the evening check-in form
-- but never included in the upsert payload / schema.

ALTER TABLE checkins ADD COLUMN IF NOT EXISTS biggest_win TEXT;
ALTER TABLE checkins ADD COLUMN IF NOT EXISTS tomorrow_improvement TEXT;

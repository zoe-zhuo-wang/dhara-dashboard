-- ============================================
-- Drop unused people columns (role, daily_rate, skills, is_active)
-- The frontend does not use any of these. Run in Supabase SQL Editor.
-- ============================================
ALTER TABLE people DROP COLUMN IF EXISTS role;
ALTER TABLE people DROP COLUMN IF EXISTS daily_rate;
ALTER TABLE people DROP COLUMN IF EXISTS skills;
ALTER TABLE people DROP COLUMN IF EXISTS is_active;

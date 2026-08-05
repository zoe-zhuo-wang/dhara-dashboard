-- ============================================
-- Drop the unused settings table (team name / currency page was never built).
-- No frontend code reads or writes `settings`. Run in Supabase SQL Editor.
-- ============================================
DROP POLICY IF EXISTS "Settings: authenticated can read" ON settings;
DROP POLICY IF EXISTS "Settings: authenticated can all" ON settings;
DROP POLICY IF EXISTS "Settings: authenticated all" ON settings;
DROP TABLE IF EXISTS settings;
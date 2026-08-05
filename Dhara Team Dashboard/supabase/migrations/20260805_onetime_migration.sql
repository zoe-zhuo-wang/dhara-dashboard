-- ============================================
-- One-shot migration for Supabase SQL Editor
--   1) Drop unused `settings` table
--   2) Enforce UNIQUE on people.email
-- All statements are idempotent — safe to re-run.
-- ============================================

-- ---- 1) Drop unused settings table (no UI ever read/wrote it) ----
DROP POLICY IF EXISTS "Settings: authenticated can read" ON settings;
DROP POLICY IF EXISTS "Settings: authenticated can all" ON settings;
DROP POLICY IF EXISTS "Settings: authenticated all" ON settings;
DROP TABLE IF EXISTS settings;

-- ---- 2) Enforce email uniqueness on people ----
-- 2a) Duplicate check (should return 0 rows; de-dupe first if it returns rows)
SELECT email, COUNT(*) FROM people GROUP BY email HAVING COUNT(*) > 1;

-- 2b) Apply the UNIQUE constraint (idempotent)
ALTER TABLE people DROP CONSTRAINT IF EXISTS people_email_unique;
ALTER TABLE people ADD CONSTRAINT people_email_unique UNIQUE (email);

-- 2c) Verify (expect: people_email_unique)
SELECT conname, contype
FROM pg_constraint
WHERE conrelid = 'public.people'::regclass AND conname = 'people_email_unique';

-- 2d) Confirm settings is gone (expect: no rows)
SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename = 'settings';
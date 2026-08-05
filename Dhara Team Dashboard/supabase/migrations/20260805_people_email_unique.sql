-- ============================================
-- Enforce email uniqueness on people (people_email_unique)
-- Run in Supabase SQL Editor.
-- ============================================

-- 1. Sanity check for existing duplicates BEFORE applying the constraint
--    (should return 0 rows; if rows exist, de-dupe them first)
SELECT email, COUNT(*) FROM people GROUP BY email HAVING COUNT(*) > 1;

-- 2. Apply the UNIQUE constraint (idempotent — safe to re-run)
ALTER TABLE people DROP CONSTRAINT IF EXISTS people_email_unique;
ALTER TABLE people ADD CONSTRAINT people_email_unique UNIQUE (email);

-- 3. Verify it is in place (expect: people_email_unique)
SELECT conname, contype
FROM pg_constraint
WHERE conrelid = 'public.people'::regclass AND conname = 'people_email_unique';

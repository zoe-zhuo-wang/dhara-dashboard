-- ============================================
-- DEMO READ-ONLY MODE (TEMP) — run in Supabase SQL Editor BEFORE demo.
-- Opens anonymous SELECT on all app tables so ?demo=1 can show REAL data
-- without needing GoTrue sign-in (Supabase Auth outage workaround).
-- Writes stay authenticated-only. REVERT AFTER DEMO with demo_readonly_revert.sql
-- ============================================

-- Table-level grants (needed for anon reads; whitelist has none by default)
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON public.people, public.projects, public.project_members, public.allocations, public.profiles, public.whitelist TO anon;

-- RLS policies: allow anonymous SELECT (writes remain authenticated-only)
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['profiles','projects','people','project_members','allocations','whitelist']
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "DEMO anon read" ON %I', t);
    EXECUTE format('CREATE POLICY "DEMO anon read" ON %I FOR SELECT TO anon USING (true)', t);
  END LOOP;
END $$;

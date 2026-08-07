-- ============================================
-- DEMO READ-ONLY MODE (REVERT) — run in Supabase SQL Editor AFTER demo.
-- Removes the temporary anonymous read policies AND grants added by demo_readonly.sql.
-- Anonymous access returns to fully denied (authenticated-only, per private-rls.sql).
-- ============================================

DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['profiles','projects','people','project_members','allocations','whitelist']
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "DEMO anon read" ON %I', t);
  END LOOP;
END $$;

REVOKE SELECT ON public.people, public.projects, public.project_members, public.allocations, public.profiles, public.whitelist FROM anon;
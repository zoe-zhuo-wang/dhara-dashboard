-- ============================================
-- Private RLS (definitive v2): ENABLE RLS + restrict all tables to authenticated users only
-- Fixes the case where RLS was left DISABLED (relrowsecurity = false)
-- Idempotent: safe to run multiple times.
-- Run this in Supabase SQL Editor.
-- ============================================

-- 1. ENABLE Row Level Security on every table (turns the switch ON explicitly)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE people ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- 2. Drop EVERY existing policy on these tables (any name, any shape)
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT policyname, tablename
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('profiles','projects','people','project_members','allocations','settings')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', r.policyname, r.tablename);
  END LOOP;
END $$;

-- 3. Recreate: only logged-in users (role = authenticated) can read & write.
--    Anonymous visitors get no access; existing data & accounts are unaffected.
CREATE POLICY "Projects: authenticated all" ON projects FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "People: authenticated all" ON people FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Project members: authenticated all" ON project_members FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allocations: authenticated all" ON allocations FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Settings: authenticated all" ON settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Profiles: authenticated read" ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Profiles: users can update own" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

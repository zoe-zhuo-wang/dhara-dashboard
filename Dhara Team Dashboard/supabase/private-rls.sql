-- ============================================
-- Private RLS (definitive): enable RLS + restrict all tables to authenticated users only
-- Idempotent: safe to run multiple times.
-- Run this in Supabase SQL Editor.
-- ============================================

-- 1. Enable (and force) Row Level Security on every table
ALTER TABLE profiles FORCE ROW LEVEL SECURITY;
ALTER TABLE projects FORCE ROW LEVEL SECURITY;
ALTER TABLE people FORCE ROW LEVEL SECURITY;
ALTER TABLE project_members FORCE ROW LEVEL SECURITY;
ALTER TABLE allocations FORCE ROW LEVEL SECURITY;
ALTER TABLE settings FORCE ROW LEVEL SECURITY;

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

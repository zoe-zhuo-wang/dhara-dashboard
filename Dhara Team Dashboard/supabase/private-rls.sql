-- ============================================
-- Private RLS: enable RLS + restrict all tables to authenticated users only
-- Supersedes the permissive "allow all" policies from fix-rls.sql
-- Run this in Supabase SQL Editor.
-- ============================================

-- 1. Enable Row Level Security on every table
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE people ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 2. Drop old permissive policies (from fix-rls.sql)
DROP POLICY IF EXISTS "Projects: allow all" ON projects;
DROP POLICY IF EXISTS "People: allow all" ON people;
DROP POLICY IF EXISTS "Project members: allow all" ON project_members;
DROP POLICY IF EXISTS "Allocations: allow all" ON allocations;
DROP POLICY IF EXISTS "Settings: allow all" ON settings;

-- 3. Drop original schema policies so we keep a single clean set
DROP POLICY IF EXISTS "Projects: authenticated can read" ON projects;
DROP POLICY IF EXISTS "Projects: authenticated can insert" ON projects;
DROP POLICY IF EXISTS "Projects: authenticated can update" ON projects;
DROP POLICY IF EXISTS "Projects: authenticated can delete" ON projects;

DROP POLICY IF EXISTS "People: authenticated can read" ON people;
DROP POLICY IF EXISTS "People: authenticated can insert" ON people;
DROP POLICY IF EXISTS "People: authenticated can update" ON people;
DROP POLICY IF EXISTS "People: authenticated can delete" ON people;

DROP POLICY IF EXISTS "Project members: authenticated can read" ON project_members;
DROP POLICY IF EXISTS "Project members: authenticated can insert" ON project_members;
DROP POLICY IF EXISTS "Project members: authenticated can update" ON project_members;
DROP POLICY IF EXISTS "Project members: authenticated can delete" ON project_members;

DROP POLICY IF EXISTS "Allocations: authenticated can read" ON allocations;
DROP POLICY IF EXISTS "Allocations: authenticated can insert" ON allocations;
DROP POLICY IF EXISTS "Allocations: authenticated can update" ON allocations;
DROP POLICY IF EXISTS "Allocations: authenticated can delete" ON allocations;

DROP POLICY IF EXISTS "Settings: authenticated can read" ON settings;
DROP POLICY IF EXISTS "Settings: authenticated can all" ON settings;

DROP POLICY IF EXISTS "Profiles: anyone can read" ON profiles;
DROP POLICY IF EXISTS "Profiles: users can update own" ON profiles;
DROP POLICY IF EXISTS "Profiles: users can insert own" ON profiles;

-- 4. Recreate: only logged-in users (role = authenticated) can read & write.
--    Anonymous visitors get no access; existing data & accounts are unaffected.
DROP POLICY IF EXISTS "Projects: authenticated all" ON projects;
DROP POLICY IF EXISTS "People: authenticated all" ON people;
DROP POLICY IF EXISTS "Project members: authenticated all" ON project_members;
DROP POLICY IF EXISTS "Allocations: authenticated all" ON allocations;
DROP POLICY IF EXISTS "Settings: authenticated all" ON settings;

CREATE POLICY "Projects: authenticated all" ON projects FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "People: authenticated all" ON people FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Project members: authenticated all" ON project_members FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allocations: authenticated all" ON allocations FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Settings: authenticated all" ON settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Profiles: authenticated read" ON profiles;
DROP POLICY IF EXISTS "Profiles: users can update own" ON profiles;

CREATE POLICY "Profiles: authenticated read" ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Profiles: users can update own" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

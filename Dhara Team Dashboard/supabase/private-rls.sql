-- ============================================
-- Private RLS: restrict all tables to authenticated users only
-- Supersedes the permissive "allow all" policies from fix-rls.sql
-- Run this in Supabase SQL Editor.
-- ============================================

-- Drop permissive (public / anon accessible) policies
DROP POLICY IF EXISTS "Projects: allow all" ON projects;
DROP POLICY IF EXISTS "People: allow all" ON people;
DROP POLICY IF EXISTS "Project members: allow all" ON project_members;
DROP POLICY IF EXISTS "Allocations: allow all" ON allocations;
DROP POLICY IF EXISTS "Settings: allow all" ON settings;

-- Recreate: only logged-in users (role = authenticated) can read & write.
-- Anonymous visitors get no access; existing data & accounts are unaffected.
CREATE POLICY "Projects: authenticated all" ON projects FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "People: authenticated all" ON people FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Project members: authenticated all" ON project_members FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allocations: authenticated all" ON allocations FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Settings: authenticated all" ON settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Fix: allow all operations for authenticated and anon roles
-- Run this in Supabase SQL Editor

-- Drop old restrictive policies
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

-- Create new permissive policies (allow both anon and authenticated)
CREATE POLICY "Projects: allow all" ON projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "People: allow all" ON people FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Project members: allow all" ON project_members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allocations: allow all" ON allocations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Settings: allow all" ON settings FOR ALL USING (true) WITH CHECK (true);

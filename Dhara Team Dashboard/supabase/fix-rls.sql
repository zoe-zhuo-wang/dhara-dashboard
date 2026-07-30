-- ============================================
-- Migration: dt_focal_id 从单个 UUID 改为 TEXT（逗号分隔，支持多人）
-- ============================================
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_dt_focal_id_fkey;
ALTER TABLE projects ALTER COLUMN dt_focal_id TYPE TEXT;

-- ============================================
-- Migration: people.email 唯一约束
-- ============================================
DELETE FROM people a USING people b WHERE a.id > b.id AND LOWER(a.email) = LOWER(b.email);
ALTER TABLE people ADD CONSTRAINT people_email_unique UNIQUE (email);

-- ============================================
-- Fix: allow all operations for authenticated and anon roles
-- ============================================

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

-- ============================================
-- RLS: all signed-in team members get full access (view / edit / delete).
-- Code & schema access stays private (GitHub repo + Supabase owner only).
-- - All logged-in users (authenticated): SELECT / INSERT / UPDATE / DELETE
-- - Anonymous: no access
-- Idempotent: safe to run multiple times.
-- Run this in Supabase SQL Editor.
-- ============================================

-- 1. Make sure RLS is enabled everywhere
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE people ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- 2. Drop every existing policy on these tables (any name, any shape)
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

-- 3. Projects: full access for any logged-in member
CREATE POLICY "Projects: authenticated all" ON projects FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. People: full access for any logged-in member
CREATE POLICY "People: authenticated all" ON people FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 5. Project members: full access for any logged-in member
CREATE POLICY "Project members: authenticated all" ON project_members FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 6. Allocations: full access for any logged-in member
CREATE POLICY "Allocations: authenticated all" ON allocations FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 7. Settings: full access for any logged-in member
CREATE POLICY "Settings: authenticated all" ON settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 8. Profiles: everyone can view; users can update their own profile
CREATE POLICY "Profiles: authenticated read" ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Profiles: users can update own" ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

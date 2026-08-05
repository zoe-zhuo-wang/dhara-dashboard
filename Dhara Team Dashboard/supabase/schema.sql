-- ============================================
-- Allo Dashboard - Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Profiles table (extends Supabase Auth users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  team_group TEXT NOT NULL DEFAULT 'General',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  budget NUMERIC(12, 2) DEFAULT 0,
  spent NUMERIC(12, 2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'completed', 'cancelled')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  start_date DATE,
  end_date DATE,
  category TEXT DEFAULT 'General',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. People table
CREATE TABLE IF NOT EXISTS people (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  team_group TEXT NOT NULL DEFAULT 'General',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Project members (many-to-many)
CREATE TABLE IF NOT EXISTS project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  person_id UUID REFERENCES people(id) ON DELETE CASCADE,
  allocation_pct INTEGER DEFAULT 100 CHECK (allocation_pct >= 0 AND allocation_pct <= 100),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, person_id)
);

-- 5. Allocations table (Man-Day tracking)
CREATE TABLE IF NOT EXISTS allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  person_id UUID REFERENCES people(id) ON DELETE CASCADE,
  year INTEGER NOT NULL CHECK (year >= 2024 AND year <= 2030),
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  planned_md NUMERIC(6, 2) DEFAULT 0,
  actual_md NUMERIC(6, 2) DEFAULT 0,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, person_id, year, month)
);

-- ============================================
-- Row Level Security (RLS)
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE people ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE allocations ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read all, update own
CREATE POLICY "Profiles: anyone can read" ON profiles FOR SELECT USING (true);
CREATE POLICY "Profiles: users can update own" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Profiles: users can insert own" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Projects: authenticated users can CRUD
CREATE POLICY "Projects: authenticated can read" ON projects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Projects: authenticated can insert" ON projects FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Projects: authenticated can update" ON projects FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Projects: authenticated can delete" ON projects FOR DELETE TO authenticated USING (true);

-- People: authenticated users can CRUD
CREATE POLICY "People: authenticated can read" ON people FOR SELECT TO authenticated USING (true);
CREATE POLICY "People: authenticated can insert" ON people FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "People: authenticated can update" ON people FOR UPDATE TO authenticated USING (true);
CREATE POLICY "People: authenticated can delete" ON people FOR DELETE TO authenticated USING (true);

-- Project members: authenticated users can CRUD
CREATE POLICY "Project members: authenticated can read" ON project_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "Project members: authenticated can insert" ON project_members FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Project members: authenticated can update" ON project_members FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Project members: authenticated can delete" ON project_members FOR DELETE TO authenticated USING (true);

-- Allocations: authenticated users can CRUD
CREATE POLICY "Allocations: authenticated can read" ON allocations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allocations: authenticated can insert" ON allocations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allocations: authenticated can update" ON allocations FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allocations: authenticated can delete" ON allocations FOR DELETE TO authenticated USING (true);

-- ============================================
-- Trigger: auto-create profile on signup
-- ============================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'member'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- v1.1: DT Focal + Funding Type
-- ============================================

-- dt_focal_id: 逗号分隔的 person UUID 字符串（v2026-07-30 改为 TEXT 支持多人）
ALTER TABLE projects ADD COLUMN IF NOT EXISTS dt_focal_id TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS funding_type TEXT CHECK (funding_type IN ('R&D', 'R&D AI', 'Vendor Onboarding', 'BAU'));

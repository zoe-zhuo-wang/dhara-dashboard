-- ============================================
-- 2026-08-06 RLS 诊断 + 修复
-- 现象：匿名(anon)读取 projects 返回了真实数据，违反"匿名=无访问"
-- 目的：先看现场，再重放 private-rls.sql 修复，最后复查
-- 用法：在 Supabase Dashboard -> SQL Editor 整段运行
-- ============================================

-- ---------- 1. 诊断：当前 RLS 状态 ----------
SELECT
  c.relname AS table_name,
  c.relrowsecurity AS rls_enabled,
  c.relforcerowsecurity AS rls_forced
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relkind = 'r'
  AND c.relname IN ('profiles','projects','people','project_members','allocations','whitelist')
ORDER BY c.relname;

-- 现有 policy 一览（看有没有 anon/any role 的）
SELECT tablename, policyname, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('profiles','projects','people','project_members','allocations','whitelist')
ORDER BY tablename, policyname;

-- ---------- 2. 直接重放权威 RLS 脚本（幂等，可反复跑） ----------
-- 等价于 supabase/private-rls.sql，此处内联，确保不依赖本地文件
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE people ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE whitelist ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT policyname, tablename
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('profiles','projects','people','project_members','allocations','whitelist')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', r.policyname, r.tablename);
  END LOOP;
END $$;

CREATE POLICY "Projects: authenticated all" ON projects FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "People: authenticated all" ON people FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Project members: authenticated all" ON project_members FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allocations: authenticated all" ON allocations FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Whitelist: authenticated all" ON whitelist FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Profiles: authenticated read" ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Profiles: users can update own" ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.is_whitelisted(p_email TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.whitelist
    WHERE active = TRUE AND email = LOWER(BTRIM(p_email))
  );
$$;

REVOKE ALL ON FUNCTION public.is_whitelisted(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_whitelisted(TEXT) TO anon, authenticated;

-- ---------- 3. 复查 ----------
SELECT
  c.relname AS table_name,
  c.relrowsecurity AS rls_enabled
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relkind = 'r'
  AND c.relname IN ('profiles','projects','people','project_members','allocations','whitelist')
ORDER BY c.relname;

SELECT tablename, policyname, roles, cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('profiles','projects','people','project_members','allocations','whitelist')
ORDER BY tablename, policyname;

-- 期望结果：6 张表 rls_enabled = t；policies 里 roles 全部只有 authenticated，没有 anon。

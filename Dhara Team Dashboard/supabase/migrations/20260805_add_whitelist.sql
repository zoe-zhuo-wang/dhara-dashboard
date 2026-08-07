-- ============================================
-- Whitelist: email allow-list controlling who can log in / create an account.
-- - Members (authenticated) manage it freely (view / add / enable / disable / delete).
-- - A public is_whitelisted(email) RPC backs the pre-signup gate so anyone can
--   check THEIR OWN email without being logged in, without exposing the whole list.
-- - Only active entries may create an account / continue to be signed in.
-- Run in Supabase SQL Editor. Idempotent.
-- ============================================

-- 1. Table
CREATE TABLE IF NOT EXISTS whitelist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  note TEXT DEFAULT '',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE whitelist ENABLE ROW LEVEL SECURITY;

-- 2. RLS: any signed-in member can view / add / enable / disable / delete
DROP POLICY IF EXISTS "Whitelist: authenticated all" ON whitelist;
CREATE POLICY "Whitelist: authenticated all" ON whitelist FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 3. Public one-purpose check (returns only boolean; used before account creation).
--    SECURITY DEFINER lets an anonymous caller check whitelist membership for the
--    signup gate without being able to enumerate the list.
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

-- 4. Seed: everyone currently on the roster (people.email) or with an account so
-- nothing breaks on rollout. New/un-listed addresses get added via the UI.
INSERT INTO whitelist (email, active, note)
SELECT LOWER(BTRIM(email)), TRUE, 'seeded from people/auth'
FROM (
  SELECT COALESCE(p.email, u.email) AS email
  FROM auth.users u
  LEFT JOIN public.people p ON LOWER(p.email) = LOWER(u.email)
  WHERE COALESCE(p.email, u.email) IS NOT NULL AND COALESCE(p.email, u.email) <> ''
  UNION
  SELECT email FROM public.people WHERE email IS NOT NULL AND email <> ''
) s
ON CONFLICT (email) DO NOTHING;
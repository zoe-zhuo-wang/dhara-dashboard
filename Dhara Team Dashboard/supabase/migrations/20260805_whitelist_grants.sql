-- ============================================
-- Whitelist table grants (permanent)
-- Tables created via SQL Editor sometimes miss the auto-grants that
-- Supabase applies to dashboard-created tables. Without these, even
-- authenticated users get 42501 "permission denied for table whitelist".
-- Run in Supabase SQL Editor. Idempotent.
-- ============================================

GRANT SELECT, INSERT, UPDATE, DELETE ON public.whitelist TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.whitelist TO service_role;

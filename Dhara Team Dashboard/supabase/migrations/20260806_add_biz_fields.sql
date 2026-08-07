-- 2026-08-06: Add Biz Group / Biz Focal / IT Focal to projects
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS biz_group TEXT,
  ADD COLUMN IF NOT EXISTS biz_focal TEXT,
  ADD COLUMN IF NOT EXISTS it_focal TEXT;
-- 2026-08-06: Structured Key Updates (Progress / Next Steps / Blockers / ETA / Owner)
-- Snapshot + last-week model: last_update JSONB holds the previous snapshot.
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS progress TEXT,
  ADD COLUMN IF NOT EXISTS next_steps TEXT,
  ADD COLUMN IF NOT EXISTS blockers TEXT,
  ADD COLUMN IF NOT EXISTS eta DATE,
  ADD COLUMN IF NOT EXISTS owner TEXT,
  ADD COLUMN IF NOT EXISTS last_update JSONB,
  ADD COLUMN IF NOT EXISTS updates_updated_at TIMESTAMPTZ;

-- Migrate legacy key_updates content into progress, then drop the column
UPDATE projects SET progress = key_updates WHERE progress IS NULL AND key_updates IS NOT NULL;
ALTER TABLE projects DROP COLUMN IF EXISTS key_updates;

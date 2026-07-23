-- Run this in Supabase SQL Editor
ALTER TABLE projects ADD COLUMN IF NOT EXISTS dt_focal_id UUID REFERENCES people(id) ON DELETE SET NULL;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS funding_type TEXT CHECK (funding_type IN ('R&D', 'R&D AI', 'Vendor Onboarding', 'BAU'));

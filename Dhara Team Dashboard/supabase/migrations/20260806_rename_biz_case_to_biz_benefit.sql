-- 2026-08-06: Rename biz_case to biz_benefit (field holds expected business benefits only)
ALTER TABLE projects RENAME COLUMN biz_case TO biz_benefit;

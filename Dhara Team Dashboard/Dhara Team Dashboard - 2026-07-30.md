# Dhara Team Dashboard - Project Status

## Last Updated: 2026-07-30

---

## Overview

A team resource and project management dashboard for the Dhara team (Lenovo). Built with React + Supabase. Deployed via GitHub Pages (accessible from China).

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite |
| Charts | Recharts |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Hosting | GitHub Pages (https://zoe-zhuo-wang.github.io/dhara-dashboard/) |
| Router | HashRouter (SPA refresh on GitHub Pages) |

---

## Deployment

### Production (GitHub Pages)
- **URL:** https://zoe-zhuo-wang.github.io/dhara-dashboard/
- **Repo:** https://github.com/zoe-zhuo-wang/dhara-dashboard
- **Why GitHub Pages:** Vercel (`*.vercel.app`) is slow/blocked from China
- **Deploy command:** `npm run build && npx gh-pages -d dist --repo <url>`

### Local Dev
```bash
cd "C:\Users\Joy\Dhara Team Dashboard"
npm run dev
# Opens at http://localhost:5173/
```

---

## Supabase Project

- **URL:** https://nqygyktioiwabvyfziev.supabase.co
- **Dashboard:** https://supabase.com/dashboard
- **Anon Key:** (stored in `.env`)
- **Region:** Asia-Pacific
- **Auth:** Email (confirmation disabled)
- **Email:** wangzhuo18@lenovo.com (admin)

---

## Database Tables

| Table | Purpose |
|-------|---------|
| profiles | User profiles (extends auth.users) |
| projects | Project records with budget/status/funding_type/dt_focal_id |
| people | Team members with email/skills/team_group |
| project_members | Many-to-many (currently unused / dead code) |
| allocations | Monthly Man-Day tracking (page removed, table kept) |
| settings | Key-value app configuration |

### Schema Location
- `supabase/schema.sql` — Full schema
- `supabase/fix-rls.sql` — RLS + migrations

---

## Pages

| Route | Page | Purpose |
|-------|------|---------|
| `/` | Dashboard | Overview cards + charts (bar, donut) |
| `/projects` | Projects | Project CRUD table with filters, search, export |
| `/people` | People | Team member cards with team filter |
| `/bms` | BMS (Presentation) | Weekly meeting review with inline edit |
| `/guide` | Guide | User guide with numbered workflow sections |
| `/settings` | Settings | Team config (not yet built) |

---

## Features Implemented

### ✅ Completed
- [x] Login / Sign up (Supabase Auth)
- [x] Dashboard — overview cards + bar/donut charts (Recharts)
- [x] Projects — full CRUD table, column picker, column filters, global search, Excel export, form validation
- [x] DT Focal — multi-person support via comma-separated TEXT column, checkbox multi-select in form, filter/sort/view adapted
- [x] People — CRUD cards, team filter (Regular/ISS), email uniqueness validation (frontend + DB constraint)
- [x] BMS (Presentation) — DT Focal filter, inline edit phase/status, rich text key updates, auto-save with success toast
- [x] Guide — redesigned with numbered cards, user-centric workflow order (Invite → Projects → Dashboard → People → BMS → Tips)
- [x] Invite team member (top-right button)
- [x] Sidebar with SVG icons + collapsible
- [x] Top bar with Invite button
- [x] Quick Add Person from within Project form
- [x] Light mode corporate design
- [x] Dashboard drag-and-drop (reorder widgets, saved to localStorage)
- [x] Role-based auth (admin / member)

### ⚠️ Pending / Not Yet Applied
- [ ] **DB Migration 1**: `ALTER TABLE projects ALTER COLUMN dt_focal_id TYPE TEXT` — needs to be run in Supabase SQL Editor
- [ ] **DB Migration 2**: `ALTER TABLE people ADD CONSTRAINT people_email_unique UNIQUE (email)` — needs to be run after dedup check
- [ ] RLS policies (currently wide open via `fix-rls.sql`)
- [ ] Settings page (team name, currency)

### 🔜 Future Ideas
- [ ] Role-based RLS (admin-only delete, etc.)
- [ ] Mobile responsive fine-tuning
- [ ] Audit log

---

## Key Design Decisions

### DT Focal Multi-Person
- Changed `dt_focal_id` from `UUID` (FK to people) to `TEXT` storing comma-separated UUIDs
- Form uses checkboxes instead of single `<select>`
- All list/filter/view/export code splits on `,` to handle multiple IDs
- Simpler than a junction table; no allocation percentages needed (user rejected `project_members` feature)

### Email Uniqueness
- Frontend checks via `supabase.from('people').ilike('email', ...)` before insert
- Quick Add Person (inside Project form) also validates
- DB-level `UNIQUE` constraint prepared but not yet applied (need to dedup first)

### BMS/Guide Pages
- BMS (Presentation.jsx): built as a weekly review view with inline editing, distinct from Projects CRUD
- Guide (Guide.jsx): user-facing docs, reordered by user workflow priority

---

## Migrations to Run

Run these in order in Supabase SQL Editor:

```sql
-- 1. DT Focal: UUID → TEXT
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_dt_focal_id_fkey;
ALTER TABLE projects ALTER COLUMN dt_focal_id TYPE TEXT;

-- 2. Email uniqueness (check for duplicates first)
--    SELECT email, COUNT(*) FROM people GROUP BY email HAVING COUNT(*) > 1;
ALTER TABLE people ADD CONSTRAINT people_email_unique UNIQUE (email);
```

---

## File Structure

```
C:\Users\Joy\Dhara Team Dashboard\
├── .env                          # Supabase credentials
├── index.html
├── package.json
├── vite.config.js
├── supabase/
│   ├── schema.sql               # Full DB schema
│   └── fix-rls.sql              # RLS fix + migrations
├── src/
│   ├── main.jsx
│   ├── App.jsx                   # Router + auth state
│   ├── index.css                 # Global styles
│   ├── lib/
│   │   └── supabase.js           # Supabase client init
│   ├── components/
│   │   └── Layout.jsx            # Sidebar + topbar + invite modal
│   └── pages/
│       ├── Login.jsx
│       ├── Dashboard.jsx
│       ├── Projects.jsx          # Project CRUD + DT Focal multi-select
│       ├── People.jsx            # Team cards + email uniqueness
│       ├── BMS.jsx               # BMS weekly review view
│       ├── Guide.jsx             # User guide
│       └── Settings.jsx          # (placeholder)
└── dist/
```

---

## Changelog

### 2026-07-30
- DT Focal: UUID → TEXT column, multi-person select (checkboxes), all filter/view/export adapted
- Email uniqueness: People + AddPersonModal validation, DB UNIQUE constraint prepared
- Guide: complete redesign with numbered cards, reordered by user workflow
- BMS toast: moved from card-level to fixed page-level position, confirmed working
- Allocations page removed (unused)
- Deployed to GitHub Pages

### 2026-07-24
- Initial GitHub Pages deployment
- HashRouter for SPA support
- Hardcoded Supabase credentials fallback

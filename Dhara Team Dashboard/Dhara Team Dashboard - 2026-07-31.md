# Dhara Team Dashboard - Project Status

## Last Updated: 2026-07-31

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
- **Deploy command:** `npm run deploy` (uses `gh-pages -d dist -r <repo-url>`; `-r` needed because there is no `origin` remote)

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
- **Anon Key:** (stored in `.env`, gitignored)
- **Region:** Asia-Pacific
- **Auth:** Email sign up / sign in (Login page has both "Sign In" and "Create Account")
- **Email:** wangzhuo18@lenovo.com (admin / owner)
- **RLS:** ENABLED on all 6 tables, policies = authenticated only (see `private-rls.sql`)

---

## Database Tables

| Table | Purpose |
|-------|---------|
| profiles | User profiles (extends auth.users, has `role` column, unused for now) |
| projects | Project records with budget/status/funding_type/dt_focal_id |
| people | Team members with email/skills/team_group (may have no login account) |
| project_members | Many-to-many (currently unused / dead code) |
| allocations | Monthly Man-Day tracking (page removed, table kept) |

### Schema Location
- `supabase/schema.sql` — Full schema
- `supabase/private-rls.sql` — **current** RLS + access model (idempotent, runnable)
- `supabase/fix-rls.sql` — older RLS migration (superseded)

---

## Pages

| Route | Page | Purpose |
|-------|------|---------|
| `/` | Dashboard | Overview cards + charts (bar, donut) |
| `/projects` | Projects | Project CRUD table with filters, search, export |
| `/people` | People | Team member cards with team filter |
| `/bms` | BMS (Presentation) | Weekly meeting review with inline edit |
| `/guide` | Guide | User guide with numbered workflow sections |

---

## Features Implemented

### ✅ Completed
- [x] Login / Sign up (Supabase Auth, email confirmation)
- [x] Dashboard — overview cards + bar/donut charts (Recharts)
- [x] Projects — full CRUD table, column picker, column filters, global search, Excel export, form validation
- [x] DT Focal — multi-person support via comma-separated TEXT column, checkbox multi-select in form, filter/sort/view adapted
- [x] People — CRUD cards, team filter (Regular/ISS), email uniqueness validation (frontend)
- [x] BMS (Presentation) — DT Focal filter, inline edit phase/status, rich text key updates, auto-save with success toast
- [x] Guide — redesigned with numbered cards, user-centric workflow order
- [x] Invite team member (top-right button)
- [x] Sidebar with SVG icons + collapsible
- [x] Quick Add Person from within Project form
- [x] Light mode corporate design
- [x] Dashboard drag-and-drop (reorder widgets, saved to localStorage)
- [x] **RLS security: all 6 tables `ENABLE ROW LEVEL SECURITY`; authenticated-only policies; verified anonymous read = `[]`, anonymous write = `401`**
- [x] **Access model: all signed-in members full CRUD (view/edit/delete); only owner can change code/schema**
- [x] **Account ↔ People auto-merge: login matches existing person by email and links `user_id` (no duplicates)**
- [x] **English-only popup alerts** (Projects create/edit validation)
- [x] **Success toast on People add/edit** (same style as Projects)
- [x] **Terminology: "KPI Cards" → "Overview Cards"** (statistics, not KPIs)

### ⚠️ Pending / Not Yet Applied
- [x] **`people_email_unique` UNIQUE constraint applied on `people.email`** (verified 2026-08-05; no duplicates) — see `supabase/migrations/20260805_people_email_unique.sql`
- [ ] Consider documenting the "invite vs Add person" rule in Guide page

### 🔜 Future Ideas
- [ ] Audit log
- [ ] Mobile responsive fine-tuning
- [ ] Role-based RLS (evaluated on 2026-07-31, decided NOT needed for now)

---

## Key Design Decisions

### DT Focal Multi-Person
- Changed `dt_focal_id` from `UUID` (FK to people) to `TEXT` storing comma-separated UUIDs
- Form uses checkboxes instead of single `<select>`
- All list/filter/view/export code splits on `,` to handle multiple IDs

### Access Model (decided 2026-07-31)
- All signed-in team members: full access — view, edit, delete
- Only the owner (Zoe) can change the underlying code / schema:
  - Code repo is **public** on GitHub (made public 2026-07-31 — free GitHub Pages requires a public repo; code contains no secrets, `.env` gitignored, data protected by RLS so exposure is limited to the frontend code itself)
  - Database in Supabase (only she has dashboard/service access)
- An admin-only-delete restriction was built and then **reverted** (commit `e04d507`) per owner decision
- Enforced by RLS (`supabase/private-rls.sql`): anonymous = no access; authenticated = full CRUD on all data tables; profiles = read all + update own

### Account ↔ People Record Auto-Merge
- `people` rows created via "Add Person" have `user_id = NULL` and are for people who do not log in (BMS vendors, suppliers, resources)
- On login, `syncPerson` (App.jsx):
  1. Match existing person by `user_id` OR `email` (case-insensitive)
  2. If found with no `user_id`, link the account by updating `user_id` on that row
  3. Only insert a new row if no match at all → no duplicates
- How a new member logs in: owner sends the platform link → they click "Create Account" → set their own password (email confirmation) → auto-merged into their existing person record. No manual invite needed.

### Email Uniqueness
- Frontend checks via `supabase.from('people').ilike('email', ...)` before insert (People page + Quick Add modal)
- DB-level `UNIQUE` constraint prepared but apply status to be verified

---

## Migrations to Run (verify in Supabase SQL Editor)

```sql
-- dt_focal_id UUID → TEXT  (already applied & working — verify only)
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_dt_focal_id_fkey;
ALTER TABLE projects ALTER COLUMN dt_focal_id TYPE TEXT;

-- Email uniqueness (check for duplicates first)
--    SELECT email, COUNT(*) FROM people GROUP BY email HAVING COUNT(*) > 1;
ALTER TABLE people ADD CONSTRAINT people_email_unique UNIQUE (email);
```

---

## File Structure

```
C:\Users\Joy\Dhara Team Dashboard\
├── .env                          # Supabase credentials (gitignored)
├── "Dhara Team Dashboard - 技术概览与数据安全.md"   # plain-language tech overview + security design
├── index.html
├── package.json                  # deploy script pinned to GitHub repo URL
├── vite.config.js
├── supabase/
│   ├── schema.sql               # Full DB schema
│   ├── private-rls.sql          # CURRENT RLS (idempotent)
│   └── fix-rls.sql              # Older RLS migration (superseded)
├── src/
│   ├── main.jsx
│   ├── App.jsx                   # Router + auth + syncPerson (email-merge)
│   ├── index.css                 # Global styles
│   ├── lib/
│   │   └── supabase.js           # Supabase client init
│   ├── components/
│   │   └── Layout.jsx            # Sidebar + topbar + invite modal
│   └── pages/
│       ├── Login.jsx             # Sign in + Create Account
│       ├── Dashboard.jsx
│       ├── Projects.jsx          # Project CRUD + DT Focal multi-select
│       ├── People.jsx            # Team cards + success toast
│       ├── BMS.jsx               # BMS weekly review view
│       ├── Guide.jsx             # User guide ("Overview" terminology)
└── dist/
```

---

## Changelog

### 2026-08-05
- **DB:** added `supabase/migrations/20260805_people_email_unique.sql` — apply + verify `people_email_unique` UNIQUE constraint on `people.email` (was missing); `schema.sql` updated to `email TEXT UNIQUE`
- **Removed unused Settings:** `settings` table had no UI (team name / currency page was never built). Dropped table + policies from `schema.sql` / `private-rls.sql`; live DB drop in `supabase/migrations/20260805_drop_settings_table.sql`

### 2026-07-31
- **Docs:** added `Dhara Team Dashboard - 技术概览与数据安全.md` — plain-language summary of tech implementation + data security design
- **Security (token):** GitHub PAT used for deploy was revoked on GitHub and removed from Windows Credential Manager; re-authenticated with a fresh short-lived PAT (stored in Windows Credential Manager via `git credential`/GCM, never in files)
- **Repo made public** (free GitHub Pages requires public repo — private repo + free plan broke the site, 404). Verified: code contains no secrets; RLS still blocks anonymous access, so making the code public does not expose data. Pages re-enabled via API (branch `gh-pages`, path `/`)
- **Security:** RLS enabled on all 6 tables; authenticated-only policies; verified anonymous read blocked (`[]`) and anonymous write blocked (`401`) — commits `cd79502`→`e85134e`
- **Access model:** built admin-only-delete restriction, then reverted per owner decision (`e04d507`) — all members full CRUD, owner-only code/schema access. Final: `supabase/private-rls.sql`
- **Account ↔ People merge:** `syncPerson` now matches by email first and links `user_id` to the existing person record instead of inserting a duplicate; deployed
- **Terminology:** "KPI Cards" → "Overview Cards" (9 references updated), commit `46a970e`
- **Deploy script:** pinned to GitHub repo URL with `-r` flag (no `origin` remote), commit `3aa63c5`; use `npm run deploy`
- **UI polish:** English-only popup alerts in Projects (`f353ba0`); success toast on People add/edit (`ffd83ed`)
- Deployed to GitHub Pages (multiple builds)

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

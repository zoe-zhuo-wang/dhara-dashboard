# Dhara Team Dashboard - Project Status

## Last Updated: 2026-08-05

---

## Overview

A team resource and project management dashboard for the Dhara team (Lenovo). Built with React + Supabase. Deployed via GitHub Pages (accessible from China).

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite + Tailwind 4 |
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
- **CI (enabled 2026-08-05):** auto-deploy on push to `main` via `.github/workflows/deploy.yml` (GitHub Actions → `npm ci` → `npm run build` → gh-pages). Paths fixed for repo-root layout. Manual `npm run deploy` no longer needed.

### Local Dev
```bash
cd "C:\Users\Joy\Dhara Team Dashboard"
npm run dev
# Vite base is /dhara-dashboard/ → open http://localhost:5173/dhara-dashboard/
```

---

## Supabase Project

- **URL:** https://nqygyktioiwabvyfziev.supabase.co
- **Dashboard:** https://supabase.com/dashboard
- **Anon Key:** (stored in `.env`, gitignored)
- **Region:** Asia-Pacific
- **Auth:** Email sign up / sign in (Login page has both "Sign In" and "Create Account")
- **Email:** wangzhuo18@lenovo.com (admin / owner)
- **RLS:** ENABLED on all 5 remaining tables (settings dropped 2026-08-05), policies = authenticated only (see `private-rls.sql`)

---

## Database Tables

| Table | Purpose |
|-------|---------|
| profiles | User profiles (extends auth.users, has `role` column, unused for now) |
| projects | Project records with budget/status/funding_type/dt_focal_id |
| people | Team members with email/team_group (may have no login account) |
| project_members | Many-to-many (currently unused / dead code) |
| allocations | Monthly Man-Day tracking (page removed, table kept) |

- `settings` table was **dropped** (2026-08-05) — team name / currency page was never built; no frontend reads it.

### Schema Location
- `supabase/schema.sql` — Full schema (source of truth)
- `supabase/private-rls.sql` — **current** RLS + access model (idempotent, runnable)
- `supabase/fix-rls.sql` — older RLS migration (superseded)
- `supabase/migrations/` — dated one-off migrations (see changelog)

---

## Pages

| Route | Page | Purpose |
|-------|------|---------|
| `/` | Dashboard | Overview cards + charts (bar, donut) |
| `/projects` | Projects | Project CRUD table with filters, search, export |
| `/people` | People | Team member cards with team filter |
| `/bms` | BMS (BMS.jsx) | Weekly meeting review with inline edit |
| `/guide` | Guide | User guide with numbered workflow sections |

---

## Features Implemented

### ✅ Completed
- [x] Login / Sign up (Supabase Auth, email confirmation)
- [x] Dashboard — overview cards + bar/donut charts (Recharts)
- [x] Projects — full CRUD table, column picker, column filters, global search, Excel export, form validation
- [x] DT Focal — multi-person support via comma-separated TEXT column, checkbox multi-select in form, filter/sort/view adapted
- [x] **Custom Current Phase** — dropdowns (BMS + Projects form/filter) derive from defaults + distinct saved values; "＋ Custom Phase…" enters a new phase that syncs across all tabs and the Dashboard chart
- [x] **Dashboard phase colors** — every phase (incl. custom) gets a stable, unique color; known phase colors are reserved so custom ones never collide
- [x] People — CRUD cards, team filter (Regular/ISS), email uniqueness validation (frontend) + DB UNIQUE constraint applied
- [x] BMS (BMS.jsx) — DT Focal filter, inline edit phase/status (with custom phase), rich text key updates, auto-save with success toast
- [x] Guide — numbered workflow cards, incl. custom-phase usage notes
- [x] Invite team member (top-right button) — any signed-in member can invite; account created via Supabase Edge Function (service role), invite link returned & shareable
- [x] Sidebar with SVG icons + collapsible
- [x] Quick Add Person from within Project form
- [x] Light mode corporate design
- [x] Dashboard drag-and-drop (reorder widgets, saved to localStorage)
- [x] **RLS security: all tables `ENABLE ROW LEVEL SECURITY`; authenticated-only policies; verified anonymous read = `[]`, anonymous write = `401`**
- [x] **Access model: all signed-in members full CRUD (view/edit/delete); only owner can change code/schema**
- [x] **Account ↔ People auto-merge: login matches existing person by email and links `user_id` (no duplicates)**
- [x] **`people_email_unique` UNIQUE constraint applied on `people.email`** (verified 2026-08-05; no duplicates)
- [x] **Password reset + 8-char minimum password**
- [x] **Terminology: "KPI Cards" → "Overview Cards"**; People count now shows "members" (no misleading "active")

### ⚠️ Pending / Not Yet Applied
- [ ] Consider documenting the "invite vs Add person" rule in Guide page
- [ ] 07-26 / 07-24 historical docs still reference old file structure (historical snapshots; left as-is)

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

### Custom Current Phase (2026-08-05)
- Phase dropdowns are built from `PHASE_OPTIONS` + the distinct `current_phase` values already saved in the DB (`src/lib/phases.js`)
- A "＋ Custom Phase…" option reveals a text input; saving writes the free-text value to the project
- Because options are derived from live data, a custom phase entered on any tab appears everywhere (BMS, Projects form/filter, Dashboard chart)
- Dashboard assigns each phase a unique color: known phases keep their color, custom phases take from a fallback palette avoiding all reserved known colors (then golden-angle HSL if exhausted)

### Access Model (decided 2026-07-31)
- All signed-in team members: full access — view, edit, delete
- Only the owner (Zoe) can change the underlying code / schema:
  - Code repo is **public** on GitHub (free GitHub Pages requires a public repo; code contains no secrets, `.env` gitignored, data protected by RLS)
  - Database in Supabase (only she has dashboard/service access)
- Enforced by RLS (`supabase/private-rls.sql`): anonymous = no access; authenticated = full CRUD on all data tables; profiles = read all + update own

### Account ↔ People Record Auto-Merge
- `people` rows created via "Add Person" have `user_id = NULL` and are for people who do not log in (BMS vendors, suppliers, resources)
- On login, `syncPerson` (App.jsx):
  1. Match existing person by `user_id` OR `email` (case-insensitive)
  2. If found with no `user_id`, link the account by updating `user_id` on that row
  3. Only insert a new row if no match at all → no duplicates

### Email Uniqueness
- Frontend checks via `supabase.from('people').ilike('email', ...)` before insert (People page + Quick Add modal)
- DB-level `people_email_unique` UNIQUE constraint applied + verified (2026-08-05)

### Invite via Edge Function (restored 2026-08-05, v9)
- Creating auth accounts needs the **service_role key**, which must never ship in the browser → done in a Supabase Edge Function `invite-user`
- Frontend (`InviteModal.jsx`, top-right button) POSTs email/name/team to the function with the caller's login JWT; the function verifies the caller `decodeJwtRole == 'authenticated'` (returns `401` if not signed in)
- The function then raw-`fetch`es GoTrue `POST /auth/v1/admin/invite?redirect_to=<app>/**#/**` with the service role key. This **both emails the person the invite** AND returns `properties.action_link` (supabase-js strips it, the raw call does not)
- The modal shows "Invitation Sent" + a **backup copyable invite link** for the just-invited email (fallback if the email doesn't arrive). Person sets their own password → first login triggers the existing Account ↔ People auto-merge
- No self-signup reopened — access stays **invite-only**; all signed-in members have the invite button (not just the owner)
- `redirect_to` / `site_url` / `uri_allow_list` all point at `https://zoe-zhuo-wang.github.io/dhara-dashboard` (production) + localhost dev ports

### Edge Function Deploy (no CLI → Management API)
- Deploy: `curl -X POST "https://api.supabase.com/v1/projects/nqygyktioiwabvyfziev/functions/deploy?slug=invite-user" -H "Authorization: Bearer sbp_..." -H "x-supabase-api-version: 2024-06-27" -F "file=@supabase/functions/invite-user/index.ts;type=text/plain" -F "metadata=@metadata.json;type=application/json"`
- `metadata.json` must be written UTF-8 **without BOM** via `[System.IO.File]::WriteAllText(...)`; content `{"entrypoint_path":"index.ts","verify_jwt":true,"name":"invite-user"}`

### Supabase platform outage (2026-08-05, ongoing at time of writing)
- Status: `Auth` 99.99% normal, but **Database** = `degraded_performance` (incident "Project Upgrade Delays", identified/fixing)
- Symptom: GoTrue **write paths all fail 503** (`/admin/invite`, `/admin/generate_link`, `/signup`), reads still 401/OK → invite + login-for-new-password broken until DB recovers
- Workaround verified: Management API `POST /v1/projects/<ref>/database/query` runs SQL against the DB directly (bypasses GoTrue) → used to inspect/add `people` rows

### Yue Su account (466ecb06-43ed-45d9-86db-91f08cfb8a11) — added to People 2026-08-05
- Already had a **complete auth account**: email `suyue2@lenovo.com` confirmed, `encrypted_password` present, last sign-in 2026-08-05 08:54. BUT the invite was completed via an old **localhost** link that never opened → she has never actually set/login her own password
- I inserted her into `people` (name `Yue Su`, `Regular Team`, `user_id` linked) — she's in the roster
- **To get her in**: she only needs a working password. Since she already has an auth account, the clean path = wait for GoTrue, she clicks **Forgot password** → email links to `suyue2@lenovo.com` → she sets a new password. (No new invite needed — forgot-password is the right tool for an existing account.)
- Fallback if GoTrue stays down: I can SQL-set a temporary bcrypt password for her now

---

## Migrations (2026-08-05, run in Supabase SQL Editor)

`supabase/migrations/20260805_onetime_migration.sql` — single script:
1. Drop unused `settings` table (+ its policies)
2. Add `people_email_unique` UNIQUE constraint on `people.email` (idempotent)
3. Verify both (constraint present, settings gone)

---

## File Structure

```
C:\Users\Joy\Dhara Team Dashboard\
├── .env                          # Supabase credentials (gitignored)
├── "Dhara Team Dashboard - 技术概览与数据安全.md"   # plain-language tech overview + security design
├── "Dhara Team Dashboard - 2026-08-05.md"          # current status (this file)
├── Dhara_Team_Dashboard_Overview.pptx              # 3-slide summary deck (EN)
├── index.html
├── package.json                  # deploy script pinned to GitHub repo URL
├── vite.config.js                # base /dhara-dashboard/
├── supabase/
│   ├── schema.sql               # Full DB schema
│   ├── private-rls.sql          # CURRENT RLS (idempotent)
│   ├── fix-rls.sql              # Older RLS migration (superseded)
│   ├── functions/
│   │   └── invite-user/         # Edge Function: service-role invite (deployed)
│   └── migrations/
│       ├── 20260723_add_focal_and_funding.sql
│       ├── 20260804_drop_people_unused_columns.sql
│       ├── 20260805_people_email_unique.sql
│       ├── 20260805_drop_settings_table.sql
│       └── 20260805_onetime_migration.sql
├── src/
│   ├── main.jsx
│   ├── App.jsx                   # Router + auth + syncPerson (email-merge)
│   ├── index.css                 # Global styles
│   ├── lib/
│   │   ├── supabase.js           # Supabase client init
│   │   ├── constants.js          # option lists + color maps
│   │   ├── phases.js             # dynamic phase options (defaults + saved values)
│   │   └── sanitize.js           # rich-text XSS sanitizer
│   ├── components/
│   │   ├── Layout.jsx            # Sidebar + topbar + Invite button
│   │   └── InviteModal.jsx       # Invite form → edge function → share link
│   └── pages/
│       ├── Login.jsx             # Sign in + Create Account
│       ├── ResetPassword.jsx
│       ├── Dashboard.jsx
│       ├── Projects.jsx          # Project CRUD + DT Focal multi-select
│       ├── People.jsx            # Team cards + success toast
│       ├── BMS.jsx               # BMS weekly review view (renamed from Presentation.jsx)
│       └── Guide.jsx             # User guide ("Overview" terminology)
└── dist/
```

---

## Changelog

### 2026-08-05
- **CI:** enabled auto-deploy on push to `main` (`.github/workflows/deploy.yml`, repo-root layout) — manual `npm run deploy` no longer needed
- **DB:** applied + verified `people_email_unique` UNIQUE constraint on `people.email` (no duplicates); `schema.sql` → `email TEXT UNIQUE`
- **DB:** dropped unused `settings` table (team name/currency page never built) — schema.sql, private-rls.sql, and live DB updated
- **Feature:** custom Current Phase — `src/lib/phases.js` builds options from defaults + saved values; "＋ Custom Phase…" in BMS inline editor and Projects form; Projects column filter uses dynamic options; synced across tabs + Dashboard chart
- **Dashboard:** each phase gets a stable unique color (custom phases avoid all reserved known-phase colors)
- **Refactor:** `Presentation.jsx` → `BMS.jsx` (component + imports + docs), commit `02ae30f`
- **UI:** People count label "active members" → "members"
- **Docs:** Guide page updated with custom-phase notes
- **Deliverable:** created `Dhara_Team_Dashboard_Overview.pptx` (3-slide EN summary: what it is / vs Streamlit+Excel / build+storage+security)
- **Feature (restored):** Invite button back in top bar for **all signed-in members** — `src/components/InviteModal.jsx` + Supabase Edge Function `invite-user` (service-role account creation, returns shareable invite link; caller JWT verified, anonymous = 401). Deployed via Management API (no self-signup; access stays invite-only), commit `87227f7`
- Deployed to GitHub Pages (multiple builds)

### 2026-07-31
- Docs: tech overview & data security summary (CN + EN); token/security hardening; repo made public; RLS enabled + verified; access model finalized; account↔people merge; terminology; deploy script pinning

### 2026-07-30
- DT Focal UUID→TEXT multi-person; email uniqueness; Guide redesign; BMS toast fix; allocations page removed

### 2026-07-24
- Initial GitHub Pages deployment; HashRouter; hardcoded Supabase fallback

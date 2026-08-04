# Dhara Team Dashboard

A login-protected team project dashboard for tracking projects, budgets, and weekly progress reviews.

## Stack

- **Frontend** — React 19 + Vite 8 + Tailwind CSS 4 + Recharts
- **Backend** — Supabase (PostgreSQL + Auth + Row Level Security)
- **Deploy** — GitHub Pages (`zoe-zhuo-wang/dhara-dashboard`, base path `/dhara-dashboard/`)

## Pages

| Route | Page | Purpose |
|-------|------|---------|
| `/` | Dashboard | Overview cards + charts (phase, funding type, budget status) |
| `/projects` | Projects | Full project CRUD, column toggles, filters, search, Excel export |
| `/people` | People | Team roster management |
| `/bms` | BMS | Weekly meeting view with inline phase/status edits and rich-text Key Updates |
| `/guide` | Guide | User guide for the team |

## Local development

```bash
npm install
npm run dev
```

Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env` (falls back to the values in `src/lib/supabase.js`).

## Scripts

- `npm run dev` — local dev server
- `npm run build` — production build to `dist/`
- `npm run lint` — oxlint
- `npm run deploy` — publish `dist/` to GitHub Pages

## Database

Schema and RLS policies live in `supabase/`. `supabase/private-rls.sql` is the authoritative RLS script: only authenticated members get full access; anonymous access is denied. Run it in the Supabase SQL Editor.

## Security

- Auth gate: email + password, invite-only accounts, 8-char minimum password.
- RLS: second lock on the database — anonymous reads/writes are rejected.
- Keys: the Supabase anon key is a public client key; real secrets live in `.env*` files which are gitignored.

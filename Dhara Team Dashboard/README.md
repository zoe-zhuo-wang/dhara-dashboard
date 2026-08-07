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
| `/whitelist` | Whitelist | Manage who can create an account / sign in |

## Local development

```bash
npm install
npm run dev
```

Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env` (falls back to the values in `src/lib/supabase.js`).

## Passcode sign-in (Supabase Auth outage workaround)

When Supabase Auth (GoTrue) is down, the team can sign in with a shared passcode that
mints a valid signed JWT (`role=authenticated`) without hitting GoTrue at all. It lives
in `api/auth.js`, a Vercel serverless function. All data calls still go straight to
PostgREST under the normal RLS policies.

Frontend env (`src/pages/Login.jsx`):

- `VITE_AUTH_PROXY_URL` — full URL of the deployed `api/auth` endpoint.

Vercel function env (Vercel → Project → Settings → Environment Variables):

- `ENABLE_AUTH_PROXY=1`
- `AUTH_PASSPHRASE=<shared team passcode>`
- `SUPABASE_JWT_SECRET=<project JWT secret from Supabase Dashboard > Settings > API>`
- `SUPABASE_REF=nqygyktioiwabvyfziev` (optional)
- `AUTH_SUBJECT=<user id to impersonate>` (optional, defaults to wangzhuo18)
- `AUTH_EMAIL=<email>` (optional)
- `AUTH_TTL_SECS=43200` (optional, 12h default)

Disable by removing `ENABLE_AUTH_PROXY` or setting it to anything other than `1`;
the endpoint returns 404 and the normal Supabase login is used again.

## Scripts

- `npm run dev` — local dev server
- `npm run build` — production build to `dist/`
- `npm run lint` — oxlint
- `npm run deploy` — publish `dist/` to GitHub Pages

## Database

Schema and RLS policies live in `supabase/`. `supabase/schema.sql` is the authoritative schema; `supabase/private-rls.sql` is the authoritative RLS script: only authenticated members get full access; anonymous access is denied. Run them in the Supabase SQL Editor.

## Security

- Auth gate: email + password. Sign-up is open, but **only emails on the whitelist table** (checked via the `is_whitelisted` RPC) can create an account; the whitelist also acts as the sign-in gate. 8-char minimum password.
- RLS: second lock on the database — anonymous reads/writes are rejected.
- Whitelist: `supabase/migrations/20260805_add_whitelist.sql` creates the `whitelist` table + RLS + `is_whitelisted(email)` SECURITY DEFINER function; `supabase/migrations/20260805_whitelist_grants.sql` grants table access to `authenticated` and `service_role`.
- Keys: the Supabase anon key is a public client key; real secrets live in `.env*` files which are gitignored.

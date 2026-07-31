# Dhara Team Dashboard - Project Status

## Last Updated: 2026-07-26

---

## Overview

A team resource and project management dashboard for the Dhara team (Lenovo). Built with React + Supabase + Tailwind CSS. Deployed via GitHub Pages (accessible from China).

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite + Tailwind CSS v4 |
| Charts | Recharts |
| Drag & Drop | @dnd-kit/core |
| Excel Export | xlsx (SheetJS, lazy-loaded) |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Hosting | GitHub Pages (https://zoe-zhuo-wang.github.io/dhara-dashboard/) |
| Router | HashRouter (supports SPA refresh on GitHub Pages) |

---

## Deployment

### Production (GitHub Pages)
- **URL:** https://zoe-zhuo-wang.github.io/dhara-dashboard/
- **Repo:** https://github.com/zoe-zhuo-wang/dhara-dashboard
- **Branch:** `gh-pages` (built dist files)
- **GitLab Mirror:** https://gitlab.xpaas.lenovo.com/wangzhuo18/dhara-dashboard

### Local Dev
```bash
cd "C:\Users\Joy\Dhara Team Dashboard"
npm run dev
# Opens at http://localhost:5173/dhara-dashboard/
```

### Deploy to GitHub Pages
```bash
npm run build
npx gh-pages -d dist -r "https://zoe-zhuo-wang:ghp_<token>@github.com/zoe-zhuo-wang/dhara-dashboard.git"
```

### Deploy to GitLab Mirror
```bash
npx gh-pages -d dist -r "https://wangzhuo18:IDSgsGwx41e7heqfcnDPGm86MQp1Om52OAk.01.0z10k04nr@gitlab.xpaas.lenovo.com/wangzhuo18/dhara-dashboard.git"
```

---

## Supabase Project

- **URL:** https://nqygyktioiwabvyfziev.supabase.co
- **Dashboard:** https://supabase.com/dashboard
- **Anon Key:** (stored in `.env`)
- **Project Region:** Asia-Pacific
- **Auth:** Email (confirmation disabled)
- **Email:** wangzhuo18@lenovo.com (admin)
- **Free Tier:** 500MB database (sufficient for years of usage)

---

## Database Tables

| Table | Purpose |
|-------|---------|
| profiles | User profiles (extends auth.users) |
| projects | Project records with budget/status |
| people | Team members with skills/rates |
| project_members | Many-to-many project-person links |
| allocations | Monthly Man-Day (MD) tracking |
| settings | Key-value app configuration |

### Key Project Columns
name, description, budget, spent, status, priority, owner_id, start_date, end_date, category, dt_focal_id, funding_type, current_phase, overall_status, budget_status, vetra_adopted, key_updates, biz_case

---

## Features Implemented

### ✅ Completed
- [x] Login / Sign up (Supabase Auth)
- [x] Dashboard with overview cards + charts (Recharts)
- [x] Project CRUD (create, edit, delete, search, filter)
- [x] People CRUD (card view with team filter: All/Regular Team/ISS Team)
- [x] Settings page (team name, currency)
- [x] Invite team member (top-right button)
- [x] Light mode corporate design
- [x] Sidebar with SVG icons + collapsible
- [x] Top bar with Invite button
- [x] Role-based auth (admin / member)
- [x] Projects page: column picker, sticky Actions column, search & filter
- [x] Projects page: form validation (all 13 fields required, red border + error message + auto-scroll to first error)
- [x] Projects page: "Current Phase" label (renamed from "Phase")
- [x] Projects page: Excel export (all columns, respects filters, filename with date-time suffix)
- [x] People page: team filter (All/Regular Team/ISS Team), "General" → "Regular Team"
- [x] People page: team badges (Regular Team = amber, ISS Team = purple)
- [x] BMS page (was "Presentation"): DT Focus filter, large meeting-friendly cards
- [x] BMS page: editable Current Phase, Overall Status, Key Updates (auto-expanding textarea)
- [x] BMS page: visual enhancements (gradient top bar, numbered badge, refined typography)
- [x] BMS page: badge colors standardized across all pages (On Track=green, Caution=yellow, Off Track=red, Finished=blue, Not Started=gray)
- [x] Project View modal: follows ALL_COLUMNS order, title = project name, long text auto-wraps
- [x] Dashboard: fresh color scheme with gradient overview cards, icon badges, accent bars
- [x] Dashboard: DonutChart rewritten (anti-overlap, polyline leaders, 2-line labels, enlarged pie, circle aligned with name text)
- [x] Dashboard pie chart font standardization (labels 13px, legend 13px)
- [x] Global badge color standardization (Projects/BMS/Dashboard all use same source colors)

### ⚠️ Pending
- [ ] RLS policies need proper setup (currently wide open)
- [ ] Profile auto-creation trigger may need testing

### 🔜 Next Steps
- [ ] Project member assignment UI
- [ ] Notification system
- [ ] Mobile responsive fine-tuning
- [ ] Audit log
- [ ] Role-based RLS (admin-only delete, etc.)
- [ ] GitLab Pages deployment (if accessible from office network)

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
│   └── fix-rls.sql              # RLS fix (already applied)
├── src/
│   ├── main.jsx
│   ├── App.jsx                   # Router + auth state
│   ├── index.css                 # Tailwind + global styles
│   ├── lib/
│   │   └── supabase.js           # Supabase client init
│   ├── components/
│   │   └── Layout.jsx            # Sidebar + topbar + invite modal
│   └── pages/
│       ├── Login.jsx             # Auth page
│       ├── Dashboard.jsx         # Overview + charts + donut
│       ├── Projects.jsx          # Project CRUD table + Excel export
│       ├── People.jsx            # Team member cards
│       ├── Presentation.jsx      # BMS page (meeting cards)
│       └── Settings.jsx          # Team config
└── dist/                         # Build output
```

---

## Network Notes

- Home network blocks github.io (GFW)
- VPN may make things worse — disconnecting VPN sometimes works
- Office network accesses github.io directly
- Chinese network to GitHub: intermittently blocked, retry with 2-minute intervals usually works
- GitLab mirror (`gitlab.xpaas.lenovo.com`) works on Lenovo internal network

---

## Design System

- **Primary:** #1a56db (blue)
- **Background:** #f1f5f9 (light gray)
- **Cards:** #ffffff (white)
- **Text:** #0f172a
- **Border:** #e2e8f0
- **Font:** Inter / system sans-serif
- **Badge Colors:**
  - On Track = green (#dcfce7 / #166534)
  - Caution = yellow (#fef9c3 / #854d0e)
  - Off Track = red (#fee2e2 / #991b1b)
  - Finished = blue (#dbeafe / #1e40af)
  - Not Started = gray (#f1f5f9 / #475569)
  - Budget: Draft=gray, Ongoing=yellow, Approved=green

---

## Changelog

### 2026-07-26
- Removed Allocations page (file deleted, route & nav entry removed)
- Added Project View modal with full field display following ALL_COLUMNS order
- Fixed Actions column sticky positioning (border-collapse fix)
- People page: team filter (All/Regular Team/ISS Team), "General" treated as "Regular Team"
- People page: team badges (Regular Team = amber, ISS Team = purple)
- BMS page (Presentation → BMS): DT Focus filter, large meeting-friendly cards, editable Phase/Status/Key Updates
- BMS page: gradient top bar per Overall Status, numbered badge, refined typography, gradient save button
- BMS page: badge colors standardized with Projects/Dashboard
- BMS page: Key Updates auto-expanding textarea with word-break handling
- BMS font standardization (labels 13px, content 15px, titles 22px)
- Dashboard complete rewrite: Overview cards, Project Status bar chart, Budget Distribution donuts
- Dashboard DonutChart rewritten: anti-overlap algorithm, polyline-only leaders, enlarged pie (52% outer, 30% inner)
- Dashboard pie chart: leader lines start at sector outer edge, 2-line labels, font sizes standardized
- Projects page: form validation UX (all 13 required fields, red border + error messages + auto-scroll)
- Projects page: "Phase" renamed to "Current Phase" in table header
- Projects page: Excel export (xlsx) with date-time filename suffix, respects search/filter
- Global badge color standardization across Projects/BMS/Dashboard
- Installed xlsx (SheetJS) as lazy-loaded dependency

### 2026-07-24
- Deployed to Vercel — not accessible from China
- Switched to GitHub Pages for China-friendly access
- Changed BrowserRouter → HashRouter
- Hardcoded Supabase credentials as fallback
- Added gh-pages npm package for deployment
- Updated vite.config.js with base path
- Enabled GitHub Pages on repo

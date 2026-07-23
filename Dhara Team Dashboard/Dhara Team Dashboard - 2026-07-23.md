# Dhara Team Dashboard - Project Status

## Last Updated: 2026-07-23

---

## Overview

A team resource and project management dashboard for the Dhara team (Lenovo). Built with React + Supabase + Tailwind CSS. Deployed via Cloudflare Pages.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite + Tailwind CSS v4 |
| Charts | Recharts |
| Drag & Drop | @dnd-kit/core |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Hosting | Vercel / Cloudflare Pages (TBD) |

---

## Supabase Project

- **URL:** https://nqygyktioiwabvyfziev.supabase.co
- **Dashboard:** https://supabase.com/dashboard
- **Anon Key:** (stored in `.env`)
- **Project Region:** Asia-Pacific
- **Auth:** Email (confirmation disabled)
- **Email:** wangzhuo18@lenovo.com (admin)

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

### Schema Location
- `supabase/schema.sql` — Full schema + RLS + trigger

---

## Features Implemented

### ✅ Completed
- [x] Login / Sign up (Supabase Auth)
- [x] Dashboard with KPI cards + charts (Recharts)
- [x] Project CRUD (create, edit, delete, search, filter)
- [x] People CRUD (card view, skills, roles)
- [x] Allocations page (monthly MD tracking)
- [x] Settings page (team name, currency)
- [x] Invite team member (top-right button)
- [x] Light mode corporate design
- [x] Dashboard drag-and-drop (reorder widgets, saved to localStorage)
- [x] Sidebar with SVG icons + collapsible
- [x] Top bar with Invite button
- [x] Role-based auth (admin / member)

### ⚠️ Pending
- [ ] RLS policies need proper setup (currently wide open)
- [ ] Profile auto-creation trigger may need testing
- [ ] Email confirmation should stay disabled for internal use
- [ ] Deploy to Cloudflare Pages

### 🔜 Next Steps
- [ ] Cloudflare Pages deployment
- [ ] Project member assignment UI
- [ ] Export reports (PDF/Excel)
- [ ] Notification system
- [ ] Mobile responsive fine-tuning
- [ ] Audit log
- [ ] Role-based RLS (admin-only delete, etc.)

---

## File Structure

```
C:\Users\Joy\allo-dashboard\
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
│       ├── Dashboard.jsx         # KPI + charts + drag-drop
│       ├── Projects.jsx          # Project CRUD table
│       ├── People.jsx            # Team member cards
│       ├── Allocations.jsx       # Monthly MD grid
│       └── Settings.jsx          # Team config
└── dist/                         # Build output
```

---

## Critical: Database Permissions Fix

After creating tables, you MUST run this SQL in Supabase SQL Editor:

```sql
GRANT ALL ON projects TO anon;
GRANT ALL ON projects TO authenticated;
GRANT ALL ON people TO anon;
GRANT ALL ON people TO authenticated;
GRANT ALL ON project_members TO anon;
GRANT ALL ON project_members TO authenticated;
GRANT ALL ON allocations TO anon;
GRANT ALL ON allocations TO authenticated;
GRANT ALL ON settings TO anon;
GRANT ALL ON settings TO authenticated;
GRANT ALL ON profiles TO anon;
GRANT ALL ON profiles TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
```

Without this, the frontend API calls will fail with "permission denied".

---

## Local Dev

```bash
cd C:\Users\Joy\allo-dashboard
npm install
npm run dev
# Opens at http://localhost:5173/
```

---

## Design System

- **Primary:** #1a56db (blue)
- **Background:** #f1f5f9 (light gray)
- **Cards:** #ffffff (white)
- **Text:** #0f172a
- **Border:** #e2e8f0
- **Font:** Inter / system sans-serif

# Dhara Team Project Dashboard — 最终邮件文案

**Subject:** Dhara Team Project Dashboard — Demo & Link

Hi Dhara and Ziff,

I'd like to share a Project Dashboard I built for our team. Here's a quick overview.

**Demo Video:** attached
**Dashboard:** https://zoe-zhuo-wang.github.io/dhara-dashboard/
**Access:** by invitation — each team member gets a login

> Data shown is test data for demo purposes only.

---

**Overview**

Our main goal is straightforward: streamline project and budget management via data visualization. The dashboard has four views:

1. **Dashboard** — Key metrics (project count, Vetra adoption rate, budget, etc.) and charts by Phase, Funding Type, and Budget Status
2. **Projects** — The source of truth. Track all project details, filter / search, pick visible columns, and export to Excel
3. **People** — Manage the team roster; members become available as project focals
4. **BMS** — Weekly review view. Cards grouped by DT Focal, with inline phase/status edits and rich-text Key Updates

---

**Why this stack?**

I evaluated a few approaches. I chose a React web app on Supabase (a hosted database with built-in login) for the following reasons:

- **Best outcome within my capability** — One codebase to own end-to-end, from design to delivery, no external dependencies
- **Lowest barrier for the team** — Everyone logs in with email + password; no learning curve, no file juggling
- **Zero cost, zero lock-in** — No subscription fees, no vendor dependency. We stay fully in control of our data and code, free to evolve later
- **Secure by default** — Login gate plus database-level row security, so only invited team members can view or edit
- **Start light, iterate as needed** — Validates value first. Multi-user collaboration is already built in; advanced features can build on this foundation

The dashboard is live and ready to use. I'd appreciate any feedback or suggestions.

Best regards,
Zoe
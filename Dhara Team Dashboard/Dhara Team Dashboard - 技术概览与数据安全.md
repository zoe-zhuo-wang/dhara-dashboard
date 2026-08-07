# Dhara Team Dashboard - 技术概览与数据安全

> 创建日期：2026-07-31

## 一句话说明

一个**登录后才能用**的团队项目看板，数据放在云数据库，安全靠"登录挡门 + 数据库二次上锁"。

## 怎么做的

| 部分 | 说明 |
|------|------|
| 网页 | React 前端，托管在 GitHub Pages（国内可访问） |
| 数据 | Supabase 云数据库，多张表（项目、成员、白名单等） |
| 登录 | 邮箱 + 密码；注册开放，但**只有白名单邮箱**能创建账号并登录 |

## 怎么保安全（三道门）

1. **登录门**：没账号进不了系统
2. **数据库上锁（RLS）**：就算有人绕过登录直接访问数据库，也读不到、改不了。已验证：匿名读取返回空、匿名写入被拒绝
3. **钥匙管理**：GitHub token 设短期限、存电脑里，不写进代码；含密钥的文件永不提交

## 权限

- 所有登录成员：都能看 / 改数据
- 只有 owner（Zoe）：能改代码和数据库结构
- 白名单表只有登录成员可管理（增删/开关），决定谁能创建账号

## 2026-08-05 Updates

- 登录机制从**邀请制**改为**邮箱白名单制**：登录页新增 Create Account，`is_whitelisted` RPC 校验邮箱是否在白名单，白名单同时作登录门槛（不在名单则登出）
- 新增 `whitelist` 表 + RLS + `is_whitelisted(email)` SECURITY DEFINER 函数，并补齐表授权（authenticated / service_role）
- 新增 Whitelist 页面（/whitelist），People 卡片可一键 `+ Whitelist`
- 增加 `?demo=1` 演示模式：跳过登录、匿名只读；配合临时匿名只读策略（`demo_readonly.sql`）演示真实数据，结束后用 `demo_readonly_revert.sql` 回收
- 登录守卫改 **fail-open**：仅确认不在白名单才登出，查询报错放行（避免平台故障误登出）
- 同步更新 User Guide 接入说明

## 2026-07-31 安全处理记录

- 作废并更换 GitHub token（旧 token 已删除，新 token 存 Windows 凭据管理器）
- 仓库改公开：代码本身无秘密，数据仍被 RLS 锁着，公开代码不影响数据安全（免费 GitHub Pages 要求公开仓库）

## 现状结论

**当前安全性足够**。若团队长大或有更高要求，再考虑加：审计日志、细分角色权限。

---

# Dhara Team Dashboard — Tech Overview & Data Security

> Created: 2026-07-31 · Last updated: 2026-08-05

## In one sentence

A team project dashboard that **requires login to use**. Data lives in a cloud database, and security is based on two layers: **login as the front door + a second lock on the database itself**.

## How it's built

| Part | Description |
|------|-------------|
| Frontend | React app, hosted on GitHub Pages (accessible from mainland China) |
| Data | Supabase cloud database — multiple tables (projects, people, whitelist, etc.) |
| Login | Email + password; sign-up is open, but **only whitelisted emails** can create an account and sign in |

## How security is kept (three gates)

1. **Login gate** — without an account you can't get into the system.
2. **Database lock (RLS)** — even if someone bypasses login and reaches the database directly, they can't read or modify anything. Verified: anonymous reads return empty, anonymous writes are rejected.
3. **Key management** — GitHub tokens are set with short expiry and stored on the computer, never written into code; files containing secrets are never committed.

## Permissions

- All signed-in members: can view / edit all data.
- Only the owner (Zoe): can change code and database structure.
- The whitelist table is managed by signed-in members (add/remove/toggle) and decides who can create an account.

## 2026-08-05 Updates

- Login switched from **invite-based** to **email-whitelist-based**: a Create Account tab was added to the login page, and the `is_whitelisted` RPC checks the email against the whitelist; the whitelist also acts as the sign-in gate (accounts not on it are signed out).
- Added the `whitelist` table + RLS + `is_whitelisted(email)` SECURITY DEFINER function, and added table grants (`authenticated` / `service_role`).
- Added a Whitelist page (`/whitelist`); People cards have a one-click `+ Whitelist` action.
- Added `?demo=1` demo mode: skips login, anonymous read-only; paired with temporary anon read policies (`demo_readonly.sql`) to demo real data, reverted with `demo_readonly_revert.sql` afterward.
- Login guard changed to **fail-open**: only signs out when confirmed not whitelisted, allows on query errors (avoids signing users out during platform outages).
- User Guide updated to reflect the new sign-up flow.

## 2026-07-31 Security handling log

- Revoked and replaced the GitHub token (old token deleted, new token stored in Windows Credential Manager).
- Repository made public: the code contains no secrets and the data is still locked by RLS, so making the code public doesn't affect data security (free GitHub Pages requires a public repo).

## 2026-08-04 Updates

- RLS confirmed on the live database: all policies are restricted to `authenticated` only, zero anonymous access.
- Removed unused `people` columns (`role`, `daily_rate`, `skills`, `is_active`) from both schema and UI.
- Added a "Forgot password" / password reset flow.
- Added CI/CD: pushing to `main` automatically builds and deploys to GitHub Pages.
- Rich-text `Key Updates` content is sanitized before rendering to block stored XSS.

## Current status

**Security is sufficient as it stands.** If the team grows or stricter requirements appear, consider adding: audit logs, fine-grained role permissions.

# Dhara Team Dashboard - 2026-08-06（安全加固 + 状态更新）

## 今天做了什么

### ✅ 新功能：Key Updates 结构化（快照 + 上周只读）（2026-08-06）
- 单个富文本 `key_updates` 字段 → **5 个结构化字段**：**Progress / Next Steps / Blockers / ETA / Owner**
- **校验规则（全站一致）**：5 字段**至少填一个**（空白算空），新建/编辑项目、BMS 保存都拦截
- **快照 + 上周只读**：BMS 保存时把当前值连同时间戳封存进 `last_update`，再写入新值 + `updates_updated_at`；卡片下方显示可折叠的 **Previous update**（只读、含上次更新时间）供周间对比
- **BMS 编辑面板**：Progress / Next Steps / Blockers 各配富文本编辑器（B/I/U、字体色、高亮，从 BMS 抽出为公共组件 `src/components/RichEditor.jsx`），ETA 日期选择器、Owner 文本输入
- **Projects 同步**：表单换成 5 字段（轻量 textarea，富文本是 BMS 专属）；表格新增可选列 Progress / Next Steps / Blockers / ETA / Update Owner（默认隐藏，Columns 里开）；View 弹窗富文本渲染；Excel 导出 3 个文本字段自动去 HTML
- **DB 迁移**：`supabase/migrations/20260806_add_update_fields.sql` — 新增 5 列 + `last_update JSONB` + `updates_updated_at`，旧 `key_updates` 内容迁入 `progress` 后删列。**尚未在 SQL Editor 执行，待用户跑**
- 文件：`src/pages/BMS.jsx`、`src/pages/Projects.jsx`、`src/components/RichEditor.jsx`(新)、`src/lib/demoData.js`(新)、`src/pages/Guide.jsx`

### ✅ Demo 模式示例数据（`?demo=1`）
- 根因：demo 只是客户端假登录，查询仍走 anon key + RLS 零放行 → 列表全空
- 方案：**本地 mock**，不动 RLS/不加列/不污染正式数据，Auth 故障期间 demo 完全离线可用
- `src/lib/demoData.js`：5 个示例人员 + 5 个示例项目（覆盖各阶段/资金/状态/Vetra/Biz Group，含 1 个自定义阶段 FEASIBILITY；其中 3 个带 `last_update` 可直接看 Previous update）
- 4 个页面（BMS/Projects/Dashboard/People）加载函数加 demo 分支；**BMS 在 demo 下保存走本地内存更新**，可完整演示"保存 → 新值显示 + 旧值进 Previous update"
- Playwright 冒烟：BMS/Projects/People 渲染正常，无 console 报错；编辑面板 5 字段、"至少一个"校验、Previous update 折叠/更新全部通过

### ✅ 新功能：Projects / BMS 增加 Biz 字段（2026-08-06）
- **Projects 新增 3 列**（均为 <TEXT>，DB 已迁移建列）：
  - **Biz Group** 下拉 `IDG / ISG / SSG` ＋ 自定义（`＋ Custom Biz Group…`），自定义值与预设并列、可反悔撤销
  - **Biz Focal**（纯文本，DT Focal 之前）
  - **IT Focal**（纯文本）
- 均已设为必填（`*`）；表格列 + 列显隐、列头筛选（Biz Focal/IT Focal 按已填内容去重）、View 详情、Excel 导出全部同步更新
- **BMS 卡片**头部新增 **Biz Focal / IT Focal** chip（与原有 DT Focal 并列），无值显 `—`
- **自定义交互修复**（Projects + BMS）：原来选了 Custom 会替换掉下拉、无法反悔；现改为**下拉常驻，选中 Custom 时下方多出输入框**，可随时重新下拉改回预设值
- 文件：`src/pages/Projects.jsx`、`src/pages/BMS.jsx`、`src/lib/constants.js`（`BIZ_GROUP_OPTIONS`）、`src/App.jsx`（下条）
- DB 迁移：`supabase/migrations/20260806_add_biz_fields.sql`，已在 SQL Editor 执行成功并验证列存在

### ✅ App.jsx：登录加载超时修复
- `supabase.auth.getSession()` 原来无超时/异常处理，GoTrue 503 时页面无限 Loading。现已加 **5 秒超时兜底** + `.catch`，超时后落到登录页而非无限转圈。
- 另支持 `?demo=1` 演示模式直看界面（跳过登录；匿名读取下数据为空——RLS 已正确拦截）。

### ✅ RLS 匿名读取漏洞已修复并验证
- **现象（发现于 08-06）：** 用匿名 anon key 请求 `GET /rest/v1/projects` 返回了全部 5 条真实项目数据，违反既有文档"匿名读取 = []"。
- **诊断：** `pg_policies` 里所有表的策略其实都只有 `authenticated`，说明问题**不是策略**，而是 **RLS 在 live 库上未生效/被关闭**（`relrowsecurity = false`）——RLS 一关，策略再多也形同虚设。
- **修复：** 在 Supabase SQL Editor 重放了 `supabase/private-rls.sql` 全文（含 `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`），新诊断脚本保留在 `supabase/20260806_verify_and_fix_rls.sql`。
- **验证：** 重放后匿名读 = **0 条**，匿名写 = **401**，符合预期。安全闭环。
- **教训：** 以后在 SQL Editor 改表结构/加策略后，记得当场用 anon key 外测一遍，不能只看 `pg_policies`。

### ✅ 仓库密钥扫描（公开 GitHub repo）
- `.env` / `.env.vercel` 均在 `.gitignore`，且 `git log` 全历史确认**从未提交**。
- `git grep` 全库扫 `sbp_` / `service_role` key / `eyJ...` 密钥值：无真实密钥，仅有文档措辞提及。
- `src/lib/supabase.js` 硬编码的 anon key = 公开浏览器 key，设计如此，不算泄漏。

## ⚠️ 仍未解决：登录 503（Supabase 平台侧）
- `POST /auth/v1/token`（登录）和 `/auth/v1/signup` 均返回 **503**；数据库读取（PostgREST）正常。
- 与 08-05 记录的 GoTrue 写路径故障表现一致，平台尚未彻底恢复。
- **Support ticket 已提交（2026-08-06）**：类型 Dashboard issue / 涉及 Auth，联系邮箱 **joywangzhuo@163.com**，项目 ref `nqygyktioiwabvyfziev`。等待回复中。
- **待办：** Biz 字段 + Key Updates 结构化 + demo 数据等前端改动尚未 push（本地已就绪），待 Auth 恢复后一并 `git push` 触发 GitHub Actions 部署（`20260806_add_update_fields.sql` 已在 SQL Editor 执行成功）。

## ✅ token 清理（完成）
- **`deploy`（`sbp_...`）个人访问 token 已于 2026-08-06 在 Dashboard 删除**。edge function 部署已完成、后续走 GitHub Actions，无需重建。
- `.env.vercel` 里的 Vercel OIDC token 是短时凭证，且部署已切到 GitHub Actions（08-05），此文件属遗留物，可删。
- 以上均需用户在 Dashboard 操作，本地无法代劳。

## ✅ Key Updates 改为小表格形式（完成，无需迁移）
- 按需求：Key Updates 作为"小表格"，**序号自动填充**（上一版 = #1，最新 = #2，正序最新在底部）。沿用现有快照模型：最新 + 上一版两行，**无新迁移**，纯前端改造。
- 新增 `src/lib/keyUpdates.js`（`updatesRows` / `updatesToText`）与 `src/components/KeyUpdatesTable.jsx`（表头：`# / Progress / Next Steps / Blockers / Risks / ETA / Owner / Update Date`，上一版行只读置灰）。
- **BMS**：卡片内改为表格展示（最多两行），移除旧 "Previous update" 折叠与 UpdField 卡片；Edit 表单不变，保存后旧值进 #1 的现有逻辑不变。
- **Projects**：删掉 5 个隐藏子列 → 单列 **Key Updates**（默认显示）；不点开时单元格合并为带序号要点（`1. Progress: …; Next Step: …; …; Update: <date>`）；View 弹窗改为只读表格；Excel 导出该列 = 合并纯文本。新建/编辑表单 5 字段保留（创建第一版 = #1）。
- **Guide**：Key Updates 描述更新为两行表格 + 合并要点说明。
- 配色审计一并完成：Current Phase 9 预设全区分、自定义阶段哈希分配饱和色（badge 与 Dashboard 柱状图同色）、Dashboard 旧键名图表配色已修复；demo 数据 `SIT / UAT / MTP` 统一为 `SIT/UAT/MTP`。
- 验证：lint + build 通过；Playwright demo 探针确认 BMS 3 个两行表格（序号 1/2）、Projects 合并文本（`1. Progress:`/`2. Progress:`/`Update: 2026-07-28`）、View 弹窗表格、无 console 报错。
- **补充调整（同日）**：全部界面强制英文（`toLocaleDateString`/`toLocaleTimeString` 指定 `en-US`，修掉 Update Date 等显示中文）；Create/Edit Project 弹窗的更新区改为**单行小表格**（# 自动=1 + Progress/Next Steps/Blockers/ETA/Owner/Update Date）；New Project 弹窗加宽到 960、View 弹窗加宽到 1100；富文本显示策略——BMS 表格**保留完整富文本**（加粗/颜色/高亮），Projects View 弹窗表格仅保留**加粗**（`richToBold` 剥离颜色/高亮/span/div），Key Updates 合并列仅**关键要素标题加粗**（`updatesToMarkup`）；修复 `richToBold` 误处理 `<html>/<body>` 导致的 View 弹窗白屏。

## ✅ Biz Case 改版为 Biz Benefit（仅保留收益，需一次迁移）
- 按需求语义区分：Business Case（立项论证文档）与 Business Benefit（预期收益）不是一回事；仪表盘**只保留 Biz Benefit**，去掉 Biz Case 概念。
- **DB**：`supabase/migrations/20260806_rename_biz_case_to_biz_benefit.sql` — `ALTER TABLE projects RENAME COLUMN biz_case TO biz_benefit;`（线上 projects 表为空，无数据迁移成本）。**尚未在 SQL Editor 执行，待用户跑**（改完前端字段名后未执行前 DB 读写该字段会报列不存在，需先跑迁移）。
- **Projects**：7 处 `biz_case`→`biz_benefit`、标签改 **Biz Benefit**（列定义/导出/表单/保存/单元格/View 弹窗）；占位符改 `Expected business benefits — e.g. cost savings, reduced lead time, improved CSAT, man-hour savings`；**保持必填**。
- **Guide**：释义定为——"Business benefits are the value or advantages a project is expected to deliver. Common benefit indicators include: **cost saving, cost avoidance, HC saving (headcount reduction), man-hour / effort saving, revenue increase, customer satisfaction score (CSAT), operational efficiency (e.g. lead time reduction), compliance adherence, defect escape rate, technical accuracy, reusability rate, and user adoption rate**. Where possible, quantify the expected benefit (e.g. reduce lead time from 10 days to 5 days) so it is measurable."
- **demoData**：5 个项目键名改 `biz_benefit`，值去掉 business-case 前缀、只写收益，覆盖 cost saving / HC saving / man-hour saving / CSAT / cost avoidance / reusability 等维度。
- 验证：lint + build 通过；Playwright 确认 View 弹窗 `BIZ BENEFIT` 标签 + 新值、无旧 "Biz Case" 残留、Guide 文案（含 HC saving / 逗号 / quantify 句）、无 console 报错。

## 环境事实
- 项目 ref：`nqygyktioiwabvyfziev`（Asia-Pacific）
- 公开 repo：https://github.com/zoe-zhuo-wang/dhara-dashboard
- 内网 remote：gitlab.xpaas.lenovo.com（wangzhuo18）

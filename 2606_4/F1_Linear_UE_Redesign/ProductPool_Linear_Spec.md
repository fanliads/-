# Product Pool Linear Spec

## Summary

产品需求池是产品经理持续推进“用户故事”的高密度工作台。原始需求池中拆出的条目在产品需求池中被视为用户故事，产品经理围绕用户故事进行分析、补充验收口径、维护排期和交付材料。页面复用原始需求池的 Linear-inspired shell、紧凑列表、Space Peek、行点击详情、标签编辑和日期选择器。

This document defines the reviewable prototype scope only. It does not authorize production frontend, backend API, route, or database changes.

## Layout

- App shell:
  - Left sidebar width: 248px on desktop.
  - Main canvas: light neutral background with one white list surface.
  - Top bar height: 52px, single row only.
- Sidebar:
  - Navigation groups match the raw pool prototype.
  - Active item: 产品需求, using the same subtle grey selected background.
- Main page:
  - Header title: 产品需求池.
  - Secondary row: view chips for 全部产品需求, 未排期, 待设计, 开发中, 本迭代, 空状态.
  - Right tools: search, filter, display settings, create action.
- List:
  - Default management mode is grouped by status, similar to Linear issue groups.
  - Each row uses the product requirement title as the left anchor and tag pills on the right for 类型、业务线、优先级、处理人、所属迭代、PRD、项目 / 父需求.
  - Tag pills remain readable by default and become editable on click.
  - Row height target: 44px to 52px, compact mode 40px.
  - Title area owns the flexible width.
  - No summary card strip above the list.
  - No operation column.
- Peek:
  - Hover a row and press Space to open a right-side preview.
  - Holding Space pins the preview.
  - Space closes the preview; Arrow Up / Arrow Down changes the preview target.
- Detail:
  - Clicking a row opens the full detail page.
  - Detail expands all related business sections and fields.

## Default Fields

| Column | Source field | Behavior |
|---|---|---|
| 产品需求标题 / 产品需求编号 | `title`, `reqNo`, `isDirect`, `rawReqId`, `rawReqTitle` | Not editable in the list; row click opens detail; direct-created marker stays visually quiet |
| 类型 | `reqType` | Click cell to open a Linear-style field menu |
| 业务线 | `businessLineName` | Click cell to open a Linear-style field menu |
| 状态 | `statusName` | Click cell to open a field menu; setting to 作废 or 验收不通过 requires a reason |
| 优先级 | `priority` | Click cell to open a field menu |
| 处理人 | `handler` | Click cell to open a plain text user menu |
| 所属迭代 | `sprintName` | Click cell to open a sprint menu; supports clearing to 未排期 |
| PRD | `prdUrl` | Link-style trigger; does not open row detail |
| 项目 / 父需求 | `projectName`, `rawReqId`, `rawReqTitle` | Opens a lightweight parent raw requirement preview Drawer |

## Interactions

- View chips filter the prototype sample dataset.
- Search filters by title, product requirement number, parent raw requirement, business line, status, sprint, owner, handler, and requirement type.
- Filter button opens a floating panel with status, business line, priority, sprint, handler, type, and 未排期 options.
- Display settings opens a floating panel for density and column visibility preview.
- List fields except 产品需求标题 and 产品需求编号 show editable hover affordances.
- Clicking an editable field opens a floating Linear-style menu near the cell; the current value is checked at the top.
- User fields use plain text in the list and menu; no avatar-style decoration is shown.
- Date fields open a calendar picker with month navigation, today, and clear actions.
- PRD, direct-created, project, and parent raw requirement markers use flat icons or lightweight text with hover tooltips.
- 原始需求预览 Drawer is available from the list and detail contexts; it only reviews upstream source context and does not replace the product requirement Peek.
- Row-level completion/check controls are not shown unless a concrete status-transition action is confirmed; the current prototype removes the inactive row circle control.
- Top-level 新建产品需求 creates a prototype-only user story in Todo / 待设计 and shows it immediately.
- Status-group `+` creates a prototype-only user story in that group status and shows it immediately.
- Row click opens detail.
- Hover row + Space opens Peek.
- Space Peek is mutually exclusive with filter menu, field menu, detail page, reject dialog, and parent raw requirement Drawer; repeated keydown must not create layered Peek overlays.
- Holding Space pins Peek; pressing Space again closes it.
- Arrow Up / Arrow Down changes Peek content while Peek is open.
- Empty state is reachable by the 空状态 chip and must keep the page shell stable.

## Peek Content

- Header: product requirement number, title, close action, status, priority, type, direct-created marker.
- Primary content rule:
  - 用户故事 is the primary reading area and must appear before field facts.
  - 产品经理分析 follows the story and records scope, delivery judgment, and acceptance focus.
  - 原始需求追加说明 follows PM analysis and explains upstream context, constraints, and missing background.
  - All fields, PRD, sprint, project, parent raw requirement, value, and activity information are auxiliary judgment information.
- Body sections:
  - 用户故事
  - 产品经理分析
  - 原始需求追加说明
  - 辅助判断信息
  - 父需求与业务字段
  - 排期、价值与材料
  - 活动记录
- Fixed action row:
  - 详情

## Detail Page

- Detail page opens from list row click or the Peek 详情 button.
- Detail page must follow the same object meaning and information priority as Peek: story-first, PM-analysis second, raw-requirement append third, fields and delivery facts later.
- Required sections:
  - 用户故事
  - 产品经理分析
  - 原始需求追加说明
  - 辅助判断信息
  - 父需求与业务字段
  - 排期、价值与材料
  - 价值回归 / 补充记录
  - 历史活动记录
- Detail should favor expanded business boards over compact drawer/card stacks.
- Parent raw requirement section:
  - Shows parent raw requirement number, title, business submit summary, business decision summary, and ticket link when `isDirect !== 1`.
  - Shows direct-created explanation when `isDirect === 1`.
- Sprint section:
  - Supports assigning, changing, and clearing sprint in prototype local state.
  - 未排期 should be visible and calm, not a high-alert badge.
- Delivery material section:
  - Supports editing PRD 地址 and 设计文档.
  - Link icons must not trigger row detail navigation.

## New Product Requirement

- Create action opens a focused modal rather than navigating away.
- Required prototype fields:
  - 产品需求标题
  - 业务线
  - 优先级
  - 需求类型
  - 负责人 / 处理人
  - 迭代, optional
  - 期望上线时间
  - 需求描述
- Created rows are prototype-only local state and marked as 直接创建.

## Acceptance Criteria

- The page visually reads as the same product family as `Prototypes/raw-pool-linear.html`: quiet chrome, compact list, restrained color, minimal page furniture.
- Table headers are Chinese.
- No summary card strip appears above the list.
- No operation column appears in the list.
- All editable visible fields use cell-level hit areas and Linear-style popovers or date pickers.
- 负责人 and 处理人 menus are plain text, without avatar dots.
- PRD, design document, parent raw requirement, and direct-created markers are flat and have hover tooltips.
- Peek is opened by hover row + Space and contains only the 详情 action.
- Row click opens the full detail page.
- At 1435x931, the list, Peek, and detail page do not overlap incoherently.
- Long titles remain readable without pushing other columns out of alignment.
- Empty state, filter popover, display popover, keyboard Peek, editable hover states, create modal, and detail page can all be reviewed in the static prototype.
- No backend API, route, or production Vue files are changed during prototype confirmation.

# Raw Pool Linear Spec

## Summary

The raw requirement pool is a focused object list with a Linear-inspired shell: quiet sidebar, compact top bar, view chips, table-like list, keyboard Peek preview, and a full detail page after row click.

This document defines the reviewable prototype only. It does not authorize production frontend edits.

## Layout

- App shell:
  - Left sidebar width: 248px on desktop.
  - Main canvas: light neutral background with one white list surface.
  - Top bar height: 52px, single row only.
- Sidebar:
  - Top utility icons and workspace identity.
  - Navigation groups use Chinese labels: 收件箱, 工作区, 保存视图, 团队.
  - Active item: 原始需求, using a subtle grey selected background.
- Main page:
  - Header title: 原始需求池.
  - Secondary row: view chips for 全部原始需求, 待评估, 待设计, 加急, 空状态.
  - Right tools: search, filter, display settings, create action.
- List:
  - Header is sticky within the list surface.
  - Row height target: 44px to 52px, compact mode 40px.
  - Title column owns the flexible width.
  - No operation column.
- Peek:
  - Hover a row and press Space to open a right-side preview.
  - Holding Space marks the preview as pinned.
  - Space closes the preview; Arrow Up / Arrow Down changes the preview target.
- Detail:
  - Clicking a row opens the full detail page.
  - Detail expands all related business sections and fields.

## Default Fields

| Column | Source field | Behavior |
|---|---|---|
| 需求标题 / 需求编号 | `title`, `reqNo`, `isUrgent`, `submitOrigin`, `reqLink` | Not editable in the list; row click opens detail; leading icon opens the requirement ticket link |
| 业务线 | `businessLineName` | Click cell to open a Linear-style field menu |
| 状态 | `statusName` | Click cell to open a field menu; setting to 拒绝 requires a reason |
| 优先级 | `priority` | Click cell to open a field menu |
| 产品经理 | `productManager` | Click cell to open a user menu with current value checked |
| 项目经理 | `projectManager` | Click cell to open a user menu with current value checked |
| 提出人 | `proposer` | Click cell to open a user menu with current value checked |
| 期望上线时间 | `expectedOnlineDate` | Click cell to open a calendar date picker |
| 创建时间 | `createTime` | Shown as 创建时间; click cell opens a calendar date picker |

## Interactions

- View chips filter the sample dataset in the prototype.
- Search filters by title, requirement number, ticket, business line, manager, proposer, and status.
- Filter button opens a floating panel with status, business line, priority, source, and urgent options.
- Display settings opens a floating panel for density and column visibility preview.
- List fields except 需求标题 and 需求编号 show editable hover affordances.
- Clicking an editable field opens a floating Linear-style menu near the cell; the current value is checked and related options are grouped below.
- User fields use plain text in the list and menu; no avatar-style decoration is shown.
- Date fields open a calendar date picker with month navigation, today, and clear actions.
- The leading icon in the title column opens the requirement ticket link and does not open detail.
- Row click opens detail.
- Hover row + Space opens Peek.
- Holding Space pins Peek; pressing Space again closes it.
- Arrow Up / Arrow Down changes Peek content while Peek is open.
- Empty state is reachable by the 空状态 chip and must keep the page shell stable.

## Peek Content

- Header: requirement number, title, close action, status, priority, flat icons for 加急 and 外部提交.
- Primary properties: all list fields.
- Body sections:
  - 需求描述
  - 业务提交
  - 业务判定
  - 关联产品需求
  - 活动记录
- Fixed action row:
  - 详情

## Detail Page

- Detail page opens from list row click or the Peek 详情 button.
- Required sections:
  - 主档字段
  - 业务提交
  - 业务判定
  - 需求拆分
  - 历史活动记录
- Detail should favor expanded business boards over compact drawer/card stacks.
- Requirement split section:
  - Shows split product requirements in a compact editable table.
  - Fields: 产品需求编号, 产品需求标题, 产品经理, 优先级, 状态.
  - Supports creating a suggested split item, adding a manual split item, editing fields directly, and deleting a split item.
  - Split items are prototype-only local state and do not call backend APIs.

## Acceptance Criteria

- The page visually reads closer to Linear than the invalidated `2606_3` prototype: quiet chrome, compact lists, restrained color, minimal page furniture.
- Table headers are Chinese.
- 加急 and 外部提交 are flat icons with hover tooltips.
- No summary card strip appears above the list.
- No operation column appears in the list.
- At 1435x931, the list, Peek, and detail page do not overlap incoherently.
- Long titles remain readable without pushing other columns out of alignment.
- Empty state, filter popover, display popover, keyboard Peek, editable hover states, and detail page can all be reviewed in the static prototype.
- Detail page supports reviewing and editing requirement split items without leaving the page.
- No backend API, route, or production Vue files are changed during prototype confirmation.

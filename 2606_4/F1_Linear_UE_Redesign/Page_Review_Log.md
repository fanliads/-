# Page Review Log

This log is the approval gate for the new iteration. A page is not considered ready for implementation until its latest review entry is marked `Confirmed`.

## Review Status

| Page | Prototype | Status | Last Updated | Notes |
|---|---|---|---|---|
| 原始需求池 | `Prototypes/raw-pool-linear.html` | Ready for first review | 2026-07-08 | First Linear-inspired prototype delivered for page-by-page confirmation |
| 原始需求池 | `Prototypes/raw-pool-linear.html` | Updated for new business notes | 2026-07-09 | Applied `业务说明/原始需求池.md`: Space Peek, row-click detail, editable fields, Chinese headers, ticket link, expected online time |
| 产品需求池 | Pending | Requirement drafted | 2026-07-09 | Added `业务说明/产品需求池.md` and `ProductPool_Linear_Spec.md`; aligns with raw pool style and interaction logic |
| 产品需求池 | `Prototypes/product-pool-linear.html` | Ready for first review | 2026-07-09 | Added reviewable HTML prototype for product pool validation |
| 产品需求池 | `Prototypes/product-pool-linear.html` | Updated from 2606_3 current system | 2026-07-09 | Reworked fields and interactions against `2606_3/F1_整体UE升级`: current product pool columns, unscheduled view, PRD link, project/parent raw preview Drawer |
| 产品需求池 | `Prototypes/product-pool-linear.html` | Updated for tag grouping and Peek bug fix | 2026-07-09 | Changed list to status groups with editable tag pills; made Space Peek mutually exclusive with other overlays |
| 产品需求池 | `Prototypes/product-pool-linear.html` | Updated Peek information architecture | 2026-07-10 | Reframed product pool objects as user stories; Peek now prioritizes 用户故事、产品经理分析、原始需求追加说明 |
| 产品需求池 | `Prototypes/product-pool-linear.html` | Detail aligned with Peek architecture | 2026-07-13 | Detail page now follows the same story-first object meaning as Peek |
| 产品需求池 | `Prototypes/product-pool-linear.html` | Create interactions completed | 2026-07-13 | Removed inactive row circle control; top create and status-group plus now add visible prototype user stories |
| 原始需求池 + 产品需求池 | `Prototypes/requirement-pools.html` | Combined delivery ready | 2026-07-14 | Added combined PRD and prototype entry for reviewing both requirement pools together |
| 原始需求池 + 产品需求池 | `2605 capability baseline + 2606_4 interaction baseline` | Baseline Confirmed | 2026-07-14 | User confirmed: 2605 保能力、2606_4 定交互；未被 2606_4 明确覆盖的历史能力不得删除 |

## Entries

### 2026-07-16 - UAT execution against isolated acceptance data

- Status: UAT failed; release gate remains closed.
- Environment: isolated MySQL acceptance database on port 3307, local backend on 8081, frontend on 4173, viewport 1435×931.
- Evidence: `UAT_Report_2026-07-16.md` and `UAT_Evidence/`.
- Passed: real admin login, raw/product data loading, raw detail, product status grouping, parent-raw grouping, parent Drawer, Story-first detail, required-title validation, and production frontend build.
- High findings: raw detail has no historical activity record; product create form lacks expected-online date and a complete owner/handler model.
- Remaining blocked coverage: multi-role browser regression and injected API failure/rollback scenarios.
- Decision: do not mark the iteration as `Accepted` until High findings are closed and business re-verification is signed.

### 2026-07-16 - Shared control sizing and alignment pass

- Status: Implemented and browser-measured, pending user visual confirmation
- Source: User annotated product-pool screenshot.
- Changes:
  - Replaced font-dependent search, chevron, and plus glyphs with a shared SVG `LnIcon` component.
  - Unified standard controls to 32px, compact icon buttons to 28×28px, and content icons to 14–16px.
  - Corrected `LnInput` box sizing so the product-pool search field now shares the same height and centerline as adjacent toolbar buttons.
  - Aligned workspace switcher controls and product status-group caret, dot, label, count, and add action on common centerlines.
- Verification:
  - Browser measurement confirmed the search input and toolbar buttons are both 32px high on the same centerline.
  - Browser measurement confirmed workspace chevron/collapse controls and group title/add controls are 28px on matching centerlines.
  - `vue-tsc -b` and Vite production build passed.

### 2026-07-15 - 2606_4 component alignment and product-pool field remediation

- Status: Implemented, pending visual and UAT review
- Production code: `/Users/mac/Desktop/QoderWork/2606_1/frontend`
- Iteration baseline: `/Users/mac/Desktop/QoderWork/2606_4/F1_Linear_UE_Redesign`
- Changes:
  - Confirmed that `2606_4` is the iteration specification and acceptance directory; the existing production application remains in `2606_1/frontend` to avoid a divergent duplicate system.
  - Applied the Linear-style `Ln*` component system to the existing application and identified the component showcase as `REQ UI / 2606_4`.
  - Changed the product requirement type from static list metadata to an inline-editable property picker.
  - Expanded product-pool display settings to cover type, business line, status, priority, handler, sprint, parent requirement, and PRD visibility.
  - Kept raw-requirement creation time read-only because editability is still an explicit product/API decision in the traceability matrix.
- Verification:
  - `vue-tsc -b` passed.
  - Vite production build passed on 2026-07-15.
  - Visual review and API/UAT evidence remain pending; build success is not treated as acceptance.

### 2026-07-14 - Raw-pool density and redundancy review

- Status: Updated from user screenshot feedback, pending visual confirmation
- Source: User annotated screenshot of the local raw-pool implementation.
- Problems confirmed:
  - Page identity was repeated in the sidebar context, top bar, and page header.
  - The global top-bar create action duplicated the page-level create action.
  - Requirement title, number, and description preview created repetitive three-line rows.
  - Expected-online and created-time columns were too narrow and visually crowded.
- Changes:
  - Removed the sidebar page-context card and the repeated top-bar page title.
  - Hid the global create action on raw-pool and product-pool routes, retaining the contextual page action.
  - Reduced each list identity to a single line: title, number, and exceptional markers only.
  - Removed repeated description previews from both pool lists.
  - Rebalanced the raw-pool grid and reserved stable 124px/132px widths for the final date columns.
  - Rendered created time as a list-level date; full time remains available in detail.
  - Removed the heavy card treatment from the page header and reduced vertical spacing.
- Verification:
  - `vue-tsc -b` passed.
  - Vite production build passed.
  - Visual confirmation remains pending.

### 2026-07-14 - R1 common interaction remediation

- Status: Implemented, pending visual review
- Baseline: `2605 保能力、2606_4 定交互`.
- Changes:
  - Removed the permanently occupied right detail column from both pools.
  - Restored full-width lists; Space opens a right-side Peek overlay and row click opens a full detail layer.
  - Converted filter and display settings back to floating panels.
  - Fixed the raw-pool business-line/project-manager column visibility mismatch.
  - Restored inline proposer editing and reject-reason confirmation.
  - Restored raw-pool single and batch AI priority entry points without reintroducing an operation column.
  - Kept product status grouping as default and restored the historical parent-raw grouping as an alternate view.
- Verification:
  - `vue-tsc -b` passed.
  - Vite production build passed.
  - Visual and UAT status remains pending; build success is not treated as acceptance.

### 2026-07-14 - Implementation baseline confirmation

- Status: Baseline Confirmed
- Confirmed by: User
- Decision: `2605 保能力、2606_4 定交互`.
- Interpretation:
  - `2605_1/F1_ReqMgmt/Prototypes` is the historical capability baseline.
  - `2606_4/F1_Linear_UE_Redesign/Prototypes` is the interaction and visual baseline.
  - Capabilities explicitly replaced by `2606_4` follow the new interaction.
  - Capabilities not explicitly replaced by `2606_4` must remain available in the system.
  - Removal, migration, or consolidation of a historical capability requires an explicit traceability record.
- Implementation consequences:
  - 产品需求池 defaults to the `2606_4` status-grouped view, while the historical parent-raw grouping remains available as an alternate view.
  - Raw-pool AI priority and activity-history capabilities remain available, but their entry points must follow the `2606_4` no-operation-column rule.
  - Peek follows the `2606_4` overlay model; row click opens the complete detail experience instead of a permanently occupied side column.
  - All production changes must be checked against `Implementation_Traceability_Matrix.md` before UAT.

### 2026-07-09 - 产品需求池 requirement draft

- Status: Requirement drafted
- Source: user request to create a UE optimization iteration requirement for 产品需求池, referencing the current 原始需求池 style and interaction logic.
- Scope:
  - Added business notes for 产品需求池.
  - Added Linear-style product pool spec.
  - Reused the raw pool shell, Space Peek, row-click detail, editable cell popover, date picker, Chinese table header, no summary strip, and no operation column rules.
  - Added product-specific focus on 迭代、负责人、处理人、工作量、价值评分、期望上线时间、实际上线时间、PRD 地址、设计文档 and 父原始需求回看.
- Next:
  - Build `Prototypes/product-pool-linear.html` after the product pool requirement draft is accepted or after the split workflow gate is relaxed.

### 2026-07-09 - 产品需求池 first prototype

- Status: Ready for first review
- Prototype: `Prototypes/product-pool-linear.html`
- Scope:
  - Reused the raw pool Linear-style shell, view chips, compact list, floating filter/display panels, editable field popovers, date picker, Space Peek, and row-click detail.
  - Adapted content to product requirements: PRD number, product title, business line, status, priority, owner, handler, sprint, expected online date, delivery materials, parent raw requirement context, and value regression.
  - Kept no summary card strip and no operation column.
- Verification:
  - Confirmed the prototype HTML is served at `http://127.0.0.1:8095/product-pool-linear.html`.
  - Confirmed script syntax parses successfully.

### 2026-07-09 - 产品需求池 current-system alignment

- Status: Updated for review
- Source: `2606_3/F1_整体UE升级/Background/Requirement_Background.md`, `Deepening/Implementation_Change_Checklist.md`, `Deepening/Walkthrough_ProductPool_2026-06-30.md`, and `Prototypes_v2/ue-workbench-v2.html`.
- Changes:
  - Replaced the earlier broad product-field model with the current system product pool field set: 产品需求、类型、业务线、状态、优先级、处理人、所属迭代、PRD、项目 / 父需求.
  - Kept 未排期 as an iteration/scheduling state rather than a product requirement status.
  - Added lightweight 原始需求预览 Drawer from the list relation column.
  - Kept row-click detail and hover + Space Peek consistent with the raw pool prototype.
- Verification:
  - Confirmed script syntax parses successfully.
  - Confirmed static page responds at the local review URL.

### 2026-07-09 - 产品需求池 tag grouping and Peek fix

- Status: Updated for review
- Source: user screenshot reference and feedback that Space Peek could layer over existing overlays.
- Changes:
  - Replaced table-like list rendering with status-grouped issue sections.
  - Rendered 类型、业务线、优先级、处理人、所属迭代、PRD、项目 / 父需求 as compact tag pills.
  - Kept editable tag pills for the product-pool management fields.
  - Added Space key state guard and overlay cleanup before opening Peek.
- Verification:
  - Confirmed script syntax parses successfully.
  - Confirmed static page responds at the local review URL.

### 2026-07-10 - 产品需求池 Peek information architecture

- Status: Updated for review
- Source: user feedback that product pool objects should be treated as user stories split from raw requirements, with PM analysis as the primary work content.
- Changes:
  - Reframed Peek content order from field-first to story-first.
  - Added primary sections: 用户故事、产品经理分析、原始需求追加说明.
  - Moved properties, parent raw requirement fields, sprint, PRD, value, and activity into auxiliary judgment sections.
  - Updated prototype data so each product requirement has derived user story, PM analysis, and raw-requirement append text.
- Verification:
  - Confirmed script syntax parses successfully.
  - Confirmed static page responds at `http://127.0.0.1:8096/product-pool-linear.html`.

### 2026-07-13 - 产品需求池 detail information architecture

- Status: Updated for review
- Source: user feedback that Peek content was accepted but detail page information organization had not been synchronized.
- Changes:
  - Reordered detail page to match Peek: 用户故事、产品经理分析、原始需求追加说明 first.
  - Moved product fields, parent raw requirement fields, schedule, value, PRD, and materials into auxiliary sections.
  - Updated detail rendering so it uses the same `userStory`, `pmAnalysis`, and `rawAppend` data as Peek.
- Verification:
  - Confirmed script syntax parses successfully.
  - Confirmed static page responds at `http://127.0.0.1:8096/product-pool-linear.html`.

### 2026-07-13 - 产品需求池 create interaction completion

- Status: Updated for review
- Source: user feedback that the row circle control was inactive and create actions did not produce visible business objects.
- Changes:
  - Removed the inactive row-level circle/status operation from each product requirement row.
  - Wired top-level 新建产品需求 to create a visible prototype user story in Todo / 待设计.
  - Wired each status-group `+` action to create a visible prototype user story under that group.
  - New rows are enriched with user story, PM analysis, raw append, auxiliary fields, and activity data so Peek and detail work immediately.
- Verification:
  - Confirmed script syntax parses successfully.
  - Confirmed static page responds at `http://127.0.0.1:8097/product-pool-linear.html`.

### 2026-07-14 - 原始需求池 + 产品需求池 combined delivery

- Status: Ready for review
- Source: user requested a requirement document and prototype covering both 原始需求池 and 产品需求池.
- Changes:
  - Added `Requirement_Pools_PRD.md` as the combined requirement document.
  - Added `Prototypes/requirement-pools.html` as a combined prototype entry with tabs for 原始需求池 and 产品需求池.
  - Updated `Requirement_List.md` current page to point to the combined delivery package.
- Verification:
  - Confirmed combined entry responds at `http://127.0.0.1:8098/requirement-pools.html`.
  - Confirmed raw pool and product pool child prototypes respond from the same static server.

### 2026-07-08 - 原始需求池 first prototype

- Status: Ready for first review
- Scope: raw requirement list, view chips, toolbar, filter popover, display popover, empty state, row click Peek.
- Verification:
  - Opened through local static server at 1435x931.
  - Confirmed 8 normal rows render without page-level horizontal overflow.
  - Confirmed filter popover, display popover, long-title Peek, and empty state are reachable.
  - Confirmed empty state preserves the list surface height.
- Decisions baked in:
  - No production frontend changes yet.
  - Peek opens as a right overlay and does not permanently consume list width.
  - Summary metric cards from the old iteration are removed from this page.
  - List fields follow the existing raw requirement field matrix.
- Awaiting user feedback:
  - Visual density and Linear resemblance.
  - Default columns and field order.
  - Whether Peek content depth is sufficient for the first confirmed page.

### 2026-07-09 - 原始需求池 business note update

- Status: Updated for review
- Source: `2606_4/业务说明/原始需求池.md`
- Changes:
  - Click row now opens the full detail page instead of Peek.
  - Hover row + Space opens Peek; long press pins the preview; Arrow Up / Arrow Down changes the preview row.
  - Removed the operation column.
  - Added 需求单 and 期望上线时间 columns.
  - Renamed Updated to 创建时间 and translated table headers to Chinese.
  - Made visible fields except title and requirement number editable in the list prototype.
  - Converted 加急 and 外部提交 from text badges to flat icons with tooltips.
- Verification:
  - Confirmed 10 Chinese table headers render with no operation column.
  - Confirmed 8 rows render without page-level horizontal overflow at 1435x931.
  - Confirmed hover row + Space opens Peek, Arrow Down switches preview content, and Space closes Peek.
  - Confirmed row click opens detail page with 业务提交、主档字段、业务判定、历史活动记录 sections.
  - Confirmed setting 状态 to 拒绝 opens an in-page reason dialog and only writes 拒绝 after confirmation.

### 2026-07-09 - Inline field menu interaction update

- Status: Updated for review
- Source: user screenshot reference for Linear field edit interaction.
- Changes:
  - Replaced always-visible `input` / `select` controls with display-only field triggers.
  - Clicking an editable cell opens a floating menu near the cell.
  - Current value is checked at the top of the menu.
  - User fields initially showed avatar-style options and an "邀请并添加" placeholder.
  - Status, priority, business line, owner, proposer, and date fields now share the same popover editing pattern.
- Verification:
  - Confirmed the list renders with 0 row-level `input` and 0 row-level `select` controls.
  - Confirmed editable fields render as 64 value triggers across 8 rows.
  - Confirmed clicking 产品经理 opens a floating menu with current value checked, grouped options, avatars, and invite action.
  - Confirmed selecting a user value updates the row and closes the menu.
  - Confirmed selecting 状态 = 拒绝 closes the menu and opens the in-page reason dialog.

### 2026-07-09 - Ticket link and people field simplification

- Status: Updated for review
- Source: user review feedback.
- Changes:
  - Removed the standalone 需求单 text column.
  - Reused the leading icon in the title column as the requirement ticket link button.
  - Kept 产品经理、项目经理、提出人 as plain text triggers without avatar dots in the list.
  - Simplified people-field menu options so they no longer add avatar-style visual redundancy.
- Verification:
  - Confirmed table headers are now 需求标题、业务线、状态、优先级、产品经理、项目经理、提出人、期望上线时间、创建时间.
  - Confirmed 产品经理 click opens the floating field menu.
  - Confirmed there are no avatar dots in the list or people-field menu.
  - Confirmed ticket icon click does not open detail, closes any open field menu, and triggers the ticket-link placeholder.

### 2026-07-09 - Editable cell hit area fix

- Status: Updated for review
- Source: user reported 产品经理 menu did not open reliably.
- Changes:
  - Expanded editable hit area from the text trigger to the full table cell.
  - Added hover affordance on editable cells so clicking whitespace inside the cell behaves the same as clicking the text.
- Verification:
  - Confirmed clicking the right-side whitespace inside 产品经理 cell opens the floating menu.
  - Confirmed the click does not open the detail page.

### 2026-07-09 - Hover rerender stability fix

- Status: Updated for review
- Source: user reported hover effect and field menu were still unstable.
- Root cause:
  - Row hover previously called `renderRows()`, replacing DOM nodes right before click.
- Changes:
  - Hover now only toggles row classes through `syncRowStateClasses()`.
  - Initial hover state is empty instead of forcing the first row into hovered state.
  - Added `pointerover` alongside `mouseover` for more reliable mouse tracking.
- Verification:
  - Confirmed initial page has 0 forced hovered rows.
  - Confirmed clicking the whitespace inside 产品经理 cell opens the floating menu.
  - Confirmed the click does not open detail.

### 2026-07-09 - Date picker interaction update

- Status: Updated for review
- Source: user feedback that date switching should use a date picker control.
- Changes:
  - 期望上线时间 and 创建时间 now open a calendar picker instead of a normal option menu.
  - Calendar picker supports previous/next month, selecting a day, 今天, and 清空.
  - Non-date fields continue to use the Linear-style field menu.
- Verification:
  - Confirmed clicking 期望上线时间 opens a calendar menu with 42 day cells.
  - Confirmed selecting `2026-07-20` writes the date back to the row and closes the picker.
  - Confirmed 产品经理 still opens the normal non-calendar field menu.

### 2026-07-09 - Peek action simplification

- Status: Updated for review
- Source: user feedback that Peek only needs the 详情 action.
- Changes:
  - Removed 要求补充, 承接, and 进入设计 from the Peek fixed action row.
  - Kept only a single primary 详情 button that opens the detail page.
- Verification:
  - Confirmed browser DOM renders exactly 1 Peek action button.
  - Confirmed the remaining Peek action is the primary 详情 button.

### 2026-07-09 - Detail requirement split section

- Status: Updated for review
- Source: user feedback that detail needs requirement split functionality.
- Changes:
  - Replaced the old detail header placeholder action with 需求拆分.
  - Added a 需求拆分 section to the detail page.
  - Split items are displayed as a compact editable table.
  - Added prototype interactions for 生成建议, 新增产品需求, direct field editing, and deletion.
- Verification:
  - Confirmed detail page opens from the list title.
  - Confirmed 需求拆分 section renders existing split product requirements.
  - Confirmed 新增产品需求 creates a new split row.
  - Confirmed editing split title and status writes values into the row controls.
  - Confirmed deleting the new split row restores the previous split count.

### 2026-07-14 - Unified inline select popover

- Status: Implemented and browser-verified
- Source: user review screenshots comparing the current empty select state with a Linear-style status menu.
- Root cause:
  - `EditableCell` and `EditableField` replaced the rendered value with a new `el-select` while editing, which removed context and caused row-width movement.
  - Product requirements also reused the raw-requirement status dictionary, so the displayed product status could not be recognized as the current menu option.
- Changes:
  - Added one shared anchored select popover for list cells and detail fields.
  - The original value now remains visible in place while the menu opens below it.
  - Added searchable options, semantic status markers, current-option highlighting/checkmark, hover state, keyboard navigation, and outside-click closing.
  - Normalized string/number comparisons so dictionary IDs are selected consistently.
  - Added a dedicated product-status option set matching the product workflow.
- Verification:
  - Confirmed 产品需求池的“开发中”触发器在菜单打开后仍保持可见。
  - Confirmed the product status menu marks “开发中” as the selected option.
  - Confirmed 优先级 uses the same popover and marks “二级（P2）” as selected.
  - Confirmed `npm run build` passes.

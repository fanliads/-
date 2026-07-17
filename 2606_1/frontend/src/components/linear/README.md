# REQ Linear Component Library

Vue 3 + TypeScript 组件库，用于需求管理系统的高密度列表、属性编辑、看板、迭代、任务与表单场景。所有样式使用 `ln-` 命名空间，设计令牌位于 `src/styles/linear-tokens.scss`。

## 使用方式

```ts
import { LnButton, LnSelect, LnPropertyPicker } from '@/components/linear'
```

集中陈列页：`/linear-components`。

## 组件目录

| 类别 | 组件 | 主要用途 |
|---|---|---|
| 基础 | `LnButton` | 主、次、幽灵、危险、图标、加载和链接按钮 |
| 基础 | `LnPressable` | 整行、整卡等复杂可点击表面的选中和键盘语义 |
| 基础 | `LnBadge` | 状态、优先级和轻量元信息 |
| 基础 | `LnAvatar` | 用户首字、图片回退、稳定配色和在线状态 |
| 基础 | `LnTooltip` | 悬停说明与快捷键提示 |
| 基础 | `LnCheckbox` | 单项选择、批量选择与说明文案 |
| 基础 | `LnSwitch` | 设置项的即时开启与关闭 |
| 输入 | `LnInput` | 单行输入、前缀、错误、提示、清除、长度限制和计数 |
| 输入 | `LnPasswordInput` | 密码显隐、自动填充、错误提示和键盘提交 |
| 输入 | `LnTextarea` | 多行输入、字数限制和提示 |
| 输入 | `LnRichTextEditor` | 富文本格式、链接对话框、图片上传和粘贴 |
| 输入 | `LnDateInput` | 单日期选择与清除 |
| 输入 | `LnDateRange` | 日期区间选择与清除 |
| 选择 | `LnSelect` | 搜索、描述、颜色、禁用和清除 |
| 选择 | `LnInlineSelect` | 表格和详情字段的搜索选择、键盘导航与即时保存 |
| 选择 | `LnPropertyPicker` | 状态、优先级、负责人、迭代等快速属性编辑 |
| 选择 | `LnColorPicker` | 标签颜色、方向键切换、单选语义和色值展示 |
| 编辑 | `LnInlineEdit` | 文本就地编辑，支持 Enter、Esc 和失焦保存 |
| 浮层 | `LnPopover` | 锚点浮层、外部点击和 Esc 关闭 |
| 浮层 | `LnMenu` | 标准操作菜单、快捷键、分隔线和危险操作 |
| 浮层 | `LnCommandMenu` | 全局命令搜索与键盘导航 |
| 浮层 | `LnDialog` | 模态任务、焦点圈定、滚动锁定和移动端适配 |
| 浮层 | `LnDrawer` | 侧滑详情、焦点圈定、滚动锁定、Esc 和移动端适配 |
| 反馈 | `LnToastStack` | 中性、成功、警告和错误通知，配套全局 `lnToast` 服务 |
| 反馈 | `LnConfirmDialog` | 排队展示确认/输入对话框，支持危险语义、校验和取消异常 |
| 反馈 | `LnSkeleton` | 列表、卡片和详情结构化加载 |
| 反馈 | `LnLoadingOverlay` | 阻断式局部或全屏加载，支持轻遮罩与辅助文案 |
| 反馈 | `LnEmptyState` | 空结果、无数据和下一步操作 |
| 反馈 | `LnCallout` | 阶段说明、风险提醒与上下文动作 |
| 外壳 | `LnWorkspaceSwitcher` | 工作区标识、入口和侧栏折叠态 |
| 外壳 | `LnNavItem` | 权限过滤后的主导航项与激活态 |
| 外壳 | `LnUserButton` | 侧栏用户卡片与紧凑用户菜单入口 |
| 导航 | `LnBreadcrumbs` | 应用层级上下文、当前页面与可跳转父级 |
| 导航 | `LnTabs` | 页面标签与紧凑分段切换 |
| 导航 | `LnPagination` | 页码、每页数量和跳页 |
| 日历 | `LnCalendarDay` | 日期状态、日程条、溢出计数和事件选择 |
| 筛选 | `LnFilterBuilder` | 多条件组合筛选 |
| 详情 | `LnPeek` | 右侧 Overlay 快速预览 |
| 表单 | `LnFormSection` | 长表单语义分区 |
| 表单 | `LnForm` | 表单模型、规则注册、横向/顶部标签、整体/字段校验和重置 API |
| 表单 | `LnFormItem` | 可覆盖标签布局的字段标签、必填/自定义校验、错误状态和提示 |
| 列表 | `LnIssueRow` | 通用需求列表行 |
| 列表 | `LnTaskRow` | 我的工作任务行与动作插槽 |
| 看板 | `LnBoardColumn` | 看板列头、计数和列空状态 |
| 看板 | `LnIssueCard` | 看板需求卡片 |
| 迭代 | `LnSprintRow` | 迭代导航行 |
| 数据 | `LnProgress` | 迭代完成度和通用进度 |
| 数据 | `LnMetric` | 核心数量、趋势、单位和风险摘要 |

公共类型位于 `types.ts` / `form.ts`：`LnOption`、`LnInlineOption`、`LnFilterRule`、`LnFormRules`、`LnFormInstance`、`LnTabOption`、`LnBreadcrumbItem`、`LnCalendarEvent`、`LnToastItem`。

## 页面迁移状态

| 页面 | 已迁移内容 | 状态 |
|---|---|---|
| 原始需求池 | 工具栏、视图 Tabs、筛选动画、状态/优先级、列表/Peek 骨架、显示设置、日期、空状态、分页、Peek、新建、双栏拆分和补充记录 Dialog | 已完整接入 Linear 表单与交互组件 |
| 产品需求池 | 工具栏、视图/分组 Tabs、筛选动画、全部选择型属性、父需求预览/PRD 链接、分组/Peek 加载、空状态、分页、原始需求 Drawer、新建/编辑、富文本描述和补充记录 Dialog | 已完整接入 Linear 表单与交互组件 |
| 迭代管理 | Sprint Row、搜索、完成度、加载、空状态、纳入/移出动作、未排期需求选择和新建迭代 Dialog | 已完整接入 Linear 表单与交互组件 |
| 看板 | 工作台/需求类型 Tabs、筛选、搜索、Board Column、Issue Card、加载与空状态 | 已接入；拖拽尚无业务接口 |
| 我的工作 | 待办/已处理 Tabs、搜索、Task Row、加载、空状态、分页、详情空状态 | 已接入 |
| 工作流操作 | 动作按钮、加载/无动作状态、审批意见和状态流转确认 Dialog | 已接入共享组件 |
| 通用内联编辑 | 表格单元格、详情字段、文本/多行文本、日期、开关和 `LnInlineSelect` 搜索选择浮层 | 已接入共享组件 |
| 共享需求抽屉 | 原始/产品需求页签、加载、空状态、评论、补充动作和优先级覆盖表单 | 已完整接入 `LnDrawer` |
| 通知入口 | 图标按钮、未读计数、轮询、加载骨架、可点击通知项、全部已读和需求跳转 | 已接入共享组件 |
| 列表视图 | 搜索、状态/优先级/来源筛选、可选择需求行、加载骨架、空状态和分页 | 已接入 |
| 日历视图 | 月份导航、Calendar Day、加载骨架和详情空状态 | 已接入 |
| 优先级视图 | 搜索、新建动作、指标摘要、可选择需求卡、加载骨架、分组/详情空状态和详情徽标 | 已接入 |
| 进度视图 | 阶段提示、指标摘要、分段筛选、可选择进度卡、语义进度、徽标和空状态 | 已接入演示视图 |
| PM 任务 | 阶段提示、优先级筛选、搜索、可选择 PM 行、头像、负载/优先级徽标和空状态 | 已接入演示视图 |
| 新建需求 | 基础输入、日期、业务线、完整 V3 判定字段、风险选择、表单分区、备注和提交按钮 | 已完整接入 Linear 表单与交互组件 |
| 外部提报 | 标题/背景输入、业务线、日期、风险选择、长文本和提交按钮 | 已完整接入 Linear 表单与交互组件 |
| 登录与受理结果 | 用户名、密码显隐、Linear 表单校验、登录动作、环境提示和继续提交动作 | 已完整接入 |
| 应用外壳 | 工作区、主导航、面包屑、侧栏动作、全局命令搜索和统一用户菜单入口 | 已接入 |
| 系统设置 | 主标签、流程分类、审批开关、角色选择、密码和四类配置 Dialog/动作 | 已接入内部原型；正式入口暂未开放 |
| 数据看板 | 阶段关闭说明与主链路跳转动作 | 已接入内部原型；正式入口暂未开放 |

## 验收状态

- 48 个 `Ln*.vue` 组件均存在对应公共导出；展示页直接演示 44 个交互控件，其余 4 个根级/导航组件已在应用外壳使用。
- 展示页已验证 Toast、表单失败/成功、Dialog、Drawer、Confirm、Prompt 和动态筛选交互，浏览器控制台无 warning/error。
- Element Plus 标签、运行时导入、样式选择器、依赖和构建资源均为零残留。

## 实施约束

- 组件使用 `v-model` 时，调用方负责保持接口要求的数据类型；数字 ID 使用计算属性做字符串适配。
- `LnPropertyPicker` 的保存由页面调用既有接口，组件不直接访问 API。
- `LnPagination` 的 `change` 事件应调用不重置页码的数据加载函数。
- 页面级操作反馈统一直接调用 `lnToast`，由根级 `LnToastStack` 排队展示。
- 列表和详情加载优先使用 `LnSkeleton`；只有需要暂时阻断交互时才使用 `LnLoadingOverlay`。
- 全局确认和输入确认分别调用 `lnConfirm`、`lnPrompt`，取消时可使用 `isLnConfirmCancelled` 区分业务失败。
- 看板拖拽必须在状态移动接口、权限、失败回滚和乐观更新规则明确后实现。
- 组件视觉参考 Linear 的交互模式和信息密度，不复制其源码、商标或专有素材。

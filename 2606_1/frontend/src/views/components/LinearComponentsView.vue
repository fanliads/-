<template>
  <main class="showcase">
    <header class="showcase__hero">
      <div><span class="showcase__kicker">REQ UI / 2607_1 · 48 COMPONENTS · 38 ICONS</span><h1>Linear components</h1><p>紧凑、清晰、键盘友好的需求管理组件系统。</p></div>
      <div class="row"><LnTooltip text="全局命令" shortcut="⌘ K"><LnButton @click="commandOpen = true">⌘K 命令</LnButton></LnTooltip><LnButton variant="primary" @click="peekOpen = true"><template #icon><LnIcon name="plus"/></template>打开 Peek</LnButton></div>
    </header>

    <section class="showcase__grid">
      <article class="panel panel--wide icon-board">
        <header><span>00</span><div><h2>Iconography</h2><p>通用操作图标与需求状态语义图标，统一使用 16px 画布和 1.35px 描边。</p></div></header>
        <div class="icon-board__section">
          <div class="icon-board__label"><strong>Interface icons</strong><span>{{ iconNames.length }} icons</span></div>
          <div class="icon-grid">
            <div v-for="icon in iconNames" :key="icon" class="icon-tile" role="img" :aria-label="`${icon} 图标`">
              <span class="icon-tile__preview"><LnIcon :name="icon"/></span>
              <code>{{ icon }}</code>
            </div>
          </div>
        </div>
        <div v-for="group in semanticIconGroups" :key="group.title" class="icon-board__section">
          <div class="icon-board__label"><strong>{{ group.title }}</strong><span>{{ group.items.length }} semantic icons</span></div>
          <div class="icon-grid icon-grid--semantic">
            <div v-for="item in group.items" :key="`${group.title}-${item.value}`" class="icon-tile icon-tile--semantic" role="img" :aria-label="`${item.label}图标`">
              <span class="icon-tile__preview" :style="{ color: item.color }"><LnOptionIcon :value="item.value" :label="item.label" :icon="item.icon" :color="item.color"/></span>
              <span class="icon-tile__copy"><strong>{{ item.label }}</strong><code>{{ item.value }}</code></span>
            </div>
          </div>
        </div>
      </article>

      <article class="panel"><header><span>01</span><div><h2>Actions</h2><p>四种语义，两种密度，完整禁用与加载状态。</p></div></header><div class="demo row"><LnButton variant="primary">创建需求</LnButton><LnButton>筛选</LnButton><LnButton variant="ghost">取消</LnButton><LnButton variant="danger">删除</LnButton><LnButton loading>保存中</LnButton><LnButton icon-only variant="ghost" aria-label="更多"><template #icon><LnIcon name="more"/></template></LnButton></div></article>

      <article class="panel"><header><span>02</span><div><h2>Inputs & inline edit</h2><p>一致的焦点、校验与快速编辑行为。</p></div></header><div class="demo fields"><LnInput v-model="search" label="搜索需求" placeholder="标题、编号或负责人…" clearable><template #prefix><LnIcon name="search"/></template></LnInput><LnInput model-value="错误值" label="校验状态" error="请输入有效的需求编号" /><div class="inline-demo"><small>标题</small><LnInlineEdit v-model="editableTitle" /></div></div></article>

      <article class="panel"><header><span>03</span><div><h2>Badges & popover</h2><p>用低饱和色表达状态，浮层承载临时操作。</p></div></header><div class="demo row"><LnBadge dot>待处理</LnBadge><LnBadge tone="accent" dot>进行中</LnBadge><LnBadge tone="success" dot>已完成</LnBadge><LnBadge tone="warning">高优先级</LnBadge><LnBadge tone="danger">阻塞</LnBadge><LnPopover align="end"><template #trigger><LnButton size="small"><template #icon><LnIcon name="chevron-down"/></template>显示设置</LnButton></template><template #default="{ close }"><div class="menu"><b>显示属性</b><LnCheckbox v-model="showPriority" label="优先级"/><LnCheckbox v-model="showAssignee" label="负责人"/><LnCheckbox v-model="showCreatedAt" label="创建时间"/><LnButton size="small" variant="ghost" @click="close">完成</LnButton></div></template></LnPopover></div></article>

      <article class="panel panel--wide"><header><span>04</span><div><h2>Issue rows</h2><p>40px 行高保留信息密度，悬停、选中与响应式状态齐全。</p></div></header><div class="issue-list"><div class="issue-list__header"><span>待处理</span><small>3 个需求</small></div><LnIssueRow v-for="issue in issues" :key="issue.key" :issue-key="issue.key" :title="issue.title" :priority="issue.priority" :assignee="issue.assignee" :status-color="issue.color" :selected="selected === issue.key" @select="selectIssue(issue)"><template #meta><LnBadge v-if="issue.line">{{ issue.line }}</LnBadge></template></LnIssueRow></div></article>

      <article class="panel"><header><span>05</span><div><h2>Select & property picker</h2><p>支持搜索的标准选择器，以及状态与优先级快速选择。</p></div></header><div class="demo fields"><LnSelect v-model="team" label="业务线" :options="teamOptions" searchable/><div class="picker-demo"><small>需求属性</small><div class="row"><LnPropertyPicker v-model="status" title="修改状态" :options="statusOptions"/><LnPropertyPicker v-model="priority" title="修改优先级" :options="priorityOptions"/></div></div></div></article>

      <article class="panel"><header><span>06</span><div><h2>Menu & feedback</h2><p>统一菜单层级、快捷键提示和操作反馈。</p></div></header><div class="demo row"><LnPopover><template #trigger><LnButton><template #icon><LnIcon name="chevron-down"/></template>更多操作</LnButton></template><template #default="{close}"><LnMenu :items="menuItems" @select="close()"/></template></LnPopover><LnButton @click="showToast('success')">成功提示</LnButton><LnButton @click="showToast('danger')">错误提示</LnButton></div></article>

      <article class="panel panel--wide"><header><span>07</span><div><h2>Filter builder & loading</h2><p>组合筛选条件与列表骨架屏。</p></div></header><div class="split-demo"><div class="demo"><LnFilterBuilder v-model="filters" :fields="filterFields"/></div><div class="demo skeleton-demo"><div v-for="n in 3" :key="n" class="skeleton-row"><LnSkeleton circle width="22px"/><LnSkeleton width="58px"/><LnSkeleton :width="`${42+n*8}%`"/><LnSkeleton width="72px"/></div></div></div></article>

      <article class="panel panel--wide"><header><span>08</span><div><h2>Form controls</h2><p>日期、日期区间、长文本和分区容器。</p></div></header><LnFormSection title="需求背景" description="聚合一组语义相关的字段，降低长表单阅读压力。" eyebrow="01"><div class="form-demo"><LnDateInput v-model="singleDate" label="期望上线日期" clearable/><LnDateRange v-model="dateRange" clearable/><LnTextarea v-model="description" label="需求描述" :maxlength="200"/></div></LnFormSection></article>

      <article class="panel"><header><span>09</span><div><h2>Pagination & empty</h2><p>统一列表导航和无数据反馈。</p></div></header><div class="demo pagination-demo"><LnEmptyState title="没有匹配结果" description="调整筛选条件后重试。"/><LnPagination v-model:page="demoPage" :page-size="10" :total="86"/></div></article>

      <article class="panel"><header><span>10</span><div><h2>Sprint & progress</h2><p>迭代导航、状态、范围数量和完成度。</p></div></header><div class="demo sprint-demo"><LnSprintRow name="CORE2607_03" team="基础产品" start-date="2026-07-14" end-date="2026-07-25" status-label="进行中" status-tone="accent" cadence-label="双周迭代" :requirement-count="12" :progress="58" selected/><LnProgress :value="58"/></div></article>

      <article class="panel panel--wide"><header><span>11</span><div><h2>Board</h2><p>看板列和高密度需求卡片。</p></div></header><div class="board-demo"><LnBoardColumn title="待设计" :count="2" color="#d28b36"><LnIssueCard req-no="PRD-204" title="统一产品需求属性编辑体验" type-label="产品需求" priority="P1" context-main="需求管理" context-tail="基础产品" footer="CORE2607_03" owner="陈PM" selected/><LnIssueCard req-no="PRD-205" title="补齐移动端筛选交互" type-label="产品需求" priority="P2" context-main="体验优化" context-tail="增长业务" footer="未排期" owner="林悦"/></LnBoardColumn><LnBoardColumn title="已完成" :count="0" color="#2f9e6f"/></div></article>

      <article class="panel panel--wide"><header><span>12</span><div><h2>Task row</h2><p>待办、状态、时间与上下文操作。</p></div></header><div class="task-demo"><LnTaskRow req-no="RAW-128" title="确认业务判定结果并拆分产品需求" type-label="原始需求" priority="P1" status-label="待判定" status-tone="warning" action-label="完成需求判定" updated-at="07-15 10:24" urgent selected><template #actions><LnButton size="small" variant="primary">处理</LnButton></template></LnTaskRow></div></article>

      <article class="panel panel--wide"><header><span>13</span><div><h2>Tabs & preferences</h2><p>页面层级切换、布尔设置与批量选择。</p></div></header><div class="preference-demo"><LnTabs v-model="preferenceTab" :options="preferenceTabs"/><div class="preference-list"><LnSwitch v-model="notificationsEnabled" label="需求动态通知" description="负责人、状态或迭代发生变化时通知我。"/><LnSwitch v-model="digestEnabled" label="每日摘要" description="每天工作日结束时汇总未完成事项。"/><LnCheckbox v-model="includeArchived" label="包含已归档需求" description="在搜索和筛选结果中显示归档项目。"/></div></div></article>

      <article class="panel panel--wide"><header><span>14</span><div><h2>Calendar day</h2><p>日期状态、日程层级、溢出计数和独立事件选择。</p></div></header><div class="calendar-demo"><LnCalendarDay v-for="day in calendarDemoDays" :key="day.day" :day="day.day" :events="day.events" :today="day.today" :weekend="day.weekend" :muted="day.muted" :selected="day.day === 16"/></div></article>

      <article class="panel panel--wide"><header><span>15</span><div><h2>Metrics</h2><p>核心数量、趋势和风险摘要。</p></div></header><div class="metric-demo"><LnMetric label="P0 待关注" :value="3" tone="danger" trend="+1" trend-tone="negative" description="较昨日"/><LnMetric label="本轮已完成" :value="28" unit="项" tone="success" trend="+12%" trend-tone="positive" description="较上轮"/><LnMetric label="平均处理周期" value="4.6" unit="天" tone="accent" description="近 30 天"/></div></article>

      <article class="panel panel--wide"><header><span>16</span><div><h2>Callouts</h2><p>承载阶段说明、风险提醒与下一步动作。</p></div></header><div class="callout-demo"><LnCallout tone="info" title="已自动保存" description="字段变更已同步到需求池。"/><LnCallout tone="warning" title="迭代范围即将锁定" description="锁定后新增需求需要负责人确认。"><template #action><LnButton size="small">查看范围</LnButton></template></LnCallout><LnCallout tone="danger" title="存在阻塞依赖" description="接口方案尚未评审，可能影响计划日期。"/></div></article>

      <article class="panel"><header><span>17</span><div><h2>Avatars</h2><p>自动首字、稳定配色、图片回退和在线状态。</p></div></header><div class="demo row"><LnAvatar name="陈产品" size="small" status="online"/><LnAvatar name="Lin Yue" status="away"/><LnAvatar name="周航" size="large" status="busy" ring/><LnAvatar name="未分配" status="offline"/></div></article>

      <article class="panel"><header><span>18</span><div><h2>Dialog</h2><p>焦点管理、键盘关闭和移动端适配。</p></div></header><div class="demo row"><LnButton variant="primary" @click="dialogOpen = true">打开对话框</LnButton></div></article>

      <article class="panel"><header><span>19</span><div><h2>Password</h2><p>密码显隐、自动填充和键盘提交。</p></div></header><div class="demo"><LnPasswordInput v-model="demoPassword" label="密码" placeholder="输入密码" hint="至少 8 位字符"><template #prefix><LnIcon name="user"/></template></LnPasswordInput></div></article>

      <article class="panel"><header><span>20</span><div><h2>Drawer</h2><p>侧滑详情、焦点圈定、Esc 关闭与滚动锁定。</p></div></header><div class="demo row"><LnButton variant="primary" @click="drawerOpen = true">打开详情抽屉</LnButton></div></article>

      <article class="panel"><header><span>21</span><div><h2>Color picker</h2><p>标签颜色、单选语义和方向键快速切换。</p></div></header><div class="demo"><LnColorPicker v-model="demoColor" :colors="demoColors" label="标签颜色" show-value /></div></article>

      <article class="panel"><header><span>22</span><div><h2>Shell context</h2><p>应用层级导航与一致的用户入口。</p></div></header><div class="demo shell-demo"><LnBreadcrumbs :items="demoBreadcrumbs"/><div class="row"><LnUserButton name="陈产品" description="产品经理" show-chevron/><LnUserButton name="陈产品" compact/></div></div></article>

      <article class="panel panel--wide"><header><span>23</span><div><h2>Rich text editor</h2><p>格式工具栏、链接对话框、图片上传与粘贴。</p></div></header><div class="demo"><LnRichTextEditor v-model="demoRichText" min-height="120px" placeholder="补充需求背景、目标和范围…"/></div></article>

      <article class="panel"><header><span>24</span><div><h2>Inline select</h2><p>表格与详情字段的低干扰快速选择。</p></div></header><div class="demo inline-select-demo"><span>当前状态</span><LnInlineSelect v-model="demoInlineStatus" :options="demoInlineOptions" aria-label="修改需求状态"/></div></article>

      <article class="panel"><header><span>25</span><div><h2>Pressable surfaces</h2><p>整行与整卡选择的统一交互语义。</p></div></header><div class="demo pressable-demo"><LnPressable variant="surface" :selected="demoPressable === 'raw'" aria-label="选择原始需求 RAW-128" @click="demoPressable = 'raw'"><strong>RAW-128</strong><span>优化需求筛选体验</span><LnBadge tone="warning">P1</LnBadge></LnPressable><LnPressable variant="surface" :selected="demoPressable === 'product'" aria-label="选择产品需求 PRD-204" @click="demoPressable = 'product'"><strong>PRD-204</strong><span>统一字段编辑体验</span><LnBadge>产品需求</LnBadge></LnPressable></div></article>

      <article class="panel"><header><span>26</span><div><h2>Confirm & prompt</h2><p>全局确认队列、危险动作与必填输入。</p></div></header><div class="demo row"><LnButton @click="showConfirmDemo">打开确认框</LnButton><LnButton variant="danger" @click="showPromptDemo">输入拒绝原因</LnButton></div></article>

      <article class="panel"><header><span>27</span><div><h2>Loading overlay</h2><p>阻断式局部或全屏加载反馈。</p></div></header><div class="demo loading-demo"><div class="loading-demo__rows"><LnSkeleton width="72%"/><LnSkeleton width="92%"/><LnSkeleton width="64%"/></div><LnLoadingOverlay active subtle label="正在同步需求" description="正在获取最新状态与负责人信息。"/></div></article>

      <article class="panel panel--wide"><header><span>28</span><div><h2>Form validation</h2><p>统一必填、自定义规则、错误提示与表单实例 API。</p></div></header><div class="demo"><LnForm ref="demoFormRef" class="form-validation-demo" :model="demoForm" :rules="demoFormRules" label-width="82px"><LnFormItem label="需求标题" prop="title"><LnInput v-model="demoForm.title" placeholder="输入需求标题"/></LnFormItem><LnFormItem label="负责人" prop="owner"><LnInput v-model="demoForm.owner" placeholder="输入负责人"/></LnFormItem><div class="form-validation-demo__action"><LnButton variant="primary" @click="validateDemoForm">验证表单</LnButton></div></LnForm></div></article>
    </section>

    <LnPeek :open="peekOpen" issue-key="RAW-128" :title="activeIssue.title" @close="peekOpen = false">
      <div class="peek-content"><section><label>状态</label><LnBadge tone="accent" dot>需求分析中</LnBadge></section><section><label>描述</label><p>统一需求池的筛选、行内编辑和详情预览体验，在不丢失业务信息的前提下降低页面噪音。</p></section><section><label>负责人</label><div class="person"><span>陈PM</span><small>产品经理</small></div></section><section><label>活动</label><div class="activity"><i></i><p><b>陈PM</b> 将优先级调整为高<br><small>今天 10:24</small></p></div></section></div>
      <template #footer><LnButton variant="ghost" @click="peekOpen = false">关闭</LnButton><LnButton variant="primary">打开完整详情</LnButton></template>
    </LnPeek>
    <LnCommandMenu :open="commandOpen" :items="commandItems" @close="commandOpen = false" @select="showToast('success')"/>
    <LnDialog v-model="dialogOpen" title="将需求移入迭代？" description="该操作会更新需求的迭代归属。"><LnCallout tone="info" title="CORE2607_03" description="2026-07-14 至 2026-07-25 · 基础产品"/><template #footer><LnButton variant="ghost" @click="dialogOpen = false">取消</LnButton><LnButton variant="primary" @click="dialogOpen = false">确认移动</LnButton></template></LnDialog>
    <LnDrawer v-model="drawerOpen" aria-label="需求详情示例"><template #header><div class="drawer-demo__header"><small>RAW-128</small><strong>优化原始需求池筛选体验</strong></div></template><div class="drawer-demo"><LnTabs v-model="drawerTab" :options="drawerTabs" fluid/><LnCallout tone="info" title="需求分析中" description="负责人正在补充范围和验收标准。"/><section><small>描述</small><p>统一高密度需求列表中的筛选、编辑与详情预览体验。</p></section></div><template #footer><LnButton variant="ghost" @click="drawerOpen = false">关闭</LnButton><LnButton>打开完整详情</LnButton></template></LnDrawer>
  </main>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { LnAvatar, LnBadge, LnBoardColumn, LnBreadcrumbs, LnButton, LnCalendarDay, LnCallout, LnCheckbox, LnColorPicker, LnCommandMenu, LnDateInput, LnDateRange, LnDialog, LnDrawer, LnEmptyState, LnFilterBuilder, LnForm, LnFormItem, LnFormSection, LnIcon, LnInlineEdit, LnInlineSelect, LnInput, LnIssueCard, LnIssueRow, LnLoadingOverlay, LnMenu, LnMetric, LnOptionIcon, LnPagination, LnPasswordInput, LnPeek, LnPopover, LnPressable, LnProgress, LnPropertyPicker, LnRichTextEditor, LnSelect, LnSkeleton, LnSprintRow, LnSwitch, LnTabs, LnTaskRow, LnTextarea, LnTooltip, LnUserButton, lnConfirm, lnPrompt, lnToast, type LnBreadcrumbItem, type LnCalendarEvent, type LnFilterRule, type LnFormInstance, type LnFormRules, type LnInlineOption, type LnTabOption } from '@/components/linear'
import { getBusinessLineVisual, getRequirementTypeVisual, priorityVisuals } from '@/components/linear/optionVisuals'
const iconNames = ['search','chevron-down','chevron-left','chevron-right','plus','close','check','external-link','copy','archive','calendar','user','tag','sprint','more','info','warning','question','urgent'] as const
const statusIconExamples = [
  { label:'待处理',value:'pending',icon:'pending',color:'#9b9ba4' },
  { label:'进行中',value:'active',icon:'progress',color:'#5e6ad2' },
  { label:'已完成',value:'done',icon:'success',color:'#2f9e6f' },
  { label:'已验收',value:'accepted',icon:'check',color:'#2f9e6f' },
  { label:'已阻塞',value:'blocked',icon:'blocked',color:'#d05757' },
  { label:'已暂停',value:'suspended',icon:'paused',color:'#d28b36' },
  { label:'已关闭',value:'closed',icon:'closed',color:'#6f6f78' },
]
const priorityIconExamples = [
  { label:'P0 紧急',value:'P0',...priorityVisuals.P0 },
  { label:'P1 高',value:'P1',...priorityVisuals.P1 },
  { label:'P2 中',value:'P2',...priorityVisuals.P2 },
  { label:'P3 低',value:'P3',...priorityVisuals.P3 },
]
const requirementTypeIconExamples = ['优化迭代','问题转需求','设计缺陷','规划功能'].map((label) => ({ label, value:label, ...getRequirementTypeVisual(label) }))
const businessLineIconExamples = ['校园G端','市监G端','B端团餐','技术支撑（硬件等）'].map((label) => ({ label, value:label, ...getBusinessLineVisual(label) }))
const semanticIconGroups = [
  { title:'Status', items:statusIconExamples },
  { title:'Priority', items:priorityIconExamples },
  { title:'Requirement type', items:requirementTypeIconExamples },
  { title:'Business line', items:businessLineIconExamples },
]
const search = ref(''); const editableTitle = ref('优化原始需求池筛选体验'); const peekOpen = ref(false); const commandOpen = ref(false); const dialogOpen=ref(false); const selected = ref('RAW-128'); const team=ref('core');const status=ref('active');const priority=ref('high')
const singleDate=ref('2026-07-25');const dateRange=ref(['2026-07-14','2026-07-25']);const description=ref('作为产品经理，我希望在需求列表中快速修改状态和负责人。');const demoPage=ref(3)
const demoPassword=ref('linear-demo')
const demoColor=ref('#5e6ad2');const demoColors=['#5e6ad2','#2f9e6f','#d28b36','#d05757','#7f6bb3','#68707c']
const demoRichText=ref('<p><strong>目标：</strong>让需求描述支持结构化文本、链接和截图。</p>')
const demoInlineStatus=ref('active');const demoInlineOptions:LnInlineOption[]=[{label:'待处理',value:'pending',tone:'pending',description:'尚未开始处理'},{label:'进行中',value:'active',tone:'progress',description:'正在分析或实现'},{label:'已完成',value:'done',tone:'success',description:'已经验收完成'},{label:'已阻塞',value:'blocked',tone:'danger',description:'存在前置依赖'}]
const demoPressable=ref('raw')
const demoFormRef=ref<LnFormInstance>();const demoForm=reactive({title:'',owner:''});const demoFormRules:LnFormRules={title:[{required:true,message:'请输入需求标题',trigger:'blur'}],owner:[{required:true,message:'请输入负责人',trigger:'blur'}]}
const demoBreadcrumbs:LnBreadcrumbItem[]=[{label:'需求中枢',to:'/raw-pool'},{label:'原始需求'},{label:'RAW-128'}]
const drawerOpen=ref(false);const drawerTab=ref('overview');const drawerTabs:LnTabOption[]=[{label:'概览',value:'overview'},{label:'活动',value:'activity',count:6},{label:'评论',value:'comments',count:2}]
const showPriority=ref(true);const showAssignee=ref(true);const showCreatedAt=ref(false);const preferenceTab=ref('personal');const notificationsEnabled=ref(true);const digestEnabled=ref(false);const includeArchived=ref(false)
const preferenceTabs:LnTabOption[]=[{label:'个人偏好',value:'personal'},{label:'工作区',value:'workspace',count:4},{label:'权限',value:'permissions'}]
const calendarDemoDays:{day:number;events:LnCalendarEvent[];today?:boolean;weekend?:boolean;muted?:boolean}[]=[{day:13,events:[],muted:true},{day:14,events:[{id:1,title:'确认需求范围',tone:'warning'}]},{day:15,events:[{id:2,title:'PRD 评审',tone:'accent'},{id:3,title:'技术方案同步',tone:'neutral'}],today:true},{day:16,events:[{id:4,title:'迭代启动',tone:'success'}]},{day:17,events:[{id:5,title:'风险复盘',tone:'danger'},{id:6,title:'交互验收',tone:'accent'},{id:7,title:'数据确认',tone:'neutral'},{id:8,title:'版本同步',tone:'warning'}]},{day:18,events:[],weekend:true},{day:19,events:[],weekend:true}]
const issues = [
  { key:'RAW-128', title:'优化原始需求池筛选体验', priority:'高', assignee:'陈PM', color:'#5e6ad2', line:'基础产品' },
  { key:'RAW-129', title:'支持需求详情中的活动记录与字段变更历史', priority:'中', assignee:'林悦', color:'#d28b36', line:'增长业务' },
  { key:'RAW-130', title:'产品需求支持按原始需求分组查看', priority:'紧急', assignee:'周航', color:'#9b9ba4', line:'商业化' },
]
const activeIssue = computed(() => issues.find(item => item.key === selected.value) || issues[0])
function selectIssue(issue: typeof issues[number]) { selected.value = issue.key; peekOpen.value = true }
const teamOptions=[{label:'基础产品',value:'core',description:'核心平台与通用能力'},{label:'增长业务',value:'growth',description:'用户增长与运营'},{label:'商业化',value:'business',description:'收入与客户交付'}]
const statusOptions=[{label:'待处理',value:'todo',color:'#9b9ba4',icon: 'pending'},{label:'进行中',value:'active',color:'#5e6ad2',icon: 'progress'},{label:'已完成',value:'done',color:'#2f9e6f',icon: 'success'},{label:'已阻塞',value:'blocked',color:'#d05757',icon: 'blocked'}]
const priorityOptions=[{label:'无优先级',value:'none',icon:'none'},{label:'低',value:'low',color:'#6f6f78',icon:'priority'},{label:'中',value:'medium',color:'#d28b36',icon:'priority'},{label:'高',value:'high',color:'#d05757',icon:'priority'}]
const menuItems=[{label:'复制需求链接',value:'copy',icon: 'copy',shortcut:'⌘L'},{label:'转为产品需求',value:'convert',icon: 'external-link'},{label:'归档需求',value:'archive',icon: 'archive',separatorBefore:true},{label:'删除需求',value:'delete',icon: 'closed',danger:true}]
const commandItems=[{label:'新建原始需求',value:'new',icon: 'plus',shortcut:'C'},{label:'打开原始需求池',value:'raw',icon: 'archive'},{label:'打开产品需求池',value:'product',icon: 'type'},{label:'切换深色模式',value:'theme',icon: 'info'}]
const filterFields=[{label:'状态',value:'status'},{label:'优先级',value:'priority'},{label:'负责人',value:'assignee'},{label:'业务线',value:'businessLine'}]
const filters=ref<LnFilterRule[]>([{id:'filter-1',field:'status',operator:'eq',value:'进行中'}])
function showToast(tone:'success'|'danger'){const options={title:tone==='success'?'操作已完成':'保存失败',description:tone==='success'?'变更已同步到需求池':'请检查网络后重试'};tone==='success'?lnToast.success(options):lnToast.error(options)}
async function showConfirmDemo(){try{await lnConfirm({title:'将需求移入迭代？',message:'该操作会更新需求的迭代归属。',confirmText:'确认移动',cancelText:'取消',tone:'warning'});lnToast.success('需求已移入迭代')}catch{}}
async function showPromptDemo(){try{const reason=await lnPrompt({title:'拒绝原始需求',message:'拒绝原因会记录到需求活动中。',confirmText:'确认拒绝',cancelText:'取消',tone:'danger',placeholder:'输入拒绝原因',inputPattern:/\S+/,inputErrorMessage:'拒绝原因不能为空'});lnToast.success({title:'已记录拒绝原因',description:reason})}catch{}}
async function validateDemoForm(){try{await demoFormRef.value?.validate();lnToast.success('表单校验通过')}catch{}}
</script>

<style scoped lang="scss">
.showcase { height: 100%; overflow: auto; padding: 54px clamp(24px, 5vw, 74px) 80px; background: var(--ln-canvas); color: var(--ln-text); font-family: var(--ln-font); }
.showcase__hero { max-width: 1180px; margin: 0 auto 34px; display:flex; align-items:flex-end; justify-content:space-between; gap:24px; h1 { margin:8px 0 6px; font-size:clamp(30px,4vw,48px); font-weight:620; letter-spacing:-.045em; } p { color:var(--ln-text-secondary); font-size:14px; } }.showcase__kicker { color:var(--ln-accent); font-size: 11px; font-weight:700; letter-spacing:.16em; }
.showcase__grid { max-width:1180px; margin:auto; display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:14px; }.panel { min-width:0; padding:18px; border:1px solid var(--ln-border); border-radius:12px; background:rgba(255,255,255,.78); box-shadow:0 1px 2px rgba(20,20,24,.025); > header { display:flex; gap:12px; margin-bottom:20px; > span { color:var(--ln-text-tertiary); font-size: 11px; padding-top:3px; } h2 { margin:0 0 3px; font-size:14px; font-weight:620; } p { color:var(--ln-text-tertiary); font-size:11px; } } }.panel--wide { grid-column:1/-1; }.demo { min-height:94px; padding:18px; border:1px dashed var(--ln-border-strong); border-radius:9px; background:var(--ln-surface); }.row { display:flex; align-items:center; flex-wrap:wrap; gap:8px; }.fields { display:grid; grid-template-columns:1fr 1fr; gap:14px; }.inline-demo,.picker-demo { grid-column:1/-1; display:grid; gap:5px; color:var(--ln-text); font-size:13px; small { color:var(--ln-text-tertiary); font-size:11px; } }.menu { min-width:210px; display:grid; gap:2px; b { padding:7px 8px; font-size:11px; } label { padding:7px 8px; display:flex; gap:8px; align-items:center; border-radius:5px; font-size:12px; &:hover { background:var(--ln-surface-hover); } } }.issue-list { overflow:hidden; border:1px solid var(--ln-border); border-radius:9px; }.issue-list__header { height:36px; padding:0 12px;display:flex;align-items:center;gap:8px;border-bottom:1px solid var(--ln-border);background:#fafafa;font-size:12px;font-weight:570;small{color:var(--ln-text-tertiary);font-size:11px;font-weight:400}}.split-demo{display:grid;grid-template-columns:1fr 1fr;gap:12px}.skeleton-demo{display:grid;gap:14px}.skeleton-row{display:grid;grid-template-columns:22px 58px 1fr 72px;align-items:center;gap:10px}.peek-content { display:grid; gap:26px; section { display:grid; gap:9px; } label { color:var(--ln-text-tertiary); font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:.06em; } p { color:var(--ln-text-secondary); font-size:13px; line-height:1.65; } }.person { display:flex; align-items:baseline; gap:8px; font-size:13px; small { color:var(--ln-text-tertiary); } }.activity { display:flex; gap:10px; i { width:8px; height:8px; margin-top:7px; border-radius:50%; background:var(--ln-accent); box-shadow:0 0 0 4px var(--ln-accent-soft); } small { color:var(--ln-text-tertiary); } }
.icon-board { overflow:hidden; background:linear-gradient(145deg,rgba(255,255,255,.94),rgba(247,247,245,.8)); }
.icon-board__section + .icon-board__section { margin-top:20px; padding-top:20px; border-top:1px solid var(--ln-border); }
.icon-board__label { margin-bottom:10px; display:flex; align-items:center; justify-content:space-between; gap:16px; color:var(--ln-text-secondary); strong{font-size:11px;font-weight:650;letter-spacing:.02em}span{color:var(--ln-text-tertiary);font:10px ui-monospace,SFMono-Regular,Menlo,monospace} }
.icon-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(112px,1fr)); gap:7px; }
.icon-grid--semantic { grid-template-columns:repeat(auto-fill,minmax(142px,1fr)); }
.icon-tile { min-width:0; min-height:68px; padding:10px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; border:1px solid var(--ln-border); border-radius:8px; background:var(--ln-surface); transition:border-color .14s ease,background .14s ease,transform .14s ease; &:hover{border-color:var(--ln-border-strong);background:var(--ln-surface-hover);transform:translateY(-1px)} code{max-width:100%;overflow:hidden;text-overflow:ellipsis;color:var(--ln-text-tertiary);font:9px ui-monospace,SFMono-Regular,Menlo,monospace;white-space:nowrap} }
.icon-tile__preview { width:30px; height:30px; display:grid; place-items:center; border-radius:7px; background:var(--ln-canvas); color:var(--ln-text); font-size:18px; box-shadow:inset 0 0 0 1px var(--ln-border); }
.icon-tile--semantic { min-height:58px; flex-direction:row; justify-content:flex-start; text-align:left; }
.icon-tile--semantic .icon-tile__preview { flex:0 0 30px; font-size:16px; }
.icon-tile__copy { min-width:0; display:grid; gap:3px; strong{overflow:hidden;text-overflow:ellipsis;font-size:11px;font-weight:600;white-space:nowrap}code{font-size:9px} }
.form-demo{display:grid;grid-template-columns:1fr 1fr;gap:14px}.form-demo>*:last-child{grid-column:1/-1}.pagination-demo{padding:0;overflow:hidden}.sprint-demo{display:grid;gap:18px}.board-demo{display:flex;gap:14px;overflow:auto;padding:12px;border:1px dashed var(--ln-border-strong);border-radius:9px;background:var(--ln-canvas)}.task-demo{overflow:auto;border:1px solid var(--ln-border);border-radius:9px}.task-demo :deep(.ln-task-row){min-width:940px}
.preference-demo{overflow:hidden;border:1px solid var(--ln-border);border-radius:9px;background:var(--ln-surface)}.preference-demo>:first-child{padding:0 16px}.preference-list{padding:18px;display:grid;gap:18px}.preference-list>*+*{padding-top:18px;border-top:1px solid var(--ln-border)}
.calendar-demo{display:grid;grid-template-columns:repeat(7,minmax(100px,1fr));gap:1px;overflow:auto;border:1px solid var(--ln-border);border-radius:9px;background:var(--ln-border)}
.metric-demo{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}@media(max-width:720px){.metric-demo{grid-template-columns:1fr}}
.callout-demo{display:grid;gap:10px}
.shell-demo{display:grid;gap:20px}.shell-demo .row>:first-child{max-width:220px}.shell-demo .row>:last-child{flex:none}
.inline-select-demo{display:grid;grid-template-columns:90px minmax(0,1fr);align-items:center;gap:12px;font-size:12px;color:var(--ln-text-secondary)}
.pressable-demo{display:grid;gap:8px}.pressable-demo :deep(.ln-pressable){display:grid;grid-template-columns:64px minmax(0,1fr) auto;align-items:center;gap:10px}.pressable-demo strong{font:600 11px ui-monospace,monospace;color:var(--ln-text-secondary)}.pressable-demo span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.loading-demo{position:relative;min-height:150px;overflow:hidden}.loading-demo__rows{display:grid;gap:18px;padding:12px}
.form-validation-demo{max-width:620px}.form-validation-demo__action{padding-left:94px}
.drawer-demo__header{display:grid;gap:3px;small{color:var(--ln-text-tertiary);font: 11px ui-monospace,monospace}strong{font-size:14px;font-weight:620}}.drawer-demo{padding:20px;display:grid;gap:20px;section{display:grid;gap:7px;padding:14px;border:1px solid var(--ln-border);border-radius:var(--ln-radius-lg)}section small{color:var(--ln-text-tertiary);font-size: 11px;text-transform:uppercase;letter-spacing:.08em}section p{font-size:13px;line-height:1.6}}
@media(max-width:800px){.showcase__grid{grid-template-columns:1fr}.panel--wide{grid-column:auto}.showcase__hero{align-items:flex-start;flex-direction:column}.fields,.split-demo{grid-template-columns:1fr}.inline-demo,.picker-demo{grid-column:auto}}
</style>

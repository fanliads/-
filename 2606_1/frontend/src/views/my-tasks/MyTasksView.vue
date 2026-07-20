<template>
  <div class="my-tasks-view">
    <section class="page-header wb-page-header wb-panel">
      <div class="title-block">
        <div class="title-row wb-title-row">
          <h2 class="page-title wb-page-title">我的工作</h2>
          <span class="page-count wb-page-meta">{{ stats.pendingCount }} 待处理</span>
          <span class="page-hint wb-page-meta">统一待办视图</span>
        </div>
        <p class="page-subtitle wb-page-subtitle">把待办和已处理记录收敛到同一工作区里，首屏只保留当前最需要决策的信息。</p>
      </div>

      <div class="header-side">
        <span class="refresh-status" :class="{ syncing: actionRefreshing }">
          {{ refreshStatusText }}
        </span>
      </div>
    </section>

    <section class="summary-strip wb-summary-strip">
      <div class="summary-pill wb-summary-pill active">
        <span class="summary-label wb-summary-label">待处理</span>
        <span class="summary-value wb-summary-value">{{ stats.pendingCount }}</span>
      </div>
      <div class="summary-pill wb-summary-pill">
        <span class="summary-label wb-summary-label">今日完成</span>
        <span class="summary-value wb-summary-value">{{ stats.todayDoneCount }}</span>
      </div>
      <div class="summary-pill wb-summary-pill">
        <span class="summary-label wb-summary-label">本周完成</span>
        <span class="summary-value wb-summary-value">{{ stats.weekDoneCount }}</span>
      </div>
    </section>

    <section class="workspace-shell wb-shell">
      <div class="list-panel wb-panel" :aria-busy="currentLoading">
        <div class="list-toolbar wb-panel-toolbar">
          <LnTabs class="view-switch" :model-value="currentView" :options="currentViewOptions" variant="segmented" aria-label="任务处理状态" @update:model-value="switchViewValue" />
          <div class="toolbar-note">{{ currentViewNote }}</div><LnInput v-model="taskKeyword" class="task-search" placeholder="搜索编号、标题或动作" clearable><template #prefix><LnIcon name="search"/></template></LnInput>
        </div>

        <div class="list-header wb-list-header row-grid">
          <div class="head-cell title-head">事项</div>
          <div class="head-cell">类型</div>
          <div class="head-cell">状态</div>
          <div class="head-cell">动作</div>
          <div class="head-cell">更新时间</div>
          <div class="head-cell action-head">处理</div>
        </div>

        <template v-if="currentLoading"><div v-for="row in 6" :key="row" class="task-skeleton-row"><div><LnSkeleton width="64%"/><LnSkeleton width="42%" height="10px"/></div><LnSkeleton width="62px"/><LnSkeleton width="72px"/><LnSkeleton width="76px"/><LnSkeleton width="68px"/></div></template>
        <LnTaskRow
          v-for="task in currentLoading ? [] : filteredCurrentList"
          :key="getTaskKey(task)"
          :req-no="task.reqNo" :title="task.title" :type-label="getReqTypeLabel(task.reqType)" :priority="task.priority || 'P2'"
          :status-label="task.statusName || '-'" :status-tone="getTaskStatusTone(task.status)"
          :action-label="task.actionRequired || (currentView === 'pending' ? '待处理' : '已完成')"
          :updated-at="formatTime(task.updatedTime || task.createTime)" :urgent="currentView === 'pending' && isUrgent(task.updatedTime)"
          :selected="selectedTaskKey === getTaskKey(task)" :done="currentView === 'done'"
          @click="selectTask(task)"
        >
          <template #actions>
            <ActionButtons
              v-if="currentView === 'pending'"
              :req-type="task.reqType"
              :req-id="task.id"
              :current-status="task.status"
              @action-done="handleActionDone"
            />
            <LnButton v-else size="small" variant="ghost" @click="selectTask(task)">查看</LnButton>
          </template>
        </LnTaskRow>

        <LnEmptyState v-if="filteredCurrentList.length === 0 && !currentLoading" :title="taskKeyword ? '没有匹配的事项' : currentView === 'pending' ? '当前没有待我处理事项' : '暂无已处理记录'" :description="taskKeyword ? '尝试调整搜索关键词。' : '新的待办或处理记录会显示在这里。'" />

        <div class="pagination-line">
          <LnPagination v-if="currentView === 'pending'" v-model:page="pendingPage" :page-size="pageSize" :page-sizes="[pageSize]" :total="pendingTotal" @change="loadPending" />
          <LnPagination v-else v-model:page="donePage" :page-size="pageSize" :page-sizes="[pageSize]" :total="doneTotal" @change="loadDone" />
        </div>
      </div>

      <aside class="detail-panel wb-panel">
        <template v-if="selectedTask">
          <div class="detail-scroll wb-detail-scroll">
            <div class="detail-header">
              <div class="detail-id">{{ selectedTask.reqNo }}</div>
              <h3 class="detail-title wb-detail-title">{{ selectedTask.title }}</h3>
              <div class="detail-tags">
                <span class="status-tag" :class="`status-${selectedTask.status || 'default'}`">{{ selectedTask.statusName || '-' }}</span>
                <span class="priority-pill" :class="`priority-${(selectedTask.priority || 'p2').toLowerCase()}`">{{ selectedTask.priority || 'P2' }}</span>
                <span class="meta-chip">{{ getReqTypeLabel(selectedTask.reqType) }}</span>
              </div>
              <div class="detail-meta-line">
                <span class="detail-meta-item">更新 {{ formatTime(selectedTask.updatedTime || selectedTask.createTime) }}</span>
                <span class="detail-meta-sep">·</span>
                <span class="detail-meta-item">创建 {{ formatTime(selectedTask.createTime) }}</span>
              </div>
            </div>

            <div class="info-section wb-section surface-section primary-section">
              <div class="section-head wb-section-head">
                <div class="section-title wb-section-title">当前判断</div>
                <div class="section-note wb-section-note">只保留当前推进这条事项时最需要确认的上下文。</div>
              </div>
              <div class="info-grid">
                <div class="info-item wb-info-item">
                  <span class="info-label">需要动作</span>
                  <span class="info-value">{{ selectedTask.actionRequired || (currentView === 'pending' ? '待处理' : '已处理') }}</span>
                </div>
                <div class="info-item wb-info-item">
                  <span class="info-label">最近更新</span>
                  <span class="info-value">{{ formatTime(selectedTask.updatedTime || selectedTask.createTime) }}</span>
                </div>
                <div class="info-item wb-info-item">
                  <span class="info-label">创建时间</span>
                  <span class="info-value">{{ formatTime(selectedTask.createTime) }}</span>
                </div>
                <div class="info-item wb-info-item">
                  <span class="info-label">处理状态</span>
                  <span class="info-value">{{ currentView === 'pending' ? '待我推进' : '已完成处理' }}</span>
                </div>
              </div>
            </div>

            <div class="info-section wb-section">
              <div class="section-head wb-section-head">
                <div class="section-title wb-section-title">处理建议</div>
                <div class="section-note wb-section-note">右侧作为聚焦确认区，动作仍然围绕左侧连续处理展开。</div>
              </div>
              <p class="section-copy">
                {{ currentView === 'pending'
                  ? '优先在左侧列表连续处理当前待办；需要进一步判断时，可先选中条目，再在这里确认状态与动作语义。'
                  : '已处理记录默认作为回溯使用，只保留必要上下文，避免与主工作流争抢注意力。'
                }}
              </p>
            </div>

            <div v-if="currentView === 'pending'" class="detail-actions">
              <ActionButtons
                :req-type="selectedTask.reqType"
                :req-id="selectedTask.id"
                :current-status="selectedTask.status"
                @action-done="handleActionDone"
              />
            </div>
          </div>
        </template>

        <LnEmptyState v-else title="选择一条事项" description="左侧列表会保留高密度浏览，右侧只承担聚焦和处理确认。" />
      </aside>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import dayjs from 'dayjs'
import ActionButtons from '@/components/workflow/ActionButtons.vue'
import { getPendingTasks, getDoneTasks, getMyTaskStats, type MyTaskVO, type MyTaskStats } from '@/api/my-tasks'
import { LnButton, LnEmptyState, LnIcon, LnInput, LnPagination, LnSkeleton, LnTabs, LnTaskRow, type LnTabOption } from '@/components/linear'

const pendingLoading = ref(false)
const doneLoading = ref(false)
const actionRefreshing = ref(false)
const lastRefreshAt = ref<string>('')
const currentView = ref<'pending' | 'done'>('pending')
const selectedTaskKey = ref('')
const taskKeyword = ref('')

const stats = reactive<MyTaskStats>({
  pendingCount: 0,
  todayDoneCount: 0,
  weekDoneCount: 0,
})

const pendingList = ref<MyTaskVO[]>([])
const pendingPage = ref(1)
const pendingTotal = ref(0)

const doneList = ref<MyTaskVO[]>([])
const donePage = ref(1)
const doneTotal = ref(0)

const pageSize = 10

const refreshStatusText = computed(() => {
  if (actionRefreshing.value) return '正在同步最新处理结果...'
  if (!lastRefreshAt.value) return '工作台会自动保持最新'
  return `最近刷新 ${dayjs(lastRefreshAt.value).format('HH:mm:ss')}`
})

const currentList = computed(() => currentView.value === 'pending' ? pendingList.value : doneList.value)
const filteredCurrentList = computed(() => { const keyword=taskKeyword.value.trim().toLowerCase();return keyword?currentList.value.filter(item=>`${item.reqNo} ${item.title} ${item.actionRequired||''}`.toLowerCase().includes(keyword)):currentList.value })
const currentLoading = computed(() => currentView.value === 'pending' ? pendingLoading.value : doneLoading.value)
const selectedTask = computed(() => currentList.value.find((item) => getTaskKey(item) === selectedTaskKey.value) || null)
const currentViewNote = computed(() =>
  currentView.value === 'pending'
    ? '连续处理模式 · 选中后在右侧确认上下文'
    : '回溯模式 · 仅保留结果确认与必要背景'
)
const currentViewOptions = computed<LnTabOption[]>(() => [
  { label: '待我处理', value: 'pending', count: pendingTotal.value },
  { label: '已处理', value: 'done', count: doneTotal.value || stats.weekDoneCount },
])

function getTaskKey(task: MyTaskVO) {
  return `${task.reqType}-${task.id}`
}

function getReqTypeLabel(reqType: string) {
  if (reqType === 'product') return '产品需求'
  if (reqType === 'raw') return '原始需求'
  return '需求事项'
}

function getTaskStatusTone(status?: string): 'neutral' | 'accent' | 'success' | 'warning' | 'danger' {
  const value=String(status||'').toLowerCase();if(['online','done','completed','accepted'].includes(value))return'success';if(['rejected','blocked'].includes(value))return'danger';if(['in_progress','developing','designing'].includes(value))return'accent';if(['suspended','pending_split'].includes(value))return'warning';return'neutral'
}

function ensureSelectedTask(list: MyTaskVO[]) {
  if (list.length === 0) {
    selectedTaskKey.value = ''
    return
  }

  const exists = list.some((item) => getTaskKey(item) === selectedTaskKey.value)
  if (!exists) {
    selectedTaskKey.value = getTaskKey(list[0])
  }
}

function selectTask(task: MyTaskVO) {
  selectedTaskKey.value = getTaskKey(task)
}

function switchView(view: 'pending' | 'done') {
  currentView.value = view
  if (view === 'done' && doneList.value.length === 0) {
    loadDone()
    return
  }
  ensureSelectedTask(view === 'pending' ? pendingList.value : doneList.value)
}
function switchViewValue(value: string) { switchView(value as 'pending' | 'done') }

async function loadStats() {
  try {
    const res = await getMyTaskStats()
    const data = (res as any).data
    if (data) {
      stats.pendingCount = data.pendingCount
      stats.todayDoneCount = data.todayDoneCount
      stats.weekDoneCount = data.weekDoneCount
    }
  } catch {
    // ignore
  }
}

async function loadPending() {
  pendingLoading.value = true
  try {
    const res = await getPendingTasks({ page: pendingPage.value, size: pageSize })
    const data = (res as any).data
    if (data) {
      pendingList.value = data.records || []
      pendingTotal.value = data.total || 0
      if (currentView.value === 'pending') ensureSelectedTask(pendingList.value)
    }
  } catch {
    pendingList.value = []
    if (currentView.value === 'pending') selectedTaskKey.value = ''
  } finally {
    pendingLoading.value = false
    lastRefreshAt.value = dayjs().toISOString()
  }
}

async function loadDone() {
  doneLoading.value = true
  try {
    const res = await getDoneTasks({ page: donePage.value, size: pageSize })
    const data = (res as any).data
    if (data) {
      doneList.value = data.records || []
      doneTotal.value = data.total || 0
      if (currentView.value === 'done') ensureSelectedTask(doneList.value)
    }
  } catch {
    doneList.value = []
    if (currentView.value === 'done') selectedTaskKey.value = ''
  } finally {
    doneLoading.value = false
  }
}

async function handleActionDone() {
  actionRefreshing.value = true
  try {
    await Promise.all([
      loadStats(),
      loadPending(),
      currentView.value === 'done' ? loadDone() : Promise.resolve(),
    ])
  } finally {
    actionRefreshing.value = false
  }
}

function isUrgent(time: string) {
  if (!time) return false
  return dayjs(time).isBefore(dayjs().add(2, 'day'), 'day')
}

function formatTime(time: string) {
  if (!time) return '-'
  return dayjs(time).format('MM-DD HH:mm')
}

onMounted(() => {
  loadStats()
  loadPending()
})
</script>

<style lang="scss" scoped>
.my-tasks-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg);
  gap: 16px;
}

.page-count,
.page-hint {
  font-size: 12px;
  color: var(--text-secondary);
}

.refresh-status {
  display: inline-flex;
  align-items: center;
  min-height: 32px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(0, 113, 227, 0.08);
  color: var(--primary);
  font-size: 12px;
  font-weight: 500;

  &.syncing {
    background: rgba(255, 149, 0, 0.12);
    color: #b56a00;
  }
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.summary-pill {
  &.active {
    border-color: rgba(0, 113, 227, 0.18);
    background: linear-gradient(180deg, rgba(0, 113, 227, 0.06) 0%, rgba(255, 255, 255, 0.96) 100%);
  }
}

.summary-label {
  display: block;
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 6px;
}

.summary-value {
  font-size: 24px;
  line-height: 1;
  font-weight: 700;
  color: var(--text-primary);
}

.workspace-shell {
  grid-template-columns: minmax(0, 1.25fr) minmax(320px, 420px);
}

.list-panel,
.detail-panel {
  min-height: 0;
}

.list-panel {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.list-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 18px 12px;
  border-bottom: 1px solid var(--border);
}

.task-search { width: 220px; }
:deep(.task-search .ln-input-wrap) { width: 220px; }
.task-skeleton-row { min-height: 64px; padding: 10px 14px; display: grid; grid-template-columns: minmax(260px,2fr) 90px 110px 100px 100px; align-items: center; gap: 12px; border-bottom: 1px solid var(--ln-border); }
.task-skeleton-row>div { display: grid; gap: 8px; }
.detail-panel :deep(.ln-empty-state) { height: 100%; }

.toolbar-note {
  font-size: 12px;
  color: var(--text-secondary);
  white-space: nowrap;
}

.row-grid {
  display: grid;
  grid-template-columns: minmax(0, 2.45fr) 96px 104px 120px 112px 148px;
  column-gap: 12px;
  align-items: center;
}

.list-header {
  padding: 0 18px;
  min-height: 36px;
  border-bottom: 1px solid var(--border);
  font-size: 12px;
  color: var(--text-secondary);
}

.head-cell {
  white-space: nowrap;
}

.list-row {
  position: relative;
  padding: 10px 18px;
  border-bottom: 1px solid var(--border);
  cursor: pointer;
  transition: var(--transition);

  &:hover {
    background: rgba(17, 24, 39, 0.022);
  }

  &.selected {
    background: rgba(59, 130, 246, 0.06);
    box-shadow: inset 2px 0 0 rgba(59, 130, 246, 0.78);
  }

  &.done {
    opacity: 0.82;
  }

  &.hovering {
    .row-actions {
      opacity: 1;
      transform: translateX(0);
      pointer-events: auto;
    }
  }

  &.selected {
    .row-actions {
      opacity: 1;
      transform: translateX(0);
      pointer-events: auto;
    }
  }
}

.cell {
  min-width: 0;
  font-size: 12px;
  line-height: 1.45;
  color: var(--text-primary);
}

.title-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
  flex-wrap: wrap;
}

.title-prefix {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.title-flags {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  flex-wrap: wrap;
}

.req-no {
  font-size: 11px;
  color: #7b8595;
  letter-spacing: 0.015em;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.title-text {
  font-size: 13.5px;
  font-weight: 650;
  line-height: 1.45;
  color: var(--text-primary);
}

.title-subline {
  margin-top: 3px;
  font-size: 11px;
  line-height: 1.5;
  color: var(--text-secondary);
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.meta-text {
  display: inline-flex;
  align-items: center;
  min-height: 16px;
  padding: 0 6px;
  border-radius: 999px;
  background: rgba(17, 24, 39, 0.04);
  font-size: 11px;
  font-weight: 700;
  color: var(--text-secondary);
  white-space: nowrap;
}

.type-cell,
.action-cell,
.time-cell {
  color: var(--text-secondary);
}

.time-cell.urgent {
  color: var(--danger);
  font-weight: 600;
}

.status-tag,
.priority-pill,
.meta-chip,
.mini-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  font-size: 12px;
}

.status-tag {
  padding: 3px 10px;
  border: 1px solid rgba(17, 24, 39, 0.08);
  background: rgba(255, 255, 255, 0.88);
  color: var(--text-primary);
}

.status-default,
.status-PENDING,
.status-pending_judgement,
.status-pending_split {
  background: rgba(255, 149, 0, 0.12);
  color: #b56a00;
}

.status-ONLINE,
.status-done,
.status-completed {
  background: rgba(52, 199, 89, 0.12);
  color: #1d7f42;
}

.priority-pill,
.meta-chip {
  padding: 3px 8px;
  border: 1px solid rgba(17, 24, 39, 0.08);
  background: rgba(255, 255, 255, 0.88);
  color: var(--primary);
  font-size: 11px;
}

.priority-p0 {
  background: rgba(255, 59, 48, 0.12);
  color: #c0392b;
}

.priority-p1 {
  background: rgba(255, 149, 0, 0.12);
  color: #b56a00;
}

.priority-p2,
.priority-p3 {
  background: rgba(0, 113, 227, 0.08);
}

.row-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  opacity: 0;
  transform: translateX(2px);
  pointer-events: none;
  transition: opacity 0.16s ease, transform 0.16s ease;
}

.mini-action {
  border: 1px solid var(--border);
  background: rgba(255, 255, 255, 0.92);
  color: var(--text-secondary);
  padding: 5px 9px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);

  &:hover {
    background: #fff;
    border-color: rgba(17, 24, 39, 0.14);
  }
}

.pagination-line {
  display: flex;
  justify-content: flex-end;
  padding: 16px 20px 18px;
}

.detail-panel {
  overflow: hidden;
}

.detail-header {
  position: sticky;
  top: 0;
  z-index: 2;
  margin: -18px -18px 20px;
  padding: 18px 18px 16px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.97) 0%, rgba(255, 255, 255, 0.93) 100%);
  border-bottom: 1px solid var(--border);
  backdrop-filter: blur(14px);
}

.surface-section .info-grid {
  margin-top: 12px;
  padding: 12px 12px 4px;
  border-radius: 14px;
  border: 1px solid rgba(17, 24, 39, 0.05);
  background: rgba(248, 250, 252, 0.72);
}

.detail-id {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.detail-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.detail-meta-line {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  font-size: 11px;
  color: var(--text-secondary);
}

.detail-meta-item {
  white-space: nowrap;
}

.detail-meta-sep {
  color: rgba(148, 163, 184, 0.82);
}

.section-copy {
  margin: 0;
  font-size: 13px;
  line-height: 1.7;
  color: var(--text-secondary);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.info-label {
  font-size: 12px;
  color: var(--text-secondary);
}

.info-value {
  font-size: 13px;
  line-height: 1.5;
  color: var(--text-primary);
}

.detail-actions {
  margin-top: 6px;
  padding: 16px 16px 0;
  border-top: 1px solid var(--border);
}

.empty-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.empty-copy {
  font-size: 13px;
  line-height: 1.7;
  color: var(--text-secondary);
}

@media (max-width: 1200px) {
  .workspace-shell {
    grid-template-columns: 1fr;
  }

  .detail-panel {
    min-height: 320px;
  }
}

@media (max-width: 768px) {
  .list-toolbar {
    flex-direction: column;
    align-items: flex-start;
  }

  .row-grid {
    grid-template-columns: minmax(0, 1fr);
    row-gap: 10px;
  }

  .list-header {
    display: none;
  }

  .row-actions {
    justify-content: flex-start;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>

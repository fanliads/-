<template>
  <div class="my-tasks-view">
    <section class="page-header wb-page-header wb-panel">
      <div class="title-block">
        <div class="title-row wb-title-row">
          <h2 class="page-title wb-page-title">我的工作</h2>
          <span class="page-count wb-page-meta">{{ stats.pendingCount }} 待处理</span>
        </div>
      </div>

      <div class="header-side">
        <span v-if="actionRefreshing" class="refresh-status syncing">
          {{ refreshStatusText }}
        </span>
        <LnButton icon-only variant="ghost" :loading="actionRefreshing" aria-label="刷新我的工作" title="刷新" @click="manualRefresh"><template #icon><LnIcon name="refresh" /></template></LnButton>
      </div>
    </section>

    <section class="summary-strip wb-summary-strip">
      <button class="summary-pill wb-summary-pill active" type="button" @click="switchView('pending')">
        <span class="summary-label wb-summary-label">待处理</span>
        <span class="summary-value wb-summary-value">{{ statsError ? '—' : stats.pendingCount }}</span>
      </button>
      <div class="summary-pill wb-summary-pill">
        <span class="summary-label wb-summary-label">今日完成</span>
        <span class="summary-value wb-summary-value">{{ statsError ? '—' : stats.todayDoneCount }}</span>
      </div>
      <div class="summary-pill wb-summary-pill">
        <span class="summary-label wb-summary-label">本周完成</span>
        <span class="summary-value wb-summary-value">{{ statsError ? '—' : stats.weekDoneCount }}</span>
      </div>
    </section>

    <section class="workspace-shell wb-shell" :class="{ 'detail-collapsed': !detailOpen }">
      <div class="list-panel wb-panel" :aria-busy="currentLoading">
        <div class="list-toolbar wb-panel-toolbar">
          <LnTabs class="view-switch" :model-value="currentView" :options="currentViewOptions" variant="segmented" aria-label="任务处理状态" @update:model-value="switchViewValue" />
          <div class="toolbar-actions"><LnInput v-model="taskKeyword" class="task-search" placeholder="搜索编号、标题或动作" clearable><template #prefix><LnIcon name="search"/></template></LnInput><LnButton icon-only variant="ghost" :aria-label="detailOpen ? '收起详情面板' : '展开详情面板'" :title="detailOpen ? '收起详情' : '展开详情'" @click="detailOpen = !detailOpen"><template #icon><LnIcon :name="detailOpen ? 'chevron-right' : 'chevron-left'" /></template></LnButton></div>
        </div>

        <div class="list-header wb-list-header row-grid">
          <div class="head-cell title-head">事项</div>
          <div class="head-cell">类型</div>
          <div class="head-cell">优先级</div>
          <div class="head-cell">状态</div>
          <div class="head-cell">动作</div>
          <div class="head-cell">更新时间</div>
          <div class="head-cell action-head">处理</div>
        </div>

        <template v-if="currentLoading"><div v-for="row in 6" :key="row" class="task-skeleton-row"><div><LnSkeleton width="64%"/><LnSkeleton width="42%" height="10px"/></div><LnSkeleton width="62px"/><LnSkeleton width="48px"/><LnSkeleton width="72px"/><LnSkeleton width="76px"/><LnSkeleton width="68px"/></div></template>
        <div v-else-if="currentError" class="list-error" role="alert"><strong>任务列表加载失败</strong><span>{{ currentError }}</span><LnButton size="small" @click="reloadCurrent">重新加载</LnButton></div>
        <LnTaskRow
          v-for="task in currentLoading || currentError ? [] : filteredCurrentList"
          :key="getTaskKey(task)"
          :req-no="task.reqNo" :title="task.title" :type-label="getReqTypeLabel(task.reqType)" :priority="task.priority || 'P2'"
          :status-label="task.statusName || '-'" :status-tone="getTaskStatusTone(task.status)"
          :action-label="task.actionRequired || (currentView === 'pending' ? '待处理' : '已完成')"
          :updated-at="formatTime(task.updatedTime || task.createTime)" :urgent="currentView === 'pending' && !!task.urgent"
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
              @action-error="(error) => handleActionError(task, error)"
            />
            <LnButton v-else size="small" variant="ghost" @click="selectTask(task)">查看</LnButton>
          </template>
        </LnTaskRow>

        <LnEmptyState v-if="filteredCurrentList.length === 0 && !currentLoading && !currentError" :title="taskKeyword ? '没有匹配的事项' : currentView === 'pending' ? '当前没有待我处理事项' : '暂无已处理记录'" :description="taskKeyword ? '尝试调整搜索关键词。' : '新的待办或处理记录会显示在这里。'" />

        <div class="pagination-line">
          <LnPagination v-if="currentView === 'pending'" v-model:page="pendingPage" :page-size="pageSize" :page-sizes="[pageSize]" :total="pendingTotal" @change="loadPending" />
          <LnPagination v-else v-model:page="donePage" :page-size="pageSize" :page-sizes="[pageSize]" :total="doneTotal" @change="loadDone" />
        </div>
      </div>

      <div v-if="detailOpen && selectedTask" class="detail-backdrop" aria-hidden="true" @click="detailOpen = false"></div>
      <aside v-if="detailOpen" class="detail-panel wb-panel">
        <template v-if="selectedTask">
          <div class="detail-scroll wb-detail-scroll">
            <div class="detail-header">
              <div class="detail-header-top"><div class="detail-id">{{ selectedTask.reqNo }}</div><LnButton icon-only size="small" variant="ghost" aria-label="关闭详情面板" @click="detailOpen = false"><template #icon><LnIcon name="close" /></template></LnButton></div>
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
              <div class="section-head wb-section-head"><div class="section-title wb-section-title">当前动作</div></div>
              <div class="info-grid">
                <div class="info-item wb-info-item">
                  <span class="info-label">需要动作</span>
                  <span class="info-value">{{ selectedTask.actionRequired || (currentView === 'pending' ? '待处理' : '已处理') }}</span>
                </div>
                <div class="info-item wb-info-item">
                  <span class="info-label">负责人 / 处理人</span>
                  <span class="info-value">{{ selectedTask.handler || '未分配' }}</span>
                </div>
                <div class="info-item wb-info-item">
                  <span class="info-label">业务线</span>
                  <span class="info-value">{{ selectedTask.businessLineName || '未设置' }}</span>
                </div>
                <div class="info-item wb-info-item">
                  <span class="info-label">任务来源</span>
                  <span class="info-value">{{ selectedTask.sourceLabel || getReqTypeLabel(selectedTask.reqType) }}</span>
                </div>
                <div class="info-item wb-info-item">
                  <span class="info-label">期望完成</span>
                  <span class="info-value" :class="{ 'is-urgent': selectedTask.urgent }">{{ formatDate(selectedTask.expectedDate) }}</span>
                </div>
                <div class="info-item wb-info-item">
                  <span class="info-label">最近更新</span>
                  <span class="info-value">{{ formatTime(selectedTask.updatedTime || selectedTask.createTime) }}</span>
                </div>
              </div>
            </div>

            <div class="detail-actions">
              <div v-if="taskActionError" class="action-error" role="alert">
                <div>
                  <strong>操作未完成</strong>
                  <span>{{ taskActionError.message }}</span>
                  <small v-if="taskActionError.traceId">追踪码：{{ taskActionError.traceId }}</small>
                </div>
                <LnButton v-if="taskActionError.traceId" size="small" variant="ghost" @click="copyTraceId(taskActionError.traceId)">复制追踪码</LnButton>
              </div>
              <ActionButtons
                v-if="currentView === 'pending'"
                :req-type="selectedTask.reqType"
                :req-id="selectedTask.id"
                :current-status="selectedTask.status"
                @action-done="handleActionDone"
                @action-error="handleSelectedActionError"
              />
              <LnButton variant="secondary" @click="openFullRequirement">查看完整需求</LnButton>
            </div>
          </div>
        </template>

        <LnEmptyState v-else title="选择一条事项" description="左侧列表会保留高密度浏览，右侧只承担聚焦和处理确认。" />
      </aside>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import ActionButtons from '@/components/workflow/ActionButtons.vue'
import { getPendingTasks, getDoneTasks, getMyTaskStats, type MyTaskVO, type MyTaskStats } from '@/api/my-tasks'
import { lnToast, LnButton, LnEmptyState, LnIcon, LnInput, LnPagination, LnSkeleton, LnTabs, LnTaskRow, type LnTabOption } from '@/components/linear'

const pendingLoading = ref(false)
const doneLoading = ref(false)
const actionRefreshing = ref(false)
const lastRefreshAt = ref<string>('')
const currentView = ref<'pending' | 'done'>('pending')
const selectedTaskKey = ref('')
const taskKeyword = ref('')
const detailOpen = ref(true)
const pendingError = ref('')
const doneError = ref('')
const statsError = ref(false)
const taskActionError = ref<{ message: string; traceId?: string } | null>(null)
const router = useRouter()
let searchTimer: number | undefined

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
const filteredCurrentList = computed(() => currentList.value)
const currentLoading = computed(() => currentView.value === 'pending' ? pendingLoading.value : doneLoading.value)
const selectedTask = computed(() => currentList.value.find((item) => getTaskKey(item) === selectedTaskKey.value) || null)
const currentError = computed(() => currentView.value === 'pending' ? pendingError.value : doneError.value)
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
  taskActionError.value = null
  detailOpen.value = true
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
      statsError.value = false
    }
  } catch {
    statsError.value = true
  }
}

async function loadPending() {
  pendingLoading.value = true
  pendingError.value = ''
  try {
    const res = await getPendingTasks({ page: pendingPage.value, size: pageSize, keyword: taskKeyword.value.trim() || undefined })
    const data = (res as any).data
    if (data) {
      pendingList.value = data.records || []
      pendingTotal.value = data.total || 0
      if (currentView.value === 'pending') ensureSelectedTask(pendingList.value)
    }
  } catch (error: any) {
    pendingError.value = error?.message || '请检查网络连接后重试'
  } finally {
    pendingLoading.value = false
    lastRefreshAt.value = dayjs().toISOString()
  }
}

async function loadDone() {
  doneLoading.value = true
  doneError.value = ''
  try {
    const res = await getDoneTasks({ page: donePage.value, size: pageSize, keyword: taskKeyword.value.trim() || undefined })
    const data = (res as any).data
    if (data) {
      doneList.value = data.records || []
      doneTotal.value = data.total || 0
      if (currentView.value === 'done') ensureSelectedTask(doneList.value)
    }
  } catch (error: any) {
    doneError.value = error?.message || '请检查网络连接后重试'
  } finally {
    doneLoading.value = false
  }
}

async function handleActionDone() {
  const previousIndex = pendingList.value.findIndex((item) => getTaskKey(item) === selectedTaskKey.value)
  actionRefreshing.value = true
  taskActionError.value = null
  try {
    await Promise.all([
      loadStats(),
      loadPending(),
      currentView.value === 'done' ? loadDone() : Promise.resolve(),
    ])
    if (currentView.value === 'pending' && pendingList.value.length) {
      selectedTaskKey.value = getTaskKey(pendingList.value[Math.min(Math.max(previousIndex, 0), pendingList.value.length - 1)])
    }
  } finally {
    actionRefreshing.value = false
  }
}

function handleActionError(task: MyTaskVO, error: { message: string; traceId?: string }) {
  selectedTaskKey.value = getTaskKey(task)
  detailOpen.value = true
  taskActionError.value = error
}

function handleSelectedActionError(error: { message: string; traceId?: string }) {
  taskActionError.value = error
}

async function copyTraceId(traceId: string) {
  await navigator.clipboard.writeText(traceId)
  lnToast.success('追踪码已复制')
}

async function manualRefresh() {
  actionRefreshing.value = true
  try { await Promise.all([loadStats(), reloadCurrent()]) } finally { actionRefreshing.value = false }
}

function reloadCurrent() { return currentView.value === 'pending' ? loadPending() : loadDone() }

function openFullRequirement() {
  if (!selectedTask.value) return
  const path = selectedTask.value.reqType === 'product' ? '/product-pool' : '/raw-pool'
  void router.push({ path, query: { focus: String(selectedTask.value.id) } })
}

function formatTime(time: string) {
  if (!time) return '-'
  return dayjs(time).format('MM-DD HH:mm')
}

function formatDate(date?: string) {
  if (!date) return '未设置'
  return dayjs(date).format('YYYY-MM-DD')
}

watch(taskKeyword, () => {
  window.clearTimeout(searchTimer)
  searchTimer = window.setTimeout(() => {
    if (currentView.value === 'pending') pendingPage.value = 1
    else donePage.value = 1
    void reloadCurrent()
  }, 300)
})

onMounted(() => {
  loadStats()
  loadPending()
})
onUnmounted(() => window.clearTimeout(searchTimer))
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
.header-side,.toolbar-actions,.detail-header-top { display: flex; align-items: center; gap: 7px; }
.detail-header-top { justify-content: space-between; }

.summary-pill {
  border: 0;
  font: inherit;
  text-align: left;
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
.workspace-shell.detail-collapsed { grid-template-columns: minmax(0, 1fr); }

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
.task-skeleton-row { min-height: 64px; padding: 10px 14px; display: grid; grid-template-columns: minmax(240px,2fr) 82px 72px 104px minmax(104px,1fr) 92px; align-items: center; gap: 10px; border-bottom: 1px solid var(--ln-border); }
.task-skeleton-row>div { display: grid; gap: 8px; }
.detail-panel :deep(.ln-empty-state) { height: 100%; }
.list-error { min-height: 220px; padding: 28px; display: grid; place-content: center; justify-items: center; gap: 9px; color: var(--text-secondary); font-size: 12px; text-align: center; }

.toolbar-note {
  font-size: 12px;
  color: var(--text-secondary);
  white-space: nowrap;
}

.row-grid {
  display: grid;
  grid-template-columns: minmax(240px,2fr) 82px 72px 104px minmax(104px,1fr) 92px minmax(112px,auto);
  column-gap: 10px;
  align-items: center;
}

.list-header {
  padding: 0 18px;
  min-height: 36px;
  border-bottom: 1px solid var(--border);
  font-size: 13px;
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
  position: relative;
  z-index: 2;
}

.detail-backdrop { display: none; }

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
  font-size: 13px;
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
  font-size: 12px;
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
  font-size: 13px;
  color: var(--text-secondary);
}

.info-value {
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-primary);
}

.info-value.is-urgent { color: var(--danger); font-weight: 650; }

.detail-actions {
  margin-top: 6px;
  padding: 16px 16px 0;
  border-top: 1px solid var(--border);
}

.action-error {
  margin: 0 0 14px;
  padding: 12px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  border: 1px solid rgba(196, 71, 65, 0.22);
  border-radius: 10px;
  background: rgba(196, 71, 65, 0.06);
  color: #9f423c;
}
.action-error > div { display: grid; gap: 4px; }
.action-error strong { font-size: 14px; }
.action-error span { font-size: 13px; line-height: 1.55; }
.action-error small { font-size: 12px; color: #a85b55; }

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

@media (max-width: 1279px) {
  .workspace-shell {
    grid-template-columns: 1fr;
  }

  .detail-backdrop {
    position: fixed;
    inset: 0;
    z-index: 1050;
    display: block;
    background: rgba(22, 22, 26, 0.28);
    backdrop-filter: blur(2px);
  }

  .detail-panel {
    position: fixed;
    z-index: 1060;
    top: 64px;
    right: 16px;
    bottom: 16px;
    width: min(440px, calc(100vw - 32px));
    min-height: 0;
    box-shadow: 0 24px 64px rgba(20, 20, 24, 0.18);
  }
}

@media (max-width: 768px) {
  .my-tasks-view { gap: 12px; }
  .page-header { align-items: center; }
  .refresh-status { display: none; }
  .summary-strip { gap: 8px; }
  .summary-pill { padding: 10px; }
  .summary-value { font-size: 21px; }

  .list-toolbar {
    flex-direction: column;
    align-items: stretch;
  }
  .toolbar-actions { width: 100%; }
  .task-search, :deep(.task-search .ln-input-wrap) { width: 100%; }

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

  .detail-panel {
    inset: 0;
    width: 100%;
    border: 0;
    border-radius: 0;
  }
  .detail-scroll { padding-bottom: 0; }
  .detail-actions {
    position: sticky;
    bottom: 0;
    z-index: 3;
    margin: 16px -20px 0;
    padding: 14px 20px calc(14px + env(safe-area-inset-bottom));
    background: rgba(255, 255, 255, 0.96);
    backdrop-filter: blur(14px);
  }
  .detail-actions :deep(.action-buttons) { width: 100%; }
  .detail-actions :deep(.action-buttons .ln-button) { flex: 1; }
}
</style>

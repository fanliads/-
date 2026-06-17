<template>
  <div class="my-tasks-view">
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">我的待办</h1>
        <p class="page-subtitle">优先处理当前待办，已处理记录按需展开查看。</p>
      </div>
      <div class="header-right">
        <span class="refresh-status" :class="{ syncing: actionRefreshing }">
          {{ refreshStatusText }}
        </span>
      </div>
    </div>

    <div class="summary">
      <div class="summary-card"><div class="summary-k">待处理</div><div class="summary-v">{{ stats.pendingCount }}</div></div>
      <div class="summary-card"><div class="summary-k">今日已处理</div><div class="summary-v">{{ stats.todayDoneCount }}</div></div>
      <div class="summary-card"><div class="summary-k">本周已处理</div><div class="summary-v">{{ stats.weekDoneCount }}</div></div>
    </div>

    <div class="content-scroll">
      <div class="task-group">
        <div class="group-header">
          <div>
            <div class="group-label">待我处理（{{ pendingTotal }}）</div>
            <div class="group-tip">这里只展示当前需要你推进的事项，操作完成后会自动刷新。</div>
          </div>
        </div>
        <div v-loading="pendingLoading" class="task-list">
          <template v-if="pendingList.length > 0">
            <div
              v-for="task in pendingList"
              :key="`${task.reqType}-${task.id}`"
              class="task-card"
            >
              <div class="task-priority" :class="'task-' + (task.priority || 'p2').toLowerCase()"></div>

              <div class="task-body">
                <div class="task-title">{{ task.title }}</div>
                <div class="task-meta">
                  <span>{{ task.reqNo }}</span>
                  <span class="task-tag">{{ task.statusName }}</span>
                  <span v-if="task.actionRequired">{{ task.actionRequired }}</span>
                </div>
              </div>

              <div v-if="task.updatedTime" class="task-countdown" :class="{ safe: !isUrgent(task.updatedTime) }">
                {{ formatTime(task.updatedTime) }}
              </div>

              <div class="task-actions">
                <ActionButtons
                  :req-type="task.reqType"
                  :req-id="task.id"
                  :current-status="task.status"
                  @action-done="handleActionDone"
                />
              </div>
            </div>
          </template>
          <el-empty v-else description="当前没有待我处理事项" />
        </div>
        <div class="pagination-wrap" v-if="pendingTotal > 0">
          <el-pagination
            v-model:current-page="pendingPage"
            :page-size="pageSize"
            :total="pendingTotal"
            layout="total, prev, pager, next"
            @current-change="loadPending"
          />
        </div>
      </div>

      <div class="task-group secondary-group">
        <button type="button" class="secondary-toggle" @click="toggleDoneSection">
          <span>{{ doneExpanded ? '收起已处理记录' : `查看已处理记录（${stats.todayDoneCount} 今日 / ${doneTotal || stats.weekDoneCount} 条）` }}</span>
          <span class="secondary-toggle-icon">{{ doneExpanded ? '−' : '+' }}</span>
        </button>
        <div v-if="doneExpanded" class="secondary-panel">
          <div class="group-label">已处理</div>
          <div class="group-tip">作为回顾记录保留，默认折叠，避免工作台首屏分散注意力。</div>
          <div v-loading="doneLoading" class="task-list">
            <template v-if="doneList.length > 0">
              <div
                v-for="task in doneList"
                :key="`done-${task.reqType}-${task.id}`"
                class="task-card done"
              >
                <div class="task-priority task-done-bar"></div>
                <div class="task-body">
                  <div class="task-title">{{ task.title }}</div>
                  <div class="task-meta">
                    <span>{{ task.reqNo }}</span>
                    <span class="task-tag">{{ task.statusName }}</span>
                    <span v-if="task.actionRequired">{{ task.actionRequired }}</span>
                  </div>
                </div>
              </div>
            </template>
            <el-empty v-else description="暂无已处理记录" />
          </div>
          <div class="pagination-wrap" v-if="doneTotal > 0">
            <el-pagination
              v-model:current-page="donePage"
              :page-size="pageSize"
              :total="doneTotal"
              layout="total, prev, pager, next"
              @current-change="loadDone"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import ActionButtons from '@/components/workflow/ActionButtons.vue'
import { getPendingTasks, getDoneTasks, getMyTaskStats, type MyTaskVO, type MyTaskStats } from '@/api/my-tasks'
import dayjs from 'dayjs'

const pendingLoading = ref(false)
const doneLoading = ref(false)
const actionRefreshing = ref(false)
const lastRefreshAt = ref<string>('')

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
const doneExpanded = ref(false)

const pageSize = 10

const refreshStatusText = computed(() => {
  if (actionRefreshing.value) {
    return '正在同步最新处理结果...'
  }

  if (!lastRefreshAt.value) {
    return '待办将自动保持最新'
  }

  return `最近刷新 ${dayjs(lastRefreshAt.value).format('HH:mm:ss')}`
})

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
    }
  } catch {
    pendingList.value = []
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
    }
  } catch {
    doneList.value = []
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
      doneExpanded.value ? loadDone() : Promise.resolve(),
    ])
  } finally {
    actionRefreshing.value = false
  }
}

async function toggleDoneSection() {
  doneExpanded.value = !doneExpanded.value

  if (doneExpanded.value && doneList.value.length === 0) {
    await loadDone()
  }
}

function isUrgent(time: string): boolean {
  if (!time) return false
  return dayjs(time).isBefore(dayjs().add(2, 'day'), 'day')
}

function formatTime(time: string) {
  if (!time) return ''
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
}

.page-header {
  height: 64px;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  flex-shrink: 0;

  .page-title {
    font-size: 16px;
    font-weight: 600;
    margin: 0;
    color: var(--text-primary);
  }

  .page-subtitle {
    margin: 6px 0 0;
    font-size: 12px;
    color: var(--text-secondary);
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 16px;
  }
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

.content-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 24px 32px;
}

.task-group {
  margin-bottom: 28px;
}

.group-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.group-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.group-tip {
  font-size: 12px;
  color: var(--text-secondary);
}

.task-card {
  background: var(--surface);
  border-radius: var(--radius);
  padding: 18px 20px;
  box-shadow: var(--shadow);
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: var(--transition);
  cursor: pointer;

  &:hover {
    box-shadow: var(--shadow-hover);
    transform: translateY(-1px);
  }

  &.done {
    opacity: 0.75;
  }
}

.task-priority {
  width: 4px;
  align-self: stretch;
  border-radius: 2px;
  flex-shrink: 0;
}

.task-p0 { background: var(--danger); }
.task-p1 { background: var(--warning); }
.task-p2 { background: #ffcc00; }
.task-done-bar { background: #d1d1d6; }

.task-body {
  flex: 1;
  min-width: 0;
}

.task-title {
  font-weight: 500;
  font-size: 15px;
  margin-bottom: 6px;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.task-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: var(--text-secondary);
}

.task-tag {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  background: rgba(0, 113, 227, 0.08);
  color: var(--primary);
}

.task-countdown {
  font-size: 12px;
  font-weight: 600;
  color: var(--danger);
  flex-shrink: 0;
  white-space: nowrap;

  &.safe {
    color: var(--success);
  }
}

.task-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  padding-top: 16px;
}

.secondary-group {
  margin-top: 12px;
}

.secondary-toggle {
  width: 100%;
  border: 1px solid var(--border);
  background: var(--surface);
  border-radius: var(--radius);
  padding: 14px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
  transition: var(--transition);

  &:hover {
    border-color: var(--primary);
    box-shadow: var(--shadow-hover);
  }
}

.secondary-toggle-icon {
  font-size: 18px;
  line-height: 1;
  color: var(--text-secondary);
}

.secondary-panel {
  padding-top: 16px;
}

@media (max-width: 768px) {
  .page-header {
    height: auto;
    padding: 0 16px;
    align-items: flex-start;
    flex-direction: column;
    gap: 12px;
    padding-top: 16px;
    padding-bottom: 16px;
  }

  .content-scroll {
    padding: 16px;
  }

  .task-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>

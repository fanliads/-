<template>
  <div class="my-tasks-view">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">我的待办</h1>
      </div>
      <div class="header-right">
        <input class="search-box" placeholder="搜索..." />
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="summary">
      <div class="summary-card"><div class="summary-k">待处理</div><div class="summary-v">{{ stats.pendingCount }}</div></div>
      <div class="summary-card"><div class="summary-k">今日已处理</div><div class="summary-v">{{ stats.todayDoneCount }}</div></div>
      <div class="summary-card"><div class="summary-k">本周已处理</div><div class="summary-v">{{ stats.weekDoneCount }}</div></div>
    </div>

    <!-- 任务列表区域 -->
    <div class="content-scroll">
      <!-- 待我处理 -->
      <div class="task-group">
        <div class="group-label">待我处理（{{ pendingTotal }}）</div>
        <div v-loading="loading" class="task-list">
          <template v-if="pendingList.length > 0">
            <div
              v-for="task in pendingList"
              :key="`${task.reqType}-${task.id}`"
              class="task-card"
            >
              <!-- 左侧优先级色条 -->
              <div class="task-priority" :class="'task-' + (task.priority || 'p2').toLowerCase()"></div>

              <!-- 任务主体 -->
              <div class="task-body">
                <div class="task-title">{{ task.title }}</div>
                <div class="task-meta">
                  <span>{{ task.reqNo }}</span>
                  <span class="task-tag">{{ task.statusName }}</span>
                  <span v-if="task.actionRequired">{{ task.actionRequired }}</span>
                </div>
              </div>

              <!-- 倒计时 -->
              <div v-if="task.updatedTime" class="task-countdown" :class="{ safe: !isUrgent(task.updatedTime) }">
                {{ formatTime(task.updatedTime) }}
              </div>

              <!-- 操作按钮 -->
              <div class="task-actions">
                <ActionButtons
                  :req-type="task.reqType"
                  :req-id="task.id"
                  :current-status="task.status"
                  @action-done="loadPending"
                />
              </div>
            </div>
          </template>
          <el-empty v-else description="暂无待处理任务" />
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

      <!-- 已处理 -->
      <div class="task-group">
        <div class="group-label">已处理</div>
        <div v-loading="loading" class="task-list">
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
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import ActionButtons from '@/components/workflow/ActionButtons.vue'
import { getPendingTasks, getDoneTasks, getMyTaskStats, type MyTaskVO, type MyTaskStats } from '@/api/my-tasks'
import dayjs from 'dayjs'

const loading = ref(false)

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
  loading.value = true
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
    loading.value = false
  }
}

async function loadDone() {
  loading.value = true
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
    loading.value = false
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

  .header-right {
    display: flex;
    align-items: center;
    gap: 16px;
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

.group-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
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

@media (max-width: 768px) {
  .page-header {
    padding: 0 16px;
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

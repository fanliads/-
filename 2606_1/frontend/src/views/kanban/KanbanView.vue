<template>
  <div class="kanban-view">
    <!-- 顶部工具栏 -->
    <div class="kanban-toolbar">
      <div class="toolbar-left">
        <!-- Tab 切换 (view-tabs 样式) -->
        <div class="view-tabs">
          <div
            v-for="tab in tabs"
            :key="tab.key"
            class="view-tab"
            :class="{ active: activeTab === tab.key }"
            @click="activeTab = tab.key"
          >
            {{ tab.label }}
          </div>
        </div>
      </div>

      <!-- 看板Tab专属筛选 -->
      <div v-if="activeTab === 'kanban'" class="toolbar-right">
        <!-- 使用自定义分段按钮替代 el-segmented -->
        <div class="board-type-switch">
          <div
            v-for="opt in boardTypeOptions"
            :key="opt.value"
            class="switch-item"
            :class="{ active: boardType === opt.value }"
            @click="switchBoardType(opt.value)"
          >
            {{ opt.label }}
          </div>
        </div>

        <!-- 使用原生 select 代替 el-select，避免 Element Plus 无限渲染循环 -->
        <select
          v-model="queryForm.priority"
          class="native-select"
          @change="loadKanbanData"
        >
          <option value="">优先级</option>
          <option value="P0">P0</option>
          <option value="P1">P1</option>
          <option value="P2">P2</option>
          <option value="P3">P3</option>
        </select>

        <select
          v-model="queryForm.businessLineId"
          class="native-select"
          @change="loadKanbanData"
        >
          <option value="">业务线</option>
          <option
            v-for="item in businessLineOptions"
            :key="item.value"
            :value="item.value"
          >
            {{ item.label }}
          </option>
        </select>

        <select
          v-model="queryForm.assigneeId"
          class="native-select"
          @change="loadKanbanData"
        >
          <option value="">负责人</option>
          <option
            v-for="item in assigneeOptions"
            :key="item.value"
            :value="item.value"
          >
            {{ item.label }}
          </option>
        </select>

        <select
          v-if="boardType === 'product'"
          v-model="queryForm.sprintId"
          class="native-select"
          @change="loadKanbanData"
        >
          <option value="">迭代</option>
          <option
            v-for="item in sprintOptions"
            :key="item.value"
            :value="item.value"
          >
            {{ item.label }}
          </option>
        </select>

        <!-- 搜索框 -->
        <input
          v-model="queryForm.keyword"
          class="search-box"
          placeholder="搜索需求编号、标题..."
          @keyup.enter="loadKanbanData"
        />
      </div>
    </div>

    <!-- 看板Tab内容 -->
    <div v-if="activeTab === 'kanban'" class="board-scroll">
      <div class="board-summary">
        <div class="board-summary-card">
          <div class="summary-label">当前视角</div>
          <div class="summary-value">{{ boardType === 'product' ? '产品需求看板' : '原始需求看板' }}</div>
        </div>
        <div class="board-summary-card">
          <div class="summary-label">总需求数</div>
          <div class="summary-value">{{ totalCardCount }}</div>
        </div>
        <div class="board-summary-card">
          <div class="summary-label">筛选状态</div>
          <div class="summary-value summary-inline">{{ hasFilters ? '已应用筛选' : '查看全部' }}</div>
        </div>
      </div>

      <div v-if="loading" class="kanban-loading">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span>加载中...</span>
      </div>

      <div v-else class="board">
        <div
          v-for="column in columns"
          :key="column.status"
          class="column"
        >
          <!-- 列头 -->
          <div class="column-header">
            <span class="column-title">{{ column.statusName }}</span>
            <span class="column-count">{{ getColumnCount(column.status) }}</span>
          </div>

          <!-- 列内容 -->
          <div class="column-body">
            <div
              v-for="item in (kanbanDataMap[column.status] || [])"
              :key="item.id"
              class="kanban-card-simple"
            >
              <div class="card-title">{{ item.title }}</div>
              <div class="card-meta">{{ item.statusName }} | {{ item.priority }}</div>
            </div>

            <!-- 空状态 -->
            <div v-if="getColumnCount(column.status) === 0" class="column-empty">
              暂无需求
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 其他Tab内容 -->
    <div v-else class="sub-view-wrapper">
      <component :is="tabComponentMap[activeTab]" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, defineAsyncComponent, type Component, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'
import { getKanbanColumns, getProductKanbanData, getRawKanbanData } from '@/api/kanban'
import { listDictData } from '@/api/dict'
import { listSprintOptions } from '@/api/sprint'
import { PRODUCT_STATUS_MAP, RAW_STATUS_MAP } from '@/types/requirement'
import type { KanbanColumn, ProductRequirementVO, RawRequirementVO } from '@/types/kanban'

/** Tab定义 */
type TabKey = 'kanban' | 'priority' | 'pm-tasks' | 'progress' | 'list' | 'calendar'
type BoardType = 'product' | 'raw'

const tabs: { key: TabKey; label: string }[] = [
  { key: 'kanban', label: '看板' },
  { key: 'priority', label: '优先级' },
  { key: 'pm-tasks', label: 'PM任务' },
  { key: 'progress', label: '进度看板' },
  { key: 'list', label: '列表视图' },
  { key: 'calendar', label: '日历视图' },
]

const tabComponentMap: Record<string, Component> = {
  'priority': defineAsyncComponent(() => import('@/views/priority/PriorityView.vue')),
  'pm-tasks': defineAsyncComponent(() => import('@/views/pm-tasks/PmTasksView.vue')),
  'progress': defineAsyncComponent(() => import('@/views/progress/ProgressView.vue')),
  'list': defineAsyncComponent(() => import('@/views/list/ListView.vue')),
  'calendar': defineAsyncComponent(() => import('@/views/calendar/CalendarView.vue')),
}

/** 当前Tab */
const activeTab = ref<TabKey>('kanban')
const boardType = ref<BoardType>('raw')
const boardTypeOptions = [
  { label: '产品需求', value: 'product' as BoardType },
  { label: '原始需求', value: 'raw' as BoardType },
]

/** 加载状态 - 初始为 true 防止数据未加载时渲染 */
const loading = ref(true)

/** 初始化标志，防止初始化过程中重复触发加载 */
let initialized = false

/** 查询条件 - 使用空字符串代替 undefined，避免与原生 select 的兼容性问题 */
const queryForm = reactive<Record<string, any>>({
  priority: '',
  businessLineId: '',
  assigneeId: '',
  sprintId: '',
  keyword: '',
})

/** 看板列配置 */
const columns = ref<KanbanColumn[]>([])

/** 看板数据（按状态分组） */
const kanbanDataMap = ref<Record<string, Array<ProductRequirementVO | RawRequirementVO>>>({})

/** 筛选选项 */
const businessLineOptions = ref<{ label: string; value: number }[]>([])
const assigneeOptions = ref<{ label: string; value: number }[]>([])
const sprintOptions = ref<{ label: string; value: number }[]>([])
const OPTION_TIMEOUT_MS = 5000
const totalCardCount = computed(() =>
  columns.value.reduce((sum, column) => sum + getColumnCount(column.status), 0)
)
const hasFilters = computed(() =>
  Boolean(
    queryForm.priority ||
    queryForm.businessLineId ||
    queryForm.assigneeId ||
    queryForm.sprintId ||
    queryForm.keyword
  )
)

function unwrapResponseData<T>(payload: any, fallback: T): T {
  if (payload == null) {
    return fallback
  }
  if (payload.data !== undefined) {
    return payload.data as T
  }
  return payload as T
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('request timeout')), ms)
    ),
  ])
}

/** 确保每个状态都有对应的数组 */
function ensureStatusKeys() {
  for (const col of columns.value) {
    if (!kanbanDataMap.value[col.status]) {
      kanbanDataMap.value[col.status] = []
    }
  }
}

async function rebuildColumns() {
  try {
    const res: any = await getKanbanColumns(boardType.value)
    columns.value = unwrapResponseData<KanbanColumn[]>(res, [])
  } catch {
    const source = boardType.value === 'product' ? PRODUCT_STATUS_MAP : RAW_STATUS_MAP
    columns.value = Object.entries(source).map(([status, statusName], index) => ({
      status,
      statusName,
      sortOrder: index,
    }))
  }
  ensureStatusKeys()
}

/** 获取列数量 */
function getColumnCount(status: string): number {
  return (kanbanDataMap.value[status] || []).length
}

/** 加载看板数据 */
async function loadKanbanData() {
  loading.value = true
  try {
    const params: Record<string, any> = {}
    if (queryForm.priority) params.priority = queryForm.priority
    if (queryForm.businessLineId) params.businessLineId = queryForm.businessLineId
    if (queryForm.assigneeId) params.assigneeId = queryForm.assigneeId
    if (boardType.value === 'product' && queryForm.sprintId) params.sprintId = queryForm.sprintId
    if (queryForm.keyword) params.keyword = queryForm.keyword

    const res: any = boardType.value === 'product'
      ? await getProductKanbanData(params)
      : await getRawKanbanData(params)
    const nextData = unwrapResponseData<Record<string, Array<ProductRequirementVO | RawRequirementVO>>>(res, {})
    kanbanDataMap.value = nextData
    ensureStatusKeys()
  } catch {
    ElMessage.error('加载看板数据失败')
  } finally {
    loading.value = false
  }
}

/** 切换看板类型 - 仅在初始化完成后才触发 */
function switchBoardType(type: BoardType) {
  if (boardType.value === type) return
  boardType.value = type
  if (!initialized) return
  queryForm.sprintId = undefined
  loadSprintOptions()
  rebuildColumns().then(loadKanbanData)
}

async function loadBusinessLineOptions() {
  try {
    const res = await withTimeout(listDictData('business_line'), OPTION_TIMEOUT_MS)
    businessLineOptions.value = unwrapResponseData<any[]>(res, []).map((item: any) => ({
      label: item.label,
      value: Number(item.value),
    }))
  } catch {
    businessLineOptions.value = []
  }
}

async function loadAssigneeOptions() {
  try {
    const res = await withTimeout(listDictData('product_manager'), OPTION_TIMEOUT_MS)
    assigneeOptions.value = unwrapResponseData<any[]>(res, []).map((item: any) => ({
      label: item.label,
      value: Number(item.value) || item.value,
    }))
  } catch {
    assigneeOptions.value = []
  }
}

async function loadSprintOptions() {
  if (boardType.value !== 'product') {
    sprintOptions.value = []
    return
  }

  try {
    const res = await withTimeout(listSprintOptions(), OPTION_TIMEOUT_MS)
    sprintOptions.value = unwrapResponseData<any[]>(res, []).map((item: any) => ({
      label: item.name,
      value: item.id,
    }))
  } catch {
    sprintOptions.value = []
  }
}

onMounted(async () => {
  void loadBusinessLineOptions()
  void loadAssigneeOptions()
  void loadSprintOptions()
  await rebuildColumns()
  ensureStatusKeys()
  await loadKanbanData()
  initialized = true
})
</script>

<style lang="scss" scoped>
.kanban-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.kanban-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  background: rgba(255, 252, 247, 0.82);
  border: 1px solid rgba(77, 63, 47, 0.08);
  border-radius: 24px;
  box-shadow: var(--shadow);
  flex-shrink: 0;

  .toolbar-left {
    display: flex;
    align-items: center;
  }

  .toolbar-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }
}

.view-tabs {
  display: inline-flex;
  background: rgba(77, 63, 47, 0.08);
  border-radius: 16px;
  padding: 4px;
}

.view-tab {
  padding: 8px 16px;
  border-radius: 12px;
  font-size: 13px;
  cursor: pointer;
  color: var(--text-secondary);
  transition: var(--transition);
  white-space: nowrap;
  border: none;
  background: transparent;

  &:hover {
    color: var(--text-primary);
  }

  &.active {
    background: rgba(255, 255, 255, 0.96);
    box-shadow: 0 12px 24px rgba(54, 41, 29, 0.08);
    font-weight: 600;
    color: var(--text-primary);
  }
}

.board-type-switch {
  display: inline-flex;
  background: rgba(77, 63, 47, 0.08);
  border-radius: 14px;
  padding: 3px;

  .switch-item {
    padding: 8px 14px;
    border-radius: 11px;
    font-size: 13px;
    cursor: pointer;
    color: var(--text-secondary);
    transition: var(--transition);
    white-space: nowrap;

    &:hover {
      color: var(--text-primary);
    }

    &.active {
      background: linear-gradient(135deg, var(--primary) 0%, #245f58 100%);
      color: #fff;
      font-weight: 600;
      box-shadow: 0 12px 24px rgba(31, 107, 92, 0.18);
    }
  }
}

.filter-select {
  // 保留给后续必要时使用
}

.native-select {
  padding: 9px 34px 9px 12px;
  border-radius: 14px;
  border: 1px solid var(--border);
  background: rgba(255, 255, 255, 0.75);
  font-size: 13px;
  color: var(--text-secondary);
  outline: none;
  appearance: none;
  -webkit-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%2386868b'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  cursor: pointer;
  transition: border-color 0.2s;

  &:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 4px rgba(31, 107, 92, 0.08);
  }
}

.search-box {
  padding: 9px 14px;
  border-radius: 14px;
  border: 1px solid var(--border);
  background: rgba(255, 255, 255, 0.75);
  font-size: 13px;
  color: var(--text-primary);
  outline: none;
  width: 180px;
  transition: border-color 0.2s;

  &:focus {
    border-color: var(--primary);
  }

  &::placeholder {
    color: var(--text-secondary);
  }
}

.board-scroll {
  flex: 1;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 2px 0 8px;
}

.board-summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 16px;
}

.board-summary-card {
  padding: 16px 18px;
  border-radius: 20px;
  background: rgba(255, 252, 247, 0.78);
  border: 1px solid rgba(77, 63, 47, 0.08);
  box-shadow: var(--shadow);
}

.summary-label {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 6px;
}

.summary-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  font-family: var(--font-family-accent);
}

.summary-inline {
  font-size: 18px;
}

.kanban-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 280px;
  gap: 8px;
  color: var(--text-secondary);
  font-size: 14px;
  background: rgba(255, 252, 247, 0.66);
  border: 1px dashed rgba(77, 63, 47, 0.14);
  border-radius: 24px;

  .el-icon {
    font-size: 20px;
  }
}

.board {
  display: flex;
  gap: 18px;
  min-width: max-content;
  height: 100%;
}

.column {
  width: 320px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex-shrink: 0;
}

.column-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 6px;
}

.column-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
}

.column-count {
  background: rgba(77, 63, 47, 0.08);
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 11px;
  color: var(--text-secondary);
}

.column-body {
  background: linear-gradient(180deg, rgba(255, 252, 247, 0.78) 0%, rgba(244, 239, 232, 0.78) 100%);
  border: 1px solid rgba(77, 63, 47, 0.08);
  border-radius: 24px;
  padding: 14px;
  min-height: 220px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  box-shadow: var(--shadow);
}

.kanban-card-simple {
  background: rgba(255, 255, 255, 0.88);
  border-radius: 18px;
  padding: 14px;
  border: 1px solid var(--border);
  transition: var(--transition);
  box-shadow: 0 8px 18px rgba(54, 41, 29, 0.06);

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 16px 28px rgba(54, 41, 29, 0.12);
  }

  .card-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 8px;
    line-height: 1.4;
  }

  .card-meta {
    font-size: 12px;
    color: var(--text-secondary);
  }
}

.column-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30px 0;
  color: var(--text-secondary);
  font-size: 13px;
  border: 1px dashed rgba(77, 63, 47, 0.16);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.4);
}

.sub-view-wrapper {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

// 响应式
@media (max-width: 768px) {
  .kanban-toolbar {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
    padding: 16px;

    .toolbar-right {
      flex-wrap: wrap;
    }
  }

  .board-summary {
    grid-template-columns: 1fr;
  }

  .column {
    width: 260px;
  }
}
</style>

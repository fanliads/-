<template>
  <div class="kanban-view">
    <section class="page-header wb-page-header wb-panel">
      <div class="title-block">
        <div class="title-row wb-title-row">
          <h2 class="page-title wb-page-title">看板视图</h2>
          <span class="page-count wb-page-meta">{{ totalCardCount }} 项</span>
        </div>
        <p class="page-subtitle wb-page-subtitle">按状态查看并推进需求，拖拽卡片即可更新状态。</p>
      </div>
      <LnTabs
        class="board-type-switch"
        :model-value="boardType"
        :options="boardTypeOptions"
        variant="segmented"
        aria-label="需求类型"
        @update:model-value="switchBoardTypeValue"
      />
    </section>

    <section class="board-panel wb-panel">
      <div class="board-toolbar wb-panel-toolbar">
        <div class="filter-row wb-actions-row">
          <LnSelect v-model="queryForm.priority" :options="priorityOptions" placeholder="优先级" clearable @change="loadKanbanData" />
          <LnSelect v-model="queryBusinessLineValue" :options="linearBusinessLineOptions" placeholder="业务线" searchable clearable @change="loadKanbanData" />
          <LnSelect v-model="queryAssigneeValue" :options="linearAssigneeOptions" placeholder="负责人" searchable clearable @change="loadKanbanData" />
          <LnSelect v-if="boardType === 'product'" v-model="querySprintValue" :options="linearSprintOptions" placeholder="所属迭代" searchable clearable @change="loadKanbanData" />
          <LnInput v-model="queryForm.keyword" class="linear-board-search" placeholder="搜索需求编号、标题..." clearable @keydown.enter="loadKanbanData">
            <template #prefix><LnIcon name="search"/></template>
          </LnInput>
        </div>
        <div class="toolbar-meta">
          <span v-if="hasFilters">已应用筛选</span>
          <button v-if="hasFilters" type="button" @click="clearFilters">清除</button>
        </div>
      </div>

      <div v-if="loading" class="board-scroll">
        <div class="board">
          <div v-for="column in 4" :key="column" class="linear-column-skeleton">
            <div class="skeleton-column-head"><LnSkeleton circle width="9px" /><LnSkeleton width="70px" /></div>
            <LnSkeleton v-for="card in 4" :key="card" height="126px" />
          </div>
        </div>
      </div>

      <div v-else ref="boardScrollRef" class="board-scroll">
        <div class="board">
          <LnBoardColumn
            v-for="(column, index) in columns"
            :key="column.status"
            :title="column.statusName"
            :count="getColumnCount(column.status)"
            :color="columnColors[index % columnColors.length]"
            :class="{ 'is-drop-target': dragTargetStatus === column.status }"
            @dragover.prevent="dragTargetStatus = column.status"
            @dragleave="handleDragLeave(column.status, $event)"
            @drop.prevent="dropCard(column.status)"
          >
            <LnIssueCard
              v-for="item in (kanbanDataMap[column.status] || [])"
              :key="getCardKey(item)"
              :req-no="item.reqNo"
              :title="item.title"
              :type-label="boardType === 'product' ? '产品需求' : '原始需求'"
              :priority="item.priority || 'P2'"
              :context-main="getCardContextMain(item)"
              :context-tail="getCardContextTail(item)"
              :footer="getCardFooter(item)"
              :owner="getCardOwner(item)"
              :draggable="!movingCardKey"
              :class="{ 'is-dragging': draggingCardKey === getCardKey(item), 'is-moving': movingCardKey === getCardKey(item) }"
              @dragstart="startDrag(item, column.status, $event)"
              @dragend="finishDrag"
              @click="openRequirementDetail(item)"
            />
          </LnBoardColumn>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getKanbanColumns, getProductKanbanData, getRawKanbanData, moveRequirement } from '@/api/kanban'
import { listDictData } from '@/api/dict'
import { listSprintOptions } from '@/api/sprint'
import { PRODUCT_STATUS_MAP, RAW_STATUS_MAP } from '@/types/requirement'
import type { KanbanColumn, ProductRequirementVO, RawRequirementVO } from '@/types/kanban'
import {
  lnToast,
  LnBoardColumn,
  LnIcon,
  LnInput,
  LnIssueCard,
  LnSelect,
  LnSkeleton,
  LnTabs,
  type LnOption,
  type LnTabOption,
} from '@/components/linear'

type BoardType = 'product' | 'raw'
type BoardCard = ProductRequirementVO | RawRequirementVO

const route = useRoute()
const router = useRouter()
const boardType = ref<BoardType>(route.query.sprintId ? 'product' : (route.query.type === 'product' ? 'product' : 'raw'))
const boardTypeOptions: LnTabOption[] = [
  { label: '原始需求', value: 'raw' },
  { label: '产品需求', value: 'product' },
]
const loading = ref(true)
const initialized = ref(false)
const columns = ref<KanbanColumn[]>([])
const kanbanDataMap = ref<Record<string, BoardCard[]>>({})
const businessLineOptions = ref<Array<{ label: string; value: number }>>([])
const assigneeOptions = ref<Array<{ label: string; value: number | string }>>([])
const sprintOptions = ref<Array<{ label: string; value: number }>>([])
const draggingCardKey = ref('')
const movingCardKey = ref('')
const dragTargetStatus = ref('')
const boardScrollRef = ref<HTMLElement | null>(null)
const draggedCard = ref<{ item: BoardCard; fromStatus: string } | null>(null)
const OPTION_TIMEOUT_MS = 5000
const columnColors = ['#9b9ba4', '#d28b36', '#5e6ad2', '#2f9e6f', '#d05757', '#6f6f78']
const priorityOptions: LnOption[] = [
  { label: 'P0', value: 'P0', color: '#d05757' },
  { label: 'P1', value: 'P1', color: '#d28b36' },
  { label: 'P2', value: 'P2', color: '#5e6ad2' },
  { label: 'P3', value: 'P3', color: '#6f6f78' },
]

const queryForm = reactive<Record<string, any>>({
  priority: String(route.query.priority || ''),
  businessLineId: route.query.businessLineId ? Number(route.query.businessLineId) : '',
  assigneeId: route.query.assigneeId ? Number(route.query.assigneeId) : '',
  sprintId: route.query.sprintId ? Number(route.query.sprintId) : '',
  keyword: String(route.query.keyword || ''),
})
const linearBusinessLineOptions = computed<LnOption[]>(() => businessLineOptions.value.map(item => ({ label: item.label, value: String(item.value), icon: 'business' })))
const linearAssigneeOptions = computed<LnOption[]>(() => assigneeOptions.value.map(item => ({ label: item.label, value: String(item.value), icon: 'user' })))
const linearSprintOptions = computed<LnOption[]>(() => sprintOptions.value.map(item => ({ label: item.label, value: String(item.value), icon: 'sprint' })))
const queryBusinessLineValue = computed({
  get: () => String(queryForm.businessLineId || ''),
  set: (value: string) => { queryForm.businessLineId = optionValue(businessLineOptions.value, value) },
})
const queryAssigneeValue = computed({
  get: () => String(queryForm.assigneeId || ''),
  set: (value: string) => { queryForm.assigneeId = optionValue(assigneeOptions.value, value) },
})
const querySprintValue = computed({
  get: () => String(queryForm.sprintId || ''),
  set: (value: string) => { queryForm.sprintId = optionValue(sprintOptions.value, value) },
})
const totalCardCount = computed(() => columns.value.reduce((sum, column) => sum + getColumnCount(column.status), 0))
const hasFilters = computed(() => Boolean(
  queryForm.priority || queryForm.businessLineId || queryForm.assigneeId || queryForm.sprintId || queryForm.keyword,
))

function switchBoardTypeValue(value: string) {
  switchBoardType(value as BoardType)
}

function unwrapResponseData<T>(payload: any, fallback: T): T {
  if (payload == null) return fallback
  return payload.data !== undefined ? payload.data as T : payload as T
}

function optionValue(options: Array<{ value: number | string }>, value: string) {
  return options.find(item => String(item.value) === value)?.value ?? ''
}

function dedupeOptions<T extends { label: string; value: number | string }>(items: T[]): T[] {
  const seen = new Set<string>()
  return items.filter((item) => {
    const key = `${item.value}::${item.label}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('request timeout')), ms)),
  ])
}

function getCardKey(item: BoardCard) {
  return `${boardType.value}-${item.id}`
}

function ensureStatusKeys() {
  columns.value.forEach((column) => {
    if (!kanbanDataMap.value[column.status]) kanbanDataMap.value[column.status] = []
  })
}

async function rebuildColumns() {
  try {
    const res = await getKanbanColumns(boardType.value)
    columns.value = unwrapResponseData<KanbanColumn[]>(res, [])
  } catch {
    const source = boardType.value === 'product' ? PRODUCT_STATUS_MAP : RAW_STATUS_MAP
    columns.value = Object.entries(source).map(([status, statusName], sortOrder) => ({ status, statusName, sortOrder }))
  }
  ensureStatusKeys()
}

function getColumnCount(status: string) {
  return (kanbanDataMap.value[status] || []).length
}

async function loadKanbanData() {
  loading.value = true
  try {
    const params: Record<string, any> = {}
    if (queryForm.priority) params.priority = queryForm.priority
    if (queryForm.businessLineId) params.businessLineId = queryForm.businessLineId
    if (queryForm.assigneeId) params.assigneeId = queryForm.assigneeId
    if (boardType.value === 'product' && queryForm.sprintId) params.sprintId = queryForm.sprintId
    if (queryForm.keyword) params.keyword = queryForm.keyword
    const res = boardType.value === 'product'
      ? await getProductKanbanData(params)
      : await getRawKanbanData(params)
    kanbanDataMap.value = unwrapResponseData<Record<string, BoardCard[]>>(res, {})
    ensureStatusKeys()
  } catch {
    lnToast.error('加载看板数据失败')
  } finally {
    loading.value = false
  }
}

async function switchBoardType(type: BoardType) {
  if (boardType.value === type) return
  boardType.value = type
  queryForm.sprintId = ''
  await router.replace({ query: type === 'product' ? { type: 'product' } : {} })
  if (!initialized.value) return
  await loadSprintOptions()
  await rebuildColumns()
  await loadKanbanData()
}

function clearFilters() {
  Object.assign(queryForm, { priority: '', businessLineId: '', assigneeId: '', sprintId: '', keyword: '' })
  void loadKanbanData()
}

function startDrag(item: BoardCard, fromStatus: string, event: DragEvent) {
  if (movingCardKey.value) {
    event.preventDefault()
    return
  }
  draggedCard.value = { item, fromStatus }
  draggingCardKey.value = getCardKey(item)
  event.dataTransfer?.setData('text/plain', String(item.id))
  if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move'
}

function finishDrag() {
  draggingCardKey.value = ''
  dragTargetStatus.value = ''
  draggedCard.value = null
}

function handleDragLeave(status: string, event: DragEvent) {
  const currentTarget = event.currentTarget as HTMLElement
  const relatedTarget = event.relatedTarget as Node | null
  if (!relatedTarget || !currentTarget.contains(relatedTarget)) {
    if (dragTargetStatus.value === status) dragTargetStatus.value = ''
  }
}

async function dropCard(toStatus: string) {
  const payload = draggedCard.value
  dragTargetStatus.value = ''
  if (!payload || payload.fromStatus === toStatus) {
    finishDrag()
    return
  }

  const cardKey = getCardKey(payload.item)
  const source = kanbanDataMap.value[payload.fromStatus] || []
  const sourceIndex = source.findIndex(item => item.id === payload.item.id)
  if (sourceIndex < 0) return

  const [card] = source.splice(sourceIndex, 1)
  const previousStatus = card.status
  card.status = toStatus
  kanbanDataMap.value[toStatus] = [card, ...(kanbanDataMap.value[toStatus] || [])]
  movingCardKey.value = cardKey
  draggingCardKey.value = ''
  draggedCard.value = null

  try {
    await moveRequirement({
      reqType: boardType.value,
      reqId: card.id,
      fromStatus: payload.fromStatus,
      toStatus,
    })
    lnToast.success(`已移至「${columns.value.find(item => item.status === toStatus)?.statusName || toStatus}」`)
  } catch {
    kanbanDataMap.value[toStatus] = (kanbanDataMap.value[toStatus] || []).filter(item => item.id !== card.id)
    card.status = previousStatus
    source.splice(sourceIndex, 0, card)
    lnToast.error('状态更新失败，卡片已回到原位置')
  } finally {
    movingCardKey.value = ''
  }
}

function openRequirementDetail(item: BoardCard) {
  const returnContext = {
    type: boardType.value,
    priority: queryForm.priority,
    businessLineId: queryForm.businessLineId,
    assigneeId: queryForm.assigneeId,
    sprintId: queryForm.sprintId,
    keyword: queryForm.keyword,
    scrollLeft: boardScrollRef.value?.scrollLeft || 0,
  }
  sessionStorage.setItem('kanban-return-context', JSON.stringify(returnContext))
  void router.push({
    path: boardType.value === 'product' ? '/product-pool' : '/raw-pool',
    query: { focus: String(item.id), from: 'kanban' },
  })
}

function isProductCard(item: BoardCard): item is ProductRequirementVO {
  return 'workload' in item || boardType.value === 'product'
}

function getCardOwner(item: BoardCard) {
  return item.assigneeName || '-'
}

function getCardFooter(item: BoardCard) {
  return isProductCard(item) ? (item.sprintName || '未分配迭代') : (item.source || '未标记来源')
}

function getCardContextMain(item: BoardCard) {
  return isProductCard(item) ? (item.productModule || '未设模块') : (item.businessLineName || '-')
}

function getCardContextTail(item: BoardCard) {
  return isProductCard(item) ? (item.workload || '未估工') : (item.proposerName || '-')
}

async function loadBusinessLineOptions() {
  try {
    const res = await withTimeout(listDictData('business_line'), OPTION_TIMEOUT_MS)
    businessLineOptions.value = dedupeOptions(unwrapResponseData<any[]>(res, []).map(item => ({
      label: item.label,
      value: Number(item.value),
    })))
  } catch {
    businessLineOptions.value = []
  }
}

async function loadAssigneeOptions() {
  try {
    const res = await withTimeout(listDictData('product_manager'), OPTION_TIMEOUT_MS)
    assigneeOptions.value = dedupeOptions(unwrapResponseData<any[]>(res, []).map(item => ({
      label: item.label,
      value: Number(item.value) || item.value,
    })))
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
    sprintOptions.value = unwrapResponseData<any[]>(res, []).map(item => ({ label: item.name, value: item.id }))
  } catch {
    sprintOptions.value = []
  }
}

onMounted(async () => {
  void loadBusinessLineOptions()
  void loadAssigneeOptions()
  await loadSprintOptions()
  await rebuildColumns()
  await loadKanbanData()
  initialized.value = true
  const returnContext = sessionStorage.getItem('kanban-return-context')
  if (returnContext) {
    try {
      const { scrollLeft } = JSON.parse(returnContext)
      requestAnimationFrame(() => {
        if (boardScrollRef.value) boardScrollRef.value.scrollLeft = Number(scrollLeft) || 0
      })
    } catch {
      sessionStorage.removeItem('kanban-return-context')
    }
  }
})
</script>

<style scoped lang="scss">
.kanban-view {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.page-count,
.page-subtitle {
  font-size: 13px;
  color: var(--text-secondary);
}

.page-subtitle {
  margin: 0;
}

.board-panel {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.board-toolbar {
  min-height: 52px;
  padding: 9px 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid var(--border);
}

.filter-row {
  min-width: 0;
  flex: 1;
}

.filter-row :deep(.ln-select__trigger) {
  min-width: 112px;
}

.linear-board-search {
  width: 220px;
}

:deep(.linear-board-search .ln-input-wrap) {
  width: 220px;
}

.toolbar-meta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--text-tertiary);
  font-size: 11px;
  white-space: nowrap;

  button {
    border: 0;
    background: transparent;
    color: var(--ln-accent);
    cursor: pointer;
    font: inherit;
  }
}

.board-scroll {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 8px 12px 14px;
}

.board {
  min-width: max-content;
  height: 100%;
  display: flex;
  gap: 10px;
}

.linear-column-skeleton {
  width: 292px;
  min-width: 292px;
  padding: 8px 5px;
  display: grid;
  align-content: start;
  gap: 8px;
  border: 1px solid var(--ln-border);
  border-radius: 9px;
  background: rgba(35, 35, 40, .025);
}

.skeleton-column-head {
  height: 28px;
  display: flex;
  align-items: center;
  gap: 8px;
}

:deep(.ln-board-column) {
  transition: background var(--ln-fast), box-shadow var(--ln-fast);
}

:deep(.ln-board-column.is-drop-target .ln-board-column__body) {
  border-color: rgba(94, 106, 210, .5);
  background: var(--ln-accent-soft);
  box-shadow: inset 0 0 0 1px rgba(94, 106, 210, .16);
}

:deep(.ln-issue-card) {
  cursor: grab;
}

:deep(.ln-issue-card.is-dragging) {
  opacity: .46;
}

:deep(.ln-issue-card.is-moving) {
  pointer-events: none;
  opacity: .64;
}
</style>

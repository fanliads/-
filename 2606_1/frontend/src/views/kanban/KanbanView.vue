<template>
  <div class="kanban-view">
    <section class="page-header wb-page-header wb-panel">
      <div class="title-block">
        <div class="title-row wb-title-row">
          <h2 class="page-title wb-page-title">看板视图</h2>
          <span class="page-count wb-page-meta">{{ activeTab === 'kanban' ? `${totalCardCount} 项` : '多视图入口' }}</span>
        </div>
        <p class="page-subtitle wb-page-subtitle">
          {{ activeTab === 'kanban'
            ? '把看板作为对象工作区的另一种扫读方式。'
            : '保留其他视图能力，并逐步拉回统一工作台语言。'
          }}
        </p>
      </div>

      <LnTabs class="view-tabs" :model-value="activeTab" :options="tabOptions" aria-label="工作台视图" @update:model-value="selectTab" />
    </section>

    <template v-if="activeTab === 'kanban'">
      <section class="summary-strip wb-summary-strip">
        <div class="summary-pill wb-summary-pill active">
          <span class="summary-label wb-summary-label">当前视角</span>
          <span class="summary-value wb-summary-value small">{{ boardType === 'product' ? '产品需求' : '原始需求' }}</span>
        </div>
        <div class="summary-pill wb-summary-pill">
          <span class="summary-label wb-summary-label">总需求数</span>
          <span class="summary-value wb-summary-value">{{ totalCardCount }}</span>
        </div>
        <div class="summary-pill wb-summary-pill">
          <span class="summary-label wb-summary-label">筛选状态</span>
          <span class="summary-value wb-summary-value small">{{ hasFilters ? '已应用筛选' : '查看全部' }}</span>
        </div>
      </section>

      <section class="workspace-shell wb-shell">
        <div class="board-panel wb-panel">
          <div class="board-toolbar wb-panel-toolbar">
            <LnTabs class="board-type-switch" :model-value="boardType" :options="boardTypeOptions" variant="segmented" aria-label="需求类型" @update:model-value="switchBoardTypeValue" />

            <div class="filter-row wb-actions-row">
              <LnSelect v-model="queryForm.priority" :options="priorityOptions" placeholder="优先级" clearable @change="loadKanbanData" />
              <LnSelect v-model="queryBusinessLineValue" :options="linearBusinessLineOptions" placeholder="业务线" searchable clearable @change="loadKanbanData" />
              <LnSelect v-model="queryAssigneeValue" :options="linearAssigneeOptions" placeholder="负责人" searchable clearable @change="loadKanbanData" />
              <LnSelect v-if="boardType === 'product'" v-model="querySprintValue" :options="linearSprintOptions" placeholder="迭代" searchable clearable @change="loadKanbanData" />
              <LnInput v-model="queryForm.keyword" class="linear-board-search" placeholder="搜索需求编号、标题..." clearable @keydown.enter="loadKanbanData"><template #prefix>⌕</template></LnInput>
            </div>
          </div>

          <div v-if="loading" class="board-scroll"><div class="board"><div v-for="column in 4" :key="column" class="linear-column-skeleton"><div class="skeleton-column-head"><LnSkeleton circle width="9px"/><LnSkeleton width="70px"/></div><LnSkeleton v-for="card in 4" :key="card" height="126px"/></div></div></div>

          <div v-else class="board-scroll">
            <div class="board">
              <LnBoardColumn v-for="(column,index) in columns" :key="column.status" :title="column.statusName" :count="getColumnCount(column.status)" :color="columnColors[index % columnColors.length]">
                  <LnIssueCard
                    v-for="item in (kanbanDataMap[column.status] || [])"
                    :key="getCardKey(item)"
                    :req-no="item.reqNo" :title="item.title" :type-label="boardType === 'product' ? '产品需求' : '原始需求'" :priority="item.priority || 'P2'"
                    :context-main="getCardContextMain(item)" :context-tail="getCardContextTail(item)" :footer="getCardFooter(item)" :owner="getCardOwner(item)"
                    :selected="selectedCardKey === getCardKey(item)"
                    @click="selectCard(item)"
                  />
              </LnBoardColumn>
            </div>
          </div>
        </div>

        <aside class="detail-panel wb-panel">
          <template v-if="selectedCard">
            <div class="detail-scroll wb-detail-scroll">
              <div class="detail-header">
                <div class="detail-id">{{ selectedCard.reqNo }}</div>
                <h3 class="detail-title wb-detail-title">{{ selectedCard.title }}</h3>
                <div class="detail-tags">
                  <span class="status-tag">{{ selectedCard.statusName || selectedCard.status }}</span>
                  <span class="priority-pill" :class="`priority-${(selectedCard.priority || 'p2').toLowerCase()}`">{{ selectedCard.priority || 'P2' }}</span>
                  <span class="meta-chip">{{ boardType === 'product' ? '产品需求' : '原始需求' }}</span>
                </div>
                <div class="detail-meta-line">
                  <span class="detail-meta-item">负责人 {{ getCardOwner(selectedCard) }}</span>
                  <span class="detail-meta-sep">·</span>
                  <span class="detail-meta-item">业务线 {{ getCardBusinessLine(selectedCard) }}</span>
                  <span class="detail-meta-sep">·</span>
                  <span class="detail-meta-item">{{ boardType === 'product' ? '迭代' : '来源' }} {{ getCardFooter(selectedCard) }}</span>
                </div>
              </div>

              <div class="detail-facts wb-detail-facts">
                <div class="detail-fact wb-detail-fact">
                  <span>业务线</span>
                  <strong>{{ getCardBusinessLine(selectedCard) }}</strong>
                </div>
                <div class="detail-fact wb-detail-fact">
                  <span>负责人</span>
                  <strong>{{ getCardOwner(selectedCard) }}</strong>
                </div>
                <div class="detail-fact wb-detail-fact">
                  <span>{{ boardType === 'product' ? '迭代' : '来源' }}</span>
                  <strong>{{ getCardFooter(selectedCard) }}</strong>
                </div>
                <div class="detail-fact wb-detail-fact">
                  <span>{{ boardType === 'product' ? '模块 / 工作量' : '提出人' }}</span>
                  <strong>{{ getSecondaryDetail(selectedCard) }}</strong>
                </div>
              </div>

              <div class="info-section wb-section surface-section primary-section">
                <div class="section-head wb-section-head">
                  <div class="section-title wb-section-title">详情概览</div>
                  <div class="section-note wb-section-note">只补齐当前卡片最关键的上下文。</div>
                </div>
                <div class="info-grid">
                  <div class="info-item wb-info-item">
                    <span class="info-label">负责人</span>
                    <span class="info-value">{{ getCardOwner(selectedCard) }}</span>
                  </div>
                  <div class="info-item wb-info-item">
                    <span class="info-label">业务线</span>
                    <span class="info-value">{{ getCardBusinessLine(selectedCard) }}</span>
                  </div>
                  <div class="info-item wb-info-item">
                    <span class="info-label">状态</span>
                    <span class="info-value">{{ selectedCard.statusName || selectedCard.status }}</span>
                  </div>
                  <div class="info-item wb-info-item">
                    <span class="info-label">{{ boardType === 'product' ? '迭代' : '来源' }}</span>
                    <span class="info-value">{{ getCardFooter(selectedCard) }}</span>
                  </div>
                  <div class="info-item wb-info-item">
                    <span class="info-label">预计时间</span>
                    <span class="info-value">{{ formatDate(selectedCard.expectedDate) }}</span>
                  </div>
                  <div class="info-item wb-info-item">
                    <span class="info-label">{{ boardType === 'product' ? '模块 / 工作量' : '提出人' }}</span>
                    <span class="info-value">{{ getSecondaryDetail(selectedCard) }}</span>
                  </div>
                </div>
              </div>

              <div class="info-section wb-section surface-section soft-section">
                <div class="section-head wb-section-head">
                  <div class="section-title wb-section-title">推进判断</div>
                  <div class="section-note wb-section-note">帮助快速判断它现在更像阻塞、处理中还是待补充。</div>
                </div>
                <div class="insight-card">
                  <div class="insight-title">{{ getCardInsightTitle(selectedCard) }}</div>
                  <p class="insight-copy">{{ getCardInsightCopy(selectedCard) }}</p>
                </div>
              </div>

              <div class="info-section wb-section">
                <div class="section-head wb-section-head">
                  <div class="section-title wb-section-title">描述</div>
                  <div class="section-note wb-section-note">保持连续阅读，不把看板扩展成过重管理页。</div>
                </div>
                <p class="section-copy">{{ selectedCard.description || '当前卡片未补充详细描述。' }}</p>
              </div>
            </div>
          </template>

          <LnEmptyState v-else title="选择一张卡片" description="右侧详情区只承担聚焦阅读，横向流转仍然留在左侧看板中完成。" />
        </aside>
      </section>
    </template>

    <div v-else class="sub-view-shell">
      <div class="sub-view-head">
        <div class="sub-view-title">{{ tabs.find((item) => item.key === activeTab)?.label }}</div>
        <div class="sub-view-copy">保留原有能力，后续我们再逐个拉回这套统一工作台结构。</div>
      </div>
      <div class="sub-view-wrapper">
        <component :is="tabComponentMap[activeTab]" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, defineAsyncComponent, type Component, computed } from 'vue'
import dayjs from 'dayjs'
import { getKanbanColumns, getProductKanbanData, getRawKanbanData } from '@/api/kanban'
import { listDictData } from '@/api/dict'
import { listSprintOptions } from '@/api/sprint'
import { PRODUCT_STATUS_MAP, RAW_STATUS_MAP } from '@/types/requirement'
import type { KanbanColumn, ProductRequirementVO, RawRequirementVO } from '@/types/kanban'
import { lnToast, LnBoardColumn, LnEmptyState, LnInput, LnIssueCard, LnSelect, LnSkeleton, LnTabs, type LnOption, type LnTabOption } from '@/components/linear'

type TabKey = 'kanban' | 'priority' | 'pm-tasks' | 'progress' | 'list' | 'calendar'
type BoardType = 'product' | 'raw'
type BoardCard = ProductRequirementVO | RawRequirementVO

const tabs: { key: TabKey; label: string }[] = [
  { key: 'kanban', label: '看板' },
  { key: 'priority', label: '优先级' },
  { key: 'pm-tasks', label: 'PM任务' },
  { key: 'progress', label: '进度看板' },
  { key: 'list', label: '列表视图' },
  { key: 'calendar', label: '日历视图' },
]
const tabOptions: LnTabOption[] = tabs.map((tab) => ({ label: tab.label, value: tab.key }))

const tabComponentMap: Record<string, Component> = {
  priority: defineAsyncComponent(() => import('@/views/priority/PriorityView.vue')),
  'pm-tasks': defineAsyncComponent(() => import('@/views/pm-tasks/PmTasksView.vue')),
  progress: defineAsyncComponent(() => import('@/views/progress/ProgressView.vue')),
  list: defineAsyncComponent(() => import('@/views/list/ListView.vue')),
  calendar: defineAsyncComponent(() => import('@/views/calendar/CalendarView.vue')),
}

const activeTab = ref<TabKey>('kanban')
const boardType = ref<BoardType>('raw')
const boardTypeOptions: LnTabOption[] = [{ label: '产品需求', value: 'product' }, { label: '原始需求', value: 'raw' }]

function selectTab(value: string) { activeTab.value = value as TabKey }
function switchBoardTypeValue(value: string) { switchBoardType(value as BoardType) }

const loading = ref(true)
let initialized = false

const queryForm = reactive<Record<string, any>>({
  priority: '',
  businessLineId: '',
  assigneeId: '',
  sprintId: '',
  keyword: '',
})

const columns = ref<KanbanColumn[]>([])
const kanbanDataMap = ref<Record<string, Array<BoardCard>>>({})
const businessLineOptions = ref<{ label: string; value: number }[]>([])
const assigneeOptions = ref<{ label: string; value: number | string }[]>([])
const sprintOptions = ref<{ label: string; value: number }[]>([])
const selectedCardKey = ref('')
const OPTION_TIMEOUT_MS = 5000
const columnColors = ['#9b9ba4', '#d28b36', '#5e6ad2', '#2f9e6f', '#d05757', '#6f6f78']
const priorityOptions: LnOption[] = [
  { label:'P0',value:'P0',color:'#d05757' },{ label:'P1',value:'P1',color:'#d28b36' },
  { label:'P2',value:'P2',color:'#5e6ad2' },{ label:'P3',value:'P3',color:'#6f6f78' },
]
const linearBusinessLineOptions = computed<LnOption[]>(() => businessLineOptions.value.map(item => ({ label:item.label,value:String(item.value),icon:'◇' })))
const linearAssigneeOptions = computed<LnOption[]>(() => assigneeOptions.value.map(item => ({ label:item.label,value:String(item.value),icon:'◉' })))
const linearSprintOptions = computed<LnOption[]>(() => sprintOptions.value.map(item => ({ label:item.label,value:String(item.value),icon:'◆' })))
function optionValue(options:{value:number|string}[], value:string){ return options.find(item=>String(item.value)===value)?.value ?? '' }
const queryBusinessLineValue = computed({get:()=>String(queryForm.businessLineId||''),set:(value:string)=>{queryForm.businessLineId=optionValue(businessLineOptions.value,value)}})
const queryAssigneeValue = computed({get:()=>String(queryForm.assigneeId||''),set:(value:string)=>{queryForm.assigneeId=optionValue(assigneeOptions.value,value)}})
const querySprintValue = computed({get:()=>String(queryForm.sprintId||''),set:(value:string)=>{queryForm.sprintId=optionValue(sprintOptions.value,value)}})

const totalCardCount = computed(() => columns.value.reduce((sum, column) => sum + getColumnCount(column.status), 0))
const hasFilters = computed(() =>
  Boolean(queryForm.priority || queryForm.businessLineId || queryForm.assigneeId || queryForm.sprintId || queryForm.keyword)
)
const selectedCard = computed(() => flattenCards().find((item) => getCardKey(item) === selectedCardKey.value) || null)

function unwrapResponseData<T>(payload: any, fallback: T): T {
  if (payload == null) return fallback
  if (payload.data !== undefined) return payload.data as T
  return payload as T
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

function flattenCards() {
  return columns.value.flatMap((column) => kanbanDataMap.value[column.status] || [])
}

function ensureStatusKeys() {
  for (const col of columns.value) {
    if (!kanbanDataMap.value[col.status]) {
      kanbanDataMap.value[col.status] = []
    }
  }
}

function ensureSelectedCard() {
  const cards = flattenCards()
  if (cards.length === 0) {
    selectedCardKey.value = ''
    return
  }

  const exists = cards.some((item) => getCardKey(item) === selectedCardKey.value)
  if (!exists) {
    selectedCardKey.value = getCardKey(cards[0])
  }
}

function selectCard(item: BoardCard) {
  selectedCardKey.value = getCardKey(item)
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

    const res: any = boardType.value === 'product'
      ? await getProductKanbanData(params)
      : await getRawKanbanData(params)
    kanbanDataMap.value = unwrapResponseData<Record<string, Array<BoardCard>>>(res, {})
    ensureStatusKeys()
    ensureSelectedCard()
  } catch {
    lnToast.error('加载看板数据失败')
  } finally {
    loading.value = false
  }
}

function switchBoardType(type: BoardType) {
  if (boardType.value === type) return
  boardType.value = type
  selectedCardKey.value = ''
  queryForm.sprintId = ''
  if (!initialized) return
  loadSprintOptions()
  rebuildColumns().then(loadKanbanData)
}

async function loadBusinessLineOptions() {
  try {
    const res = await withTimeout(listDictData('business_line'), OPTION_TIMEOUT_MS)
    businessLineOptions.value = dedupeOptions(unwrapResponseData<any[]>(res, []).map((item: any) => ({
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
    assigneeOptions.value = dedupeOptions(unwrapResponseData<any[]>(res, []).map((item: any) => ({
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
    sprintOptions.value = unwrapResponseData<any[]>(res, []).map((item: any) => ({
      label: item.name,
      value: item.id,
    }))
  } catch {
    sprintOptions.value = []
  }
}

function isProductCard(item: BoardCard): item is ProductRequirementVO {
  return 'workload' in item || boardType.value === 'product'
}

function getCardOwner(item: BoardCard) {
  return item.assigneeName || '-'
}

function getCardBusinessLine(item: BoardCard) {
  return item.businessLineName || '-'
}

function getCardFooter(item: BoardCard) {
  if (isProductCard(item)) {
    return item.sprintName || '未分配迭代'
  }
  return item.source || '未标记来源'
}

function getCardContextMain(item: BoardCard) {
  if (isProductCard(item)) {
    return item.productModule || '未设模块'
  }
  return getCardBusinessLine(item)
}

function getCardContextTail(item: BoardCard) {
  if (isProductCard(item)) {
    return item.workload || '未估工'
  }
  return getSecondaryDetail(item)
}

function getSecondaryDetail(item: BoardCard) {
  if (isProductCard(item)) {
    const module = item.productModule || '未设置模块'
    const workload = item.workload || '未估工'
    return `${module} / ${workload}`
  }
  return item.proposerName || '-'
}

function getCardInsightTitle(item: BoardCard) {
  if (item.priority === 'P0') return '高优先级关注项'
  if (item.status === 'backlog' || item.status === 'researching' || item.statusName?.includes('待')) return '待进一步推进'
  if (item.status === 'online' || item.statusName?.includes('上线')) return '已进入结果态'
  return '处理中对象'
}

function getCardInsightCopy(item: BoardCard) {
  const owner = getCardOwner(item)
  const businessLine = getCardBusinessLine(item)
  const footer = getCardFooter(item)

  if (isProductCard(item)) {
    return `当前由 ${owner} 跟进，归属 ${businessLine}，主要承接在 ${footer}。如果这张卡片仍停留在早期状态，优先确认模块范围、工作量和迭代承接关系是否已经收敛。`
  }

  return `当前对象归属 ${businessLine}，来源为 ${footer}。如果它仍停在前置判断状态，优先确认基础信息是否齐全，以及是否已经满足承接或拆分条件。`
}

function formatDate(value?: string) {
  if (!value) return '-'
  return dayjs(value).format('MM-DD HH:mm')
}

onMounted(async () => {
  void loadBusinessLineOptions()
  void loadAssigneeOptions()
  void loadSprintOptions()
  await rebuildColumns()
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

.summary-pill {
  &.active {
    border-color: rgba(0, 113, 227, 0.18);
    background: linear-gradient(180deg, rgba(0, 113, 227, 0.06) 0%, rgba(255, 255, 255, 0.96) 100%);
  }
}

.summary-label {
  display: block;
  margin-bottom: 6px;
  font-size: 12px;
  color: var(--text-secondary);
}

.summary-value {
  font-size: 24px;
  line-height: 1;
  font-weight: 700;
  color: var(--text-primary);

  &.small {
    font-size: 18px;
  }
}

.workspace-shell {
  grid-template-columns: minmax(0, 1fr) 380px;
}

.board-panel,
.detail-panel,
.sub-view-shell {
  min-height: 0;
}

.board-panel {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.board-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 16px 18px 12px;
  border-bottom: 1px solid var(--border);
}

.native-select {
  min-width: 92px;
}

.search-box {
  width: 190px;
}

.linear-board-search { width: 210px; }
:deep(.linear-board-search .ln-input-wrap) { width: 210px; }
.filter-row :deep(.ln-select__trigger) { min-width: 112px; }
.linear-column-skeleton { width: 292px; min-width: 292px; padding: 8px 5px; display: grid; align-content: start; gap: 8px; border: 1px solid var(--ln-border); border-radius: 9px; background: rgba(35,35,40,.025); }
.skeleton-column-head { height: 28px; display: flex; align-items: center; gap: 8px; }
.detail-panel :deep(.ln-empty-state) { height: 100%; }

.board-loading,
.detail-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 280px;
  gap: 8px;
  color: var(--text-secondary);
}

.board-scroll {
  flex: 1;
  overflow: auto;
  padding: 14px 18px 18px;
}

.board {
  display: flex;
  gap: 16px;
  min-width: max-content;
  height: 100%;
}

.column {
  width: 296px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-shrink: 0;
}

.column-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px;
}

.column-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
}

.column-count {
  border-radius: 999px;
  padding: 4px 10px;
  border: 1px solid rgba(17, 24, 39, 0.08);
  background: rgba(255, 255, 255, 0.86);
  font-size: 12px;
  color: var(--text-secondary);
}

.card-top,
.card-bottom,
.detail-tags {
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-top {
  flex-wrap: wrap;
}

.card-prefix {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.card-flags {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.card-req-no,
.card-bottom,
.card-context-line {
  font-size: 12px;
  color: var(--text-secondary);
}

.card-req-no {
  color: #7b8595;
  letter-spacing: 0.015em;
}

.card-meta-text {
  display: inline-flex;
  align-items: center;
  min-height: 16px;
  padding: 0 6px;
  border-radius: 999px;
  background: rgba(17, 24, 39, 0.04);
  font-size: 10px;
  font-weight: 700;
  color: var(--text-secondary);
}

.card-title {
  margin: 7px 0 8px;
  font-size: 13.5px;
  line-height: 1.48;
  font-weight: 650;
  color: var(--text-primary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-context-line {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  margin-bottom: 7px;
  flex-wrap: wrap;
}

.context-main,
.context-tail,
.card-bottom-main,
.card-bottom-side {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.context-main,
.card-bottom-main {
  color: var(--text-primary);
}

.context-tail,
.card-bottom-side {
  color: var(--text-secondary);
}

.context-sep {
  color: rgba(148, 163, 184, 0.82);
}

.card-bottom {
  padding-top: 8px;
  border-top: 1px solid rgba(17, 24, 39, 0.05);
}

.card-bottom-main,
.card-bottom-side {
  min-width: 0;
}

.column-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 120px;
  border-radius: 16px;
  border: 1px dashed rgba(0, 0, 0, 0.08);
  color: var(--text-secondary);
  font-size: 13px;
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

.detail-id {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.status-tag,
.priority-pill,
.meta-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  font-size: 11px;
  padding: 4px 8px;
}

.status-tag {
  border: 1px solid rgba(17, 24, 39, 0.08);
  background: rgba(255, 255, 255, 0.88);
  color: var(--text-primary);
}

.priority-pill,
.meta-chip {
  border: 1px solid rgba(17, 24, 39, 0.08);
  background: rgba(255, 255, 255, 0.88);
  color: var(--primary);
}

.priority-p0 {
  background: rgba(255, 59, 48, 0.12);
  color: #c0392b;
}

.priority-p1 {
  background: rgba(255, 149, 0, 0.12);
  color: #b56a00;
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

.surface-section .info-grid,
.surface-section .insight-card {
  margin-top: 12px;
  padding: 12px 12px 4px;
  border-radius: 14px;
  border: 1px solid rgba(17, 24, 39, 0.05);
  background: rgba(248, 250, 252, 0.72);
}

.soft-section .info-grid,
.soft-section .insight-card {
  background: rgba(246, 248, 251, 0.88);
}

.section-copy {
  margin: 0;
  font-size: 13px;
  line-height: 1.7;
  color: var(--text-secondary);
}

.insight-card {
  padding: 12px 0 0;
  border: none;
  border-top: 1px dashed rgba(17, 24, 39, 0.08);
  border-radius: 0;
  background: transparent;
}

.insight-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-primary);
}

.insight-copy {
  margin: 8px 0 0;
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

.sub-view-shell {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sub-view-head {
  padding: 18px 20px 14px;
  border-bottom: 1px solid var(--border);
}

.sub-view-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 6px;
}

.sub-view-copy {
  font-size: 12px;
  color: var(--text-secondary);
}

.sub-view-wrapper {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

.empty-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.empty-copy {
  font-size: 13px;
  color: var(--text-secondary);
  max-width: 240px;
  text-align: center;
  line-height: 1.7;
}

@media (max-width: 1280px) {
  .workspace-shell {
    grid-template-columns: 1fr;
  }

  .detail-panel {
    min-height: 320px;
  }
}

@media (max-width: 768px) {
  .board-toolbar {
    flex-direction: column;
    align-items: flex-start;
  }

  .filter-row {
    justify-content: flex-start;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .column {
    width: 260px;
  }
}
</style>

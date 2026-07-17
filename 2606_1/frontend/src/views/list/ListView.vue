<template>
  <div class="list-view">
    <section class="page-header wb-page-header">
      <div class="title-block">
        <div class="title-row wb-title-row">
          <h2 class="page-title wb-page-title">列表视图</h2>
          <span class="page-count wb-page-meta">{{ total }} 条</span>
          <span class="page-hint wb-page-meta">高密度扫视全部原始需求</span>
        </div>
        <p class="page-subtitle wb-page-subtitle">把传统表格改成更紧凑的列表工作台，减少噪音列，把详情放到右侧聚焦区。</p>
      </div>

      <div class="header-actions wb-actions-row">
        <LnInput
          v-model="queryForm.keyword"
          class="line-search"
          placeholder="搜索编号、标题或描述"
          clearable
          @keydown.enter="handleSearch"
        ><template #prefix>⌕</template></LnInput>
        <LnButton variant="ghost" @click="handleReset">清空筛选</LnButton>
        <LnButton variant="primary" @click="router.push('/submit')"><template #icon>＋</template>新建需求</LnButton>
      </div>
    </section>

    <section class="filter-strip wb-filter-strip">
      <LnSelect v-model="queryForm.status" :options="statusOptions" placeholder="全部状态" clearable @change="handleSearch" />
      <LnSelect v-model="queryForm.priority" :options="priorityOptions" placeholder="全部优先级" clearable @change="handleSearch" />
      <LnSelect v-model="queryForm.source" :options="sourceOptions" placeholder="全部来源" clearable @change="handleSearch" />
      <LnBadge v-if="activeFilterCount" tone="accent">{{ activeFilterCount }} 个筛选条件</LnBadge>
    </section>

    <section class="workspace-shell wb-shell">
      <div class="list-panel wb-panel">
        <div class="list-header wb-list-header row-grid">
          <div class="head-cell title-head">需求</div>
          <div class="head-cell">状态</div>
          <div class="head-cell">优先级</div>
          <div class="head-cell">来源</div>
          <div class="head-cell">负责人</div>
          <div class="head-cell">创建时间</div>
        </div>

        <div v-if="loading" class="loading-list" aria-label="正在加载需求">
          <div v-for="index in 6" :key="index" class="loading-row row-grid">
            <div class="loading-title"><LnSkeleton :width="`${48 + index * 4}%`"/><LnSkeleton width="78%"/></div>
            <LnSkeleton width="64px"/><LnSkeleton width="50px"/><LnSkeleton width="70px"/><LnSkeleton width="64px"/><LnSkeleton width="82px"/>
          </div>
        </div>

        <LnPressable
          v-for="row in tableData"
          v-else
          :key="row.id"
          class="list-row wb-list-row row-grid"
          :selected="selectedRequirementId === row.id"
          :aria-label="`查看需求 ${row.reqNo} ${row.title}`"
          @click="selectRequirement(row)"
        >
          <div class="cell title-cell">
            <div class="title-meta">
              <span class="req-no">{{ row.reqNo }}</span>
              <span v-if="row.isUrgent === 1" class="meta-chip urgent">加急</span>
              <span v-if="row.submitOrigin === 'external'" class="meta-chip">外部提报</span>
            </div>
            <div class="title-text">{{ row.title }}</div>
            <div class="title-subline">{{ row.description || row.projectName || '暂无补充描述' }}</div>
          </div>

          <div class="cell">
            <span class="status-tag" :class="getStatusClass(row.status, row.statusName)">
              {{ getRawRequirementStatusLabel(row.status, row.statusName) }}
            </span>
          </div>

          <div class="cell">
            <span class="priority-pill" :class="`priority-${(row.effectiveLevel || row.priority || 'p2').toLowerCase()}`">
              {{ row.effectiveLevel || row.priority || '-' }}
            </span>
          </div>

          <div class="cell text-muted">{{ SOURCE_MAP[row.source] || row.source || '-' }}</div>
          <div class="cell text-muted">{{ row.assigneeName || row.proposer || '-' }}</div>
          <div class="cell text-muted">{{ formatDate(row.createTime) }}</div>
        </LnPressable>

        <LnEmptyState v-if="tableData.length === 0 && !loading" title="没有匹配的需求" description="调整搜索或筛选条件后重试。">
          <LnButton v-if="activeFilterCount || queryForm.keyword" size="small" @click="handleReset">清空筛选</LnButton>
        </LnEmptyState>

        <div class="pagination-line">
          <LnPagination v-model:page="queryForm.page" v-model:page-size="queryForm.size" :page-sizes="[10, 20, 50]" :total="total" @change="loadData" />
        </div>
      </div>

      <aside class="detail-panel wb-panel">
        <template v-if="selectedRequirement">
          <div class="detail-scroll wb-detail-scroll">
            <div class="detail-header">
              <div class="detail-id">{{ selectedRequirement.reqNo }}</div>
              <h3 class="detail-title wb-detail-title">{{ selectedRequirement.title }}</h3>
              <div class="detail-tags">
                <span class="status-tag" :class="getStatusClass(selectedRequirement.status, selectedRequirement.statusName)">
                  {{ getRawRequirementStatusLabel(selectedRequirement.status, selectedRequirement.statusName) }}
                </span>
                <span class="priority-pill" :class="`priority-${(selectedRequirement.effectiveLevel || selectedRequirement.priority || 'p2').toLowerCase()}`">
                  {{ selectedRequirement.effectiveLevel || selectedRequirement.priority || '-' }}
                </span>
                <span v-if="selectedRequirement.isUrgent === 1" class="meta-chip urgent">加急</span>
              </div>
            </div>

            <div class="info-section">
              <div class="section-title">基础信息</div>
              <div class="info-grid">
                <div class="info-item wb-info-item">
                  <span class="info-label">来源</span>
                  <span class="info-value">{{ SOURCE_MAP[selectedRequirement.source] || selectedRequirement.source || '-' }}</span>
                </div>
                <div class="info-item wb-info-item">
                  <span class="info-label">业务线</span>
                  <span class="info-value">{{ selectedRequirement.businessLineName || '-' }}</span>
                </div>
                <div class="info-item wb-info-item">
                  <span class="info-label">负责人</span>
                  <span class="info-value">{{ selectedRequirement.assigneeName || selectedRequirement.proposer || '-' }}</span>
                </div>
                <div class="info-item wb-info-item">
                  <span class="info-label">项目名称</span>
                  <span class="info-value">{{ selectedRequirement.projectName || '-' }}</span>
                </div>
                <div class="info-item wb-info-item">
                  <span class="info-label">期望日期</span>
                  <span class="info-value">{{ formatDate(selectedRequirement.expectedDate) }}</span>
                </div>
                <div class="info-item wb-info-item">
                  <span class="info-label">更新时间</span>
                  <span class="info-value">{{ formatDateTime(selectedRequirement.updateTime) }}</span>
                </div>
              </div>
            </div>

            <div class="info-section">
              <div class="section-title">描述</div>
              <p class="section-copy">{{ selectedRequirement.description || '暂无描述' }}</p>
            </div>

            <div class="info-section" v-if="selectedRequirement.strategyHint">
              <div class="section-title">优先级提示</div>
              <p class="section-copy">{{ selectedRequirement.strategyHint }}</p>
            </div>
          </div>
        </template>

        <LnEmptyState v-else title="选择一条需求" description="左侧专注于连续扫视，右侧承接上下文阅读和判断确认。" />
      </aside>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { pageQueryRawRequirements } from '@/api/raw-requirement'
import type { RawRequirementListVO } from '@/types/requirement'
import { LnBadge, LnButton, LnEmptyState, LnInput, LnPagination, LnPressable, LnSelect, LnSkeleton, type LnOption } from '@/components/linear'
import {
  RAW_STATUS_MAP,
  PRIORITY_MAP,
  SOURCE_MAP,
  getRawRequirementStatusClass,
  getRawRequirementStatusLabel,
} from '@/types/requirement'

const router = useRouter()

const queryForm = reactive({
  page: 1,
  size: 10,
  status: '',
  priority: '',
  source: '',
  keyword: '',
  sortField: '',
  sortOrder: '',
})

const loading = ref(false)
const tableData = ref<RawRequirementListVO[]>([])
const total = ref(0)
const selectedRequirementId = ref<number | null>(null)
const selectedRequirement = computed(() => tableData.value.find((item) => item.id === selectedRequirementId.value) || null)
const statusOptions: LnOption[] = Object.entries(RAW_STATUS_MAP).map(([value, label]) => ({ value, label }))
const priorityOptions: LnOption[] = Object.entries(PRIORITY_MAP).map(([value, label]) => ({ value, label }))
const sourceOptions: LnOption[] = Object.entries(SOURCE_MAP).map(([value, label]) => ({ value, label }))
const activeFilterCount = computed(() => [queryForm.status, queryForm.priority, queryForm.source].filter(Boolean).length)

function getStatusClass(status: string, statusName?: string): string {
  const rawClass = getRawRequirementStatusClass(status, statusName)
  const map: Record<string, string> = {
    'status-pending': 'status-eval',
    'status-split': 'status-dev',
    'status-progress': 'status-dev',
    'status-online': 'status-closed',
    'status-suspended': 'status-eval',
    'status-rejected': 'status-reject',
    'status-closed': 'status-closed',
  }
  return map[rawClass] || 'status-eval'
}

function formatDate(dt?: string): string {
  if (!dt) return '-'
  return dt.substring(0, 10)
}

function formatDateTime(dt?: string): string {
  if (!dt) return '-'
  return dt.substring(0, 16).replace('T', ' ')
}

function ensureSelectedRequirement() {
  if (!tableData.value.length) {
    selectedRequirementId.value = null
    return
  }
  const exists = tableData.value.some((item) => item.id === selectedRequirementId.value)
  if (!exists) {
    selectedRequirementId.value = tableData.value[0].id
  }
}

function selectRequirement(row: RawRequirementListVO) {
  selectedRequirementId.value = row.id
}

async function loadData() {
  loading.value = true
  try {
    const res = await pageQueryRawRequirements(queryForm)
    const data = res.data
    tableData.value = data.list || []
    total.value = data.total || 0
    ensureSelectedRequirement()
  } catch {
    tableData.value = []
    total.value = 0
    selectedRequirementId.value = null
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  queryForm.page = 1
  loadData()
}

function handleReset() {
  queryForm.page = 1
  queryForm.size = 10
  queryForm.status = ''
  queryForm.priority = ''
  queryForm.source = ''
  queryForm.keyword = ''
  loadData()
}

onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.list-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-count,
.page-hint,
.page-subtitle {
  font-size: 13px;
  color: var(--text-secondary);
}

.page-subtitle {
  margin: 0;
}

.line-search {
  width: 220px;
}

.workspace-shell {
  grid-template-columns: minmax(0, 1.2fr) 380px;
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

.row-grid {
  display: grid;
  grid-template-columns: minmax(0, 2.4fr) 108px 96px 108px 108px 112px;
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
  width: 100%;
  text-align: left;
  padding: 12px 18px;
  border: none;
  border-bottom: 1px solid var(--border);
  background: transparent;
  cursor: pointer;
  transition: var(--transition);

  &:hover {
    background: rgba(17, 24, 39, 0.022);
  }

  &.selected {
    background: rgba(59, 130, 246, 0.06);
    box-shadow: inset 2px 0 0 rgba(59, 130, 246, 0.78);
  }
}

.loading-list {
  display: grid;
}

.loading-row {
  min-height: 76px;
  padding: 12px 18px;
  border-bottom: 1px solid var(--ln-border);
}

.loading-title {
  display: grid;
  gap: 9px;
}

.cell {
  min-width: 0;
  font-size: 13px;
  color: var(--text-primary);
}

.title-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  flex-wrap: wrap;
}

.req-no,
.title-subline,
.text-muted {
  color: var(--text-secondary);
}

.req-no,
.title-subline {
  font-size: 12px;
}

.title-text {
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.title-subline {
  line-height: 1.6;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.status-tag,
.priority-pill,
.meta-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 12px;
}

.status-eval {
  background: rgba(255, 149, 0, 0.12);
  color: #b56a00;
}

.status-dev {
  background: rgba(0, 113, 227, 0.1);
  color: var(--primary);
}

.status-closed {
  background: rgba(52, 199, 89, 0.12);
  color: #1d7f42;
}

.status-reject {
  background: rgba(255, 59, 48, 0.12);
  color: #c0392b;
}

.priority-pill,
.meta-chip {
  background: rgba(0, 113, 227, 0.08);
  color: var(--primary);
}

.meta-chip.urgent,
.priority-p0 {
  background: rgba(255, 59, 48, 0.12);
  color: #c0392b;
}

.priority-p1 {
  background: rgba(255, 149, 0, 0.12);
  color: #b56a00;
}

.pagination-line {
  display: flex;
  justify-content: flex-end;
  padding: 16px 20px 18px;
}

.detail-panel {
  overflow: hidden;
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

.info-section {
  padding: 16px 0;
  border-top: 1px solid var(--border);
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
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
  max-width: 240px;
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
  .row-grid,
  .info-grid {
    grid-template-columns: minmax(0, 1fr);
    row-gap: 10px;
  }

  .list-header {
    display: none;
  }

  .line-search {
    width: 100%;
  }
}
</style>

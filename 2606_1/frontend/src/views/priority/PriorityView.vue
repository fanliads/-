<template>
  <div class="priority-view">
    <section class="page-header wb-page-header">
      <div class="title-block">
        <div class="title-row wb-title-row">
          <h2 class="page-title wb-page-title">优先级视图</h2>
          <span class="page-count wb-page-meta">{{ filteredRequirements.length }} 项</span>
          <span class="page-hint wb-page-meta">按优先级做集中判断与复核</span>
        </div>
        <p class="page-subtitle wb-page-subtitle">把优先级判断从零散卡片改成一眼可扫的分组工作台，保留重点提醒与详情确认。</p>
      </div>

      <div class="header-actions wb-actions-row">
        <LnInput v-model="searchKeyword" class="line-search" placeholder="搜索需求标题或编号" clearable><template #prefix>⌕</template></LnInput>
        <LnButton variant="primary" @click="router.push('/submit')"><template #icon>＋</template>新建需求</LnButton>
      </div>
    </section>

    <section class="summary-strip wb-summary-strip">
      <LnMetric label="P0 待关注" :value="p0Count" :tone="p0Count ? 'danger' : 'neutral'" description="需要最高优先级处理" />
      <LnMetric label="P1 高优先级" :value="getGroupCount('p1')" tone="warning" description="建议在本轮推进" />
      <LnMetric label="P2 / P3" :value="getGroupCount('p2') + getGroupCount('p3')" description="常规排期与待观察" />
    </section>

    <section class="workspace-shell wb-shell">
      <div class="groups-panel wb-panel">
        <div v-if="loading" class="groups-grid" aria-label="正在加载优先级需求">
          <div v-for="index in 4" :key="index" class="priority-group wb-group-card skeleton-group">
            <div class="group-header"><div class="skeleton-copy"><LnSkeleton width="120px"/><LnSkeleton width="190px"/></div><LnSkeleton circle width="28px"/></div>
            <div class="group-body"><LnSkeleton v-for="row in 3" :key="row" height="116px"/></div>
          </div>
        </div>
        <div v-else class="groups-grid">
          <div
            v-for="group in priorityGroups"
            :key="group.key"
            class="priority-group wb-group-card"
            :class="`group-${group.key}`"
          >
            <div class="group-header">
              <div>
                <div class="group-title">{{ group.label }}</div>
                <div class="group-subtitle">{{ group.description }}</div>
              </div>
              <LnBadge :tone="getPriorityTone(priorityKeyMap[group.key])">{{ getGroupCount(group.key) }}</LnBadge>
            </div>

            <div class="group-body">
              <LnPressable
                v-for="req in getGroupItems(group.key)"
                :key="req.id"
                class="req-card wb-item-card"
                :selected="selectedRequirementId === req.id"
                :aria-label="`查看需求 ${req.reqNo} ${req.title}`"
                @click="selectRequirement(req)"
              >
                <div class="card-top">
                  <span class="req-no">{{ req.reqNo }}</span>
                  <span class="priority-pill" :class="`priority-${(req.effectiveLevel || req.priority || 'p2').toLowerCase()}`">
                    {{ req.effectiveLevel || req.priority || '-' }}
                  </span>
                </div>

                <div class="req-title">{{ req.title }}</div>

                <div class="req-meta-row">
                  <span>{{ req.businessLineName || '-' }}</span>
                  <span>{{ req.assigneeName || req.proposer || '-' }}</span>
                </div>

                <div class="req-meta-row">
                  <span>{{ getRawRequirementStatusLabel(req.status, req.statusName) }}</span>
                  <span :class="{ overdue: isOverdue(req) }">{{ getExpectedText(req.expectedDate) }}</span>
                </div>

                <div v-if="req.strategyHint" class="req-hint">{{ req.strategyHint }}</div>
              </LnPressable>

              <LnEmptyState v-if="getGroupItems(group.key).length === 0" title="当前分组暂无需求" description="需求调整优先级后会自动出现在这里。" />
            </div>
          </div>
        </div>
      </div>

      <aside class="detail-panel wb-panel">
        <template v-if="selectedRequirement">
          <div class="detail-scroll wb-detail-scroll">
            <div class="detail-header">
              <div class="detail-id">{{ selectedRequirement.reqNo }}</div>
              <h3 class="detail-title wb-detail-title">{{ selectedRequirement.title }}</h3>
              <div class="detail-tags">
                <LnBadge :tone="getPriorityTone(selectedRequirement.effectiveLevel || selectedRequirement.priority)">
                  {{ getPriorityLabel(selectedRequirement.effectiveLevel || selectedRequirement.priority) }}
                </LnBadge>
                <LnBadge v-if="selectedRequirement.systemLevel && selectedRequirement.systemLevel !== (selectedRequirement.effectiveLevel || selectedRequirement.priority)" tone="neutral">
                  系统 {{ getPriorityLabel(selectedRequirement.systemLevel) }}
                </LnBadge>
                <LnBadge tone="accent">{{ getRawRequirementStatusLabel(selectedRequirement.status, selectedRequirement.statusName) }}</LnBadge>
              </div>
            </div>

            <div class="info-section">
              <div class="section-title">优先级判断</div>
              <div class="info-grid">
                <div class="info-item wb-info-item">
                  <span class="info-label">当前有效级别</span>
                  <span class="info-value">{{ getPriorityLabel(selectedRequirement.effectiveLevel || selectedRequirement.priority) }}</span>
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
                  <span class="info-label">期望时间</span>
                  <span class="info-value">{{ getExpectedText(selectedRequirement.expectedDate) }}</span>
                </div>
              </div>
            </div>

            <div class="info-section">
              <div class="section-title">策略提示</div>
              <p class="section-copy">{{ selectedRequirement.strategyHint || '当前需求未生成额外策略提示。' }}</p>
            </div>

            <div class="info-section">
              <div class="section-title">需求描述</div>
              <p class="section-copy">{{ selectedRequirement.description || '暂无描述' }}</p>
            </div>
          </div>
        </template>

        <LnEmptyState v-else title="选择一条需求" description="左侧负责快速扫视优先级分布，右侧负责确认单条需求的判断上下文。" />
      </aside>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import { pageQueryRawRequirements } from '@/api/raw-requirement'
import type { RawRequirementListVO } from '@/types/requirement'
import { getRawRequirementStatusLabel } from '@/types/requirement'
import { LnBadge, LnButton, LnEmptyState, LnInput, LnMetric, LnPressable, LnSkeleton } from '@/components/linear'

interface ReqItem extends RawRequirementListVO {
  workload?: string
}

const router = useRouter()
const searchKeyword = ref('')
const loading = ref(false)
const allRequirements = ref<ReqItem[]>([])
const selectedRequirementId = ref<number | null>(null)

const priorityGroups = [
  { key: 'p0', label: '一级A类（P0）', description: '需要最高优先级处理的需求' },
  { key: 'p1', label: '一级B类（P1）', description: '高优先级，但可在本轮中排队推进' },
  { key: 'p2', label: '二级（P2）', description: '常规排期，关注依赖与节奏' },
  { key: 'p3', label: '三级（P3）', description: '低优先级或待观察需求' },
]

const priorityKeyMap: Record<string, string> = {
  p0: 'P0',
  p1: 'P1',
  p2: 'P2',
  p3: 'P3',
}

const filteredRequirements = computed(() => {
  let items = allRequirements.value
  if (searchKeyword.value) {
    const kw = searchKeyword.value.toLowerCase()
    items = items.filter((r) => r.title?.toLowerCase().includes(kw) || r.reqNo?.toLowerCase().includes(kw))
  }
  return items
})

const selectedRequirement = computed(() =>
  filteredRequirements.value.find((item) => item.id === selectedRequirementId.value) || null
)

const p0Count = computed(() => filteredRequirements.value.filter((r) => (r.effectiveLevel || r.priority) === 'P0').length)

function ensureSelectedRequirement() {
  if (!filteredRequirements.value.length) {
    selectedRequirementId.value = null
    return
  }
  const exists = filteredRequirements.value.some((item) => item.id === selectedRequirementId.value)
  if (!exists) {
    selectedRequirementId.value = filteredRequirements.value[0].id
  }
}

function getGroupItems(groupKey: string): ReqItem[] {
  const priority = priorityKeyMap[groupKey]
  return filteredRequirements.value.filter((r) => (r.effectiveLevel || r.priority) === priority)
}

function getGroupCount(groupKey: string): number {
  return getGroupItems(groupKey).length
}

function getPriorityLabel(priority?: string): string {
  if (priority === 'P0') return '一级A类（P0）'
  if (priority === 'P1') return '一级B类（P1）'
  if (priority === 'P2') return '二级（P2）'
  if (priority === 'P3') return '三级（P3）'
  return priority || '-'
}

function getPriorityTone(priority?: string): 'neutral' | 'accent' | 'warning' | 'danger' {
  if (priority === 'P0') return 'danger'
  if (priority === 'P1') return 'warning'
  if (priority === 'P2') return 'accent'
  return 'neutral'
}

function isOverdue(req: ReqItem): boolean {
  if (!req.expectedDate) return false
  return dayjs(req.expectedDate).isBefore(dayjs(), 'day')
}

function getExpectedText(dt?: string): string {
  if (!dt) return '未设置时间'
  const date = dayjs(dt)
  return `期望 ${date.format('MM-DD')}`
}

function selectRequirement(req: ReqItem) {
  selectedRequirementId.value = req.id
}

async function loadData() {
  loading.value = true
  try {
    const res = await pageQueryRawRequirements({ page: 1, size: 500 })
    allRequirements.value = (res.data?.list || []) as ReqItem[]
    ensureSelectedRequirement()
  } catch {
    allRequirements.value = []
    selectedRequirementId.value = null
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})

watch(filteredRequirements, ensureSelectedRequirement)
</script>

<style lang="scss" scoped>
.priority-view {
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

.summary-pill {
  &.danger {
    border-color: rgba(255, 59, 48, 0.18);
    background: linear-gradient(180deg, rgba(255, 59, 48, 0.06) 0%, rgba(255, 255, 255, 0.96) 100%);
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
}

.workspace-shell {
  grid-template-columns: minmax(0, 1fr) 380px;
}

.groups-panel,
.detail-panel {
  min-height: 0;
}

.groups-panel {
  overflow: auto;
  padding: 18px;
}

.groups-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.skeleton-copy {
  display: grid;
  gap: 9px;
}

.skeleton-group {
  pointer-events: none;
}

.group-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.group-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.group-subtitle {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.6;
}

.group-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 28px;
  padding: 0 8px;
  border-radius: 999px;
  background: rgba(128, 128, 128, 0.08);
  font-size: 12px;
  color: var(--text-secondary);
}

.group-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
}

.card-top,
.req-meta-row,
.detail-tags {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.req-no,
.req-meta-row {
  font-size: 12px;
  color: var(--text-secondary);
}

.req-title {
  margin: 8px 0;
  font-size: 14px;
  line-height: 1.45;
  font-weight: 600;
  color: var(--text-primary);
}

.req-meta-row + .req-meta-row {
  margin-top: 6px;
}

.req-hint {
  margin-top: 10px;
  font-size: 12px;
  line-height: 1.6;
  color: var(--text-secondary);
}

.overdue {
  color: var(--danger);
  font-weight: 600;
}

.priority-pill,
.meta-chip,
.status-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 12px;
}

.priority-pill,
.meta-chip {
  background: rgba(0, 113, 227, 0.08);
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

.status-tag {
  background: rgba(77, 63, 47, 0.08);
  color: var(--text-primary);
}

.empty-group,
.detail-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  font-size: 13px;
}

.empty-group {
  min-height: 120px;
  border: 1px dashed rgba(0, 0, 0, 0.08);
  border-radius: 12px;
}

.detail-panel {
  overflow: hidden;
}

.detail-id {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 8px;
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
  .groups-grid,
  .info-grid {
    grid-template-columns: 1fr;
  }

  .line-search {
    width: 100%;
  }
}
</style>

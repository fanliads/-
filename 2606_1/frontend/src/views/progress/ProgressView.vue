<template>
  <div class="progress-view">
    <section class="page-header wb-page-header">
      <div class="title-block">
        <div class="title-row wb-title-row">
          <h2 class="page-title wb-page-title">进度看板</h2>
          <span class="page-count wb-page-meta">{{ progressItems.length }} 项</span>
          <span class="page-hint wb-page-meta">只读预览</span>
        </div>
        <p class="page-subtitle wb-page-subtitle">当前仍是静态演示数据，但已经统一成可扫视、可聚焦的工作台结构。</p>
      </div>
    </section>

    <section class="notice-strip">
      <LnCallout tone="warning" title="该页面已进入退出准备" description="正式进度管理能力后续会由主流程承接，这里暂时保留为演示视图。" />
    </section>

    <section class="summary-strip wb-summary-strip">
      <LnMetric label="高风险" :value="riskItems.length" tone="danger" description="需要立即复核" />
      <LnMetric label="平均进度" :value="avgPercent" unit="%" tone="accent" description="当前演示数据" />
      <LnMetric label="3天内到期" :value="urgentItems.length" tone="warning" description="临近计划日期" />
    </section>

    <section class="workspace-shell wb-shell">
      <div class="list-panel wb-panel">
        <div class="list-toolbar wb-panel-toolbar">
          <LnTabs v-model="activeFilter" :options="filterChips" variant="segmented" aria-label="进度筛选" />
        </div>

        <div class="card-grid">
          <LnPressable
            v-for="item in filteredItems"
            :key="item.id"
            class="progress-card"
            :class="{ risk: item.isRisk }"
            :selected="selectedItemId === item.id"
            :aria-label="`查看 ${item.title} 的进度`"
            @click="selectItem(item)"
          >
            <div class="card-header">
              <div class="card-title">{{ item.title }}</div>
              <LnBadge v-if="item.isRisk" tone="danger">高风险</LnBadge>
            </div>
            <div class="progress-row">
              <LnProgress :value="item.percent" :tone="item.isRisk ? 'danger' : 'accent'" />
            </div>
            <div class="card-meta">{{ item.statusLabel }} · 期望上线 {{ item.expectedDate }}</div>
            <div class="card-footer">
              <LnBadge>{{ item.tag }}</LnBadge>
              <span class="due-text" :class="{ urgent: item.daysLeft <= 3 }">剩余 {{ item.daysLeft }} 天</span>
            </div>
          </LnPressable>
          <LnEmptyState v-if="!filteredItems.length" title="没有匹配的进度项" description="切换筛选条件查看其他项目。" />
        </div>
      </div>

      <aside class="detail-panel wb-panel">
        <template v-if="selectedItem">
          <div class="detail-scroll wb-detail-scroll">
            <div class="detail-header">
              <div class="detail-id">演示视图</div>
              <h3 class="detail-title wb-detail-title">{{ selectedItem.title }}</h3>
              <div class="detail-tags">
                <LnBadge tone="accent">{{ selectedItem.statusLabel }}</LnBadge>
                <LnBadge>{{ selectedItem.tag }}</LnBadge>
                <LnBadge v-if="selectedItem.isRisk" tone="danger">高风险</LnBadge>
              </div>
            </div>

            <div class="hero-progress">
              <div class="hero-value">{{ selectedItem.percent }}%</div>
              <div class="hero-copy">当前进度</div>
              <LnProgress :value="selectedItem.percent" :tone="selectedItem.isRisk ? 'danger' : 'accent'" />
            </div>

            <div class="info-section">
              <div class="section-title">进度概览</div>
              <div class="info-grid">
                <div class="info-item wb-info-item">
                  <span class="info-label">当前状态</span>
                  <span class="info-value">{{ selectedItem.statusLabel }}</span>
                </div>
                <div class="info-item wb-info-item">
                  <span class="info-label">期望上线</span>
                  <span class="info-value">{{ selectedItem.expectedDate }}</span>
                </div>
                <div class="info-item wb-info-item">
                  <span class="info-label">剩余时间</span>
                  <span class="info-value">{{ selectedItem.daysLeft }} 天</span>
                </div>
                <div class="info-item wb-info-item">
                  <span class="info-label">风险状态</span>
                  <span class="info-value">{{ selectedItem.isRisk ? '高风险' : '正常' }}</span>
                </div>
              </div>
            </div>
          </div>
        </template>

        <LnEmptyState v-else title="选择一条进度项" description="左侧用于浏览整体进展，右侧聚焦单项状态与节奏风险。" />
      </aside>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import { LnBadge, LnCallout, LnEmptyState, LnMetric, LnPressable, LnProgress, LnTabs, type LnTabOption } from '@/components/linear'

interface ProgressItem {
  id: number
  title: string
  percent: number
  statusLabel: string
  expectedDate: string
  tag: string
  daysLeft: number
  isRisk: boolean
}

const progressItems = ref<ProgressItem[]>([
  { id: 1, title: '台州各区县采购平台优化', percent: 10, statusLabel: '待判定', expectedDate: '5-25', tag: '校园G端', daysLeft: 3, isRisk: true },
  { id: 2, title: '智慧食堂支付通道扩容', percent: 40, statusLabel: '设计中', expectedDate: '5-28', tag: '校园G端', daysLeft: 6, isRisk: false },
  { id: 3, title: '教育局数据报表导出功能', percent: 50, statusLabel: '研发中', expectedDate: '5-22', tag: '校园G端', daysLeft: 1, isRisk: false },
  { id: 4, title: '山东互联网+明厨亮灶项目', percent: 15, statusLabel: '待判定', expectedDate: '6-11', tag: '市监G端', daysLeft: 18, isRisk: false },
  { id: 5, title: '仓储屏UI交互改版', percent: 40, statusLabel: '设计中', expectedDate: '6-18', tag: '校园G端', daysLeft: 25, isRisk: false },
  { id: 6, title: '南昌青山湖区智慧食堂项目系统修改', percent: 10, statusLabel: '待判定', expectedDate: '5-31', tag: '校园G端', daysLeft: 9, isRisk: true },
  { id: 7, title: '供应商资质审核流程', percent: 75, statusLabel: '测试中', expectedDate: '5-20', tag: '校园G端', daysLeft: 0, isRisk: false },
  { id: 8, title: '食堂消费流水对账优化', percent: 90, statusLabel: '已上线', expectedDate: '5-18', tag: '校园G端', daysLeft: 0, isRisk: false },
])

const activeFilter = ref('all')
const selectedItemId = ref<number | null>(null)

const riskItems = computed(() => progressItems.value.filter((item) => item.isRisk))
const urgentItems = computed(() => progressItems.value.filter((item) => item.daysLeft <= 3))
const avgPercent = computed(() => Math.round(progressItems.value.reduce((sum, item) => sum + item.percent, 0) / progressItems.value.length))
const filterChips = computed<LnTabOption[]>(() => [
  { value: 'all', label: '全部', count: progressItems.value.length },
  { value: 'risk', label: '高风险', count: riskItems.value.length },
  { value: 'urgent', label: '3天内到期', count: urgentItems.value.length },
])

const filteredItems = computed(() => {
  if (activeFilter.value === 'risk') return riskItems.value
  if (activeFilter.value === 'urgent') return urgentItems.value
  return progressItems.value
})

const selectedItem = computed(() => filteredItems.value.find((item) => item.id === selectedItemId.value) || null)

function ensureSelectedItem() {
  if (!filteredItems.value.length) {
    selectedItemId.value = null
    return
  }
  const exists = filteredItems.value.some((item) => item.id === selectedItemId.value)
  if (!exists) {
    selectedItemId.value = filteredItems.value[0].id
  }
}

function selectItem(item: ProgressItem) {
  selectedItemId.value = item.id
}

onMounted(() => {
  ensureSelectedItem()
})

watch(filteredItems, ensureSelectedItem)
</script>

<style lang="scss" scoped>
.progress-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.notice-card {
  padding: 14px 16px;
  border: 1px solid rgba(255, 149, 0, 0.22);
  background: rgba(255, 149, 0, 0.08);
  border-radius: 18px;
}

.notice-title {
  font-size: 14px;
  font-weight: 600;
  color: #8a5200;
  margin-bottom: 4px;
}

.notice-copy {
  font-size: 12px;
  line-height: 1.7;
  color: #8a5200;
}

.summary-pill {
  padding: 14px 16px;
  border-radius: 18px;
  background: var(--surface);
  border: 1px solid var(--border);
  box-shadow: var(--shadow);

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

.list-panel {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chip-group,
.detail-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-chip,
.meta-chip,
.risk-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  font-size: 12px;
}

.filter-chip {
  border: 1px solid transparent;
  background: rgba(128, 128, 128, 0.08);
  color: var(--text-secondary);
  padding: 8px 12px;
  cursor: pointer;

  &.active {
    background: rgba(0, 113, 227, 0.1);
    border-color: rgba(0, 113, 227, 0.18);
    color: var(--text-primary);
  }
}

.card-grid {
  flex: 1;
  overflow-y: auto;
  padding: 18px 20px 20px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 14px;
}

.progress-card {
  text-align: left;
  border: 1px solid rgba(0, 0, 0, 0.06);
  background: #fff;
  border-radius: 18px;
  padding: 14px;
  cursor: pointer;
  transition: var(--transition);

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 10px 22px rgba(0, 0, 0, 0.07);
  }

  &.selected {
    border-color: rgba(0, 113, 227, 0.22);
    background: rgba(0, 113, 227, 0.04);
  }

  &.risk {
    border-color: rgba(255, 59, 48, 0.18);
  }
}

.card-header,
.progress-row,
.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.card-title {
  font-size: 14px;
  font-weight: 600;
  line-height: 1.45;
  color: var(--text-primary);
}

.card-risk,
.risk-chip {
  padding: 4px 8px;
  border-radius: 999px;
  background: rgba(255, 59, 48, 0.12);
  color: #c0392b;
}

.progress-row {
  margin: 14px 0 10px;
}

.progress-track {
  flex: 1;
  height: 8px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--primary) 0%, #47a7ff 100%);
}

.progress-value,
.card-meta,
.due-text,
.detail-id,
.hero-copy {
  font-size: 12px;
  color: var(--text-secondary);
}

.card-footer {
  margin-top: 12px;
}

.card-tag,
.meta-chip {
  padding: 4px 8px;
  border-radius: 999px;
  background: rgba(0, 113, 227, 0.08);
  color: var(--primary);
}

.due-text.urgent {
  color: #c0392b;
  font-weight: 600;
}

.hero-progress {
  padding: 18px;
  border-radius: 20px;
  background: linear-gradient(180deg, rgba(0, 113, 227, 0.08) 0%, rgba(255, 255, 255, 0.96) 100%);
  margin: 18px 0;
}

.hero-value {
  font-size: 36px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
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
  .detail-panel {
    min-height: 320px;
  }
}

@media (max-width: 768px) {
  .summary-strip,
  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>

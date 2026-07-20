<template>
  <div class="pm-tasks-view">
    <section class="page-header wb-page-header">
      <div class="title-block">
        <div class="title-row wb-title-row">
          <h2 class="page-title wb-page-title">PM 任务</h2>
          <span class="page-count wb-page-meta">{{ filteredPmList.length }} 位 PM</span>
          <span class="page-hint wb-page-meta">只读预览</span>
        </div>
        <p class="page-subtitle wb-page-subtitle">该页保留为历史预览入口，不再承担正式分配操作，但视觉与信息层级已统一回工作台体系。</p>
      </div>
    </section>

    <section class="notice-strip">
      <LnCallout tone="warning" title="该页面已进入退出准备" description="当前内容仅用于演示 PM 负载观察，不代表正式产品能力，也不提供持久化操作。" />
    </section>

    <section class="workspace-shell wb-shell">
      <div class="list-panel wb-panel">
        <div class="list-toolbar wb-panel-toolbar">
          <LnTabs v-model="filterPriority" :options="priorityTabs" variant="segmented" aria-label="优先级筛选" />
          <LnInput v-model="searchKeyword" class="line-search" placeholder="筛选演示数据" clearable><template #prefix><LnIcon name="search"/></template></LnInput>
        </div>

        <div class="list-header wb-list-header row-grid">
          <div class="head-cell title-head">PM / 负载</div>
          <div class="head-cell">P0</div>
          <div class="head-cell">P1</div>
          <div class="head-cell">总量</div>
          <div class="head-cell">状态</div>
        </div>

        <LnPressable
          v-for="pm in filteredPmList"
          :key="pm.id"
          class="list-row wb-list-row row-grid"
          :selected="selectedPmId === pm.id"
          :aria-label="`查看 ${pm.name} 的任务负载`"
          @click="selectPm(pm)"
        >
          <div class="cell title-cell">
            <div class="pm-inline">
              <LnAvatar :name="pm.name" :color="pm.avatarColor" :status="getAvatarStatus(pm.requirements.length)" />
              <div>
                <div class="title-text">{{ pm.name }}</div>
                <div class="title-subline">演示任务池 · {{ getLoadLabel(pm.requirements.length) }}</div>
              </div>
            </div>
          </div>
          <div class="cell">{{ getPriorityCount(pm, 'P0') }}</div>
          <div class="cell">{{ getPriorityCount(pm, 'P1') }}</div>
          <div class="cell">{{ pm.requirements.length }}</div>
          <div class="cell">
            <LnBadge :tone="getLoadTone(pm.requirements.length)">{{ getLoadLabel(pm.requirements.length) }}</LnBadge>
          </div>
        </LnPressable>
        <LnEmptyState v-if="!filteredPmList.length" title="没有匹配的 PM 任务" description="调整优先级或搜索条件后重试。" />
      </div>

      <aside class="detail-panel wb-panel">
        <template v-if="selectedPm">
          <div class="detail-scroll wb-detail-scroll">
            <div class="detail-header">
              <div class="detail-title-row">
                <LnAvatar :name="selectedPm.name" :color="selectedPm.avatarColor" :status="getAvatarStatus(selectedPm.requirements.length)" size="large" ring />
                <div>
                  <div class="detail-id">演示视图</div>
                  <h3 class="detail-title wb-detail-title">{{ selectedPm.name }}</h3>
                </div>
              </div>
              <div class="detail-tags">
                <LnBadge :tone="getLoadTone(selectedPm.requirements.length)">{{ getLoadLabel(selectedPm.requirements.length) }}</LnBadge>
                <LnBadge>只读</LnBadge>
              </div>
            </div>

            <div class="info-section">
              <div class="section-title">负载概览</div>
              <div class="info-grid">
                <div class="info-item wb-info-item">
                  <span class="info-label">总需求数</span>
                  <span class="info-value">{{ selectedPm.requirements.length }}</span>
                </div>
                <div class="info-item wb-info-item">
                  <span class="info-label">P0 数量</span>
                  <span class="info-value">{{ getPriorityCount(selectedPm, 'P0') }}</span>
                </div>
                <div class="info-item wb-info-item">
                  <span class="info-label">P1 数量</span>
                  <span class="info-value">{{ getPriorityCount(selectedPm, 'P1') }}</span>
                </div>
                <div class="info-item wb-info-item">
                  <span class="info-label">当前状态</span>
                  <span class="info-value">{{ getLoadLabel(selectedPm.requirements.length) }}</span>
                </div>
              </div>
            </div>

            <div class="info-section">
              <div class="section-title">需求列表</div>
              <div class="task-stack">
                <div v-for="req in selectedPm.requirements" :key="req.id" class="task-card">
                  <div class="task-top">
                    <LnBadge :tone="getPriorityTone(req.priority)">{{ req.priority }}</LnBadge>
                    <span class="task-deadline">{{ req.deadline }} 截止</span>
                  </div>
                  <div class="task-title">{{ req.title }}</div>
                  <LnBadge>{{ req.tag }}</LnBadge>
                </div>
              </div>
            </div>
          </div>
        </template>

        <LnEmptyState v-else title="选择一位 PM" description="左侧聚焦 PM 负载分布，右侧只保留只读的详细预览。" />
      </aside>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { LnAvatar, LnBadge, LnCallout, LnEmptyState, LnIcon, LnInput, LnPressable, LnTabs, type LnTabOption } from '@/components/linear'

interface Requirement {
  id: number
  title: string
  priority: string
  tag: string
  deadline: string
}

interface PmGroup {
  id: number
  name: string
  avatarColor: string
  requirements: Requirement[]
}

const pmList = ref<PmGroup[]>([
  {
    id: 1,
    name: '郑文明',
    avatarColor: 'var(--primary)',
    requirements: [
      { id: 101, title: '山东互联网+明厨亮灶项目', priority: 'P1', tag: '市监G端', deadline: '6-11' },
      { id: 102, title: '智慧食堂支付通道扩容', priority: 'P0', tag: '校园G端', deadline: '5-28' },
      { id: 103, title: '供应商入驻流程优化', priority: 'P2', tag: '校园G端', deadline: '6-20' },
      { id: 104, title: '食堂消费流水对账优化', priority: 'P1', tag: '校园G端', deadline: '6-08' },
      { id: 105, title: '教育局数据报表导出功能', priority: 'P2', tag: '校园G端', deadline: '7-01' },
    ],
  },
  {
    id: 2,
    name: '李产品',
    avatarColor: 'var(--success)',
    requirements: [
      { id: 201, title: '采购平台供应商入驻流程优化', priority: 'P1', tag: '校园G端', deadline: '6-15' },
      { id: 202, title: '仓储屏数据同步延迟优化', priority: 'P2', tag: '校园G端', deadline: '6-20' },
      { id: 203, title: '学校订餐家长端优化', priority: 'P1', tag: '校园G端', deadline: '6-10' },
      { id: 204, title: '校园食堂营养分析报告', priority: 'P0', tag: '校园G端', deadline: '5-30' },
      { id: 205, title: '供应商资质审核流程', priority: 'P2', tag: '校园G端', deadline: '6-25' },
      { id: 206, title: '监管大屏实时数据对接', priority: 'P1', tag: '市监G端', deadline: '6-18' },
      { id: 207, title: '仓储屏UI交互改版', priority: 'P2', tag: '校园G端', deadline: '6-28' },
      { id: 208, title: '南昌青山湖区智慧食堂修改', priority: 'P0', tag: '校园G端', deadline: '5-31' },
    ],
  },
  {
    id: 3,
    name: '王产品',
    avatarColor: 'var(--warning)',
    requirements: [
      { id: 301, title: '嘉兴市仓储屏系统优化', priority: 'P2', tag: '校园G端', deadline: '5-30' },
      { id: 302, title: '教育局数据报表导出功能', priority: 'P1', tag: '校园G端', deadline: '5-22' },
      { id: 303, title: '台州各区县采购平台优化', priority: 'P0', tag: '校园G端', deadline: '5-25' },
      { id: 304, title: '食堂消费流水对账优化', priority: 'P1', tag: '校园G端', deadline: '6-05' },
      { id: 305, title: '智慧食堂支付通道扩容', priority: 'P0', tag: '校园G端', deadline: '6-12' },
      { id: 306, title: '校园食堂营养分析报告', priority: 'P2', tag: '校园G端', deadline: '6-30' },
      { id: 307, title: '供应商入驻流程优化', priority: 'P1', tag: '校园G端', deadline: '6-22' },
      { id: 308, title: '监管大屏实时数据对接', priority: 'P2', tag: '市监G端', deadline: '7-05' },
      { id: 309, title: '仓储屏UI交互改版', priority: 'P1', tag: '校园G端', deadline: '6-18' },
      { id: 310, title: '学校订餐家长端优化', priority: 'P2', tag: '校园G端', deadline: '7-10' },
      { id: 311, title: '采购平台供应商入驻流程', priority: 'P0', tag: '校园G端', deadline: '5-28' },
      { id: 312, title: '供应商资质审核流程', priority: 'P2', tag: '校园G端', deadline: '7-15' },
    ],
  },
])

const filterPriority = ref('')
const searchKeyword = ref('')
const selectedPmId = ref<number | null>(null)
const priorityTabs: LnTabOption[] = [
  { value: '', label: '全部' },
  { value: 'P0', label: 'P0' },
  { value: 'P1', label: 'P1' },
  { value: 'P2', label: 'P2' },
]

const filteredPmList = computed(() =>
  pmList.value
    .map((pm) => ({
      ...pm,
      requirements: pm.requirements.filter((r) => {
        const matchPriority = !filterPriority.value || r.priority === filterPriority.value
        const matchKeyword = !searchKeyword.value || r.title.includes(searchKeyword.value)
        return matchPriority && matchKeyword
      }),
    }))
    .filter((pm) => pm.requirements.length > 0 || (!filterPriority.value && !searchKeyword.value))
)

const selectedPm = computed(() => filteredPmList.value.find((pm) => pm.id === selectedPmId.value) || null)

function ensureSelectedPm() {
  if (!filteredPmList.value.length) {
    selectedPmId.value = null
    return
  }
  const exists = filteredPmList.value.some((item) => item.id === selectedPmId.value)
  if (!exists) {
    selectedPmId.value = filteredPmList.value[0].id
  }
}

function selectPm(pm: PmGroup) {
  selectedPmId.value = pm.id
}

function getPriorityCount(pm: PmGroup, priority: string) {
  return pm.requirements.filter((item) => item.priority === priority).length
}

function getLoadLabel(count: number) {
  if (count <= 5) return '负载正常'
  if (count <= 8) return '负载偏高'
  return '负载过载'
}

function getLoadTone(count: number): 'success' | 'warning' | 'danger' {
  if (count <= 5) return 'success'
  if (count <= 8) return 'warning'
  return 'danger'
}

function getAvatarStatus(count: number): 'online' | 'away' | 'busy' {
  if (count <= 5) return 'online'
  if (count <= 8) return 'away'
  return 'busy'
}

function getPriorityTone(priority: string): 'accent' | 'warning' | 'danger' | 'neutral' {
  if (priority === 'P0') return 'danger'
  if (priority === 'P1') return 'warning'
  if (priority === 'P2') return 'accent'
  return 'neutral'
}

onMounted(() => {
  ensureSelectedPm()
})

watch(filteredPmList, ensureSelectedPm)
</script>

<style lang="scss" scoped>
.pm-tasks-view {
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

.list-panel {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chip-group {
  display: flex;
  gap: 8px;
}

.filter-chip,
.meta-chip,
.priority-pill,
.load-tag {
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

.line-search {
  width: 220px;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: #fff;
  font-size: 13px;
  outline: none;
}

.row-grid {
  display: grid;
  grid-template-columns: minmax(0, 2.2fr) 72px 72px 72px 112px;
  column-gap: 12px;
  align-items: center;
}

.list-header {
  padding: 0 20px;
  min-height: 38px;
  border-bottom: 1px solid var(--border);
  font-size: 12px;
  color: var(--text-secondary);
}

.list-row {
  width: 100%;
  text-align: left;
  padding: 14px 20px;
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--border);
  cursor: pointer;
  transition: var(--transition);

  &:hover {
    background: rgba(0, 0, 0, 0.02);
  }

  &.selected {
    background: rgba(0, 113, 227, 0.05);
  }
}

.cell {
  min-width: 0;
  font-size: 13px;
  color: var(--text-primary);
}

.pm-inline,
.detail-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.pm-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;

  &.large {
    width: 40px;
    height: 40px;
  }
}

.title-text,
.detail-title {
  color: var(--text-primary);
}

.title-text {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
}

.title-subline,
.detail-id,
.task-meta,
.task-deadline {
  font-size: 12px;
  color: var(--text-secondary);
}

.load-tag,
.meta-chip,
.priority-pill {
  padding: 4px 8px;
}

.load-safe {
  background: rgba(52, 199, 89, 0.12);
  color: #1d7f42;
}

.load-warn,
.priority-p1 {
  background: rgba(255, 149, 0, 0.12);
  color: #b56a00;
}

.load-danger,
.priority-p0 {
  background: rgba(255, 59, 48, 0.12);
  color: #c0392b;
}

.priority-pill,
.meta-chip,
.priority-p2 {
  background: rgba(0, 113, 227, 0.08);
  color: var(--primary);
}

.detail-header {
  margin-bottom: 20px;
}

.detail-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
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

.info-item,
.task-card {
  padding: 12px;
  border-radius: 16px;
  background: rgba(0, 0, 0, 0.025);
}

.info-label {
  font-size: 12px;
  color: var(--text-secondary);
}

.info-value,
.task-title {
  font-size: 13px;
  color: var(--text-primary);
}

.task-stack {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.task-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
}

.task-title {
  line-height: 1.55;
  font-weight: 600;
  margin-bottom: 6px;
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
  .list-toolbar,
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .row-grid,
  .info-grid {
    grid-template-columns: minmax(0, 1fr);
    row-gap: 10px;
  }

  .list-header {
    display: none;
  }
}
</style>

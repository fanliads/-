<template>
  <div class="priority-view">
    <!-- 顶部工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <input
          v-model="searchKeyword"
          class="search-box"
          placeholder="搜索需求..."
          @input="filterRequirements"
        />
      </div>
      <div class="toolbar-right">
        <button class="btn btn-primary" @click="$router.push('/submit')">+ 新建需求</button>
      </div>
    </div>

    <!-- P0 提醒条 -->
    <div v-if="p0Count > 0" class="alert-bar">
      <span class="alert-dot"></span>
      <span>当前有 {{ p0Count }} 个 一级A类（P0）需求待处理，请优先关注</span>
    </div>

    <!-- 优先级分组 -->
    <div class="priority-scroll">
      <div
        v-for="group in priorityGroups"
        :key="group.key"
        class="priority-group"
        :class="'group-' + group.key"
      >
        <div class="group-header">
          <span>{{ group.label }}</span>
          <span>{{ getGroupCount(group.key) }} 个需求</span>
        </div>
        <div
          class="group-body"
          :class="{ 'drag-over': dragOverGroup === group.key }"
          @dragover.prevent="onDragOver(group.key)"
          @dragleave="onDragLeave"
          @drop.prevent="onDrop(group.key)"
        >
          <div
            v-for="req in getGroupItems(group.key)"
            :key="req.id"
            class="req-row"
            :class="{ dragging: draggedItem?.id === req.id }"
            draggable="true"
            @dragstart="onDragStart(req, group.key)"
            @dragend="onDragEnd"
          >
            <!-- 标题 & 编号 -->
            <div>
              <div class="req-title">{{ req.title }}</div>
              <div class="req-meta">{{ req.reqNo }}</div>
              <div class="req-assessment">
                <span class="assessment-chip effective">{{ getPriorityLabel(req.effectiveLevel || req.priority) }}</span>
                <span v-if="req.systemLevel && req.systemLevel !== (req.effectiveLevel || req.priority)" class="assessment-chip system">
                  系统 {{ getPriorityLabel(req.systemLevel) }}
                </span>
              </div>
              <div v-if="req.strategyHint" class="req-hint">{{ req.strategyHint }}</div>
            </div>
            <!-- 业务线 -->
            <div>
              <span class="req-tag">{{ req.businessLineName || '-' }}</span>
            </div>
            <!-- 提出人 & 日期 -->
            <div class="req-meta">
              {{ req.assigneeName || req.proposer || '-' }}
              <br />
              {{ formatDate(req.createTime) }}
            </div>
            <!-- 期望上线 -->
            <div class="req-meta">期望上线: {{ formatShortDate(req.expectedDate) }}</div>
            <!-- 进度 -->
            <div>
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: getProgressWidth(req) + '%' }"></div>
              </div>
              <div class="progress-text">{{ getRawRequirementStatusLabel(req.status, req.statusName) }}</div>
            </div>
            <!-- 工作量 -->
            <div class="req-meta">工作量: {{ req.workload || '未估算' }}</div>
            <!-- 风险 -->
            <div :class="{ 'risk-high': isOverdue(req) }">
              <template v-if="isOverdue(req)">逾期风险</template>
            </div>
          </div>

          <!-- 空状态 -->
          <div v-if="getGroupItems(group.key).length === 0" class="empty-group">
            拖拽需求到此分组
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { pageQueryRawRequirements, updateRawRequirement } from '@/api/raw-requirement'
import type { RawRequirementListVO } from '@/types/requirement'
import { getRawRequirementStatusLabel, normalizeRawRequirementStatus } from '@/types/requirement'
import dayjs from 'dayjs'
import { ElMessage } from 'element-plus'


interface ReqItem extends RawRequirementListVO {
  workload?: string
}

const searchKeyword = ref('')
const loading = ref(false)
const allRequirements = ref<ReqItem[]>([])
const draggedItem = ref<ReqItem | null>(null)
const dragSourceGroup = ref<string>('')
const dragOverGroup = ref<string>('')

const priorityGroups = [
  { key: 'p0', label: '一级A类（P0）' },
  { key: 'p1', label: '一级B类（P1）' },
  { key: 'p2', label: '二级（P2）' },
  { key: 'p3', label: '三级（P3）' },
]

const priorityKeyMap: Record<string, string> = {
  p0: 'P0',
  p1: 'P1',
  p2: 'P2',
  p3: 'P3',
}

const p0Count = computed(() => {
  return allRequirements.value.filter(r => (r.effectiveLevel || r.priority) === 'P0').length
})

function getGroupItems(groupKey: string): ReqItem[] {
  const priority = priorityKeyMap[groupKey]
  let items = allRequirements.value.filter(r => (r.effectiveLevel || r.priority) === priority)
  if (searchKeyword.value) {
    const kw = searchKeyword.value.toLowerCase()
    items = items.filter(r =>
      r.title.toLowerCase().includes(kw) ||
      r.reqNo.toLowerCase().includes(kw)
    )
  }
  return items
}

function getGroupCount(groupKey: string): number {
  const priority = priorityKeyMap[groupKey]
  return allRequirements.value.filter(r => (r.effectiveLevel || r.priority) === priority).length
}

function getPriorityLabel(priority?: string): string {
  if (priority === 'P0') return '一级A类（P0）'
  if (priority === 'P1') return '一级B类（P1）'
  if (priority === 'P2') return '二级（P2）'
  if (priority === 'P3') return '三级（P3）'
  return priority || '-'
}

function formatDate(dt: string): string {
  if (!dt) return '-'
  return dt.substring(0, 10)
}

function formatShortDate(dt: string): string {
  if (!dt) return '-'
  const d = dayjs(dt)
  return `${d.month() + 1}-${d.date()}`
}

function getProgressWidth(req: ReqItem): number {
  const map: Record<string, number> = {
    pending_judgement: 10,
    pending_split: 30,
    in_progress: 65,
    online: 100,
    suspended: 65,
    rejected: 100,
    closed: 100,
  }
  return map[normalizeRawRequirementStatus(req.status, req.statusName)] || 10
}

function isOverdue(req: ReqItem): boolean {
  if (!req.expectedDate) return false
  const expected = dayjs(req.expectedDate)
  const now = dayjs()
  const unifiedStatus = normalizeRawRequirementStatus(req.status, req.statusName)
  if (['online', 'closed', 'rejected'].includes(unifiedStatus)) return false
  return expected.isBefore(now, 'day')
}

function filterRequirements() {
  // searchKeyword is reactive, computed getter will re-evaluate
}

// 拖拽逻辑
function onDragStart(req: ReqItem, groupKey: string) {
  draggedItem.value = req
  dragSourceGroup.value = groupKey
}

function onDragEnd() {
  draggedItem.value = null
  dragSourceGroup.value = ''
  dragOverGroup.value = ''
}

function onDragOver(groupKey: string) {
  dragOverGroup.value = groupKey
}

function onDragLeave() {
  dragOverGroup.value = ''
}

async function onDrop(targetGroupKey: string) {
  dragOverGroup.value = ''
  if (!draggedItem.value) return
  if (dragSourceGroup.value === targetGroupKey) return

  const newPriority = priorityKeyMap[targetGroupKey]
  const req = draggedItem.value

  try {
    await updateRawRequirement(req.id, { priority: newPriority })
    // 更新本地数据
    const idx = allRequirements.value.findIndex(r => r.id === req.id)
    if (idx !== -1) {
      allRequirements.value[idx].priority = newPriority
    }
    ElMessage.success(`✓ ${req.title}：${priorityKeyMap[dragSourceGroup.value]} → ${priorityGroups.find(g => g.key === targetGroupKey)?.label}`)
  } catch {
    ElMessage.error('优先级修改失败')
  }

  draggedItem.value = null
  dragSourceGroup.value = ''
}

async function loadData() {
  loading.value = true
  try {
    const res = await pageQueryRawRequirements({ page: 1, size: 500 })
    allRequirements.value = (res.data?.list || []) as ReqItem[]
  } catch {
    allRequirements.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.priority-view {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 32px;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;

  .toolbar-left {
    display: flex;
    align-items: center;
  }

  .toolbar-right {
    display: flex;
    align-items: center;
  }
}

.search-box {
  width: 240px;
  padding: 8px 14px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: var(--bg);
  font-size: 13px;
  outline: none;

  &:focus {
    border-color: var(--primary);
  }
}

.btn {
  padding: 8px 18px;
  border-radius: var(--radius-sm);
  border: none;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: var(--transition);
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.btn-primary {
  background: var(--primary);
  color: #fff;

  &:hover {
    background: var(--primary-hover);
  }
}

.alert-bar {
  background: linear-gradient(90deg, rgba(255, 59, 48, 0.08), rgba(255, 59, 48, 0.04));
  border-bottom: 1px solid rgba(255, 59, 48, 0.15);
  padding: 12px 32px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: #b0281e;
  flex-shrink: 0;
}

.alert-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--danger);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.priority-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 24px 32px;
}

.priority-group {
  margin-bottom: 24px;
  border-radius: var(--radius);
  overflow: hidden;
}

.group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  font-size: 14px;
  font-weight: 600;
}

.group-p0 {
  .group-header {
    background: linear-gradient(90deg, rgba(255, 59, 48, 0.12), rgba(255, 59, 48, 0.04));
    color: var(--danger);
  }
}

.group-p1 {
  .group-header {
    background: linear-gradient(90deg, rgba(255, 149, 0, 0.10), rgba(255, 149, 0, 0.03));
    color: #b75c00;
  }
}

.group-p2 {
  .group-header {
    background: linear-gradient(90deg, rgba(255, 204, 0, 0.10), rgba(255, 204, 0, 0.03));
    color: #9a7d00;
  }
}

.group-p3 {
  .group-header {
    background: linear-gradient(90deg, rgba(142, 142, 147, 0.08), rgba(142, 142, 147, 0.02));
    color: var(--text-secondary);
  }
}

.group-body {
  background: var(--surface);
  padding: 16px 20px;
  transition: all 0.2s;

  &.drag-over {
    background: rgba(0, 113, 227, 0.06);
    outline: 2px dashed var(--primary);
    outline-offset: -2px;
  }
}

.req-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr 120px 80px;
  gap: 12px;
  align-items: center;
  padding: 14px 0;
  border-bottom: 1px solid var(--border);
  cursor: grab;
  transition: all 0.2s;

  &:last-child {
    border-bottom: none;
  }

  &.dragging {
    opacity: 0.5;
    transform: rotate(2deg);
  }
}

.req-title {
  font-weight: 500;
  font-size: 14px;
}

.req-meta {
  font-size: 12px;
  color: var(--text-secondary);
}

.req-assessment {
  display: flex;
  gap: 6px;
  margin-top: 8px;
  flex-wrap: wrap;
}

.assessment-chip {
  display: inline-flex;
  align-items: center;
  padding: 3px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
}

.assessment-chip.effective {
  background: rgba(16, 124, 65, 0.12);
  color: #166534;
}

.assessment-chip.system {
  background: rgba(33, 107, 255, 0.1);
  color: #216bff;
}

.req-hint {
  margin-top: 6px;
  font-size: 12px;
  color: #5f6368;
  line-height: 1.5;
}

.req-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  background: rgba(0, 113, 227, 0.08);
  color: var(--primary);
}

.progress-bar {
  height: 6px;
  background: var(--bg);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--primary);
  border-radius: 3px;
  transition: width 0.3s;
}

.progress-text {
  font-size: 11px;
  color: var(--text-secondary);
  margin-top: 4px;
  text-align: right;
}

.risk-high {
  color: var(--danger);
  font-weight: 500;
  font-size: 13px;
}

.empty-group {
  padding: 24px 0;
  text-align: center;
  color: var(--text-secondary);
  font-size: 13px;
  border: 1px dashed var(--border);
  border-radius: 6px;
  margin: 8px 0;
}

@media (max-width: 768px) {
  .toolbar {
    padding: 0 16px;
  }

  .priority-scroll {
    padding: 16px;
  }

  .req-row {
    grid-template-columns: 1fr;
    gap: 6px;
  }
}
</style>

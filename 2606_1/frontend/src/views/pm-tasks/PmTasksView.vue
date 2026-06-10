<template>
  <div class="pm-tasks-view">
    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="filter-chip" :class="{ active: filterPriority === 'P0' }" @click="toggleFilter('P0')">P0</div>
      <div class="filter-chip" :class="{ active: filterPriority === 'P1' }" @click="toggleFilter('P1')">P1</div>
      <div class="filter-chip" :class="{ active: filterPriority === 'P2' }" @click="toggleFilter('P2')">P2</div>
      <input class="search-box" v-model="searchKeyword" placeholder="搜索需求..." />
    </div>

    <!-- PM看板 -->
    <div class="pm-board">
      <div
        v-for="pm in filteredPmList"
        :key="pm.id"
        class="pm-column"
      >
        <div class="pm-header">
          <div class="pm-avatar" :style="{ background: pm.avatarColor }">{{ pm.name.charAt(0) }}</div>
          <div class="pm-name">{{ pm.name }}</div>
          <div class="pm-count">{{ pm.requirements.length }}个需求</div>
          <div class="pm-load" :class="getLoadClass(pm.requirements.length)">{{ getLoadLabel(pm.requirements.length) }}</div>
        </div>
        <div
          class="column-body"
          :class="{ 'drag-over': dragOverPmId === pm.id }"
          @dragover.prevent="onDragOver($event, pm.id)"
          @dragleave="onDragLeave(pm.id)"
          @drop="onDrop($event, pm.id)"
        >
          <div
            v-for="req in pm.requirements"
            :key="req.id"
            class="card"
            :class="{ dragging: draggingReqId === req.id }"
            draggable="true"
            @dragstart="onDragStart($event, req, pm.id)"
            @dragend="onDragEnd"
          >
            <span class="card-priority" :class="`priority-${req.priority.toLowerCase()}`">{{ req.priority }}</span>
            <div class="card-title">{{ req.title }}</div>
            <div class="card-meta">
              <span class="card-tag">{{ req.tag }}</span>
              <span>{{ req.deadline }} 截止</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <div class="toast" :class="{ show: toastVisible }">{{ toastMessage }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

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

/** 模拟数据 */
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

/** 筛选 */
const filterPriority = ref('')
const searchKeyword = ref('')

const filteredPmList = computed(() => {
  return pmList.value.map(pm => ({
    ...pm,
    requirements: pm.requirements.filter(r => {
      const matchPriority = !filterPriority.value || r.priority === filterPriority.value
      const matchKeyword = !searchKeyword.value || r.title.includes(searchKeyword.value)
      return matchPriority && matchKeyword
    }),
  }))
})

/** 负载判断 */
function getLoadClass(count: number): string {
  if (count <= 5) return 'load-safe'
  if (count <= 8) return 'load-warn'
  return 'load-danger'
}

function getLoadLabel(count: number): string {
  if (count <= 5) return '负载正常'
  if (count <= 8) return '负载偏高'
  return '负载过载'
}

/** 筛选切换 */
function toggleFilter(priority: string) {
  filterPriority.value = filterPriority.value === priority ? '' : priority
}

/** 拖拽 */
const draggingReqId = ref<number | null>(null)
const draggingReq = ref<Requirement | null>(null)
const dragSourcePmId = ref<number | null>(null)
const dragOverPmId = ref<number | null>(null)

function onDragStart(_e: DragEvent, req: Requirement, pmId: number) {
  draggingReqId.value = req.id
  draggingReq.value = req
  dragSourcePmId.value = pmId
}

function onDragEnd() {
  draggingReqId.value = null
  draggingReq.value = null
  dragSourcePmId.value = null
  dragOverPmId.value = null
}

function onDragOver(_e: DragEvent, pmId: number) {
  dragOverPmId.value = pmId
}

function onDragLeave(pmId: number) {
  if (dragOverPmId.value === pmId) {
    dragOverPmId.value = null
  }
}

function onDrop(_e: DragEvent, targetPmId: number) {
  dragOverPmId.value = null
  if (!draggingReq.value || dragSourcePmId.value === targetPmId) return

  const sourcePm = pmList.value.find(p => p.id === dragSourcePmId.value)
  const targetPm = pmList.value.find(p => p.id === targetPmId)
  if (!sourcePm || !targetPm) return

  const reqIndex = sourcePm.requirements.findIndex(r => r.id === draggingReq.value!.id)
  if (reqIndex === -1) return

  const [removed] = sourcePm.requirements.splice(reqIndex, 1)
  targetPm.requirements.push(removed)

  showToast(`✓ ${removed.title}：${sourcePm.name} → ${targetPm.name}`)
}

/** Toast */
const toastVisible = ref(false)
const toastMessage = ref('')

function showToast(msg: string) {
  toastMessage.value = msg
  toastVisible.value = true
  setTimeout(() => {
    toastVisible.value = false
  }, 2500)
}
</script>

<style lang="scss" scoped>
.pm-tasks-view {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.toolbar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  align-items: center;
}

.pm-board {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding-bottom: 16px;
  flex: 1;
}

.pm-column {
  width: 300px;
  min-width: 300px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.pm-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 4px 8px;
}

.pm-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--primary);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  flex-shrink: 0;
}

.pm-name {
  font-size: 13px;
  font-weight: 600;
}

.pm-count {
  font-size: 11px;
  color: var(--text-secondary);
  background: var(--bg);
  padding: 2px 8px;
  border-radius: 10px;
}

.pm-load {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
}

.load-safe {
  background: rgba(52, 199, 89, 0.10);
  color: #248a3d;
}

.load-warn {
  background: rgba(255, 149, 0, 0.10);
  color: #b75c00;
}

.load-danger {
  background: rgba(255, 59, 48, 0.08);
  color: var(--danger);
}

.column-body {
  background: rgba(0, 0, 0, 0.02);
  border-radius: var(--radius);
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 120px;
  transition: all 0.2s;

  &.drag-over {
    background: rgba(0, 113, 227, 0.06);
    border: 2px dashed var(--primary);
  }
}

.card {
  background: var(--surface);
  border-radius: var(--radius-sm);
  padding: 14px;
  box-shadow: var(--shadow);
  cursor: grab;
  transition: all 0.2s;

  &:hover {
    box-shadow: var(--shadow-hover);
    transform: translateY(-1px);
  }

  &.dragging {
    opacity: 0.5;
    transform: rotate(2deg);
  }
}

.card-priority {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  margin-bottom: 8px;
}

.card-title {
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;
  margin-bottom: 10px;
}

.card-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  color: var(--text-secondary);
}

.card-tag {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  background: rgba(0, 113, 227, 0.08);
  color: var(--primary);
}

.toast {
  position: fixed;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  background: #1d1d1f;
  color: #fff;
  padding: 12px 24px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  z-index: 200;
  opacity: 0;
  transition: opacity 0.3s;
  pointer-events: none;

  &.show {
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .pm-board {
    flex-direction: column;
  }

  .pm-column {
    width: 100%;
    min-width: unset;
  }
}
</style>

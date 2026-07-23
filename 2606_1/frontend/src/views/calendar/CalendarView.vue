<template>
  <div class="calendar-view">
    <section class="page-header wb-page-header">
      <div class="title-block">
        <div class="title-row wb-title-row">
          <h2 class="page-title wb-page-title">日历视图</h2>
          <span class="page-count wb-page-meta">{{ currentYear }}年 {{ currentMonth }}月</span>
          <span class="page-hint wb-page-meta">{{ requirements.length }} 项日程</span>
        </div>
        <p class="page-subtitle wb-page-subtitle">以月历浏览需求节奏，同时保留右侧聚焦阅读区，避免传统日历页信息碎散。</p>
      </div>

      <div class="header-actions">
        <LnButton size="small" variant="ghost" icon-only aria-label="上个月" @click="prevMonth"><template #icon><LnIcon name="chevron-left"/></template></LnButton>
        <LnButton size="small" @click="goToday">今天</LnButton>
        <LnButton size="small" variant="ghost" icon-only aria-label="下个月" @click="nextMonth"><template #icon><LnIcon name="chevron-right"/></template></LnButton>
      </div>
    </section>

    <section class="workspace-shell wb-shell">
      <div class="calendar-panel wb-panel">
        <div class="weekdays">
          <div v-for="d in weekdays" :key="d" class="weekday" :class="{ weekend: d === '六' || d === '日' }">{{ d }}</div>
        </div>

        <div v-if="loading" class="calendar-grid calendar-loading" aria-label="正在加载日历">
          <LnSkeleton v-for="index in 42" :key="index" height="116px" />
        </div>
        <div v-else class="calendar-grid">
          <LnCalendarDay
            v-for="(cell, idx) in calendarCells"
            :key="idx"
            :day="cell.day"
            :events="cell.events"
            :weekend="cell.isWeekend"
            :muted="!cell.isCurrentMonth"
            :today="cell.dateStr === todayStr"
            :selected="selectedDateStr === cell.dateStr"
            :aria-label="`${cell.dateStr}，${cell.events.length}项日程`"
            @select="selectDate(cell.dateStr)"
            @select-event="selectCalendarEvent"
          />
        </div>
      </div>

      <aside class="detail-panel wb-panel">
        <template v-if="selectedEvent">
          <div class="detail-scroll wb-detail-scroll">
            <div class="detail-header">
              <div class="detail-id">{{ selectedEvent.date }}</div>
              <h3 class="detail-title wb-detail-title">{{ selectedEvent.title }}</h3>
              <div class="detail-tags">
                <span class="priority-pill" :class="`priority-${selectedEvent.priority.toLowerCase()}`">{{ selectedEvent.priority }}</span>
                <span class="status-tag" :class="getEventClass(selectedEvent)">{{ getStatusLabel(selectedEvent) }}</span>
              </div>
            </div>

            <div class="info-section">
              <div class="section-title">日程信息</div>
              <div class="info-grid">
                <div class="info-item wb-info-item">
                  <span class="info-label">计划日期</span>
                  <span class="info-value">{{ selectedEvent.date }}</span>
                </div>
                <div class="info-item wb-info-item">
                  <span class="info-label">优先级</span>
                  <span class="info-value">{{ selectedEvent.priority }}</span>
                </div>
                <div class="info-item wb-info-item">
                  <span class="info-label">当前状态</span>
                  <span class="info-value">{{ getStatusLabel(selectedEvent) }}</span>
                </div>
              </div>
            </div>

            <div class="info-section">
              <div class="section-title">同日事项</div>
              <div class="stack-list">
                <div v-for="evt in selectedDateEvents" :key="evt.id" class="stack-item" :class="{ active: evt.id === selectedEvent.id }" @click="selectEvent(evt)">
                  <div class="stack-title">{{ evt.title }}</div>
                  <div class="stack-meta">{{ evt.priority }} · {{ getStatusLabel(evt) }}</div>
                </div>
              </div>
            </div>
          </div>
        </template>

        <template v-else-if="selectedDateEvents.length">
          <div class="detail-scroll wb-detail-scroll">
            <div class="detail-header">
              <div class="detail-id">{{ selectedDateStr }}</div>
              <h3 class="detail-title wb-detail-title">当日事项</h3>
            </div>
            <div class="stack-list">
              <div v-for="evt in selectedDateEvents" :key="evt.id" class="stack-item" @click="selectEvent(evt)">
                <div class="stack-title">{{ evt.title }}</div>
                <div class="stack-meta">{{ evt.priority }} · {{ getStatusLabel(evt) }}</div>
              </div>
            </div>
          </div>
        </template>

        <LnEmptyState v-else title="选择一个日期" description="左侧月历用于整体排期扫视，右侧用于阅读当天事项。" />
      </aside>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import dayjs from 'dayjs'
import { pageQueryRawRequirements } from '@/api/raw-requirement'
import type { RawRequirementListVO } from '@/types/requirement'
import { normalizeRawRequirementStatus } from '@/types/requirement'
import { LnButton, LnCalendarDay, LnEmptyState, LnIcon, LnSkeleton, type LnCalendarEvent } from '@/components/linear'

interface CalEvent extends LnCalendarEvent {
  id: number
  priority: string
  status: string
  date: string
}

interface CalCell {
  day: number
  isCurrentMonth: boolean
  isWeekend: boolean
  dateStr: string
  events: CalEvent[]
}

const weekdays = ['一', '二', '三', '四', '五', '六', '日']
const currentDate = ref(dayjs())
const requirements = ref<RawRequirementListVO[]>([])
const loading = ref(false)
const selectedDateStr = ref('')
const selectedEventId = ref<number | null>(null)

const currentYear = computed(() => currentDate.value.year())
const currentMonth = computed(() => currentDate.value.month() + 1)
const todayStr = dayjs().format('YYYY-MM-DD')

const eventMap = computed(() => {
  const map: Record<string, CalEvent[]> = {}
  for (const req of requirements.value) {
    const dateStr = req.expectedDate ? req.expectedDate.substring(0, 10) : ''
    if (!dateStr) continue
    if (!map[dateStr]) map[dateStr] = []
    const priority = req.priority || 'P2'
    const status = req.status
    map[dateStr].push({
      id: req.id,
      title: req.title,
      priority,
      status,
      date: dateStr,
      tone: getEventTone(priority, status),
    })
  }
  return map
})

const calendarCells = computed(() => {
  const cells: CalCell[] = []
  const firstDay = currentDate.value.startOf('month')
  const daysInMonth = currentDate.value.daysInMonth()
  let startDow = firstDay.day() - 1
  if (startDow < 0) startDow = 6

  const prevMonth = currentDate.value.subtract(1, 'month')
  const prevDays = prevMonth.daysInMonth()
  for (let i = startDow - 1; i >= 0; i--) {
    const day = prevDays - i
    const dateStr = prevMonth.format('YYYY-MM-') + String(day).padStart(2, '0')
    const dow = startDow - 1 - i
    cells.push({ day, isCurrentMonth: false, isWeekend: dow === 5 || dow === 6, dateStr, events: eventMap.value[dateStr] || [] })
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = currentDate.value.format('YYYY-MM-') + String(d).padStart(2, '0')
    const dow = (startDow + d - 1) % 7
    cells.push({ day: d, isCurrentMonth: true, isWeekend: dow === 5 || dow === 6, dateStr, events: eventMap.value[dateStr] || [] })
  }

  const nextMonth = currentDate.value.add(1, 'month')
  const remaining = 42 - cells.length
  for (let d = 1; d <= remaining; d++) {
    const dateStr = nextMonth.format('YYYY-MM-') + String(d).padStart(2, '0')
    const dow = cells.length % 7
    cells.push({ day: d, isCurrentMonth: false, isWeekend: dow === 5 || dow === 6, dateStr, events: eventMap.value[dateStr] || [] })
  }

  return cells
})

const selectedDateEvents = computed(() => eventMap.value[selectedDateStr.value] || [])
const selectedEvent = computed(() => selectedDateEvents.value.find((item) => item.id === selectedEventId.value) || null)

function ensureSelection() {
  const cellsWithEvents = calendarCells.value.find((cell) => cell.events.length > 0 && cell.isCurrentMonth)
  if (!selectedDateStr.value && cellsWithEvents) {
    selectedDateStr.value = cellsWithEvents.dateStr
  }
  const events = selectedDateEvents.value
  if (!events.length) {
    selectedEventId.value = null
    return
  }
  const exists = events.some((item) => item.id === selectedEventId.value)
  if (!exists) {
    selectedEventId.value = events[0].id
  }
}

function getEventClass(evt: CalEvent): string {
  if (['online', 'closed', 'rejected'].includes(normalizeRawRequirementStatus(evt.status))) return 'event-done'
  const map: Record<string, string> = { P0: 'event-p0', P1: 'event-p1', P2: 'event-p2', P3: 'event-p2' }
  return map[evt.priority] || 'event-p2'
}

function getEventTone(priority: string, status: string): LnCalendarEvent['tone'] {
  if (['online', 'closed', 'rejected'].includes(normalizeRawRequirementStatus(status))) return 'success'
  if (priority === 'P0') return 'danger'
  if (priority === 'P1') return 'warning'
  return 'accent'
}

function getStatusLabel(evt: CalEvent): string {
  const normalized = normalizeRawRequirementStatus(evt.status)
  const map: Record<string, string> = {
    pending_judgement: '待判定',
    pending_split: '待拆分',
    in_progress: '进行中',
    suspended: '已挂起',
    online: '已上线',
    closed: '已关闭',
    rejected: '已驳回',
  }
  return map[normalized] || evt.status
}

function selectDate(dateStr: string) {
  selectedDateStr.value = dateStr
  selectedEventId.value = null
  ensureSelection()
}

function selectEvent(evt: CalEvent) {
  selectedDateStr.value = evt.date
  selectedEventId.value = evt.id
}

function selectCalendarEvent(evt: LnCalendarEvent) {
  const event = requirements.value.length
    ? Object.values(eventMap.value).flat().find((item) => item.id === evt.id)
    : undefined
  if (event) selectEvent(event)
}

function prevMonth() {
  currentDate.value = currentDate.value.subtract(1, 'month')
}

function nextMonth() {
  currentDate.value = currentDate.value.add(1, 'month')
}

function goToday() {
  currentDate.value = dayjs()
}

async function loadData() {
  loading.value = true
  try {
    const startOfMonth = currentDate.value.startOf('month').subtract(7, 'day').format('YYYY-MM-DD')
    const endOfMonth = currentDate.value.endOf('month').add(7, 'day').format('YYYY-MM-DD')
    const res = await pageQueryRawRequirements({ page: 1, size: 200, startDate: startOfMonth, endDate: endOfMonth })
    requirements.value = res.data?.list || []
    ensureSelection()
  } catch {
    requirements.value = []
    selectedEventId.value = null
  } finally {
    loading.value = false
  }
}

watch(currentDate, () => {
  selectedDateStr.value = ''
  selectedEventId.value = null
  loadData()
})

onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.calendar-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.calendar-panel {
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  border-bottom: 1px solid var(--border);
}

.weekday {
  text-align: center;
  padding: 12px 0;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);

  &.weekend {
    color: #c0392b;
  }
}

.calendar-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: var(--border);
  overflow: auto;
}

.priority-pill,
.status-tag,
.more-count {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  font-size: 11px;
}

.calendar-loading { background: var(--ln-border); }

.event-p0 {
  background: rgba(255, 59, 48, 0.12);
  color: #c0392b;
}

.event-p1 {
  background: rgba(255, 149, 0, 0.12);
  color: #b56a00;
}

.event-p2 {
  background: rgba(0, 113, 227, 0.08);
  color: var(--primary);
}

.event-done {
  background: rgba(52, 199, 89, 0.12);
  color: #1d7f42;
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

.priority-pill,
.status-tag {
  padding: 4px 8px;
}

.priority-p0 {
  background: rgba(255, 59, 48, 0.12);
  color: #c0392b;
}

.priority-p1 {
  background: rgba(255, 149, 0, 0.12);
  color: #b56a00;
}

.priority-p2,
.status-tag {
  background: rgba(0, 113, 227, 0.08);
  color: var(--primary);
}

.event-done.status-tag {
  background: rgba(52, 199, 89, 0.12);
  color: #1d7f42;
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
.stack-item {
  padding: 12px;
  border-radius: 16px;
  background: rgba(0, 0, 0, 0.025);
}

.info-label,
.stack-meta,
.empty-copy {
  font-size: 12px;
  color: var(--text-secondary);
}

.info-value,
.stack-title {
  font-size: 13px;
  color: var(--text-primary);
}

.stack-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.stack-item {
  cursor: pointer;

  &.active {
    background: rgba(0, 113, 227, 0.05);
    border: 1px solid rgba(0, 113, 227, 0.18);
  }
}

.stack-title {
  font-weight: 600;
  margin-bottom: 6px;
  line-height: 1.5;
}

.empty-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.empty-copy {
  line-height: 1.7;
  max-width: 240px;
}

@media (max-width: 1280px) {
  .detail-panel {
    min-height: 320px;
  }
}

@media (max-width: 768px) {
  .calendar-grid,
  .weekdays {
    min-width: 780px;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>

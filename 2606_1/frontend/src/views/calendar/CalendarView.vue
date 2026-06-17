<template>
  <div class="calendar-view">
    <div class="calendar-wrap">
      <!-- 头部导航 -->
      <div class="cal-header">
        <div class="cal-title">{{ currentYear }}年 {{ currentMonth }}月</div>
        <div class="cal-nav">
          <button class="cal-nav-btn" @click="prevMonth">&lt;</button>
          <button class="cal-nav-btn" @click="goToday">今天</button>
          <button class="cal-nav-btn" @click="nextMonth">&gt;</button>
        </div>
      </div>

      <!-- 星期标题 -->
      <div class="cal-weekdays">
        <div v-for="d in weekdays" :key="d" class="weekday" :class="{ 'is-weekend': d === '六' || d === '日' }">
          {{ d }}
        </div>
      </div>

      <!-- 日历网格 -->
      <div class="cal-grid">
        <div
          v-for="(cell, idx) in calendarCells"
          :key="idx"
          class="cal-cell"
          :class="{
            weekend: cell.isWeekend,
          }"
        >
          <div class="cal-day" :class="{ other: !cell.isCurrentMonth }">
            {{ cell.day }}
          </div>
          <div
            v-for="evt in cell.events"
            :key="evt.id"
            class="cal-event"
            :class="getEventClass(evt)"
            :title="evt.title"
            @click="handleEventClick(evt)"
          >
            {{ evt.title }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import dayjs from 'dayjs'
import { pageQueryRawRequirements } from '@/api/raw-requirement'
import type { RawRequirementListVO } from '@/types/requirement'
import { normalizeRawRequirementStatus } from '@/types/requirement'

interface CalEvent {
  id: number
  title: string
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

const currentYear = computed(() => currentDate.value.year())
const currentMonth = computed(() => currentDate.value.month() + 1)

// 事件映射：日期字符串 -> 事件列表
const eventMap = computed(() => {
  const map: Record<string, CalEvent[]> = {}
  for (const req of requirements.value) {
    const dateStr = req.expectedDate ? req.expectedDate.substring(0, 10) : ''
    if (!dateStr) continue
    if (!map[dateStr]) map[dateStr] = []
    map[dateStr].push({
      id: req.id,
      title: req.title,
      priority: req.priority || 'P2',
      status: req.status,
      date: dateStr,
    })
  }
  return map
})

// 计算日历单元格
const calendarCells = computed(() => {
  const cells: CalCell[] = []
  const firstDay = currentDate.value.startOf('month')
  const daysInMonth = currentDate.value.daysInMonth()

  // 周一起始：0=周一, 6=周日
  let startDow = firstDay.day() - 1
  if (startDow < 0) startDow = 6

  // 上月填充
  const prevMonth = currentDate.value.subtract(1, 'month')
  const prevDays = prevMonth.daysInMonth()
  for (let i = startDow - 1; i >= 0; i--) {
    const day = prevDays - i
    const dateStr = prevMonth.format('YYYY-MM-') + String(day).padStart(2, '0')
    const dow = startDow - 1 - i // 0-indexed from Monday
    cells.push({
      day,
      isCurrentMonth: false,
      isWeekend: dow === 5 || dow === 6,
      dateStr,
      events: eventMap.value[dateStr] || [],
    })
  }

  // 当月
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = currentDate.value.format('YYYY-MM-') + String(d).padStart(2, '0')
    const dow = (startDow + d - 1) % 7 // 0=Mon, 5=Sat, 6=Sun
    cells.push({
      day: d,
      isCurrentMonth: true,
      isWeekend: dow === 5 || dow === 6,
      dateStr,
      events: eventMap.value[dateStr] || [],
    })
  }

  // 下月填充到满6行(42格)
  const nextMonth = currentDate.value.add(1, 'month')
  const remaining = 42 - cells.length
  for (let d = 1; d <= remaining; d++) {
    const dateStr = nextMonth.format('YYYY-MM-') + String(d).padStart(2, '0')
    const cellIndex = cells.length
    const dow = cellIndex % 7
    cells.push({
      day: d,
      isCurrentMonth: false,
      isWeekend: dow === 5 || dow === 6,
      dateStr,
      events: eventMap.value[dateStr] || [],
    })
  }

  return cells
})

function getEventClass(evt: CalEvent): string {
  if (['online', 'closed', 'rejected'].includes(normalizeRawRequirementStatus(evt.status))) return 'event-done'
  // 按优先级
  const map: Record<string, string> = {
    P0: 'event-p0',
    P1: 'event-p1',
    P2: 'event-p2',
    P3: 'event-p2',
  }
  return map[evt.priority] || 'event-p2'
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

function handleEventClick(evt: CalEvent) {
  console.log('点击需求:', evt.id, evt.title)
}

async function loadData() {
  loading.value = true
  try {
    // 获取当月及前后缓冲的数据
    const startOfMonth = currentDate.value.startOf('month').subtract(7, 'day').format('YYYY-MM-DD')
    const endOfMonth = currentDate.value.endOf('month').add(7, 'day').format('YYYY-MM-DD')
    const res = await pageQueryRawRequirements({
      page: 1,
      size: 200,
      startDate: startOfMonth,
      endDate: endOfMonth,
    })
    requirements.value = res.data?.list || []
  } catch {
    requirements.value = []
  } finally {
    loading.value = false
  }
}

watch(currentDate, () => {
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
  padding: 24px 32px;
  overflow-y: auto;
}

.calendar-wrap {
  background: var(--surface);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 20px;
}

.cal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.cal-title {
  font-size: 18px;
  font-weight: 600;
}

.cal-nav {
  display: flex;
  gap: 8px;
}

.cal-nav-btn {
  padding: 6px 14px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: var(--bg);
  cursor: pointer;
  font-size: 13px;
  transition: var(--transition);

  &:hover {
    border-color: var(--primary);
    color: var(--primary);
  }
}

.cal-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 4px;

  .weekday {
    text-align: center;
    padding: 8px 0;
    font-size: 12px;
    font-weight: 600;
    color: var(--text-secondary);

    &.is-weekend {
      color: var(--danger);
    }
  }
}

.cal-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: var(--border);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.cal-cell {
  background: var(--surface);
  min-height: 110px;
  padding: 8px;
  transition: background 0.2s;

  &.weekend {
    background: #fafafa;
  }
}

.cal-day {
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 6px;

  &.other {
    color: var(--text-secondary);
  }
}

.cal-event {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    filter: brightness(0.95);
  }
}

.event-p0 {
  background: rgba(255, 59, 48, 0.10);
  color: var(--danger);
}

.event-p1 {
  background: rgba(255, 149, 0, 0.10);
  color: #b75c00;
}

.event-p2 {
  background: rgba(255, 204, 0, 0.12);
  color: #9a7d00;
}

.event-done {
  background: rgba(52, 199, 89, 0.10);
  color: #248a3d;
}

@media (max-width: 768px) {
  .calendar-view {
    padding: 16px;
  }

  .cal-cell {
    min-height: 70px;
  }
}
</style>

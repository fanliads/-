<template>
  <div
    class="kanban-card"
    :class="'priority-' + (requirement.priority || 'default').toLowerCase()"
    @click="$emit('click', requirement)"
  >
    <!-- 顶部标签行 -->
    <div class="card-top">
      <span v-if="reqType === 'raw'" class="type-tag">原始需求</span>
      <span v-else class="type-tag">产品需求</span>
      <span class="priority-tag" :class="'priority-' + (requirement.priority || 'default').toLowerCase()">{{ getPriorityLabel(requirement.priority) }}</span>
      <span v-if="requirement.statusName" class="status-tag-mini">{{ requirement.statusName }}</span>
    </div>

    <!-- 标题 -->
    <div class="card-title" :title="requirement.title">{{ requirement.title }}</div>

    <!-- 描述 -->
    <div v-if="requirement.description" class="card-desc">{{ requirement.description }}</div>

    <!-- 底部元数据 -->
    <div class="card-meta">
      <span v-if="metaOwnerLabel && requirement.assigneeName">{{ metaOwnerLabel }}：{{ requirement.assigneeName }}</span>
      <span v-if="requirement.businessLineName">业务线：{{ requirement.businessLineName }}</span>
      <span v-if="requirement.projectName">项目：{{ requirement.projectName }}</span>
      <span v-if="requirement.expectedDate" class="due-date" :class="{ overdue: isOverdue(requirement.expectedDate) }">
        {{ formatDate(requirement.expectedDate) }} 截止
      </span>
      <span v-if="reqType === 'product' && requirement.sprintName" class="sprint-info">{{ requirement.sprintName }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import dayjs from 'dayjs'
import type { RawRequirementVO, ProductRequirementVO } from '@/types/kanban'
import { PRIORITY_MAP } from '@/types/requirement'

const props = defineProps<{
  requirement: RawRequirementVO | ProductRequirementVO
  reqType: 'raw' | 'product'
}>()

defineEmits<{
  click: [requirement: RawRequirementVO | ProductRequirementVO]
}>()

const metaOwnerLabel = computed(() => (props.reqType === 'raw' ? '当前处理人' : '负责人'))

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return ''
  return dayjs(dateStr).format('M-DD')
}

function isOverdue(dateStr?: string | null): boolean {
  if (!dateStr) return false
  return dayjs(dateStr).isBefore(dayjs(), 'day')
}

function getPriorityLabel(priority?: string | null): string {
  if (!priority) return '二级（P2）'
  return PRIORITY_MAP[priority] || priority
}
</script>

<style lang="scss" scoped>
.kanban-card {
  background: var(--surface);
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  padding: 14px;
  box-shadow: var(--shadow);
  cursor: grab;
  transition: box-shadow 0.2s ease, transform 0.15s ease;

  &:hover {
    box-shadow: var(--shadow-hover);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  &.dragging {
    opacity: 0.5;
    transform: rotate(2deg);
  }
}

.card-top {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.type-tag,
.priority-tag,
.status-tag-mini {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 600;
}

.type-tag {
  background: rgba(0, 113, 227, 0.10);
  color: var(--primary);
}

.priority-tag {
  &.priority-p0 {
    background: rgba(255, 59, 48, 0.10);
    color: var(--danger);
  }
  &.priority-p1 {
    background: rgba(255, 149, 0, 0.10);
    color: #b75c00;
  }
  &.priority-p2 {
    background: rgba(255, 204, 0, 0.12);
    color: #9a7d00;
  }
  &.priority-p3,
  &.priority-default {
    background: rgba(142, 142, 147, 0.08);
    color: var(--text-secondary);
  }
}

.status-tag-mini {
  background: rgba(52, 199, 89, 0.10);
  color: #248a3d;
}

.card-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--text-primary);
}

.card-desc {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 10px;
  line-height: 1.6;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.card-meta {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  font-size: 12px;
  color: var(--text-secondary);

  .due-date {
    font-weight: 500;
    &.overdue {
      color: var(--danger);
      font-weight: 600;
    }
  }

  .sprint-info {
    padding: 1px 6px;
    border-radius: 4px;
    background: rgba(0, 113, 227, 0.08);
    color: var(--primary);
  }
}
</style>

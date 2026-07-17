<template>
  <div
    class="ln-calendar-day ln-focus-ring"
    :class="{ 'is-muted': muted, 'is-weekend': weekend, 'is-today': today, 'is-selected': selected }"
    role="button"
    tabindex="0"
    :aria-label="ariaLabel || `${day}日，${events.length}项日程`"
    :aria-pressed="selected"
    @click="$emit('select')"
    @keydown.enter.prevent="$emit('select')"
    @keydown.space.prevent="$emit('select')"
  >
    <span class="ln-calendar-day__number">{{ day }}</span>
    <span class="ln-calendar-day__events">
      <button
        v-for="event in visibleEvents"
        :key="event.id"
        class="ln-calendar-day__event"
        :class="`is-${event.tone || 'neutral'}`"
        type="button"
        :title="event.title"
        @click.stop="$emit('selectEvent', event)"
      ><i />{{ event.title }}</button>
      <span v-if="hiddenCount" class="ln-calendar-day__more">还有 {{ hiddenCount }} 项</span>
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { LnCalendarEvent } from './types'

const props = withDefaults(defineProps<{
  day: number
  events?: LnCalendarEvent[]
  maxEvents?: number
  muted?: boolean
  weekend?: boolean
  today?: boolean
  selected?: boolean
  ariaLabel?: string
}>(), { events: () => [], maxEvents: 3 })

defineEmits<{
  select: []
  selectEvent: [event: LnCalendarEvent]
}>()

const visibleEvents = computed(() => props.events.slice(0, props.maxEvents))
const hiddenCount = computed(() => Math.max(0, props.events.length - props.maxEvents))
</script>

<style scoped lang="scss">
.ln-calendar-day { min-width: 0; min-height: 116px; padding: 9px; border: 0; display: flex; flex-direction: column; gap: 8px; color: var(--ln-text); background: var(--ln-surface); text-align: left; font-family: var(--ln-font); cursor: pointer; transition: background var(--ln-fast), box-shadow var(--ln-fast); &:hover { background: var(--ln-surface-hover); } &.is-weekend { background: #fbfbfc; } &.is-muted { color: var(--ln-text-tertiary); } &.is-selected { position: relative; z-index: 1; background: var(--ln-accent-soft); box-shadow: inset 0 0 0 1px rgba(94,106,210,.32); } }
.ln-calendar-day__number { width: 22px; height: 22px; display: grid; place-items: center; border-radius: 50%; font-size: 12px; font-weight: 570; .is-today & { color: #fff; background: var(--ln-accent); } }
.ln-calendar-day__events { min-width: 0; display: grid; gap: 4px; }
.ln-calendar-day__event { width: 100%; min-width: 0; height: 22px; padding: 0 6px; border: 0; border-radius: 4px; display: flex; align-items: center; gap: 5px; overflow: hidden; color: var(--event-color, var(--ln-text-secondary)); background: color-mix(in srgb, var(--event-color, var(--ln-text-secondary)) 9%, transparent); font: 500 10px/1 var(--ln-font); text-align: left; white-space: nowrap; text-overflow: ellipsis; cursor: pointer; i { width: 5px; height: 5px; flex: none; border-radius: 50%; background: currentColor; } &.is-accent { --event-color: var(--ln-accent); } &.is-success { --event-color: var(--ln-success); } &.is-warning { --event-color: var(--ln-warning); } &.is-danger { --event-color: var(--ln-danger); } }
.ln-calendar-day__more { padding: 1px 6px; color: var(--ln-text-tertiary); font-size: 10px; }
</style>

<template><button class="ln-sprint-row ln-focus-ring" :class="{selected}" type="button"><div class="ln-sprint-row__top"><strong>{{name}}</strong><LnBadge :tone="statusTone" dot>{{statusLabel}}</LnBadge></div><div class="ln-sprint-row__date"><span>{{team}}</span><span>·</span><span>{{startDate}} — {{endDate}}</span></div><div class="ln-sprint-row__bottom"><LnBadge>{{cadenceLabel}}</LnBadge><span>{{requirementCount}} 条需求</span></div><LnProgress v-if="progress!==undefined" :value="progress"/></button></template>
<script setup lang="ts">
import LnBadge from './LnBadge.vue'
import LnProgress from './LnProgress.vue'
withDefaults(defineProps<{
  name: string
  team: string
  startDate: string
  endDate: string
  statusLabel: string
  statusTone?: 'neutral' | 'accent' | 'success' | 'warning' | 'danger'
  cadenceLabel: string
  requirementCount?: number
  progress?: number
  selected?: boolean
}>(), { statusTone: 'neutral', requirementCount: 0 })
</script>
<style scoped lang="scss">.ln-sprint-row{width:100%;padding:11px;display:grid;gap:8px;border:1px solid transparent;border-radius:8px;background:transparent;color:var(--ln-text);font-family:var(--ln-font);text-align:left;cursor:pointer;transition:background var(--ln-fast),border var(--ln-fast);&:hover{background:var(--ln-surface-hover)}&.selected{border-color:var(--ln-border);background:var(--ln-surface);box-shadow:0 1px 3px rgba(20,20,24,.05)}}.ln-sprint-row__top{display:flex;align-items:center;justify-content:space-between;gap:8px;strong{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13px;font-weight:580}}.ln-sprint-row__date{display:flex;gap:5px;color:var(--ln-text-tertiary);font-size:11px}.ln-sprint-row__bottom{display:flex;align-items:center;justify-content:space-between;color:var(--ln-text-tertiary);font-size:11px}</style>

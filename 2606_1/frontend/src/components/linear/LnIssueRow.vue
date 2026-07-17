<template>
  <button class="ln-issue-row ln-focus-ring" type="button" :class="{ 'is-selected': selected }" @click="$emit('select')">
    <span class="ln-issue-row__status" :style="{ color: statusColor }"><span /></span>
    <span class="ln-issue-row__id">{{ issueKey }}</span>
    <span class="ln-issue-row__title">{{ title }}</span>
    <span class="ln-issue-row__meta"><slot name="meta" /></span>
    <LnBadge v-if="priority" :tone="priority === '紧急' ? 'danger' : priority === '高' ? 'warning' : 'neutral'" dot>{{ priority }}</LnBadge>
    <span v-if="assignee" class="ln-issue-row__avatar" :title="assignee">{{ assignee.slice(-2) }}</span>
  </button>
</template>
<script setup lang="ts">
import LnBadge from './LnBadge.vue'
withDefaults(defineProps<{ issueKey:string; title:string; statusColor?:string; priority?:string; assignee?:string; selected?:boolean }>(), { statusColor: '#9b9ba4' })
defineEmits<{ (e:'select'):void }>()
</script>
<style scoped lang="scss">
.ln-issue-row { width: 100%; min-height: var(--ln-row); padding: 0 10px; display: grid; grid-template-columns: 18px 66px minmax(160px,1fr) auto auto 26px; align-items: center; gap: 8px; border: 0; border-bottom: 1px solid var(--ln-border); background: var(--ln-surface); color: var(--ln-text); font: 400 13px/1 var(--ln-font); text-align: left; cursor: pointer; transition: background var(--ln-fast); &:hover { background: var(--ln-surface-hover); }.is-selected { background: var(--ln-accent-soft); } }
.ln-issue-row__status { width: 14px; height: 14px; border: 1.5px solid currentColor; border-radius: 50%; display: grid; place-items: center; span { width: 6px; height: 6px; border-radius: 50%; background: currentColor; } }.ln-issue-row__id { color: var(--ln-text-tertiary); font-size: 12px; }.ln-issue-row__title { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }.ln-issue-row__meta { display: flex; gap: 4px; }.ln-issue-row__avatar { width: 24px; height: 24px; display: grid; place-items: center; border-radius: 50%; background: #e7e5df; color: #6e6759; font-size: 10px; font-weight: 600; }
@media (max-width: 720px) { .ln-issue-row { grid-template-columns: 18px 54px minmax(100px,1fr) auto; }.ln-issue-row__meta,.ln-issue-row__avatar { display:none; } }
</style>

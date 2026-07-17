<template><section class="ln-board-column"><header><span class="ln-board-column__dot" :style="{color}"/><strong>{{title}}</strong><span class="ln-board-column__count">{{count}}</span><slot name="actions"/></header><div class="ln-board-column__body"><slot/><div v-if="count===0" class="ln-board-column__empty"><span>◇</span><small>{{emptyText}}</small></div></div></section></template>
<script setup lang="ts">
withDefaults(defineProps<{
  title: string
  count: number
  color?: string
  emptyText?: string
}>(), { color: 'var(--ln-text-tertiary)', emptyText: '暂无需求' })
</script>
<style scoped lang="scss">.ln-board-column{width:292px;min-width:292px;height:100%;display:flex;flex-direction:column;font-family:var(--ln-font)}.ln-board-column>header{height:38px;padding:0 8px;display:flex;align-items:center;gap:7px;color:var(--ln-text);strong{font-size:12px;font-weight:580}.ln-board-column__count{min-width:20px;color:var(--ln-text-tertiary);font-size:10px;font-variant-numeric:tabular-nums}}.ln-board-column__dot{width:9px;height:9px;border:1.5px solid currentColor;border-radius:50%;box-shadow:inset 0 0 0 2px var(--ln-canvas);background:currentColor}.ln-board-column__body{min-height:120px;flex:1;padding:5px;display:flex;flex-direction:column;gap:7px;border:1px solid var(--ln-border);border-radius:9px;background:rgba(35,35,40,.025)}.ln-board-column__empty{min-height:110px;display:grid;place-content:center;justify-items:center;gap:6px;color:var(--ln-text-tertiary);span{font-size:18px}small{font-size:10px}}</style>

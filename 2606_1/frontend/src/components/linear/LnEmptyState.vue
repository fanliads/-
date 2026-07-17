<template><div class="ln-empty-state" :class="{'is-compact':compact}"><div class="ln-empty-state__mark"><slot name="icon">⌕</slot></div><strong>{{title}}</strong><p v-if="description">{{description}}</p><div v-if="$slots.default" class="ln-empty-state__action"><slot/></div></div></template>
<script setup lang="ts">
defineProps<{
  title: string
  description?: string
  compact?: boolean
}>()
</script>
<style scoped lang="scss">.ln-empty-state{min-height:180px;padding:28px;display:grid;place-content:center;justify-items:center;gap:7px;text-align:center;color:var(--ln-text-tertiary);font-family:var(--ln-font)}.ln-empty-state.is-compact{min-height:112px;padding:18px}.ln-empty-state__mark{width:36px;height:36px;margin-bottom:3px;display:grid;place-items:center;border:1px solid var(--ln-border);border-radius:9px;background:var(--ln-canvas);color:var(--ln-text-secondary);font-size:16px;box-shadow:inset 0 1px #fff}.is-compact .ln-empty-state__mark{width:30px;height:30px}.ln-empty-state strong{color:var(--ln-text);font-size:13px;font-weight:570}.ln-empty-state p{max-width:390px;color:var(--ln-text-tertiary);font-size:11px;line-height:1.55}.ln-empty-state__action{margin-top:7px}</style>

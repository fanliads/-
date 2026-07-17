<template><button class="ln-workspace-switcher ln-focus-ring" :class="{collapsed}" type="button"><span class="ln-workspace-switcher__mark">{{mark}}</span><span v-if="!collapsed" class="ln-workspace-switcher__copy"><strong>{{name}}</strong><small>{{subtitle}}</small></span><span v-if="!collapsed" class="ln-workspace-switcher__chevron"><LnIcon name="chevron-down" /></span></button></template>
<script setup lang="ts">
import LnIcon from './LnIcon.vue'

withDefaults(defineProps<{
  name: string
  subtitle?: string
  mark?: string
  collapsed?: boolean
}>(), { subtitle: '', mark: '需' })
</script>
<style scoped lang="scss">.ln-workspace-switcher{min-width:0;flex:1;height:40px;padding:3px 4px;display:flex;align-items:center;gap:9px;border:1px solid transparent;border-radius:8px;background:transparent;color:var(--ln-text);font-family:var(--ln-font);text-align:left;cursor:pointer;&:hover{border-color:var(--ln-border);background:var(--ln-surface)}}.ln-workspace-switcher__mark{width:30px;height:30px;display:grid;place-items:center;flex:0 0 auto;border-radius:7px;background:#252529;color:#fff;font-size:11px;font-weight:700;box-shadow:0 2px 6px rgba(20,20,24,.15)}.ln-workspace-switcher__copy{min-width:0;flex:1;display:grid;gap:2px;strong{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;font-weight:600}small{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--ln-text-tertiary);font-size:9px}}.ln-workspace-switcher__chevron{width:28px;height:28px;display:grid;place-items:center;flex:0 0 28px;border-radius:6px;color:var(--ln-text-tertiary);font-size:14px}.ln-workspace-switcher:hover .ln-workspace-switcher__chevron{background:var(--ln-surface-hover);color:var(--ln-text-secondary)}.collapsed{width:40px;flex:0 0 40px;padding:4px;justify-content:center}.collapsed .ln-workspace-switcher__mark{width:30px;height:30px}</style>

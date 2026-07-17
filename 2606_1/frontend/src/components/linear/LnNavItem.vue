<template><RouterLink :to="to" class="ln-nav-item ln-focus-ring" :class="{active,collapsed}" :title="collapsed?label:''"><span class="ln-nav-item__icon" v-html="icon"/><span v-if="!collapsed" class="ln-nav-item__label">{{label}}</span><span v-if="!collapsed&&badge" class="ln-nav-item__badge">{{badge}}</span></RouterLink></template>
<script setup lang="ts">
import { RouterLink } from 'vue-router'
defineProps<{
  to: string
  label: string
  icon: string
  badge?: string
  active?: boolean
  collapsed?: boolean
}>()
</script>
<style scoped lang="scss">.ln-nav-item{position:relative;min-height:34px;padding:0 9px;display:flex;align-items:center;gap:9px;border-radius:6px;color:var(--ln-text-secondary);font:12px var(--ln-font);text-decoration:none;transition:background var(--ln-fast),color var(--ln-fast);&:hover{background:var(--ln-surface-hover);color:var(--ln-text)}&.active{background:var(--ln-surface-active);color:var(--ln-text);font-weight:560}}.ln-nav-item__icon{width:17px;height:17px;display:grid;place-items:center;flex:0 0 auto}.ln-nav-item__label{min-width:0;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ln-nav-item__badge{min-width:18px;height:18px;padding:0 5px;display:grid;place-items:center;border-radius:9px;background:var(--ln-surface);color:var(--ln-text-tertiary);font-size:9px}.collapsed{width:40px;height:36px;padding:0;justify-content:center;margin:auto}.active::before{content:'';position:absolute;left:-7px;width:2px;height:16px;border-radius:2px;background:var(--ln-accent)}</style>

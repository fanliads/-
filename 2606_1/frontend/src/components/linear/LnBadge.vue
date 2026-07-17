<template><span class="ln-badge" :class="[`is-${tone}`, { 'has-dot': dot }]" :style="customStyle"><i v-if="dot" /><slot /></span></template>
<script setup lang="ts">
import { computed } from 'vue'
const props = withDefaults(defineProps<{ tone?: 'neutral'|'accent'|'success'|'warning'|'danger'; dot?: boolean; color?: string }>(), { tone: 'neutral' })
const customStyle = computed(() => props.color ? { '--badge-color': props.color } : undefined)
</script>
<style scoped lang="scss">
.ln-badge { --badge-color: var(--ln-text-secondary); min-height: 22px; padding: 0 7px; display: inline-flex; align-items: center; gap: 5px; border-radius: var(--ln-radius-sm); background: color-mix(in srgb, var(--badge-color) 10%, transparent); color: var(--badge-color); font: 520 11px/1 var(--ln-font); white-space: nowrap; border: 1px solid color-mix(in srgb, var(--badge-color) 10%, transparent); i { width: 6px; height: 6px; border-radius: 50%; background: currentColor; } }
.is-accent { --badge-color: var(--ln-accent); }.is-success { --badge-color: var(--ln-success); }.is-warning { --badge-color: var(--ln-warning); }.is-danger { --badge-color: var(--ln-danger); }
</style>

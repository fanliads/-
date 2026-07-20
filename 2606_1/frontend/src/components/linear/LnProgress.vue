<template><div class="ln-progress"><div class="ln-progress__track"><span :style="{width:`${safeValue}%`,background:progressColor}"/></div><span v-if="showLabel" class="ln-progress__label">{{safeValue}}%</span></div></template>
<script setup lang="ts">
import { computed } from 'vue'
const props = withDefaults(defineProps<{
  value: number
  color?: string
  tone?: 'neutral' | 'accent' | 'success' | 'warning' | 'danger'
  showLabel?: boolean
}>(), { tone: 'accent', showLabel: true })
const safeValue = computed(() => Math.max(0, Math.min(100, Math.round(props.value))))
const progressColor = computed(() => props.color || ({ neutral: 'var(--ln-text-tertiary)', accent: 'var(--ln-accent)', success: 'var(--ln-success)', warning: 'var(--ln-warning)', danger: 'var(--ln-danger)' })[props.tone])
</script>
<style scoped lang="scss">.ln-progress{display:flex;align-items:center;gap:8px;font-family:var(--ln-font)}.ln-progress__track{height:5px;flex:1;overflow:hidden;border-radius:99px;background:var(--ln-surface-active);span{height:100%;display:block;border-radius:inherit;transition:width var(--ln-normal)}}.ln-progress__label{min-width:28px;color:var(--ln-text-tertiary);font-size:11px;font-variant-numeric:tabular-nums;text-align:right}</style>

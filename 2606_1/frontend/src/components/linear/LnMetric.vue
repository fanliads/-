<template>
  <div class="ln-metric" :class="`is-${tone}`">
    <div class="ln-metric__head">
      <span>{{ label }}</span>
      <slot name="icon" />
    </div>
    <div class="ln-metric__value">{{ value }}<small v-if="unit">{{ unit }}</small></div>
    <div v-if="description || trend" class="ln-metric__foot">
      <span v-if="trend" :class="{ 'is-positive': trendTone === 'positive', 'is-negative': trendTone === 'negative' }">{{ trend }}</span>
      <small v-if="description">{{ description }}</small>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  label: string
  value: string | number
  unit?: string
  description?: string
  trend?: string
  trendTone?: 'neutral' | 'positive' | 'negative'
  tone?: 'neutral' | 'accent' | 'warning' | 'danger' | 'success'
}>(), { tone: 'neutral', trendTone: 'neutral' })
</script>

<style scoped lang="scss">
.ln-metric { --metric-color: var(--ln-text-secondary); min-width: 150px; padding: 14px 15px; border: 1px solid var(--ln-border); border-radius: var(--ln-radius-lg); display: grid; gap: 8px; background: linear-gradient(180deg, color-mix(in srgb, var(--metric-color) 4%, var(--ln-surface)), var(--ln-surface)); box-shadow: 0 1px 2px rgba(20,20,24,.03); font-family: var(--ln-font); &.is-accent { --metric-color: var(--ln-accent); } &.is-warning { --metric-color: var(--ln-warning); } &.is-danger { --metric-color: var(--ln-danger); } &.is-success { --metric-color: var(--ln-success); } }
.ln-metric__head { display: flex; align-items: center; justify-content: space-between; color: var(--ln-text-tertiary); font-size: 11px; font-weight: 520; }
.ln-metric__value { color: var(--ln-text); font-size: 25px; font-weight: 620; line-height: 1; letter-spacing: -.035em; small { margin-left: 4px; color: var(--ln-text-secondary); font-size: 11px; font-weight: 500; letter-spacing: 0; } }
.ln-metric__foot { display: flex; align-items: center; gap: 7px; color: var(--ln-text-tertiary); font-size:11px; span { color: var(--ln-text-secondary); font-weight: 550; &.is-positive { color: var(--ln-success); } &.is-negative { color: var(--ln-danger); } } small { font-size: inherit; } }
</style>

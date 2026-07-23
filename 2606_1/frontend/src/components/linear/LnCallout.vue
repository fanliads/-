<template>
  <aside class="ln-callout" :class="`is-${tone}`" :role="tone === 'danger' ? 'alert' : 'status'">
    <span class="ln-callout__icon" aria-hidden="true"><slot name="icon"><LnIcon :name="defaultIcon"/></slot></span>
    <div class="ln-callout__copy">
      <strong>{{ title }}</strong>
      <p v-if="description">{{ description }}</p>
      <slot />
    </div>
    <div v-if="$slots.action" class="ln-callout__action"><slot name="action" /></div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import LnIcon from './LnIcon.vue'

const props = withDefaults(defineProps<{
  title: string
  description?: string
  tone?: 'neutral' | 'info' | 'success' | 'warning' | 'danger'
}>(), { tone: 'neutral' })

const defaultIcon = computed(() => ({ neutral: 'info', info: 'info', success: 'check', warning: 'warning', danger: 'warning' } as const)[props.tone])
</script>

<style scoped lang="scss">
.ln-callout { --callout-color: var(--ln-text-secondary); padding: 12px 13px; border: 1px solid color-mix(in srgb, var(--callout-color) 18%, transparent); border-radius: var(--ln-radius-lg); display: grid; grid-template-columns:auto minmax(0,1fr) auto; align-items:flex-start; gap:10px; color:var(--ln-text); background:color-mix(in srgb,var(--callout-color) 7%,var(--ln-surface)); font-family:var(--ln-font); &.is-info { --callout-color:var(--ln-accent); } &.is-success { --callout-color:var(--ln-success); } &.is-warning { --callout-color:var(--ln-warning); } &.is-danger { --callout-color:var(--ln-danger); } }
.ln-callout__icon { width:20px;height:20px;border-radius:50%;display:grid;place-items:center;color:#fff;background:var(--callout-color);:deep(svg){width:13px;height:13px} }
.ln-callout__copy { display:grid;gap:3px; strong { font-size:12px;font-weight:600;line-height:19px; } p { margin:0;color:var(--ln-text-secondary);font-size:11px;line-height:1.55; } }
.ln-callout__action { align-self:center; }
</style>

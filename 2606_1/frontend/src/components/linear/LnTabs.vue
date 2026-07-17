<template>
  <div class="ln-tabs" :class="[`is-${variant}`, { 'is-fluid': fluid }]" role="tablist" :aria-label="ariaLabel">
    <button
      v-for="option in options"
      :key="option.value"
      class="ln-tabs__item ln-focus-ring"
      :class="{ 'is-active': modelValue === option.value }"
      type="button"
      role="tab"
      :aria-selected="modelValue === option.value"
      :tabindex="modelValue === option.value ? 0 : -1"
      :disabled="option.disabled"
      @click="$emit('update:modelValue', option.value)"
    >
      <span v-if="option.icon" class="ln-tabs__icon" v-html="option.icon" />
      <span>{{ option.label }}</span>
      <span v-if="option.count !== undefined" class="ln-tabs__count">{{ option.count }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import type { LnTabOption } from './types'

withDefaults(defineProps<{
  modelValue: string
  options: LnTabOption[]
  variant?: 'underline' | 'segmented'
  fluid?: boolean
  ariaLabel?: string
}>(), { variant: 'underline', ariaLabel: '页面标签' })

defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<style scoped lang="scss">
.ln-tabs { display: flex; align-items: center; gap: 2px; min-width: 0; }
.ln-tabs__item { position: relative; height: 34px; padding: 0 10px; border: 0; border-radius: var(--ln-radius-sm); display: inline-flex; align-items: center; justify-content: center; gap: 6px; color: var(--ln-text-secondary); background: transparent; font: 500 12px/1 var(--ln-font); white-space: nowrap; cursor: pointer; transition: color var(--ln-fast), background var(--ln-fast); &:hover:not(:disabled) { color: var(--ln-text); background: var(--ln-surface-hover); } &:disabled { opacity: .42; cursor: not-allowed; } }
.ln-tabs__icon { width: 14px; height: 14px; display: inline-flex; :deep(svg) { width: 100%; height: 100%; } }
.ln-tabs__count { min-width: 18px; height: 18px; padding: 0 5px; border-radius: 9px; display: inline-flex; align-items: center; justify-content: center; color: var(--ln-text-tertiary); background: var(--ln-surface-active); font-size: 10px; }
.is-underline { gap: 8px; border-bottom: 1px solid var(--ln-border); .ln-tabs__item { height: 38px; padding: 0 4px; border-radius: 0; &:hover:not(:disabled) { background: transparent; } &::after { content: ''; position: absolute; right: 4px; bottom: -1px; left: 4px; height: 2px; border-radius: 2px 2px 0 0; background: transparent; } &.is-active { color: var(--ln-text); &::after { background: var(--ln-accent); } } } }
.is-segmented { width: fit-content; padding: 2px; border: 1px solid var(--ln-border); border-radius: var(--ln-radius-md); background: var(--ln-surface-hover); .ln-tabs__item { height: 27px; padding: 0 9px; &.is-active { color: var(--ln-text); background: var(--ln-surface); box-shadow: 0 1px 3px rgba(20,20,24,.09), inset 0 0 0 1px rgba(35,35,40,.04); } } }
.is-fluid { width: 100%; .ln-tabs__item { flex: 1; } }
</style>

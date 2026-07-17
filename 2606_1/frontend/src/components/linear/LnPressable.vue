<template>
  <button
    class="ln-pressable ln-focus-ring"
    :class="[`is-${variant}`, { 'is-selected': selected, selected }]"
    type="button"
    :disabled="disabled"
    :aria-label="ariaLabel"
    :aria-pressed="selectable ? selected : undefined"
    :data-selected="selected || undefined"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  selected?: boolean
  selectable?: boolean
  disabled?: boolean
  ariaLabel?: string
  variant?: 'bare' | 'surface'
}>(), { selected: false, selectable: true, disabled: false, variant: 'bare' })
</script>

<style scoped lang="scss">
.ln-pressable {
  box-sizing: border-box;
  margin: 0;
  border: 0;
  color: inherit;
  font: inherit;
  text-align: inherit;
  cursor: pointer;
  appearance: none;
  transition: background var(--ln-fast), border-color var(--ln-fast), box-shadow var(--ln-fast), transform var(--ln-fast);

  &:active:not(:disabled) { transform: translateY(1px); }
  &:disabled { opacity: .48; cursor: not-allowed; }

  &.is-surface {
    padding: 10px;
    border: 1px solid var(--ln-border);
    border-radius: var(--ln-radius-lg);
    background: var(--ln-surface);

    &:hover:not(:disabled) { background: var(--ln-surface-hover); }
    &.is-selected { border-color: rgba(94, 106, 210, .34); background: var(--ln-accent-soft); }
  }
}
</style>

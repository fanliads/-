<template>
  <label class="ln-checkbox" :class="{ 'is-disabled': disabled }">
    <input
      class="ln-checkbox__native"
      type="checkbox"
      :checked="modelValue"
      :disabled="disabled"
      :aria-label="ariaLabel || label"
      @change="$emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
    />
    <span class="ln-checkbox__box ln-focus-ring" aria-hidden="true">
      <svg viewBox="0 0 12 12"><path d="m2.3 6.1 2.2 2.2 5.2-5.1" /></svg>
    </span>
    <span v-if="label || description" class="ln-checkbox__copy">
      <strong v-if="label">{{ label }}</strong>
      <small v-if="description">{{ description }}</small>
    </span>
    <slot />
  </label>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: boolean
  label?: string
  description?: string
  ariaLabel?: string
  disabled?: boolean
}>()

defineEmits<{ 'update:modelValue': [value: boolean] }>()
</script>

<style scoped lang="scss">
.ln-checkbox { position: relative; display: inline-flex; align-items: flex-start; gap: 8px; color: var(--ln-text); font-family: var(--ln-font); cursor: pointer; &.is-disabled { opacity: .48; cursor: not-allowed; } }
.ln-checkbox__native { position: absolute; width: 1px; height: 1px; opacity: 0; pointer-events: none; &:focus-visible + .ln-checkbox__box { outline: 2px solid rgba(94,106,210,.42); outline-offset: 1px; } &:checked + .ln-checkbox__box { border-color: var(--ln-accent); background: var(--ln-accent); svg { opacity: 1; transform: scale(1); } } }
.ln-checkbox__box { width: 16px; height: 16px; flex: none; margin-top: 1px; border: 1px solid var(--ln-border-strong); border-radius: 4px; display: grid; place-items: center; background: var(--ln-surface); transition: border-color var(--ln-fast), background var(--ln-fast); svg { width: 11px; height: 11px; opacity: 0; transform: scale(.7); fill: none; stroke: #fff; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; transition: opacity var(--ln-fast), transform var(--ln-fast); } }
.ln-checkbox__copy { display: grid; gap: 2px; strong { font-size: 12px; font-weight: 500; line-height: 18px; } small { color: var(--ln-text-tertiary); font-size: 11px; line-height: 1.45; } }
</style>

<template>
  <label class="ln-switch" :class="{ 'is-disabled': disabled }">
    <button
      class="ln-switch__control ln-focus-ring"
      :class="{ 'is-checked': modelValue }"
      type="button"
      role="switch"
      :aria-checked="modelValue"
      :aria-label="ariaLabel || label"
      :disabled="disabled"
      @click="$emit('update:modelValue', !modelValue)"
    ><span /></button>
    <span v-if="label || description" class="ln-switch__copy">
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
.ln-switch { display: inline-flex; align-items: flex-start; gap: 10px; color: var(--ln-text); font-family: var(--ln-font); cursor: pointer; &.is-disabled { opacity: .48; cursor: not-allowed; } }
.ln-switch__control { width: 30px; height: 18px; flex: none; padding: 2px; border: 0; border-radius: 9px; background: #c8c8ce; cursor: inherit; transition: background var(--ln-fast); span { display: block; width: 14px; height: 14px; border-radius: 50%; background: #fff; box-shadow: 0 1px 3px rgba(20,20,24,.28); transition: transform var(--ln-normal); } &.is-checked { background: var(--ln-accent); span { transform: translateX(12px); } } }
.ln-switch__copy { display: grid; gap: 3px; strong { font-size: 12px; font-weight: 550; line-height: 18px; } small { max-width: 360px; color: var(--ln-text-tertiary); font-size: 11px; line-height: 1.45; } }
</style>

<template>
  <div ref="root" class="ln-color-picker" :class="{ 'is-disabled': disabled }">
    <span v-if="label" class="ln-color-picker__label">{{ label }}</span>
    <div class="ln-color-picker__row" role="radiogroup" :aria-label="label || ariaLabel">
      <button
        v-for="(color, index) in colors"
        :key="color"
        class="ln-color-picker__swatch ln-focus-ring"
        :class="{ 'is-selected': isSelected(color) }"
        type="button"
        role="radio"
        :aria-label="color"
        :aria-checked="isSelected(color)"
        :tabindex="isSelected(color) || (!modelValue && index === 0) ? 0 : -1"
        :disabled="disabled"
        :style="{ '--swatch': color }"
        @click="choose(color)"
        @keydown.left.prevent="move(index, -1)"
        @keydown.up.prevent="move(index, -1)"
        @keydown.right.prevent="move(index, 1)"
        @keydown.down.prevent="move(index, 1)"
      ><span aria-hidden="true">✓</span></button>
    </div>
    <output v-if="showValue" class="ln-color-picker__value"><i :style="{ background: modelValue }" />{{ modelValue || '未选择' }}</output>
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref } from 'vue'

const props = withDefaults(defineProps<{
  modelValue?: string
  colors: string[]
  label?: string
  ariaLabel?: string
  disabled?: boolean
  showValue?: boolean
}>(), { modelValue: '', ariaLabel: '颜色选择', showValue: false })

const emit = defineEmits<{
  'update:modelValue': [value: string]
  change: [value: string]
}>()
const root = ref<HTMLElement>()

function isSelected(color: string) {
  return color.toLowerCase() === props.modelValue.toLowerCase()
}

function choose(color: string) {
  if (props.disabled || isSelected(color)) return
  emit('update:modelValue', color)
  emit('change', color)
}

function move(index: number, delta: number) {
  if (props.disabled || !props.colors.length) return
  const nextIndex = (index + delta + props.colors.length) % props.colors.length
  choose(props.colors[nextIndex])
  nextTick(() => root.value?.querySelectorAll<HTMLElement>('.ln-color-picker__swatch')[nextIndex]?.focus())
}
</script>

<style scoped lang="scss">
.ln-color-picker { display: grid; gap: 8px; color: var(--ln-text); font-family: var(--ln-font); &.is-disabled { opacity: .5; } }
.ln-color-picker__label { font-size: 12px; font-weight: 540; }
.ln-color-picker__row { display: flex; flex-wrap: wrap; gap: 8px; }
.ln-color-picker__swatch { --swatch: #8a8a92; position: relative; width: 28px; height: 28px; padding: 0; display: grid; place-items: center; border: 2px solid var(--ln-surface); border-radius: 50%; background: var(--swatch); color: #fff; box-shadow: 0 0 0 1px var(--ln-border-strong), inset 0 0 0 1px rgba(0,0,0,.06); cursor: pointer; transition: transform var(--ln-fast), box-shadow var(--ln-fast); span { opacity: 0; font-size: 12px; font-weight: 750; text-shadow: 0 1px 2px rgba(0,0,0,.3); } &:hover:not(:disabled) { transform: translateY(-1px) scale(1.06); } &.is-selected { box-shadow: 0 0 0 2px var(--ln-surface), 0 0 0 4px var(--swatch); span { opacity: 1; } } &:disabled { cursor: not-allowed; } }
.ln-color-picker__value { display: inline-flex; align-items: center; gap: 6px; color: var(--ln-text-tertiary); font: 11px ui-monospace, SFMono-Regular, Menlo, monospace; i { width: 8px; height: 8px; border-radius: 50%; } }
</style>

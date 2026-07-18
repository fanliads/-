<template>
  <LnPopover>
    <template #trigger>
      <button class="property-trigger ln-focus-ring" type="button">
        <span class="property-icon" :style="{ color: getOptionColor(selected) }">
          <span v-if="isPriorityOption(selected)" class="priority-dot" :style="{ backgroundColor: getOptionColor(selected) }"></span>
          <template v-else>{{ selected?.icon || '○' }}</template>
        </span>
        <span class="property-label">{{ selected?.label || placeholder }}</span>
        <span class="property-caret" aria-hidden="true"></span>
      </button>
    </template>

    <template #default="{ close }">
      <div class="property-list">
        <span class="property-title">{{ title }}</span>
        <button
          v-for="option in options"
          :key="option.value"
          class="property-option"
          type="button"
          :class="{ 'is-selected': modelValue === option.value }"
          @click="choose(option, close)"
        >
          <span class="property-option-icon" :style="{ color: getOptionColor(option) }">
            <span v-if="isPriorityOption(option)" class="priority-dot" :style="{ backgroundColor: getOptionColor(option) }"></span>
            <template v-else>{{ option.icon || '●' }}</template>
          </span>
          <span class="property-option-label">{{ option.label }}</span>
          <small v-if="option.description">{{ option.description }}</small>
          <b v-if="modelValue === option.value">✓</b>
        </button>
      </div>
    </template>
  </LnPopover>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import LnPopover from './LnPopover.vue'
import type { LnOption } from './types'

const props = withDefaults(defineProps<{
  modelValue?: string
  options: LnOption[]
  title?: string
  placeholder?: string
}>(), {
  title: '选择属性',
  placeholder: '未设置',
})

const emit = defineEmits<{ (e: 'update:modelValue', value: string): void }>()
const selected = computed(() => props.options.find((option) => option.value === props.modelValue))

const priorityColors: Record<string, string> = {
  P0: '#d84b4b',
  P1: '#e29a32',
  P2: '#4f6edb',
  P3: '#7a8393',
}

function normalizePriority(option?: LnOption): string {
  const value = String(option?.value || '').trim().toUpperCase()
  if (priorityColors[value]) return value
  const labelMatch = String(option?.label || '').toUpperCase().match(/\bP[0-3]\b/)
  return labelMatch?.[0] || ''
}

function isPriorityOption(option?: LnOption): boolean {
  return Boolean(normalizePriority(option))
}

function getOptionColor(option?: LnOption): string | undefined {
  return option?.color || priorityColors[normalizePriority(option)]
}

function choose(option: LnOption, close: () => void) {
  emit('update:modelValue', option.value)
  close()
}
</script>

<style scoped lang="scss">
.property-trigger {
  box-sizing: border-box;
  height: 28px;
  min-height: 28px;
  padding: 0 7px;
  display: inline-grid;
  grid-template-columns: 14px minmax(0, auto) 8px;
  align-items: center;
  gap: 6px;
  border: 1px solid transparent;
  border-radius: 5px;
  background: transparent;
  color: var(--ln-text-secondary);
  font: 12px/16px var(--ln-font);
  cursor: pointer;

  &:hover {
    border-color: var(--ln-border);
    background: var(--ln-surface-hover);
  }
}

.property-icon,
.property-option-icon {
  width: 14px;
  height: 18px;
  display: grid;
  place-items: center;
  font-size: 13px;
  line-height: 1;
}

.priority-dot {
  width: 8px;
  height: 8px;
  display: block;
  border-radius: 50%;
  box-shadow: 0 0 0 1px rgba(17, 24, 39, 0.08);
}

.property-label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 16px;
}

.property-caret {
  width: 6px;
  height: 6px;
  align-self: center;
  justify-self: center;
  border-right: 1.5px solid var(--ln-text-tertiary);
  border-bottom: 1.5px solid var(--ln-text-tertiary);
  transform: translateY(-1px) rotate(45deg);
}

.property-list {
  width: 230px;
  display: grid;
  gap: 2px;
  font-family: var(--ln-font);
}

.property-title {
  padding: 6px 8px;
  color: var(--ln-text-tertiary);
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.property-option {
  min-height: 34px;
  padding: 6px 8px;
  display: grid;
  grid-template-columns: 18px minmax(0, 1fr) 18px;
  align-items: center;
  column-gap: 7px;
  border: 0;
  border-radius: 5px;
  background: transparent;
  color: var(--ln-text);
  text-align: left;
  cursor: pointer;

  &:hover,
  &.is-selected {
    background: var(--ln-surface-hover);
  }

  small {
    grid-column: 2 / 4;
    color: var(--ln-text-tertiary);
    font-size: 10px;
    line-height: 14px;
  }

  b {
    grid-column: 3;
    grid-row: 1;
    align-self: center;
    justify-self: center;
    color: var(--ln-accent);
    font-size: 11px;
    line-height: 1;
  }
}

.property-option-label {
  min-width: 0;
  font-size: 12px;
  line-height: 18px;
}
</style>

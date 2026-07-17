<template>
  <LnInlineSelect
    :model-value="value"
    :options="options"
    :placeholder="placeholder"
    :search-placeholder="searchPlaceholder"
    :popover-width="popoverWidth"
    @save="$emit('save', $event)"
  >
    <template v-if="$slots.default" #default="slotProps"><slot v-bind="slotProps" /></template>
  </LnInlineSelect>
</template>

<script setup lang="ts">
import { LnInlineSelect, type LnInlineOption } from '@/components/linear'

withDefaults(defineProps<{
  value: string | number | undefined
  options?: LnInlineOption[]
  placeholder?: string
  searchPlaceholder?: string
  popoverWidth?: number
}>(), {
  options: () => [],
  placeholder: '未设置',
  searchPlaceholder: '搜索或选择…',
  popoverWidth: 240,
})

defineEmits<{
  (event: 'save', value: string | number): void
}>()
</script>

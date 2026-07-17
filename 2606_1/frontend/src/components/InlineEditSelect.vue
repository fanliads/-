<template>
  <div class="inline-edit-select">
    <LnInlineSelect
      :model-value="value"
      :options="normalizedOptions"
      :placeholder="placeholder"
      @save="emit('save', String($event))"
    >
      <span class="select-value">{{ displayLabel }}</span>
    </LnInlineSelect>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { LnInlineSelect } from './linear'

interface OptionItem {
  label: string
  value: string
}

const props = defineProps<{
  value?: string
  options?: OptionItem[]
  placeholder?: string
}>()

const emit = defineEmits<{
  (e: 'save', value: string): void
}>()

const normalizedOptions = computed(() => {
  return props.options || []
})

const displayLabel = computed(() => {
  const found = normalizedOptions.value.find(o => o.value === (props.value || ''))
  return found?.label || props.value || props.placeholder || '点击编辑'
})

</script>

<style lang="scss" scoped>
.inline-edit-select {
  cursor: pointer;
  min-height: 20px;

  .select-value {
    display: block;
    padding: 2px 4px;
    border-radius: 4px;
    transition: background 0.15s;

    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>

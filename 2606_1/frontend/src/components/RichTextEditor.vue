<template>
  <LnRichTextEditor
    :model-value="modelValue"
    :placeholder="placeholder"
    @update:model-value="$emit('update:modelValue', $event)"
  />
</template>

<script setup lang="ts">
import { LnRichTextEditor } from '@/components/linear'

withDefaults(defineProps<{
  modelValue?: string
  placeholder?: string
}>(), { modelValue: '' })

defineEmits<{
  (event: 'update:modelValue', value: string): void
}>()
</script>

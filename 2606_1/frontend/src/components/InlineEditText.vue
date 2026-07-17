<template>
  <div class="inline-edit-text" @click="startEdit">
    <span v-if="!isEditing" class="text-value">{{ displayValue }}</span>
    <span v-else ref="editorRef" class="inline-edit-text__editor" @click.stop @focusout="handleFocusOut">
      <LnInput
      v-if="type !== 'textarea'"
      v-model="editValue"
      :placeholder="placeholder"
      @keydown="handleKeydown"
    />
      <LnTextarea
      v-else
      v-model="editValue"
      :rows="2"
      :placeholder="placeholder"
      @keydown="handleTextareaKeydown"
      />
    </span>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, computed } from 'vue'
import { LnInput, LnTextarea } from './linear'

const props = defineProps<{
  value?: string
  placeholder?: string
  type?: 'text' | 'textarea'
}>()

const emit = defineEmits<{
  (e: 'save', value: string): void
}>()

const isEditing = ref(false)
const editValue = ref('')
const editorRef = ref<HTMLElement | null>(null)

const displayValue = computed(() => {
  return props.value || props.placeholder || '点击编辑'
})

function startEdit() {
  isEditing.value = true
  editValue.value = props.value || ''
  nextTick(() => editorRef.value?.querySelector<HTMLElement>('input, textarea')?.focus())
}

function cancel() {
  isEditing.value = false
  editValue.value = props.value || ''
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter') save()
  if (event.key === 'Escape') cancel()
}

function handleTextareaKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') cancel()
  if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') save()
}

function handleFocusOut(event: FocusEvent) {
  if (!editorRef.value?.contains(event.relatedTarget as Node | null)) save()
}

function save() {
  if (!isEditing.value) return
  isEditing.value = false
  if (editValue.value !== (props.value || '')) {
    emit('save', editValue.value)
  }
}
</script>

<style lang="scss" scoped>
.inline-edit-text {
  cursor: pointer;
  min-height: 20px;

  .text-value {
    display: inline-block;
    padding: 2px 4px;
    border-radius: 4px;
    transition: background 0.15s;

    &:hover {
      background: rgba(0, 113, 227, 0.06);
    }
  }

  .inline-edit-text__editor { display: block; width: 100%; }
}
</style>

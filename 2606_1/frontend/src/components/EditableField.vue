<template>
  <div class="editable-field" :class="{ 'is-select': type === 'select' }" @click="handleContainerClick">
    <LnInlineSelect
      v-if="type === 'select'"
      :model-value="value"
      :options="options"
      :placeholder="placeholder"
      @save="emit('save', $event)"
    />
    <template v-else-if="!isEditing">
      <span class="display-value" :class="{ 'editable-hint': !isReadonly, 'is-placeholder': isEmpty && !!placeholder }">
        {{ displayValue }}
      </span>
      <span v-if="!isReadonly" class="edit-icon" :class="{ 'always-show': isEmpty && !!placeholder }">&#9998;</span>
    </template>
    <span v-else ref="editorRef" class="editable-field__editor" @click.stop @focusout="handleFocusOut">
      <LnInput
        v-if="type === 'text'"
        v-model="editValue"
        :placeholder="placeholder"
        @keydown="handleKeydown"
      />
      <LnTextarea
        v-else-if="type === 'textarea'"
        v-model="editValue"
        :rows="2"
        :placeholder="placeholder"
        @keydown="handleTextareaKeydown"
      />
      <LnDateInput
        v-else-if="type === 'date'"
        v-model="editValue"
        @change="confirmEdit"
      />
      <LnSwitch
        v-else-if="type === 'switch'"
        :model-value="editValue === 1"
        aria-label="切换值"
        @update:model-value="confirmSwitch"
      />
    </span>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { LnDateInput, LnInlineSelect, LnInput, LnSwitch, LnTextarea } from './linear'

interface OptionItem {
  label: string
  value: string | number
}

const props = defineProps<{
  value: string | number | undefined
  type?: 'text' | 'select' | 'date' | 'switch' | 'textarea'
  options?: OptionItem[]
  placeholder?: string
}>()

const emit = defineEmits<{
  save: [value: string | number]
}>()

const isEditing = ref(false)
const editValue = ref<any>(props.value)
const editorRef = ref<HTMLElement | null>(null)
const isReadonly = computed(() => !props.type || props.type === 'text' && props.value === undefined && false)

const isEmpty = computed(() => {
  return props.value === undefined || props.value === null || props.value === ''
})

const displayValue = computed(() => {
  if (props.type === 'switch') {
    return props.value === 1 ? '是' : '否'
  }
  if (props.type === 'select' && props.options) {
    const found = props.options.find(o => String(o.value) === String(props.value ?? ''))
    return found ? found.label : (props.value || props.placeholder || '-')
  }
  if (props.type === 'date' && !props.value) {
    return props.placeholder || '-'
  }
  return props.value || props.placeholder || '-'
})

function handleContainerClick() {
  if (props.type === 'select') return
  startEdit()
}

function startEdit() {
  if (!props.type) return
  editValue.value = props.value
  isEditing.value = true
  nextTick(() => editorRef.value?.querySelector<HTMLElement>('input, textarea, button')?.focus())
}

function cancelEdit() {
  isEditing.value = false
  editValue.value = props.value
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter') confirmEdit()
  if (event.key === 'Escape') cancelEdit()
}

function handleTextareaKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') cancelEdit()
  if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') confirmEdit()
}

function handleFocusOut(event: FocusEvent) {
  if (!editorRef.value?.contains(event.relatedTarget as Node | null)) confirmEdit()
}

function confirmSwitch(value: boolean) {
  editValue.value = value ? 1 : 0
  confirmEdit()
}

function confirmEdit() {
  if (!isEditing.value) return
  isEditing.value = false
  if (editValue.value !== props.value) {
    emit('save', editValue.value)
  }
}
</script>

<style scoped>
.editable-field {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  min-width: 40px;
}
.editable-field.is-select {
  display: flex;
  width: 100%;
}
.display-value {
  border-bottom: 1px dashed transparent;
  transition: all 0.2s;
}
.editable-hint {
  border-bottom: 1px dashed transparent;
}
.editable-hint:hover {
  border-bottom-color: var(--primary);
  color: var(--primary);
}
.is-placeholder {
  color: var(--text-secondary, #86868b);
  font-style: italic;
  font-size: 12px;
}
.edit-icon {
  font-size: 11px;
  color: var(--primary);
  opacity: 0;
  transition: opacity 0.2s;
}
.edit-icon.always-show {
  opacity: 0.7;
}
.editable-field:hover .edit-icon {
  opacity: 1;
}
.editable-field__editor { display: block; width: 100%; min-width: 160px; }
</style>

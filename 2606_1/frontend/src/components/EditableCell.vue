<template>
  <div class="editable-cell" @click="handleContainerClick">
    <LnInlineSelect
      v-if="type === 'select'"
      :model-value="value"
      :options="options"
      :placeholder="placeholder"
      @save="emit('save', $event)"
    >
      <slot>
        <span class="display-value" :class="{ 'editable-hint': true }">
          {{ displayValue }}
        </span>
      </slot>
    </LnInlineSelect>
    <template v-else-if="!isEditing">
      <slot>
        <span class="display-value" :class="{ 'editable-hint': true }">
          {{ displayValue }}
        </span>
      </slot>
    </template>
    <span v-else ref="editorRef" class="editable-cell__editor" @click.stop @focusout="handleFocusOut">
      <LnInput
        v-if="type === 'text'"
        v-model="editValue"
        :placeholder="placeholder"
        @keydown="handleKeydown"
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
import { LnDateInput, LnInlineSelect, LnInput, LnSwitch } from './linear'

interface OptionItem {
  label: string
  value: string | number
}

const props = defineProps<{
  value: string | number | undefined
  type?: 'text' | 'select' | 'date' | 'switch'
  options?: OptionItem[]
  placeholder?: string
}>()

const emit = defineEmits<{
  save: [value: string | number]
}>()

const isEditing = ref(false)
const editValue = ref<any>(props.value)
const editorRef = ref<HTMLElement | null>(null)

const displayValue = computed(() => {
  if (props.type === 'switch') {
    return props.value === 1 ? '是' : '否'
  }
  if (props.type === 'select' && props.options) {
    const found = props.options.find(o => String(o.value) === String(props.value ?? ''))
    return found ? found.label : (props.value || props.placeholder || '-')
  }
  if (props.type === 'date' && !props.value) {
    return '-'
  }
  return props.value || '-'
})

function handleContainerClick() {
  if (props.type === 'select') return
  startEdit()
}

function startEdit() {
  editValue.value = props.value
  isEditing.value = true
  nextTick(() => editorRef.value?.querySelector<HTMLElement>('input, textarea, button')?.focus())
}

function confirmEdit() {
  if (!isEditing.value) return
  isEditing.value = false
  if (editValue.value !== props.value) {
    emit('save', editValue.value)
  }
}

function cancelEdit() {
  isEditing.value = false
  editValue.value = props.value
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter') confirmEdit()
  if (event.key === 'Escape') cancelEdit()
}

function handleFocusOut(event: FocusEvent) {
  if (!editorRef.value?.contains(event.relatedTarget as Node | null)) confirmEdit()
}

function confirmSwitch(value: boolean) {
  editValue.value = value ? 1 : 0
  confirmEdit()
}
</script>

<style scoped>
.editable-cell {
  display: inline-flex;
  align-items: center;
  width: 100%;
  min-width: 0;
  min-height: 28px;
  padding: 0 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.16s ease, color 0.16s ease;

  &:hover {
    background: rgba(17, 24, 39, 0.04);
  }
}

.display-value {
  display: block;
  width: 100%;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color 0.16s ease;
}

.editable-cell__editor { display: block; width: 100%; }

.editable-hint:hover {
  color: inherit;
}
</style>

<template>
  <div class="editable-field" @click="startEdit">
    <template v-if="!isEditing">
      <span class="display-value" :class="{ 'editable-hint': !isReadonly, 'is-placeholder': isEmpty && !!placeholder }">
        {{ displayValue }}
      </span>
      <span v-if="!isReadonly" class="edit-icon" :class="{ 'always-show': isEmpty && !!placeholder }">&#9998;</span>
    </template>
    <template v-else>
      <el-input
        v-if="type === 'text' || type === 'textarea'"
        ref="inputRef"
        v-model="editValue"
        :type="type === 'textarea' ? 'textarea' : 'text'"
        :rows="type === 'textarea' ? 2 : 1"
        size="small"
        @blur="confirmEdit"
        @keyup.enter="confirmEdit"
      />
      <el-select
        v-else-if="type === 'select'"
        ref="inputRef"
        v-model="editValue"
        size="small"
        style="width: 100%"
        @change="confirmEdit"
        @blur="confirmEdit"
      >
        <el-option
          v-for="opt in options"
          :key="opt.value"
          :label="opt.label"
          :value="opt.value"
        />
      </el-select>
      <el-date-picker
        v-else-if="type === 'date'"
        ref="inputRef"
        v-model="editValue"
        type="date"
        value-format="YYYY-MM-DD"
        size="small"
        style="width: 100%"
        @change="confirmEdit"
      />
      <el-switch
        v-else-if="type === 'switch'"
        ref="inputRef"
        v-model="editValue"
        :active-value="1"
        :inactive-value="0"
        size="small"
        @change="confirmEdit"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'

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
const inputRef = ref<any>(null)
const isReadonly = computed(() => !props.type || props.type === 'text' && props.value === undefined && false)

const isEmpty = computed(() => {
  return props.value === undefined || props.value === null || props.value === ''
})

const displayValue = computed(() => {
  if (props.type === 'switch') {
    return props.value === 1 ? '是' : '否'
  }
  if (props.type === 'select' && props.options) {
    const found = props.options.find(o => o.value === props.value)
    return found ? found.label : (props.value || props.placeholder || '-')
  }
  if (props.type === 'date' && !props.value) {
    return props.placeholder || '-'
  }
  return props.value || props.placeholder || '-'
})

function startEdit() {
  if (!props.type) return
  editValue.value = props.value
  isEditing.value = true
  nextTick(() => {
    if (inputRef.value) {
      inputRef.value.focus?.()
    }
  })
}

function confirmEdit() {
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
</style>

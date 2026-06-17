<template>
  <div class="editable-cell" @click="startEdit">
    <template v-if="!isEditing">
      <slot>
        <span class="display-value" :class="{ 'editable-hint': true }">
          {{ displayValue }}
        </span>
      </slot>
    </template>
    <template v-else>
      <el-input
        v-if="type === 'text'"
        ref="inputRef"
        v-model="editValue"
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
  type?: 'text' | 'select' | 'date' | 'switch'
  options?: OptionItem[]
}>()

const emit = defineEmits<{
  save: [value: string | number]
}>()

const isEditing = ref(false)
const editValue = ref<any>(props.value)
const inputRef = ref<any>(null)

const displayValue = computed(() => {
  if (props.type === 'switch') {
    return props.value === 1 ? '是' : '否'
  }
  if (props.type === 'select' && props.options) {
    const found = props.options.find(o => o.value === props.value)
    return found ? found.label : (props.value || '-')
  }
  if (props.type === 'date' && !props.value) {
    return '-'
  }
  return props.value || '-'
})

function startEdit() {
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
.editable-cell {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  min-width: 40px;
}
.display-value {
  border-bottom: 1px dashed transparent;
  transition: all 0.2s;
}
.editable-hint:hover {
  border-bottom-color: var(--primary);
  color: var(--primary);
}
</style>

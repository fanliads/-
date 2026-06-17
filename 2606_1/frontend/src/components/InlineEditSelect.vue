<template>
  <div class="inline-edit-select" @click="startEdit">
    <span v-if="!isEditing" class="select-value">{{ displayLabel }}</span>
    <el-select
      v-else
      ref="selectRef"
      v-model="editValue"
      size="small"
      :placeholder="placeholder"
      @change="save"
      @blur="isEditing = false"
    >
      <el-option
        v-for="opt in normalizedOptions"
        :key="opt.value"
        :label="opt.label"
        :value="opt.value"
      />
    </el-select>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, computed } from 'vue'

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

const isEditing = ref(false)
const editValue = ref('')
const selectRef = ref<any>(null)

const normalizedOptions = computed(() => {
  return props.options || []
})

const displayLabel = computed(() => {
  const found = normalizedOptions.value.find(o => o.value === (props.value || ''))
  return found?.label || props.value || props.placeholder || '点击编辑'
})

function startEdit() {
  isEditing.value = true
  editValue.value = props.value || ''
  nextTick(() => {
    selectRef.value?.focus()
  })
}

function save() {
  isEditing.value = false
  if (editValue.value !== (props.value || '')) {
    emit('save', editValue.value)
  }
}
</script>

<style lang="scss" scoped>
.inline-edit-select {
  cursor: pointer;
  min-height: 20px;

  .select-value {
    display: inline-block;
    padding: 2px 4px;
    border-radius: 4px;
    transition: background 0.15s;

    &:hover {
      background: rgba(0, 113, 227, 0.06);
    }
  }
}
</style>

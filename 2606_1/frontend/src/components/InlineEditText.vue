<template>
  <div class="inline-edit-text" @click="startEdit">
    <span v-if="!isEditing" class="text-value">{{ displayValue }}</span>
    <el-input
      v-else-if="type !== 'textarea'"
      ref="inputRef"
      v-model="editValue"
      size="small"
      @blur="save"
      @keyup.enter="save"
    />
    <el-input
      v-else
      ref="inputRef"
      v-model="editValue"
      type="textarea"
      :rows="2"
      size="small"
      @blur="save"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, computed } from 'vue'

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
const inputRef = ref<any>(null)

const displayValue = computed(() => {
  return props.value || props.placeholder || '点击编辑'
})

function startEdit() {
  isEditing.value = true
  editValue.value = props.value || ''
  nextTick(() => {
    inputRef.value?.focus()
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
}
</style>

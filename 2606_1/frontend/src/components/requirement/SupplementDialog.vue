<template>
  <LnDialog
    v-model="dialogVisible"
    title="添加补充内容"
    description="补充背景、进展或附件，记录会追加到需求时间线。"
    width="520px"
    :close-on-backdrop="false"
  >
    <LnForm ref="formRef" :model="form" :rules="rules" label-width="100px">
      <LnFormItem label="补充类型" prop="supplementType">
        <LnSelect v-model="form.supplementType" :options="supplementTypeOptions" placeholder="请选择补充类型" />
      </LnFormItem>
      <LnFormItem label="补充内容" prop="content">
        <LnTextarea v-model="form.content" placeholder="请输入补充内容" />
      </LnFormItem>
      <LnFormItem label="附件URL" prop="attachment">
        <LnInput v-model="form.attachment" placeholder="请输入附件 URL（可选）" />
      </LnFormItem>
    </LnForm>

    <template #footer>
      <LnButton variant="ghost" @click="handleClose">取消</LnButton>
      <LnButton variant="primary" :loading="submitLoading" @click="handleSubmit">
        确认
      </LnButton>
    </template>
  </LnDialog>
</template>

<script setup lang="ts">
import { computed, ref, reactive, watch } from 'vue'
import { addRawRequirementSupplement } from '@/api/raw-requirement'
import { addProductRequirementSupplement } from '@/api/product-requirement'
import { SUPPLEMENT_TYPE_MAP } from '@/types/requirement'
import { lnToast, LnButton, LnDialog, LnForm, LnFormItem, LnInput, LnSelect, LnTextarea, type LnFormInstance, type LnFormRules, type LnOption } from '@/components/linear'

const props = defineProps<{
  visible: boolean
  requirementId: number
  reqType: 'raw' | 'product'
}>()

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
  (e: 'success'): void
}>()

const formRef = ref<LnFormInstance>()
const submitLoading = ref(false)
const dialogVisible = computed({
  get: () => props.visible,
  set: (value: boolean) => emit('update:visible', value),
})
const supplementTypeOptions: LnOption[] = Object.entries(SUPPLEMENT_TYPE_MAP).map(([value, label]) => ({ value, label }))

const form = reactive({
  supplementType: '',
  content: '',
  attachment: '',
})

const rules: LnFormRules = {
  supplementType: [{ required: true, message: '请选择补充类型', trigger: 'change' }],
  content: [{ required: true, message: '请输入补充内容', trigger: 'blur' }],
}

function handleClose() {
  emit('update:visible', false)
}

async function handleSubmit() {
  const formEl = formRef.value
  if (!formEl) return
  const valid = await formEl.validate().catch(() => false)
  if (!valid) return

  submitLoading.value = true
  try {
    if (props.reqType === 'raw') {
      await addRawRequirementSupplement(props.requirementId, { ...form })
    } else {
      await addProductRequirementSupplement(props.requirementId, { ...form })
    }
    lnToast.success('添加成功')
    emit('success')
    handleClose()
  } catch {
    // error handled by interceptor
  } finally {
    submitLoading.value = false
  }
}

watch(() => props.visible, (val) => {
  if (val) {
    form.supplementType = ''
    form.content = ''
    form.attachment = ''
  }
})
</script>

<style scoped lang="scss">
:deep(.ln-form-item__content > .ln-field),
:deep(.ln-form-item__content > .ln-textarea-field),
:deep(.ln-form-item__content > .ln-select-field),
:deep(.ln-form-item__content > .ln-select-field .ln-popover-root),
:deep(.ln-form-item__content > .ln-select-field .ln-popover-trigger),
:deep(.ln-form-item__content > .ln-select-field .ln-select__trigger) { width: 100%; }
</style>

<template>
  <el-dialog
    :model-value="visible"
    title="添加补充内容"
    width="520px"
    :before-close="handleClose"
    destroy-on-close
  >
    <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
      <el-form-item label="补充类型" prop="supplementType">
        <el-select v-model="form.supplementType" placeholder="请选择补充类型" style="width: 100%">
          <el-option
            v-for="(label, key) in SUPPLEMENT_TYPE_MAP"
            :key="key"
            :label="label"
            :value="key"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="补充内容" prop="content">
        <el-input
          v-model="form.content"
          type="textarea"
          :rows="4"
          placeholder="请输入补充内容"
        />
      </el-form-item>
      <el-form-item label="附件URL" prop="attachment">
        <el-input
          v-model="form.attachment"
          placeholder="请输入附件URL（可选）"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
        确认
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { addRawRequirementSupplement } from '@/api/raw-requirement'
import { addProductRequirementSupplement } from '@/api/product-requirement'
import { SUPPLEMENT_TYPE_MAP } from '@/types/requirement'

const props = defineProps<{
  visible: boolean
  requirementId: number
  reqType: 'raw' | 'product'
}>()

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
  (e: 'success'): void
}>()

const formRef = ref<FormInstance>()
const submitLoading = ref(false)

const form = reactive({
  supplementType: '',
  content: '',
  attachment: '',
})

const rules: FormRules = {
  supplementType: [{ required: true, message: '请选择补充类型', trigger: 'change' }],
  content: [{ required: true, message: '请输入补充内容', trigger: 'blur' }],
}

function handleClose() {
  emit('update:visible', false)
}

async function handleSubmit() {
  const formEl = formRef.value
  if (!formEl) return
  await formEl.validate()

  submitLoading.value = true
  try {
    if (props.reqType === 'raw') {
      await addRawRequirementSupplement(props.requirementId, { ...form })
    } else {
      await addProductRequirementSupplement(props.requirementId, { ...form })
    }
    ElMessage.success('添加成功')
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

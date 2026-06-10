<template>
  <div class="submit-view">
    <div class="form-card">
      <div class="form-header">
        <h1>需求汇总表单</h1>
        <p>请填写原始需求信息，提交后由产品团队进行评估</p>
      </div>

      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-position="top"
        size="large"
      >
        <div class="form-group">
          <label class="form-label">需求标题 <span class="required">*</span></label>
          <el-form-item prop="title" :show-message="false">
            <el-input
              v-model="formData.title"
              placeholder="请输入需求标题"
              maxlength="100"
              show-word-limit
              class="apple-input"
            />
          </el-form-item>
        </div>

        <div class="form-group">
          <label class="form-label">需求描述</label>
          <el-form-item prop="description" :show-message="false">
            <el-input
              v-model="formData.description"
              type="textarea"
              :rows="4"
              placeholder="请详细描述需求内容、背景和期望效果"
              maxlength="2000"
              show-word-limit
              class="apple-input"
            />
          </el-form-item>
        </div>

        <div class="form-group">
          <label class="form-label">业务线</label>
          <el-form-item prop="businessLine" :show-message="false">
            <el-select v-model="formData.businessLine" placeholder="请选择业务线" class="apple-input" style="width: 100%">
              <el-option v-for="item in dictBusinessLineOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </div>

        <div class="form-group">
          <label class="form-label">提出人</label>
          <el-form-item>
            <el-input :model-value="formData.proposer || '-'" disabled class="apple-input" />
          </el-form-item>
        </div>

        <div class="form-group">
          <label class="form-label">需求单链接</label>
          <el-form-item prop="reqLink" :show-message="false">
            <el-input v-model="formData.reqLink" placeholder="请输入需求单链接" class="apple-input" />
          </el-form-item>
        </div>

        <div class="form-group">
          <label class="form-label">期望上线时间</label>
          <el-form-item>
            <el-date-picker v-model="formData.expectedOnlineDate" type="date" value-format="YYYY-MM-DD" placeholder="请选择期望上线时间" class="apple-input" style="width: 100%" />
          </el-form-item>
        </div>

        <div class="form-group">
          <label class="form-label">价值量化评估</label>
          <el-form-item>
            <el-input v-model="formData.valueAssessment" placeholder="请输入价值量化评估" class="apple-input" />
          </el-form-item>
        </div>

        <div class="form-group">
          <label class="form-label">需求备注</label>
          <el-form-item prop="remark" :show-message="false">
            <el-input
              v-model="formData.remark"
              type="textarea"
              :rows="3"
              placeholder="请输入需求备注"
              maxlength="1000"
              show-word-limit
              class="apple-input"
            />
          </el-form-item>
        </div>

        <button type="button" class="submit-btn" :disabled="submitting" @click="handleSubmit">
          {{ submitting ? '提交中...' : '提交' }}
        </button>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { createRawRequirement } from '@/api/raw-requirement'
import { listDictData } from '@/api/dict'
import type { DictDataVO, RawRequirementCreateDTO } from '@/types/requirement'
import { useUserStore } from '@/store/user'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref<FormInstance>()
const submitting = ref(false)

// 字典数据
const dictBusinessLineOptions = ref<DictDataVO[]>([])
const formData = reactive<RawRequirementCreateDTO>({
  title: '',
  description: '',
  proposer: '',
  businessLine: '',
  reqLink: '',
  expectedOnlineDate: undefined,
  valueAssessment: '',
  remark: '',
})

const validateReqLinkOrRemark = (_rule: unknown, _value: unknown, callback: (error?: Error) => void) => {
  if (formData.reqLink?.trim() || formData.remark?.trim()) {
    callback()
    return
  }
  callback(new Error('需求单链接和需求备注至少完善一项'))
}

const rules: FormRules = {
  title: [{ required: true, message: '请输入需求标题', trigger: 'blur' }],
  reqLink: [{ validator: validateReqLinkOrRemark, trigger: 'blur' }],
  remark: [{ validator: validateReqLinkOrRemark, trigger: 'blur' }],
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    await createRawRequirement({
      ...formData,
      title: formData.title.trim(),
      description: formData.description?.trim() || undefined,
      businessLine: formData.businessLine?.trim() || undefined,
      proposer: formData.proposer?.trim() || undefined,
      reqLink: formData.reqLink?.trim() || undefined,
      remark: formData.remark?.trim() || undefined,
      valueAssessment: formData.valueAssessment?.trim() || undefined,
      expectedOnlineDate: formData.expectedOnlineDate || undefined,
    })
    ElMessage.success('需求提交成功')
    router.push('/raw-pool')
  } catch {
    // error handled by interceptor
  } finally {
    submitting.value = false
  }
}

// 加载字典数据
async function loadDictData() {
  try {
    const [blRes] = await Promise.all([listDictData('business_line')])
    dictBusinessLineOptions.value = (blRes as any).data || []
  } catch {
    // error handled by interceptor
  }
}

onMounted(() => {
  formData.proposer = userStore.userInfo?.realName || userStore.userInfo?.username || ''
  loadDictData()
})
</script>

<style lang="scss" scoped>
.submit-view {
  min-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, #f5f5f7 0%, #eef0f5 100%);
  padding: 40px 20px;
}

.form-card {
  background: var(--surface);
  border-radius: var(--radius);
  padding: 40px 36px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  width: 100%;
  max-width: 520px;
}

.form-header {
  text-align: center;
  margin-bottom: 32px;

  h1 {
    font-size: 22px;
    font-weight: 600;
    margin-bottom: 8px;
    letter-spacing: -0.3px;
    color: var(--text-primary);
  }

  p {
    font-size: 14px;
    color: var(--text-secondary);
    margin: 0;
  }
}

.form-group {
  margin-bottom: 22px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
  color: var(--text-primary);

  .required {
    color: var(--danger);
    margin-left: 2px;
  }
}

.apple-input {
  :deep(.el-input__wrapper),
  :deep(.el-textarea__inner) {
    width: 100%;
    padding: 11px 14px;
    border-radius: var(--radius-sm);
    border: 1px solid rgba(0, 0, 0, 0.12);
    background: #fafafa;
    font-size: 15px;
    box-shadow: none;
    transition: var(--transition);

    &:focus-within,
    &:focus {
      border-color: var(--primary);
      background: var(--surface);
      box-shadow: 0 0 0 3px rgba(0, 113, 227, 0.08);
    }
  }

  :deep(.el-textarea__inner) {
    min-height: 100px !important;
  }

  :deep(.el-select__wrapper) {
    border-radius: var(--radius-sm);
    border: 1px solid rgba(0, 0, 0, 0.12);
    background: #fafafa;
    box-shadow: none;
    transition: var(--transition);

    &:hover,
    &.is-focused {
      border-color: var(--primary);
      background: var(--surface);
      box-shadow: 0 0 0 3px rgba(0, 113, 227, 0.08);
    }
  }
}

.priority-group {
  :deep(.el-radio-button__inner) {
    border-radius: 20px !important;
    border: 1px solid var(--border) !important;
    background: var(--surface);
    margin-right: 8px;
    padding: 8px 20px;

    &:hover {
      border-color: var(--primary) !important;
    }
  }

  :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
    background: rgba(0, 113, 227, 0.08);
    border-color: var(--primary) !important;
    color: var(--primary);
    box-shadow: none;
  }
}

.priority-tag {
  font-weight: 600;
  font-size: 13px;

  &.p0 { color: var(--danger); }
  &.p1 { color: #b75c00; }
  &.p2 { color: #9a7d00; }
  &.p3 { color: var(--text-secondary); }
}

.submit-btn {
  width: 100%;
  padding: 14px;
  border-radius: var(--radius-sm);
  border: none;
  background: var(--success);
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  margin-top: 8px;
  font-family: inherit;

  &:hover {
    background: #2eb350;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(52, 199, 89, 0.25);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
}

@media (max-width: 560px) {
  .form-card {
    padding: 28px 20px;
  }

  .submit-view {
    padding: 20px 16px;
  }
}
</style>

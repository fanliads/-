<template>
  <div class="submit-view">
    <div class="form-card">
      <div class="form-header">
        <h1>需求汇总表单</h1>
        <p>请填写原始需求信息，提交后进入待判定流程</p>
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

        <div class="form-section">
          <div class="section-title">V3 业务判定信息</div>
          <div class="section-tip">以下结构化字段将直接参与系统规则判定和 AI 解释增强。</div>
        </div>

        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">项目名称</label>
            <el-form-item>
              <el-input v-model="assessmentForm.projectName" placeholder="请输入项目名称" class="apple-input" />
            </el-form-item>
          </div>
          <div class="form-group">
            <label class="form-label">客户名称</label>
            <el-form-item>
              <el-input v-model="assessmentForm.customerName" placeholder="请输入客户名称" class="apple-input" />
            </el-form-item>
          </div>
          <div class="form-group">
            <label class="form-label">合同编号</label>
            <el-form-item>
              <el-input v-model="assessmentForm.contractNo" placeholder="请输入合同编号" class="apple-input" />
            </el-form-item>
          </div>
          <div class="form-group">
            <label class="form-label">合同金额</label>
            <el-form-item>
              <el-input v-model="assessmentForm.contractAmount" placeholder="请输入合同金额" class="apple-input" />
            </el-form-item>
          </div>
          <div class="form-group">
            <label class="form-label">项目类型</label>
            <el-form-item>
              <el-input v-model="assessmentForm.projectType" placeholder="如：常规营收项目/专属定制" class="apple-input" />
            </el-form-item>
          </div>
          <div class="form-group">
            <label class="form-label">商务负责人</label>
            <el-form-item>
              <el-input v-model="assessmentForm.businessOwner" placeholder="请输入商务负责人" class="apple-input" />
            </el-form-item>
          </div>
          <div class="form-group">
            <label class="form-label">合同范围</label>
            <el-form-item>
              <el-input v-model="assessmentForm.contractScope" placeholder="请输入合同范围" class="apple-input" />
            </el-form-item>
          </div>
          <div class="form-group">
            <label class="form-label">预估工时</label>
            <el-form-item>
              <el-input v-model="assessmentForm.estimatedWorkload" placeholder="请输入预估工时" class="apple-input" />
            </el-form-item>
          </div>
          <div class="form-group">
            <label class="form-label">刚性交付日期</label>
            <el-form-item>
              <el-date-picker v-model="assessmentForm.rigidDeliveryDate" type="date" value-format="YYYY-MM-DD" placeholder="请选择交付日期" class="apple-input" style="width: 100%" />
            </el-form-item>
          </div>
          <div class="form-group">
            <label class="form-label">可复用性</label>
            <el-form-item>
              <el-input v-model="assessmentForm.reusability" placeholder="如：可复用技术建设" class="apple-input" />
            </el-form-item>
          </div>
        </div>

        <div class="form-grid risk-grid">
          <div class="form-group">
            <label class="form-label">履约风险</label>
            <el-form-item>
              <el-select v-model="assessmentForm.deliveryRisk" placeholder="请选择" class="apple-input" style="width: 100%">
                <el-option v-for="item in yesNoOptions" :key="`delivery-${item.value}`" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </div>
          <div class="form-group">
            <label class="form-label">回款风险</label>
            <el-form-item>
              <el-select v-model="assessmentForm.paymentRisk" placeholder="请选择" class="apple-input" style="width: 100%">
                <el-option v-for="item in yesNoOptions" :key="`payment-${item.value}`" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </div>
          <div class="form-group">
            <label class="form-label">验收风险</label>
            <el-form-item>
              <el-select v-model="assessmentForm.acceptanceRisk" placeholder="请选择" class="apple-input" style="width: 100%">
                <el-option v-for="item in yesNoOptions" :key="`acceptance-${item.value}`" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </div>
          <div class="form-group">
            <label class="form-label">安全/合规风险</label>
            <el-form-item>
              <el-select v-model="assessmentForm.securityOrComplianceRisk" placeholder="请选择" class="apple-input" style="width: 100%">
                <el-option v-for="item in yesNoOptions" :key="`compliance-${item.value}`" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </div>
          <div class="form-group">
            <label class="form-label">重大故障风险</label>
            <el-form-item>
              <el-select v-model="assessmentForm.majorIncidentRisk" placeholder="请选择" class="apple-input" style="width: 100%">
                <el-option v-for="item in yesNoOptions" :key="`incident-${item.value}`" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </div>
          <div class="form-group">
            <label class="form-label">省级督办</label>
            <el-form-item>
              <el-select v-model="assessmentForm.govSupervision" placeholder="请选择" class="apple-input" style="width: 100%">
                <el-option v-for="item in yesNoOptions" :key="`gov-${item.value}`" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </div>
          <div class="form-group">
            <label class="form-label">战略客户/标杆客户</label>
            <el-form-item>
              <el-select v-model="assessmentForm.strategicCustomer" placeholder="请选择" class="apple-input" style="width: 100%">
                <el-option v-for="item in yesNoOptions" :key="`strategic-${item.value}`" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </div>
          <div class="form-group">
            <label class="form-label">核心产品线</label>
            <el-form-item>
              <el-select v-model="assessmentForm.coreProductLine" placeholder="请选择" class="apple-input" style="width: 100%">
                <el-option v-for="item in yesNoOptions" :key="`core-${item.value}`" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </div>
          <div class="form-group">
            <label class="form-label">是否样板</label>
            <el-form-item>
              <el-select v-model="assessmentForm.benchmarkCase" placeholder="请选择" class="apple-input" style="width: 100%">
                <el-option v-for="item in yesNoOptions" :key="`benchmark-${item.value}`" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">特殊备注</label>
          <el-form-item>
            <el-input
              v-model="assessmentForm.specialRemark"
              type="textarea"
              :rows="3"
              placeholder="请输入会影响优先级判定的补充说明"
              class="apple-input"
            />
          </el-form-item>
        </div>

        <div class="form-group">
          <label class="form-label">处理备注</label>
          <el-form-item prop="remark" :show-message="false">
            <el-input
              v-model="formData.remark"
              type="textarea"
              :rows="3"
              placeholder="请输入处理备注"
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
import type { DictDataVO, PriorityAssessmentContextDTO, RawRequirementCreateDTO } from '@/types/requirement'
import { useUserStore } from '@/store/user'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref<FormInstance>()
const submitting = ref(false)
const yesNoOptions = [
  { label: '是', value: '是' },
  { label: '否', value: '否' },
]

function createDefaultAssessmentContext(): PriorityAssessmentContextDTO {
  return {
    projectName: '',
    customerName: '',
    contractNo: '',
    contractAmount: '',
    deliveryRisk: '',
    paymentRisk: '',
    acceptanceRisk: '',
    securityOrComplianceRisk: '',
    majorIncidentRisk: '',
    govSupervision: '',
    strategicCustomer: '',
    coreProductLine: '',
    projectType: '',
    reusability: '',
    benchmarkCase: '',
    contractScope: '',
    rigidDeliveryDate: '',
    estimatedWorkload: '',
    businessOwner: '',
    expectedOnlineTime: '',
    specialRemark: '',
  }
}

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
const assessmentForm = reactive<PriorityAssessmentContextDTO>(createDefaultAssessmentContext())

const validateReqLinkOrRemark = (_rule: unknown, _value: unknown, callback: (error?: Error) => void) => {
  if (formData.reqLink?.trim() || formData.remark?.trim()) {
    callback()
    return
  }
  callback(new Error('需求单链接和处理备注至少完善一项'))
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
      submitOrigin: 'internal',
      title: formData.title.trim(),
      description: formData.description?.trim() || undefined,
      businessLine: formData.businessLine?.trim() || undefined,
      proposer: formData.proposer?.trim() || undefined,
      reqLink: formData.reqLink?.trim() || undefined,
      remark: formData.remark?.trim() || undefined,
      valueAssessment: formData.valueAssessment?.trim() || undefined,
      expectedOnlineDate: formData.expectedOnlineDate || undefined,
      assessmentContext: {
        ...assessmentForm,
        projectName: assessmentForm.projectName?.trim() || undefined,
        customerName: assessmentForm.customerName?.trim() || undefined,
        contractNo: assessmentForm.contractNo?.trim() || undefined,
        contractAmount: assessmentForm.contractAmount?.trim() || undefined,
        deliveryRisk: assessmentForm.deliveryRisk || undefined,
        paymentRisk: assessmentForm.paymentRisk || undefined,
        acceptanceRisk: assessmentForm.acceptanceRisk || undefined,
        securityOrComplianceRisk: assessmentForm.securityOrComplianceRisk || undefined,
        majorIncidentRisk: assessmentForm.majorIncidentRisk || undefined,
        govSupervision: assessmentForm.govSupervision || undefined,
        strategicCustomer: assessmentForm.strategicCustomer || undefined,
        coreProductLine: assessmentForm.coreProductLine || undefined,
        projectType: assessmentForm.projectType?.trim() || undefined,
        reusability: assessmentForm.reusability?.trim() || undefined,
        benchmarkCase: assessmentForm.benchmarkCase || undefined,
        contractScope: assessmentForm.contractScope?.trim() || undefined,
        rigidDeliveryDate: assessmentForm.rigidDeliveryDate || undefined,
        estimatedWorkload: assessmentForm.estimatedWorkload?.trim() || undefined,
        businessOwner: assessmentForm.businessOwner?.trim() || undefined,
        expectedOnlineTime: formData.expectedOnlineDate || undefined,
        specialRemark: assessmentForm.specialRemark?.trim() || undefined,
      },
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

.form-section {
  margin: 28px 0 12px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.section-tip {
  margin-top: 6px;
  font-size: 12px;
  color: var(--text-secondary);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 16px;
}

.risk-grid {
  margin-top: 4px;
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

@media (max-width: 720px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>

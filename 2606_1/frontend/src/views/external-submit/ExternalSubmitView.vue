<template>
  <div class="external-submit-view">
    <div class="hero-card">
      <div class="hero-copy">
        <div class="hero-kicker">External Intake</div>
        <h1>外部需求提报</h1>
        <p>面向市场、客服、实施等协作角色。提交后将进入原始需求池，并先进入待判定流程。</p>
      </div>

      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-position="top"
        class="external-form"
      >
        <div class="grid two-col">
          <el-form-item label="需求标题" prop="title">
            <el-input v-model="formData.title" maxlength="100" show-word-limit placeholder="请输入需求标题" />
          </el-form-item>
          <el-form-item label="来源渠道">
            <el-input v-model="formData.source" placeholder="如：市场/客服/企微提报" />
          </el-form-item>
        </div>

        <div class="grid two-col">
          <el-form-item label="提报人">
            <el-input v-model="formData.proposer" placeholder="请输入姓名" />
          </el-form-item>
          <el-form-item label="业务线">
            <el-select v-model="formData.businessLine" placeholder="请选择业务线" style="width: 100%">
              <el-option v-for="item in dictBusinessLineOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </div>

        <el-form-item label="需求描述">
          <el-input v-model="formData.description" type="textarea" :rows="4" maxlength="2000" show-word-limit placeholder="请描述需求背景、问题和预期结果" />
        </el-form-item>

        <div class="grid two-col">
          <el-form-item label="需求单链接" prop="reqLink">
            <el-input v-model="formData.reqLink" placeholder="请输入附件或需求链接" />
          </el-form-item>
          <el-form-item label="期望上线时间">
            <el-date-picker v-model="formData.expectedOnlineDate" type="date" value-format="YYYY-MM-DD" placeholder="请选择日期" style="width: 100%" />
          </el-form-item>
        </div>

        <div class="section-title">业务判定信息</div>

        <div class="grid two-col">
          <el-form-item label="项目名称">
            <el-input v-model="assessmentForm.projectName" placeholder="请输入项目名称" />
          </el-form-item>
          <el-form-item label="客户名称">
            <el-input v-model="assessmentForm.customerName" placeholder="请输入客户名称" />
          </el-form-item>
          <el-form-item label="合同编号">
            <el-input v-model="assessmentForm.contractNo" placeholder="请输入合同编号" />
          </el-form-item>
          <el-form-item label="合同金额">
            <el-input v-model="assessmentForm.contractAmount" placeholder="请输入合同金额" />
          </el-form-item>
          <el-form-item label="项目类型">
            <el-input v-model="assessmentForm.projectType" placeholder="如：常规营收项目/专属定制" />
          </el-form-item>
          <el-form-item label="商务负责人">
            <el-input v-model="assessmentForm.businessOwner" placeholder="请输入商务负责人" />
          </el-form-item>
          <el-form-item label="合同范围">
            <el-input v-model="assessmentForm.contractScope" placeholder="请输入合同范围" />
          </el-form-item>
          <el-form-item label="预估工时">
            <el-input v-model="assessmentForm.estimatedWorkload" placeholder="请输入预估工时" />
          </el-form-item>
          <el-form-item label="刚性交付日期">
            <el-date-picker v-model="assessmentForm.rigidDeliveryDate" type="date" value-format="YYYY-MM-DD" placeholder="请选择交付日期" style="width: 100%" />
          </el-form-item>
          <el-form-item label="可复用性">
            <el-input v-model="assessmentForm.reusability" placeholder="如：可复用技术建设" />
          </el-form-item>
        </div>

        <div class="grid three-col">
          <el-form-item label="履约风险">
            <el-select v-model="assessmentForm.deliveryRisk" placeholder="请选择" style="width: 100%">
              <el-option v-for="item in yesNoOptions" :key="`delivery-${item.value}`" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="回款风险">
            <el-select v-model="assessmentForm.paymentRisk" placeholder="请选择" style="width: 100%">
              <el-option v-for="item in yesNoOptions" :key="`payment-${item.value}`" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="验收风险">
            <el-select v-model="assessmentForm.acceptanceRisk" placeholder="请选择" style="width: 100%">
              <el-option v-for="item in yesNoOptions" :key="`acceptance-${item.value}`" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="安全/合规风险">
            <el-select v-model="assessmentForm.securityOrComplianceRisk" placeholder="请选择" style="width: 100%">
              <el-option v-for="item in yesNoOptions" :key="`compliance-${item.value}`" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="重大故障风险">
            <el-select v-model="assessmentForm.majorIncidentRisk" placeholder="请选择" style="width: 100%">
              <el-option v-for="item in yesNoOptions" :key="`incident-${item.value}`" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="省级督办">
            <el-select v-model="assessmentForm.govSupervision" placeholder="请选择" style="width: 100%">
              <el-option v-for="item in yesNoOptions" :key="`gov-${item.value}`" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="战略客户/标杆客户">
            <el-select v-model="assessmentForm.strategicCustomer" placeholder="请选择" style="width: 100%">
              <el-option v-for="item in yesNoOptions" :key="`strategic-${item.value}`" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="核心产品线">
            <el-select v-model="assessmentForm.coreProductLine" placeholder="请选择" style="width: 100%">
              <el-option v-for="item in yesNoOptions" :key="`core-${item.value}`" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="是否样板">
            <el-select v-model="assessmentForm.benchmarkCase" placeholder="请选择" style="width: 100%">
              <el-option v-for="item in yesNoOptions" :key="`benchmark-${item.value}`" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </div>

        <el-form-item label="特殊备注">
          <el-input v-model="assessmentForm.specialRemark" type="textarea" :rows="3" placeholder="请输入补充说明" />
        </el-form-item>

        <el-form-item label="处理备注" prop="remark">
          <el-input v-model="formData.remark" type="textarea" :rows="3" maxlength="1000" show-word-limit placeholder="请输入备注" />
        </el-form-item>

        <div class="footer-bar">
          <div class="footer-tip">提交后不会进入后台页面，只展示受理结果。</div>
          <el-button type="primary" size="large" :loading="submitting" @click="handleSubmit">
            {{ submitting ? '提交中...' : '提交需求' }}
          </el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { createExternalRawRequirement } from '@/api/raw-requirement'
import type { PriorityAssessmentContextDTO, RawRequirementCreateDTO } from '@/types/requirement'

const router = useRouter()
const formRef = ref<FormInstance>()
const submitting = ref(false)
const dictBusinessLineOptions = ref([
  { value: '校园G端', label: '校园G端' },
  { value: '市监G端', label: '市监G端' },
  { value: 'B端团餐', label: 'B端团餐' },
  { value: '技术支撑（硬件等）', label: '技术支撑（硬件等）' },
])
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

const formData = reactive<RawRequirementCreateDTO>({
  title: '',
  source: 'external',
  proposer: '',
  businessLine: '',
  description: '',
  reqLink: '',
  expectedOnlineDate: undefined,
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
    const res = await createExternalRawRequirement({
      ...formData,
      submitOrigin: 'external',
      title: formData.title.trim(),
      source: formData.source?.trim() || 'external',
      proposer: formData.proposer?.trim() || '外部提报用户',
      businessLine: formData.businessLine?.trim() || undefined,
      description: formData.description?.trim() || undefined,
      reqLink: formData.reqLink?.trim() || undefined,
      remark: formData.remark?.trim() || undefined,
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
    ElMessage.success('外部提报已提交')
    router.replace({
      path: '/external-submit/result',
      query: {
        id: String((res as any).data || ''),
        title: formData.title,
      },
    })
  } catch {
    // handled by interceptor
  } finally {
    submitting.value = false
  }
}

onMounted(() => {})
</script>

<style scoped lang="scss">
.external-submit-view {
  min-height: 100vh;
  padding: 24px;
  background:
    radial-gradient(circle at top left, rgba(0, 113, 227, 0.14), transparent 28%),
    linear-gradient(180deg, #f6f8fb 0%, #eef2f7 100%);
}

.hero-card {
  width: min(1100px, 100%);
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 28px;
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.1);
  padding: 28px;
}

.hero-copy {
  margin-bottom: 20px;
}

.hero-kicker {
  font-size: 12px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #0071e3;
  font-weight: 700;
}

.hero-copy h1 {
  margin: 8px 0 10px;
  font-size: 34px;
  line-height: 1.05;
  color: #0f172a;
}

.hero-copy p {
  margin: 0;
  font-size: 14px;
  line-height: 1.7;
  color: #475569;
}

.external-form {
  margin-top: 18px;
}

.grid {
  display: grid;
  gap: 0 16px;
}

.two-col {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.three-col {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.section-title {
  margin: 18px 0 12px;
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
}

.footer-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-top: 24px;
  padding-top: 18px;
  border-top: 1px solid rgba(15, 23, 42, 0.08);
}

.footer-tip {
  font-size: 12px;
  color: #64748b;
}

@media (max-width: 900px) {
  .external-submit-view {
    padding: 12px;
  }

  .hero-card {
    padding: 18px;
    border-radius: 20px;
  }

  .hero-copy h1 {
    font-size: 28px;
  }

  .two-col,
  .three-col {
    grid-template-columns: 1fr;
  }

  .footer-bar {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>

<template>
  <div class="external-submit-view">
    <div class="hero-card wb-panel">
      <div class="hero-copy">
        <div class="hero-kicker wb-meta-pill">External Intake</div>
        <h1 class="wb-page-title">外部需求提报</h1>
        <p class="wb-page-subtitle">面向市场、客服、实施等协作角色。提交后将进入原始需求池，并先进入待判定流程。</p>
      </div>

      <LnForm
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-position="top"
        class="external-form"
      >
        <div class="grid two-col">
          <LnFormItem label="需求标题" prop="title">
            <LnInput v-model="formData.title" :maxlength="100" show-count placeholder="请输入需求标题" />
          </LnFormItem>
          <LnFormItem label="来源渠道">
            <LnInput v-model="formData.source" placeholder="如：市场/客服/企微提报" />
          </LnFormItem>
        </div>

        <div class="grid two-col">
          <LnFormItem label="提报人">
            <LnInput v-model="formData.proposer" placeholder="请输入姓名" />
          </LnFormItem>
          <LnFormItem label="业务线">
            <LnSelect v-model="formData.businessLine" :options="dictBusinessLineOptions" placeholder="请选择业务线" searchable clearable />
          </LnFormItem>
        </div>

        <LnFormItem label="需求描述">
          <LnTextarea v-model="formData.description" :maxlength="2000" placeholder="请描述需求背景、问题和预期结果" />
        </LnFormItem>

        <div class="grid two-col">
          <LnFormItem label="需求单链接" prop="reqLink">
            <LnInput v-model="formData.reqLink" placeholder="请输入附件或需求链接" />
          </LnFormItem>
          <LnFormItem label="期望上线时间">
            <LnDateInput v-model="formData.expectedOnlineDate" clearable />
          </LnFormItem>
        </div>

        <div class="section-title">业务判定信息</div>
        <div class="section-copy">如果暂时无法一次补齐全部字段，优先补项目背景与高风险项，后续也可以在内部继续补充。</div>

        <div class="assessment-block">
          <div class="assessment-title">项目与合同背景</div>
          <div class="assessment-copy">先说明这条需求服务哪个项目、哪个客户、是否有合同边界。</div>
          <div class="grid two-col">
            <LnFormItem label="项目名称">
              <LnInput v-model="assessmentForm.projectName" placeholder="请输入项目名称" />
            </LnFormItem>
            <LnFormItem label="客户名称">
              <LnInput v-model="assessmentForm.customerName" placeholder="请输入客户名称" />
            </LnFormItem>
            <LnFormItem label="合同编号">
              <LnInput v-model="assessmentForm.contractNo" placeholder="请输入合同编号" />
            </LnFormItem>
            <LnFormItem label="合同金额">
              <LnInput v-model="assessmentForm.contractAmount" placeholder="请输入合同金额" />
            </LnFormItem>
            <LnFormItem label="项目类型">
              <LnInput v-model="assessmentForm.projectType" placeholder="如：常规营收项目/专属定制" />
            </LnFormItem>
            <LnFormItem label="商务负责人">
              <LnInput v-model="assessmentForm.businessOwner" placeholder="请输入商务负责人" />
            </LnFormItem>
            <LnFormItem label="合同范围" class="full-span">
              <LnInput v-model="assessmentForm.contractScope" placeholder="请输入合同范围" />
            </LnFormItem>
          </div>
        </div>

        <div class="assessment-block">
          <div class="assessment-title">交付与复用判断</div>
          <div class="assessment-copy">这组信息帮助内部快速判断投入规模、交付约束和复用价值。</div>
          <div class="grid two-col">
            <LnFormItem label="预估工时">
              <LnInput v-model="assessmentForm.estimatedWorkload" placeholder="请输入预估工时" />
            </LnFormItem>
            <LnFormItem label="刚性交付日期">
              <LnDateInput v-model="assessmentForm.rigidDeliveryDate" clearable />
            </LnFormItem>
            <LnFormItem label="可复用性" class="full-span">
              <LnInput v-model="assessmentForm.reusability" placeholder="如：可复用技术建设" />
            </LnFormItem>
          </div>
        </div>

        <div class="assessment-block">
          <div class="assessment-title">风险与战略属性</div>
          <div class="assessment-copy">集中回答“有没有风险、是不是重点客户、是否属于战略事项”。</div>
          <div class="grid three-col">
            <LnFormItem label="履约风险">
              <LnSelect v-model="assessmentForm.deliveryRisk" :options="yesNoOptions" placeholder="请选择" clearable />
            </LnFormItem>
            <LnFormItem label="回款风险">
              <LnSelect v-model="assessmentForm.paymentRisk" :options="yesNoOptions" placeholder="请选择" clearable />
            </LnFormItem>
            <LnFormItem label="验收风险">
              <LnSelect v-model="assessmentForm.acceptanceRisk" :options="yesNoOptions" placeholder="请选择" clearable />
            </LnFormItem>
            <LnFormItem label="安全/合规风险">
              <LnSelect v-model="assessmentForm.securityOrComplianceRisk" :options="yesNoOptions" placeholder="请选择" clearable />
            </LnFormItem>
            <LnFormItem label="重大故障风险">
              <LnSelect v-model="assessmentForm.majorIncidentRisk" :options="yesNoOptions" placeholder="请选择" clearable />
            </LnFormItem>
            <LnFormItem label="省级督办">
              <LnSelect v-model="assessmentForm.govSupervision" :options="yesNoOptions" placeholder="请选择" clearable />
            </LnFormItem>
            <LnFormItem label="战略客户/标杆客户">
              <LnSelect v-model="assessmentForm.strategicCustomer" :options="yesNoOptions" placeholder="请选择" clearable />
            </LnFormItem>
            <LnFormItem label="核心产品线">
              <LnSelect v-model="assessmentForm.coreProductLine" :options="yesNoOptions" placeholder="请选择" clearable />
            </LnFormItem>
            <LnFormItem label="是否样板">
              <LnSelect v-model="assessmentForm.benchmarkCase" :options="yesNoOptions" placeholder="请选择" clearable />
            </LnFormItem>
          </div>
        </div>

        <LnFormItem label="特殊备注">
          <LnTextarea v-model="assessmentForm.specialRemark" placeholder="请输入补充说明" />
        </LnFormItem>

        <LnFormItem label="处理备注" prop="remark">
          <LnTextarea v-model="formData.remark" :maxlength="1000" placeholder="请输入备注" />
        </LnFormItem>

        <div class="footer-bar">
          <div class="footer-tip">提交后不会进入后台页面，只展示受理结果。</div>
          <LnButton variant="primary" :loading="submitting" @click="handleSubmit">
            {{ submitting ? '提交中...' : '提交需求' }}
          </LnButton>
        </div>
      </LnForm>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { createExternalRawRequirement } from '@/api/raw-requirement'
import type { PriorityAssessmentContextDTO, RawRequirementCreateDTO } from '@/types/requirement'
import { lnToast, LnButton, LnDateInput, LnForm, LnFormItem, LnInput, LnSelect, LnTextarea, type LnFormInstance, type LnFormRules } from '@/components/linear'

const router = useRouter()
const formRef = ref<LnFormInstance>()
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

const rules: LnFormRules = {
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
    lnToast.success('外部提报已提交')
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

</script>

<style scoped lang="scss">
.external-submit-view {
  min-height: 100vh;
  padding: 24px;
  background:
    radial-gradient(circle at top left, rgba(59, 130, 246, 0.1), transparent 26%),
    linear-gradient(180deg, #f7f8fa 0%, #eef2f6 100%);
}

.hero-card {
  width: min(1100px, 100%);
  margin: 0 auto;
  padding: 28px;
}

.hero-copy {
  margin-bottom: 20px;
}

.hero-kicker {
  margin-bottom: 12px;
}

.hero-copy h1 {
  margin: 0 0 10px;
}

.hero-copy p {
  margin: 0;
}

.external-form {
  margin-top: 18px;
}

:deep(.ln-form-item__content > .ln-field),
:deep(.ln-form-item__content > .ln-textarea-field),
:deep(.ln-form-item__content > .ln-date-field),
:deep(.ln-form-item__content > .ln-select-field),
:deep(.ln-form-item__content > .ln-select-field .ln-popover-root),
:deep(.ln-form-item__content > .ln-select-field .ln-popover-trigger),
:deep(.ln-form-item__content > .ln-select-field .ln-select__trigger) {
  width: 100%;
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
  margin: 28px 0 12px;
  padding-top: 18px;
  border-top: 1px solid rgba(17, 24, 39, 0.06);
  font-size: 12px;
  font-weight: 800;
  color: var(--text-tertiary);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.section-copy {
  margin: -4px 0 12px;
  font-size: 12px;
  line-height: 1.65;
  color: var(--text-secondary);
}

.assessment-block {
  margin-top: 14px;
  padding: 18px 18px 6px;
  border-radius: 16px;
  border: 1px solid rgba(17, 24, 39, 0.05);
  background: rgba(248, 250, 252, 0.74);
}

.assessment-block + .assessment-block {
  margin-top: 12px;
}

.assessment-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-primary);
}

.assessment-copy {
  margin: 5px 0 10px;
  font-size: 12px;
  line-height: 1.65;
  color: var(--text-secondary);
}

.full-span {
  grid-column: 1 / -1;
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
  color: var(--text-tertiary);
}

@media (max-width: 900px) {
  .external-submit-view {
    padding: 12px;
  }

  .hero-card {
    padding: 18px;
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

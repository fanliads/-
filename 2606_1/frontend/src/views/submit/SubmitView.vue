<template>
  <div class="submit-view">
    <section class="submit-shell">
      <aside class="intro-card wb-panel">
        <div class="form-kicker wb-meta-pill">内部提报</div>
        <h1 class="wb-page-title">需求汇总表单</h1>
        <p class="wb-page-subtitle">请填写原始需求信息，提交后进入待判定流程。</p>

        <div class="intro-points">
          <div class="intro-point">
            <span>提报目标</span>
            <strong>先把基础背景说清，再补齐影响判定的结构化信息</strong>
          </div>
          <div class="intro-point">
            <span>必填提醒</span>
            <strong>需求标题必填，需求单链接和处理备注至少补一项</strong>
          </div>
          <div class="intro-point">
            <span>进入后续</span>
            <strong>提交后进入待判定流程，由产品侧继续承接与拆分</strong>
          </div>
        </div>

        <div class="intro-summary">
          <div class="summary-item">
            <span>提交对象</span>
            <strong>{{ formData.proposer || '-' }}</strong>
          </div>
          <div class="summary-item">
            <span>业务线</span>
            <strong>{{ formData.businessLine || '待选择' }}</strong>
          </div>
        </div>
      </aside>

      <div class="form-card wb-panel">
        <div class="form-header">
          <div class="section-title major">基础信息</div>
          <p class="section-tip">先输入当前需求最基本的背景、归属与链接信息。</p>
        </div>

        <LnForm
          ref="formRef"
          :model="formData"
          :rules="rules"
        >
          <div class="form-group">
            <label class="form-label">需求标题 <span class="required">*</span></label>
            <LnFormItem prop="title" :show-message="false">
              <LnInput v-model="formData.title" placeholder="请输入需求标题" clearable />
            </LnFormItem>
          </div>

          <div class="form-group">
            <label class="form-label">需求描述</label>
            <LnFormItem prop="description" :show-message="false">
              <LnTextarea v-model="formData.description" :rows="4" placeholder="请详细描述需求内容、背景和期望效果" :maxlength="2000" />
            </LnFormItem>
          </div>

          <div class="form-grid compact-grid">
            <div class="form-group">
              <label class="form-label">业务线</label>
              <LnFormItem prop="businessLine" :show-message="false">
                <LnSelect v-model="formData.businessLine" :options="linearBusinessLineOptions" placeholder="请选择业务线" searchable clearable />
              </LnFormItem>
            </div>

            <div class="form-group">
              <label class="form-label">提出人</label>
              <LnFormItem>
                <LnInput :model-value="formData.proposer || '-'" disabled />
              </LnFormItem>
            </div>

            <div class="form-group">
              <label class="form-label">需求单链接</label>
              <LnFormItem prop="reqLink" :show-message="false">
                <LnInput v-model="formData.reqLink" placeholder="请输入需求单链接" clearable />
              </LnFormItem>
            </div>

            <div class="form-group">
              <label class="form-label">期望上线时间</label>
              <LnFormItem>
                <LnDateInput v-model="formData.expectedOnlineDate" clearable />
              </LnFormItem>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">价值量化评估</label>
            <LnFormItem>
              <LnInput v-model="formData.valueAssessment" placeholder="请输入价值量化评估" clearable />
            </LnFormItem>
          </div>

          <LnFormSection title="业务判定信息" description="以下信息会参与系统规则判定。先补项目与交付背景，再补风险和战略属性，阅读压力会更低。" eyebrow="V3">

          <div class="assessment-block">
            <div class="assessment-head">
              <div class="assessment-title">项目与合同背景</div>
              <div class="assessment-copy">先把项目归属、客户关系和合同边界说清楚，便于系统理解这条需求属于什么业务上下文。</div>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">项目名称</label>
                <LnFormItem>
                  <LnInput v-model="assessmentForm.projectName" placeholder="请输入项目名称" clearable />
                </LnFormItem>
              </div>
              <div class="form-group">
                <label class="form-label">客户名称</label>
                <LnFormItem>
                  <LnInput v-model="assessmentForm.customerName" placeholder="请输入客户名称" clearable />
                </LnFormItem>
              </div>
              <div class="form-group">
                <label class="form-label">合同编号</label>
                <LnFormItem>
                  <LnInput v-model="assessmentForm.contractNo" placeholder="请输入合同编号" clearable />
                </LnFormItem>
              </div>
              <div class="form-group">
                <label class="form-label">合同金额</label>
                <LnFormItem>
                  <LnInput v-model="assessmentForm.contractAmount" placeholder="请输入合同金额" clearable />
                </LnFormItem>
              </div>
              <div class="form-group">
                <label class="form-label">项目类型</label>
                <LnFormItem>
                  <LnInput v-model="assessmentForm.projectType" placeholder="如：常规营收项目/专属定制" clearable />
                </LnFormItem>
              </div>
              <div class="form-group">
                <label class="form-label">商务负责人</label>
                <LnFormItem>
                  <LnInput v-model="assessmentForm.businessOwner" placeholder="请输入商务负责人" clearable />
                </LnFormItem>
              </div>
              <div class="form-group full-span">
                <label class="form-label">合同范围</label>
                <LnFormItem>
                  <LnInput v-model="assessmentForm.contractScope" placeholder="请输入合同范围" clearable />
                </LnFormItem>
              </div>
            </div>
          </div>

          <div class="assessment-block">
            <div class="assessment-head">
              <div class="assessment-title">交付与复用判断</div>
              <div class="assessment-copy">这组字段主要帮助判断投入规模、交付约束和复用价值，不需要一次把所有描述写得很长。</div>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">预估工时</label>
                <LnFormItem>
                  <LnInput v-model="assessmentForm.estimatedWorkload" placeholder="请输入预估工时" clearable />
                </LnFormItem>
              </div>
              <div class="form-group">
                <label class="form-label">刚性交付日期</label>
                <LnFormItem>
                  <LnDateInput v-model="assessmentForm.rigidDeliveryDate" clearable />
                </LnFormItem>
              </div>
              <div class="form-group full-span">
                <label class="form-label">可复用性</label>
                <LnFormItem>
                  <LnInput v-model="assessmentForm.reusability" placeholder="如：可复用技术建设" clearable />
                </LnFormItem>
              </div>
            </div>
          </div>

          <div class="assessment-block">
            <div class="assessment-head">
              <div class="assessment-title">风险与战略属性</div>
              <div class="assessment-copy">这一段是判定权重最高的一组结构化标签，集中回答“有没有风险、是不是重点客户、是否属于战略事项”。</div>
            </div>

            <div class="form-grid risk-grid">
              <div class="form-group">
                <label class="form-label">履约风险</label>
                <LnFormItem>
                  <LnSelect v-model="assessmentForm.deliveryRisk" :options="yesNoLinearOptions" placeholder="请选择" clearable />
                </LnFormItem>
              </div>
              <div class="form-group">
                <label class="form-label">回款风险</label>
                <LnFormItem>
                  <LnSelect v-model="assessmentForm.paymentRisk" :options="yesNoLinearOptions" placeholder="请选择" clearable />
                </LnFormItem>
              </div>
              <div class="form-group">
                <label class="form-label">验收风险</label>
                <LnFormItem>
                  <LnSelect v-model="assessmentForm.acceptanceRisk" :options="yesNoLinearOptions" placeholder="请选择" clearable />
                </LnFormItem>
              </div>
              <div class="form-group">
                <label class="form-label">安全/合规风险</label>
                <LnFormItem>
                  <LnSelect v-model="assessmentForm.securityOrComplianceRisk" :options="yesNoLinearOptions" placeholder="请选择" clearable />
                </LnFormItem>
              </div>
              <div class="form-group">
                <label class="form-label">重大故障风险</label>
                <LnFormItem>
                  <LnSelect v-model="assessmentForm.majorIncidentRisk" :options="yesNoLinearOptions" placeholder="请选择" clearable />
                </LnFormItem>
              </div>
              <div class="form-group">
                <label class="form-label">省级督办</label>
                <LnFormItem>
                  <LnSelect v-model="assessmentForm.govSupervision" :options="yesNoLinearOptions" placeholder="请选择" clearable />
                </LnFormItem>
              </div>
              <div class="form-group">
                <label class="form-label">战略客户/标杆客户</label>
                <LnFormItem>
                  <LnSelect v-model="assessmentForm.strategicCustomer" :options="yesNoLinearOptions" placeholder="请选择" clearable />
                </LnFormItem>
              </div>
              <div class="form-group">
                <label class="form-label">核心产品线</label>
                <LnFormItem>
                  <LnSelect v-model="assessmentForm.coreProductLine" :options="yesNoLinearOptions" placeholder="请选择" clearable />
                </LnFormItem>
              </div>
              <div class="form-group">
                <label class="form-label">是否样板</label>
                <LnFormItem>
                  <LnSelect v-model="assessmentForm.benchmarkCase" :options="yesNoLinearOptions" placeholder="请选择" clearable />
                </LnFormItem>
              </div>
            </div>
          </div>

          </LnFormSection>

          <div class="form-group">
            <label class="form-label">特殊备注</label>
            <LnFormItem>
              <LnTextarea v-model="assessmentForm.specialRemark" :rows="3" placeholder="请输入会影响优先级判定的补充说明" />
            </LnFormItem>
          </div>

          <div class="form-group">
            <label class="form-label">处理备注</label>
            <LnFormItem prop="remark" :show-message="false">
              <LnTextarea v-model="formData.remark" :rows="3" placeholder="请输入处理备注" :maxlength="1000" />
            </LnFormItem>
          </div>

          <div class="submit-footnote">
            <span>提交后会进入原始需求池，并按待判定流程继续承接。</span>
            <span>如果你现在拿不准所有 V3 字段，也可以先补核心业务背景，后续再补充。</span>
          </div>

          <LnButton class="linear-submit-button" variant="primary" :loading="submitting" @click="handleSubmit">{{ submitting ? '提交中...' : '提交' }}</LnButton>
        </LnForm>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { createRawRequirement } from '@/api/raw-requirement'
import { listDictData } from '@/api/dict'
import type { DictDataVO, PriorityAssessmentContextDTO, RawRequirementCreateDTO } from '@/types/requirement'
import { useUserStore } from '@/store/user'
import { lnToast, LnButton, LnDateInput, LnForm, LnFormItem, LnFormSection, LnInput, LnSelect, LnTextarea, type LnFormInstance, type LnFormRules, type LnOption } from '@/components/linear'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref<LnFormInstance>()
const submitting = ref(false)
const yesNoOptions = [
  { label: '是', value: '是' },
  { label: '否', value: '否' },
]
const yesNoLinearOptions: LnOption[] = yesNoOptions.map(item => ({ ...item, color:item.value==='是'?'#d05757':'#6f6f78' }))

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
const linearBusinessLineOptions = computed<LnOption[]>(() => dictBusinessLineOptions.value.map(item => ({ label:item.label,value:item.value,icon:'◇' })))
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
    lnToast.success('需求提交成功')
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
  align-items: flex-start;
  justify-content: center;
  background:
    radial-gradient(circle at top left, rgba(59, 130, 246, 0.08), transparent 26%),
    linear-gradient(180deg, #f7f8fa 0%, #eef2f6 100%);
  padding: 40px 20px;
}

:deep(.ln-form-item__content > .ln-field),
:deep(.ln-form-item__content > .ln-textarea-field),
:deep(.ln-form-item__content > .ln-date-field),
:deep(.ln-form-item__content > .ln-select-field),
:deep(.ln-form-item__content > .ln-select-field .ln-popover-root),
:deep(.ln-form-item__content > .ln-select-field .ln-popover-trigger),
:deep(.ln-form-item__content > .ln-select-field .ln-select__trigger) { width: 100%; }

:deep(.ln-form-section__body) { display: grid; gap: 16px; }
.linear-submit-button { width: 100%; height: 44px; margin-top: 8px; }

.submit-shell {
  width: min(1120px, 100%);
  display: grid;
  grid-template-columns: minmax(280px, 320px) minmax(0, 1fr);
  gap: 18px;
  align-items: start;
}

.intro-card {
  position: sticky;
  top: 24px;
  padding: 24px 22px;
}

.form-card {
  padding: 40px 36px;
  width: 100%;
}

.form-header {
  text-align: left;
  margin-bottom: 24px;

  p {
    margin: 6px 0 0;
  }
}

.intro-points {
  margin-top: 20px;
  display: grid;
  gap: 10px;
}

.intro-point,
.summary-item {
  padding: 12px 14px;
  border-radius: 12px;
  background: rgba(17, 24, 39, 0.035);

  span {
    display: block;
    font-size: 11px;
    color: var(--text-tertiary);
  }

  strong {
    display: block;
    margin-top: 5px;
    font-size: 13px;
    line-height: 1.55;
    color: var(--text-primary);
  }
}

.intro-summary {
  margin-top: 20px;
  display: grid;
  gap: 10px;
}

.form-group {
  margin-bottom: 22px;
}

.form-section {
  margin: 32px 0 12px;
  padding-top: 18px;
  border-top: 1px solid rgba(17, 24, 39, 0.06);
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

.assessment-head {
  margin-bottom: 10px;
}

.assessment-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-primary);
}

.assessment-copy {
  margin-top: 5px;
  font-size: 12px;
  line-height: 1.65;
  color: var(--text-secondary);
  max-width: 760px;
}

.section-title {
  font-size: 12px;
  font-weight: 800;
  color: var(--text-tertiary);
  letter-spacing: 0.06em;
  text-transform: uppercase;

  &.major {
    font-size: 13px;
    color: var(--text-primary);
    letter-spacing: 0.02em;
  }
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

.full-span {
  grid-column: 1 / -1;
}

.risk-grid {
  margin-top: 4px;
}

.compact-grid {
  gap: 0 16px;
}

.form-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--text-primary);

  .required {
    color: var(--danger);
    margin-left: 2px;
  }
}

.submit-footnote {
  display: grid;
  gap: 6px;
  margin-top: 6px;
  margin-bottom: 14px;
  padding: 12px 14px;
  border-radius: 12px;
  background: rgba(17, 24, 39, 0.035);

  span {
    font-size: 12px;
    line-height: 1.65;
    color: var(--text-secondary);
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

@media (max-width: 960px) {
  .submit-shell {
    grid-template-columns: 1fr;
  }

  .intro-card {
    position: static;
  }
}

@media (max-width: 720px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>

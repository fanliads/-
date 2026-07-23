<template>
  <section class="unified-peek" :aria-busy="loading || saving" aria-live="polite">
    <header class="peek-nav">
      <div class="peek-nav__context">
        <LnButton v-if="relationStack.length" size="small" variant="ghost" @click="goBack">
          <template #icon><LnIcon name="chevron-left" /></template>
          返回 {{ relationStack.at(-1)?.reqNo || '上级需求' }}
        </LnButton>
        <span v-else-if="positionLabel" class="position-label">{{ positionLabel }}</span>
      </div>
      <div class="peek-nav__actions">
        <LnButton size="small" variant="ghost" icon-only :disabled="!canMovePrevious || saving" aria-label="上一条需求" title="上一条（↑）" @click="$emit('previous')"><template #icon><LnIcon name="chevron-left" /></template></LnButton>
        <LnButton size="small" variant="ghost" icon-only :disabled="!canMoveNext || saving" aria-label="下一条需求" title="下一条（↓）" @click="$emit('next')"><template #icon><LnIcon name="chevron-right" /></template></LnButton>
        <LnButton size="small" variant="secondary" :disabled="saving" @click="openDetail"><template #icon><LnIcon name="external-link" /></template>完整详情</LnButton>
        <LnButton size="small" variant="ghost" icon-only :disabled="saving" aria-label="关闭需求预览" title="关闭（Esc）" @click="$emit('close')"><template #icon><LnIcon name="close" /></template></LnButton>
      </div>
    </header>

    <div ref="scrollEl" class="peek-body">
      <div v-if="loading" class="loading-state">
        <LnSkeleton width="110px" height="12px" />
        <LnSkeleton width="82%" height="26px" />
        <div class="skeleton-tags"><LnSkeleton v-for="item in 3" :key="item" width="76px" height="24px" /></div>
        <LnSkeleton v-for="item in 6" :key="`block-${item}`" :width="item % 2 ? '100%' : '86%'" height="72px" />
      </div>

      <div v-else-if="error" class="load-error">
        <LnIcon name="warning" />
        <strong>需求预览加载失败</strong>
        <p>{{ error }}</p>
        <div><LnButton size="small" @click="loadCurrent">重新加载</LnButton></div>
      </div>

      <template v-else-if="detail">
        <section class="identity-section">
          <div class="identity-kicker">
            <span>{{ current.type === 'raw' ? '原始需求' : '产品需求' }}</span>
            <b>{{ detail.reqNo }}</b>
            <span v-if="current.type === 'raw' && detail.submitOrigin === 'external'" class="flag">外部提报</span>
            <span v-if="current.type === 'raw' && detail.isUrgent === 1" class="flag urgent">加急</span>
            <span v-if="current.type === 'product' && detail.isDirect === 1" class="flag">直接创建</span>
          </div>
          <h2 :title="detail.title">{{ detail.title }}</h2>
          <div class="identity-facts">
            <span class="status-dot" :class="statusTone(detail.status)"></span><span>{{ detail.statusName || statusLabel(detail.status) }}</span>
            <span class="separator">·</span><span>{{ detail.priority || '待定级' }}</span>
            <span class="separator">·</span><span>{{ ownerLabel }}</span>
          </div>
        </section>

        <section class="peek-section decision-section">
          <div class="section-heading"><h3>决策摘要</h3><span>推进这条需求前最需要确认的事实</span></div>
          <div class="fact-grid">
            <div v-for="fact in decisionFacts" :key="fact.label" class="fact"><span>{{ fact.label }}</span><strong>{{ fact.value }}</strong></div>
          </div>
        </section>

        <section class="peek-section">
          <div class="section-heading"><h3>核心内容</h3><span>长内容在完整详情中维护</span></div>
          <div v-for="block in contentBlocks" :key="block.label" class="content-block">
            <h4>{{ block.label }}</h4>
            <div v-if="block.html" class="content-copy rich-copy" v-html="block.value"></div>
            <p v-else class="content-copy">{{ block.value }}</p>
          </div>
        </section>

        <section class="peek-section">
          <div class="section-heading">
            <h3>属性</h3>
            <span v-if="saving" class="save-state">正在保存 {{ savingLabel }}…</span>
            <span v-else-if="saveMessage" class="save-state" :class="{ error: saveFailed }">{{ saveMessage }}</span>
            <span v-else>{{ editable ? '点击字段即可轻量维护' : '只读预览' }}</span>
          </div>
          <div class="property-grid">
            <template v-if="current.type === 'raw'">
              <PropertyRow label="业务线" :value="detail.businessLineName || detail.businessLine || '待选择'" :editable="editable"><LnPropertyPicker v-if="editable" :model-value="detail.businessLine || ''" title="修改业务线" :options="rawBusinessOptions" @update:model-value="value => saveField('businessLine', value, '业务线')" /></PropertyRow>
              <PropertyRow label="状态" :value="detail.statusName || statusLabel(detail.status)" :editable="editable"><LnPropertyPicker v-if="editable" :model-value="detail.status || ''" title="修改状态" :options="rawStatusOptions" @update:model-value="value => saveField('status', value, '状态')" /></PropertyRow>
              <PropertyRow label="优先级" :value="detail.priority || '待定级'" :editable="editable"><LnPropertyPicker v-if="editable" :model-value="detail.priority || ''" title="修改优先级" :options="priorityOptions" @update:model-value="value => saveField('priority', value, '优先级')" /></PropertyRow>
              <PropertyRow label="产品经理" :value="detail.productManager || '待分配'" :editable="editable"><LnPropertyPicker v-if="editable" :model-value="detail.productManager || ''" title="修改产品经理" :options="managerOptions" @update:model-value="value => saveField('productManager', value, '产品经理')" /></PropertyRow>
              <PropertyRow label="项目经理" :value="detail.projectManager || '待分配'" :editable="editable"><LnPropertyPicker v-if="editable" :model-value="detail.projectManager || ''" title="修改项目经理" :options="projectManagerOptions" @update:model-value="value => saveField('projectManager', value, '项目经理')" /></PropertyRow>
              <PropertyRow label="提出人" :value="detail.proposer || '待补充'" />
              <PropertyRow label="期望上线" :value="detail.expectedOnlineDate || '未设置'" />
              <PropertyRow label="需求来源" :value="detail.source || '待补充'" />
            </template>
            <template v-else>
              <PropertyRow label="需求类型" :value="detail.reqType || '待选择'" :editable="editable"><LnPropertyPicker v-if="editable" :model-value="detail.reqType || ''" title="修改需求类型" :options="productTypeOptions" @update:model-value="value => saveField('reqType', value, '需求类型')" /></PropertyRow>
              <PropertyRow label="业务线" :value="detail.businessLineName || '待选择'" :editable="editable"><LnPropertyPicker v-if="editable" :model-value="String(detail.businessLineId || '')" title="修改业务线" :options="productBusinessOptions" @update:model-value="value => saveField('businessLineId', value ? Number(value) : null, '业务线')" /></PropertyRow>
              <PropertyRow label="状态" :value="detail.statusName || statusLabel(detail.status)" :editable="editable"><LnPropertyPicker v-if="editable" :model-value="detail.status || ''" title="修改状态" :options="productStatusOptions" @update:model-value="value => saveField('status', value, '状态')" /></PropertyRow>
              <PropertyRow label="优先级" :value="detail.priority || '待定级'" :editable="editable"><LnPropertyPicker v-if="editable" :model-value="detail.priority || ''" title="修改优先级" :options="priorityOptions" @update:model-value="value => saveField('priority', value, '优先级')" /></PropertyRow>
              <PropertyRow label="处理人" :value="detail.handler || detail.assigneeName || '待分配'" :editable="editable"><LnPropertyPicker v-if="editable" :model-value="detail.handler || ''" title="修改处理人" :options="managerOptions" @update:model-value="value => saveField('handler', value, '处理人')" /></PropertyRow>
              <PropertyRow label="所属迭代" :value="detail.sprintName || '未排期'" :editable="editable"><LnPropertyPicker v-if="editable" :model-value="String(detail.sprintId || '')" title="修改迭代" :options="sprintOptions" @update:model-value="value => saveField('sprintId', value ? Number(value) : 0, '所属迭代')" /></PropertyRow>
              <PropertyRow label="功能模块" :value="detail.productModule || '待补充'" />
              <PropertyRow label="PRD" :value="detail.prdUrl || '待补充'" />
            </template>
          </div>
        </section>

        <section class="peek-section relation-section">
          <div class="section-heading"><h3>{{ relationTitle }}</h3><span v-if="current.type === 'raw'">{{ linkedProducts.length }} 条</span></div>
          <template v-if="current.type === 'raw'">
            <button v-for="item in linkedProducts.slice(0, 5)" :key="item.id" class="relation-card" type="button" :disabled="saving" @click="navigateRelation('product', item.id, item.reqNo)">
              <span class="relation-type">产品需求</span><strong>{{ item.reqNo }}</strong><span class="relation-name">{{ item.title }}</span><span class="relation-status">{{ item.statusName || statusLabel(item.status) }}</span><LnIcon name="chevron-right" />
            </button>
            <div v-if="!linkedProducts.length" class="semantic-empty">尚未拆分产品需求</div>
            <LnButton v-if="linkedProducts.length > 5" size="small" variant="ghost" @click="openDetail">查看全部 {{ linkedProducts.length }} 条</LnButton>
          </template>
          <template v-else>
            <button v-if="detail.rawReqId && detail.isDirect !== 1" class="relation-card" type="button" :disabled="saving" @click="navigateRelation('raw', detail.rawReqId, detail.rawReqNo || detail.rawReqTitle)">
              <span class="relation-type">原始需求</span><strong>{{ detail.rawReqNo || `RAW-${detail.rawReqId}` }}</strong><span class="relation-name">{{ detail.rawReqTitle || '查看父原始需求' }}</span><LnIcon name="chevron-right" />
            </button>
            <div v-else class="semantic-empty">直接创建，无父原始需求</div>
          </template>
          <p v-if="relationError" class="relation-error">{{ relationError }}</p>
        </section>

        <section class="peek-section trace-section">
          <div class="section-heading"><h3>最近追溯</h3><span>各展示最近 3 条</span></div>
          <div class="trace-columns">
            <div><h4>最近补充</h4><div v-for="item in supplements.slice(0, 3)" :key="item.id" class="trace-item"><p>{{ item.content }}</p><time>{{ formatTime(item.createTime) }}</time></div><div v-if="!supplements.length" class="trace-empty">暂无补充记录</div></div>
            <div><h4>最近活动</h4><div v-for="item in logs.slice(0, 3)" :key="item.id" class="trace-item"><p>{{ item.actionName || item.remark || item.action }}</p><time>{{ formatTime(item.createTime) }}</time></div><div v-if="!logs.length" class="trace-empty">暂无活动记录</div></div>
          </div>
        </section>
      </template>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, onMounted, ref, watch } from 'vue'
import { getRawRequirementDetail, getRawRequirementLogs, getRawRequirementSupplements, updateRawRequirement } from '@/api/raw-requirement'
import { getProductRequirementDetail, getProductRequirementLogs, getProductRequirementSupplements, updateProductRequirement } from '@/api/product-requirement'
import { listDictData } from '@/api/dict'
import { listSprintOptions } from '@/api/sprint'
import { LnButton, LnIcon, LnPropertyPicker, LnSkeleton, type LnOption } from '@/components/linear'
import { getBusinessLineVisual, getPriorityVisual, getRequirementTypeVisual } from '@/components/linear/optionVisuals'
import { sanitizeRichText } from '@/utils/rich-text'

type RequirementType = 'raw' | 'product'
interface SessionObject { type: RequirementType; id: number; reqNo?: string; scrollTop?: number }
interface SequenceItem { id: number; reqNo?: string }

const PropertyRow = defineComponent({
  props: { label: { type: String, required: true }, value: { type: [String, Number], default: '' }, editable: Boolean },
  setup(props, { slots }) {
    return () => h('div', { class: ['property-row', props.editable && 'is-editable'] }, [
      h('span', props.label),
      slots.default?.() || h('strong', String(props.value || '待补充')),
    ])
  },
})

const props = withDefaults(defineProps<{
  sourceType: RequirementType
  sourceId: number
  sequence?: SequenceItem[]
  sourceIndex?: number
  editable?: boolean
  momentary?: boolean
}>(), { sequence: () => [], sourceIndex: -1, editable: true, momentary: false })

const emit = defineEmits<{
  close: []
  previous: []
  next: []
  openDetail: [type: RequirementType, id: number]
  updated: [type: RequirementType, id: number]
}>()

const current = ref<SessionObject>({ type: props.sourceType, id: props.sourceId })
const relationStack = ref<SessionObject[]>([])
const detail = ref<any>(null)
const supplements = ref<any[]>([])
const logs = ref<any[]>([])
const loading = ref(false)
const saving = ref(false)
const savingLabel = ref('')
const saveMessage = ref('')
const saveFailed = ref(false)
const error = ref('')
const relationError = ref('')
const scrollEl = ref<HTMLElement>()
let requestToken = 0

const priorityOptions = ref<LnOption[]>([
  { label: '一级A类（P0）', value: 'P0', ...getPriorityVisual('P0') },
  { label: '一级B类（P1）', value: 'P1', ...getPriorityVisual('P1') },
  { label: '二级（P2）', value: 'P2', ...getPriorityVisual('P2') },
  { label: '三级（P3）', value: 'P3', ...getPriorityVisual('P3') },
])
const rawStatusOptions = ref<LnOption[]>([
  { label: '待判定', value: 'pending_judgement', icon: 'pending' },
  { label: '待拆分', value: 'pending_split', icon: 'pending' },
  { label: '处理中', value: 'in_progress', icon: 'progress' },
  { label: '已上线', value: 'online', icon: 'success' },
  { label: '已关闭', value: 'closed', icon: 'check' },
  { label: '已挂起', value: 'suspended', icon: 'paused' },
  { label: '已拒绝', value: 'rejected', icon: 'blocked' },
])
const productStatusOptions: LnOption[] = [
  { label: '待设计', value: 'pending_design', icon: 'pending' },
  { label: '需求池', value: 'backlog', icon: 'archive' },
  { label: '调研中', value: 'researching', icon: 'progress' },
  { label: '设计中', value: 'designing', icon: 'progress' },
  { label: '开发中', value: 'developing', icon: 'progress' },
  { label: '已上线', value: 'online', icon: 'success' },
  { label: '已作废', value: 'voided', icon: 'blocked' },
]
const rawBusinessOptions = ref<LnOption[]>([])
const productBusinessOptions = ref<LnOption[]>([])
const managerOptions = ref<LnOption[]>([])
const projectManagerOptions = ref<LnOption[]>([])
const productTypeOptions = ref<LnOption[]>([])
const sprintOptions = ref<LnOption[]>([])

const editable = computed(() => props.editable && !props.momentary && !saving.value)
const isSourceObject = computed(() => current.value.type === props.sourceType && current.value.id === props.sourceId && relationStack.value.length === 0)
const canMovePrevious = computed(() => isSourceObject.value && props.sourceIndex > 0)
const canMoveNext = computed(() => isSourceObject.value && props.sourceIndex >= 0 && props.sourceIndex < props.sequence.length - 1)
const positionLabel = computed(() => isSourceObject.value && props.sourceIndex >= 0 ? `当前页 ${props.sourceIndex + 1} / ${props.sequence.length}` : '')
const linkedProducts = computed<any[]>(() => detail.value?.linkedProducts || [])
const ownerLabel = computed(() => current.value.type === 'raw'
  ? `产品经理 ${detail.value?.productManager || '待分配'}`
  : `处理人 ${detail.value?.handler || detail.value?.assigneeName || '待分配'}`)
const relationTitle = computed(() => current.value.type === 'raw' ? '下游产品需求' : '父原始需求')

const decisionFacts = computed(() => {
  const d = detail.value || {}
  if (current.value.type === 'raw') return [
    { label: '来源', value: d.source || '待补充' },
    { label: '业务线', value: d.businessLineName || d.businessLine || '待选择' },
    { label: '期望上线', value: d.expectedOnlineDate || '未设置' },
    { label: '生效等级', value: d.effectiveLevel || d.priority || '待判定' },
    { label: '信息缺口', value: normalizeMissing(d.missingFields) },
    { label: d.submitOrigin === 'external' ? '公司 / 客户' : '项目', value: d.submitOrigin === 'external' ? (d.externalCompany || '待补充') : (d.projectName || '待补充') },
  ]
  return [
    { label: '需求类型', value: d.reqType || '待选择' },
    { label: '业务线', value: d.businessLineName || '待选择' },
    { label: '所属迭代', value: d.sprintName || '未排期' },
    { label: '交付判断', value: d.sprintName ? (d.prdUrl ? '已排期，材料已关联' : '已排期，PRD 待补') : '尚未排期' },
    { label: '父需求来源', value: d.rawReqId && d.isDirect !== 1 ? (d.rawReqTitle || `RAW-${d.rawReqId}`) : '直接创建' },
    { label: '期望上线', value: d.expectedDate || '未设置' },
  ]
})

const contentBlocks = computed<Array<{ label: string; value: string; html?: boolean }>>(() => {
  const d = detail.value || {}
  if (current.value.type === 'raw') return [
    { label: '业务诉求摘要', value: plainSummary([d.description, d.externalExpectedResult && `期望结果：${d.externalExpectedResult}`].filter(Boolean).join('\n'), '需求描述待补充') },
    { label: '系统判定摘要', value: [d.strategyHint, d.explanationSummary].filter(Boolean).join('；') || '系统判定待补充' },
    { label: '业务判定摘要', value: d.remark || d.valueAssessment || '业务判定待补充' },
  ]
  return [
    { label: '用户故事', value: sanitizeRichText(d.description) || '<span class="muted">用户故事待补充</span>', html: true },
    { label: '产品分析', value: [d.reqType && `类型：${d.reqType}`, d.productModule && `功能边界：${d.productModule}`, d.sprintName ? `已进入 ${d.sprintName}` : '尚未排期'].filter(Boolean).join('；') },
    { label: '父原始需求依据', value: d.rawReqId && d.isDirect !== 1 ? `来自「${d.rawReqTitle || `RAW-${d.rawReqId}`}」，请结合上游业务诉求继续推进。` : '直接创建的产品需求，无父原始需求依据。' },
  ]
})

watch(() => [props.sourceType, props.sourceId], () => {
  current.value = { type: props.sourceType, id: props.sourceId }
  relationStack.value = []
  void loadCurrent()
})

onMounted(() => {
  void Promise.all([loadCurrent(), loadOptions()])
})

async function loadOptions() {
  const results = await Promise.allSettled([
    listDictData('business_line'), listDictData('product_manager'), listDictData('project_manager'), listDictData('req_type'), listDictData('priority_level'), listSprintOptions(),
  ])
  const data = (index: number) => results[index].status === 'fulfilled' ? ((results[index] as PromiseFulfilledResult<any>).value.data || []) : []
  const business = data(0)
  rawBusinessOptions.value = business.map((item: any) => ({ label: item.label, value: item.value, ...getBusinessLineVisual(item.label, item.value) }))
  productBusinessOptions.value = [{ label: '未设置', value: '', icon: 'none' }, ...business.map((item: any) => ({ label: item.label, value: String(item.id), ...getBusinessLineVisual(item.label, String(item.id)) }))]
  managerOptions.value = [{ label: '未分配', value: '', icon: 'none' }, ...data(1).map((item: any) => ({ label: item.label, value: item.value, icon: 'user' }))]
  projectManagerOptions.value = [{ label: '未分配', value: '', icon: 'none' }, ...data(2).map((item: any) => ({ label: item.label, value: item.value, icon: 'user' }))]
  productTypeOptions.value = [{ label: '未设置', value: '', icon: 'none' }, ...data(3).map((item: any) => ({ label: item.label, value: item.value, ...getRequirementTypeVisual(item.label, item.value) }))]
  const priorities = data(4)
  if (priorities.length) priorityOptions.value = priorities.map((item: any) => ({ label: item.label, value: item.value, ...getPriorityVisual(item.value, item.label) }))
  sprintOptions.value = [{ label: '未排期', value: '', icon: 'none' }, ...data(5).map((item: any) => ({ label: item.name, value: String(item.id), icon: 'sprint' }))]
}

async function loadCurrent() {
  const token = ++requestToken
  loading.value = true
  error.value = ''
  try {
    const calls = current.value.type === 'raw'
      ? [getRawRequirementDetail(current.value.id), getRawRequirementSupplements(current.value.id), getRawRequirementLogs(current.value.id)]
      : [getProductRequirementDetail(current.value.id), getProductRequirementSupplements(current.value.id), getProductRequirementLogs(current.value.id)]
    const [detailRes, supplementsRes, logsRes] = await Promise.all(calls)
    if (token !== requestToken) return
    detail.value = (detailRes as any).data
    supplements.value = ((supplementsRes as any).data || []).sort(byNewest)
    logs.value = ((logsRes as any).data || []).sort(byNewest)
    current.value.reqNo = detail.value?.reqNo
    requestAnimationFrame(() => { if (scrollEl.value) scrollEl.value.scrollTop = current.value.scrollTop || 0 })
  } catch (cause: any) {
    if (token !== requestToken) return
    error.value = cause?.message || '需求已不存在、无权查看或服务暂不可用。'
  } finally {
    if (token === requestToken) loading.value = false
  }
}

async function saveField(field: string, value: any, label: string) {
  if (!editable.value || !detail.value) return
  const oldValue = detail.value[field]
  saving.value = true
  savingLabel.value = label
  saveMessage.value = ''
  saveFailed.value = false
  try {
    if (current.value.type === 'raw') await updateRawRequirement(current.value.id, { [field]: value })
    else await updateProductRequirement(current.value.id, { [field]: value })
    detail.value[field] = value
    if (field === 'status') detail.value.statusName = statusLabel(String(value))
    if (field === 'businessLineId') detail.value.businessLineName = productBusinessOptions.value.find(item => item.value === String(value))?.label || ''
    if (field === 'businessLine') detail.value.businessLineName = rawBusinessOptions.value.find(item => item.value === String(value))?.label || String(value)
    if (field === 'sprintId') detail.value.sprintName = sprintOptions.value.find(item => item.value === String(value))?.label || ''
    saveMessage.value = `${label}已保存`
    emit('updated', current.value.type, current.value.id)
  } catch (cause: any) {
    detail.value[field] = oldValue
    saveFailed.value = true
    saveMessage.value = cause?.message || `${label}保存失败，请重试`
  } finally {
    saving.value = false
    window.setTimeout(() => { if (!saveFailed.value) saveMessage.value = '' }, 2200)
  }
}

async function navigateRelation(type: RequirementType, id: number, reqNo?: string) {
  if (saving.value) return
  relationError.value = ''
  const previous = { ...current.value, scrollTop: scrollEl.value?.scrollTop || 0 }
  current.value = { type, id, reqNo }
  await loadCurrent()
  if (error.value) {
    current.value = previous
    error.value = ''
    relationError.value = '关系需求加载失败，当前内容已保留，请稍后重试。'
    await loadCurrent()
    return
  }
  relationStack.value.push(previous)
}

async function goBack() {
  if (saving.value) return
  const target = relationStack.value.pop()
  if (!target) return
  current.value = target
  await loadCurrent()
}

function openDetail() { emit('openDetail', current.value.type, current.value.id) }
function byNewest(a: any, b: any) { return String(b.createTime || '').localeCompare(String(a.createTime || '')) }
function plainSummary(value: string | undefined, fallback: string) {
  const text = String(value || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  if (!text) return fallback
  return text.length > 420 ? `${text.slice(0, 420)}…` : text
}
function normalizeMissing(value: any) {
  if (Array.isArray(value)) return value.length ? value.join('、') : '信息完整'
  return String(value || '').trim() || '信息完整'
}
function formatTime(value?: string) { return value ? value.replace('T', ' ').slice(0, 16) : '时间待补充' }
function statusTone(status?: string) {
  if (['online', 'done', 'completed', 'accepted'].includes(status || '')) return 'success'
  if (['rejected', 'voided', 'blocked'].includes(status || '')) return 'danger'
  if (['in_progress', 'researching', 'designing', 'developing'].includes(status || '')) return 'progress'
  return 'pending'
}
function statusLabel(status?: string) {
  const map: Record<string, string> = {
    pending_judgement: '待判定', pending_split: '待拆分', in_progress: '处理中', online: '已上线', closed: '已关闭', suspended: '已挂起', rejected: '已拒绝',
    pending_design: '待设计', pending_pm: '待产品经理', backlog: '需求池', researching: '调研中', designing: '设计中', developing: '开发中', testing: '测试中', accepted: '验收通过', voided: '已作废',
  }
  return map[status || ''] || status || '待处理'
}
</script>

<style scoped lang="scss">
.unified-peek { height: 100%; display: flex; flex-direction: column; background: #fcfcfb; color: var(--text-primary); }
.peek-nav { position: sticky; top: 0; z-index: 4; min-height: 52px; padding: 8px 12px; display: flex; align-items: center; justify-content: space-between; gap: 8px; border-bottom: 1px solid var(--border-light); background: rgba(252,252,251,.96); backdrop-filter: blur(14px); }
.peek-nav__context { min-width: 0; }.peek-nav__actions { display: flex; align-items: center; gap: 4px; }.position-label { color: var(--text-tertiary); font-size: 11px; font-variant-numeric: tabular-nums; }
.peek-body { flex: 1; min-height: 0; overflow: auto; overscroll-behavior: contain; }
.loading-state { padding: 24px; display: grid; gap: 14px; }.skeleton-tags { display: flex; gap: 8px; }
.load-error { margin: 24px; padding: 28px; display: grid; justify-items: start; gap: 9px; border: 1px solid rgba(196,71,65,.18); border-radius: 12px; background: rgba(196,71,65,.045); }.load-error p { margin: 0; color: var(--text-secondary); font-size: 12px; line-height: 1.6; }
.identity-section { padding: 22px 24px 20px; border-bottom: 1px solid var(--border-light); background: linear-gradient(180deg,#fff 0%,#fafaf8 100%); }.identity-kicker { display: flex; align-items: center; flex-wrap: wrap; gap: 7px; color: var(--text-tertiary); font-size: 11px; }.identity-kicker b { color: var(--text-secondary); font-variant-numeric: tabular-nums; }.identity-section h2 { margin: 10px 0 12px; display: -webkit-box; overflow: hidden; -webkit-line-clamp: 3; -webkit-box-orient: vertical; font-size: 19px; line-height: 1.42; letter-spacing: -.018em; }.identity-facts { display: flex; align-items: center; flex-wrap: wrap; gap: 7px; color: var(--text-secondary); font-size: 12px; }.separator { color: var(--border-strong); }.flag { padding: 2px 6px; border-radius: 999px; background: #eff1ed; color: #5e675f; font-size: 10px; font-weight: 650; }.flag.urgent { background: #fce8e2; color: #a24636; }
.status-dot { width: 8px; height: 8px; border-radius: 50%; background: #a0a5ac; }.status-dot.progress { background: #5e6ad2; }.status-dot.success { background: #2f9e6f; }.status-dot.danger { background: #d05757; }
.peek-section { padding: 20px 24px; border-bottom: 1px solid var(--border-light); }.decision-section { background: #f8f8f5; }.section-heading { margin-bottom: 13px; display: flex; align-items: baseline; justify-content: space-between; gap: 10px; }.section-heading h3 { margin: 0; font-size: 12px; font-weight: 720; letter-spacing: .02em; }.section-heading > span { color: var(--text-tertiary); font-size: 10.5px; }.save-state { color: #2f8060 !important; }.save-state.error { color: #b4473e !important; }
.fact-grid { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 1px; border: 1px solid var(--border-light); border-radius: 9px; overflow: hidden; background: var(--border-light); }.fact { min-width: 0; padding: 10px 11px; display: grid; gap: 4px; background: #fff; }.fact span { color: var(--text-tertiary); font-size: 10px; }.fact strong { overflow: hidden; text-overflow: ellipsis; color: var(--text-primary); font-size: 12px; font-weight: 620; white-space: nowrap; }
.content-block { padding: 12px 0; }.content-block + .content-block { border-top: 1px solid var(--border-light); }.content-block h4 { margin: 0 0 7px; color: var(--text-secondary); font-size: 11px; font-weight: 680; }.content-copy { margin: 0; display: -webkit-box; overflow: hidden; -webkit-line-clamp: 8; -webkit-box-orient: vertical; color: #3f4641; font-size: 12.5px; line-height: 1.7; }.rich-copy :deep(p) { margin: 0 0 6px; }.rich-copy :deep(.muted) { color: var(--text-tertiary); }
.property-grid { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); border-top: 1px solid var(--border-light); border-left: 1px solid var(--border-light); border-radius: 8px; overflow: hidden; }.property-grid :deep(.property-row) { min-width: 0; min-height: 48px; padding: 8px 10px; display: grid; align-content: center; gap: 4px; border-right: 1px solid var(--border-light); border-bottom: 1px solid var(--border-light); background: #fff; }.property-grid :deep(.property-row > span) { color: var(--text-tertiary); font-size: 10px; }.property-grid :deep(.property-row > strong) { overflow: hidden; text-overflow: ellipsis; font-size: 12px; font-weight: 580; white-space: nowrap; }.property-grid :deep(.property-row .property-trigger) { width: 100%; min-width: 0; padding: 0; justify-content: flex-start; background: transparent; border: 0; box-shadow: none; }
.relation-section { background: #fbfbfa; }.relation-card { width: 100%; min-height: 58px; padding: 9px 10px; display: grid; grid-template-columns: auto auto minmax(0,1fr) auto auto; align-items: center; gap: 8px; border: 1px solid var(--border-light); border-radius: 8px; background: #fff; color: inherit; text-align: left; cursor: pointer; }.relation-card + .relation-card { margin-top: 6px; }.relation-card:hover { border-color: #b9beb8; background: #f7f8f5; }.relation-card:focus-visible { outline: 2px solid var(--ln-accent); outline-offset: 1px; }.relation-type { color: var(--text-tertiary); font-size: 9.5px; }.relation-card strong { font-size: 11px; font-variant-numeric: tabular-nums; }.relation-name { min-width: 0; overflow: hidden; text-overflow: ellipsis; font-size: 12px; white-space: nowrap; }.relation-status { color: var(--text-tertiary); font-size: 10px; }.semantic-empty { padding: 16px; border: 1px dashed var(--border-light); border-radius: 8px; color: var(--text-tertiary); font-size: 12px; text-align: center; }.relation-error { margin: 8px 0 0; color: #b4473e; font-size: 11px; }
.trace-columns { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 18px; }.trace-columns h4 { margin: 0 0 9px; color: var(--text-secondary); font-size: 11px; }.trace-item { padding: 8px 0; border-top: 1px solid var(--border-light); }.trace-item p { margin: 0 0 4px; display: -webkit-box; overflow: hidden; -webkit-line-clamp: 2; -webkit-box-orient: vertical; font-size: 11.5px; line-height: 1.5; }.trace-item time,.trace-empty { color: var(--text-tertiary); font-size: 9.5px; }
@media (max-width: 1199px) { .fact-grid,.property-grid { grid-template-columns: 1fr; } }
@media (max-width: 959px) { .peek-nav { padding-left: 10px; padding-right: 10px; }.peek-nav__actions :deep(.ln-button__label) { display: none; }.identity-section,.peek-section { padding-left: 18px; padding-right: 18px; }.trace-columns { grid-template-columns: 1fr; } }
</style>

<template>
  <div class="sprint-view">
    <div class="toolbar-header wb-page-header wb-panel">
      <div class="title-block">
        <div class="title-row wb-title-row">
          <div class="page-title wb-page-title">迭代管理</div>
          <span class="page-meta wb-page-meta wb-meta-pill">{{ sprints.length }} 个迭代</span>
          <span v-if="activeSprint" class="page-meta wb-page-meta wb-meta-pill">{{ activeSprint.requirements.length }} 条需求</span>
        </div>
        <div class="page-subtitle wb-page-subtitle">把 sprint 作为承载排期与需求范围的统一工作区。</div>
      </div>
      <LnButton v-if="canManageSprint" variant="primary" @click="openCreateDialog"><template #icon><LnIcon name="plus"/></template>新建迭代</LnButton>
    </div>

    <section class="sprint-layout wb-shell">
      <div class="sprint-sidebar wb-panel">
        <div class="sidebar-header">
          <div class="sidebar-title">迭代列表</div>
          <div class="sidebar-copy">左侧做导航，右侧承接当前 sprint 的目标、范围和排期动作。</div>
          <LnInput v-model="sprintKeyword" placeholder="搜索迭代或业务线" clearable><template #prefix><LnIcon name="search"/></template></LnInput>
        </div>
        <div class="sidebar-scroll">
        <LnSprintRow
          v-for="item in filteredSprints"
          :key="item.id"
          :name="item.name" :team="item.teamName" :start-date="item.startDate" :end-date="item.endDate"
          :status-label="getStatusLabel(item.status)" :status-tone="getStatusTone(item.status)"
          :cadence-label="getCadenceLabel(item)"
          :requirement-count="sprintDetailMap[item.id]?.requirements.length || 0"
          :progress="getSprintProgress(sprintDetailMap[item.id])" :selected="selectedSprintId === item.id"
          @click="selectSprint(item.id)"
        />
        <LnEmptyState v-if="!filteredSprints.length" title="没有匹配的迭代" description="尝试调整搜索关键词。" />
        </div>
      </div>

      <div class="sprint-detail wb-panel" :aria-busy="loading">
        <div v-if="loading" class="sprint-detail-skeleton"><LnSkeleton width="42%" height="22px"/><LnSkeleton width="68%"/><div class="detail-skeleton-grid"><LnSkeleton v-for="item in 4" :key="item" height="72px"/></div><LnSkeleton v-for="item in 5" :key="`row-${item}`" height="46px"/></div>
        <template v-else-if="activeSprint">
          <div class="detail-header">
            <div>
              <div class="detail-title">{{ activeSprint.name }}</div>
              <div class="detail-subtitle">{{ activeSprint.teamName }} · {{ activeSprint.startDate }} ~ {{ activeSprint.endDate }}</div>
              <div class="detail-meta-line">
                <span class="detail-meta-item">状态 {{ getStatusLabel(activeSprint.status) }}</span>
                <span class="detail-meta-sep">·</span>
                <span class="detail-meta-item">周期 {{ getCadenceLabel(activeSprint) }}</span>
                <span class="detail-meta-sep">·</span>
                <span class="detail-meta-item">需求 {{ activeSprint.requirements.length }} 条</span>
              </div>
            </div>
          </div>

          <div class="detail-facts wb-detail-facts">
            <div class="detail-fact wb-detail-fact wide fact-wide">
              <span>迭代目标</span>
              <strong>{{ activeSprint.goal || '当前未补充明确的迭代目标' }}</strong>
            </div>
            <div class="detail-fact wb-detail-fact">
              <span>迭代周期</span>
              <strong>{{ activeSprint.startDate }} ~ {{ activeSprint.endDate }} · {{ getDurationDays(activeSprint.startDate, activeSprint.endDate) }} 天</strong>
            </div>
            <div class="detail-fact wb-detail-fact">
              <span>迭代状态</span>
              <strong>{{ getStatusLabel(activeSprint.status) }}</strong>
            </div>
            <div class="detail-fact wb-detail-fact">
              <span>需求数量</span>
              <strong>{{ activeSprint.requirements.length }}</strong>
            </div>
          </div>

          <div class="table-section">
            <div class="section-head wb-section-head">
              <div class="section-title wb-section-title">当前范围</div>
              <div class="section-note wb-section-note">收敛展示当前 sprint 已纳入的产品需求。</div>
            </div>
            <div class="range-list">
              <div class="range-header range-grid">
                <div class="head-cell">当前范围</div>
                <div class="head-cell">优先级</div>
                <div class="head-cell">状态</div>
                <div class="head-cell">处理人</div>
                <div class="head-cell action-head">操作</div>
              </div>

              <div
                v-for="row in activeSprint.requirements"
                :key="row.id"
                class="range-row range-grid"
              >
                <div class="range-main">
                  <div class="range-meta">
                    <div class="range-prefix">
                      <span class="req-no">{{ row.reqNo }}</span>
                    </div>
                    <span class="meta-text">{{ row.productModule || '未设模块' }}</span>
                  </div>
                  <div class="range-title">{{ row.title }}</div>
                </div>
                <div class="cell">
                  <span class="priority-pill">{{ row.priority || '-' }}</span>
                </div>
                <div class="cell">
                  <span class="status-tag">{{ row.statusName || '-' }}</span>
                </div>
                <div class="cell assignee-cell">{{ row.assigneeName || '-' }}</div>
                <div class="cell row-actions">
                  <LnButton v-if="canManageSprint" size="small" variant="danger" @click="removeRequirement(row.id)">移出</LnButton>
                </div>
              </div>

              <LnEmptyState v-if="activeSprint.requirements.length === 0" title="当前迭代还没有纳入需求" description="从下方未排期需求中选择并纳入当前迭代。" />
            </div>
          </div>

          <div v-if="canManageSprint" class="bind-panel">
            <div class="section-head wb-section-head">
              <div class="section-title wb-section-title">纳入迭代</div>
              <div class="section-note wb-section-note">把未排期的产品需求直接拉入当前 sprint。</div>
            </div>
            <div class="bind-row">
            <LnSelect v-model="selectedRequirementValue" :options="unscheduledRequirementOptions" placeholder="选择要纳入迭代的产品需求" searchable clearable />
            <LnButton variant="primary" :disabled="!selectedRequirementId" @click="bindRequirement">纳入迭代</LnButton>
            </div>
          </div>
        </template>
        <LnEmptyState v-else title="暂无迭代数据" description="创建第一个迭代后，即可管理目标、周期与需求范围。"><LnButton v-if="canManageSprint" size="small" variant="primary" @click="openCreateDialog">新建迭代</LnButton></LnEmptyState>
      </div>
    </section>

    <LnDialog v-model="dialogVisible" title="新建迭代" description="定义团队、周期、目标与初始状态。" width="560px" :close-on-backdrop="false">
      <LnForm ref="formRef" :model="formData" :rules="rules" label-width="100px">
        <LnFormItem label="业务线" prop="teamName">
          <LnSelect v-model="formData.teamName" :options="businessLineSelectOptions" placeholder="选择业务线" searchable @change="syncSprintName" />
        </LnFormItem>
        <LnFormItem label="迭代名称" prop="name">
          <LnInput v-model="formData.name" placeholder="系统自动生成，支持修改" />
        </LnFormItem>
        <LnFormItem label="迭代状态" prop="status">
          <LnSelect v-model="formData.status" :options="sprintStatusOptions" />
        </LnFormItem>
        <LnFormItem label="周期预设">
          <div class="cadence-presets">
            <LnButton size="small" :variant="formData.cadenceType === 'weekly' ? 'primary' : 'secondary'" @click="applyCadencePreset('weekly')">单周</LnButton>
            <LnButton size="small" :variant="formData.cadenceType === 'biweekly' ? 'primary' : 'secondary'" @click="applyCadencePreset('biweekly')">双周</LnButton>
            <span class="duration-badge">{{ periodLabel }}</span>
          </div>
        </LnFormItem>
        <div class="form-row">
          <LnFormItem label="开始日期" prop="startDate">
            <LnDateInput v-model="formData.startDate" @change="handleStartDateChange" />
          </LnFormItem>
          <LnFormItem label="结束日期" prop="endDate">
            <LnDateInput v-model="formData.endDate" @change="handleManualDateChange" />
          </LnFormItem>
        </div>
        <div v-if="dateRangeError" class="date-range-error">{{ dateRangeError }}</div>
        <LnFormItem label="迭代目标" prop="goal">
          <LnTextarea v-model="formData.goal" placeholder="输入本次迭代目标" />
        </LnFormItem>
      </LnForm>
      <template #footer>
        <LnButton variant="ghost" @click="dialogVisible = false">取消</LnButton>
        <LnButton variant="primary" :loading="submitting" @click="submitSprint">创建</LnButton>
      </template>
    </LnDialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import {
  bindSprintRequirement,
  createSprint,
  getSprintDetail,
  listSprints,
  removeSprintRequirement,
  type SprintDetail,
  type SprintItem,
  type SprintCadenceType,
  type SprintPayload,
} from '@/api/sprint'
import { pageQueryProductRequirements } from '@/api/product-requirement'
import { listDictData } from '@/api/dict'
import { useUserStore } from '@/store/user'
import { lnToast, LnButton, LnDateInput, LnDialog, LnEmptyState, LnForm, LnFormItem, LnIcon, LnInput, LnSelect, LnSkeleton, LnSprintRow, LnTextarea, type LnFormInstance, type LnFormRules, type LnOption } from '@/components/linear'

const userStore = useUserStore()
const sprints = ref<SprintItem[]>([])
const sprintDetailMap = ref<Record<number, SprintDetail>>({})
const selectedSprintId = ref<number | null>(null)
const loading = ref(false)
const dialogVisible = ref(false)
const submitting = ref(false)
const selectedRequirementId = ref<number | null>(null)
const unscheduledRequirements = ref<Array<{ id: number; reqNo: string; title: string }>>([])
const businessLineOptions = ref<Array<{ label: string; value: string }>>([])
const formRef = ref<LnFormInstance>()
const sprintKeyword = ref('')

const formData = reactive<SprintPayload>({
  name: '',
  teamName: '',
  cadenceType: 'custom',
  startDate: '',
  endDate: '',
  status: 'planning',
  goal: '',
})

const rules: LnFormRules = {
  name: [{ required: true, message: '请输入迭代名称', trigger: 'blur' }],
  teamName: [{ required: true, message: '请输入团队名称', trigger: 'blur' }],
  startDate: [{ required: true, message: '请选择开始日期', trigger: 'change' }],
  endDate: [{ required: true, message: '请选择结束日期', trigger: 'change' }],
}

const activeSprint = computed(() => {
  if (!selectedSprintId.value) return null
  return sprintDetailMap.value[selectedSprintId.value] || null
})
const canManageSprint = computed(() => userStore.hasAnyPermission(['sprint:add', 'sprint:manage', 'sprint:edit']))
const filteredSprints = computed(() => {
  const keyword = sprintKeyword.value.trim().toLowerCase()
  if (!keyword) return sprints.value
  return sprints.value.filter(item => `${item.name} ${item.teamName}`.toLowerCase().includes(keyword))
})
const unscheduledRequirementOptions = computed<LnOption[]>(() => unscheduledRequirements.value.map(item => ({
  label: `${item.reqNo} ${item.title}`,
  value: String(item.id),
  icon: 'business',
})))
const selectedRequirementValue = computed({
  get: () => selectedRequirementId.value ? String(selectedRequirementId.value) : '',
  set: (value: string) => { selectedRequirementId.value = value ? Number(value) : null },
})
const businessLineSelectOptions = computed<LnOption[]>(() => businessLineOptions.value.map(item => ({ label: item.label, value: item.label })))
const sprintStatusOptions: LnOption[] = [{ label: '规划中', value: 'planning' }, { label: '进行中', value: 'in_progress' }, { label: '已发布', value: 'released' }]
const periodDays = computed(() => getDurationDays(formData.startDate, formData.endDate))
const periodLabel = computed(() => {
  if (!periodDays.value) return '请选择起止日期'
  const prefix = formData.cadenceType === 'weekly' || formData.cadenceType === 'biweekly' ? '预设' : '自定义'
  return `${prefix} · ${periodDays.value} 天`
})
const dateRangeError = computed(() => {
  if (!formData.startDate || !formData.endDate) return ''
  return periodDays.value > 0 ? '' : '结束日期不得早于开始日期'
})

function getSprintProgress(sprint?: SprintDetail | null): number {
  if (!sprint?.requirements.length) return 0
  const completed = sprint.requirements.filter(item => ['online', 'accepted', 'closed'].includes(String(item.status).toLowerCase())).length
  return completed / sprint.requirements.length * 100
}

function getStatusTone(status: string): 'neutral' | 'accent' | 'success' | 'warning' | 'danger' {
  if (status === 'in_progress') return 'accent'
  if (status === 'released') return 'success'
  if (status === 'delayed') return 'danger'
  return 'neutral'
}

function getStatusLabel(status: string) {
  const map: Record<string, string> = {
    planning: '规划中',
    in_progress: '进行中',
    delayed: '延期中',
    released: '已发布',
  }
  return map[status] || status
}

function getDurationDays(startDate?: string, endDate?: string) {
  if (!startDate || !endDate) return 0
  const start = new Date(`${startDate}T00:00:00`)
  const end = new Date(`${endDate}T00:00:00`)
  return Math.floor((end.getTime() - start.getTime()) / 86400000) + 1
}

function getCadenceLabel(sprint: Pick<SprintItem, 'cadenceType' | 'startDate' | 'endDate'>) {
  const days = getDurationDays(sprint.startDate, sprint.endDate)
  if (sprint.cadenceType === 'weekly' && days === 7) return '单周 · 7 天'
  if (sprint.cadenceType === 'biweekly' && days === 14) return '双周 · 14 天'
  return `自定义 · ${days} 天`
}

function formatLocalDate(date: Date) {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

function applyCadencePreset(cadenceType: Exclude<SprintCadenceType, 'custom'>) {
  formData.cadenceType = cadenceType
  if (!formData.startDate) {
    lnToast.info('请先选择开始日期')
    return
  }
  const base = new Date(`${formData.startDate}T00:00:00`)
  const days = cadenceType === 'weekly' ? 6 : 13
  base.setDate(base.getDate() + days)
  formData.endDate = formatLocalDate(base)
}

function handleStartDateChange() {
  if (formData.cadenceType === 'weekly' || formData.cadenceType === 'biweekly') {
    applyCadencePreset(formData.cadenceType)
  } else {
    handleManualDateChange()
  }
  syncSprintName()
}

function handleManualDateChange() {
  const days = getDurationDays(formData.startDate, formData.endDate)
  if (days === 7) formData.cadenceType = 'weekly'
  else if (days === 14) formData.cadenceType = 'biweekly'
  else formData.cadenceType = 'custom'
}

function getBusinessLineCode(name: string) {
  const codeMap: Record<string, string> = {
    '校园G端': 'XY',
    '市监G端': 'SJ',
    'B端团餐': 'TC',
    '技术支撑': 'JX',
  }
  return codeMap[name] || 'SP'
}

function getMonthWeekNumber(dateText: string) {
  const date = new Date(dateText)
  const day = date.getDate()
  return Math.ceil(day / 7)
}

function buildSprintName(teamName: string, startDate: string) {
  if (!teamName || !startDate) return ''
  const date = new Date(startDate)
  const yy = `${date.getFullYear()}`.slice(-2)
  const mm = `${date.getMonth() + 1}`.padStart(2, '0')
  const weekNo = `${getMonthWeekNumber(startDate)}`.padStart(2, '0')
  return `${getBusinessLineCode(teamName)}${yy}${mm}_${weekNo}`
}

function syncSprintName() {
  formData.name = buildSprintName(formData.teamName, formData.startDate)
}

function openCreateDialog() {
  Object.assign(formData, {
    name: '',
    teamName: '',
    cadenceType: 'custom',
    startDate: '',
    endDate: '',
    status: 'planning',
    goal: '',
  })
  dialogVisible.value = true
}

async function loadSprintList() {
  const res: any = await listSprints()
  sprints.value = res.data || []
  if (!selectedSprintId.value && sprints.value.length > 0) {
    selectedSprintId.value = sprints.value[0].id
  }
}

async function loadBusinessLineOptions() {
  const res: any = await listDictData('business_line')
  businessLineOptions.value = (res.data || []).map((item: any) => ({
    label: item.label,
    value: item.value,
  }))
}

async function loadSprintDetail(id: number) {
  loading.value = true
  try {
    const res: any = await getSprintDetail(id)
    sprintDetailMap.value[id] = res.data
  } finally {
    loading.value = false
  }
}

async function loadUnscheduledRequirements() {
  const res: any = await pageQueryProductRequirements({
    page: 1,
    size: 200,
    unscheduled: true,
  })
  unscheduledRequirements.value = (res.data?.list || []).map((item: any) => ({
    id: item.id,
    reqNo: item.reqNo,
    title: item.title,
  }))
}

async function selectSprint(id: number) {
  selectedSprintId.value = id
  if (!sprintDetailMap.value[id]) {
    await loadSprintDetail(id)
  }
}

async function submitSprint() {
  const form = formRef.value
  if (!form) return
  const valid = await form.validate().catch(() => false)
  if (!valid) return
  if (dateRangeError.value || periodDays.value < 1) {
    lnToast.error(dateRangeError.value || '请选择合法的迭代日期')
    return
  }
  submitting.value = true
  try {
    await createSprint(formData)
    lnToast.success('迭代创建成功')
    dialogVisible.value = false
    await loadSprintList()
    if (sprints.value.length > 0) {
      await selectSprint(sprints.value[0].id)
    }
  } finally {
    submitting.value = false
  }
}

async function bindRequirement() {
  if (!canManageSprint.value) return
  if (!activeSprint.value || !selectedRequirementId.value) return
  await bindSprintRequirement(activeSprint.value.id, selectedRequirementId.value)
  lnToast.success('已纳入迭代')
  selectedRequirementId.value = null
  await Promise.all([loadSprintDetail(activeSprint.value.id), loadUnscheduledRequirements()])
}

async function removeRequirement(requirementId: number) {
  if (!canManageSprint.value) return
  if (!activeSprint.value) return
  await removeSprintRequirement(activeSprint.value.id, requirementId)
  lnToast.success('已移出迭代')
  await Promise.all([loadSprintDetail(activeSprint.value.id), loadUnscheduledRequirements()])
}

onMounted(async () => {
  await loadBusinessLineOptions()
  await loadSprintList()
  if (selectedSprintId.value) {
    await loadSprintDetail(selectedSprintId.value)
  }
  await loadUnscheduledRequirements()
})
</script>

<style scoped lang="scss">
.sprint-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg);
  gap: 16px;
}

.sidebar-header :deep(.ln-input-wrap) { width: 100%; margin-top: 10px; }
.sidebar-scroll :deep(.ln-sprint-row + .ln-sprint-row) { margin-top: 3px; }

.sprint-detail-skeleton {
  padding: 24px;
  display: grid;
  gap: 14px;
}

.detail-skeleton-grid {
  margin: 8px 0;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 10px;
}

.bind-row :deep(.ln-select__trigger) { width: 360px; }

:deep(.ln-form-item__content > .ln-field),
:deep(.ln-form-item__content > .ln-textarea-field),
:deep(.ln-form-item__content > .ln-date-field),
:deep(.ln-form-item__content > .ln-select-field),
:deep(.ln-form-item__content > .ln-select-field .ln-popover-root),
:deep(.ln-form-item__content > .ln-select-field .ln-popover-trigger),
:deep(.ln-form-item__content > .ln-select-field .ln-select__trigger) { width: 100%; }

.toolbar-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 18px;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.page-subtitle {
  margin-top: 6px;
}

.sprint-layout {
  flex: 1;
  grid-template-columns: 320px 1fr;
  min-height: 0;
}

.cadence-presets {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
}

.duration-badge {
  margin-left: auto;
  min-height: 26px;
  padding: 0 9px;
  display: inline-flex;
  align-items: center;
  border: 1px solid var(--ln-border);
  border-radius: 999px;
  background: var(--ln-accent-soft);
  color: var(--ln-accent);
  font-size: 11px;
  white-space: nowrap;
}

.date-range-error {
  margin: -6px 0 2px 100px;
  color: var(--ln-danger);
  font-size: 11px;
}

.sprint-sidebar {
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar-header {
  padding: 16px 18px 14px;
  border-bottom: 1px solid var(--border);
}

.sidebar-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-primary);
}

.sidebar-copy {
  margin-top: 6px;
  font-size: 12px;
  line-height: 1.6;
  color: var(--text-secondary);
}

.sidebar-scroll {
  flex: 1;
  overflow: auto;
  padding: 10px 12px 12px;
}

.sprint-card {
  border: 1px solid rgba(17, 24, 39, 0.05);
  border-radius: 14px;
  padding: 12px 13px;
  cursor: pointer;
  margin-bottom: 10px;
  transition: 0.18s ease;
  background: rgba(255, 255, 255, 0.78);
}

.sprint-card.active {
  border-color: rgba(59, 130, 246, 0.3);
  box-shadow: inset 2px 0 0 rgba(59, 130, 246, 0.78);
  background: linear-gradient(180deg, rgba(59, 130, 246, 0.05) 0%, rgba(255, 255, 255, 0.98) 100%);
}

.sprint-topline {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  flex-wrap: wrap;
}

.sprint-name {
  font-weight: 700;
  line-height: 1.38;
}

.sprint-date {
  margin-top: 5px;
  color: var(--text-secondary);
  font-size: 11px;
}

.sprint-meta {
  display: flex;
  gap: 8px;
  margin-top: 9px;
  align-items: center;
  flex-wrap: wrap;
}

.sprint-meta-count {
  font-size: 11px;
  color: var(--text-tertiary);
}

.tag.type-tag {
  display: inline-flex;
  align-items: center;
  min-height: 18px;
  padding: 0 7px;
  border-radius: 999px;
  border: 1px solid rgba(17, 24, 39, 0.08);
  background: rgba(255, 255, 255, 0.88);
  color: var(--text-secondary);
  font-size: 11px;
  font-weight: 700;
}

.sprint-detail {
  min-height: 0;
  overflow: auto;
  padding: 18px;
}

.detail-header {
  position: sticky;
  top: -18px;
  z-index: 2;
  margin: -18px -18px 0;
  padding: 18px 18px 16px;
  border-bottom: 1px solid var(--border);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.97) 0%, rgba(255, 255, 255, 0.93) 100%);
  backdrop-filter: blur(14px);
}

.detail-title {
  font-size: 22px;
  font-weight: 700;
}

.detail-subtitle {
  margin-top: 6px;
  color: var(--text-secondary);
}

.detail-meta-line {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  font-size: 11px;
  color: var(--text-secondary);
}

.detail-meta-item {
  white-space: nowrap;
}

.detail-meta-sep {
  color: rgba(148, 163, 184, 0.82);
}

.detail-facts {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin: 18px 0 2px;
}

.fact-wide {
  grid-column: span 3;
}

.table-section,
.bind-panel {
  margin-top: 16px;
}

.range-list {
  border: 1px solid rgba(17, 24, 39, 0.05);
  border-radius: 14px;
  overflow: hidden;
  background: linear-gradient(180deg, rgba(17, 24, 39, 0.015) 0%, rgba(255, 255, 255, 0.98) 100%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);
}

.range-grid {
  display: grid;
  grid-template-columns: minmax(0, 2.8fr) 86px 104px 96px 80px;
  column-gap: 10px;
  align-items: center;
}

.range-header {
  min-height: 40px;
  padding: 0 16px;
  border-bottom: 1px solid rgba(17, 24, 39, 0.06);
  background: rgba(248, 250, 252, 0.88);
}

.head-cell {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-tertiary);
  white-space: nowrap;
}

.action-head {
  text-align: center;
}

.range-row {
  padding: 10px 16px;
  border-bottom: 1px solid rgba(17, 24, 39, 0.05);
  transition: 0.16s ease;

  &:hover {
    background: rgba(17, 24, 39, 0.022);

    .row-actions {
      opacity: 1;
      transform: translateX(0);
      pointer-events: auto;
    }
  }
}

.range-main {
  min-width: 0;
}

.range-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 18px;
  flex-wrap: wrap;
}

.range-prefix {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.req-no {
  font-size: 11px;
  line-height: 1;
  color: #7b8595;
  letter-spacing: 0.015em;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.meta-text {
  display: inline-flex;
  align-items: center;
  min-height: 16px;
  padding: 0 6px;
  border-radius: 999px;
  background: rgba(17, 24, 39, 0.04);
  font-size: 11px;
  font-weight: 700;
  color: var(--text-secondary);
  white-space: nowrap;
}

.range-title {
  margin-top: 6px;
  font-size: 13.5px;
  line-height: 1.46;
  font-weight: 650;
  color: var(--text-primary);
}

.cell {
  min-width: 0;
  font-size: 12px;
  line-height: 1.45;
}

.priority-pill,
.status-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 22px;
  padding: 0 9px;
  border-radius: 999px;
  border: 1px solid rgba(17, 24, 39, 0.08);
  background: rgba(255, 255, 255, 0.88);
  font-size: 11px;
  font-weight: 600;
  color: var(--text-primary);
}

.assignee-cell {
  color: var(--text-secondary);
  white-space: nowrap;
}

.row-actions {
  display: flex;
  justify-content: center;
  opacity: 0;
  transform: translateX(2px);
  pointer-events: none;
  transition: opacity 0.16s ease, transform 0.16s ease;
}

.range-empty {
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  font-size: 13px;
}

.bind-row {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 12px 14px;
  border: 1px solid rgba(17, 24, 39, 0.05);
  border-radius: 14px;
  background: linear-gradient(180deg, rgba(17, 24, 39, 0.015) 0%, rgba(255, 255, 255, 0.98) 100%);
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

@media (max-width: 960px) {
  .sprint-layout {
    grid-template-columns: 1fr;
  }

  .detail-facts {
    grid-template-columns: 1fr 1fr;
  }

  .fact-wide {
    grid-column: span 2;
  }

  .bind-row,
  .form-row {
    display: grid;
    grid-template-columns: 1fr;
  }

  .range-grid {
    grid-template-columns: 1fr;
    row-gap: 8px;
  }

  .range-header {
    display: none;
  }

  .row-actions {
    justify-content: flex-start;
    opacity: 1;
    transform: none;
    pointer-events: auto;
  }

  .fact-wide {
    grid-column: span 1;
  }
}
</style>

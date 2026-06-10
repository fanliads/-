<template>
  <div class="sprint-view">
    <div class="toolbar-header">
      <div>
        <div class="page-title">迭代管理</div>
        <div class="page-subtitle">使用真实 sprint 数据管理业务线迭代与需求排期</div>
      </div>
      <button v-if="canManageSprint" class="btn btn-primary" @click="openCreateDialog">+ 新建迭代</button>
    </div>

    <div class="sprint-layout">
      <div class="sprint-sidebar">
        <div
          v-for="item in sprints"
          :key="item.id"
          class="sprint-card"
          :class="{ active: selectedSprintId === item.id }"
          @click="selectSprint(item.id)"
        >
          <div class="sprint-name">{{ item.name }}</div>
          <div class="sprint-date">{{ item.teamName }} · {{ item.startDate }} ~ {{ item.endDate }}</div>
          <div class="sprint-meta">
            <span class="tag type-tag">{{ item.cadenceType === 'weekly' ? '周迭代' : '双周迭代' }}</span>
            <span class="status-tag" :class="getStatusClass(item.status)">{{ getStatusLabel(item.status) }}</span>
          </div>
        </div>
      </div>

      <div class="sprint-detail" v-loading="loading">
        <template v-if="activeSprint">
          <div class="detail-header">
            <div>
              <div class="detail-title">{{ activeSprint.name }}</div>
              <div class="detail-subtitle">{{ activeSprint.teamName }} · {{ activeSprint.startDate }} ~ {{ activeSprint.endDate }}</div>
            </div>
          </div>

          <div class="top-grid">
            <div class="top-card">
              <div class="k">迭代目标</div>
              <div class="v">{{ activeSprint.goal || '-' }}</div>
            </div>
            <div class="top-card">
              <div class="k">迭代周期</div>
              <div class="v">{{ activeSprint.cadenceType === 'weekly' ? '周迭代' : '双周迭代' }}</div>
            </div>
            <div class="top-card">
              <div class="k">迭代状态</div>
              <div class="v">{{ getStatusLabel(activeSprint.status) }}</div>
            </div>
            <div class="top-card">
              <div class="k">需求数量</div>
              <div class="v">{{ activeSprint.requirements.length }}</div>
            </div>
          </div>

          <div class="table-wrap">
            <el-table :data="activeSprint.requirements" style="width: 100%">
              <el-table-column prop="reqNo" label="需求编号" width="160" />
              <el-table-column prop="title" label="标题" min-width="220" />
              <el-table-column prop="priority" label="优先级" width="100" />
              <el-table-column prop="statusName" label="状态" width="140" />
              <el-table-column prop="productModule" label="模块" width="140" />
              <el-table-column prop="assigneeName" label="处理人" width="120" />
              <el-table-column v-if="canManageSprint" label="操作" width="100" fixed="right">
                <template #default="{ row }">
                  <el-button link type="danger" size="small" @click="removeRequirement(row.id)">移出</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <div v-if="canManageSprint" class="bind-panel">
            <el-select v-model="selectedRequirementId" placeholder="选择要纳入迭代的产品需求" clearable style="width: 360px">
              <el-option
                v-for="item in unscheduledRequirements"
                :key="item.id"
                :label="`${item.reqNo} ${item.title}`"
                :value="item.id"
              />
            </el-select>
            <button class="btn btn-primary" :disabled="!selectedRequirementId" @click="bindRequirement">纳入迭代</button>
          </div>
        </template>
        <el-empty v-else description="暂无迭代数据" />
      </div>
    </div>

    <el-dialog v-model="dialogVisible" title="新建迭代" width="560px" destroy-on-close>
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
        <el-form-item label="业务线" prop="teamName">
          <el-select v-model="formData.teamName" placeholder="选择业务线" @change="syncSprintName">
            <el-option
              v-for="item in businessLineOptions"
              :key="item.value"
              :label="item.label"
              :value="item.label"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="迭代名称" prop="name">
          <el-input v-model="formData.name" placeholder="系统自动生成，支持修改" />
        </el-form-item>
        <div class="form-row">
          <el-form-item label="周期类型" prop="cadenceType">
            <el-select v-model="formData.cadenceType" @change="syncDerivedFields">
              <el-option label="周迭代" value="weekly" />
              <el-option label="双周迭代" value="biweekly" />
            </el-select>
          </el-form-item>
          <el-form-item label="迭代状态" prop="status">
            <el-select v-model="formData.status">
              <el-option label="规划中" value="planning" />
              <el-option label="进行中" value="in_progress" />
              <el-option label="已发布" value="released" />
            </el-select>
          </el-form-item>
        </div>
        <div class="form-row">
          <el-form-item label="开始日期" prop="startDate">
            <el-date-picker v-model="formData.startDate" type="date" value-format="YYYY-MM-DD" @change="syncDerivedFields" />
          </el-form-item>
          <el-form-item label="结束日期" prop="endDate">
            <el-date-picker v-model="formData.endDate" type="date" value-format="YYYY-MM-DD" />
          </el-form-item>
        </div>
        <el-form-item label="迭代目标" prop="goal">
          <el-input v-model="formData.goal" type="textarea" :rows="3" placeholder="输入本次迭代目标" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitSprint">创建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
  bindSprintRequirement,
  createSprint,
  getSprintDetail,
  listSprints,
  removeSprintRequirement,
  type SprintDetail,
  type SprintItem,
  type SprintPayload,
} from '@/api/sprint'
import { pageQueryProductRequirements } from '@/api/product-requirement'
import { listDictData } from '@/api/dict'
import { useUserStore } from '@/store/user'

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
const formRef = ref<FormInstance>()

const formData = reactive<SprintPayload>({
  name: '',
  teamName: '',
  cadenceType: 'weekly',
  startDate: '',
  endDate: '',
  status: 'planning',
  goal: '',
})

const rules: FormRules = {
  name: [{ required: true, message: '请输入迭代名称', trigger: 'blur' }],
  teamName: [{ required: true, message: '请输入团队名称', trigger: 'blur' }],
  cadenceType: [{ required: true, message: '请选择周期类型', trigger: 'change' }],
  startDate: [{ required: true, message: '请选择开始日期', trigger: 'change' }],
  endDate: [{ required: true, message: '请选择结束日期', trigger: 'change' }],
}

const activeSprint = computed(() => {
  if (!selectedSprintId.value) return null
  return sprintDetailMap.value[selectedSprintId.value] || null
})
const canManageSprint = computed(() => userStore.hasAnyPermission(['sprint:add', 'sprint:manage', 'sprint:edit']))

function getStatusLabel(status: string) {
  const map: Record<string, string> = {
    planning: '规划中',
    in_progress: '进行中',
    delayed: '延期中',
    released: '已发布',
  }
  return map[status] || status
}

function getStatusClass(status: string) {
  if (status === 'planning') return 'status-planning'
  if (status === 'in_progress') return 'status-active'
  if (status === 'released') return 'status-done'
  return 'status-planning'
}

function syncEndDate() {
  if (!formData.startDate) return
  const base = new Date(formData.startDate)
  const days = formData.cadenceType === 'weekly' ? 6 : 13
  base.setDate(base.getDate() + days)
  const year = base.getFullYear()
  const month = `${base.getMonth() + 1}`.padStart(2, '0')
  const day = `${base.getDate()}`.padStart(2, '0')
  formData.endDate = `${year}-${month}-${day}`
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

function syncDerivedFields() {
  syncEndDate()
  syncSprintName()
}

function openCreateDialog() {
  Object.assign(formData, {
    name: '',
    teamName: '',
    cadenceType: 'weekly',
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
  await form.validate()
  submitting.value = true
  try {
    await createSprint(formData)
    ElMessage.success('迭代创建成功')
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
  ElMessage.success('已纳入迭代')
  selectedRequirementId.value = null
  await Promise.all([loadSprintDetail(activeSprint.value.id), loadUnscheduledRequirements()])
}

async function removeRequirement(requirementId: number) {
  if (!canManageSprint.value) return
  if (!activeSprint.value) return
  await removeSprintRequirement(activeSprint.value.id, requirementId)
  ElMessage.success('已移出迭代')
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
}

.toolbar-header {
  height: 72px;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
}

.page-title {
  font-size: 20px;
  font-weight: 700;
}

.page-subtitle {
  margin-top: 4px;
  color: var(--text-secondary);
  font-size: 13px;
}

.sprint-layout {
  flex: 1;
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 16px;
  padding: 16px;
  min-height: 0;
}

.sprint-sidebar {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 12px;
  overflow: auto;
}

.sprint-card {
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 14px;
  cursor: pointer;
  margin-bottom: 12px;
  transition: 0.2s ease;
}

.sprint-card.active {
  border-color: var(--primary);
  box-shadow: 0 0 0 1px rgba(33, 107, 255, 0.12);
}

.sprint-name {
  font-weight: 700;
}

.sprint-date {
  margin-top: 6px;
  color: var(--text-secondary);
  font-size: 13px;
}

.sprint-meta {
  display: flex;
  gap: 8px;
  margin-top: 10px;
  align-items: center;
}

.sprint-detail {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 20px;
  overflow: auto;
}

.detail-title {
  font-size: 22px;
  font-weight: 700;
}

.detail-subtitle {
  margin-top: 6px;
  color: var(--text-secondary);
}

.top-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin: 20px 0;
}

.top-card {
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 14px;
  background: #fafbff;
}

.top-card .k {
  font-size: 12px;
  color: var(--text-secondary);
}

.top-card .v {
  margin-top: 8px;
  font-size: 16px;
  font-weight: 700;
}

.bind-panel {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.table-wrap {
  border: 1px solid var(--border);
  border-radius: 14px;
  overflow: hidden;
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

  .top-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .bind-panel,
  .form-row {
    display: grid;
    grid-template-columns: 1fr;
  }
}
</style>

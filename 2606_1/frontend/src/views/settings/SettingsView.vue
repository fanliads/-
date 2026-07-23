<template>
  <div v-if="!isCurrentStageOpen" class="disabled-page">
    <div class="disabled-card">
      <div class="disabled-badge wb-meta-pill">暂未开放</div>
      <h2 class="disabled-title">系统设置已从当前阶段正式入口移出</h2>
      <p class="disabled-desc">
        当前阶段先收敛到需求处理主链路，这里的配置能力暂不对正式用户开放，避免把原型态管理页误当成可用后台。
      </p>
      <div class="disabled-points">
        <div class="disabled-point">
          <span>当前策略</span>
          <strong>先把一线工作台体验做深做稳</strong>
        </div>
        <div class="disabled-point">
          <span>设置类能力</span>
          <strong>保留内部原型，不作为阶段性正式入口</strong>
        </div>
      </div>
      <div class="disabled-actions">
        <LnButton @click="router.push('/raw-pool')">前往原始需求池</LnButton>
        <LnButton variant="ghost" @click="router.push('/my-tasks')">前往我的工作</LnButton>
      </div>
    </div>
  </div>

  <div v-else class="settings-view">
    <!-- 顶部 Tab 切换 -->
    <div class="settings-header">
      <LnTabs v-model="activeTab" :options="tabs" aria-label="系统设置分类" />
    </div>

    <!-- Tab 内容区 -->
    <div class="settings-content">
      <!-- Tab 1: 状态流配置 -->
      <div v-if="activeTab === 'workflow'" class="tab-panel">
        <div class="panel-header">
          <LnTabs v-model="workflowSubTab" :options="workflowTabs" variant="segmented" aria-label="需求流转类型" />
          <LnButton @click="openWorkflowDialog()"><template #icon><LnIcon name="plus"/></template>新增流转</LnButton>
        </div>
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>源状态</th>
                <th>目标状态</th>
                <th>允许角色</th>
                <th>操作名称</th>
                <th>是否需审批</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in currentWorkflowData" :key="row.id">
                <td><span class="status-tag status-blue">{{ row.fromStatus }}</span></td>
                <td><span class="status-tag status-green">{{ row.toStatus }}</span></td>
                <td>
                  <span v-for="role in row.roles" :key="role" class="tag role-tag">{{ role }}</span>
                </td>
                <td>{{ row.actionName }}</td>
                <td>
                  <span :class="row.needApproval ? 'status-tag status-orange' : 'status-tag status-gray'">
                    {{ row.needApproval ? '是' : '否' }}
                  </span>
                </td>
                <td>
                  <LnButton size="small" variant="ghost" @click="openWorkflowDialog(row)">编辑</LnButton>
                  <LnButton size="small" variant="danger" @click="deleteWorkflow(row)">删除</LnButton>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tab 2: 业务线管理 -->
      <div v-if="activeTab === 'business'" class="tab-panel">
        <div class="panel-header">
          <h3 class="panel-title">业务线列表</h3>
          <LnButton @click="openBusinessDialog()"><template #icon><LnIcon name="plus"/></template>新增业务线</LnButton>
        </div>
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>名称</th>
                <th>编码</th>
                <th>描述</th>
                <th>负责人</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in businessData" :key="item.id">
                <td class="font-medium">{{ item.name }}</td>
                <td><code class="code-tag">{{ item.code }}</code></td>
                <td>{{ item.description }}</td>
                <td>{{ item.owner }}</td>
                <td>
                  <LnButton size="small" variant="ghost" @click="openBusinessDialog(item)">编辑</LnButton>
                  <LnButton size="small" variant="danger" @click="deleteBusiness(item)">删除</LnButton>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tab 3: 标签管理 -->
      <div v-if="activeTab === 'tags'" class="tab-panel">
        <div class="panel-header">
          <h3 class="panel-title">标签列表</h3>
          <LnButton @click="openTagDialog()"><template #icon><LnIcon name="plus"/></template>新增标签</LnButton>
        </div>
        <div class="tag-grid">
          <div v-for="tag in tagData" :key="tag.id" class="tag-card">
            <span class="tag-dot" :style="{ background: tag.color }"></span>
            <span class="tag-name">{{ tag.name }}</span>
            <LnButton class="tag-delete" size="small" icon-only variant="ghost" aria-label="删除标签" @click="deleteTag(tag)"><template #icon><LnIcon name="close"/></template></LnButton>
          </div>
        </div>
      </div>

      <!-- Tab 4: 用户管理 -->
      <div v-if="activeTab === 'users'" class="tab-panel">
        <div class="panel-header">
          <h3 class="panel-title">用户列表</h3>
          <LnButton @click="openUserDialog()"><template #icon><LnIcon name="plus"/></template>新增用户</LnButton>
        </div>
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>用户名</th>
                <th>姓名</th>
                <th>角色</th>
                <th>部门</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in userData" :key="user.id">
                <td class="font-medium">{{ user.username }}</td>
                <td>{{ user.realName }}</td>
                <td><span class="tag role-tag">{{ user.roleName }}</span></td>
                <td>{{ user.department }}</td>
                <td>
                  <span :class="user.active ? 'status-tag status-green' : 'status-tag status-gray'">
                    {{ user.active ? '启用' : '禁用' }}
                  </span>
                </td>
                <td>
                  <LnButton size="small" variant="ghost" @click="openUserDialog(user)">编辑</LnButton>
                  <LnButton size="small" :variant="user.active ? 'danger' : 'secondary'" @click="toggleUserStatus(user)">
                    {{ user.active ? '禁用' : '启用' }}
                  </LnButton>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- 状态流配置弹窗 -->
    <LnDialog
      v-model="workflowDialogVisible"
      :title="workflowForm.id ? '编辑流转规则' : '新增流转规则'"
      width="520px"
      :close-on-backdrop="false"
    >
      <div class="dialog-form">
        <div class="form-item">
          <label class="form-label">源状态</label>
          <LnInput v-model="workflowForm.fromStatus" placeholder="如：待判定" clearable />
        </div>
        <div class="form-item">
          <label class="form-label">目标状态</label>
          <LnInput v-model="workflowForm.toStatus" placeholder="如：设计中" clearable />
        </div>
        <div class="form-item">
          <label class="form-label">允许角色</label>
          <LnInput v-model="workflowForm.rolesStr" placeholder="如：产品经理,开发组长（逗号分隔）" clearable />
        </div>
        <div class="form-item">
          <label class="form-label">操作名称</label>
          <LnInput v-model="workflowForm.actionName" placeholder="如：确认推进" clearable />
        </div>
        <div class="form-item">
          <label class="form-label">是否需审批</label>
          <LnSwitch v-model="workflowForm.needApproval" :label="workflowForm.needApproval ? '需要审批' : '无需审批'" />
        </div>
      </div>
      <template #footer>
        <LnButton variant="ghost" @click="workflowDialogVisible = false">取消</LnButton>
        <LnButton variant="primary" @click="saveWorkflow">保存</LnButton>
      </template>
    </LnDialog>

    <!-- 业务线弹窗 -->
    <LnDialog
      v-model="businessDialogVisible"
      :title="businessForm.id ? '编辑业务线' : '新增业务线'"
      width="520px"
      :close-on-backdrop="false"
    >
      <div class="dialog-form">
        <div class="form-item">
          <label class="form-label">名称</label>
          <LnInput v-model="businessForm.name" placeholder="如：核心交易" clearable />
        </div>
        <div class="form-item">
          <label class="form-label">编码</label>
          <LnInput v-model="businessForm.code" placeholder="如：CORE_TRADE" clearable />
        </div>
        <div class="form-item">
          <label class="form-label">描述</label>
          <LnTextarea v-model="businessForm.description" placeholder="业务线描述" :rows="3" />
        </div>
        <div class="form-item">
          <label class="form-label">负责人</label>
          <LnInput v-model="businessForm.owner" placeholder="负责人姓名" clearable />
        </div>
      </div>
      <template #footer>
        <LnButton variant="ghost" @click="businessDialogVisible = false">取消</LnButton>
        <LnButton variant="primary" @click="saveBusiness">保存</LnButton>
      </template>
    </LnDialog>

    <!-- 标签弹窗 -->
    <LnDialog
      v-model="tagDialogVisible"
      title="新增标签"
      width="420px"
      :close-on-backdrop="false"
    >
      <div class="dialog-form">
        <div class="form-item">
          <label class="form-label">标签名称</label>
          <LnInput v-model="tagForm.name" placeholder="如：紧急" clearable />
        </div>
        <div class="form-item">
          <label class="form-label">标签颜色</label>
          <LnColorPicker v-model="tagForm.color" :colors="colorOptions" aria-label="标签颜色" show-value />
        </div>
      </div>
      <template #footer>
        <LnButton variant="ghost" @click="tagDialogVisible = false">取消</LnButton>
        <LnButton variant="primary" @click="saveTag">保存</LnButton>
      </template>
    </LnDialog>

    <!-- 用户弹窗 -->
    <LnDialog
      v-model="userDialogVisible"
      :title="userForm.id ? '编辑用户' : '新增用户'"
      width="520px"
      :close-on-backdrop="false"
    >
      <div class="dialog-form">
        <div class="form-item">
          <label class="form-label">用户名</label>
          <LnInput v-model="userForm.username" placeholder="登录用户名" autocomplete="username" clearable />
        </div>
        <div class="form-item">
          <label class="form-label">姓名</label>
          <LnInput v-model="userForm.realName" placeholder="真实姓名" clearable />
        </div>
        <div class="form-item">
          <label class="form-label">角色</label>
          <LnSelect v-model="userForm.roleName" :options="roleOptions" placeholder="请选择角色" searchable clearable />
        </div>
        <div class="form-item">
          <label class="form-label">部门</label>
          <LnInput v-model="userForm.department" placeholder="所属部门" clearable />
        </div>
        <div v-if="!userForm.id" class="form-item">
          <label class="form-label">初始密码</label>
          <LnPasswordInput v-model="userForm.password" placeholder="初始登录密码" autocomplete="new-password" />
        </div>
      </div>
      <template #footer>
        <LnButton variant="ghost" @click="userDialogVisible = false">取消</LnButton>
        <LnButton variant="primary" @click="saveUser">保存</LnButton>
      </template>
    </LnDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { lnToast, LnButton, LnColorPicker, LnDialog, LnIcon, LnInput, LnPasswordInput, LnSelect, LnSwitch, LnTabs, LnTextarea, type LnOption, type LnTabOption } from '@/components/linear'
import { getFlowConfig } from '@/api/workflow'
import type { FlowConfigNode } from '@/api/workflow'

const router = useRouter()
const isCurrentStageOpen = false

// ==================== Tab 配置 ====================
const tabs: LnTabOption[] = [
  { value: 'workflow', label: '状态流配置' },
  { value: 'business', label: '业务线管理' },
  { value: 'tags', label: '标签管理' },
  { value: 'users', label: '用户管理' },
]
const activeTab = ref('workflow')
const roleOptions: LnOption[] = ['管理员', '产品经理', '开发组长', '开发人员', '测试人员'].map((label) => ({ label, value: label }))

// ==================== Tab 1: 状态流配置 ====================
const workflowSubTab = ref<'raw' | 'product'>('raw')
const workflowTabs: LnTabOption[] = [
  { value: 'raw', label: '原始需求流转' },
  { value: 'product', label: '产品需求流转' },
]

interface WorkflowRow {
  id: number
  fromStatus: string
  toStatus: string
  roles: string[]
  actionName: string
  needApproval: boolean
}

const rawWorkflowData = ref<WorkflowRow[]>([
  { id: 1, fromStatus: '待判定', toStatus: '待拆分', roles: ['产品经理', '产品总监'], actionName: '确认推进', needApproval: false },
  { id: 2, fromStatus: '待判定', toStatus: '已拒绝', roles: ['产品经理'], actionName: '拒绝', needApproval: true },
  { id: 3, fromStatus: '待判定', toStatus: '已挂起', roles: ['产品经理'], actionName: '挂起', needApproval: true },
  { id: 4, fromStatus: '待拆分', toStatus: '开发中', roles: ['产品经理', '产品总监', '产品组长'], actionName: '进入开发', needApproval: false },
  { id: 5, fromStatus: '开发中', toStatus: '已上线', roles: ['产品经理', '产品负责人'], actionName: '标记上线', needApproval: false },
])

const productWorkflowData = ref<WorkflowRow[]>([
  { id: 101, fromStatus: '待设计', toStatus: '设计中', roles: ['产品经理'], actionName: '开始设计', needApproval: false },
  { id: 102, fromStatus: '设计中', toStatus: '待开发', roles: ['产品经理', '开发组长'], actionName: '设计完成', needApproval: true },
  { id: 103, fromStatus: '待开发', toStatus: '开发中', roles: ['开发组长'], actionName: '开始开发', needApproval: false },
  { id: 104, fromStatus: '开发中', toStatus: '待测试', roles: ['开发组长'], actionName: '开发完成', needApproval: false },
  { id: 105, fromStatus: '待测试', toStatus: '已上线', roles: ['测试人员', '产品经理'], actionName: '测试通过', needApproval: true },
])

const currentWorkflowData = computed(() =>
  workflowSubTab.value === 'raw' ? rawWorkflowData.value : productWorkflowData.value
)

const workflowDialogVisible = ref(false)
const workflowForm = ref<{
  id: number | null
  fromStatus: string
  toStatus: string
  rolesStr: string
  actionName: string
  needApproval: boolean
}>({
  id: null,
  fromStatus: '',
  toStatus: '',
  rolesStr: '',
  actionName: '',
  needApproval: false,
})

function openWorkflowDialog(row?: WorkflowRow) {
  if (row) {
    workflowForm.value = {
      id: row.id,
      fromStatus: row.fromStatus,
      toStatus: row.toStatus,
      rolesStr: row.roles.join(', '),
      actionName: row.actionName,
      needApproval: row.needApproval,
    }
  } else {
    workflowForm.value = { id: null, fromStatus: '', toStatus: '', rolesStr: '', actionName: '', needApproval: false }
  }
  workflowDialogVisible.value = true
}

function saveWorkflow() {
  const form = workflowForm.value
  if (!form.fromStatus || !form.toStatus || !form.actionName) {
    lnToast.warning('请填写必填字段')
    return
  }
  const roles = form.rolesStr.split(/[,，]/).map(s => s.trim()).filter(Boolean)
  const newRow: WorkflowRow = {
    id: form.id ?? Date.now(),
    fromStatus: form.fromStatus,
    toStatus: form.toStatus,
    roles,
    actionName: form.actionName,
    needApproval: form.needApproval,
  }
  const targetData = workflowSubTab.value === 'raw' ? rawWorkflowData : productWorkflowData
  if (form.id) {
    const idx = targetData.value.findIndex(r => r.id === form.id)
    if (idx !== -1) targetData.value[idx] = newRow
  } else {
    targetData.value.push(newRow)
  }
  workflowDialogVisible.value = false
  lnToast.success('保存成功')
}

function deleteWorkflow(row: WorkflowRow) {
  const targetData = workflowSubTab.value === 'raw' ? rawWorkflowData : productWorkflowData
  const idx = targetData.value.findIndex(r => r.id === row.id)
  if (idx !== -1) {
    targetData.value.splice(idx, 1)
    lnToast.success('删除成功')
  }
}

// 尝试加载后端流转配置（可选，不影响模拟数据展示）
async function loadFlowConfig() {
  try {
    const res: any = await getFlowConfig(workflowSubTab.value === 'raw' ? 'raw' : 'product')
    if (res.data && Array.isArray(res.data)) {
      // 如果后端有数据，转换为表格行
      const rows: WorkflowRow[] = []
      let idCounter = 1
      for (const node of res.data as FlowConfigNode[]) {
        for (const action of node.actions) {
          rows.push({
            id: idCounter++,
            fromStatus: node.statusName,
            toStatus: action.toStatus,
            roles: action.roles,
            actionName: action.actionName,
            needApproval: action.needApproval,
          })
        }
      }
      if (rows.length > 0) {
        if (workflowSubTab.value === 'raw') {
          rawWorkflowData.value = rows
        } else {
          productWorkflowData.value = rows
        }
      }
    }
  } catch {
    // 后端不可用时使用模拟数据
  }
}

// ==================== Tab 2: 业务线管理 ====================
interface BusinessLine {
  id: number
  name: string
  code: string
  description: string
  owner: string
}

const businessData = ref<BusinessLine[]>([
  { id: 1, name: '核心交易', code: 'CORE_TRADE', description: '核心交易相关业务需求', owner: '张伟' },
  { id: 2, name: '用户增长', code: 'USER_GROWTH', description: '用户拉新、留存与增长', owner: '李娜' },
  { id: 3, name: '数据平台', code: 'DATA_PLATFORM', description: '数据分析与平台建设', owner: '王强' },
  { id: 4, name: '基础服务', code: 'INFRA_SERVICE', description: '基础设施与公共服务', owner: '赵敏' },
])

const businessDialogVisible = ref(false)
const businessForm = ref<{ id: number | null; name: string; code: string; description: string; owner: string }>({
  id: null, name: '', code: '', description: '', owner: '',
})

function openBusinessDialog(item?: BusinessLine) {
  if (item) {
    businessForm.value = { ...item }
  } else {
    businessForm.value = { id: null, name: '', code: '', description: '', owner: '' }
  }
  businessDialogVisible.value = true
}

function saveBusiness() {
  const form = businessForm.value
  if (!form.name || !form.code) {
    lnToast.warning('请填写必填字段')
    return
  }
  if (form.id) {
    const idx = businessData.value.findIndex(b => b.id === form.id)
    if (idx !== -1) businessData.value[idx] = { ...form } as BusinessLine
  } else {
    businessData.value.push({ ...form, id: Date.now() } as BusinessLine)
  }
  businessDialogVisible.value = false
  lnToast.success('保存成功')
}

function deleteBusiness(item: BusinessLine) {
  const idx = businessData.value.findIndex(b => b.id === item.id)
  if (idx !== -1) {
    businessData.value.splice(idx, 1)
    lnToast.success('删除成功')
  }
}

// ==================== Tab 3: 标签管理 ====================
interface TagItem {
  id: number
  name: string
  color: string
}

const tagData = ref<TagItem[]>([
  { id: 1, name: '紧急', color: '#ff3b30' },
  { id: 2, name: '高优', color: '#ff9500' },
  { id: 3, name: '体验优化', color: '#0071e3' },
  { id: 4, name: '技术债务', color: '#8e8e93' },
  { id: 5, name: '安全合规', color: '#34c759' },
  { id: 6, name: '性能优化', color: '#5856d6' },
  { id: 7, name: '兼容性', color: '#af52de' },
  { id: 8, name: '运营需求', color: '#ff2d55' },
])

const colorOptions = [
  '#ff3b30', '#ff9500', '#ffcc00', '#34c759',
  '#0071e3', '#5856d6', '#af52de', '#ff2d55',
  '#8e8e93', '#00c7be',
]

const tagDialogVisible = ref(false)
const tagForm = ref({ name: '', color: '#0071e3' })

function openTagDialog() {
  tagForm.value = { name: '', color: '#0071e3' }
  tagDialogVisible.value = true
}

function saveTag() {
  if (!tagForm.value.name) {
    lnToast.warning('请填写标签名称')
    return
  }
  tagData.value.push({ id: Date.now(), ...tagForm.value })
  tagDialogVisible.value = false
  lnToast.success('保存成功')
}

function deleteTag(tag: TagItem) {
  const idx = tagData.value.findIndex(t => t.id === tag.id)
  if (idx !== -1) {
    tagData.value.splice(idx, 1)
    lnToast.success('删除成功')
  }
}

// ==================== Tab 4: 用户管理 ====================
interface UserRow {
  id: number
  username: string
  realName: string
  roleName: string
  department: string
  active: boolean
  password?: string
}

const userData = ref<UserRow[]>([
  { id: 1, username: 'zhangwei', realName: '张伟', roleName: '产品经理', department: '产品部', active: true },
  { id: 2, username: 'lina', realName: '李娜', roleName: '产品经理', department: '产品部', active: true },
  { id: 3, username: 'wangqiang', realName: '王强', roleName: '开发组长', department: '研发部', active: true },
  { id: 4, username: 'zhaomin', realName: '赵敏', roleName: '开发人员', department: '研发部', active: true },
  { id: 5, username: 'chenliu', realName: '陈六', roleName: '测试人员', department: '测试部', active: false },
])

const userDialogVisible = ref(false)
const userForm = ref<{ id: number | null; username: string; realName: string; roleName: string; department: string; active: boolean; password: string }>({
  id: null, username: '', realName: '', roleName: '', department: '', active: true, password: '',
})

function openUserDialog(user?: UserRow) {
  if (user) {
    userForm.value = { ...user, password: '' }
  } else {
    userForm.value = { id: null, username: '', realName: '', roleName: '', department: '', active: true, password: '' }
  }
  userDialogVisible.value = true
}

function saveUser() {
  const form = userForm.value
  if (!form.username || !form.realName || !form.roleName) {
    lnToast.warning('请填写必填字段')
    return
  }
  if (form.id) {
    const idx = userData.value.findIndex(u => u.id === form.id)
    if (idx !== -1) userData.value[idx] = { ...form } as UserRow
  } else {
    userData.value.push({ ...form, id: Date.now() } as UserRow)
  }
  userDialogVisible.value = false
  lnToast.success('保存成功')
}

function toggleUserStatus(user: UserRow) {
  user.active = !user.active
  lnToast.success(user.active ? '已启用' : '已禁用')
}

// 初始化时尝试加载后端流转配置
loadFlowConfig()
</script>

<style lang="scss" scoped>
.disabled-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}

.disabled-card {
  width: min(560px, 100%);
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(17, 24, 39, 0.06);
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
  backdrop-filter: blur(16px);
}

.disabled-badge {
  margin-bottom: 16px;
}

.disabled-title {
  margin: 0 0 12px;
  font-size: 24px;
  color: var(--text-primary);
}

.disabled-desc {
  margin: 0;
  color: var(--text-secondary);
  line-height: 1.7;
}

.disabled-points {
  margin-top: 18px;
  display: grid;
  gap: 10px;
}

.disabled-point {
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
    color: var(--text-primary);
  }
}

.disabled-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
  flex-wrap: wrap;
}

.settings-view {
  max-width: 1200px;
}

.settings-header {
  margin-bottom: 20px;
}

.settings-content {
  background: var(--surface);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 20px 24px;
  min-height: 400px;
}

/* 面板头部 */
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.panel-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.sub-tabs {
  display: flex;
  gap: 4px;
  background: var(--bg);
  padding: 4px;
  border-radius: var(--radius-sm);
}

.font-medium {
  font-weight: 500;
}

/* 角色标签 */
.role-tag {
  background: rgba(0, 113, 227, 0.08);
  color: var(--primary);
  margin-right: 4px;

  &:last-child {
    margin-right: 0;
  }
}

/* 编码标签 */
.code-tag {
  font-family: "SF Mono", "Menlo", "Monaco", monospace;
  font-size: 12px;
  background: var(--bg);
  padding: 2px 8px;
  border-radius: 4px;
  color: var(--text-secondary);
}

/* 标签网格 */
.tag-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
}

.tag-card {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: var(--bg);
  border-radius: var(--radius-sm);
  transition: var(--transition);

  &:hover {
    box-shadow: var(--shadow);
    background: var(--surface);
  }
}

.tag-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.tag-name {
  flex: 1;
  font-size: 13px;
  color: var(--text-primary);
}

.tag-delete {
  margin-left: auto;
  opacity: 0;
  transition: var(--transition);

  .tag-card:hover & {
    opacity: 1;
  }

}

/* 表单样式 */
.dialog-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
}

/* 开关 */
.form-switch {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;

  input {
    display: none;
  }

  .switch-slider {
    width: 40px;
    height: 22px;
    border-radius: 11px;
    background: #e8e8ed;
    position: relative;
    transition: var(--transition);

    &::after {
      content: '';
      position: absolute;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: #fff;
      top: 2px;
      left: 2px;
      transition: var(--transition);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
    }
  }

  input:checked + .switch-slider {
    background: var(--primary);

    &::after {
      left: 20px;
    }
  }

  .switch-text {
    font-size: 13px;
    color: var(--text-secondary);
  }
}

/* 响应式 */
@media (max-width: 768px) {
  .disabled-card {
    padding: 24px;
  }

  .disabled-title {
    font-size: 20px;
  }

  .panel-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .tag-grid {
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  }
}
</style>

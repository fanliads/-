<template>
  <div v-if="!isCurrentStageOpen" class="disabled-page">
    <div class="disabled-card">
      <div class="disabled-badge">暂未开放</div>
      <h2 class="disabled-title">系统设置已从当前阶段正式入口移出</h2>
      <p class="disabled-desc">
        当前阶段先收敛到需求处理主链路，这里的配置能力暂不对正式用户开放，避免把原型态管理页误当成可用后台。
      </p>
      <div class="disabled-actions">
        <button class="action-btn action-btn-primary" @click="router.push('/raw-pool')">前往原始需求池</button>
        <button class="action-btn" @click="router.push('/my-tasks')">前往我的待办</button>
      </div>
    </div>
  </div>

  <div v-else class="settings-view">
    <!-- 顶部 Tab 切换 -->
    <div class="settings-header">
      <div class="view-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="view-tab"
          :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- Tab 内容区 -->
    <div class="settings-content">
      <!-- Tab 1: 状态流配置 -->
      <div v-if="activeTab === 'workflow'" class="tab-panel">
        <div class="panel-header">
          <div class="sub-tabs">
            <button
              class="view-tab"
              :class="{ active: workflowSubTab === 'raw' }"
              @click="workflowSubTab = 'raw'"
            >原始需求流转</button>
            <button
              class="view-tab"
              :class="{ active: workflowSubTab === 'product' }"
              @click="workflowSubTab = 'product'"
            >产品需求流转</button>
          </div>
          <button class="btn btn-primary" @click="openWorkflowDialog()">+ 新增流转</button>
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
                  <button class="btn btn-ghost btn-sm" @click="openWorkflowDialog(row)">编辑</button>
                  <button class="btn btn-danger btn-sm" @click="deleteWorkflow(row)">删除</button>
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
          <button class="btn btn-primary" @click="openBusinessDialog()">+ 新增业务线</button>
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
                  <button class="btn btn-ghost btn-sm" @click="openBusinessDialog(item)">编辑</button>
                  <button class="btn btn-danger btn-sm" @click="deleteBusiness(item)">删除</button>
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
          <button class="btn btn-primary" @click="openTagDialog()">+ 新增标签</button>
        </div>
        <div class="tag-grid">
          <div v-for="tag in tagData" :key="tag.id" class="tag-card">
            <span class="tag-dot" :style="{ background: tag.color }"></span>
            <span class="tag-name">{{ tag.name }}</span>
            <button class="tag-delete" @click="deleteTag(tag)">✕</button>
          </div>
        </div>
      </div>

      <!-- Tab 4: 用户管理 -->
      <div v-if="activeTab === 'users'" class="tab-panel">
        <div class="panel-header">
          <h3 class="panel-title">用户列表</h3>
          <button class="btn btn-primary" @click="openUserDialog()">+ 新增用户</button>
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
                  <button class="btn btn-ghost btn-sm" @click="openUserDialog(user)">编辑</button>
                  <button class="btn btn-danger btn-sm" @click="toggleUserStatus(user)">
                    {{ user.active ? '禁用' : '启用' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- 状态流配置弹窗 -->
    <el-dialog
      v-model="workflowDialogVisible"
      :title="workflowForm.id ? '编辑流转规则' : '新增流转规则'"
      width="520px"
      :close-on-click-modal="false"
      class="settings-dialog"
    >
      <div class="dialog-form">
        <div class="form-item">
          <label class="form-label">源状态</label>
          <input v-model="workflowForm.fromStatus" class="form-input" placeholder="如：待判定" />
        </div>
        <div class="form-item">
          <label class="form-label">目标状态</label>
          <input v-model="workflowForm.toStatus" class="form-input" placeholder="如：设计中" />
        </div>
        <div class="form-item">
          <label class="form-label">允许角色</label>
          <input v-model="workflowForm.rolesStr" class="form-input" placeholder="如：产品经理,开发组长（逗号分隔）" />
        </div>
        <div class="form-item">
          <label class="form-label">操作名称</label>
          <input v-model="workflowForm.actionName" class="form-input" placeholder="如：确认推进" />
        </div>
        <div class="form-item">
          <label class="form-label">是否需审批</label>
          <label class="form-switch">
            <input v-model="workflowForm.needApproval" type="checkbox" />
            <span class="switch-slider"></span>
            <span class="switch-text">{{ workflowForm.needApproval ? '是' : '否' }}</span>
          </label>
        </div>
      </div>
      <template #footer>
        <button class="btn btn-ghost" @click="workflowDialogVisible = false">取消</button>
        <button class="btn btn-primary" @click="saveWorkflow">保存</button>
      </template>
    </el-dialog>

    <!-- 业务线弹窗 -->
    <el-dialog
      v-model="businessDialogVisible"
      :title="businessForm.id ? '编辑业务线' : '新增业务线'"
      width="520px"
      :close-on-click-modal="false"
      class="settings-dialog"
    >
      <div class="dialog-form">
        <div class="form-item">
          <label class="form-label">名称</label>
          <input v-model="businessForm.name" class="form-input" placeholder="如：核心交易" />
        </div>
        <div class="form-item">
          <label class="form-label">编码</label>
          <input v-model="businessForm.code" class="form-input" placeholder="如：CORE_TRADE" />
        </div>
        <div class="form-item">
          <label class="form-label">描述</label>
          <textarea v-model="businessForm.description" class="form-input form-textarea" placeholder="业务线描述" rows="3"></textarea>
        </div>
        <div class="form-item">
          <label class="form-label">负责人</label>
          <input v-model="businessForm.owner" class="form-input" placeholder="负责人姓名" />
        </div>
      </div>
      <template #footer>
        <button class="btn btn-ghost" @click="businessDialogVisible = false">取消</button>
        <button class="btn btn-primary" @click="saveBusiness">保存</button>
      </template>
    </el-dialog>

    <!-- 标签弹窗 -->
    <el-dialog
      v-model="tagDialogVisible"
      title="新增标签"
      width="420px"
      :close-on-click-modal="false"
      class="settings-dialog"
    >
      <div class="dialog-form">
        <div class="form-item">
          <label class="form-label">标签名称</label>
          <input v-model="tagForm.name" class="form-input" placeholder="如：紧急" />
        </div>
        <div class="form-item">
          <label class="form-label">标签颜色</label>
          <div class="color-picker">
            <span
              v-for="color in colorOptions"
              :key="color"
              class="color-option"
              :class="{ active: tagForm.color === color }"
              :style="{ background: color }"
              @click="tagForm.color = color"
            ></span>
          </div>
        </div>
      </div>
      <template #footer>
        <button class="btn btn-ghost" @click="tagDialogVisible = false">取消</button>
        <button class="btn btn-primary" @click="saveTag">保存</button>
      </template>
    </el-dialog>

    <!-- 用户弹窗 -->
    <el-dialog
      v-model="userDialogVisible"
      :title="userForm.id ? '编辑用户' : '新增用户'"
      width="520px"
      :close-on-click-modal="false"
      class="settings-dialog"
    >
      <div class="dialog-form">
        <div class="form-item">
          <label class="form-label">用户名</label>
          <input v-model="userForm.username" class="form-input" placeholder="登录用户名" />
        </div>
        <div class="form-item">
          <label class="form-label">姓名</label>
          <input v-model="userForm.realName" class="form-input" placeholder="真实姓名" />
        </div>
        <div class="form-item">
          <label class="form-label">角色</label>
          <select v-model="userForm.roleName" class="form-input">
            <option value="">请选择角色</option>
            <option value="管理员">管理员</option>
            <option value="产品经理">产品经理</option>
            <option value="开发组长">开发组长</option>
            <option value="开发人员">开发人员</option>
            <option value="测试人员">测试人员</option>
          </select>
        </div>
        <div class="form-item">
          <label class="form-label">部门</label>
          <input v-model="userForm.department" class="form-input" placeholder="所属部门" />
        </div>
        <div v-if="!userForm.id" class="form-item">
          <label class="form-label">初始密码</label>
          <input v-model="userForm.password" type="password" class="form-input" placeholder="初始登录密码" />
        </div>
      </div>
      <template #footer>
        <button class="btn btn-ghost" @click="userDialogVisible = false">取消</button>
        <button class="btn btn-primary" @click="saveUser">保存</button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getFlowConfig } from '@/api/workflow'
import type { FlowConfigNode } from '@/api/workflow'

const router = useRouter()
const isCurrentStageOpen = false

// ==================== Tab 配置 ====================
const tabs = [
  { key: 'workflow', label: '状态流配置' },
  { key: 'business', label: '业务线管理' },
  { key: 'tags', label: '标签管理' },
  { key: 'users', label: '用户管理' },
]
const activeTab = ref('workflow')

// ==================== Tab 1: 状态流配置 ====================
const workflowSubTab = ref<'raw' | 'product'>('raw')

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
    ElMessage.warning('请填写必填字段')
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
  ElMessage.success('保存成功')
}

function deleteWorkflow(row: WorkflowRow) {
  const targetData = workflowSubTab.value === 'raw' ? rawWorkflowData : productWorkflowData
  const idx = targetData.value.findIndex(r => r.id === row.id)
  if (idx !== -1) {
    targetData.value.splice(idx, 1)
    ElMessage.success('删除成功')
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
    ElMessage.warning('请填写必填字段')
    return
  }
  if (form.id) {
    const idx = businessData.value.findIndex(b => b.id === form.id)
    if (idx !== -1) businessData.value[idx] = { ...form } as BusinessLine
  } else {
    businessData.value.push({ ...form, id: Date.now() } as BusinessLine)
  }
  businessDialogVisible.value = false
  ElMessage.success('保存成功')
}

function deleteBusiness(item: BusinessLine) {
  const idx = businessData.value.findIndex(b => b.id === item.id)
  if (idx !== -1) {
    businessData.value.splice(idx, 1)
    ElMessage.success('删除成功')
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
    ElMessage.warning('请填写标签名称')
    return
  }
  tagData.value.push({ id: Date.now(), ...tagForm.value })
  tagDialogVisible.value = false
  ElMessage.success('保存成功')
}

function deleteTag(tag: TagItem) {
  const idx = tagData.value.findIndex(t => t.id === tag.id)
  if (idx !== -1) {
    tagData.value.splice(idx, 1)
    ElMessage.success('删除成功')
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
    ElMessage.warning('请填写必填字段')
    return
  }
  if (form.id) {
    const idx = userData.value.findIndex(u => u.id === form.id)
    if (idx !== -1) userData.value[idx] = { ...form } as UserRow
  } else {
    userData.value.push({ ...form, id: Date.now() } as UserRow)
  }
  userDialogVisible.value = false
  ElMessage.success('保存成功')
}

function toggleUserStatus(user: UserRow) {
  user.active = !user.active
  ElMessage.success(user.active ? '已启用' : '已禁用')
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
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 32px;
  box-shadow: var(--shadow);
}

.disabled-badge {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(0, 113, 227, 0.08);
  color: var(--primary, #0071e3);
  font-size: 12px;
  font-weight: 600;
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

.disabled-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
  flex-wrap: wrap;
}

.action-btn {
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text-primary);
  border-radius: 10px;
  padding: 10px 16px;
  font-size: 14px;
  cursor: pointer;
}

.action-btn-primary {
  border-color: transparent;
  background: var(--primary, #0071e3);
  color: #fff;
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

/* 表格行内按钮缩小 */
.btn-sm {
  padding: 4px 10px;
  font-size: 12px;
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
  border: none;
  background: none;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 12px;
  padding: 2px 4px;
  border-radius: 4px;
  opacity: 0;
  transition: var(--transition);

  .tag-card:hover & {
    opacity: 1;
  }

  &:hover {
    color: var(--danger);
    background: rgba(255, 59, 48, 0.08);
  }
}

/* 颜色选择器 */
.color-picker {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.color-option {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
  transition: var(--transition);
  border: 2px solid transparent;

  &:hover {
    transform: scale(1.15);
  }

  &.active {
    border-color: var(--text-primary);
    box-shadow: 0 0 0 2px var(--surface);
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

.form-input {
  padding: 11px 14px;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  background: #fafafa;
  font-size: 13px;
  outline: none;
  transition: var(--transition);
  font-family: inherit;

  &:focus {
    border-color: var(--primary);
    background: var(--surface);
    box-shadow: 0 0 0 3px rgba(0, 113, 227, 0.08);
  }

  &::placeholder {
    color: var(--text-secondary);
    opacity: 0.6;
  }
}

.form-textarea {
  resize: vertical;
  min-height: 72px;
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

/* 弹窗样式覆盖 */
:deep(.settings-dialog) {
  .el-dialog {
    border-radius: 12px;
    box-shadow: var(--shadow-modal);
  }

  .el-dialog__header {
    padding: 20px 24px 12px;
    border-bottom: none;
  }

  .el-dialog__title {
    font-size: 15px;
    font-weight: 600;
  }

  .el-dialog__body {
    padding: 12px 24px;
  }

  .el-dialog__footer {
    padding: 12px 24px 20px;
    border-top: none;
    display: flex;
    justify-content: flex-end;
    gap: 8px;
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

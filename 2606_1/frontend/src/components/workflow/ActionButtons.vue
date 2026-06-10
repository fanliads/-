<template>
  <div class="action-buttons">
    <template v-if="loading">
      <el-button loading text />
    </template>
    <template v-else-if="actions.length > 0">
      <el-button
        v-for="action in actions"
        :key="action.toStatus"
        :type="getButtonType(action.actionName)"
        size="small"
        @click="handleAction(action)"
      >
        {{ action.actionName }}
      </el-button>
    </template>
    <span v-else class="no-actions">当前无可执行操作</span>

    <!-- 审批意见弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="`执行操作: ${currentAction?.actionName}`"
      width="480px"
      :close-on-click-modal="false"
      append-to-body
    >
      <el-form label-width="80px">
        <el-form-item label="审批意见">
          <el-input
            v-model="remark"
            type="textarea"
            :rows="3"
            placeholder="请输入审批意见（可选）"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="executing" @click="confirmAction">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { getAvailableActions, executeAction, type ActionVO } from '@/api/workflow'

const props = defineProps<{
  reqType: string
  reqId: number
  currentStatus: string
}>()

const emit = defineEmits<{
  (e: 'action-done'): void
}>()

const actions = ref<ActionVO[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const executing = ref(false)
const remark = ref('')
const currentAction = ref<ActionVO | null>(null)

async function loadActions() {
  loading.value = true
  try {
    const res = await getAvailableActions(props.reqType, props.reqId)
    actions.value = (res as any).data || []
  } catch {
    actions.value = []
  } finally {
    loading.value = false
  }
}

function getButtonType(actionName: string): '' | 'success' | 'danger' | 'warning' | 'primary' {
  if (actionName.includes('通过') || actionName.includes('确认') || actionName.includes('完成') || actionName.includes('接受')) return 'success'
  if (actionName.includes('拒绝')) return 'danger'
  if (actionName.includes('挂起') || actionName.includes('退回')) return 'warning'
  return 'primary'
}

function handleAction(action: ActionVO) {
  if (action.needApproval) {
    currentAction.value = action
    remark.value = ''
    dialogVisible.value = true
  } else {
    doExecute(action, '')
  }
}

async function doExecute(action: ActionVO, remarkText: string) {
  executing.value = true
  try {
    await executeAction({
      reqType: props.reqType,
      reqId: props.reqId,
      toStatus: action.toStatus,
      remark: remarkText,
    })
    ElMessage.success(`操作「${action.actionName}」执行成功`)
    emit('action-done')
    loadActions()
  } catch {
    // error handled by interceptor
  } finally {
    executing.value = false
  }
}

function confirmAction() {
  dialogVisible.value = false
  if (currentAction.value) {
    doExecute(currentAction.value, remark.value)
  }
}

onMounted(() => {
  loadActions()
})

watch(() => props.currentStatus, () => {
  loadActions()
})
</script>

<style lang="scss" scoped>
.action-buttons {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;

  .no-actions {
    color: #c0c4cc;
    font-size: 13px;
  }
}
</style>

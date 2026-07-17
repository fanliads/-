<template>
  <div class="action-buttons">
    <template v-if="loading">
      <LnButton size="small" variant="ghost" loading>加载操作</LnButton>
    </template>
    <template v-else-if="actions.length > 0">
      <LnButton
        v-for="action in actions"
        :key="action.toStatus"
        :variant="getButtonVariant(action.actionName)"
        size="small"
        @click="handleAction(action)"
      >
        {{ action.actionName }}
      </LnButton>
    </template>
    <span v-else class="no-actions">当前无可执行操作</span>

    <!-- 审批意见弹窗 -->
    <LnDialog
      v-model="dialogVisible"
      :title="`执行操作：${currentAction?.actionName || ''}`"
      description="确认后将立即更新需求状态并记录操作人。"
      width="480px"
      :close-on-backdrop="false"
    >
      <LnCallout v-if="currentAction" tone="info" :title="`${currentStatus} → ${currentAction.toStatus}`" description="状态名称将按当前工作流配置执行。" />
      <LnTextarea v-model="remark" label="审批意见" placeholder="请输入审批意见（可选）" />
      <template #footer>
        <LnButton variant="ghost" @click="dialogVisible = false">取消</LnButton>
        <LnButton variant="primary" :loading="executing" @click="confirmAction">确认</LnButton>
      </template>
    </LnDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { getAvailableActions, executeAction, type ActionVO } from '@/api/workflow'
import { lnToast, LnButton, LnCallout, LnDialog, LnTextarea } from '@/components/linear'

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

function getButtonVariant(actionName: string): 'primary' | 'secondary' | 'danger' {
  if (actionName.includes('通过') || actionName.includes('确认') || actionName.includes('完成') || actionName.includes('接受')) return 'primary'
  if (actionName.includes('拒绝')) return 'danger'
  if (actionName.includes('挂起') || actionName.includes('退回')) return 'secondary'
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
    lnToast.success(`操作「${action.actionName}」执行成功`)
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
  gap: 6px;
  flex-wrap: wrap;

  .no-actions {
    color: #c0c4cc;
    font-size: 12px;
  }
}

.ln-callout + .ln-textarea-field { margin-top: 14px; }
</style>

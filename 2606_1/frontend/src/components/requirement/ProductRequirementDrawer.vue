<template>
  <el-drawer
    :model-value="visible"
    size="640px"
    :before-close="handleClose"
    destroy-on-close
    :show-close="false"
    class="apple-drawer"
  >
    <template #header>
      <div class="drawer-header">
        <div>
          <div class="drawer-id">{{ detail?.reqNo || '' }}</div>
          <div class="drawer-title">{{ detail?.title || '' }}</div>
        </div>
        <button class="btn btn-ghost" @click="handleClose">关闭</button>
      </div>
    </template>

    <div v-loading="loading" class="drawer-body">
      <template v-if="detail">
        <!-- Tabs -->
        <el-tabs v-model="activeTab" class="drawer-tabs">
          <!-- 概览 -->
          <el-tab-pane label="概览" name="overview">
            <!-- 基础信息 -->
            <div class="section">
              <div class="section-title">基础信息</div>
              <div class="info-grid">
                <div class="info-item">
                  <div class="info-label">需求编号</div>
                  <div class="info-value">{{ detail.reqNo }}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">优先级</div>
                  <div class="info-value"><span class="tag" :class="'priority-' + (detail.priority || 'p2').toLowerCase()">{{ PRIORITY_MAP[detail.priority] || detail.priority }}</span></div>
                </div>
                <div class="info-item">
                  <div class="info-label">状态</div>
                  <div class="info-value">
                    <span class="status-tag" :class="getStatusClass(detail.status)">{{ detail.statusName || PRODUCT_STATUS_MAP[detail.status] }}</span>
                  </div>
                </div>
                <div class="info-item">
                  <div class="info-label">需求类型</div>
                  <div class="info-value">{{ detail.reqType || '-' }}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">业务线</div>
                  <div class="info-value">{{ detail.businessLineName || '-' }}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">产品模块</div>
                  <div class="info-value">{{ detail.productModule || '-' }}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">负责人</div>
                  <div class="info-value">{{ detail.assigneeName || '-' }}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">迭代</div>
                  <div class="info-value">{{ detail.sprintName || '-' }}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">工作量</div>
                  <div class="info-value">{{ detail.workload || '-' }}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">价值评分</div>
                  <div class="info-value">
                    <el-rate v-model="detail.valueScore" disabled :max="5" v-if="detail.valueScore" />
                    <span v-else>-</span>
                  </div>
                </div>
                <div class="info-item">
                  <div class="info-label">创建人</div>
                  <div class="info-value">{{ detail.createByName || '-' }}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">期望日期</div>
                  <div class="info-value">{{ detail.expectedDate ? detail.expectedDate.substring(0, 10) : '-' }}</div>
                </div>
              </div>
            </div>

            <!-- 需求描述 -->
            <div class="section">
              <div class="section-title">需求描述</div>
              <div class="desc-content rich-text-content" v-html="renderRichText(detail.description)" />
            </div>

            <!-- 关联信息 -->
            <div class="section">
              <div class="section-title">关联信息</div>
              <div class="info-grid">
                <div class="info-item">
                  <div class="info-label">关联原始需求</div>
                  <div class="info-value">
                    <span v-if="detail.rawReqTitle">{{ detail.rawReqTitle }} ({{ detail.rawReqId }})</span>
                    <span v-else>-</span>
                  </div>
                </div>
                <div class="info-item">
                  <div class="info-label">设计文档链接</div>
                  <div class="info-value">
                    <a v-if="detail.designDocUrl" :href="detail.designDocUrl" target="_blank" class="link">{{ detail.designDocUrl }}</a>
                    <span v-else>-</span>
                  </div>
                </div>
                <div class="info-item">
                  <div class="info-label">实际上线日期</div>
                  <div class="info-value">{{ detail.actualOnlineDate ? detail.actualOnlineDate.substring(0, 10) : '-' }}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">创建时间</div>
                  <div class="info-value">{{ detail.createTime ? detail.createTime.substring(0, 16).replace('T', ' ') : '-' }}</div>
                </div>
              </div>
            </div>
          </el-tab-pane>

          <!-- 流转记录 -->
          <el-tab-pane label="流转记录" name="logs">
            <div class="timeline">
              <div v-for="log in logs" :key="log.id" class="timeline-item">
                <div class="log-item">
                  <span class="log-operator">{{ log.operatorName }}</span>
                  <span class="log-action">{{ log.actionName }}</span>
                  <template v-if="log.fieldName">
                    <span class="log-field"> [{{ log.fieldName }}] </span>
                    <span v-if="log.oldValue" class="log-old">{{ log.oldValue }}</span>
                    <span class="log-arrow">→</span>
                    <span v-if="log.newValue" class="log-new">{{ log.newValue }}</span>
                  </template>
                  <div v-if="log.remark" class="log-remark">{{ log.remark }}</div>
                </div>
                <div class="log-time">{{ log.createTime ? log.createTime.substring(0, 16).replace('T', ' ') : '' }}</div>
              </div>
            </div>
            <el-empty v-if="logs.length === 0" description="暂无流转记录" />
          </el-tab-pane>

          <!-- 评论 -->
          <el-tab-pane label="评论" name="comments">
            <div class="comment-list">
              <div v-for="comment in comments" :key="comment.id" class="comment-item">
                <div class="comment-header">
                  <span class="comment-user">{{ comment.userName }}</span>
                  <span class="comment-time">{{ comment.createTime ? comment.createTime.substring(0, 16).replace('T', ' ') : '' }}</span>
                </div>
                <div class="comment-content">{{ comment.content }}</div>
              </div>
              <el-empty v-if="comments.length === 0" description="暂无评论" />
            </div>
            <div class="comment-input">
              <el-input v-model="commentText" type="textarea" :rows="2" placeholder="输入评论内容..." />
              <button class="btn btn-primary" style="margin-top: 8px" @click="submitComment">发表评论</button>
            </div>
          </el-tab-pane>

          <!-- 补充内容 -->
          <el-tab-pane label="补充内容" name="supplements">
            <div class="supplement-list">
              <div v-for="sup in supplements" :key="sup.id" class="timeline-item">
                <div class="supplement-header">
                  <span class="tag status-filter">{{ sup.supplementTypeName }}</span>
                  <span class="supplement-user">{{ sup.userName }}</span>
                </div>
                <div class="supplement-content">{{ sup.content }}</div>
                <div class="log-time">{{ sup.createTime ? sup.createTime.substring(0, 16).replace('T', ' ') : '' }}</div>
              </div>
              <el-empty v-if="supplements.length === 0" description="暂无补充内容" />
            </div>
            <div style="margin-top: 12px">
              <button class="btn btn-primary" @click="$emit('openSupplement', requirementId)">添加补充</button>
            </div>
          </el-tab-pane>
        </el-tabs>
      </template>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import {
  getProductRequirementDetail,
  getProductRequirementLogs,
  getProductRequirementComments,
  addProductRequirementComment,
  getProductRequirementSupplements,
} from '@/api/product-requirement'
import type { ProductRequirementDetailVO, RequirementLogVO, CommentVO, SupplementVO } from '@/types/requirement'
import {
  PRODUCT_STATUS_MAP,
  PRIORITY_MAP,
} from '@/types/requirement'
import { sanitizeRichText } from '@/utils/rich-text'

const props = defineProps<{
  visible: boolean
  requirementId: number
}>()

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
  (e: 'refresh'): void
  (e: 'openSupplement', reqId: number): void
}>()

const loading = ref(false)
const detail = ref<ProductRequirementDetailVO | null>(null)
const activeTab = ref('overview')
const logs = ref<RequirementLogVO[]>([])
const comments = ref<CommentVO[]>([])
const supplements = ref<SupplementVO[]>([])
const commentText = ref('')

function renderRichText(content?: string) {
  return sanitizeRichText(content) || '暂无描述'
}

function handleClose() {
  emit('update:visible', false)
}

function getStatusClass(status: string): string {
  if (status === 'pending_filter' || status === 'PENDING_FILTER' || status === 'pending_assign' || status === 'PENDING_ASSIGN') return 'status-filter'
  if (status === 'dispatched' || status === 'DISPATCHED') return 'status-dispatch'
  if (status === 'hold' || status === 'HOLD' || status === 'suspended' || status === 'SUSPENDED') return 'status-hold'
  return 'status-filter'
}

async function loadDetail() {
  if (!props.requirementId) return
  loading.value = true
  try {
    const res = await getProductRequirementDetail(props.requirementId)
    detail.value = res.data
    const [logsRes, commentsRes, supsRes] = await Promise.all([
      getProductRequirementLogs(props.requirementId),
      getProductRequirementComments(props.requirementId),
      getProductRequirementSupplements(props.requirementId),
    ])
    logs.value = logsRes.data || []
    comments.value = commentsRes.data || []
    supplements.value = supsRes.data || []
  } catch {
    // error handled by interceptor
  } finally {
    loading.value = false
  }
}

async function submitComment() {
  if (!commentText.value.trim()) {
    ElMessage.warning('请输入评论内容')
    return
  }
  try {
    await addProductRequirementComment(props.requirementId, { content: commentText.value })
    ElMessage.success('评论成功')
    commentText.value = ''
    const res = await getProductRequirementComments(props.requirementId)
    comments.value = res.data || []
  } catch {
    // error handled by interceptor
  }
}

watch(() => props.visible, (val) => {
  if (val && props.requirementId) {
    activeTab.value = 'overview'
    loadDetail()
  }
})
</script>

<style lang="scss" scoped>
// ===== 抽屉头部 =====
.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0;
}

.drawer-id {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 4px;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  background: var(--bg);
  padding: 2px 10px;
  border-radius: 4px;
  display: inline-block;
}

.drawer-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

// ===== 抽屉body =====
.drawer-body {
  padding: 20px 24px;
}

// ===== Apple-style 抽屉覆盖 =====
:deep(.el-drawer) {
  box-shadow: -8px 0 32px rgba(0, 0, 0, 0.08);
}

:deep(.el-drawer__header) {
  padding: 18px 24px;
  border-bottom: 1px solid var(--border);
  margin-bottom: 0;
}

:deep(.el-drawer__body) {
  padding: 0;
}

.drawer-tabs {
  :deep(.el-tabs__header) {
    padding: 0 24px;
    margin-bottom: 0;
  }

  :deep(.el-tabs__nav-wrap::after) {
    height: 1px;
    background: var(--border);
  }

  :deep(.el-tabs__item) {
    font-size: 13px;
    font-weight: 500;
    color: var(--text-secondary);

    &.is-active {
      color: var(--primary);
    }
  }
}

// ===== 区段 =====
.section {
  margin-bottom: 22px;
}

.section-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.info-item {
  background: var(--bg);
  border-radius: 8px;
  padding: 10px 12px;
}

.info-label {
  font-size: 11px;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.info-value {
  font-size: 13px;
  color: var(--text-primary);
}

// ===== 状态标签 =====
.status-tag {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
}

.status-filter { background: rgba(0, 113, 227, 0.10); color: var(--primary); }
.status-dispatch { background: rgba(52, 199, 89, 0.10); color: #248a3d; }
.status-hold { background: rgba(142, 142, 147, 0.10); color: var(--text-secondary); }

.desc-content {
  padding: 12px 14px;
  background: var(--bg);
  border-radius: 8px;
  font-size: 13px;
  line-height: 1.7;
  color: var(--text-primary);
  white-space: pre-wrap;
}

.link {
  color: var(--primary);
  text-decoration: none;
  &:hover { text-decoration: underline; }
}

// ===== 时间线 =====
.timeline {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.timeline-item {
  padding: 12px 14px;
  border-left: 3px solid var(--primary);
  background: rgba(0, 113, 227, 0.03);
  border-radius: 0 8px 8px 0;
}

.log-item {
  font-size: 13px;

  .log-operator { font-weight: 600; }
  .log-action { color: var(--primary); margin-left: 4px; }
  .log-field { color: var(--text-secondary); }
  .log-old { color: var(--danger); text-decoration: line-through; margin: 0 4px; }
  .log-arrow { margin: 0 4px; color: var(--text-secondary); }
  .log-new { color: var(--success); }
  .log-remark { color: var(--text-secondary); margin-top: 4px; font-size: 12px; }
}

.log-time {
  font-size: 11px;
  color: var(--text-secondary);
  margin-top: 6px;
}

// ===== 评论 =====
.comment-list {
  .comment-item {
    padding: 12px 14px;
    border-left: 3px solid var(--primary);
    background: rgba(0, 113, 227, 0.03);
    border-radius: 0 8px 8px 0;
    margin-bottom: 10px;

    .comment-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 6px;
      .comment-user { font-weight: 600; font-size: 13px; }
      .comment-time { color: var(--text-secondary); font-size: 12px; }
    }
    .comment-content { font-size: 13px; line-height: 1.5; }
  }
}

.comment-input {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid var(--border);
}

// ===== 补充内容 =====
.supplement-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.supplement-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  .supplement-user { font-weight: 600; font-size: 13px; }
}

.supplement-content {
  font-size: 13px;
  line-height: 1.5;
}
</style>

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
                  <div class="info-label">当前状态</div>
                  <div class="info-value">
                    <span class="status-tag" :class="getStatusClass(detail.status)">{{ detail.statusName || RAW_STATUS_MAP[detail.status] }}</span>
                  </div>
                </div>
                <div class="info-item">
                  <div class="info-label">优先级</div>
                  <div class="info-value"><span class="tag" :class="getPriorityClass(detail.effectiveLevel || detail.priority)">{{ getPriorityLabel(detail.effectiveLevel || detail.priority) }}</span></div>
                </div>
                <div class="info-item info-item-wide">
                  <div class="info-label">系统分级判定</div>
                  <div class="info-value ai-assessment">
                    <template v-if="detail.latestPriorityAssessment">
                      <div class="ai-summary">
                        <span class="tag" :class="getPriorityClass(detail.latestPriorityAssessment.effectiveLevel || detail.latestPriorityAssessment.priority)">
                          {{ detail.latestPriorityAssessment.effectiveLevelLabel || detail.latestPriorityAssessment.priorityLabel || getPriorityLabel(detail.latestPriorityAssessment.priority) || '-' }}
                        </span>
                        <span class="ai-meta">{{ detail.latestPriorityAssessment.assessedAt ? detail.latestPriorityAssessment.assessedAt.substring(0, 16).replace('T', ' ') : '' }}</span>
                      </div>
                      <div v-if="detail.latestPriorityAssessment.systemLevelLabel" class="ai-subline">系统判定：{{ detail.latestPriorityAssessment.systemLevelLabel }}</div>
                      <div v-if="detail.latestPriorityAssessment.overrideFlag && detail.latestPriorityAssessment.overrideReason" class="ai-subline">人工覆盖：{{ detail.latestPriorityAssessment.overrideReason }}</div>
                      <div v-if="detail.latestPriorityAssessment.strategyHint" class="ai-subline">处理策略：{{ detail.latestPriorityAssessment.strategyHint }}</div>
                      <div v-if="detail.latestPriorityAssessment.ruleHits?.length" class="ai-subline">命中规则：{{ detail.latestPriorityAssessment.ruleHits.join('；') }}</div>
                      <div class="ai-reason">{{ detail.latestPriorityAssessment.reason || '暂无解释摘要' }}</div>
                    </template>
                    <template v-else>
                      <div class="ai-reason">暂无系统判定结果</div>
                    </template>
                    <div class="ai-actions">
                      <button class="btn btn-ghost btn-mini" @click="reassessPriority">重新判定</button>
                      <button class="btn btn-ghost btn-mini" @click="showOverrideEditor = !showOverrideEditor">{{ showOverrideEditor ? '收起覆盖' : '人工覆盖' }}</button>
                    </div>
                    <div v-if="showOverrideEditor" class="override-editor">
                      <el-select v-model="overrideForm.effectiveLevel" placeholder="选择生效等级" style="width: 180px">
                        <el-option label="一级A类（P0）" value="P0" />
                        <el-option label="一级B类（P1）" value="P1" />
                        <el-option label="二级（P2）" value="P2" />
                        <el-option label="三级（P3）" value="P3" />
                      </el-select>
                      <el-input v-model="overrideForm.overrideReason" type="textarea" :rows="2" placeholder="填写人工覆盖原因" />
                      <button class="btn btn-primary btn-mini" @click="submitOverride">保存覆盖</button>
                    </div>
                  </div>
                </div>
                <div class="info-item">
                  <div class="info-label">需求来源</div>
                  <div class="info-value">{{ SOURCE_MAP[detail.source] || detail.source || '-' }}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">需求类型</div>
                  <div class="info-value">{{ REQ_TYPE_MAP[detail.reqType] || detail.reqType || '-' }}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">提出人</div>
                  <div class="info-value">{{ detail.proposer || '-' }}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">联系方式</div>
                  <div class="info-value">{{ detail.proposerContact || '-' }}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">关联项目</div>
                  <div class="info-value">{{ detail.projectName || '-' }}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">负责人</div>
                  <div class="info-value">{{ detail.assigneeName || '-' }}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">业务线</div>
                  <div class="info-value">{{ detail.businessLineName || '-' }}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">期望日期</div>
                  <div class="info-value">{{ detail.expectedDate ? detail.expectedDate.substring(0, 10) : '-' }}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">创建人</div>
                  <div class="info-value">{{ detail.createByName || '-' }}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">创建时间</div>
                  <div class="info-value">{{ detail.createTime ? detail.createTime.substring(0, 16).replace('T', ' ') : '-' }}</div>
                </div>
              </div>
            </div>

            <!-- 需求描述 -->
            <div class="section">
              <div class="section-title">原始需求描述</div>
              <div class="desc-content">{{ detail.description || '暂无描述' }}</div>
            </div>

            <div v-if="businessArchiveSections.length" class="section">
              <div class="section-title">业务档案</div>
              <div class="archive-section-list">
                <div v-for="section in businessArchiveSections" :key="section.title" class="archive-section">
                  <div class="archive-title">{{ section.title }}</div>
                  <div class="archive-grid">
                    <div v-for="item in section.items" :key="item.label" class="archive-item">
                      <div class="archive-label">{{ item.label }}</div>
                      <div class="archive-value">{{ item.value }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 关联信息 -->
            <div class="section">
              <div class="section-title">关联信息</div>
              <div class="info-grid">
                <div class="info-item">
                  <div class="info-label">需求链接</div>
                  <div class="info-value">
                    <a v-if="detail.reqLink" :href="detail.reqLink" target="_blank" class="link">{{ detail.reqLink }}</a>
                    <span v-else>-</span>
                  </div>
                </div>
                <div class="info-item">
                  <div class="info-label">备注</div>
                  <div class="info-value">{{ detail.remark || '-' }}</div>
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
                <div v-if="sup.attachment" class="supplement-attachment">附件: {{ sup.attachment }}</div>
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
import { computed, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { getRawRequirementDetail, getRawRequirementLogs, getRawRequirementComments, addRawRequirementComment, getRawRequirementSupplements, reassessRawRequirementPriority, overrideRawRequirementPriority } from '@/api/raw-requirement'
import type { RawRequirementDetailVO, RequirementLogVO, CommentVO, SupplementVO, PriorityAssessmentContextDTO } from '@/types/requirement'
import { RAW_STATUS_MAP, PRIORITY_MAP, SOURCE_MAP, REQ_TYPE_MAP } from '@/types/requirement'

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
const detail = ref<RawRequirementDetailVO | null>(null)
const activeTab = ref('overview')
const logs = ref<RequirementLogVO[]>([])
const comments = ref<CommentVO[]>([])
const supplements = ref<SupplementVO[]>([])
const commentText = ref('')
const showOverrideEditor = ref(false)
const overrideForm = ref({
  effectiveLevel: 'P2',
  overrideReason: '',
})

const assessmentContext = computed<PriorityAssessmentContextDTO | null>(() => {
  const raw = detail.value?.aiAssessmentContext
  if (!raw) {
    return null
  }
  try {
    return JSON.parse(raw) as PriorityAssessmentContextDTO
  } catch {
    return null
  }
})

const businessArchiveSections = computed(() => {
  const ctx = assessmentContext.value
  if (!ctx) {
    return []
  }

  const sections = [
    {
      title: '项目与客户',
      items: [
        { label: '项目名称', value: ctx.projectName },
        { label: '客户名称', value: ctx.customerName },
        { label: '商务负责人', value: ctx.businessOwner },
      ],
    },
    {
      title: '合同与交付',
      items: [
        { label: '合同编号', value: ctx.contractNo },
        { label: '合同金额', value: ctx.contractAmount },
        { label: '合同范围', value: ctx.contractScope },
        { label: '刚性交付日期', value: ctx.rigidDeliveryDate },
        { label: '期望上线时间', value: ctx.expectedOnlineTime },
        { label: '预估工时', value: ctx.estimatedWorkload },
      ],
    },
    {
      title: '风险与督办',
      items: [
        { label: '履约风险', value: ctx.deliveryRisk },
        { label: '回款风险', value: ctx.paymentRisk },
        { label: '验收风险', value: ctx.acceptanceRisk },
        { label: '安全/合规风险', value: ctx.securityOrComplianceRisk },
        { label: '重大故障风险', value: ctx.majorIncidentRisk },
        { label: '省级督办', value: ctx.govSupervision },
      ],
    },
    {
      title: '战略属性',
      items: [
        { label: '战略客户/标杆客户', value: ctx.strategicCustomer },
        { label: '核心产品线', value: ctx.coreProductLine },
        { label: '项目类型', value: ctx.projectType },
        { label: '可复用性', value: ctx.reusability },
        { label: '是否样板', value: ctx.benchmarkCase },
      ],
    },
    {
      title: '补充说明',
      items: [
        { label: '特殊备注', value: ctx.specialRemark },
      ],
    },
  ]

  return sections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => item.value),
    }))
    .filter((section) => section.items.length > 0)
})

function handleClose() {
  emit('update:visible', false)
}

function getStatusClass(status: string): string {
  if (status === 'pending_pm_eval' || status === 'PENDING_PM_EVAL') return 'status-eval'
  if (status === 'pending_director' || status === 'PENDING_DIRECTOR') return 'status-director'
  return 'status-eval'
}

function getPriorityLabel(priority?: string) {
  if (!priority) return '-'
  if (priority === 'P0') return '一级A类（P0）'
  if (priority === 'P1') return '一级B类（P1）'
  if (priority === 'P2') return '二级（P2）'
  if (priority === 'P3') return '三级（P3）'
  return PRIORITY_MAP[priority] || priority
}

function getPriorityClass(priority?: string) {
  const normalized = (priority || '').toUpperCase()
  if (normalized === 'P0') return 'priority-p0'
  if (normalized === 'P1') return 'priority-p1'
  if (normalized === 'P2') return 'priority-p2'
  return 'priority-p3'
}

async function loadDetail() {
  if (!props.requirementId) return
  loading.value = true
  try {
    const res = await getRawRequirementDetail(props.requirementId)
    detail.value = res.data
    const [logsRes, commentsRes, supsRes] = await Promise.all([
      getRawRequirementLogs(props.requirementId),
      getRawRequirementComments(props.requirementId),
      getRawRequirementSupplements(props.requirementId),
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
    await addRawRequirementComment(props.requirementId, { content: commentText.value })
    ElMessage.success('评论成功')
    commentText.value = ''
    const res = await getRawRequirementComments(props.requirementId)
    comments.value = res.data || []
  } catch {
    // error handled by interceptor
  }
}

async function reassessPriority() {
  if (!props.requirementId) return
  try {
    const context: PriorityAssessmentContextDTO = {
      projectName: detail.value?.projectName,
      specialRemark: detail.value?.remark,
      expectedOnlineTime: detail.value?.expectedOnlineDate,
    }
    const res = await reassessRawRequirementPriority(props.requirementId, context)
    ElMessage.success(res.data?.success ? '系统重新判定完成' : '已记录信息不足结果')
    await loadDetail()
    emit('refresh')
  } catch {
    // error handled by interceptor
  }
}

async function submitOverride() {
  if (!props.requirementId) return
  if (!overrideForm.value.effectiveLevel || !overrideForm.value.overrideReason.trim()) {
    ElMessage.warning('请选择生效等级并填写覆盖原因')
    return
  }
  try {
    await overrideRawRequirementPriority(props.requirementId, {
      effectiveLevel: overrideForm.value.effectiveLevel,
      overrideReason: overrideForm.value.overrideReason.trim(),
    })
    ElMessage.success('人工覆盖已保存')
    showOverrideEditor.value = false
    overrideForm.value.overrideReason = ''
    await loadDetail()
    emit('refresh')
  } catch {
    // error handled by interceptor
  }
}

watch(() => props.visible, (val) => {
  if (val && props.requirementId) {
    activeTab.value = 'overview'
    showOverrideEditor.value = false
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

.info-item-wide {
  grid-column: 1 / -1;
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

.ai-assessment {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ai-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.override-editor {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.02);
}

.ai-summary {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ai-meta {
  font-size: 12px;
  color: var(--text-secondary);
}

.ai-subline {
  font-size: 12px;
  color: var(--text-secondary);
}

.ai-reason {
  line-height: 1.6;
  white-space: pre-wrap;
}

.btn-mini {
  align-self: flex-start;
  padding: 6px 12px;
}

// ===== 状态标签 =====
.status-tag {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
}

.status-eval { background: rgba(0, 113, 227, 0.10); color: var(--primary); }
.status-director { background: rgba(255, 149, 0, 0.10); color: #b75c00; }

.desc-content {
  padding: 12px 14px;
  background: var(--bg);
  border-radius: 8px;
  font-size: 13px;
  line-height: 1.7;
  color: var(--text-primary);
  white-space: pre-wrap;
}

.archive-section-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.archive-section {
  padding: 14px;
  background: var(--bg);
  border-radius: 10px;
}

.archive-title {
  margin-bottom: 10px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
}

.archive-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.archive-item {
  padding: 10px 12px;
  border-radius: 8px;
  background: var(--surface);
  border: 1px solid var(--border);
}

.archive-label {
  margin-bottom: 4px;
  font-size: 11px;
  color: var(--text-secondary);
}

.archive-value {
  font-size: 13px;
  line-height: 1.5;
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

.supplement-attachment {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 4px;
}
</style>

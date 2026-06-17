// ========== 字典相关 ==========

/** 字典类型VO */
export interface DictTypeVO {
  id: number
  dictCode: string
  dictName: string
  remark: string
  status: number
  createTime: string
  updateTime: string
}

/** 字典数据VO */
export interface DictDataVO {
  id: number
  dictTypeId: number
  dictCode: string
  label: string
  value: string
  sort: number
  status: number
  createTime: string
  updateTime: string
}

/** 字典数据创建DTO */
export interface DictDataCreateDTO {
  dictCode: string
  label: string
  value: string
  sort?: number
  status?: number
}

/** 字典数据更新DTO */
export interface DictDataUpdateDTO {
  label?: string
  value?: string
  sort?: number
  status?: number
}

// ========== 通用类型 ==========

/** 分页结果 */
export interface PageResult<T> {
  total: number
  list: T[]
  page: number
  size: number
}

/** API 响应 */
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

// ========== 原始需求 ==========

/** 原始需求创建DTO */
export interface RawRequirementCreateDTO {
  title: string
  description?: string
  source?: string
  submitOrigin?: 'internal' | 'external'
  proposer?: string
  proposerContact?: string
  projectName?: string
  reqLink?: string
  priority?: string
  expectedDate?: string
  reqType?: string
  attachment?: string
  remark?: string
  businessLineId?: number
  businessLine?: string
  registerName?: string
  proposeTime?: string
  productDefinition?: string
  productManager?: string
  projectManager?: string
  isUrgent?: number
  urgentReason?: string
  expectedOnlineDate?: string
  valueAssessment?: string
  assessmentContext?: PriorityAssessmentContextDTO
}

/** 原始需求更新DTO */
export interface RawRequirementUpdateDTO {
  title?: string
  description?: string
  source?: string
  submitOrigin?: 'internal' | 'external'
  proposer?: string
  proposerContact?: string
  projectName?: string
  reqLink?: string
  priority?: string
  expectedDate?: string
  reqType?: string
  attachment?: string
  remark?: string
  businessLineId?: number
  businessLine?: string
  registerName?: string
  proposeTime?: string
  productDefinition?: string
  productManager?: string
  projectManager?: string
  isUrgent?: number
  urgentReason?: string
  expectedOnlineDate?: string
  valueAssessment?: string
  assessmentContext?: PriorityAssessmentContextDTO
  assigneeId?: number
  status?: string
}

export interface PriorityAssessmentContextDTO {
  projectName?: string
  customerName?: string
  contractNo?: string
  contractAmount?: string
  deliveryRisk?: string
  paymentRisk?: string
  acceptanceRisk?: string
  securityOrComplianceRisk?: string
  majorIncidentRisk?: string
  govSupervision?: string
  strategicCustomer?: string
  coreProductLine?: string
  projectType?: string
  reusability?: string
  benchmarkCase?: string
  contractScope?: string
  rigidDeliveryDate?: string
  estimatedWorkload?: string
  businessOwner?: string
  expectedOnlineTime?: string
  specialRemark?: string
}

export interface PriorityAssessmentVO {
  priority?: string
  priorityLabel?: string
  systemLevel?: string
  systemLevelLabel?: string
  effectiveLevel?: string
  effectiveLevelLabel?: string
  strategyHint?: string
  ruleHits?: string[]
  reason?: string
  traceSummary?: string
  source?: string
  success?: boolean
  missingFields?: string[]
  overrideFlag?: boolean
  overrideReason?: string
  overrideBy?: string
  overrideTime?: string
  assessedAt?: string
}

/** 原始需求分页查询DTO */
export interface RawRequirementQueryDTO {
  page?: number
  size?: number
  status?: string
  priority?: string
  source?: string
  businessLineId?: number
  businessLine?: string
  registerName?: string
  projectManager?: string
  productManager?: string
  isUrgent?: number
  assigneeId?: number
  keyword?: string
  startDate?: string
  endDate?: string
  sortField?: string
  sortOrder?: string
}

/** 原始需求列表VO */
export interface RawRequirementListVO {
  id: number
  reqNo: string
  title: string
  description: string
  source: string
  submitOrigin?: 'internal' | 'external'
  proposer: string
  projectName: string
  reqLink: string
  priority: string
  systemLevel?: string
  effectiveLevel?: string
  strategyHint?: string
  overrideFlag?: number
  status: string
  statusName: string
  assigneeName: string
  businessLineName: string
  businessLine: string
  registerName: string
  productDefinition: string
  productManager: string
  projectManager: string
  isUrgent: number
  urgentReason: string
  expectedOnlineDate: string
  valueAssessment: string
  reqType: string
  expectedDate: string
  isNonFunctional: number
  remark: string
  createTime: string
  updateTime: string
  linkedProducts?: ProductRequirementListVO[]
  supplements?: SupplementVO[]
}

/** 原始需求详情VO */
export interface RawRequirementDetailVO {
  id: number
  reqNo: string
  title: string
  description: string
  source: string
  submitOrigin?: 'internal' | 'external'
  proposer: string
  proposerContact: string
  projectName: string
  reqLink: string
  priority: string
  systemLevel?: string
  effectiveLevel?: string
  strategyHint?: string
  ruleHits?: string
  explanationSummary?: string
  missingFields?: string
  overrideFlag?: number
  overrideReason?: string
  overrideBy?: number
  overrideTime?: string
  status: string
  statusName: string
  assigneeId: number
  assigneeName: string
  businessLineId: number
  businessLineName: string
  businessLine: string
  registerName: string
  proposeTime: string
  productDefinition: string
  productManager: string
  projectManager: string
  isUrgent: number
  urgentReason: string
  expectedOnlineDate: string
  valueAssessment: string
  aiAssessmentContext?: string
  reqType: string
  expectedDate: string
  attachment: string
  remark: string
  isNonFunctional: number
  createByName: string
  createTime: string
  updateTime: string
  supplements: SupplementVO[]
  linkedProducts?: ProductRequirementListVO[]
  latestPriorityAssessment?: PriorityAssessmentVO
}

// ========== 产品需求 ==========

/** 产品需求创建DTO */
export interface ProductRequirementCreateDTO {
  title?: string
  description?: string
  priority?: string
  businessLineId?: number
  productModule?: string
  reqType?: string
  sprintId?: number
  workload?: string
  rawReqId?: number
  expectedDate?: string
  prdUrl?: string
  handler?: string
  creator?: string
  isDirect?: number
}

/** 产品需求更新DTO */
export interface ProductRequirementUpdateDTO {
  title?: string
  description?: string
  priority?: string
  businessLineId?: number
  productModule?: string
  reqType?: string
  sprintId?: number
  workload?: string
  expectedDate?: string
  actualOnlineDate?: string
  designDocUrl?: string
  valueScore?: number
  assigneeId?: number
  status?: string
  prdUrl?: string
  handler?: string
  creator?: string
  isDirect?: number
}

/** 产品需求分页查询DTO */
export interface ProductRequirementQueryDTO {
  page?: number
  size?: number
  status?: string
  priority?: string
  businessLineId?: number
  assigneeId?: number
  sprintId?: number
  keyword?: string
  reqType?: string
  handler?: string
  unscheduled?: boolean
  groupByBusinessLine?: boolean
}

/** 产品需求列表VO */
export interface ProductRequirementListVO {
  id: number
  reqNo: string
  title: string
  priority: string
  status: string
  statusName: string
  businessLineId: number
  businessLineName: string
  productModule: string
  reqType: string
  assigneeName: string
  sprintId: number
  sprintName: string
  workload: string
  valueScore: number
  expectedDate: string
  createTime: string
  description: string
  prdUrl: string
  handler: string
  creator: string
  isDirect: number
  rawReqId: number
  rawReqTitle: string
  createByName: string
}

/** 产品需求详情VO */
export interface ProductRequirementDetailVO {
  id: number
  reqNo: string
  title: string
  description: string
  priority: string
  status: string
  statusName: string
  businessLineId: number
  businessLineName: string
  productModule: string
  reqType: string
  sprintId: number
  sprintName: string
  workload: string
  valueScore: number
  assigneeId: number
  assigneeName: string
  rawReqId: number
  rawReqTitle: string
  expectedDate: string
  actualOnlineDate: string
  designDocUrl: string
  prdUrl: string
  handler: string
  creator: string
  isDirect: number
  createByName: string
  createTime: string
  updateTime: string
  supplements: SupplementVO[]
}

// ========== 公共DTO/VO ==========

/** 批量变更状态DTO */
export interface BatchStatusDTO {
  ids: number[]
  targetStatus: string
  remark?: string
}

/** 批量指派DTO */
export interface BatchAssignDTO {
  ids: number[]
  assigneeId: number
}

/** 评论创建DTO */
export interface CommentCreateDTO {
  content: string
  parentId?: number
}

/** 补充内容创建DTO */
export interface SupplementCreateDTO {
  supplementType: string
  content: string
  attachment?: string
}

/** 需求拆分DTO */
export interface SplitDTO {
  rawReqId: number
  items: SplitItem[]
}

/** 拆分产品需求项 */
export interface SplitItem {
  title?: string
  description?: string
  handler?: string
  priority?: string
  businessLineId?: number
  productModule?: string
  reqType?: string
}

/** 操作日志VO */
export interface RequirementLogVO {
  id: number
  operatorName: string
  action: string
  actionName: string
  fieldName: string
  oldValue: string
  newValue: string
  remark: string
  createTime: string
}

/** 评论VO */
export interface CommentVO {
  id: number
  content: string
  userName: string
  parentId: number
  createTime: string
}

/** 补充内容VO */
export interface SupplementVO {
  id: number
  supplementType: string
  supplementTypeName: string
  content: string
  attachment: string
  userName: string
  createTime: string
}

// ========== 常量映射 ==========

/** 原始需求统一状态 */
export type RawRequirementUnifiedStatus =
  | 'pending_judgement'
  | 'pending_split'
  | 'in_progress'
  | 'online'
  | 'closed'
  | 'suspended'
  | 'rejected'

export interface RawStatusOption {
  value: RawRequirementUnifiedStatus
  label: string
}

export const RAW_STATUS_OPTIONS: RawStatusOption[] = [
  { value: 'pending_judgement', label: '待判定' },
  { value: 'pending_split', label: '待拆分' },
  { value: 'in_progress', label: '开发中' },
  { value: 'online', label: '已上线' },
  { value: 'closed', label: '已关闭' },
  { value: 'suspended', label: '已挂起' },
  { value: 'rejected', label: '已拒绝' },
]

/** 原始需求状态标签 */
export const RAW_STATUS_MAP: Record<RawRequirementUnifiedStatus, string> = {
  pending_judgement: '待判定',
  pending_split: '待拆分',
  in_progress: '开发中',
  online: '已上线',
  closed: '已关闭',
  suspended: '已挂起',
  rejected: '已拒绝',
}

const RAW_STATUS_LEGACY_MAP: Record<string, RawRequirementUnifiedStatus> = {
  pending_judgement: 'pending_judgement',
  pending_evaluate: 'pending_judgement',
  evaluating: 'pending_judgement',
  pending_pm_eval: 'pending_judgement',
  pending_director: 'pending_judgement',
  pending_accept: 'pending_judgement',
  pending_pm_review: 'pending_judgement',
  pending_split: 'pending_split',
  accepted: 'pending_split',
  pending_leader_filter: 'pending_split',
  pending_design: 'pending_split',
  designed: 'pending_split',
  split: 'pending_split',
  in_progress: 'in_progress',
  designing: 'in_progress',
  developing: 'in_progress',
  testing: 'in_progress',
  waiting_confirm: 'in_progress',
  researching: 'in_progress',
  backlog: 'in_progress',
  pending_pm: 'in_progress',
  pending_confirm: 'in_progress',
  online: 'online',
  closed: 'closed',
  suspended: 'suspended',
  rejected: 'rejected',
  '待判定': 'pending_judgement',
  '待评估': 'pending_judgement',
  '评估中': 'pending_judgement',
  '待项目经理评估': 'pending_judgement',
  '待产品总监判定': 'pending_judgement',
  '待总监判定': 'pending_judgement',
  '待拆分': 'pending_split',
  '待承接': 'pending_split',
  '已承接': 'pending_split',
  '待组长过滤': 'pending_split',
  '待设计': 'pending_split',
  '已设计': 'pending_split',
  '已拆分': 'pending_split',
  '已拆分待跟进': 'pending_split',
  '开发中': 'in_progress',
  '设计中': 'in_progress',
  '测试中': 'in_progress',
  '调研中': 'in_progress',
  '待产品经理接手': 'in_progress',
  '待办需求': 'in_progress',
  '信息待补充': 'in_progress',
  '待补充': 'in_progress',
  '已上线': 'online',
  '上线': 'online',
  '已关闭': 'closed',
  '关闭': 'closed',
  '已挂起': 'suspended',
  '挂起': 'suspended',
  '已拒绝': 'rejected',
  '拒绝': 'rejected',
  '验收不通过': 'rejected',
}

export function normalizeRawRequirementStatus(status?: string, statusName?: string): RawRequirementUnifiedStatus {
  const candidates = [status, statusName]
    .map((item) => item?.trim())
    .filter(Boolean) as string[]

  for (const candidate of candidates) {
    const direct = RAW_STATUS_LEGACY_MAP[candidate]
    if (direct) return direct

    const lower = candidate.toLowerCase()
    const normalized = RAW_STATUS_LEGACY_MAP[lower]
    if (normalized) return normalized
  }

  return 'pending_judgement'
}

export function getRawRequirementStatusLabel(status?: string, statusName?: string): string {
  const unified = normalizeRawRequirementStatus(status, statusName)
  return RAW_STATUS_MAP[unified]
}

export function getRawRequirementStatusClass(status?: string, statusName?: string): string {
  const unified = normalizeRawRequirementStatus(status, statusName)
  const classMap: Record<RawRequirementUnifiedStatus, string> = {
    pending_judgement: 'status-pending',
    pending_split: 'status-split',
    in_progress: 'status-progress',
    online: 'status-online',
    closed: 'status-closed',
    suspended: 'status-suspended',
    rejected: 'status-rejected',
  }
  return classMap[unified]
}

/** 产品需求状态 */
export const PRODUCT_STATUS_MAP: Record<string, string> = {
  pending_design: '待设计',
  designing: '设计中',
  developing: '开发中',
  online: '已上线',
  suspended: '已挂起',
  closed: '已关闭',
}

/** 优先级 */
export const PRIORITY_MAP: Record<string, string> = {
  P0: '一级A类（P0）',
  P1: '一级B类（P1）',
  P2: '二级（P2）',
  P3: '三级（P3）',
}

/** 需求来源 */
export const SOURCE_MAP: Record<string, string> = {
  market: '市场部',
  customer_service: '客服',
  implementation: '实施',
  internal: '内部',
  external: '外部提报',
}

/** 需求类型 */
export const REQ_TYPE_MAP: Record<string, string> = {
  feature: '功能',
  optimization: '优化',
  defect: '缺陷',
  other: '其他',
}

/** 补充类型 */
export const SUPPLEMENT_TYPE_MAP: Record<string, string> = {
  customer_background: '客户背景',
  tech_detail: '技术细节',
  scope_clarify: '范围澄清',
  other: '其他',
}

/** 优先级标签颜色 */
export const PRIORITY_TAG_TYPE: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger' | undefined> = {
  P0: 'danger',
  P1: 'warning',
  P2: undefined,
  P3: 'info',
}

/** 原始需求状态标签颜色 */
export const RAW_STATUS_TAG_TYPE: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger' | undefined> = {
  pending_judgement: 'info',
  pending_split: 'warning',
  in_progress: undefined,
  online: 'success',
  suspended: 'info',
  rejected: 'danger',
  closed: 'info',
}

/** 产品需求状态标签颜色 */
export const PRODUCT_STATUS_TAG_TYPE: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger' | undefined> = {
  pending_design: 'info',
  designing: 'warning',
  developing: undefined,
  online: 'success',
  suspended: 'info',
  closed: 'info',
}

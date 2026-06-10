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

/** 原始需求状态 */
export const RAW_STATUS_MAP: Record<string, string> = {
  pending_evaluate: '待评估',
  evaluating: '评估中',
  pending_accept: '待承接',
  accepted: '已承接',
  rejected: '已拒绝',
  split: '已拆分',
  closed: '已关闭',
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
  pending_evaluate: 'info',
  evaluating: 'warning',
  pending_accept: undefined,
  accepted: 'success',
  rejected: 'danger',
  split: 'success',
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

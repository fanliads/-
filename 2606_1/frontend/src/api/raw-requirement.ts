import { get, post, put, del } from '@/utils/request'
import type {
  RawRequirementCreateDTO,
  RawRequirementUpdateDTO,
  RawRequirementQueryDTO,
  RawRequirementListVO,
  RawRequirementDetailVO,
  BatchStatusDTO,
  BatchAssignDTO,
  CommentCreateDTO,
  SupplementCreateDTO,
  RequirementLogVO,
  CommentVO,
  SupplementVO,
  SplitDTO,
  ProductRequirementListVO,
  PriorityAssessmentContextDTO,
  PriorityAssessmentVO,
  PageResult,
  ApiResponse,
} from '@/types/requirement'

const BASE_URL = 'raw-requirements'

/** 创建原始需求 */
export function createRawRequirement(data: RawRequirementCreateDTO) {
  return post<ApiResponse<number>>(`/${BASE_URL}`, data)
}

/** 获取原始需求详情 */
export function getRawRequirementDetail(id: number) {
  return get<ApiResponse<RawRequirementDetailVO>>(`/${BASE_URL}/${id}`)
}

/** 更新原始需求 */
export function updateRawRequirement(id: number, data: RawRequirementUpdateDTO) {
  return put<ApiResponse<void>>(`/${BASE_URL}/${id}`, data)
}

/** 删除原始需求 */
export function deleteRawRequirement(id: number) {
  return del<ApiResponse<void>>(`/${BASE_URL}/${id}`)
}

/** 分页查询原始需求 */
export function pageQueryRawRequirements(params: RawRequirementQueryDTO) {
  return get<ApiResponse<PageResult<RawRequirementListVO>>>(`/${BASE_URL}/page`, { params })
}

/** 批量变更状态 */
export function batchChangeStatus(data: BatchStatusDTO) {
  return post<ApiResponse<void>>(`/${BASE_URL}/batch/status`, data)
}

/** 批量指派 */
export function batchAssign(data: BatchAssignDTO) {
  return post<ApiResponse<void>>(`/${BASE_URL}/batch/assign`, data)
}

/** 获取操作日志 */
export function getRawRequirementLogs(id: number) {
  return get<ApiResponse<RequirementLogVO[]>>(`/${BASE_URL}/${id}/logs`)
}

/** 获取评论列表 */
export function getRawRequirementComments(id: number) {
  return get<ApiResponse<CommentVO[]>>(`/${BASE_URL}/${id}/comments`)
}

/** 添加评论 */
export function addRawRequirementComment(id: number, data: CommentCreateDTO) {
  return post<ApiResponse<void>>(`/${BASE_URL}/${id}/comments`, data)
}

/** 获取补充内容列表 */
export function getRawRequirementSupplements(id: number) {
  return get<ApiResponse<SupplementVO[]>>(`/${BASE_URL}/${id}/supplements`)
}

/** 添加补充内容 */
export function addRawRequirementSupplement(id: number, data: SupplementCreateDTO) {
  return post<ApiResponse<void>>(`/${BASE_URL}/${id}/supplements`, data)
}

/** 需求拆分 */
export function splitRawRequirement(id: number, data: SplitDTO) {
  return post<ApiResponse<ProductRequirementListVO[]>>(`/${BASE_URL}/${id}/split`, data)
}

export function reassessRawRequirementPriority(id: number, context?: PriorityAssessmentContextDTO) {
  return post<ApiResponse<PriorityAssessmentVO>>(`/${BASE_URL}/${id}/priority-assessment`, { context })
}

export function overrideRawRequirementPriority(id: number, data: { effectiveLevel: string; overrideReason: string }) {
  return post<ApiResponse<void>>(`/${BASE_URL}/${id}/priority-override`, data)
}

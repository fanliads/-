import { get, post, put, del } from '@/utils/request'
import type {
  ProductRequirementCreateDTO,
  ProductRequirementUpdateDTO,
  ProductRequirementQueryDTO,
  ProductRequirementListVO,
  ProductRequirementDetailVO,
  SplitDTO,
  CommentCreateDTO,
  SupplementCreateDTO,
  RequirementLogVO,
  CommentVO,
  SupplementVO,
  PageResult,
  ApiResponse,
} from '@/types/requirement'

const BASE_URL = 'product-requirements'

/** 创建产品需求 */
export function createProductRequirement(data: ProductRequirementCreateDTO) {
  return post<ApiResponse<number>>(`/${BASE_URL}`, data)
}

/** 获取产品需求详情 */
export function getProductRequirementDetail(id: number) {
  return get<ApiResponse<ProductRequirementDetailVO>>(`/${BASE_URL}/${id}`)
}

/** 更新产品需求 */
export function updateProductRequirement(id: number, data: ProductRequirementUpdateDTO) {
  return put<ApiResponse<void>>(`/${BASE_URL}/${id}`, data)
}

/** 删除产品需求 */
export function deleteProductRequirement(id: number) {
  return del<ApiResponse<void>>(`/${BASE_URL}/${id}`)
}

export function voidProductRequirement(id: number, remark?: string) {
  return post<ApiResponse<void>>(`/${BASE_URL}/${id}/void`, { remark })
}

/** 分页查询产品需求 */
export function pageQueryProductRequirements(params: ProductRequirementQueryDTO) {
  return get<ApiResponse<PageResult<ProductRequirementListVO>>>(`/${BASE_URL}/page`, { params })
}

/** 按业务线分组查询产品需求 */
export function groupedQueryProductRequirements(params: ProductRequirementQueryDTO) {
  return get<ApiResponse<Record<string, ProductRequirementListVO[]>>>(`/${BASE_URL}/grouped`, { params })
}

/** 需求拆分 */
export function splitRequirement(data: SplitDTO) {
  return post<ApiResponse<void>>(`/${BASE_URL}/split`, data)
}

/** 获取操作日志 */
export function getProductRequirementLogs(id: number) {
  return get<ApiResponse<RequirementLogVO[]>>(`/${BASE_URL}/${id}/logs`)
}

/** 获取评论列表 */
export function getProductRequirementComments(id: number) {
  return get<ApiResponse<CommentVO[]>>(`/${BASE_URL}/${id}/comments`)
}

/** 添加评论 */
export function addProductRequirementComment(id: number, data: CommentCreateDTO) {
  return post<ApiResponse<void>>(`/${BASE_URL}/${id}/comments`, data)
}

/** 获取补充内容列表 */
export function getProductRequirementSupplements(id: number) {
  return get<ApiResponse<SupplementVO[]>>(`/${BASE_URL}/${id}/supplements`)
}

/** 添加补充内容 */
export function addProductRequirementSupplement(id: number, data: SupplementCreateDTO) {
  return post<ApiResponse<void>>(`/${BASE_URL}/${id}/supplements`, data)
}

/** 获取统计信息 */
export function getProductRequirementStats() {
  return get<ApiResponse<Record<string, any>>>(`/${BASE_URL}/stats`)
}

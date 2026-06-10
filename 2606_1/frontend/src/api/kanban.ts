import { get, put } from '@/utils/request'
import type { KanbanQuery, KanbanMoveData, KanbanColumn, RawRequirementVO, ProductRequirementVO } from '@/types/kanban'

/** 获取原始需求看板数据 */
export function getRawKanbanData(params: KanbanQuery) {
  return get<{ data: Record<string, RawRequirementVO[]> }>('/kanban/raw', { params })
}

/** 获取产品需求看板数据 */
export function getProductKanbanData(params: KanbanQuery) {
  return get<{ data: Record<string, ProductRequirementVO[]> }>('/kanban/product', { params })
}

/** 拖拽移动需求状态 */
export function moveRequirement(data: KanbanMoveData) {
  return put('/kanban/move', data)
}

/** 获取看板列配置 */
export function getKanbanColumns(reqType: string) {
  return get<{ data: KanbanColumn[] }>('/kanban/columns', { params: { reqType } })
}

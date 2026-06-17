export interface KanbanQuery {
  priority?: string
  businessLineId?: number
  assigneeId?: number
  sprintId?: number
  keyword?: string
}

export interface KanbanMoveData {
  reqType: string
  reqId: number
  fromStatus: string
  toStatus: string
}

export interface KanbanColumn {
  status: string
  statusName: string
  sortOrder: number
}

export interface RawRequirementVO {
  id: number
  reqNo: string
  title: string
  description?: string
  priority: string
  status: string
  statusName?: string
  source: string
  proposerName: string
  projectName?: string
  assigneeName: string
  businessLineName: string
  sprintName?: string
  productModule?: string
  expectedDate: string
  createTime: string
}

export interface ProductRequirementVO {
  id: number
  reqNo: string
  title: string
  description?: string
  priority: string
  status: string
  statusName?: string
  source?: string
  projectName?: string
  businessLineName: string
  productModule: string
  assigneeName: string
  sprintName: string
  workload: string
  expectedDate: string
  createTime: string
}

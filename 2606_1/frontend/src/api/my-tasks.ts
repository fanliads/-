import { get } from '@/utils/request'

export interface MyTaskVO {
  id: number
  reqType: string
  reqNo: string
  title: string
  priority: string
  status: string
  statusName: string
  actionRequired: string
  createTime: string
  updatedTime: string
}

export interface MyTaskPageResult {
  records: MyTaskVO[]
  total: number
  size: number
  current: number
  pages: number
}

export interface MyTaskStats {
  pendingCount: number
  todayDoneCount: number
  weekDoneCount: number
}

/** 获取待我处理列表 */
export function getPendingTasks(params: { page: number; size: number }) {
  return get<MyTaskPageResult>('/my-tasks/pending', { params })
}

/** 获取已处理列表 */
export function getDoneTasks(params: { page: number; size: number }) {
  return get<MyTaskPageResult>('/my-tasks/done', { params })
}

/** 获取待办统计 */
export function getMyTaskStats() {
  return get<MyTaskStats>('/my-tasks/stats')
}

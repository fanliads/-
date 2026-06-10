import { get, put } from '@/utils/request'

export interface NotificationVO {
  id: number
  title: string
  content: string
  type: string
  refType: string
  refId: number
  isRead: boolean
  createTime: string
}

export interface NotificationPageResult {
  records: NotificationVO[]
  total: number
  size: number
  current: number
  pages: number
}

/** 获取通知列表 */
export function getNotifications(params: { page: number; size: number; isRead?: boolean }) {
  return get<NotificationPageResult>('/notifications', { params })
}

/** 获取未读通知数量 */
export function getUnreadCount() {
  return get<number>('/notifications/unread-count')
}

/** 标记单条已读 */
export function markAsRead(id: number) {
  return put(`/notifications/${id}/read`)
}

/** 全部标记已读 */
export function markAllAsRead() {
  return put('/notifications/read-all')
}

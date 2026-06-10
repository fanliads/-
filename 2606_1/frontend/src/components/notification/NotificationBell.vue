<template>
  <el-popover
    placement="bottom-end"
    :width="360"
    trigger="click"
    @show="handlePopoverShow"
  >
    <template #reference>
      <el-badge :value="unreadCount" :hidden="unreadCount === 0" :max="99" class="notification-badge">
        <el-icon :size="20" class="bell-icon"><Bell /></el-icon>
      </el-badge>
    </template>

    <div class="notification-panel">
      <div class="panel-header">
        <span class="panel-title">通知</span>
        <el-button link type="primary" size="small" @click="handleReadAll">全部标记已读</el-button>
      </div>

      <div class="notification-list" v-loading="loading">
        <template v-if="notifications.length > 0">
          <div
            v-for="item in notifications"
            :key="item.id"
            class="notification-item"
            :class="{ unread: !item.isRead }"
            @click="handleNotificationClick(item)"
          >
            <div class="item-dot" v-if="!item.isRead"></div>
            <div class="item-content">
              <div class="item-title">{{ item.title }}</div>
              <div class="item-desc">{{ item.content }}</div>
              <div class="item-time">{{ formatTime(item.createTime) }}</div>
            </div>
          </div>
        </template>
        <div v-else class="empty-tip">暂无通知</div>
      </div>
    </div>
  </el-popover>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Bell } from '@element-plus/icons-vue'
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  type NotificationVO,
} from '@/api/notification'
import dayjs from 'dayjs'

const router = useRouter()

const unreadCount = ref(0)
const notifications = ref<NotificationVO[]>([])
const loading = ref(false)

let timer: ReturnType<typeof setInterval> | null = null

async function fetchUnreadCount() {
  try {
    const res = await getUnreadCount()
    unreadCount.value = (res as any).data || 0
  } catch {
    // ignore
  }
}

async function fetchNotifications() {
  loading.value = true
  try {
    const res = await getNotifications({ page: 1, size: 20 })
    const data = (res as any).data
    notifications.value = data?.records || []
  } catch {
    notifications.value = []
  } finally {
    loading.value = false
  }
}

async function handlePopoverShow() {
  await fetchNotifications()
}

async function handleNotificationClick(item: NotificationVO) {
  if (!item.isRead) {
    try {
      await markAsRead(item.id)
      item.isRead = true
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    } catch {
      // ignore
    }
  }

  // 跳转到对应需求
  if (item.refType && item.refId) {
    const routeMap: Record<string, string> = {
      raw: '/raw-pool',
      product: '/product-pool',
    }
    const path = routeMap[item.refType]
    if (path) {
      router.push(path)
    }
  }
}

async function handleReadAll() {
  try {
    await markAllAsRead()
    notifications.value.forEach((n) => (n.isRead = true))
    unreadCount.value = 0
  } catch {
    // ignore
  }
}

function formatTime(time: string) {
  if (!time) return ''
  return dayjs(time).format('MM-DD HH:mm')
}

onMounted(() => {
  fetchUnreadCount()
  // 轮询未读数
  timer = setInterval(fetchUnreadCount, 30000)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
})
</script>

<style lang="scss" scoped>
.notification-badge {
  cursor: pointer;

  .bell-icon {
    color: #666;
    cursor: pointer;

    &:hover {
      color: var(--el-color-primary);
    }
  }
}

.notification-panel {
  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 12px;
    border-bottom: 1px solid #ebeef5;

    .panel-title {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }
  }

  .notification-list {
    max-height: 400px;
    overflow-y: auto;
    margin: 0 -12px;
    padding: 0;

    .notification-item {
      display: flex;
      align-items: flex-start;
      padding: 12px;
      cursor: pointer;
      transition: background-color 0.2s;

      &:hover {
        background-color: #f5f7fa;
      }

      &.unread {
        background-color: #ecf5ff;

        &:hover {
          background-color: #d9ecff;
        }
      }

      .item-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: var(--el-color-primary);
        margin-top: 6px;
        margin-right: 10px;
        flex-shrink: 0;
      }

      .item-content {
        flex: 1;
        min-width: 0;

        .item-title {
          font-size: 14px;
          color: #303133;
          font-weight: 500;
          margin-bottom: 4px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .item-desc {
          font-size: 12px;
          color: #909399;
          margin-bottom: 4px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .item-time {
          font-size: 12px;
          color: #c0c4cc;
        }
      }
    }

    .empty-tip {
      text-align: center;
      padding: 32px 0;
      color: #c0c4cc;
      font-size: 14px;
    }
  }
}
</style>

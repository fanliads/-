<template>
  <LnPopover align="end" @update:open="handlePopoverOpen">
    <template #trigger>
      <LnButton class="bell-trigger" size="small" variant="ghost" icon-only :aria-label="bellLabel">
        <template #icon><svg class="bell-icon" viewBox="0 0 20 20" aria-hidden="true"><path d="M5.2 8.25a4.8 4.8 0 0 1 9.6 0c0 5.15 2.1 5.15 2.1 6.25H3.1c0-1.1 2.1-1.1 2.1-6.25Z"/><path d="M8.1 16.2a2.1 2.1 0 0 0 3.8 0"/></svg><span v-if="unreadCount" class="notification-count">{{ unreadCount > 99 ? '99+' : unreadCount }}</span></template>
      </LnButton>
    </template>

    <template #default="{ close }">
    <div class="notification-panel" aria-label="通知列表">
      <div class="panel-header">
        <div><span class="panel-title">通知</span><small>{{ unreadCount ? `${unreadCount} 条未读` : '已全部读完' }}</small></div>
        <LnButton v-if="unreadCount" variant="ghost" size="small" @click="handleReadAll">全部已读</LnButton>
      </div>

      <div class="notification-list">
        <template v-if="loading">
          <div v-for="index in 4" :key="index" class="notification-skeleton"><LnSkeleton width="9px" height="9px" circle /><div><LnSkeleton width="62%" /><LnSkeleton height="10px" /><LnSkeleton width="34%" height="9px" /></div></div>
        </template>
        <template v-else-if="notifications.length > 0">
          <LnPressable
            v-for="item in notifications"
            :key="item.id"
            class="notification-item"
            :class="{ unread: !item.isRead }"
            :selectable="false"
            :aria-label="`${item.title}，${item.content}`"
            @click="handleNotificationClick(item, close)"
          >
            <span class="item-dot" :class="{ 'is-hidden': item.isRead }"></span>
            <div class="item-content">
              <div class="item-title">{{ item.title }}</div>
              <div class="item-desc">{{ item.content }}</div>
              <div class="item-time">{{ formatTime(item.createTime) }}</div>
            </div>
          </LnPressable>
        </template>
        <LnEmptyState v-else title="暂无通知" description="新的需求动态和协作提醒会出现在这里。" compact><template #icon>✓</template></LnEmptyState>
      </div>
    </div>
    </template>
  </LnPopover>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { LnButton, LnEmptyState, LnPopover, LnPressable, LnSkeleton } from '@/components/linear'
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
const bellLabel = computed(() => unreadCount.value ? `通知，${unreadCount.value} 条未读` : '通知，无未读消息')

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

async function handlePopoverOpen(open: boolean) {
  if (open) await fetchNotifications()
}

async function handleNotificationClick(item: NotificationVO, close: () => void) {
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
      close()
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
.bell-trigger {
  position: relative;
}

.bell-icon { width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-linecap: round; stroke-linejoin: round; stroke-width: 1.45; }
.notification-count { position: absolute; top: -4px; right: -5px; min-width: 17px; height: 17px; padding: 0 4px; display: grid; place-items: center; border: 2px solid var(--ln-surface, #fff); border-radius: 9px; background: var(--ln-danger, #d05757); color: #fff; font: 650 9px/1 var(--ln-font); letter-spacing: -.02em; }

.notification-panel {
  width: 348px;
  max-width: calc(100vw - 32px);
  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 12px;
    border-bottom: 1px solid rgba(77, 63, 47, 0.08);

    > div { display: grid; gap: 2px; }
    .panel-title {
      font-size: 14px;
      font-weight: 620;
      color: var(--text-primary);
    }
    small { color: var(--text-tertiary); font-size: 10px; }
  }

  .notification-list {
    max-height: 400px;
    overflow-y: auto;
    margin: 0 -8px;
    padding: 8px 0 0;

    .notification-item {
      width: 100%;
      display: flex;
      align-items: flex-start;
      padding: 14px 12px;
      border-radius: 14px;
      border: 0;
      color: inherit;
      font: inherit;
      text-align: left;
      cursor: pointer;
      transition: var(--transition);

      &:hover {
        background-color: rgba(31, 107, 92, 0.05);
      }

      &.unread {
        background-color: rgba(31, 107, 92, 0.08);

        &:hover {
          background-color: rgba(31, 107, 92, 0.12);
        }
      }

      .item-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: var(--primary);
        margin-top: 6px;
        margin-right: 10px;
        flex-shrink: 0;
        &.is-hidden { visibility: hidden; }
      }

      .item-content {
        flex: 1;
        min-width: 0;

        .item-title {
          font-size: 14px;
          color: var(--text-primary);
          font-weight: 600;
          margin-bottom: 4px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .item-desc {
          font-size: 12px;
          color: var(--text-secondary);
          margin-bottom: 4px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .item-time {
          font-size: 12px;
          color: var(--text-tertiary);
        }
      }
    }

  }
}

.notification-skeleton { display: grid; grid-template-columns: 9px minmax(0, 1fr); gap: 10px; padding: 14px 12px; > div { display: grid; gap: 7px; } }
</style>

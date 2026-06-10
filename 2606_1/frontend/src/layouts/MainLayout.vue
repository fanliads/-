<template>
  <div class="layout">
    <!-- 侧边栏 -->
    <aside class="sidebar">
      <div class="logo">
        <span class="logo-icon">◇</span>
        需求管理
      </div>
      <nav class="nav">
        <template v-for="group in visibleMenuGroups" :key="group.title">
          <div class="nav-group-title">{{ group.title }}</div>
          <router-link
            v-for="item in group.items"
            :key="item.path"
            :to="item.path"
            class="nav-item"
            :class="{ active: isActive(item.path) }"
          >
            <span class="nav-icon" v-html="item.icon"></span>
            <span class="nav-text">{{ item.label }}</span>
          </router-link>
        </template>
      </nav>
      <div class="sidebar-footer">
        <div class="user-card" @click="handleCommand('profile')">
          <div class="user-avatar">{{ userInitial }}</div>
          <div class="user-info">
            <div class="user-name">{{ userName }}</div>
            <div class="user-role">{{ userRoleName }}</div>
          </div>
        </div>
        <div class="logout-btn" @click="handleCommand('logout')" title="退出登录">
          ⏻
        </div>
      </div>
    </aside>

    <!-- 主区域 -->
    <div class="main">
      <!-- 顶栏 -->
      <header class="header">
        <div class="header-left">
          <h1 class="page-title">{{ pageTitle }}</h1>
        </div>
        <div class="header-right">
          <NotificationBell />
          <div class="avatar">{{ userInitial }}</div>
        </div>
      </header>

      <!-- 内容区 -->
      <div class="content-scroll">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import NotificationBell from '@/components/notification/NotificationBell.vue'
import { ElMessageBox } from 'element-plus'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// SVG 图标
const icons = {
  kanban: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="2" width="4" height="12" rx="1"/><rect x="9" y="2" width="4" height="8" rx="1"/></svg>',
  inbox: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1.5" y="1.5" width="13" height="13" rx="1.5"/><path d="M1.5 10h4l1 2h3l1-2h4"/></svg>',
  package: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 1L14 4.5v7L8 15 2 11.5v-7L8 1z"/><line x1="8" y1="8" x2="8" y2="15"/><line x1="2" y1="4.5" x2="8" y2="8"/><line x1="14" y1="4.5" x2="8" y2="8"/></svg>',
  checkSquare: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1.5" y="1.5" width="13" height="13" rx="1.5"/><polyline points="4.5,8 7,10.5 11.5,5.5"/></svg>',
  plus: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="8" y1="2" x2="8" y2="14"/><line x1="2" y1="8" x2="14" y2="8"/></svg>',
  layers: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 2L1.5 5.5 8 9l6.5-3.5L8 2z"/><path d="M1.5 8.5L8 12l6.5-3.5"/><path d="M1.5 11.5L8 15l6.5-3.5"/></svg>',
  barChart: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="8" width="3.5" height="7" rx="0.5"/><rect x="6.25" y="4" width="3.5" height="11" rx="0.5"/><rect x="11.5" y="1" width="3.5" height="14" rx="0.5"/></svg>',
  settings: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="8" r="2.5"/><path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.4 3.4l1.4 1.4M11.2 11.2l1.4 1.4M3.4 12.6l1.4-1.4M11.2 4.8l1.4-1.4"/></svg>',
}

interface MenuItem {
  path: string
  icon: string
  label: string
  permission?: string
}

interface MenuGroup {
  title: string
  items: MenuItem[]
}

const menuGroups: MenuGroup[] = [
  {
    title: '需求管理',
    items: [
      { path: '/kanban', icon: icons.kanban, label: '看板视图' },
    ],
  },
  {
    title: '需求池',
    items: [
      { path: '/raw-pool', icon: icons.inbox, label: '原始需求', permission: 'raw-pool:view' },
      { path: '/product-pool', icon: icons.package, label: '产品需求', permission: 'product-pool:view' },
    ],
  },
  {
    title: '工作台',
    items: [
      { path: '/my-tasks', icon: icons.checkSquare, label: '我的待办', permission: 'my-tasks:view' },
      { path: '/submit', icon: icons.plus, label: '提交需求', permission: 'submit-form:add' },
    ],
  },
  {
    title: '管理',
    items: [
      { path: '/sprint', icon: icons.layers, label: '迭代管理', permission: 'sprint:view' },
      { path: '/dashboard', icon: icons.barChart, label: '数据看板', permission: 'dashboard:view' },
      { path: '/settings', icon: icons.settings, label: '系统设置', permission: 'system:view' },
    ],
  },
]

const visibleMenuGroups = computed(() =>
  menuGroups
    .map(group => ({
      ...group,
      items: group.items.filter(item => !item.permission || userStore.hasPermission(item.permission)),
    }))
    .filter(group => group.items.length > 0)
)



const userInitial = computed(() => userStore.userInfo?.realName?.charAt(0) || 'U')
const userName = computed(() => userStore.userInfo?.realName || '用户')
const userRoleName = computed(() => userStore.userInfo?.roleName || '成员')
const pageTitle = computed(() => (route.meta?.title as string) || '需求管理')

function isActive(path: string) {
  return route.path === path || route.path.startsWith(path + '/')
}

function handleCommand(command: string) {
  switch (command) {
    case 'profile':
      break
    case 'settings':
      router.push('/settings')
      break
    case 'logout':
      ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        userStore.logout()
      }).catch(() => {})
      break
  }
}
</script>

<style lang="scss" scoped>
.layout {
  display: flex;
  height: 100vh;
}

.sidebar {
  width: 220px;
  background: var(--surface);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  padding: 20px 0;
  flex-shrink: 0;
  overflow-y: auto;
}

.logo {
  padding: 0 24px 24px;
  font-size: 18px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--text-primary);

  .logo-icon {
    font-size: 22px;
    color: var(--primary);
  }
}

.nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 0;
}

.nav-group-title {
  font-size: 12px;
  color: var(--text-tertiary, #86868b);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 20px 24px 8px;
}

.nav-item {
  padding: 10px 24px;
  border-radius: 8px;
  margin: 2px 12px;
  font-size: 14px;
  color: var(--text-secondary);
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.2s;

  &:hover {
    background: rgba(0, 0, 0, 0.03);
  }

  &.active {
    background: rgba(0, 113, 227, 0.08);
    color: var(--primary, #0071e3);
    font-weight: 500;
  }

  .nav-icon {
    font-size: 16px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
  }

  .nav-text {
    white-space: nowrap;
  }
}

.sidebar-footer {
  padding: 16px 12px 0;
  border-top: 1px solid var(--border);
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.user-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  flex: 1;

  &:hover {
    background: rgba(0, 0, 0, 0.03);
  }
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--primary);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}

.user-info {
  min-width: 0;
}

.user-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-role {
  font-size: 11px;
  color: var(--text-secondary);
}

.logout-btn {
  font-size: 16px;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  color: var(--text-secondary);
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 59, 48, 0.08);
    color: var(--danger);
  }
}

.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.header {
  height: 64px;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
}

.page-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}



.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #e8e8ed;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
}

.content-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 24px 32px;
  background: var(--bg);
}
</style>

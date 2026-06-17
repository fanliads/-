<template>
  <div class="layout">
    <aside class="sidebar">
      <div class="sidebar-shell">
        <div class="logo">
          <div class="logo-mark">
            <span class="logo-icon">◇</span>
          </div>
          <div>
            <div class="logo-title">需求管理中枢</div>
            <div class="logo-subtitle">Requirement Studio</div>
          </div>
        </div>

        <div class="workspace-card">
          <div class="workspace-label">当前视图</div>
          <div class="workspace-title">{{ pageTitle }}</div>
          <div class="workspace-meta">{{ pageDescription }}</div>
        </div>

        <nav class="nav">
          <template v-for="group in visibleMenuGroups" :key="group.title">
            <div class="nav-group">
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
                <span v-if="isActive(item.path)" class="nav-indicator"></span>
              </router-link>
            </div>
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
          <button class="logout-btn" @click="handleCommand('logout')" title="退出登录">
            ⏻
          </button>
        </div>
      </div>
    </aside>

    <div class="main">
      <header class="header">
        <div class="header-left">
          <div class="page-copy">
            <div class="eyebrow">需求流程工作台</div>
            <h1 class="page-title">{{ pageTitle }}</h1>
            <p class="page-subtitle">{{ pageDescription }}</p>
          </div>
        </div>
        <div class="header-right">
          <div class="header-status">
            <span class="status-dot"></span>
            <span>在线协同中</span>
          </div>
          <NotificationBell />
          <div class="avatar" :title="userName">{{ userInitial }}</div>
        </div>
      </header>

      <div class="content-scroll">
        <div class="content-shell">
          <router-view />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/store/user'
import NotificationBell from '@/components/notification/NotificationBell.vue'
import { ElMessageBox } from 'element-plus'

const route = useRoute()
const userStore = useUserStore()

// SVG 图标
const icons = {
  kanban: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="2" width="4" height="12" rx="1"/><rect x="9" y="2" width="4" height="8" rx="1"/></svg>',
  inbox: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1.5" y="1.5" width="13" height="13" rx="1.5"/><path d="M1.5 10h4l1 2h3l1-2h4"/></svg>',
  package: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 1L14 4.5v7L8 15 2 11.5v-7L8 1z"/><line x1="8" y1="8" x2="8" y2="15"/><line x1="2" y1="4.5" x2="8" y2="8"/><line x1="14" y1="4.5" x2="8" y2="8"/></svg>',
  checkSquare: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1.5" y="1.5" width="13" height="13" rx="1.5"/><polyline points="4.5,8 7,10.5 11.5,5.5"/></svg>',
  layers: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 2L1.5 5.5 8 9l6.5-3.5L8 2z"/><path d="M1.5 8.5L8 12l6.5-3.5"/><path d="M1.5 11.5L8 15l6.5-3.5"/></svg>',
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
    ],
  },
  {
    title: '管理',
    items: [
      { path: '/sprint', icon: icons.layers, label: '迭代管理', permission: 'sprint:view' },
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
const pageDescriptionMap: Record<string, string> = {
  '/kanban': '聚焦推进节奏，快速切换需求状态与负责人视角。',
  '/raw-pool': '从原始输入到初筛承接，把混乱信息整理成可推进事项。',
  '/product-pool': '汇总产品侧拆分结果，持续跟进排期、状态与交付材料。',
  '/my-tasks': '把当前需要你推动的事项集中到一个可执行列表里。',
  '/sprint': '围绕迭代目标管理范围、节奏和版本承诺。',
}
const pageDescription = computed(() => pageDescriptionMap[route.path] || '统一管理需求输入、拆分、排期与推进过程。')

function isActive(path: string) {
  return route.path === path || route.path.startsWith(path + '/')
}

function handleCommand(command: string) {
  switch (command) {
    case 'profile':
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
  padding: 18px;
  gap: 18px;
  background:
    radial-gradient(circle at 0% 0%, rgba(214, 139, 61, 0.1), transparent 28%),
    radial-gradient(circle at 100% 0%, rgba(31, 107, 92, 0.12), transparent 24%),
    linear-gradient(180deg, #fbf7f1 0%, #f4f1ea 100%);
}

.sidebar {
  width: 280px;
  flex-shrink: 0;
}

.sidebar-shell {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px 18px;
  background: linear-gradient(180deg, rgba(32, 43, 38, 0.98) 0%, rgba(27, 35, 32, 0.95) 100%);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 28px;
  box-shadow: 0 26px 60px rgba(23, 22, 18, 0.2);
  overflow: hidden;
}

.logo {
  display: flex;
  align-items: center;
  gap: 14px;
  color: #f7f3ec;
  padding: 8px 6px 20px;

  .logo-title {
    font-size: 18px;
    font-weight: 700;
    letter-spacing: 0.01em;
  }

  .logo-subtitle {
    font-size: 12px;
    margin-top: 3px;
    color: rgba(255, 249, 239, 0.58);
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
}

.logo-mark {
  width: 46px;
  height: 46px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(214, 139, 61, 0.28), rgba(31, 107, 92, 0.22));
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);

  .logo-icon {
    font-size: 22px;
    color: #ffe7c4;
  }
}

.workspace-card {
  padding: 18px;
  border-radius: 22px;
  background: linear-gradient(180deg, rgba(255, 247, 235, 0.12) 0%, rgba(255, 247, 235, 0.04) 100%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  margin-bottom: 20px;
}

.workspace-label {
  font-size: 11px;
  color: rgba(255, 249, 239, 0.56);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  margin-bottom: 8px;
}

.workspace-title {
  font-size: 18px;
  color: #fff8ef;
  font-weight: 700;
  margin-bottom: 8px;
}

.workspace-meta {
  font-size: 13px;
  color: rgba(255, 249, 239, 0.68);
  line-height: 1.6;
}

.nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-height: 0;
  overflow-y: auto;
  padding-right: 4px;
}

.nav-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.nav-group-title {
  font-size: 12px;
  color: rgba(255, 249, 239, 0.46);
  font-weight: 600;
  letter-spacing: 0.12em;
  padding: 0 10px 6px;
}

.nav-item {
  position: relative;
  padding: 12px 14px;
  border-radius: 16px;
  font-size: 14px;
  color: rgba(255, 249, 239, 0.7);
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: var(--transition);

  &:hover {
    background: rgba(255, 255, 255, 0.06);
    color: #fffaf2;
  }

  &.active {
    background: linear-gradient(135deg, rgba(255, 247, 235, 0.14) 0%, rgba(214, 139, 61, 0.14) 100%);
    color: #fff9ef;
    font-weight: 600;
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.06);
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

.nav-indicator {
  margin-left: auto;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ffd9a4;
  box-shadow: 0 0 0 6px rgba(255, 217, 164, 0.1);
}

.sidebar-footer {
  padding-top: 18px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  margin-top: auto;
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 16px;
  cursor: pointer;
  transition: var(--transition);
  flex: 1;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.06);

  &:hover {
    background: rgba(255, 255, 255, 0.08);
  }
}

.user-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent) 0%, #f1c48c 100%);
  color: #4d3724;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  flex-shrink: 0;
}

.user-info {
  min-width: 0;
}

.user-name {
  font-size: 13px;
  font-weight: 600;
  color: #fff7ed;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-role {
  font-size: 11px;
  color: rgba(255, 249, 239, 0.56);
}

.logout-btn {
  width: 42px;
  height: 42px;
  border: none;
  background: rgba(255, 255, 255, 0.05);
  font-size: 16px;
  cursor: pointer;
  border-radius: 14px;
  color: rgba(255, 249, 239, 0.62);
  transition: var(--transition);

  &:hover {
    background: rgba(212, 92, 71, 0.12);
    color: #ffd8ce;
  }
}

.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: rgba(255, 251, 245, 0.72);
  border-radius: 32px;
  border: 1px solid rgba(255, 255, 255, 0.56);
  box-shadow: var(--shadow-hover);
  backdrop-filter: blur(14px);
  overflow: hidden;
}

.header {
  min-height: 88px;
  background: rgba(255, 252, 247, 0.68);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 32px;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
}

.page-copy {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.eyebrow {
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-tertiary);
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  font-family: var(--font-family-accent);
  line-height: 1.15;
}

.page-subtitle {
  font-size: 13px;
  color: var(--text-secondary);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 14px;
}

.header-status {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.74);
  border: 1px solid rgba(77, 63, 47, 0.08);
  color: var(--text-secondary);
  font-size: 12px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--success);
  box-shadow: 0 0 0 6px rgba(47, 143, 99, 0.12);
}

.avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: linear-gradient(135deg, #20483f 0%, var(--primary) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  color: #fff8ef;
  box-shadow: 0 10px 20px rgba(31, 107, 92, 0.16);
}

.content-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 26px 32px 32px;
  background:
    radial-gradient(circle at top left, rgba(214, 139, 61, 0.07), transparent 24%),
    linear-gradient(180deg, rgba(251, 247, 241, 0.66) 0%, rgba(244, 241, 234, 0.55) 100%);
}

.content-shell {
  min-height: 100%;
}

@media (max-width: 1100px) {
  .layout {
    padding: 12px;
    gap: 12px;
  }

  .sidebar {
    width: 244px;
  }

  .page-title {
    font-size: 24px;
  }
}

@media (max-width: 900px) {
  .layout {
    flex-direction: column;
    height: auto;
    min-height: 100vh;
  }

  .sidebar {
    width: 100%;
  }

  .sidebar-shell {
    padding-bottom: 16px;
  }

  .nav {
    overflow: visible;
  }

  .main {
    min-height: 0;
  }

  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 14px;
  }

  .header-right {
    width: 100%;
    justify-content: space-between;
  }
}
</style>

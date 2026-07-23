<template>
  <div class="workbench-layout" :class="{ collapsed: sidebarCollapsed }">
    <aside class="sidebar">
      <div class="sidebar-head">
        <LnWorkspaceSwitcher name="需求中枢" subtitle="产品与项目协作" :collapsed="sidebarCollapsed" @click="router.push('/raw-pool')" />

        <LnButton
          size="small" icon-only variant="ghost"
          :title="sidebarCollapsed ? '展开侧边栏' : '收起侧边栏'"
          @click="toggleSidebar"
        >
          <template #icon><LnIcon :name="sidebarCollapsed ? 'chevron-right' : 'chevron-left'" /></template>
        </LnButton>
      </div>

      <nav class="sidebar-nav" aria-label="主导航">
        <section
          v-for="group in visibleMenuGroups"
          :key="group.title"
          class="nav-group"
        >
          <div v-if="!sidebarCollapsed" class="nav-group-title">{{ group.title }}</div>
          <div v-else class="nav-group-mini">{{ group.miniTitle }}</div>

          <LnNavItem
            v-for="item in group.items"
            :key="item.path"
            :to="item.path"
            :icon="item.icon" :label="item.label" :badge="item.badge"
            :active="isActive(item.path)" :collapsed="sidebarCollapsed"
          />
        </section>
      </nav>

      <div class="sidebar-footer">
        <LnButton
          class="sidebar-utility"
          :class="{ compact: sidebarCollapsed }"
          size="small"
          variant="ghost"
          :icon-only="sidebarCollapsed"
          aria-label="设置"
          :title="sidebarCollapsed ? '设置' : ''"
          @click="handleCommand('settings')"
        >
          <template #icon><span class="utility-icon">◎</span></template>
          <span v-if="!sidebarCollapsed">设置</span>
        </LnButton>

        <LnButton
          class="sidebar-utility"
          :class="{ compact: sidebarCollapsed }"
          size="small"
          variant="ghost"
          :icon-only="sidebarCollapsed"
          aria-label="退出登录"
          :title="sidebarCollapsed ? '退出登录' : ''"
          @click="handleCommand('logout')"
        >
          <template #icon><LnIcon name="external-link"/></template>
          <span v-if="!sidebarCollapsed">退出登录</span>
        </LnButton>

        <LnUserButton
          :name="userName"
          :description="userRoleName"
          :compact="sidebarCollapsed"
          @click="handleCommand('profile')"
        />
      </div>
    </aside>

    <main class="main-shell">
      <header class="topbar">
        <div class="topbar-copy">
          <LnBreadcrumbs :items="shellBreadcrumbs" />
        </div>

        <div class="topbar-actions">
          <LnTooltip text="全局命令" shortcut="⌘ K"><LnButton size="small" variant="ghost" @click="commandOpen = true"><template #icon><LnIcon name="search" /></template>搜索</LnButton></LnTooltip>
          <router-link
            v-if="canCreateRaw && route.path !== '/submit' && !['/raw-pool', '/product-pool'].includes(route.path)"
            to="/submit"
            class="primary-action"
          >
            新建需求
          </router-link>

          <NotificationBell />

          <LnPopover align="end"><template #trigger><LnUserButton :name="userName" compact /></template><LnMenu :items="userMenuItems" @select="handleUserMenu" /></LnPopover>
        </div>
      </header>

      <section class="page-shell">
        <router-view />
      </section>
    </main>
    <LnCommandMenu :open="commandOpen" :items="shellCommands" @close="commandOpen = false" @select="handleShellCommand" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import NotificationBell from '@/components/notification/NotificationBell.vue'
import { useUserStore } from '@/store/user'
import { LnBreadcrumbs, LnButton, LnCommandMenu, LnIcon, LnMenu, LnNavItem, LnPopover, LnTooltip, LnUserButton, LnWorkspaceSwitcher, lnConfirm, type LnBreadcrumbItem } from '@/components/linear'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const STORAGE_KEY = 'workbench-sidebar-collapsed'
const commandOpen = ref(false)

const icons = {
  home: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.45"><path d="M2.2 6.2 8 1.8l5.8 4.4"/><path d="M3.3 5.8v7.4h9.4V5.8"/></svg>',
  bell: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.45"><path d="M8 13.6a1.8 1.8 0 0 0 1.7-1.2H6.3A1.8 1.8 0 0 0 8 13.6Z"/><path d="M12.4 10.8V7.1A4.4 4.4 0 1 0 3.6 7.1v3.7l-1.1 1.1h11l-1.1-1.1Z"/></svg>',
  raw: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.45"><rect x="2" y="2" width="12" height="12" rx="2"/><path d="M5 5.5h6"/><path d="M5 8h6"/><path d="M5 10.5h4"/></svg>',
  product: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.45"><path d="M8 1.7 13.7 4.8v6.4L8 14.3l-5.7-3.1V4.8L8 1.7Z"/><path d="M8 7.8v6.5"/><path d="M2.3 4.8 8 7.8l5.7-3"/></svg>',
  board: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.45"><rect x="2" y="2" width="3.4" height="12" rx="1"/><rect x="6.9" y="2" width="3.4" height="8.8" rx="1"/><rect x="11.8" y="2" width="2.2" height="5.4" rx="1"/></svg>',
  mine: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.45"><path d="M8 8.2a2.8 2.8 0 1 0 0-5.6 2.8 2.8 0 0 0 0 5.6Z"/><path d="M3.1 13.3c.7-2 2.5-3.1 4.9-3.1 2.4 0 4.2 1.1 4.9 3.1"/></svg>',
  sprint: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.45"><path d="M8 2.2a5.8 5.8 0 1 0 5.8 5.8"/><path d="M8 4.2v4l2.6 1.6"/><path d="M11 1.8h3v3"/></svg>',
}

interface MenuItem {
  path: string
  icon: string
  label: string
  compactLabel: string
  badge?: string
  permission?: string
}

interface MenuGroup {
  title: string
  miniTitle: string
  items: MenuItem[]
}

const menuGroups: MenuGroup[] = [
  {
    title: '个人',
    miniTitle: '我',
    items: [
      { path: '/my-tasks', icon: icons.home, label: '我的工作', compactLabel: '我的', permission: 'my-tasks:view' },
    ],
  },
  {
    title: '需求',
    miniTitle: '需',
    items: [
      { path: '/raw-pool', icon: icons.raw, label: '原始需求', compactLabel: '原始', permission: 'raw-pool:view' },
      { path: '/product-pool', icon: icons.product, label: '产品需求', compactLabel: '产品', permission: 'product-pool:view' },
    ],
  },
  {
    title: '视图',
    miniTitle: '视',
    items: [
      { path: '/kanban', icon: icons.board, label: '看板视图', compactLabel: '看板' },
      { path: '/sprint', icon: icons.sprint, label: '迭代', compactLabel: '迭代', permission: 'sprint:view' },
    ],
  },
]

const sidebarCollapsed = ref(false)

if (typeof window !== 'undefined') {
  sidebarCollapsed.value = localStorage.getItem(STORAGE_KEY) === '1'
}

const visibleMenuGroups = computed(() =>
  menuGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => !item.permission || userStore.hasPermission(item.permission)),
    }))
    .filter((group) => group.items.length > 0),
)

const userName = computed(() => userStore.userInfo?.realName || '用户')
const userRoleName = computed(() => userStore.userInfo?.roleName || '成员')
const canCreateRaw = computed(() => userStore.hasPermission('submit-form:add') || userStore.hasPermission('raw-pool:add'))
const userMenuItems = computed(() => [
  { label:'个人信息',value:'profile',icon: 'user',description:userName.value },
  { label:'系统设置',value:'settings',icon:'◎' },
  { label:'退出登录',value:'logout',icon: 'external-link',danger:true,separatorBefore:true },
])
const shellCommands = computed(() => visibleMenuGroups.value.flatMap(group => group.items.map(item => ({ label:`打开${item.label}`,value:item.path,icon: 'external-link',description:group.title }))).concat(canCreateRaw.value?[{label:'新建原始需求',value:'/submit',icon: 'plus',description:'需求'}]:[]))

const currentSectionLabel = computed(() => {
  const matchedGroup = visibleMenuGroups.value.find((group) =>
    group.items.some((item) => isActive(item.path)),
  )
  return matchedGroup?.title || '工作台'
})
const shellBreadcrumbs = computed<LnBreadcrumbItem[]>(() => [
  { label: '需求中枢', to: '/raw-pool' },
  { label: currentSectionLabel.value },
])

watch(
  sidebarCollapsed,
  (value) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, value ? '1' : '0')
    }
  },
  { immediate: true },
)

function isActive(path: string) {
  return route.path === path || route.path.startsWith(path + '/')
}

function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

async function handleCommand(command: 'profile' | 'settings' | 'logout') {
  if (command === 'profile') {
    return
  }

  if (command === 'settings') {
    router.push('/settings')
    return
  }

  try {
    await lnConfirm({
      title: '退出登录',
      message: '确定要退出当前账号吗？未保存的页面内容可能会丢失。',
      confirmText: '退出登录',
      cancelText: '取消',
      tone: 'warning',
    })
  } catch {
    return
  }
  await userStore.logout()
  router.push('/login')
}

function handleUserMenu(item: { value: string }) {
  if (item.value === 'profile' || item.value === 'settings' || item.value === 'logout') handleCommand(item.value)
}

function handleShellCommand(item: { value: string }) { router.push(item.value) }
function handleGlobalCommand(event: KeyboardEvent) { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); commandOpen.value = true } }
onMounted(() => window.addEventListener('keydown', handleGlobalCommand))
onUnmounted(() => window.removeEventListener('keydown', handleGlobalCommand))
</script>

<style lang="scss" scoped>
.workbench-layout {
  display: grid;
  grid-template-columns: 248px minmax(0, 1fr);
  min-height: 100vh;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.72) 0%, rgba(255, 255, 255, 0) 18%),
    linear-gradient(180deg, #fbfcfd 0%, #f6f7f8 100%);
  color: var(--text-primary);
}

.workbench-layout.collapsed {
  grid-template-columns: 88px minmax(0, 1fr);
}

.sidebar {
  position: sticky;
  top: 0;
  height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 14px 12px 12px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.88) 0%, rgba(245, 247, 250, 0.86) 100%);
  border-right: 1px solid rgba(17, 24, 39, 0.05);
  backdrop-filter: blur(18px);
}

.sidebar-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.brand {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: inherit;
}

.brand-mark {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border-radius: 11px;
  background: linear-gradient(180deg, #111827 0%, #1f2937 100%);
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.08em;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.14);
}

.brand-copy {
  min-width: 0;
}

.brand-title {
  font-size: 15px;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.brand-subtitle {
  margin-top: 2px;
  font-size: 11px;
  color: var(--text-tertiary);
}

.chrome-btn {
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
  border: 1px solid rgba(17, 24, 39, 0.06);
  background: rgba(255, 255, 255, 0.92);
  color: var(--text-secondary);
  cursor: pointer;
  transition: 0.2s ease;

  &:hover {
    color: var(--text-primary);
    background: #fff;
    border-color: rgba(17, 24, 39, 0.12);
  }
}

.ghost {
  box-shadow: none;
}

.collapse-glyph {
  font-size: 20px;
  line-height: 1;
}

.sidebar-context {
  padding: 12px 12px 10px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(17, 24, 39, 0.05);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.82);
}

.collapsed-context {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 0 4px;
}

.context-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.context-title {
  margin-top: 8px;
  font-size: 14px;
  font-weight: 700;
}

.context-meta {
  margin-top: 6px;
  font-size: 12px;
  line-height: 1.55;
  color: var(--text-secondary);
}

.collapsed-section {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--text-tertiary);
}

.collapsed-page {
  min-width: 52px;
  min-height: 26px;
  padding: 0 9px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid rgba(17, 24, 39, 0.05);
  color: var(--text-primary);
  font-size: 11px;
  font-weight: 700;
  box-shadow: 0 6px 16px rgba(15, 23, 42, 0.06);
}

.sidebar-nav {
  min-height: 0;
  flex: 1;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding-right: 4px;
}

.nav-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-group-title {
  padding: 0 12px 6px;
  font-size: 11px;
  font-weight: 700;
  color: var(--text-tertiary);
  letter-spacing: 0.08em;
}

.nav-group-mini {
  min-height: 18px;
  display: grid;
  place-items: center;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--text-tertiary);
}

.nav-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 36px;
  padding: 0 12px;
  border-radius: 10px;
  text-decoration: none;
  color: var(--text-secondary);
  transition: 0.18s ease;
  overflow: hidden;

  &:hover {
    background: rgba(255, 255, 255, 0.84);
    color: var(--text-primary);
  }

  &.active {
    background: rgba(255, 255, 255, 0.96);
    color: var(--text-primary);
    box-shadow: 0 8px 18px rgba(15, 23, 42, 0.05);
  }

  &.active::before {
    content: '';
    position: absolute;
    left: 8px;
    top: 8px;
    bottom: 8px;
    width: 2px;
    border-radius: 999px;
    background: rgba(17, 24, 39, 0.8);
  }
}

.nav-icon {
  width: 16px;
  height: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 16px;
}

.nav-label {
  min-width: 0;
  flex: 1;
  font-size: 13px;
  font-weight: 500;
}

.nav-badge {
  padding: 2px 7px;
  border-radius: 999px;
  background: rgba(39, 49, 58, 0.08);
  color: var(--text-tertiary);
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.sidebar-footer {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sidebar-utility {
  width: 100%;
  min-height: 34px;
  justify-content: flex-start;
  text-align: left;

  &.compact {
    width: 36px;
    justify-content: center;
    padding: 0;
  }
}

.utility-icon {
  width: 14px;
  text-align: center;
}

.main-shell {
  min-width: 0;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.topbar {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  min-height: 46px;
  padding: 8px 24px;
  background: rgba(246, 247, 248, 0.7);
  border-bottom: 1px solid rgba(17, 24, 39, 0.05);
  backdrop-filter: blur(18px);
}

.topbar-copy {
  min-width: 0;
  display: flex;
  flex-direction: row;
  align-items: center;
}

.topbar-context-row {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.topbar-context {
  min-width: 0;
  font-size: 14px;
  line-height: 1.3;
  font-weight: 650;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.topbar-flag {
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(39, 49, 58, 0.08);
  color: var(--text-tertiary);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.topbar-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.primary-action {
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 12px;
  border-radius: 9px;
  background: #111827;
  color: #fff;
  text-decoration: none;
  font-size: 12px;
  font-weight: 600;
  transition: 0.18s ease;

  &:hover {
    background: #0f172a;
  }
}

.page-shell {
  min-height: 0;
  flex: 1;
  overflow: auto;
  padding: 16px 24px 24px;
}

.collapsed .sidebar-head {
  justify-content: center;
  flex-direction: column;
  gap: 4px;
}

.collapsed .brand {
  justify-content: center;
}

.collapsed .nav-group {
  align-items: center;
  gap: 8px;
}

.collapsed .nav-item {
  width: 44px;
  justify-content: center;
  padding: 0;
}

.collapsed .nav-item.active::before {
  left: 6px;
}

.collapsed .sidebar-footer {
  align-items: center;
}

@media (max-width: 1080px) {
  .workbench-layout {
    grid-template-columns: 84px minmax(0, 1fr);
  }

  .sidebar {
    padding-inline: 10px;
  }

  .brand-copy,
  .sidebar-context,
  .nav-group-title,
  .nav-label,
  .nav-badge,
  .sidebar-utility {
    display: none;
  }

  .sidebar-head,
  .nav-group,
  .sidebar-footer {
    align-items: center;
  }

  .sidebar-head :deep(.ln-workspace-switcher__copy),
  .sidebar-head :deep(.ln-workspace-switcher__chevron) { display: none; }
  .sidebar-head :deep(.ln-workspace-switcher) { width: 40px; flex: 0 0 40px; padding: 4px; }

  .nav-item {
    width: 44px;
    justify-content: center;
    padding: 0;
  }

  .topbar {
    padding-inline: 18px;
  }

  .page-shell {
    padding-inline: 18px;
  }
}

@media (max-width: 760px) {
  .workbench-layout,
  .workbench-layout.collapsed {
    grid-template-columns: 1fr;
  }

  .sidebar {
    position: static;
    height: auto;
    border-right: none;
    border-bottom: 1px solid rgba(31, 35, 40, 0.06);
  }

  .topbar {
    position: static;
    flex-direction: column;
    align-items: stretch;
    min-height: auto;
  }

  .topbar-actions {
    justify-content: space-between;
  }
}
</style>

import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

/** 带超时的 Promise 包装 */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('请求超时')), ms)
    ),
  ])
}

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/LoginView.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/login/dingtalk/callback',
    name: 'DingTalkCallback',
    component: () => import('@/views/login/DingTalkCallbackView.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/external-submit',
    name: 'ExternalSubmit',
    component: () => import('@/views/external-submit/ExternalSubmitView.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/external-submit/result',
    name: 'ExternalSubmitResult',
    component: () => import('@/views/external-submit/ExternalSubmitResultView.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    redirect: '/raw-pool',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        redirect: '/raw-pool',
        meta: { title: '数据看板', icon: 'DataBoard', hidden: true, stageStatus: 'disabled' },
      },
      {
        path: 'kanban',
        name: 'Kanban',
        component: () => import('@/views/kanban/KanbanView.vue'),
        meta: { title: '看板视图', icon: 'Board' },
      },
      {
        path: 'raw-pool',
        name: 'RawPool',
        component: () => import('@/views/raw-pool/RawPoolView.vue'),
        meta: { title: '原始需求池', icon: 'Collection' },
      },
      {
        path: 'product-pool',
        name: 'ProductPool',
        component: () => import('@/views/product-pool/ProductPoolView.vue'),
        meta: { title: '产品需求池', icon: 'Box' },
      },
      {
        path: 'my-tasks',
        name: 'MyTasks',
        component: () => import('@/views/my-tasks/MyTasksView.vue'),
        meta: { title: '我的待办', icon: 'List' },
      },
      {
        path: 'submit',
        name: 'Submit',
        component: () => import('@/views/submit/SubmitView.vue'),
        meta: { title: '新建需求', icon: 'Plus', hidden: true, entryMode: 'secondary' },
      },
      {
        path: 'sprint',
        name: 'Sprint',
        component: () => import('@/views/sprint/SprintView.vue'),
        meta: { title: '迭代管理', icon: 'Timer' },
      },
      // 以下路由已合并到看板页面的Tab中，重定向到 /kanban
      {
        path: 'pm-tasks',
        redirect: '/kanban',
      },
      {
        path: 'progress',
        redirect: '/kanban',
      },
      {
        path: 'list',
        redirect: '/kanban',
      },
      {
        path: 'calendar',
        redirect: '/kanban',
      },
      {
        path: 'priority',
        redirect: '/kanban',
      },
      {
        path: 'settings',
        name: 'Settings',
        redirect: '/raw-pool',
        meta: { title: '系统设置', icon: 'Setting', hidden: true, stageStatus: 'disabled' },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 路由守卫
let isLoadingUser = false

router.beforeEach(async (to, _from, next) => {
  const token = localStorage.getItem('token')

  if (to.matched.some((record) => record.meta.requiresAuth !== false)) {
    // 需要认证的页面
    if (!token) {
      // 无token，跳转登录
      next({ path: '/login', query: { redirect: to.fullPath } })
    } else {
      // 有token，检查是否已获取用户信息（动态导入打破循环依赖）
      const { useUserStore } = await import('@/store/user')
      const userStore = useUserStore()

      if (!userStore.userInfo) {
        // 避免重复加载
        if (isLoadingUser) {
          next()
          return
        }
        isLoadingUser = true
        try {
          // 5秒超时控制，防止服务器慢响应导致页面卡死
          await withTimeout(userStore.getUserInfo(), 5000)
          next()
        } catch {
          // 获取用户信息失败（token过期或超时），清除token跳转登录
          userStore.resetState()
          next({ path: '/login', query: { redirect: to.fullPath } })
        } finally {
          isLoadingUser = false
        }
      } else {
        next()
      }
    }
  } else {
    // 不需要认证的页面
    if (to.path === '/login' && token) {
      // 已登录用户访问登录页，重定向到首页
      next({ path: '/raw-pool' })
    } else {
      next()
    }
  }
})

export default router

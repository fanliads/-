import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { loginApi, getUserInfoApi, logoutApi } from '@/api/auth'
import type { LoginResult, UserInfoVO } from '@/api/auth'
import router from '@/router'

const DEV_PREVIEW_TOKEN = 'dev-preview-token'

function createDevPreviewUserInfo(): UserInfoVO {
  return {
    id: 1,
    username: 'admin',
    realName: '预览用户',
    avatar: '',
    roleId: 1,
    roleName: '系统管理员',
    roleKey: 'admin',
    permissions: ['raw-pool:view', 'raw-pool:add', 'raw-pool:edit', 'raw-pool:evaluate', 'raw-pool:approve', 'product-pool:view', 'product-pool:add', 'product-pool:edit', 'product-pool:filter', 'product-pool:judge', 'my-tasks:view', 'sprint:view', 'submit-form:add', 'dashboard:view', 'system:view'],
  }
}

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(localStorage.getItem('token') || '')
  const userInfo = ref<UserInfoVO | null>(null)
  const permissions = ref<string[]>([])

  // getters
  const isLoggedIn = computed(() => !!token.value)
  const currentRole = computed(() => userInfo.value?.roleKey || '')
  const currentRoleName = computed(() => userInfo.value?.roleName || '')

  async function login(username: string, password: string) {
    try {
      const res = await loginApi({ username, password })
      const data = res.data
      applyLoginResult(data)
    } catch (error) {
      if (import.meta.env.DEV) {
        applyDevPreviewLogin()
        return
      }
      throw error
    }
  }

  function applyLoginResult(data: LoginResult) {
    token.value = data.token
    localStorage.setItem('token', data.token)
    if (data.userInfo) {
      userInfo.value = data.userInfo
      permissions.value = data.userInfo.permissions || []
    }
  }

  function applyDevPreviewLogin() {
    token.value = DEV_PREVIEW_TOKEN
    localStorage.setItem('token', DEV_PREVIEW_TOKEN)
    const devUserInfo = createDevPreviewUserInfo()
    userInfo.value = devUserInfo
    permissions.value = devUserInfo.permissions || []
  }

  async function getUserInfo() {
    if (import.meta.env.DEV && token.value === DEV_PREVIEW_TOKEN) {
      const devUserInfo = createDevPreviewUserInfo()
      userInfo.value = devUserInfo
      permissions.value = devUserInfo.permissions || []
      return devUserInfo
    }

    const res = await getUserInfoApi()
    const data = res.data
    userInfo.value = data
    permissions.value = data.permissions || []
    return data
  }

  async function logout() {
    try {
      if (!(import.meta.env.DEV && token.value === DEV_PREVIEW_TOKEN)) {
        await logoutApi()
      }
    } finally {
      resetState()
      router.push('/login')
    }
  }

  function resetState() {
    token.value = ''
    userInfo.value = null
    permissions.value = []
    localStorage.removeItem('token')
  }

  function hasPermission(permKey: string): boolean {
    return permissions.value.includes(permKey)
  }

  function hasAnyPermission(permKeys: string[]): boolean {
    return permKeys.some((permKey) => permissions.value.includes(permKey))
  }

  return {
    token,
    userInfo,
    permissions,
    isLoggedIn,
    currentRole,
    currentRoleName,
    login,
    applyLoginResult,
    applyDevPreviewLogin,
    getUserInfo,
    logout,
    resetState,
    hasPermission,
    hasAnyPermission,
  }
})

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { loginApi, getUserInfoApi, logoutApi } from '@/api/auth'
import type { LoginResult, UserInfoVO } from '@/api/auth'
import router from '@/router'

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(localStorage.getItem('token') || '')
  const userInfo = ref<UserInfoVO | null>(null)
  const permissions = ref<string[]>([])

  // getters
  const isLoggedIn = computed(() => !!token.value)
  const currentRole = computed(() => userInfo.value?.roleKey || '')
  const currentRoleName = computed(() => userInfo.value?.roleName || '')

  async function login(username: string, password: string) {
    const res = await loginApi({ username, password })
    const data = res.data
    applyLoginResult(data)
  }

  function applyLoginResult(data: LoginResult) {
    token.value = data.token
    localStorage.setItem('token', data.token)
    if (data.userInfo) {
      userInfo.value = data.userInfo
      permissions.value = data.userInfo.permissions || []
    }
  }

  async function getUserInfo() {
    const res = await getUserInfoApi()
    const data = res.data
    userInfo.value = data
    permissions.value = data.permissions || []
    return data
  }

  async function logout() {
    try {
      await logoutApi()
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
    getUserInfo,
    logout,
    resetState,
    hasPermission,
    hasAnyPermission,
  }
})

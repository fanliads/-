import { post, get } from '@/utils/request'

export interface LoginParams {
  username: string
  password: string
}

export interface UserInfoVO {
  id: number
  username: string
  realName: string
  avatar: string
  roleId: number
  roleName: string
  roleKey: string
  permissions: string[]
}

export interface LoginResult {
  token: string
  userInfo: UserInfoVO
}

export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

export interface DingTalkAuthConfig {
  enabled: boolean
  loginUrl: string
  callbackPath: string
  message: string
}

export interface DingTalkCallbackResult {
  success: boolean
  message: string
  login?: LoginResult
}

/** 用户登录 */
export function loginApi(data: LoginParams) {
  return post<ApiResponse<LoginResult>>('/auth/login', data)
}

/** 用户登出 */
export function logoutApi() {
  return post('/auth/logout')
}

/** 获取当前用户信息 */
export function getUserInfoApi() {
  return get<ApiResponse<UserInfoVO>>('/auth/info')
}

/** 刷新 Token */
export function refreshTokenApi() {
  return post<ApiResponse<{ token: string }>>('/auth/refresh')
}

export function getDingTalkConfigApi() {
  return get<ApiResponse<DingTalkAuthConfig>>('/auth/dingtalk/config')
}

export function handleDingTalkCallbackApi(params: { authCode?: string; state?: string }) {
  return get<ApiResponse<DingTalkCallbackResult>>('/auth/dingtalk/callback', { params })
}

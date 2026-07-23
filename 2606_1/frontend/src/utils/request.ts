import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios'
import router from '@/router'
import { lnToast } from '@/components/linear'

const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
})

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    const res = response.data
    // 后端返回格式为 { code, data, message }
    if (res.code !== undefined && res.code !== 0 && res.code !== 200) {
      lnToast.error(res.message || '请求失败')
      // Token 过期或未授权
      if (res.code === 401) {
        clearAuthAndRedirect()
      }
      const businessError = Object.assign(new Error(res.message || '请求失败'), { code: res.code, field: res.field, traceId: res.traceId })
      return Promise.reject(businessError)
    }
    return res
  },
  (error) => {
    if (error.response) {
      const { status } = error.response
      switch (status) {
        case 401:
          // 登录页的 401 应交给登录表单处理；开发预览 token 则需要
          // 继续保留，以便在后端未启动时验证整体页面。否则延迟跳转
          // 会在预览登录成功后再次清空 token，造成 /login redirect 循环。
          if (!shouldPreserveAuthOnUnauthorized()) {
            lnToast.error('登录已过期，请重新登录')
            clearAuthAndRedirect()
          }
          break
        case 403:
          lnToast.error('没有权限访问该资源')
          break
        case 404:
          lnToast.error('请求的资源不存在')
          break
        case 500:
          lnToast.error('服务器内部错误')
          break
        default:
          lnToast.error(error.response.data?.message || '请求失败')
      }
    } else if (error.message.includes('timeout')) {
      lnToast.error('请求超时，请稍后重试')
    } else {
      lnToast.error('网络异常，请检查网络连接')
    }
    return Promise.reject(error)
  }
)

function shouldPreserveAuthOnUnauthorized() {
  const isLoginPage = router.currentRoute.value.path === '/login'
  const isDevPreviewSession =
    import.meta.env.DEV && localStorage.getItem('token') === 'dev-preview-token'
  return isLoginPage || isDevPreviewSession
}

function clearAuthAndRedirect() {
  localStorage.removeItem('token')
  // 使用setTimeout避免在响应拦截器中直接跳转导致的循环
  setTimeout(() => {
    const currentPath = router.currentRoute.value.fullPath
    if (currentPath !== '/login') {
      router.push({ path: '/login', query: { redirect: currentPath } })
    }
  }, 100)
}

export default service

export function get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
  return service.get(url, config) as unknown as Promise<T>
}

export function post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
  return service.post(url, data, config) as unknown as Promise<T>
}

export function put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
  return service.put(url, data, config) as unknown as Promise<T>
}

export function del<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
  return service.delete(url, config) as unknown as Promise<T>
}

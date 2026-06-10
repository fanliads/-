import type { Directive, DirectiveBinding } from 'vue'
import { useUserStore } from '@/store/user'

/**
 * v-permission 指令
 * 用法: v-permission="'requirement:create'" 或 v-permission="['requirement:create', 'requirement:edit']"
 * 检查用户是否拥有指定权限，没有则移除元素
 */
export const permission: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding<string | string[]>) {
    const { value } = binding

    if (!value) return

    const userStore = useUserStore()
    const requiredPermissions = typeof value === 'string' ? [value] : value
    const hasPermission = requiredPermissions.some((perm) => userStore.hasPermission(perm))

    if (!hasPermission) {
      // 移除DOM元素
      el.parentNode?.removeChild(el)
    }
  },

  updated(el: HTMLElement, binding: DirectiveBinding<string | string[]>) {
    const { value, oldValue } = binding

    // 如果权限值没变化，不重复处理
    if (JSON.stringify(value) === JSON.stringify(oldValue)) return
    if (!value) return

    const userStore = useUserStore()
    const requiredPermissions = typeof value === 'string' ? [value] : value
    const hasPermission = requiredPermissions.some((perm) => userStore.hasPermission(perm))

    if (!hasPermission) {
      el.parentNode?.removeChild(el)
    }
  },
}

export default permission

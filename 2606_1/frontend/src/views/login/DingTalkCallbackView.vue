<template>
  <LnLoadingOverlay active fullscreen :label="statusText" description="正在校验登录状态，请勿关闭页面。" />
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { lnToast, LnLoadingOverlay } from '@/components/linear'
import { handleDingTalkCallbackApi } from '@/api/auth'
import { useUserStore } from '@/store/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const statusText = ref('正在校验钉钉登录回调...')

onMounted(async () => {
  try {
    const authCode = route.query.authCode as string | undefined
    const state = route.query.state as string | undefined
    const res = await handleDingTalkCallbackApi({ authCode, state })
    const result = res.data
    statusText.value = result.message || '回调完成'

    if (result.success && result.login) {
      userStore.applyLoginResult(result.login)
      lnToast.success('钉钉登录成功')
      router.replace('/kanban')
      return
    }

    lnToast.warning(result.message || '当前环境未启用钉钉登录')
    router.replace('/login')
  } catch (error: any) {
    statusText.value = error.message || '钉钉登录失败'
    lnToast.error(statusText.value)
    router.replace('/login')
  }
})
</script>

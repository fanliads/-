<template>
  <div class="callback-page">
    <div class="callback-card">
      <h2>钉钉登录处理中</h2>
      <p>{{ statusText }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
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
      ElMessage.success('钉钉登录成功')
      router.replace('/kanban')
      return
    }

    ElMessage.warning(result.message || '当前环境未启用钉钉登录')
    router.replace('/login')
  } catch (error: any) {
    statusText.value = error.message || '钉钉登录失败'
    ElMessage.error(statusText.value)
    router.replace('/login')
  }
})
</script>

<style scoped lang="scss">
.callback-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, #f5f5f7 0%, #eef0f5 100%);
}

.callback-card {
  width: min(420px, calc(100vw - 32px));
  padding: 32px;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 12px 36px rgba(15, 23, 42, 0.08);
  text-align: center;
}
</style>

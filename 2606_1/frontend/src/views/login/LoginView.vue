<template>
  <div class="login-container">
    <main class="login-card">
      <div class="login-header">
        <div class="brand-mark" aria-hidden="true">需</div>
        <h1 class="login-title">登录需求中枢</h1>
        <p class="login-subtitle">使用你的工作账号继续</p>
      </div>
      <LnForm
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
        @keyup.enter="handleLogin"
      >
        <div class="form-group">
          <label class="form-label">用户名</label>
          <LnFormItem prop="username">
            <LnInput v-model="loginForm.username" placeholder="请输入用户名" autocomplete="username" clearable><template #prefix>◎</template></LnInput>
          </LnFormItem>
        </div>
        <div class="form-group">
          <label class="form-label">密码</label>
          <LnFormItem prop="password">
            <LnPasswordInput v-model="loginForm.password" placeholder="请输入密码" @keydown.enter="handleLogin"><template #prefix><LnIcon name="user"/></template></LnPasswordInput>
          </LnFormItem>
        </div>
        <LnButton class="login-action" variant="primary" :loading="loading" @click="handleLogin">
          登 录
        </LnButton>
        <LnButton
          v-if="dingtalkConfig"
          class="login-action login-action--secondary"
          :disabled="loading"
          @click="handleDingTalkLogin"
        >
          钉钉登录
        </LnButton>
        <p v-if="dingtalkConfig?.message" class="login-note">{{ dingtalkConfig.message }}</p>
      </LnForm>
    </main>
    <p class="login-footer">需求中枢 · 产品与项目协作</p>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/store/user'
import { getDingTalkConfigApi, type DingTalkAuthConfig } from '@/api/auth'
import { lnToast, LnButton, LnForm, LnFormItem, LnIcon, LnInput, LnPasswordInput, type LnFormInstance, type LnFormRules } from '@/components/linear'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const loginFormRef = ref<LnFormInstance>()
const loading = ref(false)
const dingtalkConfig = ref<DingTalkAuthConfig | null>(null)

const loginForm = reactive({
  username: '',
  password: '',
})

const loginRules: LnFormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

async function handleLogin() {
  if (!loginFormRef.value) return
  await loginFormRef.value.validate(async (valid) => {
    if (!valid) return
    loading.value = true
    try {
      await userStore.login(loginForm.username, loginForm.password)
      const redirect = (route.query.redirect as string) || '/dashboard'
      router.push(redirect)
      lnToast.success('登录成功')
    } catch (error: any) {
      lnToast.error(error.message || '登录失败，请检查用户名和密码')
    } finally {
      loading.value = false
    }
  })
}

function handleDingTalkLogin() {
  if (!dingtalkConfig.value?.enabled || !dingtalkConfig.value.loginUrl) {
    lnToast.info(dingtalkConfig.value?.message || '当前环境未启用钉钉登录')
    return
  }
  window.location.href = dingtalkConfig.value.loginUrl
}

onMounted(async () => {
  try {
    const res = await getDingTalkConfigApi()
    dingtalkConfig.value = res.data
  } catch {
    dingtalkConfig.value = null
  }
})
</script>

<style lang="scss" scoped>
.login-container {
  display: grid;
  grid-template-rows: 1fr auto;
  justify-items: center;
  align-items: center;
  min-height: 100vh;
  padding: 48px 20px 28px;
  background: #f7f7f5;
}

.login-card {
  width: 100%;
  max-width: 380px;
  padding: 36px;
  background: #fff;
  border: 1px solid #e5e5e1;
  border-radius: 16px;
  box-shadow: 0 12px 32px rgba(26, 26, 24, 0.06);
}

.login-header {
  margin-bottom: 30px;

  .brand-mark {
    display: grid;
    width: 36px;
    height: 36px;
    place-items: center;
    margin-bottom: 22px;
    border-radius: 9px;
    background: #252522;
    color: #fff;
    font-size: 15px;
    font-weight: 700;
  }

  .login-title {
    margin: 0 0 8px;
    font-size: 24px;
    font-weight: 650;
    letter-spacing: -0.02em;
    color: var(--text-primary);
  }

  .login-subtitle {
    font-size: 14px;
    color: var(--text-secondary);
    margin: 0;
  }
}

.form-group {
  margin-bottom: 18px;
}

.form-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--text-secondary);
}

.login-action {
  width: 100%;
  height: 44px;
  border-radius: 10px;
}

.login-action--secondary {
  margin-top: 12px;
}

.login-note {
  margin: 12px 4px 0;
  color: var(--text-tertiary);
  font-size: 12px;
  line-height: 1.5;
}

.login-footer {
  margin: 0;
  color: #999994;
  font-size: 12px;
  letter-spacing: 0.02em;
}

@media (max-width: 640px) {
  .login-container {
    padding: 24px 16px;
  }

  .login-card {
    padding: 30px 24px;
    border-radius: 14px;
  }

  .login-header {
    margin-bottom: 24px;
  }

  .login-header .login-title {
    font-size: 22px;
  }
}
</style>

<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h1 class="login-title">需求管理系统</h1>
        <p class="login-subtitle">Requirement Management System</p>
      </div>
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
        @keyup.enter="handleLogin"
      >
        <div class="form-group">
          <label class="form-label">用户名</label>
          <el-form-item prop="username">
            <el-input
              v-model="loginForm.username"
              placeholder="请输入用户名"
              size="large"
              clearable
              class="apple-input"
            />
          </el-form-item>
        </div>
        <div class="form-group">
          <label class="form-label">密码</label>
          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              size="large"
              show-password
              class="apple-input"
            />
          </el-form-item>
        </div>
        <button type="button" class="login-btn" :disabled="loading" @click="handleLogin">
          {{ loading ? '登录中...' : '登 录' }}
        </button>
        <button
          v-if="dingtalkConfig"
          type="button"
          class="login-btn login-btn-secondary"
          :disabled="loading"
          @click="handleDingTalkLogin"
        >
          钉钉登录
        </button>
        <p v-if="dingtalkConfig?.message" class="login-tip">{{ dingtalkConfig.message }}</p>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/store/user'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { getDingTalkConfigApi, type DingTalkAuthConfig } from '@/api/auth'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const loginFormRef = ref<FormInstance>()
const loading = ref(false)
const dingtalkConfig = ref<DingTalkAuthConfig | null>(null)

const loginForm = reactive({
  username: '',
  password: '',
})

const loginRules: FormRules = {
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
      ElMessage.success('登录成功')
    } catch (error: any) {
      ElMessage.error(error.message || '登录失败，请检查用户名和密码')
    } finally {
      loading.value = false
    }
  })
}

function handleDingTalkLogin() {
  if (!dingtalkConfig.value?.enabled || !dingtalkConfig.value.loginUrl) {
    ElMessage.info(dingtalkConfig.value?.message || '当前环境未启用钉钉登录')
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
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(180deg, #f5f5f7 0%, #eef0f5 100%);
  padding: 40px 20px;
}

.login-card {
  width: 100%;
  max-width: 400px;
  padding: 40px 36px;
  background: var(--surface);
  border-radius: var(--radius);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;

  .login-title {
    font-size: 22px;
    font-weight: 600;
    margin-bottom: 8px;
    letter-spacing: -0.3px;
    color: var(--text-primary);
  }

  .login-subtitle {
    font-size: 14px;
    color: var(--text-secondary);
    margin: 0;
  }
}

.form-group {
  margin-bottom: 22px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
  color: var(--text-primary);
}

.apple-input {
  :deep(.el-input__wrapper) {
    width: 100%;
    padding: 11px 14px;
    border-radius: var(--radius-sm);
    border: 1px solid rgba(0, 0, 0, 0.12);
    background: #fafafa;
    font-size: 15px;
    box-shadow: none;
    transition: var(--transition);

    &:hover {
      border-color: rgba(0, 0, 0, 0.2);
    }

    &.is-focus {
      border-color: var(--primary);
      background: var(--surface);
      box-shadow: 0 0 0 3px rgba(0, 113, 227, 0.08);
    }
  }
}

.login-btn {
  width: 100%;
  padding: 14px;
  border-radius: var(--radius-sm);
  border: none;
  background: var(--primary);
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  font-family: inherit;

  &:hover {
    background: var(--primary-hover);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 113, 227, 0.25);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
}

.login-btn-secondary {
  margin-top: 12px;
  background: #111827;

  &:hover {
    background: #1f2937;
  }
}

.login-tip {
  margin-top: 12px;
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.5;
}
</style>

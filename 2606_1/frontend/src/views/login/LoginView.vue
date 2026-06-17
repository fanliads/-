<template>
  <div class="login-container">
    <div class="login-ambient login-ambient-left"></div>
    <div class="login-ambient login-ambient-right"></div>
    <div class="login-intro">
      <div class="intro-kicker">需求协作平台</div>
      <h1 class="intro-title">让需求流转更清楚，决策推进更顺手。</h1>
      <p class="intro-copy">
        把原始收集、产品拆分、排期跟进和待办协同收拢到一个工作台里，减少跳转和信息断层。
      </p>
      <div class="intro-points">
        <span>统一入口</span>
        <span>状态透明</span>
        <span>交接顺滑</span>
      </div>
    </div>
    <div class="login-card">
      <div class="login-header">
        <h1 class="login-title">需求管理系统</h1>
        <p class="login-subtitle">欢迎回来，继续推进今天的需求节奏。</p>
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
      <p class="login-tip">
        本地预览模式下，登录失败会自动进入演示账号，方便直接查看页面效果。
      </p>
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
  position: relative;
  display: flex;
  justify-content: space-between;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  overflow: hidden;
  background:
    radial-gradient(circle at 15% 20%, rgba(214, 139, 61, 0.2), transparent 28%),
    radial-gradient(circle at 82% 16%, rgba(31, 107, 92, 0.18), transparent 26%),
    linear-gradient(135deg, #f6efe6 0%, #f3eee7 42%, #ebe5db 100%);
  padding: 40px 48px;
  gap: 60px;
}

.login-ambient {
  position: absolute;
  border-radius: 999px;
  filter: blur(10px);
  opacity: 0.5;
}

.login-ambient-left {
  width: 260px;
  height: 260px;
  left: -70px;
  bottom: 12%;
  background: rgba(214, 139, 61, 0.18);
}

.login-ambient-right {
  width: 320px;
  height: 320px;
  right: -80px;
  top: -30px;
  background: rgba(31, 107, 92, 0.14);
}

.login-intro {
  position: relative;
  z-index: 1;
  width: min(540px, 48vw);
  color: #2f352f;
}

.intro-kicker {
  display: inline-flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 999px;
  margin-bottom: 18px;
  background: rgba(255, 255, 255, 0.56);
  border: 1px solid rgba(77, 63, 47, 0.1);
  color: var(--text-secondary);
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.intro-title {
  font-size: clamp(38px, 4vw, 56px);
  line-height: 1.06;
  font-weight: 700;
  letter-spacing: -0.04em;
  max-width: 9em;
  font-family: var(--font-family-accent);
}

.intro-copy {
  margin-top: 20px;
  font-size: 16px;
  line-height: 1.8;
  color: var(--text-secondary);
  max-width: 34em;
}

.intro-points {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 24px;

  span {
    padding: 10px 14px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.56);
    border: 1px solid rgba(77, 63, 47, 0.1);
    color: #32433d;
    font-size: 13px;
    font-weight: 600;
  }
}

.login-card {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 430px;
  padding: 40px 36px 34px;
  background: rgba(255, 252, 247, 0.82);
  border-radius: 30px;
  border: 1px solid rgba(255, 255, 255, 0.7);
  box-shadow: 0 28px 60px rgba(54, 41, 29, 0.16);
  backdrop-filter: blur(16px);
}

.login-header {
  text-align: left;
  margin-bottom: 32px;

  .login-title {
    font-size: 28px;
    font-weight: 700;
    margin-bottom: 10px;
    letter-spacing: -0.03em;
    color: var(--text-primary);
    font-family: var(--font-family-accent);
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
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--text-secondary);
}

.apple-input {
  :deep(.el-input__wrapper) {
    width: 100%;
    padding: 13px 14px;
    border-radius: 16px;
    border: 1px solid rgba(77, 63, 47, 0.1);
    background: rgba(255, 255, 255, 0.7);
    font-size: 15px;
    box-shadow: none;
    transition: var(--transition);

    &:hover {
      border-color: rgba(77, 63, 47, 0.18);
    }

    &.is-focus {
      border-color: var(--primary);
      background: rgba(255, 255, 255, 0.96);
      box-shadow: 0 0 0 4px rgba(31, 107, 92, 0.08);
    }
  }
}

.login-btn {
  width: 100%;
  padding: 14px;
  border-radius: 16px;
  border: none;
  background: linear-gradient(135deg, var(--primary) 0%, #234e47 100%);
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  font-family: inherit;

  &:hover {
    background: linear-gradient(135deg, var(--primary-hover) 0%, #173d36 100%);
    transform: translateY(-1px);
    box-shadow: 0 16px 34px rgba(31, 107, 92, 0.24);
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
  background: rgba(28, 35, 32, 0.88);

  &:hover {
    background: rgba(22, 28, 26, 0.94);
  }
}

.login-tip {
  margin-top: 14px;
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.6;
}

@media (max-width: 980px) {
  .login-container {
    flex-direction: column;
    justify-content: center;
    padding: 32px 18px;
    gap: 28px;
  }

  .login-intro {
    width: 100%;
    max-width: 680px;
  }

  .intro-title {
    max-width: none;
  }
}

@media (max-width: 640px) {
  .login-card {
    padding: 28px 22px 24px;
    border-radius: 24px;
  }

  .login-header {
    margin-bottom: 24px;
  }

  .login-header .login-title {
    font-size: 24px;
  }

  .intro-title {
    font-size: 34px;
  }
}
</style>

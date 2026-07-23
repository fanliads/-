<template>
  <div class="result-view">
    <div class="result-card wb-panel">
      <div class="success-mark"><LnIcon name="check" /></div>
      <div class="result-badge wb-meta-pill">已受理</div>
      <h1 class="wb-page-title">需求已提交</h1>
      <p class="wb-page-subtitle">请保存或截图此受理凭证，后续由相关人员与你联系。</p>

      <div class="result-panel">
        <div class="result-item">
          <span class="k">需求标题</span>
          <span class="v">{{ title || '-' }}</span>
        </div>
        <div class="result-item">
          <span class="k">受理编号</span>
          <span class="v mono">{{ receipt?.reqNo || '-' }}</span>
        </div>
        <div class="result-item">
          <span class="k">提交时间</span>
          <span class="v">{{ submittedAt }}</span>
        </div>
        <div v-if="receipt?.duplicate" class="result-item duplicate-note">
          <span class="k">提交说明</span>
          <span class="v">系统识别到重复提交，已返回原受理凭证，不会生成重复需求。</span>
        </div>
      </div>

      <div class="result-actions">
        <LnButton variant="primary" @click="goBack">继续提交</LnButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { LnButton, LnIcon } from '@/components/linear'
import type { ExternalSubmissionReceiptVO } from '@/types/requirement'

const route = useRoute()
const router = useRouter()

const title = computed(() => route.query.title as string | undefined)
const receipt = computed<ExternalSubmissionReceiptVO | null>(() => {
  try { return JSON.parse(decodeURIComponent(String(route.query.receipt || ''))) }
  catch { return null }
})
const submittedAt = computed(() => receipt.value?.submittedAt ? receipt.value.submittedAt.replace('T', ' ').slice(0, 19) : '-')

function goBack() {
  router.replace('/external-submit')
}
</script>

<style scoped lang="scss">
.result-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background:
    radial-gradient(circle at top right, rgba(59, 130, 246, 0.1), transparent 28%),
    linear-gradient(180deg, #f7f8fa 0%, #eef2f6 100%);
}

.result-card {
  width: min(640px, 100%);
  padding: 32px;
}

.result-badge {
}
.success-mark { width: 48px; height: 48px; display: grid; place-items: center; border-radius: 50%; background: #e2f1e7; color: #26744d; font-size: 24px; }

.result-card h1 {
  margin: 14px 0 10px;
}

.result-card p {
  margin: 0 0 20px;
}

.result-panel {
  display: grid;
  gap: 12px;
  padding: 18px;
  border-radius: 16px;
  background: rgba(17, 24, 39, 0.024);
  border: 1px solid rgba(17, 24, 39, 0.05);
}

.result-item {
  display: grid;
  gap: 6px;
}

.k {
  font-size: 12px;
  color: var(--text-tertiary);
}

.v {
  font-size: 14px;
  color: var(--text-primary);
  line-height: 1.6;
}

.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
}

.result-actions {
  margin-top: 22px;
}
.duplicate-note { padding-top: 10px; border-top: 1px solid rgba(17,24,39,.06); }
</style>

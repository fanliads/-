<template>
  <div class="result-view">
    <div class="result-card wb-panel">
      <div class="result-badge wb-meta-pill">已受理</div>
      <h1 class="wb-page-title">需求已进入受理流程</h1>
      <p class="wb-page-subtitle">你的提报已经进入原始需求池，后续将按待判定、待拆分、开发中的流程推进。</p>

      <div class="result-panel">
        <div class="result-item">
          <span class="k">需求标题</span>
          <span class="v">{{ title || '-' }}</span>
        </div>
        <div class="result-item">
          <span class="k">记录ID</span>
          <span class="v mono">{{ id || '-' }}</span>
        </div>
        <div class="result-item">
          <span class="k">后续说明</span>
          <span class="v">外部提报需求会先进入待判定，再按流程拆分和推进。</span>
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
import { LnButton } from '@/components/linear'

const route = useRoute()
const router = useRouter()

const id = computed(() => route.query.id as string | undefined)
const title = computed(() => route.query.title as string | undefined)

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
</style>

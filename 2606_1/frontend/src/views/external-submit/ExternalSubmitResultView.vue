<template>
  <div class="result-view">
    <div class="result-card">
      <div class="result-badge">已受理</div>
      <h1>需求已进入受理流程</h1>
      <p>你的提报已经进入原始需求池，后续将按待判定、待拆分、开发中的流程推进。</p>

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
        <el-button type="primary" @click="goBack">继续提交</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

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
    radial-gradient(circle at top right, rgba(52, 199, 89, 0.14), transparent 30%),
    linear-gradient(180deg, #f7fafc 0%, #edf2f7 100%);
}

.result-card {
  width: min(640px, 100%);
  padding: 32px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(15, 23, 42, 0.08);
  box-shadow: 0 18px 50px rgba(15, 23, 42, 0.1);
}

.result-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(52, 199, 89, 0.12);
  color: #15803d;
  font-size: 12px;
  font-weight: 700;
}

.result-card h1 {
  margin: 14px 0 10px;
  font-size: 30px;
  color: #0f172a;
}

.result-card p {
  margin: 0 0 20px;
  line-height: 1.7;
  color: #475569;
}

.result-panel {
  display: grid;
  gap: 12px;
  padding: 18px;
  border-radius: 18px;
  background: #f8fafc;
  border: 1px solid rgba(15, 23, 42, 0.06);
}

.result-item {
  display: grid;
  gap: 6px;
}

.k {
  font-size: 12px;
  color: #64748b;
}

.v {
  font-size: 14px;
  color: #0f172a;
  line-height: 1.6;
}

.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
}

.result-actions {
  margin-top: 22px;
}
</style>

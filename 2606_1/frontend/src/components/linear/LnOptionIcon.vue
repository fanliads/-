<template>
  <span class="ln-option-icon" :style="color ? { color } : undefined" aria-hidden="true">
    <svg v-if="kind !== 'glyph'" viewBox="0 0 16 16" fill="none">
      <circle v-if="kind === 'pending'" cx="8" cy="8" r="5.25" />
      <template v-else-if="kind === 'progress'">
        <circle cx="8" cy="8" r="5.25" />
        <path class="fill" d="M8 2.75a5.25 5.25 0 0 1 0 10.5Z" />
      </template>
      <circle v-else-if="kind === 'success'" class="fill" cx="8" cy="8" r="5.25" />
      <template v-else-if="kind === 'check'">
        <circle cx="8" cy="8" r="5.25" />
        <path d="m5.25 8.1 1.75 1.8 3.85-4" />
      </template>
      <template v-else-if="kind === 'blocked'">
        <circle cx="8" cy="8" r="5.25" />
        <path d="m4.35 11.65 7.3-7.3" />
      </template>
      <template v-else-if="kind === 'paused'">
        <circle cx="8" cy="8" r="5.25" />
        <path d="M6.35 5.5v5M9.65 5.5v5" />
      </template>
      <template v-else-if="kind === 'closed'">
        <circle cx="8" cy="8" r="5.25" />
        <path d="m5.8 5.8 4.4 4.4m0-4.4-4.4 4.4" />
      </template>
      <template v-else-if="kind === 'priority'">
        <rect v-for="bar in 4" :key="bar" class="priority-bar" :class="{ 'is-active': bar <= priorityBars }" :x="1.5 + (bar - 1) * 3.5" :y="12.5 - bar * 2" width="2" :height="bar * 2" rx="0.7" />
      </template>
      <path v-else-if="kind === 'business'" d="m8 3 5 5-5 5-5-5Z" />
      <template v-else-if="kind === 'business-campus'"><path d="M2.75 6.25 8 3l5.25 3.25M3.5 6.25h9v6.5h-9Z"/><path d="M6.25 8.25v4.5M9.75 8.25v4.5M2.75 12.75h10.5"/></template>
      <template v-else-if="kind === 'business-regulator'"><path d="M8 2.75 12.5 4.5v3.35c0 2.65-1.5 4.45-4.5 5.4-3-.95-4.5-2.75-4.5-5.4V4.5Z"/><path d="m5.75 8 1.5 1.5 3-3"/></template>
      <template v-else-if="kind === 'business-catering'"><path d="M3 8.25h10c-.25 2.7-1.9 4.25-5 4.25s-4.75-1.55-5-4.25Z"/><path d="M5 5.75c0-1 .75-1.25.75-2.25M8 5.75c0-1 .75-1.25.75-2.25M11 5.75c0-1 .75-1.25.75-2.25"/></template>
      <template v-else-if="kind === 'business-support'"><path d="M9.6 3.15a3 3 0 0 0-3.55 3.8l-3.1 3.1a1.75 1.75 0 1 0 3 3l3.1-3.1a3 3 0 0 0 3.8-3.55l-2.1 2.1-2.25-2.25Z"/></template>
      <template v-else-if="kind === 'type'"><rect x="3" y="3.25" width="10" height="9.5" rx="1.25"/><path d="M5.25 6h5.5M5.25 8.25h5.5M5.25 10.5h3.25"/></template>
      <template v-else-if="kind === 'type-iteration'"><path d="M12.5 6A4.8 4.8 0 0 0 4 4.5L2.75 6M3.5 10A4.8 4.8 0 0 0 12 11.5L13.25 10"/><path d="M2.75 3.5V6h2.5M13.25 12.5V10h-2.5"/></template>
      <template v-else-if="kind === 'type-issue'"><path d="M8 2.75 13 12H3Z"/><path d="M8 6v2.75M8 10.75h.01"/></template>
      <template v-else-if="kind === 'type-defect'"><path d="M5 6.25h6v3.25a3 3 0 0 1-6 0ZM8 3v3.25M5.75 4.25 4.5 3M10.25 4.25 11.5 3M5 8H2.75M13.25 8H11M5 10.5l-1.75 1M11 10.5l1.75 1"/></template>
      <template v-else-if="kind === 'type-feature'"><rect x="3" y="3" width="10" height="10" rx="2"/><path d="M8 5.25v5.5M5.25 8h5.5"/></template>
      <template v-else-if="kind === 'sprint'"><path d="M8 2.75a5.25 5.25 0 1 1-4.8 3.12"/><path d="M2.75 2.75v3.5h3.5M8 5.25V8l2 1.25"/></template>
      <template v-else-if="kind === 'user'"><circle cx="8" cy="5.5" r="2.25"/><path d="M3.75 13c.4-2.35 1.8-3.5 4.25-3.5s3.85 1.15 4.25 3.5"/></template>
      <path v-else-if="kind === 'none'" d="M4 8h8" />
    </svg>
    <span v-else class="ln-option-icon__glyph">{{ icon || '—' }}</span>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ value?: string; label?: string; icon?: string; color?: string }>()

const kind = computed(() => {
  const value = String(props.value || '').trim().toLocaleLowerCase()
  const label = String(props.label || '').trim().toLocaleLowerCase()
  const token = `${value} ${label}`
  if (/p[0-3]/.test(token)) return 'priority'
  if (['business', 'business-campus', 'business-regulator', 'business-catering', 'business-support', 'type', 'type-iteration', 'type-issue', 'type-defect', 'type-feature', 'sprint', 'user', 'none', 'priority'].includes(String(props.icon))) return props.icon
  if (/(accepted|验收通过|已验收)/.test(token)) return 'check'
  if (/(online|done|completed|已上线|已完成)/.test(token)) return 'success'
  if (/(rejected|blocked|验收不通过|拒绝|驳回|阻塞)/.test(token)) return 'blocked'
  if (/(suspended|paused|暂停|挂起)/.test(token)) return 'paused'
  if (/(closed|cancelled|canceled|关闭|作废)/.test(token)) return 'closed'
  if (/(designing|developing|testing|in_progress|active|设计中|开发中|测试中|处理中)/.test(token)) return 'progress'
  if (/(backlog|researching|pending|todo|待|调研中|规划)/.test(token)) return 'pending'
  return 'glyph'
})

const priorityBars = computed(() => {
  const token = `${props.value || ''} ${props.label || ''}`.toUpperCase()
  const priority = token.match(/P[0-3]/)?.[0] || ''
  return ({ P0: 4, P1: 3, P2: 2, P3: 1 } as Record<string, number>)[priority] || 1
})
</script>

<style scoped>
.ln-option-icon { width: 14px; height: 14px; display: inline-grid; place-items: center; flex: 0 0 14px; line-height: 0; }
.ln-option-icon svg { width: 14px; height: 14px; display: block; overflow: visible; stroke: currentColor; stroke-width: 1.35; stroke-linecap: round; stroke-linejoin: round; }
.ln-option-icon .fill { fill: currentColor; stroke: none; }
.ln-option-icon .priority-bar { fill: currentColor; stroke: none; opacity: 0.18; }
.ln-option-icon .priority-bar.is-active { opacity: 1; }
.ln-option-icon__glyph { width: 14px; height: 14px; display: grid; place-items: center; overflow: hidden; font-size: 12px; line-height: 14px; font-weight: 550; font-style: normal; text-align: center; }
</style>

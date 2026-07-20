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
      <circle v-else-if="kind === 'priority'" class="fill" cx="8" cy="8" r="4" />
      <path v-else-if="kind === 'business'" d="m8 3 5 5-5 5-5-5Z" />
      <template v-else-if="kind === 'type'"><rect x="3" y="3.25" width="10" height="9.5" rx="1.25"/><path d="M5.25 6h5.5M5.25 8.25h5.5M5.25 10.5h3.25"/></template>
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
  if (/^p[0-3]$/.test(value)) return 'priority'
  if (['business', 'type', 'sprint', 'user', 'none', 'priority'].includes(String(props.icon))) return props.icon
  if (/(accepted|验收通过|已验收)/.test(token)) return 'check'
  if (/(online|done|completed|已上线|已完成)/.test(token)) return 'success'
  if (/(rejected|blocked|验收不通过|拒绝|驳回|阻塞)/.test(token)) return 'blocked'
  if (/(suspended|paused|暂停|挂起)/.test(token)) return 'paused'
  if (/(closed|cancelled|canceled|关闭|作废)/.test(token)) return 'closed'
  if (/(designing|developing|testing|in_progress|active|设计中|开发中|测试中|处理中)/.test(token)) return 'progress'
  if (/(backlog|researching|pending|todo|待|调研中|规划)/.test(token)) return 'pending'
  return 'glyph'
})
</script>

<style scoped>
.ln-option-icon { width: 14px; height: 14px; display: inline-grid; place-items: center; flex: 0 0 14px; line-height: 0; }
.ln-option-icon svg { width: 14px; height: 14px; display: block; overflow: visible; stroke: currentColor; stroke-width: 1.35; stroke-linecap: round; stroke-linejoin: round; }
.ln-option-icon .fill { fill: currentColor; stroke: none; }
.ln-option-icon__glyph { width: 14px; height: 14px; display: grid; place-items: center; overflow: hidden; font-size: 12px; line-height: 14px; font-weight: 550; font-style: normal; text-align: center; }
</style>

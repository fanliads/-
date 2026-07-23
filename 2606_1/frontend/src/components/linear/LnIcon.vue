<template>
  <svg class="ln-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <template v-if="name === 'search'">
      <circle cx="7" cy="7" r="4.25" />
      <path d="m10.25 10.25 3 3" />
    </template>
    <template v-else-if="name === 'chevron-down'">
      <path d="m4.5 6.25 3.5 3.5 3.5-3.5" />
    </template>
    <template v-else-if="name === 'chevron-left'">
      <path d="m9.75 4.5-3.5 3.5 3.5 3.5" />
    </template>
    <template v-else-if="name === 'chevron-right'">
      <path d="m6.25 4.5 3.5 3.5-3.5 3.5" />
    </template>
    <template v-else-if="name === 'plus'">
      <path d="M8 3.25v9.5M3.25 8h9.5" />
    </template>
    <template v-else-if="name === 'close'"><path d="m4.25 4.25 7.5 7.5m0-7.5-7.5 7.5" /></template>
    <template v-else-if="name === 'check'"><path d="m3.25 8.1 3.05 3.05 6.45-6.5" /></template>
    <template v-else-if="name === 'external-link'"><path d="M9 3.25h3.75V7M12.5 3.5 7.25 8.75" /><path d="M7 4.25H4.5c-.7 0-1.25.55-1.25 1.25v6c0 .7.55 1.25 1.25 1.25h6c.7 0 1.25-.55 1.25-1.25V9" /></template>
    <template v-else-if="name === 'copy'"><rect x="5.25" y="5.25" width="7.5" height="7.5" rx="1.25"/><path d="M10.75 5.25V4.5c0-.7-.55-1.25-1.25-1.25h-5c-.7 0-1.25.55-1.25 1.25v5c0 .7.55 1.25 1.25 1.25h.75"/></template>
    <template v-else-if="name === 'archive'"><rect x="3" y="4.75" width="10" height="8" rx="1.25"/><path d="M2.5 3.25h11v2.25M6.25 8h3.5"/></template>
    <template v-else-if="name === 'calendar'"><rect x="2.75" y="3.75" width="10.5" height="9.5" rx="1.5"/><path d="M5.25 2.5v2.25M10.75 2.5v2.25M2.75 6.5h10.5"/></template>
    <template v-else-if="name === 'user'"><circle cx="8" cy="5.5" r="2.25"/><path d="M3.75 13c.4-2.35 1.8-3.5 4.25-3.5s3.85 1.15 4.25 3.5"/></template>
    <template v-else-if="name === 'tag'"><path d="M2.75 7.35V3.5c0-.42.33-.75.75-.75h3.85l5.9 5.9-4.6 4.6-5.9-5.9Z"/><circle cx="5.25" cy="5.25" r=".8"/></template>
    <template v-else-if="name === 'sprint'"><path d="M8 2.75a5.25 5.25 0 1 1-4.8 3.12"/><path d="M2.75 2.75v3.5h3.5M8 5.25V8l2 1.25"/></template>
    <template v-else-if="name === 'refresh'"><path d="M12.7 6.2A5 5 0 1 0 13 9"/><path d="M10.1 3.2h2.8V6"/></template>
    <template v-else-if="name === 'more'"><circle class="ln-icon__fill" cx="3.5" cy="8" r="1"/><circle class="ln-icon__fill" cx="8" cy="8" r="1"/><circle class="ln-icon__fill" cx="12.5" cy="8" r="1"/></template>
    <template v-else-if="name === 'info'"><circle cx="8" cy="8" r="5.25"/><path d="M8 7.25v3.25"/><circle class="ln-icon__fill" cx="8" cy="5.25" r=".7"/></template>
    <template v-else-if="name === 'warning'"><path d="M7.02 3.05 2.5 11.1c-.45.8.12 1.8 1.04 1.8h8.92c.92 0 1.49-1 1.04-1.8L8.98 3.05a1.13 1.13 0 0 0-1.96 0Z"/><path d="M8 6v3.25"/><circle class="ln-icon__fill" cx="8" cy="11" r=".65"/></template>
    <template v-else-if="name === 'question'"><circle cx="8" cy="8" r="5.25"/><path d="M6.35 6.3A1.75 1.75 0 0 1 8.1 4.75c1.05 0 1.85.65 1.85 1.55 0 1.7-1.95 1.65-1.95 3"/><circle class="ln-icon__fill" cx="8" cy="11.25" r=".65"/></template>
    <template v-else-if="name === 'urgent'">
      <path class="ln-icon__urgent-fire" d="M8.75 1.5c.35 2.1-.55 3.2-1.5 4.3-.9 1.05-1.85 2.15-1.85 3.8a2.85 2.85 0 0 0 5.7 0c0-1.65-.7-3.02-2.05-4.1.08 1.15-.35 2.05-1.25 2.72.13-1.8-.55-3.15.95-6.72Z" />
      <path class="ln-icon__urgent-core" d="M8.05 7.25c1.05.95 1.48 1.72 1.48 2.55 0 .95-.68 1.7-1.53 1.7s-1.53-.75-1.53-1.7c0-.88.45-1.62 1.58-2.55Z" />
    </template>
  </svg>
</template>

<script setup lang="ts">
type LnIconName = 'search' | 'chevron-down' | 'chevron-left' | 'chevron-right' | 'plus' | 'close' | 'check' | 'external-link' | 'copy' | 'archive' | 'calendar' | 'user' | 'tag' | 'sprint' | 'refresh' | 'more' | 'info' | 'warning' | 'question' | 'urgent'
defineProps<{ name: LnIconName }>()
</script>

<style scoped>
.ln-icon {
  width: 1em;
  height: 1em;
  display: block;
  flex: 0 0 auto;
  stroke: currentColor;
  stroke-width: 1.35;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.ln-icon__fill { fill: currentColor; stroke: none; }
.ln-icon__urgent-fire { fill: #ff672f; stroke: none; }
.ln-icon__urgent-core { fill: #fff3cf; stroke: none; }
</style>

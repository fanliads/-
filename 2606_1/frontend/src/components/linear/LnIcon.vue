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
    <template v-else-if="name === 'urgent'">
      <path d="M8.35 1.75c.18 1.92-.72 3.08-1.66 4.16-.92 1.05-1.88 2.15-1.88 3.88a3.19 3.19 0 0 0 6.38 0c0-1.48-.62-2.73-1.72-3.72.06 1.18-.42 2.05-1.31 2.7.1-2.02-.85-3.47.19-7.02Z" />
    </template>
  </svg>
</template>

<script setup lang="ts">
defineProps<{ name: 'search' | 'chevron-down' | 'chevron-left' | 'chevron-right' | 'plus' | 'urgent' }>()
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
</style>

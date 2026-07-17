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
  </svg>
</template>

<script setup lang="ts">
defineProps<{ name: 'search' | 'chevron-down' | 'chevron-left' | 'chevron-right' | 'plus' }>()
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

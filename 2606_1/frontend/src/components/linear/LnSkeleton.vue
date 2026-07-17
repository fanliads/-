<template><div class="ln-skeleton" :class="{circle}" :style="style" aria-hidden="true"/></template>
<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  width?: string
  height?: string
  circle?: boolean
}>(), { width: '100%', height: '12px', circle: false })

const style = computed(() => ({
  width: props.width,
  height: props.circle ? props.width : props.height,
}))
</script>
<style scoped lang="scss">.ln-skeleton{border-radius:4px;background:linear-gradient(90deg,#ececee 20%,#f6f6f7 40%,#ececee 60%);background-size:300% 100%;animation:shimmer 1.5s ease infinite}.circle{border-radius:50%}@keyframes shimmer{0%{background-position:100% 0}100%{background-position:0 0}}</style>

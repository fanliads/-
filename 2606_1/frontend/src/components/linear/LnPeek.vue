<template>
  <Teleport to="body"><Transition name="ln-peek">
    <div v-if="open" class="ln-peek-layer" @mousedown.self="$emit('close')">
      <aside class="ln-peek" role="dialog" aria-modal="true" :aria-label="title">
        <header class="ln-peek__header"><div><span class="ln-peek__eyebrow">{{ issueKey }}</span><h2>{{ title }}</h2></div><LnButton icon-only variant="ghost" aria-label="关闭" @click="$emit('close')"> <template #icon>×</template></LnButton></header>
        <div class="ln-peek__body"><slot /></div>
        <footer v-if="$slots.footer" class="ln-peek__footer"><slot name="footer" /></footer>
      </aside>
    </div>
  </Transition></Teleport>
</template>
<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'; import LnButton from './LnButton.vue'
const props = defineProps<{ open:boolean; title:string; issueKey?:string }>(); const emit = defineEmits<{(e:'close'):void}>()
function escape(event:KeyboardEvent) { if (props.open && event.key === 'Escape') emit('close') }
onMounted(() => document.addEventListener('keydown', escape)); onBeforeUnmount(() => document.removeEventListener('keydown', escape))
</script>
<style scoped lang="scss">
.ln-peek-layer { position: fixed; z-index: 500; inset: 0; background: rgba(25,25,28,.12); }.ln-peek { position: absolute; top: 8px; right: 8px; bottom: 8px; width: min(520px, calc(100vw - 16px)); display: grid; grid-template-rows: auto 1fr auto; overflow: hidden; border: 1px solid var(--ln-border); border-radius: 12px; background: var(--ln-surface); box-shadow: var(--ln-shadow-peek); color: var(--ln-text); font-family: var(--ln-font); }.ln-peek__header { min-height: 76px; padding: 15px 16px; display: flex; align-items: flex-start; justify-content: space-between; border-bottom: 1px solid var(--ln-border); h2 { margin: 4px 0 0; font-size: 17px; line-height: 1.35; font-weight: 590; } }.ln-peek__eyebrow { color: var(--ln-text-tertiary); font-size: 11px; }.ln-peek__body { overflow: auto; padding: 18px; }.ln-peek__footer { padding: 10px 14px; border-top: 1px solid var(--ln-border); display: flex; justify-content: flex-end; gap: 8px; }.ln-peek-enter-active,.ln-peek-leave-active { transition: opacity var(--ln-normal); }.ln-peek-enter-active .ln-peek,.ln-peek-leave-active .ln-peek { transition: transform var(--ln-normal), opacity var(--ln-normal); }.ln-peek-enter-from,.ln-peek-leave-to { opacity:0; }.ln-peek-enter-from .ln-peek,.ln-peek-leave-to .ln-peek { transform: translateX(18px); opacity:0; }
</style>

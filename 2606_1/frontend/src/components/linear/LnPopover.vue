<template>
  <span ref="root" class="ln-popover-root">
    <span class="ln-popover-trigger" @click="toggle"><slot name="trigger" :open="open" :close="close" /></span>
    <Transition name="ln-popover"><div v-if="open" class="ln-popover" :class="`is-${align}`" role="dialog" @click.stop><slot :close="close" /></div></Transition>
  </span>
</template>
<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
withDefaults(defineProps<{ align?: 'start'|'center'|'end' }>(), { align: 'start' })
const emit = defineEmits<{ (e:'update:open', value:boolean):void }>()
const root = ref<HTMLElement>(); const open = ref(false)
function setOpen(value:boolean) { open.value = value; emit('update:open', value) }
function toggle() { setOpen(!open.value) } function close() { setOpen(false) }
function outside(event:MouseEvent) { if (open.value && !root.value?.contains(event.target as Node)) close() }
function escape(event:KeyboardEvent) { if (event.key === 'Escape') close() }
onMounted(() => { document.addEventListener('mousedown', outside); document.addEventListener('keydown', escape) })
onBeforeUnmount(() => { document.removeEventListener('mousedown', outside); document.removeEventListener('keydown', escape) })
</script>
<style scoped lang="scss">
.ln-popover-root { position: relative; display: inline-flex; }.ln-popover-trigger { display: inline-flex; }
.ln-popover { position: absolute; z-index: 200; top: calc(100% + 6px); left: 0; min-width: 220px; padding: 6px; border: 1px solid var(--ln-border); border-radius: var(--ln-radius-lg); background: var(--ln-surface-raised); box-shadow: var(--ln-shadow-popover); color: var(--ln-text); font-family: var(--ln-font); &.is-center { left: 50%; transform: translateX(-50%); } &.is-end { left: auto; right: 0; } }
.ln-popover-enter-active,.ln-popover-leave-active { transition: opacity var(--ln-fast), transform var(--ln-fast); transform-origin: top; }.ln-popover-enter-from,.ln-popover-leave-to { opacity: 0; transform: translateY(-3px) scale(.98); }
</style>

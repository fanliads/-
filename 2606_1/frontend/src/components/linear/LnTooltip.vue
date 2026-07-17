<template><span class="tooltip-root" tabindex="0"><slot/><span class="tooltip-bubble" :class="`is-${placement}`" role="tooltip">{{text}}<kbd v-if="shortcut">{{shortcut}}</kbd></span></span></template>
<script setup lang="ts">
withDefaults(defineProps<{
  text: string
  shortcut?: string
  placement?: 'top' | 'bottom'
}>(), { placement: 'top' })
</script>
<style scoped lang="scss">
.tooltip-root{position:relative;display:inline-flex}.tooltip-bubble{position:absolute;z-index:300;left:50%;width:max-content;max-width:230px;padding:6px 8px;display:flex;align-items:center;gap:8px;border-radius:6px;background:#27272b;color:#fff;box-shadow:var(--ln-shadow-popover);font:11px var(--ln-font);pointer-events:none;opacity:0;transform:translate(-50%,3px);transition:opacity var(--ln-fast),transform var(--ln-fast);&.is-top{bottom:calc(100% + 7px);transform:translate(-50%,3px)}&.is-bottom{top:calc(100% + 7px);transform:translate(-50%,-3px)}kbd{padding:1px 4px;border:1px solid rgba(255,255,255,.2);border-radius:3px;color:#ccc;font:9px var(--ln-font)}}.tooltip-root:hover .tooltip-bubble,.tooltip-root:focus-within .tooltip-bubble{opacity:1;transform:translate(-50%,0)}
</style>

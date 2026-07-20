<template><section class="ln-form-section"><header><span v-if="eyebrow">{{eyebrow}}</span><div><h3>{{title}}</h3><p v-if="description">{{description}}</p></div><slot name="actions"/></header><div class="ln-form-section__body"><slot/></div></section></template>
<script setup lang="ts">
defineProps<{title:string;description?:string;eyebrow?:string}>()
</script>
<style scoped lang="scss">.ln-form-section{border:1px solid var(--ln-border);border-radius:10px;background:var(--ln-surface);overflow:hidden;font-family:var(--ln-font)}.ln-form-section>header{padding:14px 16px;display:flex;align-items:flex-start;gap:11px;border-bottom:1px solid var(--ln-border);background:#fafafa;>span{padding-top:2px;color:var(--ln-accent);font-size:11px;font-weight:700;letter-spacing:.08em}div{flex:1}h3{margin:0;color:var(--ln-text);font-size:13px;font-weight:590}p{margin:4px 0 0;color:var(--ln-text-tertiary);font-size:11px;line-height:1.55}}.ln-form-section__body{padding:16px}</style>

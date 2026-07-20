<template><div class="ln-date-range"><LnIcon name="calendar"/><input :value="start" type="date" aria-label="开始日期" @input="updateStart"/><em>至</em><input :value="end" type="date" aria-label="结束日期" :min="start" @input="updateEnd"/><button v-if="clearable&&(start||end)" type="button" aria-label="清除日期" @click="clear"><LnIcon name="close"/></button></div></template>
<script setup lang="ts">
import{computed}from'vue'
import LnIcon from './LnIcon.vue'
const props=withDefaults(defineProps<{modelValue?:string[];clearable?:boolean}>(),{modelValue:()=>[]})
const emit=defineEmits<{(e:'update:modelValue',value:string[]):void;(e:'change',value:string[]|null):void}>()
const start=computed(()=>props.modelValue[0]||'');const end=computed(()=>props.modelValue[1]||'')
function commit(a:string,b:string){const value=a||b?[a,b]:[];emit('update:modelValue',value);emit('change',value.length?value:null)}
function updateStart(e:Event){commit((e.target as HTMLInputElement).value,end.value)}function updateEnd(e:Event){commit(start.value,(e.target as HTMLInputElement).value)}function clear(){commit('','')}
</script>
<style scoped lang="scss">.ln-date-range{min-height:var(--ln-control-md);padding:0 7px;display:flex;align-items:center;gap:5px;border:1px solid var(--ln-border-strong);border-radius:var(--ln-radius-md);background:var(--ln-surface);color:var(--ln-text-tertiary);font-family:var(--ln-font);>svg{width:15px;height:15px;flex:none;color:var(--ln-icon)}&:focus-within{border-color:rgba(94,106,210,.62);box-shadow:0 0 0 2px var(--ln-accent-soft)}input{min-width:108px;height:28px;padding:0 2px;border:0;outline:0;background:transparent;color:var(--ln-text-secondary);font:12px var(--ln-font)}em{font-size:11px;font-style:normal}button{width:24px;height:24px;display:grid;place-items:center;border:0;border-radius:4px;background:transparent;color:var(--ln-icon-muted);cursor:pointer;&:hover{background:var(--ln-surface-hover);color:var(--ln-text)}svg{width:14px;height:14px}}}</style>

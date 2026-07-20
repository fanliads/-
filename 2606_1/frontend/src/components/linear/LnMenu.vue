<template>
  <div class="ln-menu" role="menu">
    <template v-for="(item, index) in items" :key="item.value">
      <div v-if="item.separatorBefore && index" class="ln-menu__separator" />
      <button class="ln-menu__item ln-focus-ring" :class="{ 'is-danger': item.danger, 'is-active': item.value === modelValue }" type="button" role="menuitem" :disabled="item.disabled" @click="select(item)">
        <span v-if="item.icon" class="ln-menu__icon"><LnIcon :name="resolveIcon(item)" /></span><span class="ln-menu__label"><b>{{ item.label }}</b><small v-if="item.description">{{ item.description }}</small></span><kbd v-if="item.shortcut">{{ item.shortcut }}</kbd><LnIcon v-if="item.value === modelValue" class="ln-menu__check" name="check" />
      </button>
    </template>
  </div>
</template>
<script setup lang="ts">
import LnIcon from './LnIcon.vue'
export interface MenuItem { label:string; value:string; icon?:string; description?:string; shortcut?:string; disabled?:boolean; danger?:boolean; separatorBefore?:boolean }
defineProps<{ items:MenuItem[]; modelValue?:string }>()
const emit = defineEmits<{(e:'update:modelValue', value:string):void;(e:'select', item:MenuItem):void}>()
function select(item:MenuItem){ if(item.disabled)return; emit('update:modelValue',item.value); emit('select',item) }
function resolveIcon(item:MenuItem) {
  const token = `${item.value} ${item.label} ${item.icon}`.toLowerCase()
  if (/(copy|复制)/.test(token)) return 'copy'
  if (/(archive|归档)/.test(token)) return 'archive'
  if (/(delete|删除|close|退出)/.test(token)) return 'close'
  if (/(open|convert|external-link|转为)/.test(token)) return 'external-link'
  if (/(user|profile|个人)/.test(token)) return 'user'
  if (/(new|create|plus|新增|新建)/.test(token)) return 'plus'
  return 'more'
}
</script>
<style scoped lang="scss">
.ln-menu{display:grid;gap:2px;min-width:220px;font-family:var(--ln-font)}.ln-menu__item{width:100%;min-height:34px;padding:6px 8px;display:flex;align-items:center;gap:9px;border:0;border-radius:var(--ln-radius-sm);background:transparent;color:var(--ln-text);text-align:left;cursor:pointer;&:hover,&.is-active{background:var(--ln-surface-hover)}&:disabled{opacity:.42;cursor:not-allowed}&.is-danger{color:var(--ln-danger)}kbd{margin-left:auto;padding:2px 5px;border:1px solid var(--ln-border);border-radius:4px;background:var(--ln-canvas);color:var(--ln-text-tertiary);font:11px var(--ln-font)}}.ln-menu__icon{width:16px;height:16px;display:grid;place-items:center;color:var(--ln-icon);svg{width:16px;height:16px}}.ln-menu__check{width:14px;height:14px;margin-left:auto;color:var(--ln-accent)}.ln-menu__label{display:grid;gap:2px;min-width:0;b{font-size:13px;font-weight:540}small{color:var(--ln-text-tertiary);font-size:11px}}.ln-menu__separator{height:1px;margin:4px -6px;background:var(--ln-border)}
</style>

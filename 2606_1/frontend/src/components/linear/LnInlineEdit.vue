<template>
  <span class="ln-inline-edit" :class="{ 'is-editing': editing }">
    <button v-if="!editing" class="ln-inline-edit__value ln-focus-ring" type="button" @click="start">{{ modelValue || placeholder }}</button>
    <input v-else ref="input" v-model="draft" class="ln-inline-edit__input" @keydown.enter="save" @keydown.esc="cancel" @blur="save" />
  </span>
</template>
<script setup lang="ts">
import { nextTick, ref } from 'vue'
const props = withDefaults(defineProps<{ modelValue?: string; placeholder?: string }>(), { modelValue: '', placeholder: '点击编辑' })
const emit = defineEmits<{ (e:'update:modelValue', value:string):void; (e:'save', value:string):void }>()
const editing = ref(false); const draft = ref(''); const input = ref<HTMLInputElement>()
function start() { draft.value = props.modelValue; editing.value = true; nextTick(() => { input.value?.focus(); input.value?.select() }) }
function save() { if (!editing.value) return; editing.value = false; const value = draft.value.trim(); if (value !== props.modelValue) { emit('update:modelValue', value); emit('save', value) } }
function cancel() { draft.value = props.modelValue; editing.value = false }
</script>
<style scoped lang="scss">
.ln-inline-edit { display: inline-flex; min-width: 60px; }.ln-inline-edit__value { min-height: 26px; max-width: 100%; padding: 3px 6px; border: 1px solid transparent; border-radius: var(--ln-radius-sm); background: transparent; color: inherit; font: inherit; text-align: left; cursor: text; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; &:hover { background: var(--ln-surface-hover); border-color: var(--ln-border); } }.ln-inline-edit__input { width: 100%; min-height: 26px; padding: 3px 6px; color: var(--ln-text); background: var(--ln-surface); border: 1px solid var(--ln-accent); border-radius: var(--ln-radius-sm); outline: 0; box-shadow: 0 0 0 2px var(--ln-accent-soft); font: inherit; }
</style>

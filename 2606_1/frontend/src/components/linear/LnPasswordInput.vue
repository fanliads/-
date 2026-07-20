<template>
  <label class="ln-password-field" :class="{ 'has-error': error, 'is-disabled': disabled }">
    <span v-if="label" class="ln-password-field__label">{{ label }}</span>
    <span class="ln-password-wrap">
      <span v-if="$slots.prefix" class="ln-password__affix"><slot name="prefix" /></span>
      <input
        class="ln-password ln-focus-ring"
        :value="modelValue"
        :type="visible ? 'text' : 'password'"
        :placeholder="placeholder"
        :disabled="disabled"
        :autocomplete="autocomplete"
        :aria-invalid="!!error"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        @keydown="$emit('keydown', $event)"
      />
      <button class="ln-password__toggle ln-focus-ring" type="button" :aria-label="visible ? '隐藏密码' : '显示密码'" :aria-pressed="visible" @click="visible = !visible">
        <svg v-if="visible" viewBox="0 0 16 16"><path d="M2 2l12 12M6.3 6.3a2.4 2.4 0 003.4 3.4M4.5 4.8C3.2 5.6 2.3 6.8 1.7 8c1.3 2.7 3.4 4.2 6.3 4.2 1 0 1.9-.2 2.7-.5M7.3 3.8H8c2.9 0 5 1.5 6.3 4.2-.4.9-1 1.7-1.7 2.3"/></svg>
        <svg v-else viewBox="0 0 16 16"><path d="M1.7 8C3 5.3 5.1 3.8 8 3.8s5 1.5 6.3 4.2C13 10.7 10.9 12.2 8 12.2S3 10.7 1.7 8z"/><circle cx="8" cy="8" r="2.3"/></svg>
      </button>
    </span>
    <span v-if="error || hint" class="ln-password-field__message">{{ error || hint }}</span>
  </label>
</template>

<script setup lang="ts">
import { ref } from 'vue'

withDefaults(defineProps<{
  modelValue?: string
  label?: string
  placeholder?: string
  hint?: string
  error?: string
  disabled?: boolean
  autocomplete?: string
}>(), { modelValue: '', autocomplete: 'current-password' })

defineEmits<{
  'update:modelValue': [value: string]
  keydown: [event: KeyboardEvent]
}>()

const visible = ref(false)
</script>

<style scoped lang="scss">
.ln-password-field{display:grid;gap:6px;font-family:var(--ln-font)}.ln-password-field__label{color:var(--ln-text);font-size:12px;font-weight:540}.ln-password-wrap{min-height:var(--ln-control-md);display:flex;align-items:center;gap:7px;border:1px solid var(--ln-border-strong);border-radius:var(--ln-radius-md);background:var(--ln-surface);transition:border var(--ln-fast),box-shadow var(--ln-fast);&:focus-within{border-color:rgba(94,106,210,.62);box-shadow:0 0 0 2px var(--ln-accent-soft)}}.ln-password{min-width:0;width:100%;height:30px;padding:0 9px;border:0;outline:0;background:transparent;color:var(--ln-text);font:400 13px/1 var(--ln-font);&::placeholder{color:var(--ln-text-tertiary)}}.ln-password__affix{padding-left:9px;color:var(--ln-icon);display:inline-flex}.ln-password__affix+.ln-password{padding-left:0}.ln-password__toggle{width:27px;height:27px;margin-right:3px;padding:0;display:grid;place-items:center;border:0;border-radius:5px;background:transparent;color:var(--ln-icon-muted);cursor:pointer;&:hover{color:var(--ln-text);background:var(--ln-surface-hover)}svg{width:15px;height:15px;fill:none;stroke:currentColor;stroke-width:1.2;stroke-linecap:round;stroke-linejoin:round}}.ln-password-field__message{color:var(--ln-text-tertiary);font-size:11px}.has-error .ln-password-wrap{border-color:var(--ln-danger)}.has-error .ln-password-field__message{color:var(--ln-danger)}.is-disabled{opacity:.55}
</style>

<template>
  <label class="ln-field" :class="{ 'has-error': error, 'is-disabled': disabled }">
    <span v-if="label" class="ln-field__label">{{ label }}</span>
    <span class="ln-input-wrap">
      <span v-if="$slots.prefix" class="ln-input__affix"><slot name="prefix" /></span>
      <input
        class="ln-input ln-focus-ring" :value="modelValue" :type="type" :placeholder="placeholder"
        :disabled="disabled" :maxlength="maxlength" :autocomplete="autocomplete" :aria-invalid="!!error" @input="onInput" @keydown="$emit('keydown', $event)"
      />
      <button v-if="clearable && modelValue" class="ln-input__clear" type="button" aria-label="清空" @click="$emit('update:modelValue', '')">×</button>
    </span>
    <span v-if="showCount && maxlength" class="ln-field__count">{{ modelValue.length }} / {{ maxlength }}</span>
    <span v-if="error || hint" class="ln-field__message">{{ error || hint }}</span>
  </label>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ modelValue?: string; label?: string; placeholder?: string; type?: string; hint?: string; error?: string; disabled?: boolean; clearable?: boolean; maxlength?: number; showCount?: boolean; autocomplete?: string }>(), { modelValue: '', type: 'text' })
const emit = defineEmits<{ (e: 'update:modelValue', value: string): void; (e: 'keydown', event: KeyboardEvent): void }>()
function onInput(event: Event) { emit('update:modelValue', (event.target as HTMLInputElement).value) }
</script>

<style scoped lang="scss">
.ln-field { display: grid; gap: 6px; font-family: var(--ln-font); }
.ln-field__label { color: var(--ln-text); font-size: 12px; font-weight: 540; }
.ln-input-wrap { width: 100%; height: var(--ln-control-md); min-height: var(--ln-control-md); box-sizing: border-box; display: flex; align-items: center; gap: 7px; background: var(--ln-surface); border: 1px solid var(--ln-border-strong); border-radius: var(--ln-radius-md); transition: border var(--ln-fast), box-shadow var(--ln-fast); &:focus-within { border-color: rgba(94,106,210,.62); box-shadow: 0 0 0 2px var(--ln-accent-soft); } }
.ln-input { min-width: 0; width: 100%; height: 100%; padding: 0 9px; border: 0; outline: 0; background: transparent; color: var(--ln-text); font: 400 13px/1 var(--ln-font); &::placeholder { color: var(--ln-text-tertiary); } }
.ln-input__affix { min-width: 15px; height: 100%; padding-left: 9px; box-sizing: content-box; color: var(--ln-text-tertiary); display: inline-flex; align-items: center; justify-content: center; flex: 0 0 auto; font-size: 14px; line-height: 0; }
.ln-input__affix + .ln-input { padding-left: 0; }
.ln-input__clear { margin-right: 6px; border: 0; background: none; color: var(--ln-text-tertiary); cursor: pointer; font-size: 16px; }
.ln-field__message { color: var(--ln-text-tertiary); font-size: 11px; }
.ln-field__count { justify-self:end;margin-top:-3px;color:var(--ln-text-tertiary);font-size:10px;font-variant-numeric:tabular-nums; }
.has-error .ln-input-wrap { border-color: var(--ln-danger); }.has-error .ln-field__message { color: var(--ln-danger); }.is-disabled { opacity: .55; }
</style>

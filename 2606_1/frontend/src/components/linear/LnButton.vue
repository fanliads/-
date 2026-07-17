<template>
  <component
    :is="href ? 'a' : 'button'"
    class="ln-button ln-focus-ring"
    :class="[`is-${variant}`, `is-${size}`, { 'is-icon': iconOnly, 'is-loading': loading }]"
    :type="href ? undefined : nativeType"
    :href="href && !disabled && !loading ? href : undefined"
    :target="href ? target : undefined"
    :rel="href ? rel : undefined"
    :disabled="href ? undefined : disabled || loading"
    :aria-disabled="href && (disabled || loading) ? 'true' : undefined"
    @click="handleClick"
  >
    <span v-if="loading" class="ln-button__spinner" aria-hidden="true" />
    <span v-else-if="$slots.icon" class="ln-button__icon"><slot name="icon" /></span>
    <span v-if="!iconOnly" class="ln-button__label"><slot /></span>
  </component>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'small' | 'medium'
  nativeType?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  loading?: boolean
  iconOnly?: boolean
  href?: string
  target?: '_self' | '_blank' | '_parent' | '_top'
  rel?: string
}>(), { variant: 'secondary', size: 'medium', nativeType: 'button' })

function handleClick(event: MouseEvent) {
  if (props.disabled || props.loading) event.preventDefault()
}
</script>

<style scoped lang="scss">
.ln-button {
  height: var(--ln-control-md); padding: 0 11px; border: 1px solid transparent;
  border-radius: var(--ln-radius-md); display: inline-flex; align-items: center; justify-content: center;
  gap: 6px; color: var(--ln-text); background: transparent; font: 500 13px/1 var(--ln-font);
  cursor: pointer; transition: background var(--ln-fast), border-color var(--ln-fast), box-shadow var(--ln-fast), transform var(--ln-fast);
  white-space: nowrap; user-select: none;
  text-decoration: none;
  &:active:not(:disabled) { transform: translateY(1px); }
  &:disabled { opacity: .48; cursor: not-allowed; }
  &.is-small { height: var(--ln-control-sm); padding: 0 9px; font-size: 12px; }
  &.is-icon { width: var(--ln-control-md); padding: 0; }
  &.is-icon.is-small { width: var(--ln-control-sm); }
  &.is-primary { color: #fff; background: var(--ln-accent); box-shadow: inset 0 0 0 1px rgba(0,0,0,.08), 0 1px 2px rgba(31,35,80,.18); &:hover:not(:disabled) { background: var(--ln-accent-hover); } }
  &.is-secondary { background: var(--ln-surface); border-color: var(--ln-border-strong); box-shadow: 0 1px 2px rgba(20,20,24,.04); &:hover:not(:disabled) { background: var(--ln-surface-hover); } }
  &.is-ghost { color: var(--ln-text-secondary); &:hover:not(:disabled) { color: var(--ln-text); background: var(--ln-surface-hover); } }
  &.is-danger { color: #fff; background: var(--ln-danger); &:hover:not(:disabled) { filter: brightness(.94); } }
}
.ln-button__icon { width: 16px; height: 16px; display: inline-flex; align-items: center; justify-content: center; flex: 0 0 16px; font-size: 15px; line-height: 0; }
.ln-button__spinner { width: 13px; height: 13px; border: 1.5px solid currentColor; border-right-color: transparent; border-radius: 50%; animation: spin .7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>

<template>
  <Teleport to="body">
    <Transition name="ln-dialog">
      <div v-if="modelValue" class="ln-dialog-layer" @mousedown.self="onBackdrop">
        <section
          ref="dialog"
          class="ln-dialog"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="titleId"
          :aria-describedby="description ? descriptionId : undefined"
          :style="{ width }"
          tabindex="-1"
        >
          <header class="ln-dialog__header">
            <div><h2 :id="titleId">{{ title }}</h2><p v-if="description" :id="descriptionId">{{ description }}</p></div>
            <button v-if="showClose" class="ln-dialog__close ln-focus-ring" type="button" aria-label="关闭对话框" @click="close"><LnIcon name="close" /></button>
          </header>
          <div class="ln-dialog__body"><slot /></div>
          <footer v-if="$slots.footer" class="ln-dialog__footer"><slot name="footer" /></footer>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'
import LnIcon from './LnIcon.vue'

const props = withDefaults(defineProps<{
  modelValue: boolean
  title: string
  description?: string
  width?: string
  closeOnBackdrop?: boolean
  closeOnEsc?: boolean
  showClose?: boolean
}>(), { width: '520px', closeOnBackdrop: true, closeOnEsc: true, showClose: true })

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  open: []
  close: []
}>()

const dialog = ref<HTMLElement>()
const titleId = `ln-dialog-title-${Math.random().toString(36).slice(2, 9)}`
const descriptionId = `${titleId}-description`
let previousFocus: HTMLElement | null = null
let previousOverflow = ''
let active = false

function close() { emit('update:modelValue', false) }
function onBackdrop() { if (props.closeOnBackdrop) close() }
function focusableElements() {
  return Array.from(dialog.value?.querySelectorAll<HTMLElement>('button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])') || [])
}
function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && props.closeOnEsc) { event.preventDefault(); close(); return }
  if (event.key !== 'Tab') return
  const items = focusableElements()
  if (!items.length) { event.preventDefault(); dialog.value?.focus(); return }
  const first = items[0]; const last = items[items.length - 1]
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
}
function release() {
  if (!active) return
  active = false
  document.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = previousOverflow
  previousFocus?.focus()
}

watch(() => props.modelValue, async (open) => {
  if (open) {
    active = true
    previousFocus = document.activeElement as HTMLElement | null
    previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKeydown)
    await nextTick()
    ;(focusableElements()[0] || dialog.value)?.focus()
    emit('open')
  } else {
    if (!active) return
    release()
    emit('close')
  }
}, { immediate: true })

onBeforeUnmount(release)
</script>

<style scoped lang="scss">
.ln-dialog-layer { position:fixed;inset:0;z-index:2200;padding:24px;display:grid;place-items:center;background:rgba(22,22,26,.42);backdrop-filter:blur(3px);font-family:var(--ln-font); }
.ln-dialog { max-width:calc(100vw - 32px);max-height:calc(100vh - 48px);overflow:hidden;border:1px solid rgba(255,255,255,.55);border-radius:12px;display:flex;flex-direction:column;color:var(--ln-text);background:var(--ln-surface-raised);box-shadow:0 24px 70px rgba(20,20,24,.24),0 4px 16px rgba(20,20,24,.12);outline:0; }
.ln-dialog__header { min-height:64px;padding:17px 18px 13px;display:flex;align-items:flex-start;justify-content:space-between;gap:16px;border-bottom:1px solid var(--ln-border); h2{margin:0;font-size:17px;font-weight:650;line-height:23px;letter-spacing:-.01em} p{margin:4px 0 0;color:var(--ln-text-tertiary);font-size:13px;line-height:1.55} }
.ln-dialog__close { width:28px;height:28px;display:grid;place-items:center;flex:none;border:0;border-radius:5px;color:var(--ln-icon);background:transparent;cursor:pointer;&:hover{color:var(--ln-text);background:var(--ln-surface-hover)}svg{width:16px;height:16px} }
.ln-dialog__body { min-height:0;padding:16px 18px;overflow:auto; }
.ln-dialog__footer { padding:12px 18px;display:flex;justify-content:flex-end;gap:8px;border-top:1px solid var(--ln-border);background:#fcfcfd; }
.ln-dialog-enter-active,.ln-dialog-leave-active{transition:opacity var(--ln-normal)}.ln-dialog-enter-active .ln-dialog,.ln-dialog-leave-active .ln-dialog{transition:transform var(--ln-normal),opacity var(--ln-normal)}.ln-dialog-enter-from,.ln-dialog-leave-to{opacity:0}.ln-dialog-enter-from .ln-dialog,.ln-dialog-leave-to .ln-dialog{opacity:0;transform:translateY(8px) scale(.985)}
@media(max-width:640px){.ln-dialog-layer{padding:0;align-items:end}.ln-dialog{width:100%!important;max-width:none;max-height:88vh;border-radius:14px 14px 0 0}.ln-dialog__body{padding:16px}}
</style>

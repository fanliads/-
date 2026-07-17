<template>
  <Teleport to="body">
    <Transition name="ln-drawer">
      <div v-if="modelValue" class="ln-drawer-layer" @mousedown.self="onBackdrop">
        <aside
          ref="drawer"
          class="ln-drawer"
          role="dialog"
          aria-modal="true"
          :aria-label="ariaLabel"
          :style="{ width: normalizedWidth }"
          tabindex="-1"
        >
          <header v-if="$slots.header || showClose" class="ln-drawer__header">
            <div class="ln-drawer__heading"><slot name="header" /></div>
            <button v-if="showClose" class="ln-drawer__close ln-focus-ring" type="button" aria-label="关闭抽屉" @click="requestClose">×</button>
          </header>
          <div class="ln-drawer__body"><slot /></div>
          <footer v-if="$slots.footer" class="ln-drawer__footer"><slot name="footer" /></footer>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'

const props = withDefaults(defineProps<{
  modelValue: boolean
  width?: string | number
  ariaLabel?: string
  closeOnBackdrop?: boolean
  closeOnEsc?: boolean
  showClose?: boolean
}>(), {
  width: '640px',
  ariaLabel: '详情抽屉',
  closeOnBackdrop: true,
  closeOnEsc: true,
  showClose: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  open: []
  close: []
}>()

const drawer = ref<HTMLElement>()
const normalizedWidth = computed(() => typeof props.width === 'number' ? `${props.width}px` : props.width)
let previousFocus: HTMLElement | null = null
let previousOverflow = ''
let active = false

function requestClose() {
  emit('update:modelValue', false)
  emit('close')
}

function onBackdrop() {
  if (props.closeOnBackdrop) requestClose()
}

function focusableElements() {
  return Array.from(drawer.value?.querySelectorAll<HTMLElement>('button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])') || [])
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && props.closeOnEsc) {
    event.preventDefault()
    requestClose()
    return
  }
  if (event.key !== 'Tab') return
  const items = focusableElements()
  if (!items.length) {
    event.preventDefault()
    drawer.value?.focus()
    return
  }
  const first = items[0]
  const last = items[items.length - 1]
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
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
    ;(focusableElements()[0] || drawer.value)?.focus()
    emit('open')
  } else {
    release()
  }
}, { immediate: true })

onBeforeUnmount(release)
</script>

<style scoped lang="scss">
.ln-drawer-layer { position: fixed; inset: 0; z-index: 2200; display: flex; justify-content: flex-end; background: rgba(22,22,26,.34); backdrop-filter: blur(2px); font-family: var(--ln-font); }
.ln-drawer { width: 640px; max-width: min(92vw, 760px); height: 100%; display: flex; flex-direction: column; overflow: hidden; outline: 0; border-left: 1px solid rgba(255,255,255,.62); background: var(--ln-surface-raised); color: var(--ln-text); box-shadow: var(--ln-shadow-peek); }
.ln-drawer__header { min-height: 68px; padding: 16px 20px; display: flex; align-items: flex-start; gap: 14px; border-bottom: 1px solid var(--ln-border); }
.ln-drawer__heading { min-width: 0; flex: 1; }
.ln-drawer__close { width: 28px; height: 28px; flex: none; border: 0; border-radius: var(--ln-radius-sm); background: transparent; color: var(--ln-text-tertiary); font-size: 19px; cursor: pointer; &:hover { background: var(--ln-surface-hover); color: var(--ln-text); } }
.ln-drawer__body { min-height: 0; flex: 1; overflow: auto; overscroll-behavior: contain; }
.ln-drawer__footer { padding: 12px 20px; display: flex; justify-content: flex-end; gap: 8px; border-top: 1px solid var(--ln-border); }
.ln-drawer-enter-active,.ln-drawer-leave-active { transition: opacity var(--ln-normal); }.ln-drawer-enter-active .ln-drawer,.ln-drawer-leave-active .ln-drawer { transition: transform var(--ln-normal); }.ln-drawer-enter-from,.ln-drawer-leave-to { opacity: 0; }.ln-drawer-enter-from .ln-drawer,.ln-drawer-leave-to .ln-drawer { transform: translateX(24px); }
@media (max-width: 640px) { .ln-drawer { width: 100%!important; max-width: none; }.ln-drawer__header { padding: 14px 16px; } }
</style>

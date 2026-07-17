import { readonly, ref } from 'vue'
import type { LnToastItem } from './types'

export type LnToastTone = NonNullable<LnToastItem['tone']>

export interface LnToastOptions {
  title: string
  description?: string
  duration?: number
}

const items = ref<LnToastItem[]>([])
const timers = new Map<string, ReturnType<typeof setTimeout>>()
let sequence = 0

function dismiss(id: string | number) {
  const key = String(id)
  const timer = timers.get(key)
  if (timer) clearTimeout(timer)
  timers.delete(key)
  items.value = items.value.filter((item) => item.id !== id)
}

function show(tone: LnToastTone, input: string | LnToastOptions) {
  const options = typeof input === 'string' ? { title: input } : input
  const id = `toast-${Date.now()}-${sequence += 1}`
  const item: LnToastItem = {
    id,
    title: options.title,
    description: options.description,
    tone,
  }

  items.value = [...items.value, item]
  while (items.value.length > 5) dismiss(items.value[0]!.id)

  const duration = options.duration ?? 3600
  if (duration > 0) timers.set(id, setTimeout(() => dismiss(id), duration))
  return id
}

function clear() {
  for (const timer of timers.values()) clearTimeout(timer)
  timers.clear()
  items.value = []
}

export const lnToast = {
  show: (input: string | LnToastOptions) => show('neutral', input),
  info: (input: string | LnToastOptions) => show('neutral', input),
  success: (input: string | LnToastOptions) => show('success', input),
  warning: (input: string | LnToastOptions) => show('warning', input),
  error: (input: string | LnToastOptions) => show('danger', input),
  danger: (input: string | LnToastOptions) => show('danger', input),
  dismiss,
  clear,
}

export function useLnToast() {
  return {
    items: readonly(items),
    dismiss,
  }
}

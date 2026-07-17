import { computed, shallowRef } from 'vue'

export type LnConfirmTone = 'neutral' | 'warning' | 'danger'

export interface LnConfirmOptions {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  tone?: LnConfirmTone
}

export interface LnPromptOptions extends LnConfirmOptions {
  initialValue?: string
  placeholder?: string
  inputPattern?: RegExp
  inputErrorMessage?: string
}

export interface LnConfirmRequest extends LnConfirmOptions {
  id: number
  kind: 'confirm' | 'prompt'
  initialValue?: string
  placeholder?: string
  inputPattern?: RegExp
  inputErrorMessage?: string
}

interface InternalRequest extends LnConfirmRequest {
  resolve: (value?: string) => void
  reject: (reason: Error) => void
}

export class LnConfirmCancelledError extends Error {
  constructor() {
    super('Confirmation cancelled')
    this.name = 'LnConfirmCancelledError'
  }
}

const current = shallowRef<InternalRequest | null>(null)
const queue: InternalRequest[] = []
let sequence = 0

function activateNext() {
  if (!current.value) current.value = queue.shift() || null
}

function enqueue(kind: LnConfirmRequest['kind'], options: LnConfirmOptions | LnPromptOptions) {
  return new Promise<string | undefined>((resolve, reject) => {
    queue.push({
      id: sequence += 1,
      kind,
      confirmText: kind === 'prompt' ? '确认' : '继续',
      cancelText: '取消',
      tone: 'neutral',
      ...options,
      resolve,
      reject,
    })
    activateNext()
  })
}

function settle(action: 'accept' | 'cancel', value?: string) {
  const request = current.value
  if (!request) return
  current.value = null
  if (action === 'accept') request.resolve(value)
  else request.reject(new LnConfirmCancelledError())
  setTimeout(activateNext, 0)
}

export async function lnConfirm(options: LnConfirmOptions) {
  await enqueue('confirm', options)
}

export async function lnPrompt(options: LnPromptOptions) {
  return (await enqueue('prompt', options)) || ''
}

export function isLnConfirmCancelled(error: unknown): error is LnConfirmCancelledError {
  return error instanceof LnConfirmCancelledError
}

export function useLnConfirm() {
  return {
    request: computed<LnConfirmRequest | null>(() => current.value),
    accept: (value?: string) => settle('accept', value),
    cancel: () => settle('cancel'),
  }
}

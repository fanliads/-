import type { ComputedRef, InjectionKey } from 'vue'

export type LnFormTrigger = 'blur' | 'change'
export type LnFormLabelPosition = 'left' | 'top'

export interface LnFormRule {
  required?: boolean
  message?: string
  trigger?: LnFormTrigger | LnFormTrigger[]
  pattern?: RegExp
  min?: number
  max?: number
  validator?: (rule: LnFormRule, value: unknown, callback: (error?: Error) => void, model?: Record<string, unknown>) => void | Promise<void>
}

export type LnFormRules = Record<string, LnFormRule | LnFormRule[]>
export type LnInvalidFields = Record<string, string[]>
export type LnFormValidateCallback = (valid: boolean, invalidFields?: LnInvalidFields) => void | Promise<void>

export interface LnFormFieldController {
  prop: string
  validate: (trigger?: LnFormTrigger) => Promise<boolean>
  clearValidate: () => void
  resetField: () => void
  setError: (message: string) => void
  focus: () => void
  error: ComputedRef<string>
}

export interface LnFormContext {
  model: ComputedRef<Record<string, unknown>>
  rules: ComputedRef<LnFormRules>
  labelWidth: ComputedRef<string>
  labelPosition: ComputedRef<LnFormLabelPosition>
  register: (field: LnFormFieldController) => void
  unregister: (field: LnFormFieldController) => void
}

export interface LnFormInstance {
  validate: (callback?: LnFormValidateCallback) => Promise<boolean>
  validateField: (props: string | string[]) => Promise<boolean>
  clearValidate: (props?: string | string[]) => void
  resetFields: (props?: string | string[]) => void
  setFieldError: (prop: string, message: string, focus?: boolean) => void
}

export const lnFormContextKey: InjectionKey<LnFormContext> = Symbol('ln-form')

export function getFormValue(model: Record<string, unknown>, path: string) {
  return path.split('.').reduce<unknown>((value, key) => value && typeof value === 'object' ? (value as Record<string, unknown>)[key] : undefined, model)
}

export function setFormValue(model: Record<string, unknown>, path: string, value: unknown) {
  const keys = path.split('.')
  const last = keys.pop()
  if (!last) return
  let target = model
  for (const key of keys) {
    if (!target[key] || typeof target[key] !== 'object') target[key] = {}
    target = target[key] as Record<string, unknown>
  }
  target[last] = value
}

export function cloneFormValue<T>(value: T): T {
  if (value === undefined || value === null || typeof value !== 'object') return value
  return JSON.parse(JSON.stringify(value)) as T
}

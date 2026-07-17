<template>
  <div
    ref="root"
    class="ln-form-item"
    :class="{ 'has-label': label, 'has-error': !!errorMessage, 'is-top-label': labelPosition === 'top' }"
    :style="{ '--ln-form-label-width': labelWidth }"
    :role="label ? 'group' : undefined"
    :aria-label="label || undefined"
    :aria-invalid="!!errorMessage"
    @focusout="handleFocusOut"
  >
    <label v-if="label" class="ln-form-item__label">{{ label }}</label>
    <div class="ln-form-item__content"><slot /></div>
    <Transition name="ln-form-error">
      <div v-if="showMessage && errorMessage" class="ln-form-item__error" role="alert">{{ errorMessage }}</div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { cloneFormValue, getFormValue, lnFormContextKey, setFormValue, type LnFormLabelPosition, type LnFormRule, type LnFormTrigger } from './form'

const props = withDefaults(defineProps<{
  label?: string
  prop?: string
  showMessage?: boolean
  labelWidth?: string | number
  labelPosition?: LnFormLabelPosition
}>(), { showMessage: true })

const form = inject(lnFormContextKey)
const root = ref<HTMLElement | null>(null)
const errorMessage = ref('')
let initialValue: unknown
const rules = computed<LnFormRule[]>(() => {
  if (!form || !props.prop) return []
  const value = form.rules.value[props.prop]
  return value ? (Array.isArray(value) ? value : [value]) : []
})
const labelWidth = computed(() => {
  if (props.labelWidth !== undefined) return typeof props.labelWidth === 'number' ? `${props.labelWidth}px` : props.labelWidth
  return form?.labelWidth.value || '100px'
})
const labelPosition = computed(() => props.labelPosition || form?.labelPosition.value || 'left')
const field = {
  prop: props.prop || '',
  validate,
  clearValidate,
  resetField,
  error: computed(() => errorMessage.value),
}

onMounted(() => {
  if (!form || !props.prop) return
  initialValue = cloneFormValue(getFormValue(form.model.value, props.prop))
  form.register(field)
})
onBeforeUnmount(() => form?.unregister(field))

watch(() => props.prop && form ? getFormValue(form.model.value, props.prop) : undefined, () => {
  if (errorMessage.value) validate('change')
})

function includesTrigger(rule: LnFormRule, trigger?: LnFormTrigger) {
  if (!trigger || !rule.trigger) return true
  return (Array.isArray(rule.trigger) ? rule.trigger : [rule.trigger]).includes(trigger)
}

function isEmpty(value: unknown) {
  return value === undefined || value === null || value === '' || Array.isArray(value) && value.length === 0
}

async function runValidator(rule: LnFormRule, value: unknown) {
  if (!rule.validator) return
  await new Promise<void>((resolve, reject) => {
    let settled = false
    const callback = (error?: Error) => {
      if (settled) return
      settled = true
      if (error) reject(error)
      else resolve()
    }
    try {
      const result = rule.validator!(rule, value, callback, form?.model.value)
      if (result instanceof Promise) result.then(() => callback()).catch((error) => callback(error instanceof Error ? error : new Error(String(error))))
      else if (rule.validator!.length < 3) callback()
    } catch (error) {
      callback(error instanceof Error ? error : new Error(String(error)))
    }
  })
}

async function validate(trigger?: LnFormTrigger) {
  if (!form || !props.prop) return true
  const value = getFormValue(form.model.value, props.prop)
  for (const rule of rules.value.filter((item) => includesTrigger(item, trigger))) {
    try {
      if (rule.required && isEmpty(value)) throw new Error(rule.message || `${props.label || props.prop}不能为空`)
      if (rule.pattern) {
        rule.pattern.lastIndex = 0
        if (!rule.pattern.test(String(value ?? ''))) throw new Error(rule.message || '格式不正确')
      }
      const length = typeof value === 'string' || Array.isArray(value) ? value.length : undefined
      if (rule.min !== undefined && length !== undefined && length < rule.min) throw new Error(rule.message || `至少输入 ${rule.min} 个字符`)
      if (rule.max !== undefined && length !== undefined && length > rule.max) throw new Error(rule.message || `最多输入 ${rule.max} 个字符`)
      await runValidator(rule, value)
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : String(error)
      return false
    }
  }
  errorMessage.value = ''
  return true
}

function clearValidate() { errorMessage.value = '' }
function resetField() {
  if (form && props.prop) setFormValue(form.model.value, props.prop, cloneFormValue(initialValue))
  clearValidate()
}

function handleFocusOut(event: FocusEvent) {
  if (root.value?.contains(event.relatedTarget as Node | null)) return
  validate('blur')
}
</script>

<style scoped lang="scss">
.ln-form-item { min-width:0; margin-bottom:16px; display:grid; grid-template-columns:minmax(0,1fr); gap:6px; font-family:var(--ln-font); }
.ln-form-item.has-label { grid-template-columns:var(--ln-form-label-width) minmax(0,1fr); align-items:start; column-gap:12px; }
.ln-form-item.has-label.is-top-label { grid-template-columns:minmax(0,1fr); gap:6px; }
.ln-form-item__label { padding-top:8px; color:var(--ln-text-secondary); font-size:12px; font-weight:540; line-height:1.35; }
.is-top-label .ln-form-item__label { padding-top:0; }
.ln-form-item__content { min-width:0; }
.ln-form-item__error { grid-column:1/-1; color:var(--ln-danger); font-size:10px; line-height:1.35; }
.has-label .ln-form-item__error { grid-column:2; }
.has-label.is-top-label .ln-form-item__error { grid-column:1; }
.ln-form-error-enter-active,.ln-form-error-leave-active{transition:opacity var(--ln-fast),transform var(--ln-fast)}.ln-form-error-enter-from,.ln-form-error-leave-to{opacity:0;transform:translateY(-2px)}
</style>

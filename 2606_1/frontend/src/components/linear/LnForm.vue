<template>
  <form class="ln-form" novalidate @submit.prevent="$emit('submit', $event)">
    <slot />
  </form>
</template>

<script setup lang="ts">
import { computed, provide } from 'vue'
import { lnFormContextKey, type LnFormFieldController, type LnFormInstance, type LnFormLabelPosition, type LnFormRules, type LnFormValidateCallback, type LnInvalidFields } from './form'

const props = withDefaults(defineProps<{
  model: Record<string, unknown>
  rules?: LnFormRules
  labelWidth?: string | number
  labelPosition?: LnFormLabelPosition
}>(), { rules: () => ({}), labelWidth: '100px', labelPosition: 'left' })

defineEmits<{
  (event: 'submit', nativeEvent: Event): void
}>()

const fields = new Set<LnFormFieldController>()
const normalizedLabelWidth = computed(() => typeof props.labelWidth === 'number' ? `${props.labelWidth}px` : props.labelWidth)

function register(field: LnFormFieldController) { fields.add(field) }
function unregister(field: LnFormFieldController) { fields.delete(field) }
function selectFields(props?: string | string[]) {
  if (!props) return [...fields]
  const names = new Set(Array.isArray(props) ? props : [props])
  return [...fields].filter((field) => names.has(field.prop))
}

async function validate(callback?: LnFormValidateCallback) {
  const results = await Promise.all([...fields].map(async (field) => ({ field, valid: await field.validate() })))
  const invalidFields = results.reduce<LnInvalidFields>((invalid, result) => {
    if (!result.valid) invalid[result.field.prop] = [result.field.error.value]
    return invalid
  }, {})
  const valid = Object.keys(invalidFields).length === 0
  if (callback) {
    await callback(valid, valid ? undefined : invalidFields)
    return valid
  }
  if (!valid) return Promise.reject(invalidFields)
  return true
}

async function validateField(props: string | string[]) {
  const results = await Promise.all(selectFields(props).map((field) => field.validate()))
  return results.every(Boolean)
}

function clearValidate(props?: string | string[]) { selectFields(props).forEach((field) => field.clearValidate()) }
function resetFields(props?: string | string[]) { selectFields(props).forEach((field) => field.resetField()) }
function setFieldError(prop: string, message: string, focus = true) {
  const field = selectFields(prop)[0]
  if (!field) return
  field.setError(message)
  if (focus) {
    requestAnimationFrame(() => field.focus())
  }
}

provide(lnFormContextKey, {
  model: computed(() => props.model),
  rules: computed(() => props.rules),
  labelWidth: normalizedLabelWidth,
  labelPosition: computed(() => props.labelPosition),
  register,
  unregister,
})

defineExpose<LnFormInstance>({ validate, validateField, clearValidate, resetFields, setFieldError })
</script>

<style scoped lang="scss">
.ln-form { min-width: 0; font-family: var(--ln-font); }
</style>

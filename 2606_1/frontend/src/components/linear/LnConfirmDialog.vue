<template>
  <LnDialog
    v-if="request"
    :model-value="true"
    :title="request.title"
    width="440px"
    :show-close="false"
    @update:model-value="handleOpenChange"
  >
    <div class="ln-confirm__message" :class="`is-${request.tone || 'neutral'}`">
      <span class="ln-confirm__mark" aria-hidden="true"><LnIcon :name="toneMark" /></span>
      <p>{{ request.message }}</p>
    </div>

    <LnInput
      v-if="request.kind === 'prompt'"
      v-model="inputValue"
      class="ln-confirm__input"
      :placeholder="request.placeholder || '请输入内容'"
      :error="inputError"
      clearable
      @keydown.enter.prevent="submit"
    />

    <template #footer>
      <LnButton variant="ghost" @click="cancel">{{ request.cancelText || '取消' }}</LnButton>
      <LnButton :variant="request.tone === 'danger' ? 'danger' : 'primary'" @click="submit">
        {{ request.confirmText || '继续' }}
      </LnButton>
    </template>
  </LnDialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useLnConfirm } from './confirm'
import LnButton from './LnButton.vue'
import LnDialog from './LnDialog.vue'
import LnInput from './LnInput.vue'
import LnIcon from './LnIcon.vue'

const { request, accept, cancel } = useLnConfirm()
const inputValue = ref('')
const inputError = ref('')
const toneMark = computed(() => request.value?.tone === 'danger' || request.value?.tone === 'warning' ? 'warning' : 'question')

watch(() => request.value?.id, () => {
  inputValue.value = request.value?.initialValue || ''
  inputError.value = ''
}, { immediate: true })

watch(inputValue, () => { inputError.value = '' })

function handleOpenChange(open: boolean) {
  if (!open) cancel()
}

function submit() {
  if (!request.value) return
  if (request.value.kind === 'prompt' && request.value.inputPattern) {
    request.value.inputPattern.lastIndex = 0
    if (!request.value.inputPattern.test(inputValue.value)) {
      inputError.value = request.value.inputErrorMessage || '输入内容不符合要求'
      return
    }
  }
  accept(request.value.kind === 'prompt' ? inputValue.value : undefined)
}
</script>

<style scoped lang="scss">
.ln-confirm__message {
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr);
  align-items: start;
  gap: 11px;

  p { margin: 3px 0 0; color: var(--ln-text-secondary); font-size: 13px; line-height: 1.6; }
}

.ln-confirm__mark {
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  color: var(--ln-accent);
  background: var(--ln-accent-soft);
  svg { width: 15px; height: 15px; }
}

.is-warning .ln-confirm__mark { color: var(--ln-warning); background: color-mix(in srgb, var(--ln-warning) 13%, transparent); }
.is-danger .ln-confirm__mark { color: var(--ln-danger); background: color-mix(in srgb, var(--ln-danger) 13%, transparent); }
.ln-confirm__input { margin-top: 16px; }
</style>

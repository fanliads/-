<template>
  <LnPopover align="start" @update:open="handleOpen">
    <template #trigger="{ close }">
      <button
        class="ln-inline-select__trigger ln-focus-ring"
        :class="{ 'is-open': visible, 'is-empty': isEmpty }"
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        :aria-expanded="visible"
        :aria-controls="listboxId"
        :aria-label="ariaLabel"
        :disabled="disabled"
        @keydown.down.prevent="handleTriggerArrow($event, 1)"
        @keydown.up.prevent="handleTriggerArrow($event, -1)"
        @keydown.enter="handleTriggerEnter($event, close)"
      >
        <span class="ln-inline-select__value">
          <slot :option="selectedOption" :label="selectedLabel">{{ selectedLabel }}</slot>
        </span>
        <svg class="ln-inline-select__chevron" viewBox="0 0 16 16" aria-hidden="true">
          <path d="m4.5 6.25 3.5 3.5 3.5-3.5" />
        </svg>
      </button>
    </template>

    <template #default="{ close }">
      <div class="ln-inline-select__menu" :style="{ width: `${popoverWidth}px` }" @click.stop>
        <label v-if="searchable" class="ln-inline-select__search">
          <svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="7" cy="7" r="4.25"/><path d="m10.25 10.25 3 3"/></svg>
          <input
            ref="searchRef"
            v-model="keyword"
            :placeholder="searchPlaceholder"
            autocomplete="off"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded="true"
            :aria-controls="listboxId"
            :aria-activedescendant="filteredOptions.length ? optionId(activeIndex) : undefined"
            @keydown.down.prevent="moveActive(1)"
            @keydown.up.prevent="moveActive(-1)"
            @keydown.enter.prevent="selectActive(close)"
            @keydown.esc="close"
          />
        </label>

        <div :id="listboxId" class="ln-inline-select__options" role="listbox" :aria-label="ariaLabel">
          <button
            v-for="(option, index) in filteredOptions"
            :id="optionId(index)"
            :key="String(option.value)"
            class="ln-inline-select__option"
            :class="{ 'is-selected': isSelected(option.value), 'is-active': activeIndex === index }"
            type="button"
            role="option"
            :aria-selected="isSelected(option.value)"
            :disabled="option.disabled"
            @mouseenter="activeIndex = index"
            @click="selectOption(option, close)"
          >
            <span class="ln-inline-select__marker" :class="toneClass(option)" :style="option.color ? { color: option.color } : undefined" aria-hidden="true"><i/></span>
            <span class="ln-inline-select__copy"><strong>{{ option.label }}</strong><small v-if="option.description">{{ option.description }}</small></span>
            <LnIcon v-if="isSelected(option.value)" class="ln-inline-select__check" name="check" aria-hidden="true" />
          </button>
          <div v-if="!filteredOptions.length" class="ln-inline-select__empty">没有匹配选项</div>
        </div>
      </div>
    </template>
  </LnPopover>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import LnPopover from './LnPopover.vue'
import LnIcon from './LnIcon.vue'
import type { LnInlineOption } from './types'

const props = withDefaults(defineProps<{
  modelValue?: string | number
  options?: LnInlineOption[]
  placeholder?: string
  searchPlaceholder?: string
  ariaLabel?: string
  popoverWidth?: number
  searchable?: boolean
  disabled?: boolean
}>(), {
  options: () => [],
  placeholder: '未设置',
  searchPlaceholder: '搜索或选择…',
  ariaLabel: '选择值',
  popoverWidth: 240,
  searchable: true,
  disabled: false,
})

const emit = defineEmits<{
  (event: 'update:modelValue', value: string | number): void
  (event: 'change', option: LnInlineOption): void
  (event: 'save', value: string | number): void
}>()

const instanceId = Math.random().toString(36).slice(2, 9)
const listboxId = `ln-inline-select-${instanceId}`
const visible = ref(false)
const keyword = ref('')
const activeIndex = ref(0)
const searchRef = ref<HTMLInputElement | null>(null)

const normalizedValue = computed(() => normalize(props.modelValue))
const selectedOption = computed(() => props.options.find((option) => normalize(option.value) === normalizedValue.value))
const selectedLabel = computed(() => selectedOption.value?.label || String(props.modelValue ?? props.placeholder))
const isEmpty = computed(() => props.modelValue === undefined || props.modelValue === null || props.modelValue === '')
const filteredOptions = computed(() => {
  const term = keyword.value.trim().toLocaleLowerCase()
  if (!term) return props.options
  return props.options.filter((option) => `${option.label} ${option.description || ''}`.toLocaleLowerCase().includes(term))
})

watch(filteredOptions, setInitialActive)

function normalize(value: string | number | undefined | null) {
  return value === undefined || value === null ? '' : String(value)
}

function isSelected(value: string | number) {
  return normalize(value) === normalizedValue.value
}

function setInitialActive() {
  const selectedIndex = filteredOptions.value.findIndex((option) => isSelected(option.value) && !option.disabled)
  const firstEnabled = filteredOptions.value.findIndex((option) => !option.disabled)
  activeIndex.value = selectedIndex >= 0 ? selectedIndex : Math.max(firstEnabled, 0)
}

function handleOpen(open: boolean) {
  visible.value = open
  if (!open) {
    keyword.value = ''
    return
  }
  setInitialActive()
  if (props.searchable) nextTick(() => searchRef.value?.focus())
}

function handleTriggerArrow(event: KeyboardEvent, direction: number) {
  if (!visible.value) {
    ;(event.currentTarget as HTMLButtonElement).click()
    return
  }
  if (!props.searchable) moveActive(direction)
}

function handleTriggerEnter(event: KeyboardEvent, close: () => void) {
  if (!visible.value || props.searchable) return
  event.preventDefault()
  event.stopPropagation()
  selectActive(close)
}

function selectOption(option: LnInlineOption, close: () => void) {
  if (option.disabled) return
  close()
  if (isSelected(option.value)) return
  emit('update:modelValue', option.value)
  emit('change', option)
  emit('save', option.value)
}

function moveActive(direction: number) {
  const options = filteredOptions.value
  if (!options.length) return
  let index = activeIndex.value
  for (let count = 0; count < options.length; count += 1) {
    index = (index + direction + options.length) % options.length
    if (!options[index]?.disabled) break
  }
  activeIndex.value = index
  nextTick(() => document.getElementById(optionId(index))?.scrollIntoView({ block: 'nearest' }))
}

function selectActive(close: () => void) {
  const option = filteredOptions.value[activeIndex.value]
  if (option) selectOption(option, close)
}

function optionId(index: number) {
  return `${listboxId}-option-${index}`
}

function toneClass(option: LnInlineOption) {
  if (option.tone) return `is-${option.tone}`
  const token = `${option.value} ${option.label}`.toLocaleLowerCase()
  if (/(完成|已上线|已验收|completed|done|online|accepted)/.test(token)) return 'is-success'
  if (/(进行|开发|测试|设计|处理中|progress|develop|test|design|active)/.test(token)) return 'is-progress'
  if (/(拒绝|阻塞|驳回|rejected|blocked)/.test(token)) return 'is-danger'
  if (/(取消|关闭|作废|暂停|canceled|cancelled|closed|void)/.test(token)) return 'is-muted'
  if (/(待|规划|积压|backlog|planned|pending|todo)/.test(token)) return 'is-pending'
  return 'is-neutral'
}
</script>

<style scoped lang="scss">
:deep(.ln-popover-root),
:deep(.ln-popover-trigger) { width: 100%; min-width: 0; }

.ln-inline-select__trigger {
  width: 100%; min-width: 0; min-height: 28px; padding: 2px 5px 2px 8px;
  display: inline-flex; align-items: center; justify-content: space-between; gap: 5px;
  border: 1px solid transparent; border-radius: var(--ln-radius-md);
  color: inherit; background: transparent; font: inherit; line-height: inherit; text-align: left; cursor: pointer;
  transition: background var(--ln-fast), border-color var(--ln-fast), box-shadow var(--ln-fast);
  &:hover,&.is-open { border-color: var(--ln-border); background: var(--ln-surface-hover); }
  &.is-open { box-shadow: 0 0 0 2px var(--ln-accent-soft); }
  &:disabled { opacity: .5; cursor: not-allowed; }
  &.is-empty .ln-inline-select__value { color: var(--ln-text-tertiary); }
}
.ln-inline-select__value { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ln-inline-select__chevron { width: 14px; height: 14px; flex: none; color: var(--ln-text-tertiary); opacity: 0; transition: opacity var(--ln-fast),transform var(--ln-fast); path{fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:1.4} }
.ln-inline-select__trigger:hover .ln-inline-select__chevron,.ln-inline-select__trigger.is-open .ln-inline-select__chevron{opacity:1}.ln-inline-select__trigger.is-open .ln-inline-select__chevron{transform:rotate(180deg)}
.ln-inline-select__menu { max-width: min(320px, calc(100vw - 32px)); color: var(--ln-text); }
.ln-inline-select__search { height:34px;padding:0 9px;margin-bottom:5px;display:flex;align-items:center;gap:7px;border:1px solid var(--ln-border-strong);border-radius:var(--ln-radius-md);background:var(--ln-surface);&:focus-within{border-color:rgba(94,106,210,.62);box-shadow:0 0 0 2px var(--ln-accent-soft)}svg{width:14px;height:14px;flex:none;color:var(--ln-text-tertiary)}circle,path{fill:none;stroke:currentColor;stroke-linecap:round;stroke-width:1.25}input{width:100%;min-width:0;padding:0;border:0;outline:0;background:transparent;color:var(--ln-text);font:13px/1 var(--ln-font);&::placeholder{color:var(--ln-text-tertiary)}}}
.ln-inline-select__options{max-height:248px;overflow-y:auto;overscroll-behavior:contain;display:grid;gap:1px}
.ln-inline-select__option{width:100%;min-height:34px;padding:5px 8px;display:grid;grid-template-columns:16px minmax(0,1fr) 16px;align-items:center;gap:8px;border:0;border-radius:var(--ln-radius-sm);background:transparent;color:var(--ln-text);font:13px var(--ln-font);text-align:left;cursor:pointer;&:hover,&.is-active{background:var(--ln-surface-hover)}&.is-selected{font-weight:550}&:disabled{opacity:.42;cursor:not-allowed}}
.ln-inline-select__marker{width:14px;height:14px;display:grid;place-items:center;border:1.5px solid currentColor;border-radius:50%;i{width:5px;height:5px;border-radius:50%;background:currentColor;opacity:0}.is-selected & i{opacity:1}&.is-pending{color:var(--ln-warning)}&.is-progress{color:var(--ln-accent)}&.is-success{color:var(--ln-success)}&.is-danger{color:var(--ln-danger)}&.is-muted,&.is-neutral{color:var(--ln-text-tertiary)}}
.ln-inline-select__copy{min-width:0;display:grid;gap:2px;strong,small{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}strong{font-size:12px;font-weight:540}small{color:var(--ln-text-tertiary);font-size:11px;font-weight:400}}
.ln-inline-select__check{width:14px;height:14px;color:var(--ln-accent)}.ln-inline-select__empty{padding:18px 8px;color:var(--ln-text-tertiary);font-size:12px;text-align:center}
</style>

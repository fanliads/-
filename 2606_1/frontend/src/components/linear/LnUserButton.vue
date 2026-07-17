<template>
  <button
    class="ln-user-button ln-focus-ring"
    :class="{ 'is-compact': compact }"
    type="button"
    :title="compact ? name : undefined"
    :aria-label="compact ? ariaLabel : undefined"
  >
    <LnAvatar :name="name" :src="avatarSrc" :color="avatarColor" />
    <span v-if="!compact" class="ln-user-button__copy">
      <strong>{{ name }}</strong>
      <small v-if="description">{{ description }}</small>
    </span>
    <span v-if="showChevron && !compact" class="ln-user-button__chevron" aria-hidden="true">⌄</span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import LnAvatar from './LnAvatar.vue'

const props = withDefaults(defineProps<{
  name: string
  description?: string
  avatarSrc?: string
  avatarColor?: string
  compact?: boolean
  showChevron?: boolean
}>(), { compact: false, showChevron: false })

const ariaLabel = computed(() => `打开 ${props.name} 的用户菜单`)
</script>

<style scoped lang="scss">
.ln-user-button {
  width: 100%;
  min-height: 44px;
  padding: 7px 9px;
  border: 1px solid var(--ln-border);
  border-radius: var(--ln-radius-lg);
  display: flex;
  align-items: center;
  gap: 9px;
  color: var(--ln-text);
  background: var(--ln-surface);
  font-family: var(--ln-font);
  text-align: left;
  cursor: pointer;
  transition: background var(--ln-fast), border-color var(--ln-fast), box-shadow var(--ln-fast);

  &:hover {
    border-color: var(--ln-border-strong);
    background: var(--ln-surface-hover);
    box-shadow: 0 3px 10px rgba(20, 20, 24, .06);
  }

  &.is-compact {
    width: 32px;
    min-height: 32px;
    padding: 2px;
    border-color: transparent;
    border-radius: 50%;
    justify-content: center;
    background: transparent;
    box-shadow: none;

    &:hover { background: var(--ln-surface-hover); }
  }
}

.ln-user-button__copy {
  min-width: 0;
  flex: 1;
  display: grid;
  gap: 3px;

  strong,
  small {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  strong { font-size: 12px; font-weight: 620; }
  small { color: var(--ln-text-tertiary); font-size: 10px; }
}

.ln-user-button__chevron {
  color: var(--ln-text-tertiary);
  font-size: 12px;
}
</style>

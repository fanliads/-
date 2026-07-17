<template>
  <nav class="ln-breadcrumbs" :aria-label="ariaLabel">
    <ol>
      <li v-for="(item, index) in items" :key="`${item.label}-${index}`">
        <span v-if="index" class="ln-breadcrumbs__separator" aria-hidden="true">/</span>
        <RouterLink v-if="item.to && index < items.length - 1" :to="item.to" class="ln-breadcrumbs__link ln-focus-ring">
          {{ item.label }}
        </RouterLink>
        <a v-else-if="item.href && index < items.length - 1" :href="item.href" class="ln-breadcrumbs__link ln-focus-ring">
          {{ item.label }}
        </a>
        <span v-else class="ln-breadcrumbs__label" :class="{ 'is-current': index === items.length - 1 }" :aria-current="index === items.length - 1 ? 'page' : undefined">
          {{ item.label }}
        </span>
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import type { LnBreadcrumbItem } from './types'

withDefaults(defineProps<{
  items: LnBreadcrumbItem[]
  ariaLabel?: string
}>(), { ariaLabel: '面包屑导航' })
</script>

<style scoped lang="scss">
.ln-breadcrumbs {
  min-width: 0;
  color: var(--ln-text-tertiary);
  font: 650 11px/1.3 var(--ln-font);
  letter-spacing: .07em;
  text-transform: uppercase;
}

ol,
li {
  min-width: 0;
  margin: 0;
  padding: 0;
  display: inline-flex;
  align-items: center;
  list-style: none;
}

ol {
  max-width: 100%;
  gap: 6px;
}

li {
  gap: 6px;
  overflow: hidden;
}

.ln-breadcrumbs__separator {
  flex: none;
  color: var(--ln-border-strong);
}

.ln-breadcrumbs__link,
.ln-breadcrumbs__label {
  min-width: 0;
  overflow: hidden;
  color: inherit;
  text-decoration: none;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ln-breadcrumbs__link {
  border-radius: var(--ln-radius-sm);
  color: var(--ln-text-secondary);
  transition: color var(--ln-fast);

  &:hover { color: var(--ln-text); }
}

.ln-breadcrumbs__label.is-current { color: var(--ln-text-tertiary); }
</style>

<template>
  <Teleport to="body" :disabled="!fullscreen">
    <Transition name="ln-loading">
      <div
        v-if="active"
        class="ln-loading-overlay"
        :class="{ 'is-fullscreen': fullscreen, 'is-subtle': subtle }"
        role="status"
        aria-live="polite"
        aria-busy="true"
        :aria-label="label"
      >
        <div class="ln-loading-overlay__content">
          <span class="ln-loading-overlay__mark" aria-hidden="true"><i /></span>
          <strong>{{ label }}</strong>
          <small v-if="description">{{ description }}</small>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  active?: boolean
  fullscreen?: boolean
  subtle?: boolean
  label?: string
  description?: string
}>(), {
  active: false,
  fullscreen: false,
  subtle: false,
  label: '正在加载',
})
</script>

<style scoped lang="scss">
.ln-loading-overlay {
  position: absolute;
  inset: 0;
  z-index: 150;
  display: grid;
  place-items: center;
  min-width: 0;
  min-height: 120px;
  color: var(--ln-text);
  background: rgba(247, 247, 248, .88);
  backdrop-filter: blur(5px);
  font-family: var(--ln-font);

  &.is-fullscreen { position: fixed; z-index: 3100; min-height: 100vh; }
  &.is-subtle { background: rgba(255, 255, 255, .66); backdrop-filter: blur(2px); }
}

.ln-loading-overlay__content {
  max-width: min(320px, calc(100vw - 40px));
  padding: 18px 22px;
  display: grid;
  justify-items: center;
  gap: 7px;
  text-align: center;

  strong { font-size: 13px; font-weight: 620; }
  small { color: var(--ln-text-tertiary); font-size: 11px; line-height: 1.5; }
}

.ln-loading-overlay__mark {
  position: relative;
  width: 30px;
  height: 30px;
  margin-bottom: 3px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: var(--ln-accent-soft);

  &::before {
    width: 18px;
    height: 18px;
    border: 2px solid rgba(94, 106, 210, .22);
    border-top-color: var(--ln-accent);
    border-radius: 50%;
    content: '';
    animation: ln-loading-spin .72s linear infinite;
  }

  i { position: absolute; width: 4px; height: 4px; border-radius: 50%; background: var(--ln-accent); }
}

.ln-loading-enter-active,
.ln-loading-leave-active { transition: opacity var(--ln-normal); }
.ln-loading-enter-from,
.ln-loading-leave-to { opacity: 0; }

@keyframes ln-loading-spin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) { .ln-loading-overlay__mark::before { animation-duration: 1.6s; } }
</style>

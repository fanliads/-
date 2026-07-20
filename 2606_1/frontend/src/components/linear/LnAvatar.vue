<template>
  <span class="ln-avatar" :class="[`is-${size}`, { 'has-ring': ring }]" :style="avatarStyle" :title="name" role="img" :aria-label="name">
    <img v-if="src && !imageFailed" :src="src" :alt="name" @error="imageFailed = true" />
    <span v-else>{{ initials }}</span>
    <i v-if="status" :class="`is-${status}`" :aria-label="statusLabel" />
  </span>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const props = withDefaults(defineProps<{
  name: string
  src?: string
  color?: string
  size?: 'small' | 'medium' | 'large'
  status?: 'online' | 'away' | 'busy' | 'offline'
  ring?: boolean
}>(), { size: 'medium' })

const imageFailed = ref(false)
const initials = computed(() => {
  const value = props.name.trim()
  if (!value) return '?'
  const parts = value.split(/\s+/)
  return parts.length > 1 ? `${parts[0][0]}${parts.at(-1)?.[0]}`.toUpperCase() : value.slice(0, 2)
})
const avatarStyle = computed(() => ({ '--avatar-color': props.color || avatarColor(props.name) }))
const statusLabel = computed(() => ({ online: '在线', away: '离开', busy: '忙碌', offline: '离线' })[props.status || 'offline'])

function avatarColor(value: string) {
  const palette = ['#5e6ad2', '#3b82a0', '#2f9e6f', '#a06b3b', '#8a5ca0', '#a04f63']
  const hash = [...value].reduce((sum, char) => sum + char.charCodeAt(0), 0)
  return palette[hash % palette.length]
}
</script>

<style scoped lang="scss">
.ln-avatar { --avatar-size:28px; position:relative;width:var(--avatar-size);height:var(--avatar-size);flex:none;border-radius:50%;display:inline-grid;place-items:center;overflow:visible;color:#fff;background:var(--avatar-color);font: 600 11px/1 var(--ln-font);box-shadow:inset 0 0 0 1px rgba(0,0,0,.08); &.is-small{--avatar-size:22px;font-size:8px} &.is-large{--avatar-size:38px;font-size:13px} &.has-ring{box-shadow:0 0 0 2px var(--ln-surface),0 0 0 3px var(--ln-border-strong),inset 0 0 0 1px rgba(0,0,0,.08)} img{width:100%;height:100%;border-radius:inherit;object-fit:cover} > span{max-width:90%;overflow:hidden;white-space:nowrap} > i{position:absolute;right:-1px;bottom:-1px;width:8px;height:8px;border:2px solid var(--ln-surface);border-radius:50%;background:var(--ln-text-tertiary);&.is-online{background:var(--ln-success)}&.is-away{background:var(--ln-warning)}&.is-busy{background:var(--ln-danger)}} }
</style>

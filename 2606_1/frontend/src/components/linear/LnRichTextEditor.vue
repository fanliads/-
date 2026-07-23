<template>
  <div class="ln-rich-editor" :class="{ 'is-focused': focused }">
    <div class="ln-rich-editor__toolbar" role="toolbar" aria-label="文本格式">
      <LnButton
        v-for="tool in formatTools"
        :key="tool.command"
        class="rich-toolbar__button"
        :class="{ 'is-active': activeFormats.has(tool.command) }"
        size="small"
        variant="ghost"
        :aria-label="tool.label"
        :aria-pressed="activeFormats.has(tool.command)"
        @mousedown.prevent
        @click="exec(tool.command)"
      >
        {{ tool.shortLabel }}
      </LnButton>
      <span class="ln-rich-editor__divider" aria-hidden="true" />
      <LnButton size="small" variant="ghost" @mousedown.prevent @click="openLinkDialog">链接</LnButton>
      <LnButton size="small" variant="ghost" @mousedown.prevent @click="triggerImageSelect">图片</LnButton>
      <span class="ln-rich-editor__tip">支持粘贴或上传图片</span>
      <input ref="fileInputRef" class="ln-rich-editor__file" type="file" accept="image/*" tabindex="-1" @change="handleFileChange" />
    </div>

    <div
      ref="editorRef"
      class="ln-rich-editor__body"
      contenteditable="true"
      role="textbox"
      aria-multiline="true"
      :aria-label="ariaLabel"
      :data-placeholder="placeholder"
      :style="{ minHeight }"
      @focus="focused = true"
      @blur="focused = false"
      @input="emitValue"
      @keyup="refreshFormats"
      @mouseup="refreshFormats"
      @paste="handlePaste"
    />
  </div>

  <LnDialog v-model="linkDialogOpen" title="插入链接" description="输入完整网址或站内路径。" width="420px" @close="resetLinkDialog">
    <LnInput v-model="linkUrl" label="链接地址" placeholder="https://example.com" clearable @keydown.enter.prevent="applyLink" />
    <template #footer>
      <LnButton variant="ghost" @click="linkDialogOpen = false">取消</LnButton>
      <LnButton variant="primary" :disabled="!linkUrl.trim()" @click="applyLink">插入链接</LnButton>
    </template>
  </LnDialog>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'
import { sanitizeRichText } from '@/utils/rich-text'
import LnButton from './LnButton.vue'
import LnDialog from './LnDialog.vue'
import LnInput from './LnInput.vue'

const props = withDefaults(defineProps<{
  modelValue?: string
  placeholder?: string
  ariaLabel?: string
  minHeight?: string
}>(), {
  modelValue: '',
  placeholder: '输入内容…',
  ariaLabel: '富文本内容',
  minHeight: '180px',
})

const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void
}>()

const formatTools = [
  { command: 'bold', label: '加粗', shortLabel: 'B' },
  { command: 'italic', label: '斜体', shortLabel: 'I' },
  { command: 'underline', label: '下划线', shortLabel: 'U' },
  { command: 'insertUnorderedList', label: '无序列表', shortLabel: '列表' },
] as const

const editorRef = ref<HTMLDivElement | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
const focused = ref(false)
const activeFormats = ref(new Set<string>())
const linkDialogOpen = ref(false)
const linkUrl = ref('')
const savedRange = ref<Range | null>(null)

function setEditorHtml(html = '') {
  if (!editorRef.value) return
  const nextValue = sanitizeRichText(html)
  if (editorRef.value.innerHTML !== nextValue) editorRef.value.innerHTML = nextValue
}

function emitValue() {
  emit('update:modelValue', sanitizeRichText(editorRef.value?.innerHTML || ''))
  refreshFormats()
}

function exec(command: string) {
  editorRef.value?.focus()
  document.execCommand(command)
  emitValue()
}

function refreshFormats() {
  const next = new Set<string>()
  for (const tool of formatTools) {
    if (document.queryCommandState(tool.command)) next.add(tool.command)
  }
  activeFormats.value = next
}

function selectionBelongsToEditor(range: Range) {
  const container = range.commonAncestorContainer
  const node = container.nodeType === Node.TEXT_NODE ? container.parentNode : container
  return !!node && !!editorRef.value?.contains(node)
}

function openLinkDialog() {
  const selection = window.getSelection()
  const range = selection?.rangeCount ? selection.getRangeAt(0) : null
  savedRange.value = range && selectionBelongsToEditor(range) ? range.cloneRange() : null
  linkUrl.value = ''
  linkDialogOpen.value = true
}

function normalizeLink(value: string) {
  const link = value.trim()
  if (/^(https?:\/\/|mailto:|tel:|\/|#)/i.test(link)) return link
  return `https://${link}`
}

async function applyLink() {
  if (!linkUrl.value.trim()) return
  const href = normalizeLink(linkUrl.value)
  const range = savedRange.value?.cloneRange() || null
  linkDialogOpen.value = false
  await nextTick()
  editorRef.value?.focus()
  const selection = window.getSelection()
  if (!selection || !editorRef.value) return
  const targetRange = range || document.createRange()
  if (!range) {
    targetRange.selectNodeContents(editorRef.value)
    targetRange.collapse(false)
  }
  selection.removeAllRanges()
  selection.addRange(targetRange)
  if (targetRange.collapsed) {
    const anchor = document.createElement('a')
    anchor.href = href
    anchor.textContent = href
    targetRange.insertNode(anchor)
    targetRange.setStartAfter(anchor)
    targetRange.collapse(true)
    selection.removeAllRanges()
    selection.addRange(targetRange)
  } else {
    document.execCommand('createLink', false, href)
  }
  emitValue()
  resetLinkDialog()
}

function resetLinkDialog() {
  linkUrl.value = ''
  savedRange.value = null
}

function triggerImageSelect() {
  fileInputRef.value?.click()
}

function insertImage(src: string, alt = '图片') {
  editorRef.value?.focus()
  document.execCommand('insertImage', false, src)
  const images = editorRef.value?.querySelectorAll('img')
  const lastImage = images?.[images.length - 1] as HTMLImageElement | undefined
  if (lastImage) lastImage.alt = alt
  emitValue()
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

async function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  insertImage(await readFileAsDataUrl(file), file.name)
  input.value = ''
}

async function handlePaste(event: ClipboardEvent) {
  const imageItem = Array.from(event.clipboardData?.items || []).find((item) => item.type.startsWith('image/'))
  if (!imageItem) return
  const file = imageItem.getAsFile()
  if (!file) return
  event.preventDefault()
  insertImage(await readFileAsDataUrl(file), file.name || '粘贴图片')
}

watch(() => props.modelValue, setEditorHtml)
onMounted(() => setEditorHtml(props.modelValue))
</script>

<style scoped lang="scss">
.ln-rich-editor {
  overflow: hidden;
  border: 1px solid var(--ln-border-strong);
  border-radius: var(--ln-radius-lg);
  background: var(--ln-surface);
  font-family: var(--ln-font);
  transition: border-color var(--ln-fast), box-shadow var(--ln-fast);

  &.is-focused {
    border-color: rgba(94, 106, 210, .62);
    box-shadow: 0 0 0 2px var(--ln-accent-soft);
  }
}

.ln-rich-editor__toolbar {
  min-height: 40px;
  padding: 5px 7px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 2px;
  border-bottom: 1px solid var(--ln-border);
  background: var(--ln-canvas);
}

:deep(.rich-toolbar__button) {
  min-width: var(--ln-control-sm);
  padding-inline: 7px;

  &:nth-child(1) { font-weight: 700; }
  &:nth-child(2) { font-style: italic; }
  &:nth-child(3) { text-decoration: underline; }
  &.is-active { color: var(--ln-accent); background: var(--ln-accent-soft); }
}

.ln-rich-editor__divider {
  width: 1px;
  height: 18px;
  margin: 0 4px;
  background: var(--ln-border-strong);
}

.ln-rich-editor__tip {
  margin-left: auto;
  padding: 0 6px;
  color: var(--ln-text-tertiary);
  font-size:11px;
}

.ln-rich-editor__file {
  position: fixed;
  width: 1px;
  height: 1px;
  overflow: hidden;
  opacity: 0;
  pointer-events: none;
}

.ln-rich-editor__body {
  padding: 12px 13px;
  outline: 0;
  color: var(--ln-text);
  font: 400 13px/1.7 var(--ln-font);
  white-space: pre-wrap;
  word-break: break-word;

  &:empty::before {
    color: var(--ln-text-tertiary);
    content: attr(data-placeholder);
    pointer-events: none;
  }

  :deep(a) { color: var(--ln-accent); text-decoration: underline; text-underline-offset: 2px; }
  :deep(ul) { margin: 6px 0; padding-left: 22px; }
  :deep(img) { max-width: 100%; height: auto; margin: 8px 0; display: block; border-radius: var(--ln-radius-lg); }
}

@media (max-width: 640px) {
  .ln-rich-editor__tip { width: 100%; margin: 2px 6px 0; }
}
</style>

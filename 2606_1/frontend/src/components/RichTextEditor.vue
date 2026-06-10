<template>
  <div class="rich-editor">
    <div class="toolbar">
      <button type="button" class="tool-btn" @click="exec('bold')">加粗</button>
      <button type="button" class="tool-btn" @click="exec('italic')">斜体</button>
      <button type="button" class="tool-btn" @click="exec('underline')">下划线</button>
      <button type="button" class="tool-btn" @click="exec('insertUnorderedList')">列表</button>
      <button type="button" class="tool-btn" @click="insertLink">链接</button>
      <button type="button" class="tool-btn" @click="triggerImageSelect">图片</button>
      <span class="toolbar-tip">支持粘贴图片或插入截图，图片以内嵌方式保存。</span>
      <input
        ref="fileInputRef"
        type="file"
        accept="image/*"
        style="display: none"
        @change="handleFileChange"
      />
    </div>
    <div
      ref="editorRef"
      class="editor-body"
      contenteditable="true"
      :data-placeholder="placeholder"
      @input="handleInput"
      @paste="handlePaste"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { sanitizeRichText } from '@/utils/rich-text'

const props = defineProps<{
  modelValue?: string
  placeholder?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const editorRef = ref<HTMLDivElement | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)

function setEditorHtml(html?: string) {
  if (!editorRef.value) return
  const nextValue = sanitizeRichText(html || '')
  if (editorRef.value.innerHTML !== nextValue) {
    editorRef.value.innerHTML = nextValue
  }
}

function emitValue() {
  emit('update:modelValue', sanitizeRichText(editorRef.value?.innerHTML || ''))
}

function handleInput() {
  emitValue()
}

function exec(command: string) {
  editorRef.value?.focus()
  document.execCommand(command)
  emitValue()
}

function insertLink() {
  const url = window.prompt('请输入链接地址')
  if (!url) return
  editorRef.value?.focus()
  document.execCommand('createLink', false, url)
  emitValue()
}

function triggerImageSelect() {
  fileInputRef.value?.click()
}

function insertImage(src: string, alt = '图片') {
  editorRef.value?.focus()
  document.execCommand('insertImage', false, src)
  const images = editorRef.value?.querySelectorAll('img')
  const lastImage = images?.[images.length - 1] as HTMLImageElement | undefined
  if (lastImage) {
    lastImage.alt = alt
  }
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
  const dataUrl = await readFileAsDataUrl(file)
  insertImage(dataUrl, file.name)
  input.value = ''
}

async function handlePaste(event: ClipboardEvent) {
  const items = Array.from(event.clipboardData?.items || [])
  const imageItem = items.find((item) => item.type.startsWith('image/'))
  if (!imageItem) return
  event.preventDefault()
  const file = imageItem.getAsFile()
  if (!file) return
  const dataUrl = await readFileAsDataUrl(file)
  insertImage(dataUrl, file.name || '粘贴图片')
}

watch(
  () => props.modelValue,
  (value) => {
    setEditorHtml(value)
  }
)

onMounted(() => {
  setEditorHtml(props.modelValue)
})
</script>

<style lang="scss" scoped>
.rich-editor {
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface);
  overflow: hidden;
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  padding: 10px 12px;
  border-bottom: 1px solid var(--border);
  background: #fafbfc;
}

.tool-btn {
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text-primary);
  border-radius: 6px;
  padding: 4px 10px;
  font-size: 12px;
  cursor: pointer;
}

.toolbar-tip {
  font-size: 12px;
  color: var(--text-secondary);
}

.editor-body {
  min-height: 180px;
  padding: 12px;
  line-height: 1.7;
  color: var(--text-primary);
  outline: none;
  white-space: pre-wrap;
  word-break: break-word;

  &:empty::before {
    content: attr(data-placeholder);
    color: var(--text-secondary);
  }

  :deep(img) {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    margin: 8px 0;
    display: block;
  }
}
</style>

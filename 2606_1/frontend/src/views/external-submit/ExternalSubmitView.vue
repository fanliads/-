<template>
  <main class="external-page">
    <header class="public-header">
      <div class="brand-mark">R</div>
      <div><strong>需求受理中心</strong><span>Requirement Intake</span></div>
    </header>

    <div class="content-shell">
      <div class="form-column">
        <section class="intro">
          <span class="eyebrow">EXTERNAL REQUEST</span>
          <h1>提交原始需求</h1>
          <p>无需登录，预计 3 分钟完成；提交后由需求团队评估。</p>
        </section>

        <LnForm ref="formRef" :model="form" :rules="rules" class="intake-form" label-position="top">
      <section class="form-section">
        <div class="section-index">01</div>
        <div class="section-copy"><h2>提报人信息</h2><p>联系方式仅用于需求确认与后续跟进。</p></div>
        <div class="form-grid">
          <LnFormItem label="姓名 / 称呼" prop="proposer"><LnInput v-model="form.proposer" :maxlength="100" placeholder="怎么称呼你" /></LnFormItem>
          <LnFormItem label="联系方式" prop="proposerContact"><LnInput v-model="form.proposerContact" :maxlength="200" placeholder="手机号、邮箱或微信号" /></LnFormItem>
          <LnFormItem label="所属公司 / 客户"><LnInput v-model="form.company" :maxlength="200" placeholder="选填" /></LnFormItem>
          <LnFormItem label="项目名称"><LnInput v-model="form.projectName" :maxlength="200" placeholder="选填，便于内部归类" /></LnFormItem>
        </div>
      </section>

      <section class="form-section">
        <div class="section-index">02</div>
        <div class="section-copy"><h2>需求内容</h2><p>优先说明现状、问题和影响，帮助团队快速理解。</p></div>
        <div class="form-grid">
          <LnFormItem class="full" label="需求标题" prop="title"><LnInput v-model="form.title" :maxlength="100" show-count placeholder="用一句话概括需求" /></LnFormItem>
          <LnFormItem class="full" label="问题 / 需求描述" prop="description"><LnTextarea v-model="form.description" :maxlength="4000" placeholder="请描述当前情况、遇到的问题、影响范围和使用场景" /></LnFormItem>
          <LnFormItem class="full" label="期望结果"><LnTextarea v-model="form.expectedResult" :maxlength="4000" placeholder="选填，希望最终达到什么结果" /></LnFormItem>
          <LnFormItem label="业务线"><LnSelect v-model="form.businessLine" :options="businessOptions" placeholder="选填" searchable clearable /></LnFormItem>
          <LnFormItem label="期望上线时间"><LnDateInput v-model="form.expectedOnlineDate" clearable /></LnFormItem>
          <LnFormItem class="full" label="资料链接" prop="reqLink"><LnInput v-model="form.reqLink" placeholder="选填，以 http:// 或 https:// 开头" /></LnFormItem>
          <LnFormItem class="full" label="补充说明"><LnTextarea v-model="form.supplementary" :maxlength="4000" placeholder="选填，其他需要说明的信息" /></LnFormItem>
        </div>
      </section>

      <section class="submit-section">
        <LnCheckbox v-model="form.privacyAccepted" label="我已阅读并同意信息用途说明" />
        <p>你提交的身份、联系和业务信息仅用于需求受理、评估及必要的后续沟通。</p>
        <div v-if="submitError" class="submit-error" role="alert"><LnIcon name="warning"/><span>{{ submitError }}</span></div>
        <LnButton class="submit-button" variant="primary" :loading="submitting" :disabled="submitting" @click="submit">
          {{ submitting ? '正在提交…' : '提交需求' }}
        </LnButton>
      </section>
        </LnForm>
      </div>

      <aside class="sharing-panel" aria-label="通用提报二维码">
        <span class="sharing-kicker">SHARE</span>
        <h2>现场扫码提报</h2>
        <p>二维码仅打开固定提报路径，不包含账号、令牌或客户信息。</p>
        <div class="qr-frame">
          <canvas ref="qrCanvas" aria-label="通用提报二维码"></canvas>
          <div v-if="qrError" class="qr-error">{{ qrError }}</div>
        </div>
        <code class="qr-url">{{ externalSubmitUrl }}</code>
        <div class="qr-actions">
          <LnButton size="small" variant="secondary" :disabled="!!qrError" @click="downloadQr('png')">下载 PNG</LnButton>
          <LnButton size="small" variant="ghost" :disabled="!!qrError" @click="downloadQr('svg')">下载 SVG</LnButton>
        </div>
        <span class="sharing-note">适合线上分享与 A4 打印，生产域名变化后请重新下载。</span>
      </aside>
    </div>
  </main>
</template>

<script setup lang="ts">
import { nextTick, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import QRCode from 'qrcode'
import { createExternalRawRequirement } from '@/api/raw-requirement'
import { listPublicBusinessLines } from '@/api/dict'
import type { ExternalSubmissionDTO } from '@/types/requirement'
import { LnButton, LnCheckbox, LnDateInput, LnForm, LnFormItem, LnIcon, LnInput, LnSelect, LnTextarea, type LnFormInstance, type LnFormRules, type LnOption } from '@/components/linear'

const DRAFT_KEY = 'external-requirement-draft-v2'
const route = useRoute()
const router = useRouter()
const formRef = ref<LnFormInstance>()
const submitting = ref(false)
const submitError = ref('')
const businessOptions = ref<LnOption[]>([])
const qrCanvas = ref<HTMLCanvasElement>()
const externalSubmitUrl = ref('')
const qrError = ref('')

const form = reactive<ExternalSubmissionDTO>({
  title: '', description: '', proposer: '', proposerContact: '', company: '', projectName: '', expectedResult: '', businessLine: '', expectedOnlineDate: '', reqLink: '', supplementary: '',
  sourceChannel: route.query.channel === 'qrcode' ? 'qrcode' : 'link', identityProvider: '', identityName: '', clientRequestId: createRequestId(), privacyAccepted: false,
})

const rules: LnFormRules = {
  proposer: [{ required: true, message: '请输入姓名或称呼', trigger: 'blur' }],
  proposerContact: [{ required: true, message: '请至少填写一种联系方式', trigger: 'blur' }],
  title: [{ required: true, message: '请输入需求标题', trigger: 'blur' }, { max: 100, message: '需求标题不能超过 100 个字符', trigger: 'blur' }],
  description: [{ required: true, message: '请描述问题或需求', trigger: 'blur' }],
  reqLink: [{ pattern: /^(|https?:\/\/[^\s]+)$/i, message: '请输入以 http:// 或 https:// 开头的有效链接', trigger: 'blur' }],
}

onMounted(async () => {
  restoreDraft()
  externalSubmitUrl.value = resolveExternalSubmitUrl()
  await nextTick()
  await renderQrCode()
  try {
    const response: any = await listPublicBusinessLines()
    businessOptions.value = (response.data || []).map((item: any) => ({ label: item.label, value: item.value }))
  } catch { businessOptions.value = [] }
})

async function submit() {
  if (submitting.value) return
  submitError.value = ''
  persistDraft()
  try {
    await formRef.value?.validate()
  } catch {
    submitError.value = '请先完善标记出的必填或格式错误字段。'
    return
  }
  if (!form.privacyAccepted) {
    submitError.value = '请阅读并同意信息用途说明。'
    return
  }
  submitting.value = true
  try {
    const response = await createExternalRawRequirement({
      ...form,
      title: form.title.trim(), description: form.description.trim(), proposer: form.proposer.trim(), proposerContact: form.proposerContact.trim(),
    })
    sessionStorage.removeItem(DRAFT_KEY)
    await router.replace({ path: '/external-submit/result', query: { receipt: encodeURIComponent(JSON.stringify(response.data)), title: form.title } })
  } catch (error: any) {
    submitError.value = error?.message ? `提交失败：${error.message}。已保留填写内容，请稍后重试。` : '网络异常，已保留填写内容，请稍后重试。'
  } finally { submitting.value = false }
}

function persistDraft() { sessionStorage.setItem(DRAFT_KEY, JSON.stringify(form)) }
function restoreDraft() {
  try {
    const draft = JSON.parse(sessionStorage.getItem(DRAFT_KEY) || '{}')
    Object.assign(form, draft, { clientRequestId: draft.clientRequestId || form.clientRequestId, sourceChannel: form.sourceChannel })
  } catch { /* 无有效草稿 */ }
}
function createRequestId() { return `${Date.now().toString(36)}_${crypto.randomUUID().replace(/-/g, '')}` }

function resolveExternalSubmitUrl() {
  const configured = String(import.meta.env.VITE_EXTERNAL_SUBMIT_URL || '').trim()
  if (configured) return configured
  return `${window.location.origin}/external-submit?channel=qrcode`
}

async function renderQrCode() {
  if (!qrCanvas.value) return
  try {
    await QRCode.toCanvas(qrCanvas.value, externalSubmitUrl.value, {
      width: 196,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: { dark: '#20231f', light: '#ffffff' },
    })
    qrError.value = ''
  } catch {
    qrError.value = '二维码生成失败，请直接复制下方地址。'
  }
}

async function downloadQr(format: 'png' | 'svg') {
  if (qrError.value || !qrCanvas.value) return
  if (format === 'png') {
    triggerDownload(qrCanvas.value.toDataURL('image/png'), 'external-requirement-qr.png')
    return
  }
  const svg = await QRCode.toString(externalSubmitUrl.value, {
    type: 'svg',
    margin: 1,
    errorCorrectionLevel: 'M',
    color: { dark: '#20231f', light: '#ffffff' },
  })
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }))
  triggerDownload(url, 'external-requirement-qr.svg')
  setTimeout(() => URL.revokeObjectURL(url), 0)
}

function triggerDownload(url: string, filename: string) {
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
}
</script>

<style scoped lang="scss">
.external-page { min-height: 100vh; padding: 0 24px 64px; color: #20231f; background: #f5f5f1; font-family: "Avenir Next", "PingFang SC", sans-serif; }
.public-header { height: 72px; max-width: 1180px; margin: auto; display: flex; align-items: center; gap: 10px; border-bottom: 1px solid #dedfd8; }.brand-mark { width: 30px; height: 30px; display: grid; place-items: center; border-radius: 8px; background: #242a25; color: #fff; font: 700 14px Georgia,serif; }.public-header div:last-child { display: grid; }.public-header strong { font-size: 12px; }.public-header span { color: #858980; font-size: 9px; letter-spacing: .08em; }
.content-shell { max-width: 1180px; margin: auto; display: grid; grid-template-columns: minmax(0, 1fr) 248px; gap: 22px; align-items: start; }.form-column { min-width: 0; }.intro { margin: 64px 0 36px; }.eyebrow { color: #657068; font-size: 10px; font-weight: 700; letter-spacing: .18em; }.intro h1 { margin: 14px 0 12px; font: 600 clamp(34px,6vw,54px)/1.12 Georgia,"Songti SC",serif; letter-spacing: -.035em; }.intro p { margin: 0; color: #6d726b; font-size: 14px; }
.intake-form { display: grid; gap: 14px; }.form-section { padding: 30px; display: grid; grid-template-columns: 46px 180px minmax(0,1fr); gap: 22px; border: 1px solid #dedfd8; border-radius: 14px; background: #fbfbf8; box-shadow: 0 10px 30px rgba(35,40,34,.035); }.section-index { color: #9da097; font: 500 11px Georgia,serif; }.section-copy h2 { margin: 0 0 7px; font: 600 17px Georgia,"Songti SC",serif; }.section-copy p { margin: 0; color: #858980; font-size: 11px; line-height: 1.6; }.form-grid { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 8px 14px; }.full { grid-column: 1/-1; }
.submit-section { padding: 26px 30px; border: 1px solid #dedfd8; border-radius: 14px; background: #eceee8; }.submit-section > p { margin: 8px 0 18px 26px; color: #747970; font-size: 11px; line-height: 1.6; }.submit-error { margin-bottom: 14px; padding: 10px 12px; display: flex; gap: 8px; border: 1px solid #e4beb7; border-radius: 8px; background: #fff5f2; color: #9e4338; font-size: 12px; }.submit-button { width: 100%; min-height: 44px; }
.sharing-panel { position: sticky; top: 24px; margin-top: 64px; padding: 22px; border: 1px solid #dedfd8; border-radius: 14px; background: #fbfbf8; box-shadow: 0 10px 30px rgba(35,40,34,.035); }.sharing-kicker { color: #657068; font-size: 9px; font-weight: 700; letter-spacing: .18em; }.sharing-panel h2 { margin: 10px 0 8px; font: 600 18px Georgia,"Songti SC",serif; }.sharing-panel > p { margin: 0; color: #747970; font-size: 11px; line-height: 1.65; }.qr-frame { min-height: 206px; margin: 18px 0 12px; padding: 5px; display: grid; place-items: center; border: 1px solid #e3e4de; border-radius: 10px; background: #fff; }.qr-frame canvas { width: 196px !important; height: 196px !important; max-width: 100%; }.qr-error { padding: 16px; color: #9e4338; font-size: 11px; line-height: 1.6; text-align: center; }.qr-url { display: block; overflow-wrap: anywhere; color: #555c55; font: 10px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace; }.qr-actions { margin-top: 14px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }.sharing-note { display: block; margin-top: 12px; color: #93978f; font-size: 9px; line-height: 1.5; }
@media (max-width: 980px) { .content-shell { grid-template-columns: 1fr; }.sharing-panel { position: static; margin-top: 0; order: 2; }.qr-frame { width: 208px; }.sharing-panel { display: grid; grid-template-columns: minmax(0,1fr) auto; column-gap: 20px; }.sharing-kicker,.sharing-panel h2,.sharing-panel > p,.qr-url,.qr-actions,.sharing-note { grid-column: 1; }.qr-frame { grid-column: 2; grid-row: 1 / span 6; margin: 0; } }
@media (max-width: 760px) { .external-page { padding-inline: 14px; }.public-header { height: 60px; }.intro { margin: 40px 6px 26px; }.form-section { padding: 22px 18px; grid-template-columns: 1fr; gap: 12px; }.section-index { display: none; }.section-copy { padding-bottom: 6px; border-bottom: 1px solid #e5e5df; }.form-grid { grid-template-columns: 1fr; }.full { grid-column: auto; }.submit-section { padding: 22px 18px; }.sharing-panel { display: block; }.qr-frame { width: auto; margin: 18px 0 12px; }.qr-actions { grid-template-columns: 1fr; } }
</style>

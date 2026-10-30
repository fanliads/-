(function () {
  'use strict';
  const stores = [
    { id: 's1', name: '湖滨店', region: '华东区域 · 杭州' },
    { id: 's2', name: '万象城店', region: '华东区域 · 杭州' },
    { id: 's3', name: '滨江店', region: '华东区域 · 杭州' }
  ];
  const cameras = [
    { id: 'c1', name: '热加工区', status: 'online' },
    { id: 'c2', name: '粗加工区', status: 'online' },
    { id: 'c3', name: '餐具消毒区', status: 'offline' },
    { id: 'c4', name: '仓储区', status: 'denied' },
    { id: 'c5', name: '面点间', status: 'error' }
  ];
  const standards = [
    { id: 'i1', name: '从业人员着装', rule: '穿戴清洁工作服、工作帽，头发不外露。' },
    { id: 'i2', name: '个人卫生与操作', rule: '操作前清洗双手，不佩戴饰物，不在操作区饮食。' },
    { id: 'i3', name: '生熟分开', rule: '生、熟食材及工用具分区存放，避免交叉污染。' },
    { id: 'i4', name: '操作环境卫生', rule: '台面、地面清洁，无积水、垃圾及无关物品。' }
  ];
  const $ = s => document.querySelector(s);
  const e = v => WB.esc(v);
  let b, analysisTimer, mounted = false;
  const loadingTimers = new Map();
  const now = () => new Date().toLocaleString('zh-CN', { hour12: false });
  const id = prefix => prefix + '-' + Date.now().toString(36).toUpperCase();
  const btn = (text, action, cls = '', extra = '') => `<button type="button" class="${cls}" data-b="${action}" ${extra}>${text}</button>`;
  const tag = (text, tone = '') => `<span class="biz-tag ${tone}">${e(text)}</span>`;
  function initial() {
    return { active: 'overview', views: [{ id: 'overview', type: 'overview', title: '工作概览' }], inspections: {}, records: [], risks: [], analysis: null, dirty: false };
  }
  function persist() { return WB.persist() !== false; }
  const rootViews = { workbench: { id: 'overview', type: 'overview', title: '工作概览' }, records: { id: 'records', type: 'records', title: '后厨巡检记录' }, risks: { id: 'risks', type: 'risks', title: '巡检风险记录' } };
  function sectionFor(v) { return ['records', 'record'].includes(v?.type) ? 'records' : ['risks', 'risk'].includes(v?.type) ? 'risks' : 'workbench'; }
  function rootView(section = 'workbench') {
    const definition = rootViews[section] || rootViews.workbench;
    let root = b.views.find(v => v.id === definition.id);
    if (!root) { root = { ...definition }; b.views.push(root); }
    return root;
  }
  function view() { return b.views.find(v => v.id === b.active) || rootView(); }
  function navigateSection(section) { if (b) activate(rootView(section)); }
  function objectTitle(v) {
    const store = stores.find(s => s.id === v.storeId)?.name;
    if (v.type === 'record') return [store, v.recordId].filter(Boolean).join(' · ') || v.title;
    if (v.type === 'risk') return [store, v.riskId].filter(Boolean).join(' · ') || v.title;
    return v.title;
  }
  function context(v) {
    if (v.storeId) {
      const s = stores.find(s => s.id === v.storeId), c = cameras.find(c => c.id === v.cameraId);
      WB.state.context = { storeId: s.id, storeName: s.name, cameraId: c?.id || '', cameraName: c?.name || '' };
      WB.syncContext();
    }
  }
  function activate(v) {
    b.active = v.id;
    context(v);
    persist(); render();
    if (v.type === 'video' && v.player === 'loading') loadPlayer(v);
  }
  function addView(v) {
    const existing = b.views.find(x => x.id === v.id);
    if (!existing) b.views.push(v);
    activate(existing || v);
  }
  function showOverview() { navigateSection('workbench'); }
  function showRecords() { navigateSection('records'); }
  function showRisks() { navigateSection('risks'); }
  function openVideo(storeId = 's1', cameraId = 'c1') {
    if (!stores.some(s => s.id === storeId)) return;
    const s = stores.find(s => s.id === storeId), c = cameras.find(c => c.id === cameraId) || cameras[0];
    const v = { id: `video-${storeId}-${storeId === 's3' ? 'empty' : c.id}`, type: 'video', title: `${s.name} · ${storeId === 's3' ? '摄像头' : c.name}`, storeId, cameraId: storeId === 's3' ? '' : c.id, player: 'loading' };
    addView(v);
  }
  function loadPlayer(v) {
    v.player = 'loading'; render();
    clearTimeout(loadingTimers.get(v.id));
    loadingTimers.set(v.id, setTimeout(() => {
      const c = cameras.find(c => c.id === v.cameraId);
      v.player = v.storeId === 's3' ? 'empty' : c?.status === 'online' ? 'unavailable' : c?.status || 'error';
      persist(); if (view().id === v.id) render();
      loadingTimers.delete(v.id);
    }, 650));
  }
  function currentInspection() { return b.inspections[view().id]; }
  function startInspection() {
    const v = view(), c = cameras.find(c => c.id === v.cameraId);
    if (!c || ['offline', 'denied'].includes(c.status)) return;
    if (!b.inspections[v.id] || b.inspections[v.id].status === 'submitted') {
      b.inspections[v.id] = {
        id: id('IS'), storeId: v.storeId, cameraId: v.cameraId, status: 'draft', started: now(), saved: '',
        checks: standards.map(s => ({ id: s.id, name: s.name, rule: s.rule, result: '', description: '', evidence: [] })), conclusion: '', dirty: true
      };
    }
    persist(); render();
    WB.addAI(`已开始${stores.find(s => s.id === v.storeId).name}的人工巡检。请按检查标准逐项判定，异常项须填写问题描述。你的人工判定将用于巡检记录。`);
  }
  function markResult(index, result) {
    const inspection = currentInspection(); if (!inspection || inspection.status !== 'draft') return;
    inspection.checks[index].result = result; inspection.dirty = true; persist();
    render();
  }
  function updateField(target) {
    if (target.dataset.description === undefined && target.dataset.conclusion === undefined) return;
    const inspection = currentInspection();
    if (!inspection || inspection.status !== 'draft') return;
    if (target.dataset.description !== undefined) inspection.checks[+target.dataset.description].description = target.value;
    if (target.dataset.conclusion !== undefined) inspection.conclusion = target.value;
    inspection.dirty = true;
    persist();
    $('#biz-save-state')?.replaceChildren(document.createTextNode('有未保存修改'));
  }
  function saveDraft() {
    const inspection = currentInspection(); if (!inspection) return;
    inspection.saved = now(); inspection.dirty = false; delete inspection.saveError;
    if (persist()) WB.toast('巡检草稿已保存');
    else { inspection.dirty = true; inspection.saveError = true; }
    render();
  }
  function attachEvidence(index) {
    WB.modal('关联异常证据', `<form id="evidence-form"><p class="biz-muted">选择与当前异常相关的现场图片。</p><label>证据图片<input id="evidence-file" type="file" accept="image/png,image/jpeg,image/webp" required></label><label>证据说明<input id="evidence-note" maxlength="100" placeholder="例如：操作台生熟砧板混用" required></label><p id="evidence-error" class="biz-error" role="alert"></p><div class="biz-modal-actions">${btn('取消','modal-close')}<button class="primary" type="submit">关联证据</button></div></form>`, d => {
      d.querySelector('form').onsubmit = ev => {
        ev.preventDefault();
        const file = d.querySelector('#evidence-file').files[0], note = d.querySelector('#evidence-note').value.trim();
        if (!file || !note) return;
        if (!['image/png','image/jpeg','image/webp'].includes(file.type) || file.size > 2 * 1024 * 1024) { d.querySelector('#evidence-error').textContent = '请选择不超过 2 MB 的 PNG、JPG 或 WebP 图片。'; return; }
        const reader = new FileReader();
        reader.onload = () => { const i = currentInspection(); if (!i) return; i.checks[index].evidence.push({ id: id('EV'), name: file.name, note, src: reader.result, time: now() }); i.dirty = true; delete i.saveError; const saved = persist(); if (!saved) i.saveError = true; WB.closeModal(); render(); if (!saved) WB.toast('证据保存失败，图片已保留在当前页面，请保存草稿重试。'); };
        reader.readAsDataURL(file);
      };
    });
  }
  function completeInspection() {
    const inspection = currentInspection(); if (!inspection) return;
    const unanswered = inspection.checks.filter(c => !c.result);
    const invalid = inspection.checks.filter(c => c.result === 'abnormal' && !c.description.trim());
    if (unanswered.length || invalid.length) {
      inspection.error = unanswered.length ? `还有 ${unanswered.length} 个检查项未判定，请完成后提交。` : '请填写所有异常项的问题描述。';
      render(); $('.biz-error-banner')?.scrollIntoView({ block: 'nearest' }); return;
    }
    delete inspection.error;
    render();
    const abnormal = inspection.checks.filter(c => c.result === 'abnormal');
    WB.modal('确认巡检结果', `<div class="biz-confirm-summary"><span>检查项 <strong>${inspection.checks.length}</strong></span><span>正常 <strong>${inspection.checks.filter(c => c.result === 'normal').length}</strong></span><span>异常 <strong class="biz-danger">${abnormal.length}</strong></span></div>${abnormal.length ? abnormal.map(c => `<div class="biz-review-item"><strong>${e(c.name)}</strong>${tag('人工确认异常','red')}<p>${e(c.description)}</p><small>已关联 ${c.evidence.length} 份证据</small></div>`).join('') : '<p class="biz-muted">本次巡检未标记异常。</p>'}<label>巡检结论<textarea id="confirm-conclusion" rows="3" maxlength="500" required>${e(inspection.confirmationDraft ?? (inspection.conclusion || (abnormal.length ? `发现 ${abnormal.length} 项异常，需跟进整改。` : '各检查项符合要求，未发现异常。')))}</textarea></label><p id="submit-error" class="biz-error" role="alert"></p><div class="biz-modal-actions">${btn('返回修改','modal-close')}${btn('确认保存','submit-inspection','primary')}</div>`, d=>{d.querySelector('#confirm-conclusion').oninput=ev=>{inspection.confirmationDraft=ev.target.value;persist();};});
  }
  function submitInspection() {
    const inspection = currentInspection(); if (!inspection || inspection.status !== 'draft') return;
    const conclusion = $('#confirm-conclusion').value.trim();
    if (!conclusion) { $('#submit-error').textContent = '请填写巡检结论。'; $('#confirm-conclusion').focus(); return; }
    inspection.conclusion = conclusion;
    const record = JSON.parse(JSON.stringify({ ...inspection, id: id('XJ'), inspectionId: inspection.id, workSessionId: WB.state.sessionId, operator: '林晓', time: now(), status: 'submitted', dirty: false }));
    b.records.unshift(record); inspection.status = 'submitted'; inspection.recordId = record.id; inspection.dirty = false;
    if (!persist()) {
      b.records.shift(); inspection.status = 'draft'; inspection.dirty = true; delete inspection.recordId;
      $('#submit-error').textContent = '保存失败，填写内容已保留。请释放浏览器存储空间后重试。'; return;
    }
    WB.closeModal(); render();
    WB.addAI(`巡检记录 ${record.id} 已保存。共 ${record.checks.length} 项检查，${record.checks.filter(c => c.result === 'abnormal').length} 项异常。可在“巡检记录”查看，或为确认的异常创建风险事件。`);
  }
  function openRecord(recordId) {
    const r = b.records.find(r => r.id === recordId); if (!r) return;
    addView({ id: 'record-' + r.id, type: 'record', recordId: r.id, title: '巡检记录详情', storeId: r.storeId, cameraId: r.cameraId });
  }
  function requestAnalysis() {
    const v = view(), current = WB.state.context;
    if (!current?.cameraId) { WB.addAI('请先选择门店与摄像头，再指定要分析的时间范围。'); return; }
    if (b.analysis?.status === 'running') { addView({ id: 'analysis', type: 'analysis', title: '视频分析' }); return; }
    const c = cameras.find(c => c.id === current.cameraId);
    if (c?.status === 'denied') { WB.toast('当前摄像头无视频分析权限，请选择有权限的摄像头'); return; }
    WB.modal('确认视频分析范围', `<form id="analysis-form"><dl class="biz-dl"><dt>分析对象</dt><dd>${e(current.storeName)} · ${e(current.cameraName)}</dd></dl><label>时间范围<select id="analysis-window"><option value="5">最近 5 分钟</option><option value="15">最近 15 分钟</option><option value="30">最近 30 分钟</option></select></label><label>检查标准<select id="analysis-standard"><option value="着装与操作卫生">从业人员着装与操作卫生</option><option value="生熟分开">生熟分开</option><option value="食品气味">食品气味</option></select></label><p class="biz-muted">识别结果须经人工复核后计入巡检记录。</p><div class="biz-modal-actions">${btn('取消','modal-close')}<button class="primary" type="submit">开始分析</button></div></form>`, d => {
      d.querySelector('form').onsubmit = ev => {
        ev.preventDefault();
        b.analysis = { id: id('AT'), status: 'running', storeId: current.storeId, cameraId: current.cameraId, storeName: current.storeName, cameraName: current.cameraName, window: $('#analysis-window').value, standard: $('#analysis-standard').value, started: now(), error: '' };
        WB.closeModal(); addView({ id: 'analysis', type: 'analysis', title: '视频分析', storeId: current.storeId, cameraId: current.cameraId });
        WB.addAI(`已记录 ${current.storeName} · ${current.cameraName} 最近 ${b.analysis.window} 分钟的分析请求。分析期间可继续填写人工巡检，不会覆盖人工判定。`);
        clearTimeout(analysisTimer);
        analysisTimer = setTimeout(() => {
          if (b.analysis?.status !== 'running') return;
          b.analysis.status = 'failed';
          b.analysis.error = b.analysis.standard === '食品气味' ? '视频识别不支持食品气味判定，请通过现场人工检查确认。' : '视频分析服务暂不可用，未获得检测结果。请稍后重试或继续人工巡检。';
          persist(); render(); WB.addAI(b.analysis.error);
        }, 1800);
      };
    });
  }
  function cancelAnalysis() { clearTimeout(analysisTimer); if (b.analysis) b.analysis.status = 'cancelled'; persist(); render(); WB.addAI('已取消当前视频分析，人工巡检内容已保留。'); }
  function keepFormDraft(form, key) {
    b.formDrafts ||= {};
    const previous = b.formDrafts[key];
    if(previous) Array.from(form.elements).forEach(field=>{if(field.id && Object.hasOwn(previous,field.id))field.value=previous[field.id];});
    const capture=()=>{const values={};Array.from(form.elements).forEach(field=>{if(field.id && ['INPUT','SELECT','TEXTAREA'].includes(field.tagName))values[field.id]=field.value;});b.formDrafts[key]=values;persist();};
    form.addEventListener('input',capture);form.addEventListener('change',capture);
  }
  function requestRisk(recordId) {
    const selectedRecordId = recordId || view().recordId;
    let r = selectedRecordId ? b.records.find(r => r.id === selectedRecordId) : b.records.find(r => r.storeId === WB.state.context?.storeId && r.cameraId === WB.state.context?.cameraId && r.checks.some(c => c.result === 'abnormal'));
    if (!r) { WB.addAI('请先保存包含已确认异常的巡检记录，再创建风险事件。'); return; }
    const abnormal = r.checks.filter(c => c.result === 'abnormal');
    if (!abnormal.length) { WB.toast('该巡检记录没有已确认异常'); return; }
    const s = stores.find(s => s.id === r.storeId);
    WB.modal('创建风险事件', `<form id="risk-form"><dl class="biz-dl"><dt>责任门店</dt><dd>${e(s.name)}</dd><dt>来源记录</dt><dd>${e(r.id)}</dd></dl><label>异常检查项<select id="risk-item">${abnormal.map((c,i) => `<option value="${i}">${e(c.name)}</option>`).join('')}</select></label><label>风险等级<select id="risk-level"><option>一般风险</option><option>较大风险</option><option>重大风险</option></select></label><label>问题描述<textarea id="risk-description" rows="3" required maxlength="500">${e(abnormal[0].description)}</textarea></label><label>处置建议<textarea id="risk-advice" rows="2" required maxlength="300">请门店核实问题，落实整改并上传整改证据。</textarea></label><p class="biz-muted" id="risk-evidence">已关联 ${abnormal[0].evidence.length} 份原始证据</p><p id="risk-error" class="biz-error" role="alert"></p><div class="biz-modal-actions">${btn('取消','modal-close')}<button class="primary" type="submit">确认创建</button></div></form>`, d => {
      d.querySelector('#risk-item').onchange = ev => { $('#risk-description').value = abnormal[+ev.target.value].description; $('#risk-evidence').textContent = `已关联 ${abnormal[+ev.target.value].evidence.length} 份原始证据`; };
      keepFormDraft(d.querySelector('form'),'risk-'+r.id);
      $('#risk-evidence').textContent=`已关联 ${abnormal[+$('#risk-item').value].evidence.length} 份原始证据`;
      d.querySelector('form').onsubmit = ev => {
        ev.preventDefault(); const description = $('#risk-description').value.trim(), advice = $('#risk-advice').value.trim();
        if (!description || !advice) { $('#risk-error').textContent = '请填写问题描述与处置建议。'; return; }
        const check = abnormal[+$('#risk-item').value];
        const risk = { id: id('FX'), recordId: r.id, storeId: r.storeId, name: check.name, level: $('#risk-level').value, description, advice, evidence: JSON.parse(JSON.stringify(check.evidence)), time: now(), status: '待处置', correction: null };
        b.risks.unshift(risk);
        if (!persist()) { b.risks.shift(); $('#risk-error').textContent = '保存失败，表单已保留，请稍后重试。'; return; }
        delete b.formDrafts['risk-'+r.id];
        WB.closeModal(); addView({ id: 'risk-' + risk.id, type: 'risk', title: '风险事件详情', riskId: risk.id, storeId: risk.storeId, cameraId: r.cameraId });
        WB.addAI(`已创建${s.name}风险事件 ${risk.id}，等级为${risk.level}，可继续创建整改任务。`);
      };
    });
  }
  function correction(riskId) {
    const r = b.risks.find(r => r.id === riskId); if (!r || r.correction) return;
    WB.modal('创建整改任务', `<form id="correction-form"><p>${e(stores.find(s => s.id === r.storeId).name)} · ${e(r.name)}</p><label>整改责任人<input id="correction-owner" value="陈明" required maxlength="30"></label><label>整改期限<input id="correction-date" type="date" min="2026-10-29" required></label><label>整改要求<textarea id="correction-content" rows="3" required>${e(r.advice)}</textarea></label><p id="correction-error" role="alert" class="biz-error"></p><div class="biz-modal-actions">${btn('取消','modal-close')}<button class="primary" type="submit">确认创建</button></div></form>`, d => {
      keepFormDraft(d.querySelector('form'),'correction-'+r.id);
      d.querySelector('form').onsubmit = ev => { ev.preventDefault(); const owner = $('#correction-owner').value.trim(), content = $('#correction-content').value.trim(), deadline = $('#correction-date').value; if (!owner || !content || !deadline) { $('#correction-error').textContent = '请完整填写整改责任人、期限与要求。'; return; } r.correction = { id: id('ZG'), owner, content, deadline }; r.status = '整改中'; if (!persist()) { r.correction = null; r.status = '待处置'; $('#correction-error').textContent = '保存失败，请重试。'; return; } delete b.formDrafts['correction-'+r.id];persist(); WB.closeModal(); render(); WB.toast('整改任务已创建'); };
    });
  }
  function summarize() {
    const active = view();
    const recordId = active.recordId || b.risks.find(r => r.id === active.riskId)?.recordId;
    const inspection = b.records.find(r => r.id === recordId) || currentInspection() || Object.values(b.inspections).find(i => i.storeId === WB.state.context?.storeId && i.cameraId === WB.state.context?.cameraId);
    if (!inspection) return '当前尚未开始人工巡检。选择摄像头后，可在右侧开始检查。';
    const done = inspection.checks.filter(c => c.result), abnormal = done.filter(c => c.result === 'abnormal');
    return `当前已判定 ${done.length}/${inspection.checks.length} 项，正常 ${done.filter(c => c.result === 'normal').length} 项，异常 ${abnormal.length} 项，未判定 ${inspection.checks.length - done.length} 项。${abnormal.length ? '异常：' + abnormal.map(c => `${c.name}（${c.description || '待补充描述'}）`).join('；') + '。' : ''}人工判定已保留。`;
  }
  function historyAnalysis() {
    if (!b.historyAnalysis) b.historyAnalysis = {
      id: 'VA-20261029-008', source: '片段分析', storeId: 's1', cameraId: 'c1', from: '2026/10/29 10:00:00', to: '2026/10/29 10:05:00',
      status: 'waiting_review', items: [
        { id: 'd1', name: '从业人员着装', description: '操作人员工作帽未完整覆盖头发，需结合现场画面核实。', confidence: '92%', frame: '00:02:18', review: '' },
        { id: 'd2', name: '操作环境卫生', description: '操作台边缘疑似存在杂物，需人工判断是否为作业用品。', confidence: '78%', frame: '00:03:42', review: '' }
      ]
    };
    addView({ id: 'analysis-history', type: 'analysisHistory', title: '分析结果复核', storeId: 's1', cameraId: 'c1' });
  }
  function reviewDetection(index, result) {
    if (!b.historyAnalysis || b.historyAnalysis.status === 'reviewed') return;
    if (b.historyAnalysis.items[index].applied) return;
    b.historyAnalysis.items[index].review = result; persist(); render();
  }
  function applyReview() {
    const a = b.historyAnalysis; if (!a || a.status === 'reviewed') return;
    if (a.items.some(item => !item.review)) { a.error = '请逐项复核检测结果。'; render(); return; }
    if (a.items.some(item => item.review === 'abnormal') && !a.evidence) { a.error = '原始片段暂不可用，请先补充现场证据后确认异常，或保留待核实。'; render(); return; }
    const before = JSON.parse(JSON.stringify({ inspections: b.inspections, analysis: a }));
    const accepted = a.items.filter(item => item.review === 'abnormal' && !item.applied);
    if (accepted.length) {
      const key = 'video-s1-c1'; let inspection = b.inspections[key];
      if (!inspection || inspection.status === 'submitted') {
        inspection = b.inspections[key] = { id: id('IS'), storeId: 's1', cameraId: 'c1', status: 'draft', started: now(), saved: '', checks: standards.map(s=>({id:s.id,name:s.name,rule:s.rule,result:'',description:'',evidence:[]})), conclusion: '', dirty: true };
      }
      accepted.forEach(item => {
        if (!inspection.checks.some(c => c.id === 'review-' + item.id)) inspection.checks.push({ id: 'review-' + item.id, name: item.name + '（片段复核）', rule: '依据片段检测结果与现场证据，由人工复核判定。', result: 'abnormal', description: item.description, evidence: [a.evidence], source: a.id });
        item.applied = true;
      });
      inspection.dirty = true;
    }
    a.status = a.items.some(item=>item.review==='pending') ? 'waiting_review' : 'reviewed'; a.reviewed = now(); delete a.error;
    if(!persist()){b.inspections=before.inspections;b.historyAnalysis=before.analysis;b.historyAnalysis.error='复核结果保存失败，当前填写已保留，请稍后重试。';render();return;}
    render();
    WB.addAI(`已保存本次人工复核：新增确认 ${accepted.length} 项异常，排除 ${a.items.filter(item=>item.review==='excluded').length} 项，待核实 ${a.items.filter(item=>item.review==='pending').length} 项。${accepted.length?'已将确认异常追加到湖滨店巡检草稿，原人工判定保持不变。':'未向巡检记录写入异常。'}`);
  }
  function reviewEvidence() {
    WB.modal('补充复核证据', `<form id="review-evidence-form"><label>现场图片<input id="review-evidence-file" type="file" accept="image/png,image/jpeg,image/webp" required></label><label>证据说明<input id="review-evidence-note" maxlength="100" required placeholder="请说明证据与检测项的关联"></label><p id="review-evidence-error" class="biz-error" role="alert"></p><div class="biz-modal-actions">${btn('取消','modal-close')}<button type="submit" class="primary">关联证据</button></div></form>`, d => {
      d.querySelector('form').onsubmit = ev => { ev.preventDefault(); const f=$('#review-evidence-file').files[0],note=$('#review-evidence-note').value.trim();if(!f||!note)return;if(!['image/png','image/jpeg','image/webp'].includes(f.type)||f.size>2*1024*1024){$('#review-evidence-error').textContent='请选择不超过 2 MB 的 PNG、JPG 或 WebP 图片。';return;}const reader=new FileReader();reader.onload=()=>{b.historyAnalysis.evidence={id:id('EV'),name:f.name,note,src:reader.result,time:now()};delete b.historyAnalysis.error;const saved=persist();if(!saved)b.historyAnalysis.error='复核证据保存失败，图片已保留在当前页面，请保存复核结果重试。';WB.closeModal();render();if(!saved)WB.toast('复核证据保存失败，当前图片已保留，请重试保存。');};reader.readAsDataURL(f); };
    });
  }
  function analysisHistoryHTML() {
    const a = b.historyAnalysis;
    return `<div class="biz-detail"><div class="biz-heading"><div><h2>着装与操作卫生复核 ${tag(a.status==='reviewed'?'已复核':'待人工复核',a.status==='reviewed'?'green':'amber')}</h2><p>湖滨店 · 热加工区</p></div></div><dl class="biz-dl"><dt>结果来源</dt><dd>${e(a.source)} · ${e(a.id)}</dd><dt>片段时间</dt><dd>${e(a.from)} 至 ${e(a.to)}</dd><dt>检测标准</dt><dd>后厨操作卫生检查</dd></dl><div class="biz-review-notice">检测结果为待核实线索，须经人工复核后计入巡检记录。原始片段暂不可用，可关联现场证据继续复核。</div>${a.error?`<div class="biz-error-banner" role="alert">${e(a.error)}</div>`:''}${a.items.map((item,index)=>`<section class="biz-detection-item"><div class="biz-section-head"><h3>${e(item.name)}</h3><span class="biz-muted">置信信息 ${e(item.confidence)}</span></div><p>${e(item.description)}</p><p class="biz-muted">片段位置 ${e(item.frame)} · 原始片段暂不可用</p><div class="biz-review-choices">${[['abnormal','确认异常'],['excluded','排除'],['pending','待核实']].map(([value,label])=>btn(label,'review-result',item.review===value?'selected':'',`data-index="${index}" data-result="${value}" aria-pressed="${item.review===value}" ${a.status==='reviewed'||item.applied?'disabled':''}`)).join('')}</div></section>`).join('')}<section class="biz-section"><div class="biz-section-head"><h3>复核证据</h3>${a.status!=='reviewed'?btn('关联现场证据','review-evidence','text-button'):''}</div>${a.evidence?evidenceHTML([a.evidence]):'<p class="biz-muted">暂无可用证据。确认异常前须补充现场图片。</p>'}</section><div class="biz-bottom-actions">${a.status==='reviewed'?btn('查看巡检草稿','open-video','primary','data-store="s1" data-camera="c1"'):btn('保存复核结果','apply-review','primary')}</div></div>`;
  }
  function exportReport(recordId) {
    const r=b.records.find(r=>r.id===recordId);if(!r)return;
    const text = `${stores.find(s=>s.id===r.storeId).name}巡检报告\n记录编号：${r.id}\n巡检人：${r.operator}\n保存时间：${r.time}\n\n检查结果\n${r.checks.map((c,index)=>`${index+1}. ${c.name}：${({normal:'正常',abnormal:'异常',na:'不适用'})[c.result]||'未判定'}${c.description?'\n问题描述：'+c.description:''}\n证据：${c.evidence.length}份`).join('\n')}\n\n巡检结论\n${r.conclusion}`;
    const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'})), link=document.createElement('a');link.href=url;link.download=`${r.id}-巡检报告.txt`;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);WB.toast('巡检报告已导出');
  }
  function closeView(viewId) {
    const closing = b.views.find(v => v.id === viewId);
    if (!closing || ['overview', 'records', 'risks'].includes(closing.type)) return;
    const draft = b.inspections[viewId], section = sectionFor(closing);
    const finish = () => { b.views = b.views.filter(v => v.id !== viewId); if (b.active === viewId) b.active = rootView(section).id; persist(); render(); };
    if (draft?.dirty && draft.status === 'draft') {
      WB.modal('关闭巡检视图？', `<p>当前有未保存的检查结果，关闭前可以保存草稿。</p><p id="close-error" class="biz-error" role="alert"></p><div class="biz-modal-actions">${btn('继续编辑','modal-close')}${btn('保留内容并关闭','close-keep','',`data-view="${e(viewId)}"`)}</div>`, d => {
        d.querySelector('[data-b="close-keep"]').onclick = ev => { ev.stopPropagation(); if (!persist()) { $('#close-error').textContent = '保存失败，请继续编辑并重试。'; return; } draft.dirty = false; persist(); WB.closeModal(); finish(); };
      }); return;
    }
    finish();
  }
  function tabs() {
    const v = view(), section = sectionFor(v), objects = b.views.filter(x => sectionFor(x) === section && !['overview', 'records', 'risks'].includes(x.type));
    const labels = { workbench: '工作概览', records: '后厨巡检记录', risks: '巡检风险记录' }, node = $('#view-tabs');
    node.removeAttribute('role');
    node.setAttribute('aria-label', '当前业务对象');
    node.innerHTML = objects.length ? btn('← 返回' + labels[section], 'section', 'biz-section-back', 'data-section="' + section + '"') + '<div class="biz-object-tabs" role="tablist" aria-label="已打开的业务对象">' + objects.map(x => {
      const title = objectTitle(x);
      return '<div class="biz-tab ' + (b.active === x.id ? 'active' : '') + '" role="presentation"><button type="button" role="tab" aria-selected="' + (b.active === x.id) + '" data-b="tab" data-view="' + e(x.id) + '" title="' + e(title) + '">' + e(title) + '</button>' + btn('×', 'close-view', 'biz-tab-close', 'data-view="' + e(x.id) + '" aria-label="关闭' + e(title) + '"') + '</div>';
    }).join('') + '</div>' : '';
    node.closest('.wb-business-head')?.classList.toggle('biz-navigation-empty', !objects.length);
  }
  function render() {
    if (!b || !$('#view-content')) return;
    tabs(); const v = view();
    $('#view-content').innerHTML = ({ overview: overviewHTML, video: videoHTML, records: recordsHTML, record: recordHTML, analysis: analysisHTML, analysisHistory: analysisHistoryHTML, risks: risksHTML, risk: riskHTML }[v.type] || overviewHTML)(v);
    window.dispatchEvent(new CustomEvent('ai-business-view', { detail: { type: v.type, title: v.title } }));
  }
  function overviewHTML() {
    const lakeRecord=b.records.find(r=>r.storeId==='s1');
    const riskCount=3+b.risks.filter(r=>!['FX-20261029-001','FX-20261028-003'].includes(r.id)).length;
    return `<div class="biz-overview"><div class="biz-heading"><div><h2>工作概览</h2><p>华东区域 · 2026年10月29日，星期四</p></div>${tag('数据范围：杭州')}</div><div class="biz-scope-line"><span>管理范围 <strong>3 家门店</strong></span><span>今日巡检 <strong>${lakeRecord?'3':'2'} / 3 家</strong></span><span>待处置风险 <strong class="biz-danger">${riskCount} 项</strong></span></div><section class="biz-section"><div class="biz-section-head"><h3>今日巡检任务</h3><span class="biz-muted">按计划完成门店检查</span></div><div class="biz-task-row"><span class="biz-store-icon">湖</span><div><strong>湖滨店</strong><p>午餐前后厨操作巡检 · 11:00前完成</p></div>${tag(lakeRecord?'已完成':'待巡检',lakeRecord?'green':'amber')}${lakeRecord?btn('查看记录','record','text-button',`data-id="${e(lakeRecord.id)}"`):btn('开始巡检','open-video','', 'data-store="s1" data-camera="c1"')}</div><div class="biz-task-row"><span class="biz-store-icon">万</span><div><strong>万象城店</strong><p>人员卫生与环境检查 · 09:42完成</p></div>${tag('已完成','green')}${btn('查看摄像头','open-video','text-button', 'data-store="s2" data-camera="c1"')}</div><div class="biz-task-row"><span class="biz-store-icon">滨</span><div><strong>滨江店</strong><p>餐前自查 · 09:18完成</p></div>${tag('已完成','green')}${btn('查看摄像头','open-video','text-button', 'data-store="s3"')}</div></section><section class="biz-section"><div class="biz-section-head"><h3>待处理风险</h3><span class="biz-muted">${riskCount} 项待门店跟进</span></div><div class="biz-risk-row"><span class="biz-risk-dot"></span><div><strong>万象城店 · 生熟工用具混放</strong><p>热加工区 · 今日 09:42 · 已人工确认</p></div>${tag('较大风险','red')}${btn('查看详情','seed-risk','text-button')}</div><div class="biz-risk-row"><span class="biz-risk-dot amber"></span><div><strong>湖滨店 · 操作台清洁不到位</strong><p>粗加工区 · 今日 08:56 · 待复核</p></div>${tag('一般风险','amber')}${btn('查看现场','open-video','text-button','data-store="s1" data-camera="c2"')}</div><div class="biz-risk-row"><span class="biz-risk-dot amber"></span><div><strong>滨江店 · 消毒记录缺失</strong><p>餐具消毒区 · 昨日 17:20 · 待门店补充</p></div>${tag('一般风险','amber')}${btn('查看详情','seed-risk-secondary','text-button')}</div></section><section class="biz-section"><div class="biz-section-head"><h3>最近工作成果</h3>${btn('全部记录','records','text-button')}</div><div class="biz-result-link"><span class="biz-document-icon">▧</span><div><strong>湖滨店 · 着装检查片段</strong><p>今日 10:05 · 片段分析 · 2 项待人工复核</p></div>${btn('去复核','history-analysis','text-button')}</div><div class="biz-result-link"><span class="biz-document-icon">▤</span><div><strong>华东区域 · 晨间巡检汇总</strong><p>今日 10:05 · 林晓 · 2 家门店，8 项检查</p></div>${btn('查看汇总','report','text-button')}</div></section></div>`;
  }
  function playerHTML(v) {
    const c = cameras.find(c => c.id === v.cameraId);
    const statuses = { loading: ['正在获取视频资源', '请稍候，正在连接摄像头。'], unavailable: ['视频资源暂不可用', '播放地址尚未获取，请重试连接或切换摄像头。'], offline: ['摄像头离线', '请检查设备网络，或切换其他在线摄像头。'], denied: ['暂无视频访问权限', '请联系组织管理员开通当前摄像头权限。'], error: ['视频加载失败', '未能连接视频服务，请稍后重试。'], empty: ['暂无可用摄像头', '该门店尚未关联摄像头，请选择其他门店。'] };
    const status = statuses[v.player] || statuses.unavailable;
    return `<div class="biz-player ${v.player === 'loading' ? 'loading' : ''}"><div class="biz-player-top"><span>${e(stores.find(s => s.id === v.storeId).name)} / ${e(c?.name || '摄像头')}</span><span>${tag(c?.status === 'online' ? '设备在线' : c?.status === 'offline' ? '设备离线' : c?.status === 'denied' ? '访问受限' : '待连接',c?.status === 'online' ? 'green' : 'gray')}</span></div><div class="biz-player-state"><span class="biz-camera-symbol">${WB.icon('camera')}</span><strong>${status[0]}</strong><p>${status[1]}</p>${v.player !== 'denied' && v.player !== 'empty' && v.player !== 'loading' ? btn('重新连接','retry-player','biz-player-retry') : ''}</div><div class="biz-player-bottom"><span>视频状态：${v.player === 'loading' ? '连接中' : '未连接'}</span><span>当前无视频画面</span></div></div>`;
  }
  function videoHTML(v) {
    const s = stores.find(s => s.id === v.storeId), c = cameras.find(c => c.id === v.cameraId), inspection = b.inspections[v.id];
    const playable = c && !['offline','denied'].includes(c.status);
    return `<div class="biz-video"><div class="biz-heading"><div><h2>${e(s.name)} <span class="biz-heading-slash">/</span> ${e(c?.name || '视频巡检')}</h2><p>${e(s.region)} · ${c ? '摄像头编号 CAM-' + e(c.id.toUpperCase()) : '尚未配置视频资源'}</p></div>${btn('巡检记录','records','text-button')}</div><div class="biz-camera-controls"><label>门店<select id="biz-store" aria-label="切换门店">${stores.map(x => `<option value="${x.id}" ${x.id === s.id ? 'selected' : ''}>${e(x.name)}</option>`).join('')}</select></label><label>摄像头<select id="biz-camera" aria-label="切换摄像头" ${s.id === 's3' ? 'disabled' : ''}>${s.id === 's3' ? '<option>无可用摄像头</option>' : cameras.map(x => `<option value="${x.id}" ${x.id === c?.id ? 'selected' : ''}>${e(x.name)}${x.status === 'offline' ? ' · 离线' : x.status === 'denied' ? ' · 受限' : ''}</option>`).join('')}</select></label>${btn('AI视频分析','analysis','', !playable ? 'disabled' : '')}</div>${playerHTML(v)}${inspection?.status === 'submitted' ? `<div class="biz-success"><strong>巡检记录已保存</strong><p>${e(inspection.recordId)} · 检查结果及证据已归档</p>${btn('查看记录','record','',`data-id="${e(inspection.recordId)}"`)}${btn('继续巡检','start-inspection','text-button')}</div>` : inspection ? inspectionHTML(inspection) : `<section class="biz-start-section"><div><h3>人工即时巡检</h3><p>按检查标准记录现场判定，异常项可关联证据。</p>${!playable ? '<p class="biz-muted">请先选择可用摄像头。</p>' : '<p class="biz-muted">视频未连接，暂无法截图；可填写现场检查结果并上传证据。</p>'}</div>${btn('开始人工巡检','start-inspection','primary',!playable || v.player === 'loading' ? 'disabled' : '')}</section>`}</div>`;
  }
  function inspectionHTML(i) {
    const done = i.checks.filter(c => c.result).length;
    return `<section class="biz-inspection"><div class="biz-section-head"><h3>检查清单 <span class="biz-count">${done}/${i.checks.length}</span></h3><span>${tag('人工巡检中','blue')}</span></div><div class="biz-standard-line"><span>适用标准：后厨操作卫生检查</span>${btn('查看标准','standards','text-button')}</div>${i.error ? `<div class="biz-error-banner" role="alert">${e(i.error)}</div>` : ''}${i.saveError ? `<div class="biz-error-banner" role="alert">草稿保存失败，当前输入已保留。${btn('重试保存','save-draft','text-button')}</div>` : ''}${i.checks.map((c,index) => `<div class="biz-check-row ${c.result === 'abnormal' ? 'abnormal' : ''}"><div class="biz-check-top"><div class="biz-check-title"><span>${String(index+1).padStart(2,'0')}</span><strong>${e(c.name)}</strong></div><div class="biz-choice" aria-label="${e(c.name)}结果">${[['normal','正常'],['abnormal','异常'],['na','不适用']].map(([value,label]) => btn(label,'mark',c.result === value ? 'selected ' + value : '',`data-index="${index}" data-result="${value}" aria-pressed="${c.result === value}"`)).join('')}</div></div><p class="biz-check-rule">${e(c.rule)}</p>${c.result === 'abnormal' ? `<label class="biz-description"><span>问题描述 <em>*</em></span><textarea data-description="${index}" rows="2" maxlength="500" placeholder="请记录具体位置与异常情况" aria-required="true">${e(c.description)}</textarea></label><div class="biz-evidence-row">${btn('+ 关联证据','evidence','text-button',`data-index="${index}"`)}<span>${c.evidence.length} 份证据</span></div>${evidenceHTML(c.evidence)}` : ''}</div>`).join('')}<div class="biz-inspection-footer"><span id="biz-save-state">${i.dirty ? '有未保存修改' : i.saved ? '草稿保存于 ' + e(i.saved) : '请完成所有检查项'}</span><div>${btn('保存草稿','save-draft')}${btn('完成巡检','complete','primary')}</div></div></section>`;
  }
  function evidenceHTML(items) { return items.length ? `<div class="biz-evidence-list">${items.map(item => `<button type="button" data-b="view-evidence" class="biz-evidence" aria-label="查看证据：${e(item.note)}"><img src="${e(item.src)}" alt="${e(item.note)}"><span>${e(item.note)}</span></button>`).join('')}</div>` : ''; }
  function viewEvidence(target) {
    const image = target.querySelector('img'); if (!image) return;
    WB.modal('查看证据', `<figure class="biz-evidence-preview"><img src="${e(image.src)}" alt="${e(image.alt)}"><figcaption>${e(image.alt)}</figcaption></figure><div class="biz-modal-actions">${btn('关闭','modal-close')}</div>`);
  }
  function recordsHTML() {
    return `<div class="biz-records"><div class="biz-heading"><div><h2>巡检记录</h2><p>已保存的人工巡检结果与异常证据</p></div></div>${b.records.length ? `<div class="biz-table-wrap"><table><thead><tr><th>巡检记录 / 门店</th><th>检查结果</th><th>巡检人 / 时间</th><th>操作</th></tr></thead><tbody>${b.records.map(r => `<tr><td><strong>${e(stores.find(s=>s.id===r.storeId).name)}</strong><small>${e(r.id)}</small></td><td>${tag(r.checks.some(c=>c.result==='abnormal') ? r.checks.filter(c=>c.result==='abnormal').length + ' 项异常' : '全部正常',r.checks.some(c=>c.result==='abnormal') ? 'red' : 'green')}<small>共 ${r.checks.length} 项检查</small></td><td>${e(r.operator)}<small>${e(r.time)}</small></td><td>${btn('查看','record','text-button',`data-id="${e(r.id)}"`)}</td></tr>`).join('')}</tbody></table></div>` : `<div class="biz-empty"><span>▤</span><strong>暂无巡检记录</strong><p>完成并确认巡检后，记录将在这里保存。</p>${btn('开始门店巡检','open-video','primary','data-store="s1" data-camera="c1"')}</div>`}</div>`;
  }
  function recordHTML(v) {
    const r = b.records.find(r=>r.id===v.recordId); if(!r) return recordsHTML();
    return `<div class="biz-detail"><div class="biz-heading"><div><h2>巡检记录 ${tag('已保存','green')}</h2><p>${e(r.id)}</p></div>${btn('返回记录','records','text-button')}</div><dl class="biz-dl"><dt>巡检门店</dt><dd>${e(stores.find(s=>s.id===r.storeId).name)}</dd><dt>摄像头</dt><dd>${e(cameras.find(c=>c.id===r.cameraId)?.name)}</dd><dt>巡检人</dt><dd>${e(r.operator)}</dd><dt>保存时间</dt><dd>${e(r.time)}</dd></dl><section class="biz-section"><h3>检查结果</h3>${r.checks.map(c=>`<div class="biz-review-item"><strong>${e(c.name)}</strong>${tag(c.result==='normal'?'正常':c.result==='abnormal'?'人工确认异常':'不适用',c.result==='normal'?'green':c.result==='abnormal'?'red':'gray')}${c.description ? `<p>${e(c.description)}</p>` : ''}${evidenceHTML(c.evidence)}</div>`).join('')}</section><section class="biz-section"><h3>巡检结论</h3><p class="biz-prewrap">${e(r.conclusion)}</p></section><div class="biz-bottom-actions">${btn('导出巡检报告','export-report','',`data-id="${e(r.id)}"`)}${r.checks.some(c=>c.result==='abnormal') ? btn('创建风险事件','risk','primary',`data-id="${e(r.id)}"`) : ''}</div></div>`;
  }
  function analysisHTML() {
    const a = b.analysis; if(!a) return `<div class="biz-empty"><strong>尚未发起视频分析</strong><p>请先选择摄像头和分析时间范围。</p></div>`;
    const state = { running:'分析进行中', failed:'分析未完成', cancelled:'已取消' }[a.status] || '等待处理';
    return `<div class="biz-analysis"><div class="biz-heading"><div><h2>视频分析 ${tag(state,a.status==='failed'?'red':a.status==='running'?'blue':'gray')}</h2><p>${e(a.storeName)} · ${e(a.cameraName)}</p></div></div><dl class="biz-dl"><dt>时间范围</dt><dd>${e(a.started)}前 ${e(a.window)} 分钟</dd><dt>检查标准</dt><dd>${e(a.standard)}</dd><dt>任务编号</dt><dd>${e(a.id)}</dd></dl><div class="biz-task-steps"><div class="done">✓ <span>确认门店、摄像头与时间范围</span></div><div class="done">✓ <span>校验视频资源访问范围</span></div><div class="${a.status==='failed'?'failed':''}">${a.status==='running'?'◌':a.status==='failed'?'!':'—'} <span>${a.status==='running'?'正在请求视频分析服务':a.status==='failed'?'视频分析未返回结果':'任务已停止'}</span></div><div class="pending">○ <span>返回检测结果，等待人工复核</span></div></div>${a.status==='failed'?`<div class="biz-error-banner" role="alert">${e(a.error)}</div>`:''}<p class="biz-muted">分析任务与人工巡检独立，人工填写内容不会被覆盖。</p><div class="biz-bottom-actions">${a.status==='running'?btn('取消分析','cancel-analysis'):btn('重新分析','analysis','primary')}${btn('返回摄像头','open-video','',`data-store="${e(a.storeId)}" data-camera="${e(a.cameraId)}"`)}</div></div>`;
  }
  function risksHTML() {
    return `<div class="biz-risks"><div class="biz-heading"><div><h2>风险事件</h2><p>来自人工确认异常的待处置事项</p></div></div>${b.risks.length ? b.risks.map(r=>`<div class="biz-risk-list-item"><div><strong>${e(stores.find(s=>s.id===r.storeId).name)} · ${e(r.name)}</strong><p>${e(r.id)} · ${e(r.time)}</p></div>${tag(r.status,'amber')}${btn('查看详情','risk-detail','text-button',`data-id="${e(r.id)}"`)}</div>`).join('') : '<div class="biz-empty"><strong>暂无风险事件</strong><p>从已保存巡检记录中的异常项创建风险事件。</p></div>'}</div>`;
  }
  function riskHTML(v) {
    const r = b.risks.find(r=>r.id===v.riskId); if(!r) return risksHTML();
    return `<div class="biz-detail"><div class="biz-heading"><div><h2>${e(r.name)} ${tag(r.status,'amber')}</h2><p>${e(r.id)}</p></div>${btn('全部风险','risks','text-button')}</div><dl class="biz-dl"><dt>责任门店</dt><dd>${e(stores.find(s=>s.id===r.storeId).name)}</dd><dt>风险等级</dt><dd>${tag(r.level,r.level==='一般风险'?'amber':'red')}</dd><dt>风险来源</dt><dd>人工巡检 · ${e(r.recordId)}</dd><dt>创建时间</dt><dd>${e(r.time)}</dd><dt>复核状态</dt><dd>已人工确认</dd></dl><section class="biz-section"><h3>问题描述</h3><p class="biz-prewrap">${e(r.description)}</p>${evidenceHTML(r.evidence)}</section><section class="biz-section"><h3>处置建议</h3><p class="biz-prewrap">${e(r.advice)}</p></section>${r.correction ? `<section class="biz-section"><h3>整改任务 ${tag('待整改','amber')}</h3><dl class="biz-dl"><dt>任务编号</dt><dd>${e(r.correction.id)}</dd><dt>责任人</dt><dd>${e(r.correction.owner)}</dd><dt>整改期限</dt><dd>${e(r.correction.deadline)}</dd></dl><p>${e(r.correction.content)}</p></section>` : `<div class="biz-bottom-actions">${btn('创建整改任务','correction','primary',`data-id="${e(r.id)}"`)}</div>`}</div>`;
  }
  function seedRisk(secondary=false) {
    const rid=secondary?'FX-20261028-003':'FX-20261029-001';
    if(!b.risks.some(r=>r.id===rid)) b.risks.push({id:rid,recordId:secondary?'XJ-20261028-018':'XJ-20261029-006',storeId:secondary?'s3':'s2',name:secondary?'消毒记录缺失':'生熟工用具混放',level:secondary?'一般风险':'较大风险',description:secondary?'餐具消毒区当日消毒记录未及时填写，请核查实际消毒情况并补充记录。':'热加工区同一存放架上混放生食与熟食工用具，存在交叉污染风险。',advice:secondary?'核查并补充消毒记录，明确日常记录责任人。':'立即对工用具分类清洗消毒，按生熟用途分区存放并做好标识。',evidence:[],time:secondary?'2026/10/28 17:20:00':'2026/10/29 09:42:00',status:'待处置',correction:null});
    const r=b.risks.find(r=>r.id===rid);addView({id:'risk-'+rid,type:'risk',title:'风险事件详情',riskId:rid,storeId:r.storeId,cameraId:secondary?'c3':'c1'});
  }
  function standardsModal() { WB.modal('后厨操作卫生检查标准', standards.map((s,i)=>`<div class="biz-standard-item"><strong>${i+1}. ${e(s.name)}</strong><p>${e(s.rule)}</p></div>`).join('') + `<div class="biz-modal-actions">${btn('关闭','modal-close')}</div>`); }
  function report() { WB.modal('晨间巡检汇总', `<dl class="biz-dl"><dt>管理范围</dt><dd>华东区域 · 杭州</dd><dt>汇总时间</dt><dd>2026年10月29日 10:05</dd><dt>已完成</dt><dd>万象城店、滨江店</dd><dt>检查结果</dt><dd>8 项检查，2 项异常</dd></dl><h3>主要问题</h3><p>万象城店生熟工用具混放，已人工确认并建立风险事件；滨江店消毒记录需补充核实。</p><h3>后续安排</h3><p>完成湖滨店午餐前巡检，跟进异常整改。</p><div class="biz-modal-actions">${btn('关闭','modal-close')}</div>`); }
  function onClick(ev) {
    const target=ev.target.closest('[data-b]');if(!target || target.disabled) return;
    const action=target.dataset.b, vi=target.dataset.view, index=+target.dataset.index;
    if(action==='tab') activate(b.views.find(v=>v.id===vi));
    else if(action==='close-view') closeView(vi);
    else if(action==='section') navigateSection(target.dataset.section);
    else if(action==='open-video') openVideo(target.dataset.store||WB.state.context?.storeId||'s1',target.dataset.camera||'c1');
    else if(action==='records') showRecords();
    else if(action==='record') openRecord(target.dataset.id);
    else if(action==='risks') showRisks();
    else if(action==='risk-detail') {const r=b.risks.find(r=>r.id===target.dataset.id);if(r)addView({id:'risk-'+r.id,type:'risk',title:'风险事件详情',riskId:r.id,storeId:r.storeId});}
    else if(action==='retry-player') loadPlayer(view());
    else if(action==='start-inspection') startInspection();
    else if(action==='mark') markResult(index,target.dataset.result);
    else if(action==='evidence') attachEvidence(index);
    else if(action==='view-evidence') viewEvidence(target);
    else if(action==='save-draft') saveDraft();
    else if(action==='complete') completeInspection();
    else if(action==='submit-inspection') submitInspection();
    else if(action==='modal-close') WB.closeModal();
    else if(action==='standards') standardsModal();
    else if(action==='analysis') requestAnalysis();
    else if(action==='cancel-analysis') cancelAnalysis();
    else if(action==='risk') requestRisk(target.dataset.id);
    else if(action==='correction') correction(target.dataset.id);
    else if(action==='seed-risk') seedRisk();
    else if(action==='seed-risk-secondary') seedRisk(true);
    else if(action==='report') report();
    else if(action==='history-analysis') historyAnalysis();
    else if(action==='review-result') reviewDetection(index,target.dataset.result);
    else if(action==='review-evidence') reviewEvidence();
    else if(action==='apply-review') applyReview();
    else if(action==='export-report') exportReport(target.dataset.id);
  }
  function init() {
    clearTimeout(analysisTimer); loadingTimers.forEach(clearTimeout); loadingTimers.clear();
    b=WB.state.business || (WB.state.business=initial());
    if(b.analysis?.status==='running'){b.analysis.status='failed';b.analysis.error='会话恢复后未能获取任务状态，请重新发起分析。';}
    if(!mounted){
      document.addEventListener('click',onClick);
      document.addEventListener('input',ev=>updateField(ev.target));
      document.addEventListener('change',ev=>{if(ev.target.id==='biz-store')openVideo(ev.target.value,'c1');if(ev.target.id==='biz-camera')openVideo(view().storeId,ev.target.value);});
      mounted=true;
    }
    render();
    const v=view(); if(v.type==='video' && v.player==='loading')loadPlayer(v);
  }
  function resetSession(){clearTimeout(analysisTimer);loadingTimers.forEach(clearTimeout);loadingTimers.clear();b=WB.state.business=initial();render();}
  window.Business={stores,cameras,init,openVideo,showOverview,showRecords,showRisks,navigateSection,requestAnalysis,requestRisk,historyAnalysis,summarize,hasUnsaved:()=>Object.values(b?.inspections||{}).some(i=>i.dirty&&i.status==='draft'),resetSession,render};
})();

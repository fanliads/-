(function(){
  'use strict';
  const KEY='zsa-kitchen-workbench-2610-2';
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fresh=()=>({sessionId:'WS-'+Date.now().toString(36).toUpperCase(),title:'新的工作会话',messages:[],context:null,createdAt:new Date().toISOString(),composer:'',layout:35});
  let saved={};try{saved=JSON.parse(localStorage.getItem(KEY))||{}}catch(_){}
  let state=saved.state||fresh(),history=Array.isArray(saved.history)?saved.history:[],timer=null;
  const icon=n=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${({camera:'<rect x="3" y="6" width="13" height="12" rx="2"/><path d="m16 10 5-3v10l-5-3"/>',check:'<path d="m5 12 4 4 10-10"/>',store:'<path d="M4 10v11h16V10M3 10l2-7h14l2 7M3 10h18M9 21v-7h6v7"/>',flag:'<path d="M5 22V3l15 5-15 6"/>',chart:'<path d="M4 20V9m6 11V4m6 16v-7m5 7H2"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v6l4 2"/>',file:'<path d="M14 3H5v18h14V8l-5-5Z"/><path d="M14 3v6h5M8 13h8M8 17h5"/>',spark:'<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z"/>',close:'<path d="m6 6 12 12M18 6 6 18"/>'})[n]||'<circle cx="12" cy="12" r="8"/>'}</svg>`;
  function persist(){
    WB.state.updatedAt=new Date().toISOString();
    try{localStorage.setItem(KEY,JSON.stringify({state:WB.state,history}));return true}catch(_){return false}
  }
  function toast(text){document.querySelector('.wb-toast')?.remove();const t=document.createElement('div');t.className='wb-toast';t.role='status';t.textContent=text;document.body.append(t);setTimeout(()=>t.remove(),4000)}
  function closeModal(){document.getElementById('wb-dialog')?.close()}
  function modal(title,body,onMount){
    let d=document.getElementById('wb-dialog');if(!d){d=document.createElement('dialog');d.id='wb-dialog';d.className='wb-modal';document.body.append(d)}
    if(d.open)d.close();d.innerHTML=`<div class="wb-modal-head"><h2>${esc(title)}</h2><button type="button" class="wb-icon-btn" aria-label="关闭" onclick="WB.closeModal()">×</button></div><div class="wb-modal-body">${body}</div>`;d.showModal();onMount?.(d);return d;
  }
  function addMessage(role,text,card){const m={id:'M-'+Date.now()+'-'+Math.random().toString(36).slice(2,5),role,text,card,time:new Date().toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit',hour12:false})};WB.state.messages.push(m);persist();renderChat();return m}
  function addAI(text){return addMessage('assistant',text)}
  function renderTask(t){const labels={pending:'准备执行',running:'执行中',waiting_user:'等待选择',completed:'已完成',failed:'未完成',cancelled:'已取消'};return `<div class="wb-task-card"><div class="wb-task-top"><strong>定位视频巡检资源</strong><span class="wb-task-state">${labels[t.status]}</span></div><ol><li>已识别巡检意图</li><li class="${['pending','running'].includes(t.status)?'wait':''}">${t.storeName?'已选择 '+esc(t.storeName):'确认目标门店'}</li><li class="${t.status==='completed'?'':'wait'}">${t.cameraName?'已选择 '+esc(t.cameraName):'选择摄像头并打开工作区'}</li></ol><details><summary>执行详情</summary><p>任务 ${esc(t.id)} · ${labels[t.status]}</p><p>${esc(t.detail||'请完成当前资源选择，可继续提问。')}</p></details>${!['cancelled','completed','failed'].includes(t.status)?'<div class="wb-task-actions"><button type="button" onclick="WB.cancelTask()">取消任务</button></div>':''}</div>`}
  function renderCard(card){
    if(!card)return '';
    const t=WB.state.tasks?.find(x=>x.id===card.taskId);if(!t)return '';
    let out=renderTask(t);if(!['waiting_user'].includes(t.status)||t.stage!==card.kind)return out;
    if(card.kind==='stores')out+=`<div class="wb-choice-card"><div class="wb-choice-head">选择巡检门店</div>${Business.stores.map(s=>`<button type="button" class="wb-choice-option" onclick="WB.selectStore('${s.id}','${t.id}')">${icon('store')}<span>${esc(s.name)}<small>${esc(s.region)}</small></span>›</button>`).join('')}</div>`;
    if(card.kind==='cameras'){const cams=t.storeId==='s3'?[]:Business.cameras;out+=`<div class="wb-choice-card"><div class="wb-choice-head">${esc(t.storeName)} · 选择摄像头</div>${cams.length?cams.map(c=>`<button type="button" class="wb-choice-option" onclick="WB.selectCamera('${c.id}','${t.id}')">${icon('camera')}<span>${esc(c.name)}<small>${({online:'在线',offline:'离线',forbidden:'访问受限',error:'连接异常',denied:'访问受限',failed:'连接异常'})[c.status]||esc(c.status)}</small></span>›</button>`).join(''):'<p style="padding:12px">该门店暂无可用摄像头，请重新选择门店。</p>'}<button type="button" class="wb-choice-option" onclick="WB.chooseStoreAgain('${t.id}')">重新选择门店 ›</button></div>`}return out;
  }
  function renderChat(){
    const node=document.getElementById('chat-messages');if(!node)return;
    document.getElementById('session-title').textContent=WB.state.title;
    if(!WB.state.messages.length){node.innerHTML=`<div class="wb-welcome"><h2>今天，从哪项巡检开始？</h2><p>选择门店、查看现场、记录检查结果。<br>我会协助你完成巡检与问题跟进。</p><div class="wb-suggestions"><button type="button" class="wb-suggestion" onclick="WB.quick('巡检指定门店')">${icon('camera')}<span>巡检指定门店</span>↗</button><button type="button" class="wb-suggestion" onclick="WB.quick('查看今日重点风险')">${icon('flag')}<span>查看今日重点风险</span>↗</button><button type="button" class="wb-suggestion" onclick="WB.quick('检查区域巡检执行情况')">${icon('chart')}<span>检查区域巡检执行情况</span>↗</button></div><div class="wb-recent"><p>最近工作</p><button type="button" onclick="Business.showRecords()">${icon('clock')}<span>巡检记录</span>查看记录 ›</button><button type="button" onclick="WB.history()">${icon('file')}<span>历史工作会话</span>查看全部 ›</button></div></div>`}
    else node.innerHTML=WB.state.messages.map(m=>`<article class="wb-message ${m.role==='user'?'user':'assistant'}"><div class="wb-message-label"><strong>${m.role==='user'?'我':'✧ 巡检助手'}</strong><span>${esc(m.time)}</span></div><div class="wb-message-body">${esc(m.text)}</div>${renderCard(m.card)}</article>`).join('');
    node.scrollTop=WB.state.messages.length?node.scrollHeight:0;syncContext();
  }
  function syncContext(){const n=document.getElementById('chat-context');if(!n)return;const c=WB.state.context;n.innerHTML=icon(c?'camera':'store')+`<span>${c?esc(c.storeName+' · '+c.cameraName):'当前范围：华东区域'}</span>`}
  function quick(text){document.getElementById('chat-input').value=text;send()}
  function send(){
    const input=document.getElementById('chat-input'),text=input.value.trim();if(!text)return;input.value='';WB.state.composer='';addMessage('user',text);
    if(WB.state.title==='新的工作会话')WB.state.title=text.slice(0,20);
    if(/分析|识别|五分钟|5分钟/.test(text)){Business.requestAnalysis();return}
    if(/查看.*风险|今日.*风险|重点风险/.test(text)){Business.showOverview();addAI('已打开工作概览，可查看待处理风险及责任门店。选择具体事项后，可进入详情跟进。');return}
    if(/风险|整改/.test(text)){Business.requestRisk();return}
    if(/标准|如何判定|怎么判/.test(text)){addAI('请按当前检查项的判定标准逐项核对：工帽须完整覆盖头发；口罩须遮住口鼻；生熟食材及工具应分开。无法从画面确认的项目请先保留未判定，补充现场证据后再填写。“不适用”仅用于本次无需检查的项目。');return}
    if(/总结|整理|报告|已标记/.test(text)){addAI(Business.summarize());return}
    if(/记录|已保存/.test(text)){Business.showRecords();addAI('已打开巡检记录，可查看检查结果、异常证据与后续处置。');return}
    if(/情况|执行|任务/.test(text)&&!/巡检.*店/.test(text)){Business.showOverview();addAI('已打开工作概览。今日巡检任务与待处理问题可直接在右侧查看，当前巡检内容会保留。');return}
    const active=WB.state.tasks?.find(t=>['running','pending','waiting_user'].includes(t.status));
    if(active){addAI('当前正在定位巡检资源，请先完成上方选择。你可以继续询问检查标准，业务工作区中的检查结果会保留。');return}
    if(/巡检|摄像头|打开|视频|门店|现场/.test(text)){
      const t={id:'AT-'+Date.now().toString(36).toUpperCase(),status:'pending',stage:'stores'};(WB.state.tasks??=[]).push(t);const m=addMessage('assistant','我会先确认门店和摄像头，再为你打开视频巡检工作区。',{kind:'stores',taskId:t.id});
      timer=setTimeout(()=>{t.status='running';renderChat();timer=setTimeout(()=>{t.status='waiting_user';const store=/湖滨|A门店/.test(text)?'s1':/万象/.test(text)?'s2':/滨江/.test(text)?'s3':null;if(store)selectStore(store,t.id);else{persist();renderChat()}},350)},250);
      return m;
    }
    addAI('我可以协助定位门店摄像头、整理人工检查结果和跟进异常。请告诉我门店名称，或选择“巡检指定门店”。');
  }
  function selectStore(id,taskId){const t=WB.state.tasks.find(x=>x.id===taskId);if(!t||t.status!=='waiting_user')return;const s=Business.stores.find(x=>x.id===id);if(!s)return;t.storeId=id;t.storeName=s.name;t.stage='cameras';t.detail='已确认门店，等待选择摄像头。';const m=WB.state.messages.find(x=>x.card?.taskId===taskId);if(m)m.card.kind='cameras';persist();renderChat()}
  function chooseStoreAgain(id){const t=WB.state.tasks.find(x=>x.id===id);if(!t||t.status!=='waiting_user')return;t.stage='stores';const m=WB.state.messages.find(x=>x.card?.taskId===id);if(m)m.card.kind='stores';persist();renderChat()}
  function selectCamera(id,taskId){const t=WB.state.tasks.find(x=>x.id===taskId);if(!t||t.status!=='waiting_user')return;const c=Business.cameras.find(x=>x.id===id);if(!c)return;t.cameraName=c.name;t.status='completed';t.detail='已打开对应业务视图；视频连接状态请在工作区查看。';persist();Business.openVideo(t.storeId,id);addAI(`已定位${t.storeName}的${c.name}。请先核对右侧视频连接状态，再填写人工检查结果。`);if(innerWidth<=800)toggleLayout(true)}
  function cancelTask(){clearTimeout(timer);const t=WB.state.tasks?.find(t=>['running','pending','waiting_user'].includes(t.status));if(!t)return;t.status='cancelled';t.detail='用户已取消资源定位；当前巡检内容保留。';persist();renderChat();addAI('已取消资源定位，当前业务工作区和检查结果已保留。')}
  function toggleLayout(value){const collapsed=typeof value==='boolean'?value:!document.body.classList.contains('wb-collapsed');document.body.classList.toggle('wb-collapsed',collapsed);document.getElementById('layout-toggle').textContent=collapsed?'恢复分屏布局':innerWidth<=800?'查看业务工作区':'最大化工作区'}
  function archiveCurrent(){history=history.filter(x=>x.sessionId!==WB.state.sessionId);history.unshift(JSON.parse(JSON.stringify(WB.state)));history=history.slice(0,15)}
  function reset(){clearTimeout(timer);archiveCurrent();WB.state=fresh();persist();Business.resetSession();document.getElementById('chat-input').value='';renderChat();toggleLayout(false)}
  function newSession(){if(Business.hasUnsaved()){modal('保留当前巡检草稿？','<p>当前巡检尚未提交。切换工作会话后，可从历史会话继续编辑。</p><div class="wb-modal-actions"><button type="button" onclick="WB.closeModal()">继续编辑</button><button type="button" class="primary" id="new-session-confirm">保留并新建</button></div>',d=>d.querySelector('#new-session-confirm').onclick=()=>{if(!persist()){toast('草稿未能保存，请释放浏览器存储空间后重试。');return}closeModal();reset()})}else reset()}
  function showHistory(){modal('历史工作会话',history.length?history.map(h=>`<div class="wb-history-row"><div><strong>${esc(h.title)}</strong><small>${esc(new Date(h.updatedAt||h.createdAt).toLocaleString('zh-CN',{hour12:false}))}</small></div><button type="button" onclick="WB.restoreSession('${h.sessionId}')">继续工作</button></div>`).join(''):'<p class="muted">暂无历史工作会话。新建会话后，当前工作会保留在这里。</p>')}
  function restoreSession(id){const previous=history.find(x=>x.sessionId===id);if(!previous)return;const apply=()=>{archiveCurrent();clearTimeout(timer);WB.state=JSON.parse(JSON.stringify(previous));for(const t of WB.state.tasks||[])if(['pending','running'].includes(t.status)){t.status='failed';t.detail='任务连接已中断，请重新发起。'}persist();closeModal();Business.init();document.getElementById('chat-input').value=WB.state.composer||'';renderChat();setWidth(WB.state.layout||35)};if(Business.hasUnsaved())modal('切换工作会话','<p>当前巡检会保留为草稿，切换后可从历史会话恢复。</p><div class="wb-modal-actions"><button type="button" onclick="WB.closeModal()">继续编辑</button><button type="button" class="primary" id="restore-confirm">保留并切换</button></div>',d=>d.querySelector('#restore-confirm').onclick=()=>{if(!persist()){toast('草稿保存失败，请稍后重试。');return}apply()});else apply()}
  function setWidth(p){p=Math.max(25,Math.min(50,p));document.documentElement.style.setProperty('--wb-chat-width',p+'%');WB.state.layout=p;document.getElementById('split-handle').setAttribute('aria-valuenow',Math.round(p));persist()}
  const WB=window.WB={state,esc,icon,persist,toast,modal,closeModal,addAI,syncContext,quick,send,selectStore,selectCamera,chooseStoreAgain,cancelTask,toggleLayout,newSession,history:showHistory,restoreSession};
  window.PatrolAccess={profile:{org:'华东餐饮集团',name:'林晓'}};
  document.addEventListener('DOMContentLoaded',()=>{
    ProductShell.mount({riskBase:new URL('../../2610_1/F1_巡检智能体接入与业务闭环/Prototypes/',location.href),qualityBase:new URL('../../2610_1/F2_视频质量诊断/Prototypes/',location.href)});
    document.querySelectorAll('.ps-side .active,.ps-side .current').forEach(x=>x.classList.remove('active','current'));
    document.querySelector('.ps-side')?.insertAdjacentHTML('afterbegin',`<a class="ps-menu wb-side-link" href="workbench.html" aria-current="page">${icon('spark')}<span>AI工作台</span></a>`);
    for(const t of WB.state.tasks||[])if(['running','pending'].includes(t.status)){t.status='failed';t.detail='任务连接已中断，请重新发起。'}
    Business.init();document.getElementById('chat-input').value=WB.state.composer||'';renderChat();setWidth(WB.state.layout||35);
    document.getElementById('chat-input').addEventListener('input',e=>{WB.state.composer=e.target.value;persist()});
    document.getElementById('composer').onsubmit=e=>{e.preventDefault();send()};document.getElementById('chat-input').onkeydown=e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();send()}};
    const handle=document.getElementById('split-handle');handle.onpointerdown=e=>{handle.setPointerCapture(e.pointerId);handle.onpointermove=ev=>{const r=document.getElementById('split-layout').getBoundingClientRect();setWidth((ev.clientX-r.left)/r.width*100)};handle.onpointerup=()=>{handle.onpointermove=null}};handle.onkeydown=e=>{if(['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();setWidth((WB.state.layout||35)+(e.key==='ArrowLeft'?-2:2))}};
    window.addEventListener('beforeunload',()=>persist());
  });
})();

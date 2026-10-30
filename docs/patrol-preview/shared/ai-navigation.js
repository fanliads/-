(()=>{'use strict';
const root=new URL('../',document.currentScript.src),u=p=>new URL(p,root).href;
const r='2610_1/F1_巡检智能体接入与业务闭环/Prototypes/',q='2610_1/F2_视频质量诊断/Prototypes/',k='2610_1/F3_知识库管理/Prototypes/',s='2610_1/F4_模型广场/Prototypes/',w='2610_2/Prototypes/workbench.html';
const params=new URLSearchParams(location.search),file=location.pathname.split('/').pop(),isWorkbench=location.pathname.includes('2610_2/');
const initialSection=['records','risks'].includes(params.get('ia'))?params.get('ia'):'workbench';
let businessSection=initialSection,entered=!isWorkbench;
const esc=t=>String(t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function profile(){const p=window.PatrolAccess?.profile;if(p)return p;const id=sessionStorage.getItem('patrol-access-profile')||'manager';return{id,unit:id!=='manager',qualityOrg:id==='canteen'};}
function role(){const raw=localStorage.getItem('zsa-prototype-role')||'admin';try{return JSON.parse(raw)}catch{return raw}}
function current(){
 if(isWorkbench)return businessSection;
 if(location.pathname.includes('F4_'))return ['manage.html','edit.html'].includes(file)?'manage':'square';
 if(location.pathname.includes('F3_'))return file==='search.html'?'search':file==='chat.html'?'chat':file==='detail.html'&&['search','chat'].includes(params.get('from'))?params.get('from'):'files';
 if(file.includes('sop'))return'sop';
 if(file.startsWith('quality-')||params.get('business')==='quality')return file.includes('events')||file==='quality-event.html'?'events':file.includes('labels')?'labels':file.includes('report')?'reports':params.get('business')==='quality'&&!profile().unit?'qtasks':'monitor';
 if(['overview.html','briefing.html'].includes(file))return'overview';
 if(['items.html','item.html'].includes(file))return'items';
 if(profile().unit){if(params.get('view')==='issues')return'issues';if(params.get('view')==='reports'||file==='report.html')return'unitreports';}
 return'tasks';
}
function groups(){const p=profile();if(role()==='sales')return[['模型广场',[['square','能力目录',s+'square.html']]]];
 const quality=[['monitor','视频状态监测',q+'quality-monitor.html'],['events','视频异常记录',q+'quality-events.html'],['labels','视频节点标注',q+'quality-labels.html'],['reports','质量报告',q+'quality-reports.html']];
 if(p.unit)return[['巡检任务',[['tasks','本单位巡检',r+'index.html'],['issues','问题与整改',r+'unit.html?view=issues'],['unitreports','巡检报告',r+'unit.html?view=reports']]],...(p.qualityOrg?[['视频质量',quality]]:[]),['知识库管理',[['sop','适用SOP',r+'sop.html']]]];
 return [
 ['巡检任务',[['overview','管理总览',r+'overview.html'],['tasks','巡检任务配置',r+'index.html'],['items','巡检项管理',r+'items.html']]],
 ['后厨风险',[['workbench','AI工作台',w],['records','后厨巡检记录',w+'?ia=records'],['risks','巡检风险记录',w+'?ia=risks']]],
 ['视频质量',[...quality,['qtasks','视频诊断任务',r+'index.html?business=quality']]],
 ['知识库管理',[['files','文件管理',k+'files.html'],['sop','SOP规范',r+'sop.html'],['search','知识检索',k+'search.html'],['chat','AI问答',k+'chat.html']]],
 ['模型广场',[['square','能力目录',s+'square.html'],...(role()==='admin'?[['manage','展示内容管理',s+'manage.html']]:[])]]
 ];
}
function setText(el,value){if(el&&el.textContent!==value)el.textContent=value;}
function syncContext(){
 const cur=current(),all=groups(),group=all.find(([,links])=>links.some(([id])=>id===cur));if(!group)return;
 const item=group[1].find(([id])=>id===cur),label=item[1],main=document.querySelector('#workspace')||document.querySelector('main#app,main#q-app');if(!main)return;
 const title=main.querySelector('h1');
 const roots={tasks:file==='index.html',qtasks:file==='index.html',monitor:file==='quality-monitor.html',events:file==='quality-events.html',labels:file==='quality-labels.html',reports:file==='quality-reports.html',sop:file==='sop.html'};
 if(isWorkbench)setText(title,label);else if(roots[cur])setText(title,label);
 if(profile().unit&&params.get('business')==='quality'&&file==='index.html')setText(title,'诊断执行记录');
 const titleCopy=title?.cloneNode(true);titleCopy?.querySelectorAll('.rf-sparkle,[aria-hidden="true"]').forEach(n=>n.remove());
 const heading=titleCopy?.textContent.trim()||label;
 const parts=['后厨管理','AI智能',group[0]];
 // Root pages end at the menu label. Details stay within their owning menu.
 if(parts.at(-1)!==label)parts.push(label);
 if(!isWorkbench&&file!=='square.html'&&!parts.includes(heading))parts.push(heading);
 setText(main.querySelector('.crumb,.q-crumb,.wb-breadcrumb'),parts.join('　/　'));
 const docTitle=heading+' · 众食安';if(document.title!==docTitle)document.title=docTitle;
 document.querySelectorAll('.ai-unified-side a[data-ai-page]').forEach(a=>{const active=a.dataset.aiPage===cur;a.classList.toggle('active',active);if(active){a.setAttribute('aria-current','page');a.closest('details')?.setAttribute('open','');}else a.removeAttribute('aria-current');});
}
function apply(){
 const side=document.querySelector('aside.ps-side,aside.product-side,aside.rf-side');if(!side)return;
 if(!side.dataset.aiUnified){
  side.dataset.aiUnified='true';side.classList.add('ai-unified-side');side.setAttribute('aria-label','AI智能业务导航');
  const cur=current();side.innerHTML='<div class="ai-nav-title">AI智能</div>'+groups().map(([name,links])=>`<details open><summary>${esc(name)}<span>⌄</span></summary>${links.map(([id,title,path])=>`<a class="ai-nav-link ${id===cur?'active':''}" data-ai-page="${id}" ${id===cur?'aria-current="page"':''} href="${esc(u(path))}">${esc(title)}</a>`).join('')}</details>`).join('');
 }
 document.querySelectorAll('.ps-subnav button.active,.product-subnav .current').forEach(el=>{const walk=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);let n;while(n=walk.nextNode())if(n.textContent.trim()==='阳光厨房')n.textContent=n.textContent.replace('阳光厨房','AI智能');});
 syncContext();
}
const sheet=document.createElement('link');sheet.rel='stylesheet';sheet.href=u('shared/ai-navigation.css');document.head.append(sheet);
let queued=false;new MutationObserver(()=>{if(!queued){queued=true;queueMicrotask(()=>{queued=false;apply();});}}).observe(document.body,{childList:true,subtree:true});
// Legacy category links still filter the file library, without adding another menu level.
if(params.get('iaType')&&window.KF){const type=({visual:'视觉样例',legal:'法律法规'})[params.get('iaType')];if(type)window.KF.type(type);}
// Earlier links that only renamed the task list now resolve to its single canonical entry.
if(location.pathname.includes('F1_')&&file==='index.html'&&['execution','kitchen'].includes(params.get('ia'))){const url=new URL(location.href);url.searchParams.delete('ia');history.replaceState(null,'',url);}
function openSection(section,mode='push'){
 if(!window.Business?.navigateSection)return;
 businessSection=section;
 const url=new URL(location.href);if(section==='workbench')url.searchParams.delete('ia');else url.searchParams.set('ia',section);
 if(url.href!==location.href)history[mode==='replace'?'replaceState':'pushState'](null,'',url);
 Business.navigateSection(section);apply();
}
window.addEventListener('ai-business-view',e=>{
 if(!entered)return;
 const type=e.detail?.type;businessSection=['records','record'].includes(type)?'records':['risks','risk'].includes(type)?'risks':'workbench';
 const url=new URL(location.href);if(businessSection==='workbench')url.searchParams.delete('ia');else url.searchParams.set('ia',businessSection);
 if(url.href!==location.href)history.pushState(null,'',url);apply();
});
window.addEventListener('popstate',()=>{if(isWorkbench)openSection(new URLSearchParams(location.search).get('ia')||'workbench','replace');});
document.addEventListener('click',e=>{
 const a=e.target.closest('.ai-unified-side a');if(!a)return;
 if(isWorkbench&&['workbench','records','risks'].includes(a.dataset.aiPage)&&!e.ctrlKey&&!e.metaKey&&!e.shiftKey&&!e.altKey&&e.button===0){e.preventDefault();openSection(a.dataset.aiPage);return;}
 if(window.Business?.hasUnsaved()){if(!confirm('当前巡检有未保存输入，确认保留草稿并离开？')){e.preventDefault();return;}if(window.WB?.persist?.()===false)e.preventDefault();}
});
function enter(){entered=true;if(isWorkbench)openSection(initialSection,'replace');apply();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',enter,{once:true});else enter();
})();

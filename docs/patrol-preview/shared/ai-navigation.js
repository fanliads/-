(()=>{'use strict';
const root=new URL('../',document.currentScript.src),u=(p)=>new URL(p,root).href;
const r='2610_1/F1_巡检智能体接入与业务闭环/Prototypes/',q='2610_1/F2_视频质量诊断/Prototypes/',k='2610_1/F3_知识库管理/Prototypes/',s='2610_1/F4_模型广场/Prototypes/',w='2610_2/Prototypes/workbench.html';
const params=new URLSearchParams(location.search),route=params.get('ia');
const esc=t=>String(t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function current(){const p=location.pathname;if(p.includes('2610_2/'))return route==='records'?'records':route==='risks'?'risks':'workbench';if(p.includes('F4_'))return'square';if(p.includes('F3_'))return p.endsWith('search.html')?'search':p.endsWith('chat.html')?'chat':params.get('iaType')||'files';if(p.includes('sop'))return'sop';if(p.includes('quality')||params.get('business')==='quality')return p.includes('events')||p.includes('event.html')?'events':p.includes('labels')?'labels':p.includes('report')?'reports':'monitor';return route||'tasks'}
function apply(){const old=document.querySelector('aside.ps-side,aside.product-side,aside.rf-side');if(!old||old.dataset.aiUnified)return;const profile=window.PatrolAccess?.profile,unit=!!profile?.unit;let role;try{role=JSON.parse(localStorage.getItem('zsa-prototype-role')||'"admin"')}catch{role=localStorage.getItem('zsa-prototype-role')||'admin'}const sales=role==='sales',cur=current();
const groups=sales?[]:unit?[
['巡检任务',[['tasks','本单位巡检',r+'index.html'],['issues','问题与整改',r+'unit.html?view=issues'],['unitreports','巡检报告',r+'unit.html?view=reports']]],
...(profile.qualityOrg?[['视频质量',[['monitor','视频状态监测',q+'quality-monitor.html'],['events','视频异常记录',q+'quality-events.html'],['labels','视频节点标注',q+'quality-labels.html'],['reports','质量报告',q+'quality-reports.html']]]]:[]),['知识库管理',[['sop','适用SOP',r+'sop.html']]]
]:[
['巡检任务',[['tasks','巡检任务配置',r+'index.html'],['execution','任务执行情况',r+'index.html?ia=execution'],['records','巡检记录明细',w+'?ia=records']]],
['后厨风险',[['workbench','AI工作台',w],['kitchen','后厨巡检记录',r+'index.html?ia=kitchen'],['risks','巡检风险记录',w+'?ia=risks']]],
['视频质量',[['monitor','视频状态监测',q+'quality-monitor.html'],['events','视频异常记录',q+'quality-events.html'],['labels','视频节点标注',q+'quality-labels.html'],['reports','质量报告',q+'quality-reports.html']]],
['知识库管理',[['visual','视觉样例',k+'files.html?iaType=visual'],['legal','法律法规',k+'files.html?iaType=legal'],['sop','SOP规范',r+'sop.html'],['files','文件管理',k+'files.html'],['search','知识检索',k+'search.html'],['chat','AI问答',k+'chat.html']]]];
old.dataset.aiUnified='true';old.classList.add('ai-unified-side');old.setAttribute('aria-label','AI智能业务导航');old.innerHTML='<div class="ai-nav-title">AI智能</div>'+groups.map(([name,links])=>`<details open><summary>${esc(name)}<span>⌄</span></summary>${links.map(([id,name,path])=>`<a class="ai-nav-link ${id===cur?'active':''}" ${id===cur?'aria-current="page"':''} href="${esc(u(path))}">${esc(name)}</a>`).join('')}</details>`).join('')+(!unit?`<a class="ai-nav-single ${cur==='square'?'active':''}" href="${u(s+'square.html')}">模型广场</a>`:'');
document.querySelectorAll('.ps-subnav button.active,.product-subnav .current').forEach(el=>{const walk=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);let n;while(n=walk.nextNode())if(n.textContent.trim()==='阳光厨房')n.textContent=n.textContent.replace('阳光厨房','AI智能')});
const path=document.querySelector('.crumb,.q-crumb,.wb-breadcrumb');if(path){for(const n of path.childNodes)if(n.nodeType===3)n.textContent=n.textContent.replace(/阳光厨房/g,'AI智能').replace(/AI抓拍/g,'巡检任务');}
}
const sheet=document.createElement('link');sheet.rel='stylesheet';sheet.href=u('shared/ai-navigation.css');document.head.append(sheet);
let queued=false;new MutationObserver(()=>{if(!queued){queued=true;queueMicrotask(()=>{queued=false;apply()})}}).observe(document.body,{childList:true,subtree:true});apply();
if(params.get('iaType')&&window.KF){const type=({visual:'视觉样例',legal:'法律法规'})[params.get('iaType')];if(type)window.KF.type(type)}
function enter(){if(location.pathname.includes('2610_2/')&&window.Business){if(route==='records')Business.showRecords();if(route==='risks')Business.showRisks()}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',enter,{once:true});else enter();
document.addEventListener('click',e=>{const a=e.target.closest('.ai-unified-side a');if(a&&window.Business?.hasUnsaved()){if(!confirm('当前巡检有未保存输入，确认保留草稿并离开？')){e.preventDefault();return}if(window.WB?.persist?.()===false)e.preventDefault();}});
if(location.pathname.endsWith('/index.html')&&location.pathname.includes('F1_')&&['execution','kitchen'].includes(route)){const title=document.querySelector('.heading h1');if(title)title.textContent=route==='execution'?'任务执行情况':'后厨巡检记录';const sub=document.querySelector('.heading .sub');if(sub)sub.textContent=route==='execution'?'选择任务，查看实际执行轮次、覆盖、进度及用量。':'按来源任务查阅后厨检查结果、证据和核实记录。'}
})();

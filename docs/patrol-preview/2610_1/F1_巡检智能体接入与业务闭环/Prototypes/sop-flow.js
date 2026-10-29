const flowSop = {
  id:'DEMO-SOP-003', name:'后厨口罩佩戴与整改作业规范', active:true, draft:null,
  versions:[{id:'DEMO-SOP-003-V1',label:'V1.0',name:'后厨口罩佩戴与整改作业规范',scope:'示例组织A / 食品操作岗位',description:'用于食品操作岗位的口罩佩戴检查及异常整改。',publishedAt:'2026/10/22 09:00',clauses:[{
    id:'C-004',code:'3.1',title:'口罩佩戴及整改要求',text:'食品操作期间口罩应规范覆盖口鼻。仅在岗位适用且面部清晰可辨时判断；遮挡或画面不清时记录无法判断。',
    remedy:'现场纠正佩戴方式；更换污损或不适用的口罩；负责人核对操作人员是否理解佩戴要求。',
    acceptance:'核实该岗位适用要求，取得面部清晰可辨的复检证据，确认口罩覆盖口鼻。整改是否办结仍由预警复核流程确认。'
  }]}]
};
initialSops.push(flowSop);
const flowVersion=flowSop.versions[0],flowClause=flowVersion.clauses[0];
const flowRef={sopId:flowSop.id,sopName:flowSop.name,versionId:flowVersion.id,version:flowVersion.label,clauseId:flowClause.id,clauseCode:flowClause.code,title:flowClause.title,text:flowClause.text,remedy:flowClause.remedy,acceptance:flowClause.acceptance};
const flowBasis=[{name:'口罩佩戴（企业规范）',version:'V1.0',desc:flowClause.text,sopRefs:[flowRef]}];
const flowResults=[
 {store:'示例门店A',item:flowBasis[0].name,machine:'异常',human:'确认问题',reason:'岗位适用且面部清晰，口罩未覆盖口鼻。',issue:'DEMO-ISSUE-SOP-001',basis:flowBasis},
 {store:'示例门店B',item:flowBasis[0].name,machine:'正常',human:'未核实',basis:flowBasis},
 {store:'示例门店C',item:flowBasis[0].name,machine:'无法判断',human:'未核实',reason:'面部被遮挡，需补充有效证据。',basis:flowBasis}
];
const flowUnits=['A','B','C'].map(s=>[s,flowBasis[0].name,'已形成结果','']);
function flowReport(){return {id:'DEMO-REPORT-SOP-001',taskId:'DEMO-TASK-SOP-001',taskName:'人员卫生规范巡检',schedule:'单次 · 立即执行',status:'已生成',time:'2026/10/26 10:35',cutoff:'2026/10/26 10:30',token:'6,200',tokenState:'已完成',sourceTime:'10:25',basis:clone(flowBasis),executionUnits:clone(flowUnits),results:clone(flowResults),warnings:{'DEMO-ISSUE-SOP-001':'待处置'}}}
function seedSopFlow(){
 if(!sops.some(x=>x.id===flowSop.id))sops.push(clone(flowSop));
 if(!items.some(x=>x.id==='DEMO-ITEM-SOP-001'))items.push({id:'DEMO-ITEM-SOP-001',agentBinding:AgentCatalog.binding('CLUE-MASK'),name:flowBasis[0].name,desc:flowClause.text,source:'企业规范关联',version:'V1.0',enabled:true,ready:true,sopRefs:[clone(flowRef)]});
 if(!tasks.some(x=>x.id==='DEMO-TASK-SOP-001'))tasks.push({id:'DEMO-TASK-SOP-001',name:'人员卫生规范巡检',status:'执行结束',objects:3,count:1,schedule:'单次 · 立即执行',pending:1,issues:1,basis:clone(flowBasis),executionUnits:clone(flowUnits),resultStorageKey:'patrol-results-sop',reportStorageKey:'patrol-reports-sop',tokenStorageKey:'patrol-token-sop'});
 if(!warnings['DEMO-ISSUE-SOP-001'])warnings['DEMO-ISSUE-SOP-001']='待处置';
}
function taskBasis(t=current){
 if(Array.isArray(t?.basis))return t.basis;
 if(t?.id==='DEMO-TASK-001'||t?.id==='DEMO-TASK-002')return [
  {name:'工帽佩戴',version:'V1.2',desc:'检查可辨识人员的工帽佩戴情况；遮挡或画面不清时无法判断。',sopRefs:[]},
  {name:'口罩佩戴',version:'V1.1',desc:'检查口罩是否规范覆盖口鼻；仅对可辨识人员作出判断。',sopRefs:[]},
  {name:'垃圾桶管理',version:'V1.0',desc:'检查垃圾桶是否加盖、周边是否存在明显散落垃圾。',sopRefs:[]}
 ];
 return [];
}
function reportBasis(r){return Array.isArray(r?.basis)?r.basis:null}
function resultBasis(x,basis=taskBasis()){return Array.isArray(x?.basis)?x.basis:(basis||[]).filter(b=>b.name===x.item)}
function sopVersionUrl(r){const u=new URL('sop-detail.html',location.href);Object.entries({id:r.sopId,version:r.versionId,clause:r.clauseId,back:location.href}).forEach(([k,v])=>u.searchParams.set(k,v));return u.href}
function basisBlocks(basis,options={}){
 if(basis===null)return '<p class="sub">此历史记录未保存完整规范依据，无法从当前配置还原。</p>';
 if(!basis?.length)return '<p class="sub">依据尚未同步，暂不可核对。</p>';
 return basis.map(b=>`<div class="basis-block"><div class="row between"><strong>${esc(b.name)} <span class="sub">${esc(b.version)}</span></strong>${b.sopRefs?.length?tag('规范依据','gray'):tag('巡检项判定说明','gray')}</div>${options.compact||(b.sopRefs||[]).some(r=>r.text===b.desc)?'':`<p>${esc(b.desc||'判定说明未记录')}</p>`}${(b.sopRefs||[]).map(r=>`<div class="basis-clause"><div class="row between"><strong>${esc(r.sopName)} ${esc(r.version)} · ${esc(r.clauseCode)} ${esc(r.title)}</strong>${options.links===false?'':`<a href="${esc(sopVersionUrl(r))}">查看引用版本 →</a>`}</div>${options.compact?'':`<p>${esc(r.text)}</p>`}${options.guidance?`<dl class="basis-guidance"><dt>整改要求</dt><dd>${esc(r.remedy||'本条款未配置整改要求，请按预警办理要求核对。')}</dd><dt>复检验收</dt><dd>${esc(r.acceptance||'本条款未配置验收要求，请按有效规范与预警复核要求核对。')}</dd></dl>`:''}</div>`).join('')}${!window.PatrolAccess?.isUnit()?`<details class="capability-snapshot"><summary>${b.agentBinding?'执行线索：'+esc(b.agentBinding.clueName+' / '+b.agentBinding.clueVersion):'执行线索映射：历史记录未保存'}</summary>${ClueMapping.markup(b.agentBinding)}</details>`:''}${!b.sopRefs?.length?'<p class="sub">未关联企业SOP，按本次保存的巡检项判定说明核实。</p>':''}</div>`).join('');
}
function showResultBasis(i){let x=results[i];drawer(`<h2>判定依据与处理要求</h2><p>${esc(x.store)} / ${esc(x.item)}</p>${basisBlocks(resultBasis(x),{guidance:true})}${notice('依据取自本次执行快照。人工核实结合实际证据；处置状态与规范版本分别记录。')}`)}
function allRiskReports(){return [...read('patrol-reports',initialReportRecords),...read('patrol-reports-cycle',[]),...read('patrol-reports-sop',[flowReport()]),...reports].filter((r,i,a)=>a.findIndex(x=>x.id===r.id)===i)}
function selectedRiskReport(){return params.has('report')?allRiskReports().find(x=>x.id===params.get('report')):reports.find(x=>x.status==='已生成')}
function resultsForTask(t){if(t.id===current.id&&page==='task')return results;if(t.resultStorageKey)return read(t.resultStorageKey,clone(flowResults));if(t.id==='DEMO-TASK-001')return read('patrol-results',initialResults);if(t.id==='DEMO-TASK-002')return read('patrol-results-cycle',initialResults.map((x,i)=>({...x,human:i===1||i===2?'未核实':x.human})));return []}
function sopUsageRows(doc,v){
 const usesVersion=b=>(b||[]).flatMap(x=>x.sopRefs||[]).filter(r=>r.sopId===doc.id&&r.versionId===v.id);
 const rows=[];
 for(const t of tasks){let refs=usesVersion(taskBasis(t));if(!refs.length)continue;
  rows.push(tr(['巡检任务',esc(t.name)+'<br><small>'+esc(t.id)+'</small>',refs.map(r=>esc(r.version+' / '+r.clauseCode)).join('、'),tag(t.status),`<a href="${taskLink(t)}">查看任务依据</a>`]));
  const seen=new Set();for(const x of resultsForTask(t)){if(!x.issue||seen.has(x.issue)||!usesVersion(resultBasis(x,taskBasis(t))).length)continue;seen.add(x.issue);rows.push(tr(['业务问题',esc(x.issue)+'<br><small>'+esc(x.store)+'</small>',refs.map(r=>esc(r.version+' / '+r.clauseCode)).join('、'),tag(warnings[x.issue]||'未关联预警'),`<a href="${taskLink(t,'review')}">查看问题与处置</a>`]))}
 }
 for(const r of allRiskReports()){let refs=usesVersion(reportBasis(r));if(refs.length)rows.push(tr(['固定报告',esc(r.taskName||r.id)+'<br><small>'+esc(r.id)+'</small>',refs.map(x=>esc(x.version+' / '+x.clauseCode)).join('、'),tag(r.status),`<a href="report.html?report=${encodeURIComponent(r.id)}">查看报告快照</a>`]))}
 return rows;
}
function warningBasis(id){const context=read('patrol-warning-basis',{})[id];if(context)return context;for(const t of tasks){const x=resultsForTask(t).find(r=>r.issue===id);if(x)return {taskId:t.id,basis:clone(resultBasis(x,taskBasis(t)))};}return {taskId:current.id,basis:[]}}

function sopRefLinks(refs){return refs?.length?refs.map(r=>`<a class="reference-link" href="${esc(sopVersionUrl(r))}">${esc(refLabel(r))} →</a>`).join(''):'未关联企业SOP，使用巡检项判定说明'}

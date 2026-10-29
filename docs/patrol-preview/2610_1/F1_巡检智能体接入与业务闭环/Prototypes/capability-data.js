(function(){
 const key='patrol-capability-source',clone=x=>JSON.parse(JSON.stringify(x));
 const agents=[{id:'AG-KITCHEN',name:'后厨风险巡检智能体',workflowId:'WF-PERSON',workflow:'人员卫生巡检',structureVersion:'S1.3'},{id:'AG-ENV',name:'后厨环境巡检智能体',workflowId:'WF-ENV',workflow:'环境设施巡检',structureVersion:'S1.1'}];
 const records=[
  {clueId:'CLUE-HAT',clue:'工帽佩戴检查',agentId:'AG-KITCHEN',nodeId:'NODE-HAT',version:'C1.2',snapshotId:'TS-HAT-1028',scope:['STORE-A','STORE-B','STORE-C'],input:'后厨可辨识人员画面',output:'合规 / 异常线索 / 无法判断',contract:'PATROL-TRISTATE-1',boundary:'头部不可辨识时返回无法判断；不从遮挡推定未佩戴。'},
  {clueId:'CLUE-MASK',clue:'口罩佩戴检查',agentId:'AG-KITCHEN',nodeId:'NODE-MASK',version:'C1.1',snapshotId:'TS-MASK-1028',scope:['STORE-A','STORE-B','STORE-C'],input:'食品操作岗位的可辨识面部画面',output:'合规 / 异常线索 / 无法判断',contract:'PATROL-TRISTATE-1',boundary:'仅对适用岗位及清晰可辨的面部判断；遮挡或低清时无法判断。'},
  {clueId:'CLUE-BIN',clue:'垃圾桶状态检查',agentId:'AG-ENV',nodeId:'NODE-BIN',version:'C1.0',snapshotId:'TS-BIN-1028',scope:['STORE-A','STORE-B','STORE-C'],input:'可观察垃圾桶及周边的点位画面',output:'合规 / 异常线索 / 无法判断',contract:'PATROL-TRISTATE-1',boundary:'投放垃圾过程按适用条件处理；点位离线或目标不可见时不判正常。'},
  {clueId:'CLUE-DISINFECT',clue:'消毒记录核对',agentId:'AG-ENV',nodeId:'NODE-DISINFECT',version:'C0.3',snapshotId:'TS-DISINFECT-1028',scope:['STORE-A'],input:'消毒记录单',output:'文字摘录',contract:'TEXT-1',boundary:'当前输出为文字，尚未提供可核对的巡检结论。'}
 ];
 function source(){try{return JSON.parse(localStorage.getItem(key))||{state:'ok',revision:'CAT-20261028-01'}}catch{return {state:'error',revision:''}}}
 function rows(){const state=source().state;return records.map(x=>{const a=agents.find(a=>a.id===x.agentId),r={...clone(x),agentName:a.name,workflowId:a.workflowId,workflowName:a.workflow,structureVersion:a.structureVersion,tenantId:'TENANT-RISK',effective:true,authorized:true,callable:true,currentVersion:x.version,checkedAt:'2026/10/28 10:00'};
  if(state==='newer'&&x.clueId==='CLUE-MASK'){r.currentVersion='C1.2';r.previousVersion=x.version;r.previousSnapshotId=x.snapshotId;r.version='C1.2';r.snapshotId='TS-MASK-1028-02';}
  if(state==='revoked'&&x.clueId==='CLUE-MASK')r.authorized=false;
  if(state==='retired'&&x.clueId==='CLUE-MASK')r.callable=false;
  if(state==='pending'&&x.clueId==='CLUE-MASK')r.effective=false;
  return r;
 })}
 function binding(clueId){const r=records.find(r=>r.clueId===clueId),a=r&&agents.find(a=>a.id===r.agentId);return r?{tenantId:'TENANT-RISK',agentId:a.id,agentName:a.name,workflowId:a.workflowId,workflowName:a.workflow,structureVersion:a.structureVersion,nodeId:r.nodeId,clueId:r.clueId,clueName:r.clue,clueVersion:r.version,tenantSnapshotId:r.snapshotId,outputContract:r.contract,input:r.input,output:r.output,boundary:r.boundary,scope:r.scope.slice(),checkedAt:'2026/10/28 10:00'}:null}
 function fromRow(r){return {tenantId:r.tenantId,agentId:r.agentId,agentName:r.agentName,workflowId:r.workflowId,workflowName:r.workflowName,structureVersion:r.structureVersion,nodeId:r.nodeId,clueId:r.clueId,clueName:r.clue,clueVersion:r.version,tenantSnapshotId:r.snapshotId,outputContract:r.contract,input:r.input,output:r.output,boundary:r.boundary,scope:r.scope.slice(),checkedAt:r.checkedAt}}
 function status(b,objects=[]){
  if(!b)return {ok:false,label:'未映射线索'};
  if(source().state==='error')return {ok:false,label:'映射待核验',reason:'暂时无法查询智能体目录，请重试核验。'};
  const r=rows().find(r=>r.agentId===b.agentId&&r.workflowId===b.workflowId&&r.nodeId===b.nodeId&&r.clueId===b.clueId&&r.tenantId===b.tenantId);
  if(!r)return {ok:false,label:'入口不可用',reason:'智能体或线索入口已不在当前可用目录。'};
  if(!r.authorized)return {ok:false,label:'授权已失效',reason:'当前租户已无此执行入口授权。'};
  if(!r.callable)return {ok:false,label:'线索不可调用',reason:'引用的执行入口已停止提供服务。'};
  if(!r.effective)return {ok:false,label:'配置未生效',reason:'租户配置尚未确认生效。'};
  if(r.contract!=='PATROL-TRISTATE-1'||b.outputContract!==r.contract)return {ok:false,label:'输出未匹配',reason:'线索输出尚未映射为巡检结论。'};
  if(b.structureVersion!==r.structureVersion)return {ok:false,label:'编排版本未匹配',reason:'固定引用的编排结构版本尚未确认可用。'};
  if(b.tenantSnapshotId!==r.snapshotId&&b.tenantSnapshotId!==r.previousSnapshotId)return {ok:false,label:'生效快照未匹配',reason:'引用的租户生效快照无法核对。'};
  if((b.clueVersion===r.version&&b.tenantSnapshotId!==r.snapshotId)||(b.clueVersion===r.previousVersion&&b.tenantSnapshotId!==r.previousSnapshotId))return {ok:false,label:'版本与快照不一致',reason:'线索版本与租户生效快照须对应同一配置。'};
  if(b.clueVersion!==r.version&&b.clueVersion!==r.previousVersion)return {ok:false,label:'版本不可用',reason:'固定引用版本已不在可调用范围。'};
  if(objects.some(id=>!r.scope.includes(id)))return {ok:false,label:'组织范围不匹配',reason:'存在未获此能力授权的执行单位。'};
  return {ok:true,label:b.clueVersion!==r.version?'有新版本待核对':'可执行',newer:b.clueVersion!==r.version};
 }
 window.AgentCatalog={key,agents,rows,binding,fromRow,status,source,async fetch(){if(source().state==='error')throw new Error('暂时无法取得智能体线索目录，请稍后重试。');return {revision:source().revision,rows:rows(),checkedAt:'2026/10/28 10:00'}}};
})();

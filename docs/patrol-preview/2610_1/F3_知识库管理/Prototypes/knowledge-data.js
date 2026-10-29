(function(){
'use strict';
const key='zsa-kb-v1-data',clone=x=>JSON.parse(JSON.stringify(x));
const clauses=(id,items)=>items.map((x,i)=>({id:id+'-C'+(i+1),title:x[0],text:x[1]}));
function record(id,name,type,category,content,extra={}){return {id,name,type,category,space:'示例组织A',scope:'示例组织A / 授权门店',version:'V1.0',status:'正式',ai:'可用',updated:'2026/10/28 10:30',content,source:'企业内部培训资料',clauses:[],versions:[],logs:[{time:'2026/10/27 15:30',action:'复核通过',user:'陈审核',note:'来源及适用范围已核对'},{time:'2026/10/27 15:32',action:'AI处理完成',user:'知识服务',note:'V1.0 已激活'}],...extra}}
const seed=[
record('KB-001','口罩佩戴视觉参考','视觉样例','人员卫生','食品操作期间口罩应规范覆盖口鼻；只有在岗位适用且面部清晰可辨时才进行判断。面部遮挡、侧身或画面不清时，应记录无法判断并补充有效证据。',{judgement:'边界参考',image:true,clauses:clauses('KB-001',[['检查条件','确认食品操作岗位、面部清晰可见，口罩应覆盖口鼻。'],['边界情形','口罩被遮挡或图像模糊时不能直接判定违规，应人工补充证据。']]),draft:{version:'V2.0',status:'待复核',ai:'未处理',name:'口罩佩戴视觉参考',content:'补充侧面遮挡、面部不可辨识时的无法判断边界。',source:'企业内部培训资料',scope:'示例组织A / 授权门店',submitted:'2026/10/28 09:40',submitter:'李维护',updated:'2026/10/28 09:40'}}),
record('KB-002','人员卫生操作培训资料','业务资料','人员卫生','进入食品操作区前，按岗位要求整理工帽、工作服和口罩。负责人应核对当日岗位适用要求。画面不清或遮挡时保留无法判断记录，不能将缺少证据视为合规。',{clauses:clauses('KB-002',[['进入操作区前','按岗位要求检查工帽、工作服和口罩，口罩应覆盖口鼻。'],['人工核实','结合岗位适用要求和清晰证据确认问题；证据不足应补拍后复核。'],['整改记录','纠正佩戴方式并记录责任人、整改时间和复检结果。']])}),
record('KB-003','食品安全法规学习资料汇编','业务资料','综合管理','本资料为企业培训用学习提纲。涉及法规原文、具体条款和适用日期时，应查阅有权机关公开发布的正式文件，不以培训提纲代替法律依据。',{source:'企业内部培训汇编',clauses:clauses('KB-003',[['资料使用说明','培训提纲不替代正式法规；引用时核对原文来源、版本与适用范围。']])}),
record('KB-004','收货验收参考','业务资料','验收管理','收货时记录供货单位、品名、批次及验收结果。对需温控的原料核对配送条件和到货状态；异常情况按企业验收流程处置。',{clauses:clauses('KB-004',[['验收记录','记录供货单位、品名、批次和现场验收结果。']]),draft:{version:'V2.0',status:'已通过',ai:'处理失败',name:'收货验收参考',content:'补充配送温控记录及异常拒收记录要求。',source:'企业内部验收流程',scope:'示例组织A / 授权门店',updated:'2026/10/28 10:10',failure:'附件内容处理失败，请核对文件后重试。'}}),
record('KB-005','冷链异常记录填写指南','业务资料','仓储管理','异常记录应包含发现时间、设备、温度记录和处置过程。',{version:'—',status:'草稿',ai:'未处理',updated:'2026/10/28 09:00',logs:[],draft:{version:'V1.0',status:'草稿',ai:'未处理',name:'冷链异常记录填写指南',content:'异常记录应包含发现时间、设备、温度记录和处置过程。',source:'企业内部仓储记录',scope:'示例组织A / 授权门店',updated:'2026/10/28 09:00'}}),
record('KB-006','视频画面质量排查指南','业务资料','视频运维','画面模糊时先核对镜头污染、焦距和码流；画面遮挡时检查镜头前物品；设备离线时联系现场负责人检查供电与网络。没有新的有效观察不能认定恢复。',{clauses:clauses('KB-006',[['模糊画面','检查镜头污染、焦距和码流，取得清晰新画面后再核对。'],['设备离线','检查供电、网络和设备在线状态；无新观察不能认定恢复。']])}),
record('KB-007','餐具清洗区域巡查要点','业务资料','洗消管理','核对清洗、消毒和保洁区域使用情况。无法从画面确认消毒时长或温度时，应补充设备记录。'),
record('KB-008','后厨环境整洁参考','视觉样例','环境卫生','垃圾桶按岗位内部要求加盖，周边保持整洁。画面只用于辅助核对，不能代替现场温度或设备性能检测。',{image:true,judgement:'合规'}),
record('KB-009','备餐交接记录说明','业务资料','备餐管理','交接时核对餐食名称、交接时间和负责人，发现异常按现场流程记录并跟进。',{status:'已停用',ai:'已停用',updated:'2026/10/25 17:00'})
];
function read(k,d){try{return JSON.parse(localStorage.getItem(k))??clone(d)}catch{return clone(d)}}
function profile(){const p=read('zsa-kb-v1-profile',{role:'admin'});let role=localStorage.getItem('zsa-prototype-role')||p.role||'admin';try{const parsed=JSON.parse(role);if(typeof parsed==='string')role=parsed}catch{};return {role,name:role==='admin'?'知识管理员':role==='reviewer'?'知识复核员':'知识使用者',maintain:role==='admin',review:role==='admin'||role==='reviewer',space:'示例组织A'}}
function own(){
 const arr=read(key,seed);let changed=false;
 for(const d of arr){const v=d.draft;if(!v||v.ai!=='处理中')continue;
 if(!v.processingDue){v.processingDue=Date.now()+1400;changed=true;continue}
 if(v.processingDue>Date.now())continue;
 const old=clone(d);delete old.versions;delete old.draft;delete old.logs;
 d.versions=d.versions||[];if(d.version!=='—'&&!d.versions.some(x=>x.version===d.version))d.versions.push(old);
 const revision=d.revision||0;Object.assign(d,clone(v),{id:d.id,version:v.version,status:'正式',ai:'可用',updated:new Intl.DateTimeFormat('zh-CN',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date()),revision:revision+1});
 delete d.processingDue;d.draft=null;d.logs=d.logs||[];d.logs.push({time:d.updated,action:'AI处理完成并激活',user:'知识服务',note:d.version+' 已激活；旧版引用保留。'});changed=true;
 }
 if(changed)localStorage.setItem(key,JSON.stringify(arr));return arr
}
function sopRecords(){let src=read('patrol-sops',typeof initialSops!=='undefined'?initialSops:[]);return src.filter(x=>x.versions?.length).map(d=>{let v=d.versions.at(-1);return {id:d.id,name:d.name,type:'SOP规范',category:'人员卫生',space:'示例组织A',scope:v.scope,version:v.label,sopVersionId:v.id,status:d.active?'正式':'已停用',ai:d.active?'待接入':'已停用',updated:v.publishedAt,content:'',source:'SOP规范库',clauses:[],versions:d.versions.map(v=>({version:v.label,sopVersionId:v.id,name:v.name,scope:v.scope,content:'',status:'正式',ai:'待接入',updated:v.publishedAt})),draft:d.draft?{version:d.draft.label,status:'草稿',ai:'未处理'}:null,sop:true}})}
function all(){return [...own(),...sopRecords()].filter(x=>!(read('zsa-kb-v1-scenario','normal')==='restricted'&&x.id==='KB-001'))}
function get(id,version){if(read('zsa-kb-v1-scenario','normal')==='restricted'&&id==='KB-001')return null;let d=all().find(x=>x.id===id);if(!d)return null;if(!version||version===d.version)return clone(d);const v=d.versions?.find(v=>v.version===version);if(v)return {...clone(d),...clone(v),historical:true,draft:null};if(profile().maintain&&d.draft?.version===version)return {...clone(d),...clone(d.draft),working:true};return null}
function save(arr){localStorage.setItem(key,JSON.stringify(arr.filter(x=>!x.sop)))}
function update(id,fn){let arr=own(),d=arr.find(x=>x.id===id);if(!d)return null;fn(d);d.revision=(d.revision||0)+1;save(arr);return d}
function eligible(){return all().filter(x=>x.status==='正式'&&x.ai==='可用')}
window.KB={all,get,save,update,eligible,profile,own,read,seed:()=>clone(seed),detailURL:(d)=>'detail.html?id='+encodeURIComponent(d.id)+'&version='+encodeURIComponent(d.version),chatURL:(d)=>'chat.html?file='+encodeURIComponent(d.id)+'&version='+encodeURIComponent(d.version)};
})();

(function(){
const key='zsa-square-v1',clone=v=>JSON.parse(JSON.stringify(v));
const sources=[{id:'CLUE-MASK',name:'口罩佩戴检查',category:'人员卫生',scene:'食品操作区',version:'C1.1',verified:true},{id:'CLUE-HAT',name:'工帽佩戴检查',category:'人员卫生',scene:'食品操作区',version:'C1.2',verified:true},{id:'CLUE-BIN',name:'垃圾桶状态检查',category:'环境设施',scene:'清洗消毒区',version:'C1.0',verified:true},{id:'CLUE-DISINFECT',name:'消毒记录核对',category:'台账记录',scene:'清洗消毒区',version:'C0.3',verified:false}];
const assets=[{id:'AS-MASK',name:'人员口罩佩戴对照',version:'A1',kind:'mask',source:'独立演示资产',audiences:['sales','business'],allowed:true,result:'发现口罩未规范覆盖口鼻的异常线索，需结合原始画面人工核实。'},{id:'AS-HAT',name:'工帽佩戴对照',version:'A1',kind:'hat',source:'独立演示资产',audiences:['sales','business'],allowed:true,result:'发现操作人员头发外露的异常线索；头部不可辨识时不作判断。'},{id:'AS-BIN',name:'垃圾桶加盖对照',version:'A2',kind:'bin',source:'脱敏展示资产',audiences:['sales','business'],allowed:true,result:'发现垃圾桶未加盖的异常线索；投放过程中需按适用条件核实。'},{id:'AS-INTERNAL',name:'内部培训参考图',version:'A1',kind:'mask',source:'知识候选资产',audiences:['business'],allowed:true,result:'仅供企业培训参考，尚未获得销售展示授权。'},{id:'AS-REVOKED',name:'已停止展示的历史素材',version:'A1',kind:'hat',source:'独立演示资产',audiences:[],allowed:false,result:''}];
const make=(id,source,name,desc,asset)=>({id,source,rev:1,status:'published',sourceState:'verified',updated:'2026/10/28 14:30',published:{version:'V1',name,category:sources.find(s=>s.id===source).category,scene:sources.find(s=>s.id===source).scene,desc,input:source==='CLUE-BIN'?'垃圾桶及周边区域清晰可见，目标无遮挡。':'固定机位覆盖食品操作岗位，人员头部及面部清晰可辨。',output:'给出合规、异常线索或无法判断的结果，并保留可核验画面。',boundary:source==='CLUE-BIN'?'目标不可见、设备离线或画面模糊时无法判断；投放垃圾的短暂开盖需结合业务核实。':'背对镜头、目标过小、低清或遮挡会影响判断；不能根据不可见部位推定未佩戴。',deployment:'需接入授权点位，并完成现场机位和适用岗位核对。',sourceVersion:sources.find(s=>s.id===source).version,audiences:['sales','business'],assetId:asset,publishedAt:'2026/10/28 14:30',evaluation:''},draft:null,records:[{version:'V1',action:'发布',time:'2026/10/28 14:30',by:'内容管理员',reason:'来源及展示素材已核对'}]});
const seeds=[make('SQ-MASK','CLUE-MASK','口罩佩戴识别','识别食品操作岗位人员是否规范佩戴口罩。','AS-MASK'),make('SQ-HAT','CLUE-HAT','工帽佩戴识别','识别操作人员工帽佩戴及头发外露线索。','AS-HAT'),make('SQ-BIN','CLUE-BIN','垃圾桶状态识别','发现垃圾桶未加盖及周边卫生异常线索。','AS-BIN')];
seeds[0].draft={...clone(seeds[0].published),name:'口罩佩戴识别',desc:'识别口罩是否规范覆盖口鼻，并保留需人工核实的异常线索。',version:'V2',publishedAt:null};
seeds.push({id:'SQ-DISINFECT',source:'CLUE-DISINFECT',rev:1,status:'draft',sourceState:'pending',updated:'2026/10/28 15:20',published:null,draft:{version:'V1',name:'消毒记录辅助核对',category:'台账记录',scene:'清洗消毒区',desc:'辅助提取消毒记录中的文字信息。',input:'',output:'文字摘录',boundary:'当前尚未提供可核对的巡检结论。',deployment:'',sourceVersion:'C0.3',audiences:['business'],assetId:'',evaluation:''},records:[]});
const read=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}};
const profile=()=>{const role=localStorage.getItem('zsa-prototype-role');if(!role)return 'admin';try{return JSON.parse(role)}catch{return role}};
function scenario(){return read('zsa-square-scenario','normal')}
function all(){return read(key,clone(seeds))}
function save(v){localStorage.setItem(key,JSON.stringify(v))}
function get(id){return all().find(v=>v.id===id)}
function asset(id){let a=clone(assets.find(a=>a.id===id)||null);if(a&&scenario()==='media-revoked'&&id==='AS-MASK')a.allowed=false;return a}
function canManage(){return ['admin'].includes(profile())}
function canConfigure(){return ['admin','configurator'].includes(profile())&&(sessionStorage.getItem('patrol-access-profile')||'manager')==='manager'}
function audience(){return profile()==='sales'?'sales':'business'}
function visible(x){return x&&x.status==='published'&&x.published&&x.published.audiences.includes(audience())&&!(scenario()==='withdrawn'&&x.id==='SQ-MASK')}
function qualification(){const s=scenario();if(s==='unauthorized')return {ok:false,text:'当前账号所属企业尚未获得此能力的调用授权'};if(s==='pending')return {ok:false,text:'能力配置尚未生效，暂不能用于新巡检项'};if(s==='qualification-error')return {ok:false,text:'暂时无法核验配置资格，请重试',retry:true};return {ok:true,text:'当前企业具备配置资格；保存时将重新核验执行入口。'}}
window.SquareData={key,all,save,get,asset,sources,assets,canManage,canConfigure,profile,audience,visible,qualification,scenario,clone};
})();

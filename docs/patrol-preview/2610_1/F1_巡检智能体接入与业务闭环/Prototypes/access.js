(function(){
 const profiles={
  manager:{id:'manager',name:'监管管理员',org:'示例组织A',role:'管理人员',unit:false},
  'unit-a':{id:'unit-a',name:'门店A负责人',org:'示例门店A',store:'示例门店A',orgId:'STORE-A',unit:true,export:true},
  'unit-b':{id:'unit-b',name:'门店B负责人',org:'示例门店B',store:'示例门店B',orgId:'STORE-B',unit:true,export:true},
  canteen:{id:'canteen',name:'明德食堂负责人',org:'明德食堂',qualityOrg:'明德食堂',orgId:'CANTEEN-MD',unit:true,export:true}
 };
 let id;try{id=sessionStorage.getItem('patrol-access-profile')||'manager'}catch{id='manager'}
 const profile=profiles[id]||{id:'none',name:'未授权账号',org:'未授权单位',unit:true,export:false};
 function scopeQuality(raw){
  if(!profile.unit)return raw;
  const db=JSON.parse(JSON.stringify(raw)),own=c=>!!profile.qualityOrg&&c.org===profile.qualityOrg;
  db.channels=db.channels.filter(own);const ids=new Set(db.channels.map(c=>c.id));
  db.events=db.events.filter(e=>ids.has(e.channel));const events=new Set(db.events.map(e=>e.id));
  db.labels=db.labels.filter(l=>ids.has(l.channel));
  db.warnings=Object.fromEntries(Object.entries(db.warnings).filter(([,w])=>events.has(w.event)));
  db.tasks=db.tasks.filter(t=>t.channels.some(c=>ids.has(c))).map(t=>{const partial=t.channels.some(c=>!ids.has(c));t.channels=t.channels.filter(c=>ids.has(c));t.rounds=t.rounds.map(r=>({...r,channels:t.channels.length,events:(r.events||[]).filter(e=>events.has(e)),token:null,tokenState:'当前账号不可查看用量'}));t.partialScope=partial;return t});
  const boxes=new Set(db.channels.map(c=>c.box));if(db.boxes)db.boxes=db.boxes.filter(b=>b.org===profile.qualityOrg||boxes.has(b.id));
  db.reports=db.reports.filter(r=>r.snapshot?.org===profile.qualityOrg&&r.snapshot.channels.every(own));
  Object.keys(db.permissions).forEach(k=>db.permissions[k]=k==='view'?!!raw.permissions.view&&!!profile.qualityOrg:k==='export'?!!raw.permissions.export&&!!profile.export:false);
  db.org=profile.org;return db;
 }
 function qualityAllowed(route,p,db){
  if(!profile.unit)return true;
  if(!profile.qualityOrg||!db.permissions.view||route==='create')return false;
  const id=p.get('id');
  if(route==='resource')return !id||id==='A'&&db.channels.length>0||id==='org:'+profile.qualityOrg||db.channels.some(c=>c.id===id||c.box===id)||(db.boxes||[]).some(b=>b.id===id);
  if(route==='event')return db.events.some(e=>e.id===(id||'E2'));
  if(route==='task')return db.tasks.some(t=>t.id===(id||'QT-001'));
  if(route==='report')return db.reports.some(r=>r.id===(id||'QR-001'));
  if(route==='warning')return !!db.warnings[id||'W1'];
  if(route==='labels'&&id)return db.labels.some(l=>l.id===id);
  if(p.has('channel')&&!db.channels.some(c=>c.id===p.get('channel')))return false;
  return true;
 }
 window.PatrolAccess={profile,isUnit:()=>profile.unit,profiles,scopeQuality,qualityAllowed};
})();

(function(){
 const scriptBase=new URL('.',document.currentScript.src),A=window.PatrolAccess,p=A?.profile||{org:'示例组织A',name:'管理员'},unit=!!p.unit;
 let riskBase,qualityBase,qualityRoute;
 if(document.body.dataset.qualityPage){qualityBase=scriptBase;riskBase=scriptBase.pathname.endsWith('/quality/')?new URL('../',scriptBase):new URL('../../F1_巡检智能体接入与业务闭环/Prototypes/',scriptBase)}else{riskBase=scriptBase;qualityBase=new URL('quality/',scriptBase)}
 const e=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const risk=(file,query='')=>new URL(file+query,riskBase).href,quality=file=>new URL(file,qualityBase).href;
 const params=new URLSearchParams(location.search),page=document.body.dataset.page;
 const qualityFiles={monitor:'quality-monitor.html',events:'quality-events.html',labels:'quality-labels.html',reports:'quality-reports.html'};
 function qroute(){return qualityRoute||document.body.dataset.qualityPage||(params.get('business')==='quality'?(params.get('view')==='warning'?'warning':page==='index'?'tasks':page==='create'?'create':'task'):null)}
 function section(){if(qroute())return'quality';if(['overview','briefing'].includes(page))return'analysis';return'patrol'}
 const svg=(name)=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${({grid:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',file:'<path d="M14 3H5v18h14V8l-5-5Z"/><path d="M14 3v6h5M8 13h8M8 17h5"/>',camera:'<rect x="3" y="6" width="13" height="12" rx="2"/><path d="m16 10 5-3v10l-5-3"/>',chart:'<path d="M4 20V9m6 11V4m6 16v-7m5 7H2M4 5l5-3 6 6 6-5"/>',flag:'<path d="M4 22V3l16 6-16 6"/>',box:'<path d="m3 8 9-5 9 5v13H3V8Zm0 0 9 5 9-5M12 13v8"/>',mic:'<rect x="9" y="2" width="6" height="13" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3M8 22h8"/>',bell:'<path d="M5 17h14l-2-3V9a5 5 0 0 0-10 0v5l-2 3ZM10 21h4"/>',book:'<path d="M3 3h7l2 2 2-2h7v17h-7l-2 2-2-2H3V3Zm9 2v17"/>',home:'<path d="m3 11 9-8 9 8M5 10v11h14V10M9 21v-8h6v8"/>'})[name]||'<rect x="4" y="4" width="16" height="16" rx="2"/> '}</svg>`;
 function boundary(name){let t=document.querySelector('.ps-message');if(t)t.remove();t=document.createElement('div');t.className='ps-message';t.setAttribute('role','status');t.textContent=name+'不在当前巡检业务范围内';document.body.append(t);setTimeout(()=>t.remove(),2500)}
 function top(){const modules=[['工作台','grid'],['基础管理','file'],['后厨管理','file'],['智慧餐厅','home'],['进销存','box'],['政企互动','file'],['招采管理','file'],['经营分析','chart'],['预警中心','bell']];return `<header class="ps-top q-top"><a class="ps-brand" href="${risk(unit?'index.html':'overview.html')}"><span class="ps-brand-icon">◉</span>智慧餐饮综合管理系统</a><nav class="ps-modules" aria-label="业务模块">${modules.map(([n,i])=>`<button class="${n==='后厨管理'?'active':''}" ${n==='后厨管理'?'':`onclick="ProductShell.boundary('${n}')"`} ${n==='后厨管理'?'aria-current="page"':''}>${svg(i)}<span>${n}</span></button>`).join('')}</nav><div class="ps-user"><span class="ps-organization" title="${e(p.org)}">${e(p.org)}<span>⌄</span></span><span class="ps-avatar">${unit?'责':'管'}</span><span>${e(p.name)}</span></div></header><nav class="ps-subnav" aria-label="后厨管理菜单">${[['阳光厨房','home'],['食堂台账','file'],['消防安全','file'],['能耗管理','grid'],['检查管理','grid'],['从业人员','grid'],['违规罚款','grid'],['监控检查','file'],['评价&投诉','file'],['学习培训','book']].map(([n,i])=>`<button class="${n==='阳光厨房'?'active':''}" ${n==='阳光厨房'?'':`onclick="ProductShell.boundary('${n}')"`} ${n==='阳光厨房'?'aria-current="page"':''}>${svg(i)}${n}</button>`).join('')}</nav>`}
 function sidebar(){const s=section();return `<aside class="ps-side q-side" aria-label="阳光厨房菜单">${!unit?`<a class="ps-menu ${s==='analysis'?'active':''}" href="${risk('overview.html')}">${svg('chart')}<span>数据研判</span></a>`:''}${!unit||p.qualityOrg?`<details class="ps-menu-group" ${s==='quality'?'open':''}><summary class="${s==='quality'?'current':''}">${svg('camera')}<span>视频监控</span><i>⌄</i></summary><a class="ps-child ${s==='quality'?'active':''}" href="${quality('quality-monitor.html')}">视频质量诊断</a></details>`:''}${!unit||p.store?`<details class="ps-menu-group" ${s==='patrol'?'open':''}><summary class="${s==='patrol'?'current':''}">${svg('flag')}<span>AI抓拍</span><i>⌄</i></summary>${!unit?'<button class="ps-child" onclick="ProductShell.boundary(\'抓拍策略\')">抓拍策略</button>':''}<a class="ps-child ${s==='patrol'?'active':''}" href="${risk('index.html')}">${unit?'本单位巡检':'AI巡检'}</a></details>`:''}${!unit?`<button class="ps-menu ps-menu-boundary" onclick="ProductShell.boundary('物联管理')">${svg('box')}<span>物联管理</span><i>⌄</i></button><button class="ps-menu ps-menu-boundary" onclick="ProductShell.boundary('语音播报')">${svg('mic')}<span>语音播报</span><i>⌄</i></button>`:''}</aside>`}
 function contextNav(options={}){
  if(options.qualityRoute)qualityRoute=options.qualityRoute;
  // Cross-page navigation belongs to the shared sidebar; object tabs stay in each page.
  return '';
 }
 function path(){return '后厨管理　/　阳光厨房　/　'+(section()==='analysis'?'数据研判':section()==='quality'?'视频监控　/　视频质量诊断':'AI抓拍　/　'+(unit?'本单位巡检':'AI巡检'))}
 function mount(options={}){
  if(options.riskBase)riskBase=options.riskBase;if(options.qualityBase)qualityBase=options.qualityBase;if(options.qualityRoute)qualityRoute=options.qualityRoute;
  if(qroute()==='warning')return;
  document.body.classList.add('has-product-shell');
  document.querySelectorAll('header.top,header.q-top,header.ps-top,.ps-subnav,aside.navside,aside.q-side,aside.ps-side').forEach(n=>n.remove());
  document.body.insertAdjacentHTML('afterbegin',top()+sidebar());
  const main=document.getElementById('app')||document.getElementById('q-app');if(!main)return;
  const crumb=main.querySelector('.crumb,.q-crumb');if(crumb){const h=main.querySelector('h1');crumb.textContent=path()+(h?'　/　'+h.textContent:'');if(!main.querySelector('.ps-business-tabs'))crumb.insertAdjacentHTML('afterend',contextNav())}
 }
 window.ProductShell={mount,contextNav,path,boundary};mount();
})();

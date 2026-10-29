(function(){
 'use strict';
 const U=UI,e=U.esc,i=U.icon;
 U.shell=function(active,title,subtitle='',actions=''){
  document.body.classList.add('f4-reference');
  const selected=['edit','manage'].includes(active)?'manage':'square',catalog=document.body.dataset.page==='square';
  document.getElementById('business-shell')?.remove();
  const old=document.getElementById('workspace')||document.getElementById('app');old?.remove();
  const nav=(id,label,url,icon)=>`<a class="rf-side-link ${selected===id?'active':''}" ${selected===id?'aria-current="page"':''} href="${e(url)}">${i(icon)}<span>${label}</span></a>`;
  const shell=document.createElement('div');shell.id='business-shell';
  shell.innerHTML=`<header class="rf-top"><a class="rf-brand" href="${U.risk('index.html')}"><span class="rf-brand-symbol">◉</span>智慧餐饮综合管理系统</a><nav class="rf-modules" aria-label="业务模块">${[['工作台','grid'],['基础管理','file'],['后厨管理','book'],['智慧餐厅','box'],['进销存','box'],['政企互动','file'],['报表管理','chart'],['能耗管理','chart'],['经营分析','chart'],['预警中心','bell']].map(([label,icon])=>`<span class="${label==='后厨管理'?'current':''}">${i(icon)}${label}</span>`).join('')}</nav><div class="rf-user"><span>${({admin:'管理员',sales:'销售',configurator:'配置人员',reader:'只读用户',reviewer:'复核员'})[SquareData.profile()]||'用户'}</span><span class="rf-avatar">${i('shield')}</span></div></header><aside class="rf-side" aria-label="业务导航"><a class="rf-side-parent" href="${U.risk('index.html')}">${i('shield')}<span>AI巡检</span><span class="rf-chevron">⌄</span></a><details class="rf-knowledge"><summary class="rf-side-parent">${i('book')}<span>知识库</span><span class="rf-chevron">⌄</span></summary><a class="rf-side-link" href="${U.kb('files.html')}">${i('file')}文件管理</a><a class="rf-side-link" href="${U.kb('search.html')}">${i('search')}知识检索</a><a class="rf-side-link" href="${U.kb('chat.html')}">${i('chat')}AI问答</a></details><div class="rf-side-parent rf-square-parent">${i('grid')}<span>模型广场</span><span class="rf-chevron">⌃</span></div>${nav('square','能力目录','square.html','grid')}${SquareData.canManage()?nav('manage','展示内容管理','manage.html','file'):''}</aside>`;
  document.body.prepend(shell);
  const main=document.createElement('main');main.id='workspace';
  main.innerHTML=`<div class="crumb"><span>后厨管理</span><span>›</span><a href="square.html">模型广场</a><span>›</span><span>${e(catalog?'能力目录':title)}</span></div><div class="page-heading"><div class="rf-heading-title"><span class="rf-title-icon">${i('box')}</span><div><h1>${e(title)}${catalog?'<span class="rf-sparkle">✦</span>':''}</h1>${subtitle?`<p>${e(subtitle)}</p>`:''}</div></div>${catalog?'<div class="rf-banner-message"><strong>AI 让餐饮更安全，更智能</strong><span>聚焦后厨场景，让风险线索清晰可见</span></div><div class="rf-chip-art" aria-hidden="true"><span></span><span></span><span>AI</span></div>':''}<div class="heading-actions">${actions}</div></div><div id="app"></div>`;
  document.body.append(main);document.title=title+' · 众食安';return main.querySelector('#app');
 };
})();

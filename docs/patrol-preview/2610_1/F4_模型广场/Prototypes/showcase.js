(function(){
 'use strict';
 const D=SquareData,U=UI,e=U.esc,params=new URLSearchParams(location.search);
 const defaults={q:'',category:'',scene:'',size:20,page:1};
 let f={...defaults,...U.read('zsa-square-list',{})},selected=U.read('zsa-square-selected','SQ-MASK'),display=params.get('display')==='1',delay;
 const byId=id=>document.getElementById(id),arrow='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6"/></svg>',expand='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/></svg>';
 function save(){U.write('zsa-square-list',f);U.write('zsa-square-selected',selected)}
 function published(){return D.all().filter(D.visible)}
 function matches(){return published().filter(x=>(x.published.name+' '+x.published.desc).includes(f.q)&&(!f.category||x.published.category===f.category)&&(!f.scene||x.published.scene===f.scene))}
 function detailURL(id){return 'capability.html?id='+encodeURIComponent(id)+(display?'&display=1':'')}
 function mount(){
  document.body.classList.add('showcase-catalog');
  const app=U.shell('square','模型广场','适配后厨场景，发现可核实的巡检线索',`${D.canManage()?'<a class="btn sc-management" href="manage.html">'+U.icon('file')+'展示内容管理</a>':''}<button class="sc-display-button" onclick="Showcase.toggleDisplay()" aria-label="进入展示模式">${expand}</button>`);
  app.innerHTML=`<div class="sc-display-top"><a class="sc-wordmark" href="square.html?display=1"><span class="sc-brand-mark">◉</span><strong>众食安</strong><span class="sc-brand-line"></span><span>模型广场</span></a><button onclick="Showcase.toggleDisplay()">${expand}退出展示模式 <kbd>Esc</kbd></button></div><form class="sc-toolbar" id="sc-filter"><div class="sc-categories" role="group" aria-label="业务分类" id="sc-categories"></div><div class="sc-search-controls"><label class="visually-hidden" for="sc-scene">适用场景</label><select id="sc-scene" aria-label="适用场景"></select><div class="sc-search">${U.icon('search')}<label class="visually-hidden" for="sc-query">搜索能力名称</label><input id="sc-query" value="${e(f.q)}" placeholder="搜索识别能力" autocomplete="off"><button type="button" id="sc-clear" aria-label="清空搜索" onclick="Showcase.clearQuery()">×</button></div><button class="visually-hidden" type="submit">查询</button></div></form><section id="sc-results" aria-live="polite"></section>`;
  byId('sc-filter').onsubmit=ev=>{ev.preventDefault();apply()};byId('sc-query').oninput=()=>{clearTimeout(delay);delay=setTimeout(apply,180)};byId('sc-scene').onchange=apply;
  renderControls();render();applyDisplay();
 }
 function renderControls(){
  const all=published(),categories=[...new Set(all.map(x=>x.published.category))],scenes=[...new Set(all.map(x=>x.published.scene))];
  byId('sc-categories').innerHTML=`<button type="button" class="${!f.category?'active':''}" aria-pressed="${!f.category}" onclick="Showcase.category('')">全部能力</button>${categories.map(c=>`<button type="button" class="${f.category===c?'active':''}" aria-pressed="${f.category===c}" data-category="${e(c)}">${e(c)}</button>`).join('')}`;
  byId('sc-categories').querySelectorAll('[data-category]').forEach(b=>b.onclick=()=>category(b.dataset.category));
  byId('sc-scene').innerHTML='<option value="">全部场景</option>'+scenes.map(s=>`<option ${s===f.scene?'selected':''}>${e(s)}</option>`).join('');byId('sc-clear').hidden=!f.q;
 }
 function apply(){clearTimeout(delay);f.q=byId('sc-query').value.trim();f.scene=byId('sc-scene').value;f.page=1;save();renderControls();render()}
 function category(c){f.category=c;f.page=1;save();renderControls();render()}
 function media(v){const a=D.asset(v.assetId);return D.scenario()==='media-error'?'<div class="sc-media-unavailable"><span>演示素材暂时加载失败</span><button onclick="Showcase.retry()">重试加载素材</button></div>':ShowcaseMedia.render(a)}
 function render(){
  const target=byId('sc-results');
  if(D.scenario()==='load-error'){target.innerHTML='<div class="sc-empty"><strong>能力加载失败，请重试</strong><p>查询条件已保留。</p><button onclick="Showcase.retry()">重试加载</button></div>';return}
  const all=matches();f.page=Math.min(f.page,Math.max(1,Math.ceil(all.length/f.size)));const page=all.slice((f.page-1)*f.size,f.page*f.size);
  if(!page.some(x=>x.id===selected))selected=page[0]?.id||'';save();
  if(!page.length){target.innerHTML=`<div class="sc-empty">${U.icon('search')}<strong>${published().length?'暂无符合条件的能力':'暂无可展示能力'}</strong><p>${published().length?'试试其他关键词或应用场景':'获准发布的能力将在这里展示'}</p>${published().length?'<button onclick="Showcase.reset()">清空筛选</button>':''}</div>`;return}
  target.innerHTML=`<div class="sc-gallery">${page.map(x=>{const v=x.published,a=D.asset(v.assetId);return `<article class="sc-card ${x.id===selected?'selected':''}" data-id="${e(x.id)}"><div class="sc-card-cover">${media(v)}${ShowcaseMedia.allowed(a)&&D.scenario()!=='media-error'?`<button class="sc-zoom" onclick="Showcase.zoom('${e(x.id)}')">${expand}放大查看</button>`:''}<span class="sc-ai-mark">AI</span></div><div class="sc-card-copy"><div class="sc-card-title"><span class="sc-capability-icon">${U.icon(a?.kind==='bin'?'box':'shield')}</span><h2><a href="${detailURL(x.id)}">${e(v.name)}</a></h2></div><div class="sc-card-tags"><span>${e(v.category)}</span><span>视觉识别</span></div><p class="sc-card-description">${e(v.desc)}</p><dl class="sc-card-facts"><div><dt>${U.icon('box')}适用场景</dt><dd>${e(v.scene)}</dd></div><div><dt>${U.icon('file')}适用版本</dt><dd>${e(v.sourceVersion)}</dd></div><div><dt>${U.icon('shield')}结果使用</dt><dd>人工核实</dd></div></dl></div><div class="sc-card-footer"><button class="sc-select" aria-pressed="${x.id===selected}" onclick="Showcase.select('${e(x.id)}')">${x.id===selected?'当前展示':'选择展示'}</button><a class="sc-detail-button" href="${detailURL(x.id)}">查看能力详情 ${arrow}</a></div></article>`}).join('')}</div><div class="sc-pagination"><span>共 ${all.length} 项能力</span><select aria-label="每页条数" onchange="Showcase.paginate(1,Number(this.value))">${[10,20,50].map(n=>`<option value="${n}" ${n===f.size?'selected':''}>${n} 项/页</option>`).join('')}</select><button aria-label="上一页" ${f.page===1?'disabled':''} onclick="Showcase.paginate(${f.page-1})">‹</button><span class="sc-page-current">${f.page}</span><button aria-label="下一页" ${f.page===Math.ceil(all.length/f.size)?'disabled':''} onclick="Showcase.paginate(${f.page+1})">›</button></div>`;
 }
 function select(id){const index=matches().findIndex(x=>x.id===id);if(index<0)return;f.page=Math.floor(index/f.size)+1;selected=id;save();render();byId('sc-results').querySelector(`[data-id="${CSS.escape(id)}"] .sc-select`)?.focus({preventScroll:true})}
 function zoom(id){const x=D.get(id);if(!D.visible(x)||!ShowcaseMedia.allowed(D.asset(x.published.assetId))){U.toast('当前演示素材暂不可展示');return}selected=id;save();render();const trigger=byId('sc-results').querySelector(`[data-id="${CSS.escape(id)}"] .sc-zoom`);trigger?.focus({preventScroll:true});U.modal(x.published.name,`<div class="sc-lightbox">${media(x.published)}<p>${e(D.asset(x.published.assetId).result)}</p><a class="btn primary" href="${detailURL(x.id)}">查看能力详情 ${arrow}</a></div>`);byId('modal').classList.add('sc-lightbox-dialog');byId('modal').addEventListener('close',()=>trigger?.isConnected&&trigger.focus({preventScroll:true}),{once:true})}
 function applyDisplay(){document.body.classList.toggle('showcase-display',display);const url=new URL(location.href);display?url.searchParams.set('display','1'):url.searchParams.delete('display');history.replaceState(null,'',url);byId('sc-results').querySelectorAll('.sc-card').forEach(card=>card.querySelectorAll('a').forEach(a=>a.href=detailURL(card.dataset.id)))}
 function toggleDisplay(){display=!display;applyDisplay();window.scrollTo({top:0})}
 function reset(){f={...defaults};save();mount()}
 function retry(){U.write('zsa-square-scenario','normal');renderControls();render()}
 window.Showcase={select,zoom,category,toggleDisplay,reset,retry,clearQuery(){byId('sc-query').value='';apply();byId('sc-query').focus()},paginate(page,size){f.page=page;if(size)f.size=size;save();render()}};
 window.addEventListener('keydown',ev=>{if(ev.key==='Escape'&&display&&!byId('modal')?.open){toggleDisplay();return}if(!display||byId('modal')?.open||/INPUT|SELECT|TEXTAREA/.test(ev.target.tagName))return;if(['ArrowLeft','ArrowRight'].includes(ev.key)){const a=matches(),i=a.findIndex(x=>x.id===selected),next=a[(i+(ev.key==='ArrowRight'?1:-1)+a.length)%a.length];if(next){ev.preventDefault();select(next.id)}}});
 window.addEventListener('storage',ev=>{if(['zsa-prototype-role','zsa-square-scenario',D.key].includes(ev.key)){U.closeModal();mount()}});
 mount();
})();

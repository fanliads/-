(function () {
  'use strict';
  const D = window.QualityData, access=window.PatrolAccess, unit=access?.isUnit();
  const base = new URL('.', document.currentScript.src);
  const riskBase = base.pathname.endsWith('/quality/') ? new URL('../', base) : new URL('../../F1_巡检智能体接入与业务闭环/Prototypes/', base);
  const params = new URLSearchParams(location.search);
  const shared = params.get('business') === 'quality';
  const files = { monitor: 'quality-monitor.html', resource: 'quality-resource.html', events: 'quality-events.html', event: 'quality-event.html', labels: 'quality-labels.html', reports: 'quality-reports.html', report: 'quality-report.html' };
  function url(route, values) {
    const u = new URL(files[route] || (route === 'tasks' ? 'index.html' : route === 'create' ? 'create.html' : 'task.html'), files[route] ? base : riskBase);
    if (!files[route]) u.searchParams.set('business', 'quality');
    if (route === 'warning') u.searchParams.set('view', 'warning');
    Object.entries(values || {}).forEach(([k,v]) => { if (v !== null && v !== undefined && v !== '') u.searchParams.set(k, v); });
    return u.href;
  }
  const esc = x => String(x == null ? '' : x).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  if (!document.body.dataset.qualityPage && !shared) {
    if(unit)return;
    const side = document.querySelector('aside');
    if (side && !window.ProductShell && !side.querySelector('[data-quality-nav]')) {
      const nav = document.createElement('div'); nav.dataset.qualityNav = 'true';
      nav.innerHTML = '<div class="navtitle" style="margin-top:18px">视频质量诊断</div>' + [['monitor','运行监测'],['events','异常事件'],['labels','标注核实'],['reports','质量报告']].map(([p,n]) => '<a class="navitem" href="' + esc(url(p)) + '">' + n + '</a>').join('');
      side.insertBefore(nav, side.querySelector('.navfoot'));
    }
    if (document.body.dataset.page === 'index') {
      const filters = document.querySelector('.filters');
      if (filters) { const l = document.createElement('label'); l.innerHTML = '业务类型<select aria-label="业务类型"><option>后厨风险</option><option>视频质量</option></select>'; l.querySelector('select').onchange = () => location.href = url('tasks'); filters.prepend(l); }
    }
    return;
  }
  if (!document.querySelector('link[href$="quality.css"]')) { const style=document.createElement('link');style.rel='stylesheet';style.href=new URL('quality.css',base).href;document.head.append(style); }
  let route = document.body.dataset.qualityPage || (params.get('view') === 'warning' ? 'warning' : document.body.dataset.page === 'index' ? 'tasks' : document.body.dataset.page === 'create' ? 'create' : 'task');
  if(shared)document.title=({tasks:'巡检任务 · 视频质量',create:'发起视频质量诊断',task:'视频质量执行详情',warning:'预警详情'}[route]||'视频质量诊断')+' · 众食安';
  const uiKey=unit?'vq-ui:'+access.profile.id:'vq-ui';
  let db = access?access.scopeQuality(D.read()):D.read(), prefs = JSON.parse(sessionStorage.getItem(uiKey) || '{}');
  const f = prefs[route] || (prefs[route] = {});
  if (params.has('channel')) f.channel = params.get('channel');
  if (params.has('state')) { f.view = 'channels'; f.state = params.get('state'); }
  if (params.has('round')) f.round = params.get('round');
  const icon = name => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ({grid:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',camera:'<rect x="3" y="6" width="13" height="12" rx="2"/><path d="m16 10 5-3v10l-5-3M5 3l14 18"/>',list:'<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>',alert:'<path d="m12 3 10 18H2L12 3Z"/><path d="M12 9v5m0 3h.01"/>',check:'<path d="m4 12 5 5L20 6"/>',file:'<path d="M14 3H5v18h14V8l-5-5Z"/><path d="M14 3v6h5M8 13h8M8 17h5"/>',edit:'<path d="m4 16-1 5 5-1L20 8l-4-4L4 16Z"/><path d="m14 6 4 4"/>',arrow:'<path d="m9 5 7 7-7 7"/>',empty:'<path d="M4 7h16v14H4zM8 3h8M8 12h8M9 17h6"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v6l4 2"/>'}[name] || '') + '</svg>';
  const tag = (s, color) => '<span class="q-tag ' + (color || (/正常|已生效|已恢复|已生成|已完成|标注无误|在线/.test(s) ? 'green' : /异常|黑屏|模糊|失败|离线/.test(s) ? 'red' : /未知|未恢复|待|无法|过期|统计中/.test(s) ? 'amber' : 'gray')) + '">' + esc(s) + '</span>';
  const link = (label, dest, values) => '<a href="' + esc(url(dest, values)) + '">' + label + '</a>';
  const btn = (label, action, primary, disabled) => '<button type="button" class="' + (primary ? 'primary' : '') + '" onclick="' + esc(action) + '"' + (disabled ? ' disabled' : '') + '>' + label + '</button>';
  const empty = message => '<div class="q-empty">' + icon('empty') + esc(message || '暂无符合条件的记录') + '</div>';
  const table = (heads, rows) => '<div class="q-table-wrap"><table class="q-table"><thead><tr>' + heads.map(x => '<th>' + x + '</th>').join('') + '</tr></thead><tbody>' + (rows.length ? rows.map(c => '<tr>' + c.map(x => '<td>' + x + '</td>').join('') + '</tr>').join('') : '<tr><td colspan="' + heads.length + '">' + empty() + '</td></tr>') + '</tbody></table></div>';
  function pager(n) { return '<div class="q-pager">共 ' + n + ' 条 <select aria-label="每页条数" onchange="Q.pageSize(this.value)"><option' + (f.size !== 50 ? ' selected' : '') + '>20 条/页</option><option' + (f.size === 50 ? ' selected' : '') + '>50 条/页</option></select>' + btn('‹','Q.page(-1)',false,!f.page) + '<span>' + ((f.page || 0) + 1) + '</span>' + btn('›','Q.page(1)',false,((f.page || 0)+1)*(f.size || 20)>=n) + '</div>'; }
  function slice(a) { return a.slice((f.page || 0)*(f.size || 20), ((f.page || 0)+1)*(f.size || 20)); }
  const select = (name, values, current, auto) => '<select name="' + name + '"' + (auto ? ' onchange="' + auto + '"' : '') + '>' + values.map(v => '<option value="' + esc(Array.isArray(v) ? v[0] : v) + '"' + (String(Array.isArray(v) ? v[0] : v) === String(current || '') ? ' selected' : '') + '>' + esc(Array.isArray(v) ? v[1] : v) + '</option>').join('') + '</select>';
  const field = (label, html, cls) => '<label class="' + (cls || '') + '">' + label + html.replace(/<(input|select|textarea)\b/,'<$1 aria-label="'+esc(label)+'"') + '</label>';
  const notice = (text, kind) => '<div class="q-notice ' + (kind || '') + '">' + text + '</div>';
  const kv = (pairs, two) => '<div class="q-kv' + (two ? ' two' : '') + '">' + pairs.map(([k,v]) => '<dl><dt>' + k + '</dt><dd>' + v + '</dd></dl>').join('') + '</div>';
  const metrics = items => '<div class="q-metrics">' + items.map(([label,n,unit,color,action]) => '<button class="q-metric ' + (color || '') + '"' + (action ? ' onclick="' + esc(action) + '"' : ' type="button"') + '>' + label + '<b>' + esc(n) + '<small>' + unit + '</small></b></button>').join('') + '</div>';
  const card = (title, content, right) => '<section class="q-card">' + (title ? '<div class="q-section-head"><h2>' + title + '</h2>' + (right || '') + '</div>' : '') + content + '</section>';
  const last = e => e.observations.at(-1);
  const channel = id => db.channels.find(c => c.id === id);
  const pending = l => l.verdict === '待核实' || l.verdict === '无法判断' || (l.verdict === '需修正' && l.effect !== '已生效');
  function save() { if(!unit)D.write(db); }
  function remember() { sessionStorage.setItem(uiKey, JSON.stringify(prefs)); sessionStorage.setItem('vq-scroll:' + location.pathname + location.search, String(scrollY)); }
  function navigate(p, values) { remember(); location.href = url(p, values); }
  function back(fallback) {
    const p = params.get('back');
    if (p) { try { const u = new URL(p, location.href); if (u.origin === location.origin && !u.pathname.includes('..')) return u.href; } catch (_) {} }
    return url(fallback || 'monitor');
  }
  function detailLink(label, dest, id) { return link(label, dest, { id, back: location.href }); }
  let focusReturn = null, drawerFocusReturn = null, dirtyBase = '', drawerDirtyBase = '', draft = null, preview = null;
  function valuesIn(node) { return JSON.stringify(Array.from(node.querySelectorAll('input,select,textarea')).map(x => [x.name,x.value,x.checked])); }
  function modal(title, body, actions, width) {
    focusReturn = document.activeElement;
    const d = document.getElementById('q-modal');
    d.innerHTML = '<div class="q-section-head"><h2>' + title + '</h2><button class="q-close" aria-label="关闭" onclick="Q.close()">×</button></div>' + body + '<div id="q-form-error" class="q-error-text" role="alert"></div><div class="q-footer">' + btn('取消','Q.close()') + (actions || '') + '</div>';
    d.style.width = (width || 650) + 'px'; d.showModal(); dirtyBase = valuesIn(d);
    const input = d.querySelector('input:not([type=checkbox]),select,textarea,button'); if (input) input.focus();
  }
  function discard(target) {
    const d = document.getElementById('q-confirm');
    d.innerHTML = '<h2>放弃未保存的更改？</h2><p class="q-small">关闭后，本次输入不会保存。</p><div class="q-footer">' + btn('继续编辑','Q.keepEditing()') + btn('放弃更改',"Q.discard('" + target + "')",true) + '</div>'; d.showModal();
  }
  function close(force) {
    const d = document.getElementById('q-modal');
    if (!force && d.open && dirtyBase !== valuesIn(d)) return discard('modal');
    if (d.open) d.close(); if (focusReturn && document.contains(focusReturn)) focusReturn.focus();
  }
  function drawer(title, body) {
    drawerFocusReturn = document.activeElement;
    document.getElementById('q-drawer').innerHTML = '<div class="q-overlay" onclick="Q.closeDrawer()"></div><section class="q-drawer" role="dialog" aria-modal="true" aria-labelledby="q-drawer-title"><div class="q-drawer-head"><h2 id="q-drawer-title">' + title + '</h2><button class="q-close" aria-label="关闭" onclick="Q.closeDrawer()">×</button></div><div class="q-drawer-body">' + body + '</div></section>';
    drawerDirtyBase = valuesIn(document.getElementById('q-drawer'));
    document.querySelectorAll('.q-main,.q-top,.q-side').forEach(el=>{el.inert=true;});document.body.style.overflow='hidden';
    document.querySelector('.q-drawer .q-close').focus();
  }
  function closeDrawer(force) {
    const el = document.getElementById('q-drawer');
    if (!force && el.innerHTML && drawerDirtyBase !== valuesIn(el)) return discard('drawer');
    el.innerHTML = ''; document.querySelectorAll('.q-main,.q-top,.q-side').forEach(el=>{el.inert=false;});document.body.style.overflow='';if (drawerFocusReturn && document.contains(drawerFocusReturn)) drawerFocusReturn.focus();
  }
  function toast(text) {
    document.querySelector('.q-toast')?.remove();
    const t = document.createElement('div'); t.className = 'q-toast'; t.setAttribute('role','status'); t.textContent = text; document.body.append(t); setTimeout(() => t.remove(),3200);
  }
  function error(text) { const el = document.getElementById('q-form-error') || document.getElementById('q-page-error'); if (el) { el.textContent = text; el.scrollIntoView({block:'nearest'}); } }
  function heading(title, sub, actions, parent) { return '<div class="q-crumb">后厨管理<span>/</span>阳光厨房<span>/</span>视频监控<span>/</span>视频质量诊断<span>/</span>' + (parent ? parent + '<span>/</span>' : '') + esc(title) + '</div>'+(window.ProductShell?.contextNav({qualityRoute:route})||'')+'<div class="q-heading"><div><h1>' + title + '</h1><div class="q-sub">' + (sub || '') + '</div></div><div class="q-actions">' + (actions || '') + '</div></div>'; }
  function tabs(items, current, fn) { return '<div class="q-tabs">' + items.map(([v,n]) => '<button class="' + (current === v ? 'active' : '') + '" onclick="' + fn + "('" + v + "')" + '">' + n + '</button>').join('') + '</div>'; }
  function shell(content) {
    if(unit)return unitShell(content);
    const section = ['resource'].includes(route) ? 'monitor' : ['event'].includes(route) ? 'events' : ['report'].includes(route) ? 'reports' : route;
    const qualityItems = [['monitor','运行监测','grid'],['events','异常事件','alert'],['labels','标注核实','edit'],['reports','质量报告','file']];
    return '<header class="q-top"><a class="q-brand" href="' + esc(url('monitor')) + '">◉ 智慧餐饮综合管理系统</a><nav aria-label="业务模块"><a href="' + esc(url('monitor')) + '">工作台</a><a class="' + (route !== 'warning' ? 'active' : '') + '" href="' + esc(url('monitor')) + '">后厨管理</a><a class="' + (route === 'warning' ? 'active' : '') + '" href="' + esc(url('warning',{id:'W1'})) + '">预警中心</a></nav><div class="q-user"><span>华东运营中心</span><span class="q-avatar">陈</span></div></header>' +
      '<aside class="q-side"><div class="cap">后厨管理 / AI巡检</div><a class="' + (['tasks','create','task'].includes(route) ? 'active' : '') + '" href="' + esc(url('tasks')) + '">' + icon('list') + '巡检任务</a><a href="' + esc(new URL('items.html',riskBase).href) + '">' + icon('grid') + '巡检项管理</a><div class="cap group">公共标准</div><a href="' + esc(new URL('sop.html',riskBase).href) + '">' + icon('file') + 'SOP规范库</a><div class="cap group">视频质量诊断</div>' + qualityItems.map(([p,n,i]) => '<a class="sub ' + (section === p ? 'active' : '') + '" href="' + esc(url(p)) + '">' + icon(i) + n + '</a>').join('') + '<div class="q-side-foot">华东运营中心</div></aside><main class="q-main" id="q-app">' + content + '</main><dialog class="q-dialog" id="q-modal"></dialog><dialog class="q-dialog" id="q-confirm"></dialog><div id="q-drawer"></div>';
  }
  function unitShell(content){
    const p=access.profile,homeHref=p.store?new URL('index.html',riskBase).href:url('monitor'),qualityItems=[['monitor','运行监测'],['events','异常事件'],['labels','标注核实记录'],['reports','质量报告']];
    return '<header class="q-top"><a class="q-brand" href="'+esc(homeHref)+'">◉ 智慧餐饮综合管理系统</a><nav aria-label="业务模块"><a href="'+esc(homeHref)+'">本单位巡检</a></nav><div class="q-user"><span>'+esc(p.org)+' · '+esc(p.name)+'</span><span class="q-avatar">责</span></div></header><aside class="q-side"><div class="cap">'+esc(p.org)+'</div><a href="'+esc(homeHref)+'">本单位巡检</a>'+(p.store?'<a href="'+esc(new URL('unit.html?view=issues',riskBase).href)+'">问题与整改</a><a href="'+esc(new URL('unit.html?view=reports',riskBase).href)+'">巡检报告</a>':'')+(p.qualityOrg?'<div class="cap group">视频质量诊断</div>'+qualityItems.map(([r,n])=>'<a class="'+(route===r?'active':'')+'" href="'+esc(url(r))+'">'+n+'</a>').join(''):'')+'<div class="q-side-foot">数据范围：本单位</div></aside><main class="q-main" id="q-app">'+content+'</main><dialog class="q-dialog" id="q-modal"></dialog><dialog class="q-dialog" id="q-confirm"></dialog><div id="q-drawer"></div>';
  }
  let autoOpened = false;
  function render() {
    remember();
    document.body.style.overflow='';
    let content;
    if(unit&&!access.qualityAllowed(route,params,db))content=heading('无权查看此内容',access.profile.org)+card('',empty('该记录不存在或不在当前账号的授权范围内'));
    else if (!db.permissions.view) content = heading('视频质量诊断','') + card('',empty('当前账号没有该组织的数据查看权限'));
    else content = ({monitor: monitorPage,resource: resourcePage,events: eventsPage,event: eventPage,labels: labelsPage,reports: reportsPage,report: reportPage,tasks: tasksPage,create: createPage,task: taskPage,warning: warningPage}[route] || monitorPage)();
    document.body.innerHTML = shell(content);
    window.ProductShell?.mount({qualityRoute:route,riskBase,qualityBase:base});
    document.getElementById('q-modal').addEventListener('cancel',e=>{e.preventDefault();close();});
    document.getElementById('q-confirm').addEventListener('cancel',e=>{e.preventDefault();Q.keepEditing();});
    if (route === 'labels' && params.get('id') && !autoOpened) {
      autoOpened = true;
      const openLabel = () => Q.label(params.get('id'));
      if (document.readyState === 'loading') addEventListener('load', openLabel, {once:true}); else openLabel();
    }
  }
  function scopeOrg() { if(unit)return access.profile.qualityOrg;return f.org==='A'?'明德食堂':f.org&&f.org!=='all'?f.org:''; }
  function scopeChannels() { return db.channels.filter(c=>c.useState!=='停用'&&(!scopeOrg()||c.org===scopeOrg())); }
  function allBoxes() { return db.boxes||[{id:'B1',org:'明德食堂',connection:'在线',last:'2026-10-27 09:59:00'}]; }
  function scopedBoxes() { return allBoxes().filter(b=>!scopeOrg()||b.org===scopeOrg()); }
  function boxState(id) { return allBoxes().find(b=>b.id===id)||{id,connection:'未知',last:'—'}; }
  function filteredChannels() { return scopeChannels().filter(c => (!f.keyword || (c.org+c.id+c.name+c.box).toLowerCase().includes(f.keyword.toLowerCase())) && (!f.state || c.state === f.state) && (!f.box || boxState(c.box).connection === f.box)); }
  function channelRows(cs) { return cs.map(c => [detailLink('<span class="q-name">' + esc(c.name) + '</span>','resource',c.id) + '<div class="q-cell-sub">' + esc(c.org) + ' · IPC ' + esc(c.id) + '</div>',esc(c.node),detailLink(esc(c.box),'resource',c.box)+' '+tag(boxState(c.box).connection),tag(c.state) + '<div class="q-cell-sub">' + esc(c.reason) + '</div>','<span class="q-small">' + esc(c.last) + '</span><div class="q-cell-sub">' + esc(c.validity) + '</div>','<div class="q-linkset">' + detailLink('查看','resource',c.id) + link('异常事件','events',{channel:c.id}) + '</div>']); }
  function matchingBoxes() {
    const cs=filteredChannels();
    let bs=scopedBoxes().filter(b=>(!f.box||b.connection===f.box)&&(!f.state||cs.some(c=>c.box===b.id))&&(!f.keyword||(b.org+b.id).toLowerCase().includes(f.keyword.toLowerCase())||cs.some(c=>c.box===b.id)));
    if(f.priority==='attention')bs=bs.filter(b=>b.connection!=='在线'||cs.some(c=>c.box===b.id&&c.state!=='正常'));
    if(f.sort==='attention')bs.sort((a,b)=>{
      const score=b=> (b.connection!=='在线'?100:0)+cs.filter(c=>c.box===b.id&&c.state!=='正常').length;
      return score(b)-score(a)||Number(a.id.slice(1))-Number(b.id.slice(1));
    });
    return bs;
  }
  function deviceView() {
    const cs=filteredChannels(),bs=matchingBoxes(),pageSize=8;
    f.devicePage=Math.min(f.devicePage||0,Math.max(0,Math.ceil(bs.length/pageSize)-1));
    const shown=bs.slice(f.devicePage*pageSize,(f.devicePage+1)*pageSize);
    const orgs=[...new Set(shown.map(b=>b.org))];
    const toolbar='<div class="q-fleet-toolbar"><div class="q-fleet-count">'+bs.length+' 台盒子 / '+cs.filter(c=>bs.some(b=>b.id===c.box)).length+' 路 IPC 符合条件</div><div class="q-fleet-controls">'+field('显示范围',select('priority',[['','全部设备'],['attention','仅需关注']],f.priority,'Q.devicePriority(this.value)'))+field('排序',select('sort',[['','按食堂排列'],['attention','异常优先']],f.sort,'Q.deviceSort(this.value)'))+'</div></div>';
    const legend='<div class="q-device-legend"><span>● 正常 / 在线</span><span>● 异常 / 离线</span><span>● 未知 / 观察过期</span><small>点击 IPC 查看连通、画面质量及观察依据</small></div>';
    const content=orgs.map(org=>'<section class="q-device-group"><div class="q-device-org"><strong>'+esc(org)+'</strong><span>本页 '+shown.filter(b=>b.org===org).length+' 台盒子</span></div>'+shown.filter(b=>b.org===org).map(b=>{
      const children=cs.filter(c=>c.box===b.id),total=scopeChannels().filter(c=>c.box===b.id).length;
      const count=state=>children.filter(c=>c.state===state).length;
      return '<div class="q-fleet-row"><div class="q-fleet-box"><div class="q-fleet-box-title">'+detailLink('3588 · '+esc(b.id),'resource',b.id)+tag(b.connection)+'</div><div class="q-cell-sub">上报 '+esc(b.last)+'</div><div class="q-fleet-stats">IPC '+(children.length===total?total+' 路':children.length+' / '+total+' 路（筛选后）')+' · 正常 '+count('正常')+' / 异常 '+count('异常')+' / 未知 '+count('未知')+'</div></div><div class="q-ipc-matrix">'+(children.length?children.map(c=>'<a class="q-ipc-tile '+(c.state==='正常'?'good':c.state==='异常'?'bad':'unknown')+'" href="'+esc(url('resource',{id:c.id,back:location.href}))+'" title="'+esc(c.id+' · '+c.name+'；连通：'+c.connection+'；画面：'+c.picture+'；'+c.reason+'；观察：'+c.last)+'"><span class="q-ipc-tile-top"><b>'+esc(c.id)+'</b><em>'+esc(c.state==='正常'?'正常':c.state==='未知'?'未知':c.picture)+'</em></span><span class="q-ipc-tile-name">'+esc(c.name)+'</span></a>').join(''):'<div class="q-fleet-empty">'+(total?'无符合筛选条件的 IPC':'尚未挂接 IPC')+'</div>')+'</div></div>';
    }).join('')+'</section>').join('');
    return toolbar+legend+(bs.length?content:empty('没有符合条件的设备，请调整筛选条件'))+'<div class="q-pager">共 '+bs.length+' 台盒子 · 每页 8 台 '+btn('上一页','Q.devicePage(-1)',false,!f.devicePage)+'<span>'+(f.devicePage+1)+' / '+Math.max(1,Math.ceil(bs.length/pageSize))+'</span>'+btn('下一页','Q.devicePage(1)',false,(f.devicePage+1)*pageSize>=bs.length)+'</div>';
  }
  function monitorPage() {
    const cs=scopeChannels(),bs=scopedBoxes(),view=f.view||'devices';
    const n={bad:cs.filter(c=>c.state==='异常').length,unknown:cs.filter(c=>c.state==='未知').length,pending:db.labels.filter(l=>pending(l)&&cs.some(c=>c.id===l.channel)).length};
    const h=heading('运行监测','数据截至 '+db.asOf+'　 ·　 '+esc(scopeOrg()||'华东运营中心'),btn('刷新','Q.refresh()')+link('查看执行','tasks')+(db.permissions.diagnose?'<a class="primary" href="'+esc(url('create'))+'">＋ 发起诊断</a>':''));
    let body='<div class="q-device-summary"><strong>3588 盒子 '+bs.length+' 台</strong>'+['在线','离线','未知'].map(state=>'<button type="button" onclick="Q.boxFilter(&quot;'+state+'&quot;)">'+state+' '+bs.filter(b=>b.connection===state).length+'</button>').join('')+'<span class="q-sub">设备连通与 IPC 画面质量分别统计</span></div>'+metrics([['在监测 IPC',cs.length,'路','','Q.monitorState("")'],['当前异常',n.bad,'路','red','Q.monitorState("异常")'],['状态未知',n.unknown,'路','amber','Q.monitorState("未知")'],['待处理标注',n.pending,'项','','Q.go("labels")']]);
    let inner=tabs([['status','运行状态'],['coverage','接入覆盖']],f.tab||'status','Q.monitorTab');
    if(f.tab==='coverage'){
      inner+=db.coverage?'<div class="q-section-head"><h2>节点接入情况</h2><span class="q-sub">接入要求 V1 · 明德食堂 · 来源更新 2026-10-27 09:59</span></div>'+table(['节点类型','应接入对象','已接入对象','缺口对象'],[['配餐','1 家','1 家',btn('0 家','Q.coverageDetail("配餐")')],['粗加工','1 家','1 家',btn('0 家','Q.coverageDetail("粗加工")')],['清洗','1 家','1 家',btn('0 家','Q.coverageDetail("清洗")')]])+(f.coverageType?notice(esc(f.coverageType)+'节点：当前要求范围无未接入对象。'):''):empty('尚未配置接入要求，无法计算覆盖缺口');
    }else{
      const orgOptions=unit?[[access.profile.qualityOrg,access.profile.qualityOrg]]:[['all','华东运营中心（全部）'],...[...new Set(allBoxes().map(b=>b.org))].map(org=>[org,org])];
      inner+='<form class="q-filters" onsubmit="Q.monitorFilter(event)">'+field('组织范围',select('org',orgOptions,f.org==='A'?'明德食堂':f.org))+field('设备 / 通道','<input name="keyword" value="'+esc(f.keyword||'')+'" placeholder="食堂、盒子或 IPC 名称 / 编号">','wide')+field('盒子连通',select('box',[['','全部'],'在线','离线','未知'],f.box))+field('IPC 状态',select('state',[['','全部'],'正常','异常','未知'],f.state))+'<div class="q-filter-actions"><button type="submit" class="primary">查询</button>'+btn('重置','Q.resetFilters()')+'</div>'+'</form><div class="q-section-head"><h2>设备工作状态</h2><div class="q-switch">'+btn('设备视图','Q.monitorView("devices")',view==='devices')+btn('对象汇总','Q.monitorView("orgs")',view==='orgs')+btn('IPC 明细','Q.monitorView("channels")',view==='channels')+'</div></div>';
      const matching=filteredChannels();
      if(view==='devices')inner+=deviceView();
      else if(view==='channels')inner+=table(['对象 / 通道','节点类型','上游盒子','综合状态 / 原因','最近观察 / 有效性','操作'],channelRows(slice(matching)))+pager(matching.length);
      else{
        const orgs=[...new Set(matchingBoxes().map(b=>b.org))];
        inner+=table(['门店 / 食堂','盒子在线 / 总数','监测 IPC','异常','未知','操作'],slice(orgs).map(org=>{
          const os=matching.filter(c=>c.org===org),ob=matchingBoxes().filter(b=>b.org===org);
          return [detailLink(esc(org),'resource','org:'+org),ob.filter(b=>b.connection==='在线').length+' / '+ob.length,os.length+' 路',os.filter(c=>c.state==='异常').length,os.filter(c=>c.state==='未知').length,detailLink('查看资源','resource','org:'+org)];
        }))+pager(orgs.length);
      }
    }
    if(db.requests.query==='error')inner=notice('本次查询未成功，以下保留上次数据。请核对来源时间后重试刷新。','error')+inner;
    return h+body+card('',inner);
  }
  function connectionPlot(c,day) {
    const start=D.time(day+' 00:00:00'),end=start+86400000,cutoff=Math.max(start,Math.min(end,D.time(db.asOf)));
    const records=(c.connectionHistory||[]).filter(r=>D.time(r.end)>start&&D.time(r.start)<cutoff&&['在线','离线'].includes(r.state));
    const cuts=[...new Set([start,cutoff,...records.flatMap(r=>[Math.max(start,D.time(r.start)),Math.min(cutoff,D.time(r.end))])])].sort((a,b)=>a-b);
    const spans=[];
    cuts.slice(0,-1).forEach((a,i)=>{
      const b=cuts[i+1];if(b<=a)return;
      const r=records.findLast(r=>D.time(r.start)<=a&&D.time(r.end)>=b),state=r?.state||'未知',source=r?.source||'未取得有效连通记录';
      const prev=spans.at(-1);if(prev&&prev.state===state&&prev.source===source&&prev.end===a)prev.end=b;else spans.push({start:a,end:b,state,source});
    });
    const clock=t=>t===end?'24:00':D.format(t).slice(11,16);
    const duration=ms=>{const m=Math.round(ms/60000);if(ms===0)return '0分钟';return (Math.floor(m/60)?Math.floor(m/60)+'小时':'')+(m%60?m%60+'分钟':m?'':'不足1分钟');};
    const color=state=>state==='在线'?'online':state==='离线'?'offline':'unknown';
    const legends='<div class="q-connection-legend"><span><i class="online"></i>在线</span><span><i class="offline"></i>离线</span><span><i class="unknown"></i>未知 / 无有效记录</span><span><i class="future"></i>未到时间</span></div>';
    const sums='<div class="q-connection-totals">'+['在线','离线','未知'].map(state=>'<span class="'+color(state)+'">'+state+' <b>'+duration(spans.filter(r=>r.state===state).reduce((n,r)=>n+r.end-r.start,0))+'</b></span>').join('')+'<small>统计截至 '+(cutoff===end?'24:00':clock(cutoff))+'</small></div>';
    let bar='<div class="q-connection-track" role="group" aria-label="'+esc(day)+' 连通状态时间轴">'+spans.map((r,i)=>{
      const label=clock(r.start)+'–'+clock(r.end)+' · '+r.state+' · '+duration(r.end-r.start),width=(r.end-r.start)/864000;
      return '<button type="button" class="q-connection-segment '+color(r.state)+'" style="left:'+((r.start-start)/864000)+'%;width:'+width+'%" aria-pressed="'+(i===Math.min(f.connectionIndex??spans.length-1,spans.length-1))+'" aria-label="'+esc(label)+'" title="'+esc(label+'；'+r.source)+'" onclick="Q.connectionWindow('+i+')">'+(width>9?'<span>'+r.state+'</span>':'')+'</button>';
    }).join('');
    if(cutoff<end)bar+='<div class="q-connection-future" style="left:'+((cutoff-start)/864000)+'%;width:'+((end-cutoff)/864000)+'%">'+(end-cutoff>10800000?'未到时间':'')+'</div>';
    if(cutoff>start&&cutoff<end)bar+='<div class="q-connection-cutoff" style="left:'+((cutoff-start)/864000)+'%"><span>截至 '+clock(cutoff)+'</span></div>';
    bar+='</div><div class="q-connection-axis">'+[0,6,12,18,24].map(h=>'<span>'+String(h).padStart(2,'0')+':00</span>').join('')+'</div>';
    const selected=spans[Math.min(f.connectionIndex??spans.length-1,spans.length-1)];
    const detail=selected?'<div class="q-connection-detail">'+tag(selected.state,color(selected.state)==='online'?'green':color(selected.state)==='offline'?'red':'gray')+'<strong>'+clock(selected.start)+'–'+clock(selected.end)+'</strong><span>'+duration(selected.end-selected.start)+'</span><small>'+esc(selected.source)+'</small></div>':empty('该日期尚无已发生的连通记录');
    return legends+sums+bar+detail+'<div class="q-cell-sub">未知时段不计入在线或离线；画面质量异常单独查看。</div>'+(spans.length?'<details class="q-connection-records"><summary>查看全部状态时段（'+spans.length+' 段）</summary>'+table(['时间段','连通状态','时长','依据'],spans.map(r=>[clock(r.start)+'–'+clock(r.end),tag(r.state,r.state==='未知'?'gray':undefined),duration(r.end-r.start),esc(r.source)]))+'</details>':'');
  }
  function resourcePage() {
    const id = params.get('id') || 'A', c = channel(id);
    if (!c) {
      const box=allBoxes().find(b=>b.id===id),org=box?.org||(id.startsWith('org:')?id.slice(4):id==='A'?'明德食堂':null);
      if(!org)return heading('资源详情','')+card('',empty('资源不存在或不在可访问范围内'));
      const children=db.channels.filter(c=>box?c.box===id:c.org===org);
      return heading(box?'3588 盒子 '+id:esc(org),'华东运营中心 / '+esc(org),'<a href="'+esc(back())+'">返回运行监测</a>','运行监测')+card('资源信息',kv([['所属食堂',esc(org)],['资源类型',box?'RK3588 盒子':'食堂'],['盒子连通',box?tag(box.connection):'—'],['最近状态上报',box?esc(box.last):'—'],['下挂 IPC',children.length+' 路'],['状态来源','设备连通服务']]))+card('视频通道',table(['对象 / 通道','节点类型','上游盒子','综合状态 / 原因','最近观察 / 有效性','操作'],channelRows(children)));
    }
    const all = db.events.filter(e=>e.channel===id), labels=db.labels.filter(l=>l.channel===id);
    const actions = '<a href="' + esc(back()) + '">返回</a>' + '<a href="' + esc(url('tasks',{channel:id})) + '">查看执行</a>' + (db.permissions.diagnose && c.useState!=='停用' ? '<a class="primary" href="' + esc(url('create',{channel:id,reason:'资源质量复检'})) + '">发起复检</a>' : '');
    const info = kv([['所属组织',c.org],['通道编号',c.id],['上游盒子',link(esc(c.box),'resource',{id:c.box})],['当前节点类型',esc(c.node)],['使用状态',tag(c.useState||'启用')],['别名',esc(c.name)],['配置版本',esc(c.version)],['连通状态',tag(c.connection)],['画面质量',tag(c.picture)],['综合状态',tag(c.state)],['最近观察',c.last],['观察有效性',tag(c.validity)],['状态原因',esc(c.reason)]]);
    const day = f.trend || db.asOf.slice(0,10);
    const plot = connectionPlot(c,day);
    let related = tabs([['events','异常事件'],['labels','标注事项'],['runs','执行记录']],f.tab||'events','Q.resourceTab');
    if (f.tab==='labels') related += labelTable(labels);
    else if(f.tab==='runs') related += runTable(db.tasks.flatMap(t=>t.rounds.map(r=>({...r,task:t.id}))));
    else related += eventTable(all);
    return heading(esc(c.name),c.org+' / '+c.id,actions,'资源详情') + (c.useState==='停用'?notice('资源已停用，历史事件与报告仍保留；停用不代表异常已恢复。','warn'):'') + card('资源信息',info) + '<div class="q-split"><div>' + card('当日连通状态',plot,'<input type="date" aria-label="观察日期" max="'+db.asOf.slice(0,10)+'" value="'+day+'" onchange="Q.trend(this.value)">') + card('',related) + '</div>' + card('当前预览','<div class="q-video">'+icon('camera')+'<span>当前视频流不可用</span><small>请检查视频授权与资源状态</small></div><div class="q-footer">'+btn('查看来源记录',"Q.evidence('"+id+"',true)")+'</div>') + '</div>';
  }
  function eventTable(es) {
    return table(['事件 / 类型','对象 / 通道','恢复状态','首次发现 / 最近观察','观察有效性','关联预警','操作'],es.map(e=>{
      const c=channel(e.channel),w=db.warnings[e.warning],o=last(e);
      return [detailLink(e.id+' · '+e.type,'event',e.id)+(e.human==='已排除'?'<div>'+tag('人工已排除','gray')+'</div>':''),esc(c?.name||e.channel)+'<div class="q-cell-sub">明德食堂 · '+e.channel+'</div>',tag(e.recovered?'已恢复':'未恢复'),'<span class="q-small">'+e.first+'</span><div class="q-cell-sub">'+(o?.at||'—')+'</div>',e.recovered?tag('恢复依据已确认','green'):tag(c?.validity||'待同步'),w?link(w.stage,'warning',{id:w.id,from:e.id}):'<span class="q-sub">'+(e.warningState||'未关联')+'</span>',detailLink('查看详情','event',e.id)];
    }));
  }
  function eventsPage() {
    const state=f.recovery===undefined?'未恢复':f.recovery,human=f.human===undefined?'未排除':f.human;
    let es=db.events.filter(e=>(!state||(state==='已恢复'?e.recovered:!e.recovered))&&(!human||(human==='未排除'?e.human!=='已排除':e.human===human))&&(!f.channel||e.channel===f.channel)&&(!f.type||e.type===f.type)&&(!f.keyword||(e.id+e.channel+channel(e.channel)?.name).includes(f.keyword))&&(!f.validity||channel(e.channel)?.validity===f.validity)&&(!f.warning||(f.warning==='none'?!e.warning:db.warnings[e.warning]?.stage===f.warning)));
    if(f.start||f.end){ const a=D.time((f.start||'2000-01-01')+' 00:00:00'),z=D.time(D.add((f.end||'2099-01-01')+' 00:00:00',86400)); es=es.filter(e=>f.timeType==='首次发现'?D.time(e.first)>=a&&D.time(e.first)<z:f.timeType==='恢复期间'?e.recovered&&D.time(e.recovered)>=a&&D.time(e.recovered)<z:D.time(e.first)<z&&(!e.recovered||D.time(e.recovered)>=a)); }
    es.sort((a,b)=>D.time(a.first)-D.time(b.first));
    const form='<form class="q-filters" onsubmit="Q.eventFilter(event)">'+field('对象 / 通道','<input name="keyword" value="'+esc(f.keyword||'')+'" placeholder="名称、事件或通道编号">','wide')+field('异常类型',select('type',[['','全部'],'离线','黑屏','模糊','遮挡','移位'],f.type))+field('恢复状态',select('recovery',[['','全部'],'未恢复','已恢复'],state))+field('人工核实',select('human',[['','全部'],['未排除','人工未排除'],'未核实','确认异常','已排除','无法判断'],human))+field('观察有效性',select('validity',[['','全部'],'有效','已过期'],f.validity))+field('关联预警',select('warning',[['','全部'],['none','未关联'],'待处置','待复核','已办结'],f.warning))+field('时间条件',select('timeType',['期间涉及','首次发现','恢复期间'],f.timeType||'期间涉及'))+field('开始日期','<input type="date" name="start" value="'+esc(f.start||'')+'">')+field('结束日期','<input type="date" name="end" value="'+esc(f.end||'')+'">')+'<div class="q-filter-actions"><button class="primary" type="submit">查询</button>'+btn('重置','Q.resetFilters()')+'</div>'+'</form>';
    return heading('异常事件','华东运营中心　 ·　 持续异常与历史过程')+card('',form+(f.channel?notice('当前限定通道 '+esc(f.channel)+'。 '+btn('清除通道条件','Q.clearChannel()')):'')+'<div class="q-section-head"><h2>事件记录 <span class="q-pill">首次发现升序</span></h2><span class="q-sub">'+es.length+' 起事件　/　'+new Set(es.map(e=>e.channel)).size+' 路通道</span></div>'+eventTable(slice(es))+pager(es.length));
  }
  function eventPage() {
    const e=db.events.find(e=>e.id===(params.get('id')||'E2'));
    if(!e)return heading('事件详情','')+card('',empty('该事件不存在或不在可访问范围内'));
    const c=channel(e.channel),w=db.warnings[e.warning];
    const action='<a href="'+esc(back('events'))+'">'+(params.get('back')?'返回来源':'返回事件列表')+'</a>'+ (db.permissions.verify?btn('补充核实',"Q.verify('"+e.id+"')"):'') + (db.permissions.diagnose?'<a href="'+esc(url('create',{event:e.id,channel:e.channel,reason:e.type+'异常复检'}))+'">发起复检</a>':'') + (w?'<a class="primary" href="'+esc(url('warning',{id:w.id,from:e.id}))+'">查看预警</a>':db.permissions.warning?btn(e.warningState==='关联待查证'?'核实关联':'发起处置',"Q.warning('"+e.id+"')",true,e.human==='已排除'):'');
    let warnings='';
    if(w?.stage==='已办结'&&!e.recovered&&c.validity==='有效')warnings+=notice('关联预警已办结，但最近有效诊断仍异常，请核对后续处理。','warn');
    if(e.recovered&&w&&w.stage!=='已办结')warnings+=notice('本事件已取得恢复依据；关联预警仍按原流程办理。');
    if(c.validity==='已过期'&&!e.recovered)warnings+=notice('最近观察已过期，本事件尚未取得恢复依据；当前状态不能据此推定。','warn');
    const info=kv([['恢复状态',tag(e.recovered?'已恢复':'未恢复')],['发现时组织','华东运营中心 / 明德食堂'],['通道',detailLink(c.name+' · '+c.id,'resource',c.id)],['首次发现',e.first],['最近观察',last(e)?.at||'—'],['恢复时间',e.recovered||'尚未取得恢复依据'],['恢复依据',esc(e.recoverySource||'—')],['人工核实',tag(e.human)],['观察记录',e.observations.length+' 条']]);
    let timeline=e.observations.map(o=>({at:o.at,kind:'诊断',text:o.value+' · '+o.source,sub:o.round?'执行轮次 '+o.round:(o.source.startsWith('DEV')?'资源状态服务':'画面诊断服务')+' · 独立反馈'}));
    (e.verifications||[]).forEach(v=>timeline.push({at:v.at,kind:'核实',text:v.by+' · '+v.value,sub:v.reason}));
    if(w)w.history.forEach(h=>timeline.push({at:h.at,kind:'处置',text:w.id+' · '+h.stage,sub:'预警中心办理进展'}));
    timeline=timeline.filter(x=>!f.timeline||x.kind===f.timeline).sort((a,b)=>D.time(b.at)-D.time(a.at));
    const tl='<ul class="q-timeline">'+timeline.map(x=>'<li><time>'+x.at+'</time><p>'+esc(x.text)+'</p><div class="q-sub">'+esc(x.sub)+'</div></li>').join('')+'</ul>';
    const warnbox=w?'<h2>'+esc(w.title)+'</h2>'+kv([['预警编号',w.id],['当前阶段',tag(w.stage)],['责任人',w.owner],['更新时间',w.at]],true)+'<div class="q-footer">'+link('进入预警中心','warning',{id:w.id,from:e.id})+'</div>':empty(e.warningState||'该事件尚未关联预警');
    return heading(e.type+'异常 · '+e.id,c.name+'　 /　 '+c.id,action,'异常事件')+warnings+card('事件事实',info+(e.previous?notice('本次为恢复后再发现。前次事件：'+link(e.previous,'event',{id:e.previous})):db.events.some(x=>x.previous===e.id)?notice('已有后续事件：'+db.events.filter(x=>x.previous===e.id).map(x=>link(x.id,'event',{id:x.id})).join('、')):''))+'<div class="q-split"><div>'+card('观察与处理时间线',tabs([['','全部'],['诊断','诊断'],['核实','人工核实'],['处置','处置进展']],f.timeline||'','Q.timeline')+tl)+card('相关执行',runTable(db.tasks.flatMap(t=>t.rounds.filter(r=>e.observations.some(o=>o.round===r.id)).map(r=>({...r,task:t.id})))) )+'</div><div>'+card('发生时证据','<div class="q-video">'+icon('camera')+'<span>历史媒体暂不可用</span><small>'+e.first+'</small></div><div class="q-footer">'+btn('查看证据记录',"Q.evidence('"+e.id+"',false)")+'</div>')+card('关联预警',warnbox)+'</div></div>';
  }
  function labelTable(ls) {
    return table(['对象 / 通道','发现时标注 / 疑似类型','发现时间','核实结论','配置生效进展','最近处理','操作'],ls.map(l=>[esc(channel(l.channel)?.name||l.channel)+'<div class="q-cell-sub">明德食堂 · '+l.channel+'</div>',esc(l.marked)+'　→　<strong>'+esc(l.suspected)+'</strong><div class="q-cell-sub">配置 '+esc(l.version)+'</div>',l.found,tag(l.verdict),tag(l.effect),esc(l.by||'—')+'<div class="q-cell-sub">'+esc(l.verifiedAt||'—')+'</div>','<button class="link" onclick="Q.label(\''+l.id+'\')">'+(db.permissions.label&&pending(l)?'处理核实':'查看记录')+'</button>']));
  }
  function labelsPage() {
    const status=f.status===undefined?'待处理':f.status;
    const ls=db.labels.filter(l=>(!status||(status==='待处理'?pending(l):l.verdict===status||l.effect===status))&&(!f.channel||l.channel===f.channel)&&(!f.keyword||(l.channel+channel(l.channel)?.name).includes(f.keyword))&&(!f.effect||l.effect===f.effect)&&(!f.suspected||l.suspected===f.suspected)&&(!f.marked||l.marked===f.marked)&&(!f.foundStart||l.found.slice(0,10)>=f.foundStart)&&(!f.foundEnd||l.found.slice(0,10)<=f.foundEnd));
    const form='<form class="q-filters" onsubmit="Q.labelFilter(event)">'+field('对象 / 通道','<input name="keyword" value="'+esc(f.keyword||'')+'" placeholder="输入名称或编号">','wide')+field('处理范围',select('status',[['','全部'],'待处理','待核实','标注无误','需修正','无法判断','已生效'],status))+field('疑似类型',select('suspected',[['','全部'],'配餐','粗加工','清洗','烹饪'],f.suspected))+field('发现时标注',select('marked',[['','全部'],'配餐','粗加工','清洗','烹饪'],f.marked))+field('生效进展',select('effect',[['','全部'],'不涉及','待提交','待生效','已生效','写入失败','结果待查证'],f.effect))+field('发现开始日期','<input type="date" name="foundStart" value="'+esc(f.foundStart||'')+'">')+field('发现结束日期','<input type="date" name="foundEnd" value="'+esc(f.foundEnd||'')+'">')+'<div class="q-filter-actions"><button type="submit" class="primary">查询</button>'+btn('重置','Q.resetFilters()')+'</div>'+'</form>';
    return heading('标注核实','华东运营中心　 ·　 核实结论与配置生效分别记录')+card('',form+(f.channel?notice('当前限定通道 '+esc(f.channel)+'。 '+btn('清除通道条件','Q.clearChannel()')):'')+'<div class="q-section-head"><h2>节点标注事项</h2><span class="q-sub">待处理 '+db.labels.filter(pending).length+' 项</span></div>'+labelTable(slice(ls))+pager(ls.length));
  }
  function reportSummary(s) {
    const m=s.metrics;
    return metrics([['期间新发现事件',m.fresh,'起','','Q.reportDetail("fresh")'],['期间恢复事件',m.recovered,'起','','Q.reportDetail("recovered")'],['截止未恢复事件',m.open,'起','amber','Q.reportDetail("open")'],['期间异常通道',m.affected,'路','','Q.reportDetail("involved")']]);
  }
  function snapshotEvents(s, ids) {
    const rows=s.events.filter(e=>!ids||ids.includes(e.id));
    return table(['事件 / 类型','通道','首次发现','恢复时间 / 状态','截止核实','截止关联预警'],rows.map(e=>[esc(e.id+' · '+e.type),esc(e.channel),e.first,e.recovered||tag('未恢复'),tag(e.human),e.warning&&s.warnings[e.warning]?esc(e.warning)+' · '+tag(s.warnings[e.warning].stage):'未关联']));
  }
  function currentSummary(s) {
    const m=s.metrics;
    return '<div class="q-progressline"><span>截止状态分布</span><span class="q-sub">在监测 '+m.total+' 路</span></div><div class="q-bar"><span style="width:'+(m.normal/Math.max(m.total,1)*100)+'%;background:#78b392"></span><span style="width:'+(m.abnormal/Math.max(m.total,1)*100)+'%;background:#dc938a"></span><span style="width:'+(m.unknown/Math.max(m.total,1)*100)+'%;background:#d4dce5"></span></div><div class="q-legend"><span><i style="background:#78b392"></i>正常 '+m.normal+' 路</span><span><i style="background:#dc938a"></i>异常 '+m.abnormal+' 路</span><span><i style="background:#d4dce5"></i>未知 '+m.unknown+' 路</span></div>';
  }
  function reportScope() {
    return {org:'明德食堂',start:f.start||params.get('start')||db.asOf.slice(0,7)+'-01',end:f.end||params.get('end')||db.asOf.slice(0,10)};
  }
  function reportsPage() {
    const scope=reportScope(),s=D.snapshot(db,scope),m=s.metrics;
    let content=tabs([['stats','期间统计'],['history','生成记录']],f.tab||'stats','Q.reportTab');
    if(f.tab==='history'){
      const rs=db.reports.filter(r=>(!f.reportName||r.name.includes(f.reportName))&&(!f.reportStatus||r.status===f.reportStatus));
      content+='<form class="q-filters" onsubmit="Q.reportHistoryFilter(event)">'+field('报告名称','<input name="reportName" placeholder="输入名称" value="'+esc(f.reportName||'')+'">','wide')+field('生成状态',select('reportStatus',[['','全部'],'已生成','生成中','生成失败'],f.reportStatus))+'<div class="q-filter-actions"><button type="submit" class="primary">查询</button>'+btn('重置','Q.resetFilters()')+'</div>'+'</form>'+table(['报告名称 / 编号','统计期间','统计截止','输入封存','生成时间','状态','操作'],slice(rs).map(r=>[esc(r.name)+'<div class="q-cell-sub">'+r.id+' · V'+r.version+'</div>',r.snapshot.start+' 至 '+r.snapshot.end,r.snapshot.cutoff,r.snapshot.sealed,r.created,tag(r.status),r.status==='生成失败'?(db.permissions.report?btn('重试原输入',"Q.retryReport('"+r.id+"')"):'等待授权人员处理'):detailLink('查看报告','report',r.id)]))+pager(rs.length);
    }else{
      content+='<form class="q-filters" onsubmit="Q.reportFilter(event)">'+field('组织范围',select('org',['明德食堂'],'明德食堂'))+field('开始日期','<input type="date" name="start" value="'+scope.start+'">')+field('结束日期','<input type="date" name="end" max="'+db.asOf.slice(0,10)+'" value="'+scope.end+'">')+'<div class="q-filter-actions"><button type="submit" class="primary">查询</button>'+btn('重置','Q.resetFilters()')+'</div>'+'</form><div id="q-page-error" class="q-error-text" role="alert"></div>'+notice('统计截止 '+s.cutoff+'　 ·　 Asia/Shanghai　 ·　 结束日包含全天')+reportSummary(s)+(s.historical?'':notice('该历史截止的完整资源状态不可重建，截止状态以未知披露。','warn'))+'<div class="q-split"><div>'+card('期间事件概况',table(['组织','期间涉及事件','期间恢复','截止未恢复','人工已排除'],[['明德食堂',m.involved+' 起',m.recovered+' 起',m.open+' 起',m.excluded+' 起']]))+'</div>'+card('截止资源状态',currentSummary(s)+'<div class="q-rule"></div><div class="q-progressline"><span>待处理标注</span><strong>'+m.pending+' 项</strong></div><div class="q-sub">按核实事项计数，包含尚未生效的纠错。</div>')+'</div>'+card('期间涉及事件',snapshotEvents(s,m.involvedIds),'<span class="q-sub">当前统计版本的引用明细</span>');
    }
    return heading('质量报告','组织期间统计与固定报告',db.permissions.report?btn('生成报告','Q.generate()',true):'')+card('',content);
  }
  function reportPage() {
    const r=db.reports.find(r=>r.id===(params.get('id')||'QR-001'));
    if(!r)return heading('固定报告','')+card('',empty('报告不存在或不在可访问范围内'));
    if(r.status!=='已生成')return heading('固定报告 · '+r.id,'')+card('',notice(r.status==='生成失败'?'报告生成未完成，原输入已保留，可重试。':'报告正在生成，请稍后查看。','warn')+(db.permissions.report?btn('重试原输入',"Q.retryReport('"+r.id+"')",true):''));
    const s=r.snapshot,m=s.metrics;
    const activeWarn=[...new Set(s.events.map(e=>e.warning).filter(Boolean))];
    const text='在监测通道'+m.total+'路，截至统计时点正常'+m.normal+'路、异常'+m.abnormal+'路、未知'+m.unknown+'路。期间新发现事件'+m.fresh+'起，涉及'+m.involved+'起，其中'+m.recovered+'起取得恢复依据，'+m.open+'起截至时点未取得恢复依据。待处理标注事项'+m.pending+'项。';
    const exportButton=db.permissions.export?btn(r.exportError?'重试导出':'导出PDF',"Q.exportReport('"+r.id+"')",true):'';
    const fixedEvents=s.events.filter(e=>m.involvedIds.includes(e.id));
    const points=fixedEvents.map(e=>{const w=s.warnings[e.warning];return '<p><strong>'+esc(e.id+' · '+e.type)+'</strong>：'+(e.recovered?'已取得恢复依据':'尚未取得恢复依据')+(w?'；关联预警'+esc(w.id)+'处于'+esc(w.stage):'；未关联预警')+'。'+(e.channel==='C3'&&!e.recovered?'最近观察已过期，当前状态未知。':'')+'</p>';}).join('');
    return heading('固定报告 · '+r.id,'保存版本 V'+r.version+'　 ·　 '+r.created,'<a href="'+esc(back('reports'))+'">返回报告列表</a>'+(db.permissions.report?btn('重新生成',"Q.regenerate('"+r.id+"')"):'')+exportButton,'质量报告')+
      (r.exportError?notice('PDF导出未完成，固定正文仍然保留，可重试导出。','error'):'')+
      '<article class="q-report" id="q-report-content"><h1>'+esc(r.name)+'</h1><div class="report-meta">华东运营中心 / '+esc(s.org)+'　 ·　 V'+r.version+'<br>统计期间 '+s.start+' 至 '+s.end+'　　统计截止 '+s.cutoff+'</div>'+kv([['报告编号',r.id],['输入封存时点',s.sealed],['生成时间',r.created],['业务时区','Asia/Shanghai'],['在监测范围',m.total+' 路通道'],['报告状态',tag('已生成')]])+
      '<h2>一、质量概况</h2><p>'+text+'</p>'+currentSummary(s)+'<h2>二、期间事件与重点事项</h2>'+table(['期间新发现','期间涉及','期间恢复','截止未恢复','异常通道'],[[m.fresh+' 起',m.involved+' 起',m.recovered+' 起',m.open+' 起',m.affected+' 路']])+points+
      '<h2>三、标注核实与处置</h2>'+table(['事项','发现时标注','核实结论','生效进展'],s.labels.map(l=>[esc(l.id+' / '+l.channel),esc(l.marked+' / '+l.version),esc(l.verdict),esc(l.effect)]))+table(['关联预警','截止阶段','责任人','状态来源时间'],activeWarn.map(id=>{const w=s.warnings[id];return[esc(id),tag(w?.stage||'待同步'),esc(w?.owner||'—'),esc(w?.at||'—')];}))+
      '<h2>四、覆盖与观察缺口</h2><p>'+(s.coverage?'本范围已配置节点接入要求，接入清单无缺口。接入完成不代表全部通道当前正常。':'本范围未配置接入要求，接入覆盖率不作计算。')+' '+(m.unknown?'存在'+m.unknown+'路状态未知，请结合观察有效性查证。':'截止状态均有有效依据。')+' 观察中断时不将发现至今计作连续故障时长。</p>'+
      '<details><summary>查看本报告引用的固定明细</summary>'+snapshotEvents(s,m.involvedIds)+'<div class="q-footer">'+btn('查看历史证据记录',"Q.evidence('"+(fixedEvents[0]?.id||'E1')+"',false)")+'</div></details><h2>五、后续跟进</h2><p>按事件核对恢复依据，关联预警继续依原流程办理；节点纠错以真实生效结果为准。以上正文与引用数据保留本次封存口径。</p><div class="q-actions">'+link('查看当前监测','monitor')+activeWarn.map(id=>link('查看当前预警 '+id,'warning',{id})).join('')+'</div></article>';
  }
  function runTable(rs) { if(unit)return table(['轮次','实际开始 / 结束','执行状态','操作'],rs.map(r=>[esc(r.id),esc(r.at)+'<div class="q-cell-sub">'+esc(r.end||'尚未结束')+'</div>',tag(r.state),link('查看执行','task',{id:r.task||'QT-001',round:r.id})]));return table(['轮次','实际开始 / 结束','执行状态','单轮总token','统计状态','操作'],rs.map(r=>[esc(r.id),r.at+'<div class="q-cell-sub">'+esc(r.end||'尚未结束')+'</div>',tag(r.state),r.token===null?'—':Number(r.token).toLocaleString(),tag(r.tokenState),link('查看执行','task',{id:r.task||'QT-001',round:r.id})])); }
  function tasksPage() {
    const ts=db.tasks.filter(t=>(!f.keyword||(t.name+t.id).includes(f.keyword))&&(!f.taskState||t.state===f.taskState));
    const form='<form class="q-filters" onsubmit="Q.taskFilter(event)">'+field('业务类型',select('business',['视频质量','后厨风险'],'视频质量','Q.switchBusiness(this.value)'))+field('任务名称 / 编号','<input name="keyword" value="'+esc(f.keyword||'')+'" placeholder="输入名称或编号">','wide')+field('任务状态',select('taskState',[['','全部'],'执行中','待执行','受理待查证','执行结束'],f.taskState))+'<button type="submit" class="primary">查询</button>'+btn('重置','Q.resetFilters()')+'</form>';
    return heading('巡检任务','视频质量诊断安排与实际执行',(db.permissions.diagnose?'<a class="primary" href="'+esc(url('create'))+'">＋ 发起诊断</a>':'') )+card('',form+table(['任务名称 / 编号','执行安排','对象 / 内容','状态','最近执行','创建时间','操作'],slice(ts).map(t=>[detailLink(esc(t.name),'task',t.id)+'<div class="q-cell-sub">'+t.id+'</div>',esc(t.type)+(t.type==='循环'?'<div class="q-cell-sub">'+t.start+'—'+t.end+'<br>'+esc(t.cycle)+'</div>':'<div class="q-cell-sub">'+esc(t.date||'立即执行')+'</div>'),t.channels.length+' 路 / '+t.content.length+' 项',tag(t.state),t.rounds[0]?.at||'等待实际执行',t.created,detailLink('查看执行','task',t.id)]))+pager(ts.length));
  }
  function initDraft() {
    if(draft)return;
    draft={step:1,name:params.get('event')?'异常复检 · '+params.get('event'):'视频质量专项诊断',content:['视频连通检查','画面质量诊断'],channels:params.get('channel')?[params.get('channel')]:[],issuedOrgIds:params.get('channel')?[qualityOrgNodes().find(n=>n.name===channel(params.get('channel'))?.org)?.id].filter(Boolean):[],type:'单次',trigger:'立即执行',date:db.asOf.slice(0,10),start:db.asOf.slice(0,10),end:'2026-11-27',cycle:'每天',days:['1','2','3','4','5'],reason:params.get('reason')||'视频资源质量检查',event:params.get('event')||'',accept:false};
  }
  function dates(d) {
    if(d.type!=='循环')return[d.date];
    const a=new Date(d.start+'T00:00:00Z'),z=new Date(d.end+'T00:00:00Z'),out=[];
    while(a<=z&&out.length<4000){const wd=String(a.getUTCDay());if(d.cycle==='每天'||(d.cycle==='仅工作日'&&!['0','6'].includes(wd))||(d.cycle==='自定义'&&d.days.includes(wd)))out.push(a.toISOString().slice(0,10));a.setUTCDate(a.getUTCDate()+1);}
    return out;
  }
  function qualityOrgNodes(){return OrgPicker.qualityDirectory(db.channels,allBoxes());}
  function selectedIssueNames(){const ns=qualityOrgNodes();return ns.filter(n=>n.type==='unit'&&OrgPicker.covered(n.id,draft.issuedOrgIds||[],ns)).map(n=>n.name);}
  function issueChannels(){const names=selectedIssueNames();return db.channels.filter(c=>names.includes(c.org));}
  function actualExecutionChannels(){const requested=db.channels.filter(c=>draft.channels.includes(c.id));if(db.requests.scope!=='store')return requested;const names=[...new Set(requested.map(c=>c.org))];return issueChannels().filter(c=>names.includes(c.org));}
  function qualityScopeError(){const d=draft,ns=qualityOrgNodes();if(!d.issuedOrgIds?.length)return '请选择下发组织。';if(d.issuedOrgIds.some(id=>!ns.some(n=>n.id===id)))return '下发组织已不在当前授权范围，请重新选择。';const cs=issueChannels();if(!d.channels.length)return '请在下发组织范围内选择执行通道。';if(d.channels.some(id=>!cs.some(c=>c.id===id)))return '执行通道超出下发组织范围，请重新核对。';if(d.event){const e=db.events.find(e=>e.id===d.event);if(!e||!actualExecutionChannels().some(c=>c.id===e.channel))return '实际复检范围须包含来源事件的通道，请重新核对。';}return '';}
  function issueSnapshot(){const ns=qualityOrgNodes();return {directoryVersion:'ORG-QUALITY-20261028',organizations:OrgPicker.normalize(draft.issuedOrgIds||[],ns).map(id=>({id,name:ns.find(n=>n.id===id).name})),channels:actualExecutionChannels().map(c=>({id:c.id,org:c.org}))};}
  function issueSection(){const d=draft,ns=qualityOrgNodes(),cs=issueChannels(),orgs=selectedIssueNames();return '<div class="org-scope quality-org-scope"><div class="q-section-head"><div><label>下发组织 *</label><p>'+esc(d.issuedOrgIds?.length?OrgPicker.labels(d.issuedOrgIds,ns):'尚未选择下发组织')+'</p></div>'+btn('选择组织','Q.pickIssueOrganizations()')+'</div><label>执行通道 * <span class="q-sub">仅显示所选组织中的授权通道</span></label>'+(cs.length?'<label class="q-check"><input type="checkbox" aria-label="全选当前范围通道"'+(cs.every(c=>d.channels.includes(c.id))?' checked':'')+' onchange="Q.selectIssueChannels(this.checked)">全选当前范围</label><div class="quality-channel-list">'+orgs.map(org=>'<strong>'+esc(org)+'</strong><div class="q-row">'+cs.filter(c=>c.org===org).map(c=>'<label class="q-check"><input type="checkbox" name="channels" value="'+esc(c.id)+'"'+(d.channels.includes(c.id)?' checked':'')+'>'+esc(c.name)+' · '+esc(c.id)+'</label>').join('')+'</div>').join('')+'</div>':empty('先选择下发组织，再选择执行通道。'))+'</div>';}
  function createPage() {
    initDraft(); const d=draft;
    let body='<div class="q-steps">'+['选择检查内容','对象与执行安排','核对并发起'].map((n,i)=>'<span class="'+(d.step===i+1?'active':'')+'"><b class="q-stepnum">'+(i+1)+'</b>'+n+'</span>').join('')+'</div>';
    const backLink=params.get('event')?url('event',{id:params.get('event')}):url('monitor');
    if(d.step===1)body+=card('检查内容','<form id="q-wizard"><div class="q-formgrid">'+field('任务名称 *','<input name="name" maxlength="100" value="'+esc(d.name)+'">','full')+field('业务类型','<input value="视频质量" disabled>')+field('任务目的 / 复检原因 *','<input name="reason" maxlength="1000" value="'+esc(d.reason)+'">')+'</div><div class="q-rule"></div>'+['视频连通检查','画面质量诊断','节点标注核对'].map((n,i)=>'<label class="q-fieldset q-check"><input type="checkbox" name="content" value="'+n+'"'+(d.content.includes(n)?' checked':'')+'><span><strong>'+n+'</strong><br><span class="q-sub">'+['检查已接入通道的连通和取流情况。','检查黑屏、模糊等已配置画面质量项。','核对画面场景与节点类型标注。'][i]+'　生效版本 V1　·　支持通道粒度</span></span></label>').join('')+'</form>');
    if(d.step===2)body+=card('对象与执行安排','<form id="q-wizard">'+issueSection()+'<div class="q-rule"></div><div class="q-formgrid">'+field('执行类型 *',select('type',['单次','循环'],d.type,'Q.wizardType()'))+(d.type==='单次'?field('触发方式 *',select('trigger',['立即执行','指定日期'],d.trigger,'Q.wizardType()'))+(d.trigger==='指定日期'?field('执行日期 *','<input type="date" name="date" min="'+db.asOf.slice(0,10)+'" value="'+d.date+'">'):''):field('执行周期 *',select('cycle',['每天','仅工作日','自定义'],d.cycle,'Q.wizardType()'))+field('生效开始日期 *','<input type="date" name="start" min="'+db.asOf.slice(0,10)+'" value="'+d.start+'">')+field('生效结束日期 *','<input type="date" name="end" value="'+d.end+'">')+(d.cycle==='自定义'?'<div class="full q-row">'+[['1','周一'],['2','周二'],['3','周三'],['4','周四'],['5','周五'],['6','周六'],['0','周日']].map(([v,n])=>'<label class="q-check"><input type="checkbox" name="days" value="'+v+'"'+(d.days.includes(v)?' checked':'')+'>'+n+'</label>').join('')+'</div>':''))+'</div>'+(d.cycle==='仅工作日'&&d.type==='循环'?notice('工作日按周一至周五，不含法定节假日及调休识别。'):'')+notice('检查安排 V1：执行时段全天，单次观察窗口5分钟；本轮检查完成或超时后结束。循环频率沿用所选检查项的生效安排。')+'</form>');
    if(d.step===3){
      const ds=dates(d),actual=actualExecutionChannels(),expand=actual.length!==d.channels.length,unknown=actual.filter(c=>c.state==='未知').length;
      body+=card('核对诊断范围',kv([['任务名称',esc(d.name)],['下发组织',esc(OrgPicker.labels(d.issuedOrgIds,qualityOrgNodes()))],['检查内容',d.content.map(esc).join('、')],['请求通道',d.channels.map(esc).join('、')],['实际执行范围',actual.length+' 路：'+actual.map(c=>esc(c.id)).join('、')],['执行安排',d.type==='循环'?d.start+'—'+d.end+' / '+d.cycle:d.trigger+(d.trigger==='指定日期'?' / '+d.date:'')],['来源事件',esc(d.event||'无')]])+(d.type==='循环'?notice('命中 '+ds.length+' 个日期：'+ds.slice(0,8).join('、')+(ds.length>8?' 等':'')+'。实际轮次以执行记录为准。'):'')+(expand?notice('检查能力按单位执行，实际范围扩大至 '+actual.length+' 路通道，仍限定在已选下发组织内。','warn'):'')+(unknown?notice('实际范围有 '+unknown+' 路通道最近状态未知，执行中保留实际观察缺口。','warn'):'')+((expand||unknown)?'<label class="q-check"><input type="checkbox" id="q-accept">我已核对实际执行范围及以上缺口</label>':'')+'<div class="q-rule"></div><div class="q-sub">本次只发起诊断，不直接改变事件恢复状态或关联预警的办理状态。</div>');
    }
    body+='<div id="q-page-error" class="q-error-text" role="alert"></div><div class="q-footer"><a href="'+esc(backLink)+'">取消</a>'+(d.step>1?btn('上一步','Q.wizardPrev()'):'')+btn(d.step===3?'确认发起':'下一步',d.step===3?'Q.submitTask()':'Q.wizardNext()',true)+'</div>';
    return heading(d.event?'发起复检':'发起视频质量诊断','按已配置检查内容安排单次或循环诊断')+body;
  }
  function taskPage() {
    const t=db.tasks.find(t=>t.id===(params.get('id')||'QT-001'));if(!t)return heading('执行详情','')+card('',empty('该任务不存在'));
    const picked=params.get('round')||f.round;
    let rs=t.rounds.filter(r=>(!f.runStart||r.at.slice(0,10)>=f.runStart)&&(!f.runEnd||r.at.slice(0,10)<=f.runEnd));
    const selected=rs.find(r=>r.id===picked)||slice(rs)[0];
    const h=heading(esc(t.name),t.id+'　 ·　 '+tag(t.state),'<a href="'+esc(back('tasks'))+'">返回任务列表</a>'+(t.event?link('返回来源事件','event',{id:t.event}):link('返回质量监测','monitor')));
    const info=card('任务安排',kv([['执行类型',esc(t.type)],['生效 / 执行日期',t.type==='循环'?t.start+'—'+t.end:esc(t.date||'立即执行')],['周期',esc(t.cycle||'单次')],['检查内容',t.content.map(esc).join('、')],['下发组织',unit?esc(access.profile.org):esc(t.issuedTo?.organizations.map(n=>n.name).join('、')||'历史记录未保存')],['实际对象',t.channels.join('、')],['发起原因',esc(t.reason)]]));
    if(t.state==='受理待查证')return h+info+card('',notice('本次发起的受理结果待查证，请先核实同一发起意图，避免重复下发。','warn')+(db.permissions.diagnose?btn('核实受理结果',"Q.checkTask('"+t.id+"')",true):''));
    const filter='<form class="q-filters" onsubmit="Q.runFilter(event)">'+field('实际开始日期','<input type="date" name="runStart" value="'+esc(f.runStart||'')+'">')+field('实际结束日期','<input type="date" name="runEnd" value="'+esc(f.runEnd||'')+'">')+'<button class="primary" type="submit">查询</button></form>';
    const rounds=card('实际执行轮次',t.rounds.length?filter+runTable(slice(rs).map(r=>({...r,task:t.id})))+pager(rs.length):empty('任务已受理，等待实际执行与轮次反馈'));
    const units=selected?card('本轮执行内容 · '+selected.id,table(['通道','执行结果','结果依据','关联发现'],t.channels.map(id=>{
      const c=channel(id),e=db.events.find(e=>e.channel===id&&e.observations.some(o=>o.round===selected.id)),o=e?.observations.filter(o=>o.round===selected.id).at(-1);
      const value=o?(o.value==='已恢复'?'正常':o.value):'未形成有效结果';
      return [esc(c?.name||id)+'<div class="q-cell-sub">'+id+'</div>',tag(value),o?'本轮观察 '+o.at:'本轮未取得可核对的诊断明细',e?detailLink(e.id+' · '+e.type,'event',e.id):'—'];
    }))+(unit?'':notice('单轮总token：'+(selected.token===null?'待回传':Number(selected.token).toLocaleString())+'　 ·　 '+selected.tokenState+'。执行结束与用量结算分别记录。'))):'';
    return h+info+(t.type==='循环'?notice('循环仍在生效期内，最近一轮结束后继续等待后续安排。实际执行按日期查询，事件可跨轮持续。'):'')+rounds+units;
  }
  function warningPage() {
    const w=db.warnings[params.get('id')||'W1'];if(!w)return heading('预警详情','')+card('',empty('预警不存在或关联尚未明确'));
    return heading(esc(w.title),'预警中心 / '+w.id,'<a href="'+esc(url('event',{id:params.get('from')||w.event}))+'">返回来源事件</a>')+card('基本信息',kv([['预警编号',w.id],['当前阶段',tag(w.stage)],['来源类型','视频质量'],['责任人',esc(w.owner)],['办理时限',esc(w.due)],['状态更新时间',w.at],['来源事件',detailLink(w.event,'event',w.event)],['资源组织','明德食堂'],['办理权限','当前账号仅可查看']]))+card('办理进展','<ul class="q-timeline">'+w.history.slice().reverse().map(h=>'<li><time>'+h.at+'</time><p>'+esc(h.stage)+'</p><div class="q-sub">预警中心办理记录</div></li>').join('')+'</ul>')+notice('整改及复核由对应责任角色在预警中心办理。视频恢复与预警办结分别记录。');
  }
  function collect(form) { return Object.fromEntries(new FormData(form).entries()); }
  function fillFilter(event) { event.preventDefault(); Object.assign(f,collect(event.target),{page:0}); render(); }
  function wizardCollect() {
    const el=document.getElementById('q-wizard');if(!el)return;
    const a=new FormData(el);
    if(draft.step===1){draft.name=String(a.get('name')||'').trim();draft.reason=String(a.get('reason')||'').trim();draft.content=a.getAll('content');}
    if(draft.step===2){draft.channels=a.getAll('channels');['type','trigger','date','start','end','cycle'].forEach(k=>{if(a.has(k))draft[k]=a.get(k);});if(draft.cycle==='自定义')draft.days=a.getAll('days');}
  }
  function validateWizard() {
    const d=draft;
    if(d.step===1&&(!d.name||!d.reason||!d.content.length))return '请填写任务名称、原因，并至少选择一项检查内容。';
    if(d.step>=2){const scopeError=qualityScopeError();if(scopeError)return scopeError;
      if(!d.channels.length)return '请至少选择一路通道。';if(d.channels.some(id=>channel(id)?.useState==='停用'))return '所选资源已停用，请调整为可执行资源。';
      if(d.type==='循环'){
        if(!d.start||!d.end||d.start>d.end)return '生效开始日期不得晚于结束日期。';
        if(d.start<db.asOf.slice(0,10))return '新建循环不追溯执行过去日期，请调整开始日期。';
        if(d.cycle==='自定义'&&!d.days.length)return '自定义周期至少选择一个星期。';
        if(!dates(d).length)return '当前区间没有命中执行日期，请调整周期。';
      }else if(d.trigger==='指定日期'&&(!d.date||d.date<db.asOf.slice(0,10)))return '请选择今天或之后的执行日期。';
      if(db.requests.capability==='none')return '当前所选对象没有可执行检查能力，请调整范围或检查内容。';
    }
    return '';
  }
  let correctionBase=null, verifyBase=0, reportBase='';
  const Q = {
    go:navigate,close,closeDrawer,
    keepEditing(){document.getElementById('q-confirm').close();},
    discard(target){document.getElementById('q-confirm').close();target==='drawer'?closeDrawer(true):close(true);},
    page(n){f.page=Math.max(0,(f.page||0)+n);render();},
    pageSize(v){f.size=parseInt(v,10);f.page=0;render();},
    resetFilters(){Object.keys(f).forEach(k=>delete f[k]);['channel','start','end','state','round'].forEach(k=>params.delete(k));history.replaceState(null,'',location.pathname+(params.toString()?'?'+params:''));render();},
    clearChannel(){delete f.channel;params.delete('channel');history.replaceState(null,'',location.pathname+(params.toString()?'?'+params:''));render();},
    refresh(){db.requests.query='ok';save();render();toast('已重新查询，来源数据截至 '+db.asOf);},
    monitorTab(v){f.tab=v;render();},
    monitorView(v){f.view=v;f.page=0;render();},
    monitorState(v){f.view='channels';f.state=v;f.tab='status';f.page=0;delete f.box;delete f.keyword;delete f.priority;render();},
    devicePage(n){f.devicePage=Math.max(0,(f.devicePage||0)+n);render();document.querySelector('.q-fleet-toolbar')?.scrollIntoView({block:'start'});},
    devicePriority(value){f.priority=value;f.devicePage=0;render();},
    deviceSort(value){f.sort=value;f.devicePage=0;render();},
    boxFilter(value){f.box=value;f.view='devices';f.tab='status';f.page=0;f.devicePage=0;render();},
    monitorFilter(event){f.devicePage=0;fillFilter(event);},eventFilter(event){const a=collect(event.target);if(a.start&&a.end&&a.start>a.end){event.preventDefault();toast('开始日期不得晚于结束日期');return;}fillFilter(event);},
    labelFilter(event){const a=collect(event.target);if(a.foundStart&&a.foundEnd&&a.foundStart>a.foundEnd){event.preventDefault();return toast('发现开始日期不得晚于结束日期');}fillFilter(event);},taskFilter:fillFilter,reportHistoryFilter:fillFilter,
    reportFilter(event){event.preventDefault();const a=collect(event.target);if(!a.start||!a.end||a.start>a.end||a.end>db.asOf.slice(0,10))return error('请核对统计期间，不得倒置或包含未来日期。');Object.assign(f,a);render();},
    runFilter(event){event.preventDefault();const a=collect(event.target);if(a.runStart&&a.runEnd&&a.runStart>a.runEnd)return toast('开始日期不得晚于结束日期');Object.assign(f,a);f.page=0;delete f.round;render();},
    coverageDetail(v){f.coverageType=v;render();},
    resourceTab(v){f.tab=v;render();},
    trend(v){f.trend=v;delete f.connectionIndex;render();},
    connectionWindow(index){f.connectionIndex=index;render();document.querySelector('.q-connection-segment[aria-pressed="true"]')?.focus({preventScroll:true});},
    timeline(v){f.timeline=v;render();},
    reportTab(v){f.tab=v;render();},
    switchBusiness(v){if(v==='后厨风险')location.href=new URL('index.html',riskBase).href;},
    evidence(id,current){
      const fixed=route==='report'?db.reports.find(r=>r.id===(params.get('id')||'QR-001'))?.snapshot:null;
      const e=(fixed?.events||db.events).find(e=>e.id===id),l=(fixed?.labels||db.labels).find(l=>l.id===id),c=(fixed?.channels||db.channels).find(c=>c.id===(e?.channel||l?.channel||id));
      modal(current?'当前预览 · '+esc(c?.id||id):'发生时证据 · '+esc(id),'<div class="q-video">'+icon('camera')+'<span>'+(current?'当前视频授权不可用':'该条历史媒体暂不可用')+'</span><small>'+(current?'可核对最近诊断及来源记录':'文字诊断与发生时依据仍可查看')+'</small></div><div class="q-rule"></div>'+kv([['资源',esc(c?.name||id)],['时间',current?esc(c?.last||'—'):esc(e?.first||l?.found||'—')],['来源',current?'视频资源服务':'诊断 / 资源状态服务']],false)+(l?'<div class="q-rule"></div>'+kv([['发现时标注',esc(l.marked)],['发现时版本',esc(l.version)],['疑似类型',esc(l.suspected)]]):'')+(e?'<div class="q-rule"></div>'+table(['观察时间','诊断事实','来源记录','执行关联'],e.observations.map(o=>[o.at,esc(o.value),esc(o.source),esc(o.round||'独立资源反馈')])):''));
    },
    verify(id){
      if(!db.permissions.verify)return toast('当前账号没有事件核实权限');
      const e=db.events.find(e=>e.id===id);verifyBase=e.verifications.length;
      modal('补充事件核实',kv([['事件',esc(e.id+' / '+e.type)],['资源',esc(e.channel)],['原核实结论',tag(e.human)]])+field('核实结论 *',select('v_value',[['','请选择'],'确认异常','已排除','无法判断'],e.human==='未核实'?'':e.human))+field('原因与依据 *','<textarea name="v_reason" maxlength="1000" placeholder="请说明证据及判断依据"></textarea>')+(e.warning?notice('核实记录将保留，关联预警仍按原流程办理。','warn'):''),btn('保存核实',"Q.saveVerify('"+id+"')",true));
    },
    saveVerify(id){
      const value=document.querySelector('[name=v_value]').value,reason=document.querySelector('[name=v_reason]').value.trim();
      if(!value||!reason)return error('请选择核实结论并填写原因与依据。');
      const latest=D.read(),e=latest.events.find(e=>e.id===id);if(e.verifications.length!==verifyBase)return error('核实记录已被更新，请关闭后重新核对。');
      db=latest;const at=D.tick(db);e.human=value;e.verifications.push({at,value,reason,by:'陈静'});save();close(true);render();toast('已保存核实记录，原诊断与预警关联保留。');
    },
    warning(id){
      if(!db.permissions.warning)return toast('当前账号没有发起预警权限');
      const e=db.events.find(e=>e.id===id);
      if(e.warning)return navigate('warning',{id:e.warning,from:id});
      if(e.human==='已排除')return toast('该事件已排除，请先重新核实再发起处置。');
      if(e.warningState==='关联待查证')return modal('核实预警关联',notice('原发起意图已保留。请查证是否已受理，不要重复创建。','warn')+kv([['事件',id],['发起意图',esc(e.warningIntent)],['关联状态',tag(e.warningState)]]),btn('核实关联',"Q.checkWarning('"+id+"')",true));
      const noRule=db.requests.warning==='norule';
      modal('发起或关联预警',kv([['来源事件',esc(e.id+' / '+e.type)],['资源',esc(e.channel)],['已有有效预警','未查询到对应有效预警']])+ (noRule?notice('当前范围尚无匹配的有效质量预警规则或责任配置，请联系有权限人员完善。','warn'):field('预警规则',select('warning_rule',['视频质量异常处理 · V1'],'视频质量异常处理 · V1'))+notice('责任：明德食堂负责人　 ·　 办理流程：整改 → 复核'))+field('处置说明 *','<textarea name="w_reason" maxlength="1000" placeholder="说明需要责任人跟进的情况"></textarea>')+'<label class="q-check"><input id="w_confirm" type="checkbox">已核对证据，确认需要责任人跟进</label>',btn('发起处置',"Q.createWarning('"+id+"')",true,noRule));
    },
    createWarning(id){
      const e=db.events.find(e=>e.id===id),reason=document.querySelector('[name=w_reason]').value.trim();
      if(!reason||!document.getElementById('w_confirm').checked)return error('请填写处置说明，并确认需要责任人跟进。');
      if(e.warning||e.warningIntent)return error('该事件已有发起意图，请先核实关联。');
      const at=D.tick(db),wid='W'+(Object.keys(db.warnings).length+1);
      db.warnings[wid]={id:wid,event:id,title:'明德食堂'+e.type+'异常处理',stage:'待处置',owner:'明德食堂负责人',due:'2026-10-28 18:00',at,reason,history:[{at,stage:'待处置'}]};
      e.warningIntent='WR-'+wid;
      if(db.requests.warning==='unknown'){e.pendingWarning=wid;e.warningState='关联待查证';}
      else {e.warning=wid;e.warningState='已关联';}
      save();close(true);render();toast(e.warning?'已关联预警 '+wid+'，后续由责任角色办理。':'预警受理结果待查证，原发起意图已保留。');
    },
    checkWarning(id){const e=db.events.find(e=>e.id===id);if(e.pendingWarning&&db.warnings[e.pendingWarning]){e.warning=e.pendingWarning;delete e.pendingWarning;e.warningState='已关联';D.tick(db);save();close(true);render();toast('已查证原发起意图，关联预警 '+e.warning+'。');}else error('暂未取得明确受理结果，原意图继续保留。');},
    label(id){
      if(unit){const l=db.labels.find(x=>x.id===id),c=l&&channel(l.channel);if(!l||!c)return toast('该记录不存在或不在授权范围内');return drawer('本单位标注核实记录',kv([['资源',esc(c.name+' / '+c.id)],['发现时标注',esc(l.marked+' / '+l.version)],['疑似类型',esc(l.suspected)],['核实结论',tag(l.verdict)],['原因与依据',esc(l.reason||'尚未核实')],['配置生效进展',tag(l.effect)]],true)+'<ul class="q-timeline">'+l.history.map(h=>'<li><time>'+h.at+'</time><p>'+esc(h.text)+'</p></li>').join('')+'</ul>');}

      const l=db.labels.find(l=>l.id===id);if(!l)return;
      const c=channel(l.channel),locked=['待生效','结果待查证'].includes(l.effect);
      drawer('节点标注核实 · '+id,kv([['资源',esc(c.name+' / '+c.id)],['发现时间',l.found],['发现时标注',esc(l.marked+' / '+l.version)],['疑似类型',esc(l.suspected)],['当前配置',esc(c.node+' / '+c.version)],['配置生效进展',tag(l.effect)]],true)+'<div class="q-rule"></div><div class="q-video" style="min-height:140px">'+icon('camera')+'<span>发生时媒体暂不可用</span><small>'+l.found+'</small></div><div class="q-footer">'+btn('查看证据记录',"Q.evidence('"+l.id+"',false)")+'</div><div class="q-rule"></div>'+(locked?notice('配置已提交，请先查询生效结果；当前保留已核实结论。'): '')+'<form id="q-label-form">'+field('核实结论 *',select('l_value',[['','请选择'],'标注无误','需修正','无法判断'],l.verdict==='待核实'?'':l.verdict))+field('原因与依据 *','<textarea name="l_reason" maxlength="1000"'+(locked?' disabled':'')+'>'+esc(l.reason||'')+'</textarea>')+'</form><div id="q-label-error" class="q-error-text" role="alert"></div><div class="q-footer">'+(!locked&&db.permissions.label?btn('保存核实',"Q.saveLabel('"+id+"')",true):'')+(l.verdict==='需修正'&&db.permissions.configure&&!locked?btn('纠正配置',"Q.correct('"+id+"')"):'')+(locked?btn('查询生效结果',"Q.pollCorrection('"+id+"')",true):'')+'</div><div class="q-rule"></div><h3 class="q-small">核实与变更记录</h3><ul class="q-timeline">'+l.history.slice().reverse().map(h=>'<li><time>'+h.at+'</time><p>'+esc(h.text)+'</p></li>').join('')+'</ul>');
      if(locked)document.querySelector('[name=l_value]').disabled=true;
      drawerDirtyBase=valuesIn(document.getElementById('q-drawer'));
    },
    saveLabel(id){
      const value=document.querySelector('[name=l_value]').value,reason=document.querySelector('[name=l_reason]').value.trim(),el=document.getElementById('q-label-error');
      if(!value||!reason){el.textContent='请选择核实结论并填写原因与依据。';return;}
      const l=db.labels.find(l=>l.id===id),at=D.tick(db);l.verdict=value;l.reason=reason;l.verifiedAt=at;l.by='陈静';if(value==='需修正'&&!['待生效','已生效'].includes(l.effect))l.effect='待提交';else if(value!=='需修正'&&!['待生效','已生效'].includes(l.effect))l.effect='不涉及';l.history.push({at,text:'陈静核实：'+value+'；'+reason});save();closeDrawer(true);render();Q.label(id);toast('已保存节点核实结论。');
    },
    correct(id){
      if(!db.permissions.configure)return toast('当前账号没有节点配置修改权限');
      const l=db.labels.find(l=>l.id===id),c=channel(l.channel);
      correctionBase={id,version:c.version};
      modal('纠正节点配置',kv([['资源',esc(c.name+' / '+c.id)],['当前类型 / 版本',esc(c.node+' / '+c.version)],['核实结论',tag(l.verdict)]])+field('新节点类型 *',select('c_node',['配餐','粗加工','清洗','烹饪'],l.target||l.suspected))+field('别名','<input name="c_alias" maxlength="50" value="'+esc(c.name)+'">')+field('修改原因 *','<textarea name="c_reason" maxlength="1000">'+esc(l.reason||'')+'</textarea>')+notice('修改生效后用于后续执行；历史任务、发生时依据及报告不会自动改写。'),btn('确认修改',"Q.commitCorrection('"+id+"')",true));
    },
    commitCorrection(id){
      const l=db.labels.find(l=>l.id===id),c=channel(l.channel),node=document.querySelector('[name=c_node]').value,alias=document.querySelector('[name=c_alias]').value.trim(),reason=document.querySelector('[name=c_reason]').value.trim();
      if(!reason||!alias)return error('请填写别名和修改原因。');
      if(node===c.node&&alias===c.name)return error('类型和别名均未变化，请核对需要修改的内容。');
      if(db.requests.correction==='conflict'){db.requests.correction='ok';c.version='N4';c.node='烹饪';D.tick(db);save();return error('当前配置已被更新为烹饪 / N4，请关闭后重新核对差异。');}
      if(c.version!==correctionBase.version)return error('当前配置版本已变化，请重新核对。');
      const at=D.tick(db);l.target=node;l.targetAlias=alias;l.targetVersion='N'+(Number(c.version.replace(/\D/g,''))+1);l.writeRequest=l.writeRequest||'CFG-'+id+'-'+at.replace(/\D/g,'');l.reason=reason;
      if(db.requests.correction==='error'){l.effect='写入失败';l.history.push({at,text:'配置写入失败，输入保留'});db.requests.correction='ok';save();return error('配置写入未成功，输入已保留，请核对后重试原意图。');}
      l.writtenAt=at;l.effect=db.requests.correction==='unknown'?'结果待查证':'待生效';l.correctionReceipt={node,alias,version:l.targetVersion};l.history.push({at,text:'提交配置纠错：'+c.node+' → '+node+'；'+l.effect});save();close(true);closeDrawer(true);render();Q.label(id);toast('已提交配置纠错，尚未标为已修正。');
    },
    pollCorrection(id){
      const l=db.labels.find(l=>l.id===id);
      if(!l.correctionReceipt)return toast('已查询：暂未取得新的生效反馈，继续保留待生效。');
      const c=channel(l.channel),at=D.tick(db),r=l.correctionReceipt;
      c.node=r.node;c.name=r.alias;c.version=r.version;c.history.push({at,state:c.state,picture:c.picture,connection:c.connection,last:c.last,validity:c.validity,reason:c.reason,node:c.node,name:c.name,version:c.version});
      l.effect='已生效';l.effectiveAt=at;l.history.push({at,text:'权威配置已确认生效：'+c.version});delete l.correctionReceipt;save();closeDrawer(true);render();Q.label(id);toast('已取得生效反馈，节点配置已修正。');
    },
    pickIssueOrganizations(){wizardCollect();OrgPicker.open(qualityOrgNodes(),draft.issuedOrgIds||[],ids=>{draft.issuedOrgIds=ids;const cs=issueChannels();draft.channels=draft.channels.filter(id=>cs.some(c=>c.id===id));draft.accept=false;render();});},
    selectIssueChannels(checked){wizardCollect();draft.channels=checked?issueChannels().map(c=>c.id):[];render();},
    wizardType(){wizardCollect();render();},
    wizardNext(){wizardCollect();const e=validateWizard();if(e)return error(e);draft.step++;render();},
    wizardPrev(){wizardCollect();draft.step--;render();},
    submitTask(){
      if(!db.permissions.diagnose)return error('当前账号没有诊断发起权限。');
      const scopeError=validateWizard();if(scopeError)return error(scopeError);const d=draft,actual=actualExecutionChannels(),expand=actual.length!==d.channels.length,accept=expand||actual.some(c=>c.state==='未知');
      if(accept&&!document.getElementById('q-accept')?.checked)return error('请先确认实际执行范围及已知缺口。');
      if(d.sent)return;
      d.sent=true;
      const at=D.tick(db),id='QT-'+String(db.tasks.length+1).padStart(3,'0'),unknown=db.requests.submit==='unknown';
      db.tasks.unshift({id,name:d.name,type:d.type,state:unknown?'受理待查证':'待执行',start:d.start,end:d.end,date:d.type==='单次'&&d.trigger==='指定日期'?d.date:null,cycle:d.type==='循环'?d.cycle:'',content:d.content.slice(),issuedTo:issueSnapshot(),channels:actual.map(c=>c.id),created:at,reason:d.reason,event:d.event,rounds:[],request:'REQ-'+id});
      save();navigate('task',{id});
    },
    checkTask(id){const t=db.tasks.find(t=>t.id===id);t.state='待执行';D.tick(db);save();render();toast('已查证原发起意图，任务已受理，等待实际执行。');},
    reportDetail(kind){
      const s=D.snapshot(db,reportScope()),m=s.metrics,ids=kind==='fresh'?m.freshIds:kind==='recovered'?m.recoveredIds:kind==='open'?m.openIds:m.involvedIds;
      modal('统计引用明细',notice('组织：'+s.org+'　 ·　 截止 '+s.cutoff)+snapshotEvents(s,ids),'',1000);
    },
    generate(){
      if(!db.permissions.report)return toast('当前账号没有报告生成权限');
      const scope=reportScope();
      if(scope.start>scope.end||scope.end>db.asOf.slice(0,10))return toast('请先核对有效的统计期间。');
      if(db.requests.query==='error')return toast('范围数据尚未核定，请先成功查询后生成。');
      preview=D.snapshot(db,scope);reportBase=db.asOf;const m=preview.metrics;
      modal('核对并生成质量报告',kv([['组织',preview.org],['统计期间',preview.start+'—'+preview.end],['统计截止',preview.cutoff],['输入封存时点',preview.sealed],['待处理标注',m.pending+' 项'],['截止未恢复',m.open+' 起']])+field('报告名称 *','<input name="r_name" maxlength="100" value="'+esc(preview.org+'视频质量报告')+'">')+notice('报告将保留本次核对版本。未恢复、标注待生效和预警未办结事项会如实写入，不要求先全部解决。')+(m.unknown?notice('截止有 '+m.unknown+' 路通道状态未知，报告将披露观察缺口。','warn'):''),btn('生成报告','Q.commitReport()',true));
    },
    commitReport(){
      const name=document.querySelector('[name=r_name]').value.trim();if(!name)return error('请填写报告名称。');
      const latest=D.read();if(latest.asOf!==reportBase){db=latest;return error('数据版本已变化，请取消后重新核对；不会静默替换输入。');}
      const id='QR-'+String(db.reports.length+1).padStart(3,'0'),same=db.reports.filter(r=>r.snapshot.start===preview.start&&r.snapshot.end===preview.end).length;
      const r={id,name,status:db.requests.report==='error'?'生成失败':'已生成',created:D.add(preview.sealed,1),version:same+1,snapshot:D.clone(preview)};
      db.reports.unshift(r);db.asOf=D.add(preview.sealed,2);db.clock=db.asOf;db.requests.report='ok';save();close(true);
      if(r.status==='生成失败'){f.tab='history';render();toast('报告生成未完成，已保留原输入，可在生成记录重试。');}
      else navigate('report',{id,back:url('reports')+'?tab=history'});
    },
    retryReport(id){const r=db.reports.find(r=>r.id===id);r.status='已生成';r.created=D.tick(db);save();navigate('report',{id});},
    regenerate(id){const r=db.reports.find(r=>r.id===id);navigate('reports',{start:r.snapshot.start,end:r.snapshot.end,from:id});},
    exportReport(id){
      const r=db.reports.find(r=>r.id===id);if(!db.permissions.export)return toast('当前账号没有导出权限');
      if(db.requests.export==='error'){r.exportError=true;db.requests.export='ok';save();render();return;}
      r.exportError=false;save();window.print();
    }
  };
  if(unit){
    const readActions=new Set(['go','close','closeDrawer','keepEditing','discard','page','pageSize','resetFilters','clearChannel','refresh','monitorTab','monitorView','monitorState','monitorFilter','eventFilter','labelFilter','taskFilter','reportHistoryFilter','reportFilter','runFilter','reportTab','switchBusiness','evidence','label','reportDetail','exportReport','trend','coverageDetail','timeline','devicePage','deviceOption','boxFilter']);
    for(const [name,action] of Object.entries(Q)){if(typeof action!=='function')continue;Q[name]=(...args)=>{if(!readActions.has(name))return toast('当前账号没有此操作权限');if(name==='exportReport'&&(!db.permissions.export||!db.reports.some(r=>r.id===args[0])))return toast('当前账号没有该报告的导出权限');if(name==='evidence'){const s=route==='report'?db.reports.find(r=>r.id===(params.get('id')||'QR-001'))?.snapshot:db;if(!s||![...s.channels,...s.events,...s.labels].some(x=>x.id===args[0]))return toast('该记录不存在或不在授权范围内');}return action(...args);};}
  }
  window.Q=Q;
  if(params.get('tab'))f.tab=params.get('tab');
  if(params.get('start'))f.start=params.get('start');
  if(params.get('end'))f.end=params.get('end');
  document.addEventListener('click',e=>{if(e.target.closest('a[href]'))remember();});
  document.addEventListener('keydown',e=>{
    const dr=document.querySelector('.q-drawer');
    if(!dr||document.getElementById('q-modal')?.open||document.getElementById('q-confirm')?.open)return;
    if(e.key==='Escape'){e.preventDefault();closeDrawer();}
    if(e.key==='Tab'){const els=Array.from(dr.querySelectorAll('button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),a[href]'));const first=els[0],last=els.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}
  });
  addEventListener('storage',e=>{if(e.key===D.key){db=access?access.scopeQuality(D.read()):D.read();if(document.getElementById('q-modal')?.open||document.querySelector('.q-drawer'))toast('数据已更新，请在提交前核对当前依据。');else render();}});
  render();
  const scroll=sessionStorage.getItem('vq-scroll:'+location.pathname+location.search);
  if(scroll)requestAnimationFrame(()=>window.scrollTo(0,Number(scroll)));
})();

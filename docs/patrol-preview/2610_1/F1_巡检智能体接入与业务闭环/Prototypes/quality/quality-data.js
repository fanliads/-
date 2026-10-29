(function () {
  'use strict';
  const key = 'video-quality-v1';
  const clone = x => JSON.parse(JSON.stringify(x));
  const time = s => new Date(s.replace(' ', 'T') + '+08:00').getTime();
  const format = t => new Date(t + 8 * 3600000).toISOString().slice(0, 19).replace('T', ' ');
  const add = (s, n) => format(time(s) + n * 1000);
  function tick(db) { const at = db.clock && time(db.clock)>time(db.asOf) ? db.clock : db.asOf; db.clock=add(at,1);db.asOf=db.clock;return at; }
  function summarize(s) {
    const start = time(s.start + ' 00:00:00'), end = time(s.cutoff);
    const events = s.events;
    const fresh = events.filter(e => time(e.first) >= start && time(e.first) < end);
    const recovered = events.filter(e => e.recovered && time(e.recovered) >= start && time(e.recovered) < end);
    const involved = events.filter(e => fresh.includes(e) || recovered.includes(e) || (time(e.first) < start && (!e.recovered || time(e.recovered) > start)));
    const open = events.filter(e => !e.recovered || time(e.recovered) >= end);
    return { total: s.channels.length, normal: s.channels.filter(c => c.state === '正常').length, abnormal: s.channels.filter(c => c.state === '异常').length, unknown: s.channels.filter(c => c.state === '未知').length,
      fresh: fresh.length, recovered: recovered.length, involved: involved.length, affected: new Set(involved.map(e => e.channel)).size, open: open.length,
      pending: s.labels.filter(l => l.verdict === '待核实' || l.verdict === '无法判断' || (l.verdict === '需修正' && l.effect !== '已生效')).length,
      excluded: events.filter(e => e.human === '已排除').length, freshIds: fresh.map(e => e.id), involvedIds: involved.map(e => e.id), recoveredIds: recovered.map(e => e.id), openIds: open.map(e => e.id) };
  }
  function snapshot(db, opts) {
    const start = opts.start || '2026-10-26', end = opts.end || db.asOf.slice(0, 10);
    const limit = add(end + ' 00:00:00', 86400);
    const cutoff = time(limit) < time(db.asOf) ? limit : db.asOf;
    const at = time(cutoff);
    const scope = opts.org || '明德食堂';
    const selected = db.channels.filter(c=>scope==='华东运营中心'||c.org===scope);
    const selectedIds = new Set(selected.map(c=>c.id));
    const channels = selected.map(c => {
      const h = (c.history || []).filter(h => time(h.at) < at).at(-1);
      return Object.assign({}, clone(c), h ? clone(h) : { state: '未知', picture: '不可重建', connection: '未知', last: '—', validity: '历史依据不足' });
    });
    const visibleChannels=channels.filter(c=>c.useState!=='停用');
    const events = clone(db.events.filter(e => selectedIds.has(e.channel) && time(e.first) < at)).map(e => {
      if (e.recovered && time(e.recovered) >= at) e.recovered = null;
      e.observations = e.observations.filter(o => time(o.at) < at);
      const v = (e.verifications || []).filter(v => time(v.at) < at).at(-1);
      e.human = v ? v.value : '未核实';
      return e;
    });
    const labels = clone(db.labels.filter(l => selectedIds.has(l.channel) && time(l.found) < at)).map(l => {
      if (!l.verifiedAt || time(l.verifiedAt) >= at) { l.verdict = '待核实'; l.effect = '不涉及'; }
      else if (l.effectiveAt && time(l.effectiveAt) < at) l.effect = '已生效';
      else if (l.verdict === '需修正' && !['写入失败','结果待查证'].includes(l.effect)) l.effect = l.writtenAt && time(l.writtenAt) < at ? '待生效' : '待提交';
      return l;
    });
    const warnings = {};
    Object.entries(db.warnings).forEach(([id, w]) => {
      const h = (w.history || []).filter(h => time(h.at) < at).at(-1);
      warnings[id] = Object.assign({}, clone(w), h ? h : { stage: '截止进展待同步', at: '—' });
    });
    const s = { org: opts.org || '明德食堂', start, end, cutoff, sealed: add(db.clock && time(db.clock)>time(db.asOf)?db.clock:db.asOf, 2), channels:visibleChannels, events, labels, warnings, coverage: db.coverage, historical: channels.every(c => c.picture !== '不可重建') };
    s.metrics = summarize(s);
    return s;
  }
  function initial() {
    const db = {
      asOf: '2026-10-27 10:00:00', clock: '2026-10-27 10:04:00', org: '华东运营中心', coverage: true,
      permissions: { view: true, diagnose: true, verify: true, warning: true, label: true, configure: true, report: true, export: true },
      requests: { submit: 'ok', warning: 'ok', correction: 'ok', report: 'ok', export: 'ok', query: 'ok' },
      channels: [
        { id: 'C1', org: '明德食堂', box: 'B1', name: '配餐间东侧', node: '配餐', version: 'N1', connection: '在线', picture: '正常', state: '正常', last: '2026-10-27 09:55:00', validity: '有效', reason: '已完成本次质量检查' },
        { id: 'C2', org: '明德食堂', box: 'B1', name: '粗加工间', node: '粗加工', version: 'N3', connection: '在线', picture: '模糊', state: '异常', last: '2026-10-27 09:55:00', validity: '有效', reason: '画面模糊，影响细节辨识' },
        { id: 'C3', org: '明德食堂', box: 'B1', name: '清洗间北侧', node: '清洗', version: 'N1', connection: '未知', picture: '未知', state: '未知', last: '2026-10-26 10:10:00', validity: '已过期', reason: '最近观察已过期，未取得新诊断' }
      ],
      events: [
        { id: 'E1', channel: 'C1', type: '黑屏', first: '2026-10-26 08:00:00', recovered: '2026-10-27 09:00:00', recoverySource: '画面诊断服务 · 恢复反馈 V2', human: '确认异常', warning: 'W1', verifications: [{ at: '2026-10-26 08:20:00', value: '确认异常', reason: '已核对发生时诊断记录。', by: '陈静' }], observations: [
          { at: '2026-10-26 08:00:00', value: '黑屏', round: 'R26', source: 'OBS-101' },
          { at: '2026-10-26 12:00:00', value: '黑屏', round: 'R26', source: 'OBS-102' },
          { at: '2026-10-26 17:00:00', value: '黑屏', round: 'R26', source: 'OBS-103' },
          { at: '2026-10-27 09:00:00', value: '已恢复', round: 'R27', source: 'OBS-104' }
        ] },
        { id: 'E2', channel: 'C2', type: '模糊', first: '2026-10-25 09:00:00', recovered: null, human: '确认异常', warning: 'W2', verifications: [{ at: '2026-10-25 09:20:00', value: '确认异常', reason: '画面模糊持续出现，需要检查镜头。', by: '陈静' }], observations: [
          { at: '2026-10-25 09:00:00', value: '模糊', round: 'R25', source: 'OBS-201' },
          { at: '2026-10-26 09:00:00', value: '模糊', round: 'R26', source: 'OBS-202' },
          { at: '2026-10-27 09:55:00', value: '模糊', round: 'R27', source: 'OBS-203' }
        ] },
        { id: 'E3', channel: 'C3', type: '离线', first: '2026-10-26 10:00:00', recovered: null, human: '无法判断', warning: null, verifications: [{ at: '2026-10-26 10:15:00', value: '无法判断', reason: '等待新的连通观察。', by: '陈静' }], observations: [
          { at: '2026-10-26 10:00:00', value: '离线', round: null, source: 'DEV-301' },
          { at: '2026-10-26 10:10:00', value: '离线', round: null, source: 'DEV-302' }
        ] }
      ],
      labels: [{ id: 'H1', channel: 'C1', marked: '配餐', suspected: '清洗', version: 'N1', found: '2026-10-26 12:00:00', verdict: '需修正', effect: '待生效', verifiedAt: '2026-10-27 09:20:00', writtenAt: '2026-10-27 09:25:00', effectiveAt: null, target: '清洗', targetVersion: 'N2', by: '陈静', reason: '已核对画面记录，节点类型需要修正。', history: [{ at: '2026-10-27 09:20:00', text: '陈静确认需修正：配餐 → 清洗' }, { at: '2026-10-27 09:25:00', text: '配置N2已写入，等待生效反馈' }] }],
      warnings: {
        W1: { id: 'W1', event: 'E1', title: '明德食堂配餐间视频黑屏', stage: '待复核', owner: '明德食堂负责人', due: '2026-10-28 18:00', at: '2026-10-27 09:30:00', history: [{ at: '2026-10-26 08:30:00', stage: '待处置' }, { at: '2026-10-27 09:30:00', stage: '待复核' }] },
        W2: { id: 'W2', event: 'E2', title: '明德食堂粗加工间画面模糊', stage: '已办结', owner: '明德食堂负责人', due: '2026-10-27 18:00', at: '2026-10-27 09:40:00', history: [{ at: '2026-10-25 09:30:00', stage: '待处置' }, { at: '2026-10-27 09:40:00', stage: '已办结' }] }
      },
      tasks: [{ id: 'QT-001', name: '明德食堂视频质量日常诊断', type: '循环', state: '执行中', start: '2026-10-01', end: '2027-09-30', cycle: '每天', content: ['视频连通检查', '画面质量诊断'], channels: ['C1', 'C2', 'C3'], created: '2026-10-01 08:00:00', reason: '日常质量监测', rounds: [
        { id: 'R27', at: '2026-10-27 09:00:00', end: '2026-10-27 09:55:00', state: '执行结束', token: null, tokenState: '待回传', channels: 3, events: ['E1', 'E2'] },
        { id: 'R26', at: '2026-10-26 08:00:00', end: '2026-10-26 17:00:00', state: '执行结束', token: 1860, tokenState: '已完成', channels: 3, events: ['E1', 'E2'] },
        { id: 'R25', at: '2026-10-25 09:00:00', end: '2026-10-25 09:30:00', state: '执行结束', token: 1350, tokenState: '已完成', channels: 3, events: ['E2'] }
      ] }],
      reports: []
    };
    db.channels.forEach(c => { c.useState='启用';c.history = [Object.assign({ at: '2026-10-27 09:59:59' }, clone(c))]; });
    const s = snapshot(db, { org: '明德食堂', start: '2026-10-26', end: '2026-10-27' });
    s.sealed = '2026-10-27 10:02:00';
    db.reports = [{ id: 'QR-001', name: '明德食堂视频质量报告', status: '已生成', created: '2026-10-27 10:03:00', version: 1, snapshot: s }];
    return db;
  }
  function fleet(db) {
    if(db.fleetVersion)return db;
    const orgs=['明德食堂','城北小学食堂','实验中学食堂','滨江中学食堂','光明小学食堂','城南幼儿园食堂'];
    db.boxes=[];
    let next=4;
    for(let i=1;i<=16;i++){
      const org=orgs[Math.floor((i-1)/3)],connection=[5,11].includes(i)?'离线':i===14?'未知':'在线';
      db.boxes.push({id:'B'+i,org,model:'RK3588',connection,last:connection==='未知'?'2026-10-26 10:10:00':'2026-10-27 09:59:00'});
      if(i===1)continue;
      const count=i===2?9:i===16?0:4;
      for(let j=1;j<=count;j++){
        const unknown=connection!=='在线'||(i+j)%13===0;
        const bad=!unknown&&(i+j)%7===0;
        const picture=unknown?'未知':bad?(j%2?'模糊':'黑屏'):'正常';
        const c={id:'C'+next++,org,box:'B'+i,name:['配餐间','粗加工间','清洗间','烹饪间','库房','留样间','消毒间','备餐间','出餐口'][j-1]||'通道'+j,node:['配餐','粗加工','清洗','烹饪'][j%4],version:'N1',useState:'启用',connection:unknown?'未知':bad&&picture==='黑屏'?'离线':'在线',picture,state:unknown?'未知':bad?'异常':'正常',last:unknown?'2026-10-26 10:10:00':'2026-10-27 09:55:00',validity:unknown?'已过期':'有效',reason:unknown?(connection==='离线'?'上游盒子离线，未取得有效通道观察':connection==='未知'?'上游盒子状态未知，待重新确认':'最近观察过期，等待新诊断'):bad?(picture==='黑屏'?'通道离线，未取得有效画面':'画面模糊，影响细节辨识'):'已完成本次质量检查'};
        c.history=[Object.assign({at:'2026-10-27 09:59:59'},clone(c))];db.channels.push(c);
      }
    }
    db.fleetVersion=1;return db;
  }
  function connectionHistory(db) {
    if(db.connectionHistoryVersion)return db;
    db.channels.forEach(c=>{
      if(c.connectionHistory)return;
      const day='2026-10-27 ',source='设备连通服务';
      const period=(start,end,state)=>({start:day+start,end:day+end,state,source});
      c.connectionHistory=c.id==='C5'?[period('00:00:00','06:00:00','在线'),period('06:00:00','06:18:00','离线'),period('06:18:00','08:35:00','在线'),period('08:50:00','09:55:00','在线')]:c.connection==='在线'?[period('00:00:00','09:55:00','在线')]:c.connection==='离线'?[period('00:00:00','09:20:00','在线'),period('09:20:00','09:55:00','离线')]:[];
    });
    db.connectionHistoryVersion=1;return db;
  }
  function read() { try { return connectionHistory(fleet(JSON.parse(localStorage.getItem(key)) || initial())); } catch (_) { return connectionHistory(fleet(initial())); } }
  function write(db) { localStorage.setItem(key, JSON.stringify(db)); }
  window.QualityData = { fleet, key, clone, time, format, add, tick, initial, read, write, snapshot, summarize };
})();

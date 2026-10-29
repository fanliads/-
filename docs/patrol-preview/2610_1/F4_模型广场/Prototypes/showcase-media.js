(function(){
 const e=UI.esc;
 const frames={
  mask:{file:'personnel-scene-v1.png',boxes:[{x:25.5,y:11.2,w:11.3,h:25.3,label:'规范佩戴参考',tone:'normal'},{x:70.2,y:13.8,w:11.9,h:24.2,label:'口鼻未被覆盖',tone:'attention'}]},
  hat:{file:'personnel-scene-v1.png',boxes:[{x:25.4,y:10.9,w:11.7,h:13.8,label:'工帽佩戴参考',tone:'normal'},{x:70.2,y:13.6,w:11.9,h:12.3,label:'未佩戴工帽',tone:'attention'}]},
  bin:{file:'environment-scene-v1.png',boxes:[{x:24.4,y:28.9,w:22.6,h:58.2,label:'加盖参考',tone:'normal'},{x:56.2,y:4.9,w:26,h:82.5,label:'未加盖状态',tone:'attention'}]}
 };
 function allowed(a,targets){const audiences=targets?.length?targets:[SquareData.audience()];return !!a?.allowed&&audiences.every(t=>a.audiences?.includes(t))}
 function render(a,variant='scene',annotate=true,targets){
  if(!allowed(a,targets))return '<div class="sc-media-unavailable"><span>演示素材暂不可展示</span><small>该素材已停止展示或不在当前授权范围内</small></div>';
  const f=frames[a.kind];
  if(!f)return `<img class="sq-media" src="assets/${e(a.kind)}.svg" alt="${e(a.name)}，预置演示样例">`;
  return `<div class="sc-visual sc-visual-${e(variant)} sc-kind-${e(a.kind)}"><img class="sc-photo" src="assets/${f.file}" alt="${e(a.name)}，预置场景示意" draggable="false">${annotate?`<div class="sc-annotation" aria-label="场景识别示意">${f.boxes.map(b=>`<div class="sc-target ${b.tone}" style="left:${b.x}%;top:${b.y}%;width:${b.w}%;height:${b.h}%"><span>${b.label}</span></div>`).join('')}</div>`:''}${variant==='scene'?'<div class="sc-image-label"><span class="sc-label-dot"></span>预置演示样例<span class="sc-label-divider"></span>场景示意</div>':''}</div>`;
 }
 window.ShowcaseMedia={render,allowed};
})();

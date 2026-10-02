(function(){
 let mode='abnormality';
 const safe=v=>typeof esc==='function'?esc(v):String(v||'');
 const group=(code,name,meta,cards)=>'<section class="bestiary-region"><div class="bestiary-region-head"><div><div class="archive-id">'+safe(code)+'</div><div class="bestiary-region-name">'+safe(name)+'</div></div><div class="bestiary-region-meta">'+safe(meta)+'</div></div><div class="bestiary-grid catalog-text-grid">'+cards+'</div></section>';
 function card({id,name,status,done,known=true,type,description,footer}){
  if(!known)return '<article class="bestiary-card wood catalog-text-card catalog-unknown" aria-label="未接觸的圖鑑條目，探索後解鎖"><div class="catalog-card-head"><span class="bestiary-code">未登錄</span><span class="bestiary-status unknown">未遭遇</span></div><div class="catalog-obscured" aria-hidden="true"><h3>尚未辨識的檔案</h3><p>訊號不完整 · 資料等待確認</p><p>未確認內容　未確認內容</p><p>尚無足夠的現場記錄</p></div><div class="catalog-unknown-label"><strong>未知檔案</strong><span>探索此區域，接觸後揭露內容</span></div></article>';
  return '<article class="bestiary-card wood catalog-text-card '+(known?'':'locked')+'"><div class="catalog-card-head"><span class="bestiary-code">'+safe(id)+'</span><span class="bestiary-status '+(done?'done':known?'':'unknown')+'">'+safe(status)+'</span></div><h3 class="bestiary-name">'+safe(name)+'</h3><div class="catalog-type">'+safe(type)+'</div><p class="catalog-description">'+safe(description)+'</p><div class="catalog-footer">'+safe(footer)+'</div></article>';
 }
 function abnormalityGroups(ex){return EXPLORATION_AREAS.map(area=>{
  const observed=area.abnos.filter(id=>ex.seenAbnormalities.includes(id)||ex.abnormalityProgress[id]?.contained).length,contained=area.abnos.filter(id=>ex.abnormalityProgress[id]?.contained).length;
  const cards=area.abnos.map(id=>{const ab=ABNORMALITY_CATALOG[id],p=ex.abnormalityProgress[id]||{kills:0},known=ex.seenAbnormalities.includes(id)||!!p.contained;return card({id:known?id:'未登錄',name:known?ab.name:'未確認怪異',known,done:p.contained,status:p.contained?'已收容':known?'已觀測':'未遭遇',type:known?ab.type+' · Lv.'+ab.level:'探索後登錄',description:known?ab.note:'尚未在此區域遭遇；探索後會補齊資料。',footer:known?'制壓 '+Math.min(p.kills,ab.kills)+' / '+ab.kills:'制壓進度尚未確認'});}).join('');
  return group('AREA // '+area.id.toUpperCase(),area.name,'已觀測 '+observed+' / '+area.abnos.length+' · 已收容 '+contained,cards);
 }).join('')}
 function enemyGroups(ex){
  const groups=[{id:'any',name:'各區泛用敵方',meta:'在全部區域出現，等級隨區域調整'},...EXPLORATION_AREAS.map(a=>({id:a.id,name:a.name,meta:'地區限定敵方 · 建議 Lv.'+a.level}))];
  return groups.map(g=>group(g.id==='any'?'FIELD // COMMON':'AREA // '+g.id.toUpperCase(),g.name,g.meta,ENEMY_CATALOG.filter(e=>e.area===g.id).map(e=>{
   const p=ex.enemyProgress[e.id]||{encounters:0,kills:0},known=p.encounters>0;
   return card({id:e.id,name:known?e.name:'未確認敵方',known,status:known?'已遭遇':'未遭遇',type:(e.area==='any'?'泛用型':'地區限定型')+(known?' · '+e.type+' · Lv.'+e.level:''),description:known?e.note:'探索此區域後登錄敵方資料。',footer:known?'遭遇 '+p.encounters+' 次 · 擊敗 '+p.kills+' 次｜掉落 '+e.drop+' · '+e.price+' G / 個':'擊敗後可取得專供販售的素材'});
  }).join(''))).join('');
 }
 function eventGroups(ex){
  const eventCards=(events)=>events.map(ev=>{const i=EXPLORATION_EVENTS.indexOf(ev),p=ex.eventProgress[ev.id]||{encounters:0,resolved:0},known=p.encounters>0;return card({id:'EV-'+String(i+1).padStart(3,'0'),name:ev.name,known,status:known?'已登錄':'未遭遇',type:'隨機事件 · '+(ev.area&&ev.area!=='any'?'地區限定':'全區域'),description:ev.desc,footer:'遭遇 '+p.encounters+' 次 · 成功 '+p.resolved+' 次 · 失敗 '+(p.failures||0)+' 次'});}).join('');
  const common=group('EVENT // COMMON','泛用事件','所有區域都可能遭遇 · 成功與失敗皆會登錄',eventCards(EXPLORATION_EVENTS.filter(e=>!e.area||e.area==='any')));
  const regional=EXPLORATION_AREAS.map(a=>group('EVENT // '+a.id.toUpperCase(),a.name,'地區限定事件',eventCards(EXPLORATION_EVENTS.filter(e=>e.area===a.id)))).join('');
  const shopCards=EXPLORATION_AREAS.map(a=>{const info=window.EXPLORATION_SHOP_CATALOG[a.id],p=ex.eventProgress['shop-'+a.id]||{encounters:0},known=p.encounters>0;return card({id:'SHOP // '+a.id.toUpperCase(),name:known?info.name:'未確認商店',known,status:known?'已登錄':'未遭遇',type:'隨機商店 · '+a.name,description:known?info.flavor:'在此區域探索，有機會遇到臨時商販。',footer:known?'遭遇 '+p.encounters+' 次 · 可買賣探索物資':'遇到商店後補齊資料'});}).join('');
  return common+regional+group('EVENT // SHOP','區域商店','各區域的隨機商店',shopCards);
 }
 function render(){
  const grid=document.getElementById('bestiaryGrid');if(!grid)return;
  try{ensureExplorationState();const ex=state.exploration;
   document.querySelectorAll('[data-catalog]').forEach(b=>{const active=b.dataset.catalog===mode;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
   const title=document.querySelector('#bestiary .archive-title');if(title)title.textContent={abnormality:'怪異圖鑑 / CONTAINMENT INDEX',enemy:'敵方圖鑑 / ENEMY INDEX',event:'事件圖鑑 / EVENT INDEX'}[mode];
   const desc=document.getElementById('catalogDescription');if(desc)desc.textContent={abnormality:'怪異在遭遇後登錄；達成制壓條件後蓋章標示「已收容」。',enemy:'普通敵人直接進入戰鬥。包含泛用與地區限定敵人，勝利可取得販售素材。',event:'探索途中遇到的隨機事件與商店，會在此保存發現資訊。'}[mode];
   grid.innerHTML=mode==='enemy'?enemyGroups(ex):mode==='event'?eventGroups(ex):abnormalityGroups(ex);
  }catch(e){grid.innerHTML='<div class="empty">圖鑑載入失敗：'+safe(e.message)+'</div>';console.error(e)}
 }
 document.addEventListener('click',e=>{const b=e.target.closest?.('[data-catalog]');if(!b)return;mode=b.dataset.catalog;render()});
 window.forceRenderBestiary=render;render();window.addEventListener('pageshow',render);
})();

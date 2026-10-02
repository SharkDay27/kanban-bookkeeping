(function(){
  let mode='bookkeeping';
  function el(id){return document.getElementById(id)}
  function safe(v){return typeof esc==='function'?esc(v):String(v==null?'':v)}
  function cash(v){return typeof money==='function'?money(v):String(v)}
  function formatTime(v){
    const d=new Date(v);if(isNaN(d.getTime()))return '';
    return d.toLocaleString('zh-TW',{year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'});
  }
  function refreshExploreAreas(){
    const select=el('exploreRecordArea');if(!select||typeof EXPLORATION_AREAS==='undefined')return;
    const prev=select.value;
    select.innerHTML='<option value="">所有區域</option>'+EXPLORATION_AREAS.map(function(a){return '<option value="'+safe(a.id)+'">'+safe(a.name)+'</option>'}).join('');
    select.value=prev;
  }
  function bookkeepingRows(){
    const m=el('month')?el('month').value:'',t=el('typeFilter')?el('typeFilter').value:'',c=el('cat')?el('cat').value:'',q=(el('search')?el('search').value:'').trim().toLowerCase();
    return (state.entries||[]).filter(function(x){
      return (!m||String(x.date||'').startsWith(m))&&(!t||x.type===t)&&(!c||x.category===c)&&
        (!q||[x.store,x.note,x.invoice,x.category].concat((x.items||[]).map(function(i){return i.name})).join(' ').toLowerCase().includes(q));
    }).sort(function(x,y){return String(y.date||'').localeCompare(String(x.date||''))||Number(y.amount||0)-Number(x.amount||0)});
  }
  function renderBookkeeping(){
    const box=el('board');if(!box)return;
    const rows=bookkeepingRows(),groups={};
    rows.forEach(function(x){(groups[x.date]||(groups[x.date]=[])).push(x)});
    const dates=Object.keys(groups).sort().reverse();
    if(!dates.length){box.innerHTML='<div class="empty wood panel">目前沒有符合條件的記帳紀錄。</div>';return}
    box.innerHTML='<div class="board">'+dates.map(function(date){
      const items=groups[date],expense=items.filter(function(x){return x.type==='expense'}).reduce(function(sum,x){return sum+Number(x.amount||0)},0),
        income=items.filter(function(x){return x.type==='income'}).reduce(function(sum,x){return sum+Number(x.amount||0)},0),net=income-expense;
      return '<section class="day wood panel"><div class="dayhead"><div><div style="font-weight:900">'+safe(date)+'</div><div class="s">'+items.length+' 筆紀錄</div></div>'+
        '<div style="text-align:right"><div class="daytotal">支出 '+safe(cash(expense))+'</div><div class="daynet '+(net<0?'minus':'plus')+'">淨額 '+safe(cash(net))+'</div></div></div>'+
        items.map(function(entry){
          const style=typeof categoryStyle==='function'?categoryStyle(entry.category||'其他'):'';
          const preview=entry.comment&&entry.comment.lines&&entry.comment.lines.length?'<div class="entry-comment-preview"><b>'+safe(entry.comment.lines[0].speaker)+'</b>：'+safe(entry.comment.lines[0].text)+'</div>':'';
          return '<article class="card wood transaction-card type-'+safe(entry.type)+'" style="'+style+'"><div class="row"><div class="store">'+safe(entry.store)+'</div><div class="amt '+safe(entry.type)+'">'+(entry.type==='income'?'+ ':'')+safe(cash(entry.amount))+'</div></div>'+
            '<div class="badges"><span class="badge '+safe(entry.type)+'">'+(entry.type==='income'?'收入':'支出')+'</span><span class="badge category-badge">'+safe(entry.category||'其他')+'</span><span class="badge">'+safe(entry.payment||'未設定')+'</span></div>'+
            '<div class="items">'+safe((entry.items||[]).slice(0,3).map(function(i){return i.name}).join('、')||entry.note||'—')+'</div>'+preview+
            '<div class="card-actions"><button class="mini-btn" data-edit="'+safe(entry.id)+'">編輯</button></div></article>';
        }).join('')+'</section>';
    }).join('')+'</div>';
    box.querySelectorAll('[data-edit]').forEach(function(btn){btn.onclick=function(){if(typeof openEdit==='function')openEdit(btn.dataset.edit)}});
  }
  function exploreRows(){
    if(typeof ensureExplorationState==='function')ensureExplorationState();
    const area=el('exploreRecordArea')?el('exploreRecordArea').value:'',kind=el('exploreRecordKind')?el('exploreRecordKind').value:'',
      q=(el('exploreRecordSearch')?el('exploreRecordSearch').value:'').trim().toLowerCase();
    return (state.exploration&&state.exploration.logs||[]).filter(function(log){
      const matchArea=!area||log.areaId===area;
      const matchKind=!kind||log.kind===kind;
      const hay=[log.area,log.title,log.detail,log.reward].concat(log.names||[]).join(' ').toLowerCase();
      return matchArea&&matchKind&&(!q||hay.includes(q));
    });
  }
  function renderExploration(){
    const box=el('board');if(!box)return;
    const rows=exploreRows();
    if(!rows.length){box.innerHTML='<div class="empty wood panel">目前沒有符合條件的探索紀錄。</div>';return}
    box.innerHTML=rows.map(function(log){
      const names=(log.names||[]).map(function(n){const color=typeof sinnerColorForSpeaker==='function'?sinnerColorForSpeaker(n):'#c9c5bb';return '<span style="color:'+color+';font-weight:900">'+safe(n)+'</span>'}).join(' ＋ ');
      const combat=log.combat&&typeof renderCombatBreakdown==='function'?renderCombatBreakdown(log.combat):'';
      return '<article class="wood exploration-record-card"><div class="exploration-record-head"><div><div class="exploration-record-title">'+safe(log.title||'探索紀錄')+'</div><div class="exploration-record-meta">'+safe(formatTime(log.at))+' · '+safe(log.area||'未知區域')+' · '+names+'</div></div><span class="record-kind-badge">'+safe(log.stamp||String(log.kind||'FIELD').toUpperCase())+'</span></div>'+
        (combat||'<div class="exploration-record-detail">'+safe(log.detail||'')+'</div>')+
        (log.reward?'<div class="exploration-record-reward">REWARD / '+safe(log.reward)+'</div>':'')+'</article>';
    }).join('');
  }
  function render(){
    const book=el('bookkeepingFilters'),explore=el('explorationRecordFilters');
    document.querySelectorAll('[data-record-mode]').forEach(function(btn){btn.classList.toggle('active',btn.dataset.recordMode===mode)});
    if(book)book.hidden=mode!=='bookkeeping';
    if(explore)explore.hidden=mode!=='exploration';
    if(mode==='bookkeeping')renderBookkeeping();else{refreshExploreAreas();renderExploration()}
  }
  function setMode(next){mode=next==='exploration'?'exploration':'bookkeeping';render()}
  document.addEventListener('click',function(ev){const btn=ev.target&&ev.target.closest?ev.target.closest('[data-record-mode]'):null;if(btn)setMode(btn.dataset.recordMode)});
  ['month','typeFilter','cat','search','exploreRecordArea','exploreRecordKind','exploreRecordSearch'].forEach(function(id){
    const node=el(id);if(node){node.addEventListener('input',render);node.addEventListener('change',render)}
  });
  window.forceRenderRecords=render;
  window.setRecordMode=setMode;
  render();
  window.addEventListener('pageshow',function(){setTimeout(render,0)});
})();
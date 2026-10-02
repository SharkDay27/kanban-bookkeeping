(function(){
  function esc2(value){
    if(typeof esc==='function')return esc(value);
    return String(value==null?'':value).replace(/[&<>"']/g,function(ch){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch];
    });
  }
  function render(){
    var grid=document.getElementById('bestiaryGrid');
    if(!grid)return;
    try{
      if(typeof ensureExplorationState!=='function')throw new Error('探索資料尚未初始化。');
      if(typeof EXPLORATION_AREAS==='undefined'||typeof ABNORMALITY_CATALOG==='undefined')throw new Error('怪異資料未載入。');
      ensureExplorationState();
      var ex=state.exploration;
      grid.innerHTML=EXPLORATION_AREAS.map(function(area){
        var cards=(area.abnos||[]).map(function(id){
          var ab=ABNORMALITY_CATALOG[id];
          if(!ab)return '';
          var seen=(ex.seenAbnormalities||[]).indexOf(id)>=0;
          var p=(ex.abnormalityProgress&&ex.abnormalityProgress[id])||{kills:0,contained:false};
          var status=p.contained?'CONTAINED':seen?'OBSERVED':'UNKNOWN';
          return '<div class="bestiary-card wood '+(seen?'':'locked')+'">'+
            '<div class="bestiary-status '+(p.contained?'done':seen?'':'unknown')+'">'+status+'</div>'+
            '<div class="specimen"><div class="abno-glyph">'+(seen?'◈':'?')+'</div></div>'+
            '<div class="bestiary-code">'+(seen?id:'A-???')+' / LV '+(seen?ab.level:'?')+'</div>'+
            '<div class="bestiary-name">'+(seen?esc2(ab.name):'未確認怪異')+'</div>'+
            '<div class="abno-area">'+esc2(area.name)+'</div>'+
            '<span class="abno-type">'+(seen?esc2(ab.type||'未分類'):'TYPE / UNKNOWN')+'</span>'+
            '<div class="bestiary-meta">'+(seen?esc2(ab.note):'尚未在此區域的探索中遭遇。')+'<br>'+
              '制壓進度 / '+(seen?Math.min(Number(p.kills||0),ab.kills)+' / '+ab.kills:'? / ?')+
            '</div></div>';
        }).join('');
        var observed=(area.abnos||[]).filter(function(id){return (ex.seenAbnormalities||[]).indexOf(id)>=0}).length;
        var contained=(area.abnos||[]).filter(function(id){var p=ex.abnormalityProgress&&ex.abnormalityProgress[id];return !!(p&&p.contained)}).length;
        return '<section class="bestiary-region">'+
          '<div class="bestiary-region-head"><div><div class="archive-id">AREA // '+esc2(area.id.toUpperCase())+'</div><div class="bestiary-region-name">'+esc2(area.name)+'</div></div>'+
          '<div class="bestiary-region-meta">RISK / '+esc2(area.risk)+'<br>OBSERVED '+observed+' / '+area.abnos.length+' · CONTAINED '+contained+'</div></div>'+
          '<div class="bestiary-grid">'+cards+'</div></section>';
      }).join('');
    }catch(err){
      grid.innerHTML='<div class="wood panel" style="border-left:4px solid #9b4f55"><div class="archive-id">ARCHIVE // CATALOG-ERROR</div><div style="font-size:16px;font-weight:900;margin-top:5px">怪異圖鑑載入失敗</div><div class="sub" style="margin-top:7px">'+esc2(err&&err.message?err.message:String(err))+'</div></div>';
    }
  }
  window.forceRenderBestiary=render;
  render();
  document.querySelectorAll('[data-tab="bestiary"],[data-goto="bestiary"]').forEach(function(btn){
    btn.addEventListener('click',function(){setTimeout(render,0)});
  });
  window.addEventListener('pageshow',function(){setTimeout(render,0)});
})();
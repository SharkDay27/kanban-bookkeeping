(function(){
  function refresh(){
    try{
      if(typeof ensureExplorationState==='function')ensureExplorationState();
      if(typeof renderExploration==='function')renderExploration();
      if(typeof renderSinnerManagement==='function')renderSinnerManagement();
      if(typeof renderExplorationShop==='function')renderExplorationShop();
    }catch(err){
      var box=document.getElementById('exploreResult');
      if(box)box.textContent='探索系統載入失敗：'+(err&&err.message?err.message:String(err));
    }
    var btn=document.getElementById('exploreBtn');
    if(btn&&typeof runExploration==='function'){
      btn.onclick=function(ev){
        ev.preventDefault();
        try{runExploration()}catch(err){
          console.error(err);
          if(typeof toast==='function')toast('探索執行失敗，請重新整理後再試');
          var box=document.getElementById('exploreResult');
          if(box)box.textContent='探索執行失敗：'+(err&&err.message?err.message:String(err));
        }
      };
    }
  }
  window.forceRenderExploration=refresh;
  refresh();
  document.querySelectorAll('[data-tab="explore"],[data-goto="explore"]').forEach(function(btn){
    btn.addEventListener('click',function(){setTimeout(refresh,0)});
  });
  window.addEventListener('pageshow',function(){setTimeout(refresh,0)});
})();
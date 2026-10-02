(function(){
  function byId(id){return document.getElementById(id)}
  function safeNumber(v){v=Number(v||0);return Number.isFinite(v)?v:0}

  function render(){
    try{
      if(typeof ensureExplorationState==='function')ensureExplorationState();
      if(typeof ensurePlayerState==='function')ensurePlayerState();
      const xp=safeNumber(state.rpg&&state.rpg.xp);
      const lv=Math.floor(xp/100)+1,cur=xp%100;
      const ex=state.exploration||{};
      const c=(state.rpg&&state.rpg.consumables)||{water:0,potion:0};

      if(byId('rank'))byId('rank').textContent='但丁｜LCB 執行經理';
      if(byId('lv'))byId('lv').textContent='Lv.'+lv;
      if(byId('xpText'))byId('xpText').textContent=cur+' / 100 EXP';
      if(byId('xpFill'))byId('xpFill').style.width=cur+'%';
      if(byId('xpPct'))byId('xpPct').textContent=cur+'%';
      if(byId('gold'))byId('gold').textContent=safeNumber(state.rpg&&state.rpg.gold);
      if(byId('itemBoxCount'))byId('itemBoxCount').textContent=safeNumber(state.rpg&&state.rpg.itemBoxes);
      if(byId('managerActions'))byId('managerActions').textContent=safeNumber(ex.actions);
      if(byId('exploreActionsHome'))byId('exploreActionsHome').textContent=safeNumber(ex.actions);
      if(byId('exploreActions'))byId('exploreActions').textContent=safeNumber(ex.actions);
      if(byId('managerSupply'))byId('managerSupply').textContent=safeNumber(c.water)+' / '+safeNumber(c.potion);
      if(byId('rewardLog')&&state.rpg)byId('rewardLog').textContent=state.rpg.rewardLog||'開始記錄來啟動管理流程。';
    }catch(err){
      console.error('manager-progress render',err);
    }
  }

  function showReward(data){
    render();
    const box=byId('entryRewardNotice');
    if(!box||!data){return}
    const levelText=data.levelUps>0?' · 升級 ×'+data.levelUps+' · 道具箱 '+safeNumber(data.itemBoxes):'';
    box.innerHTML='<strong>記帳完成</strong>　EXP +'+safeNumber(data.xp)+'　｜　目前行動點 '+safeNumber(data.actions)+levelText;
    box.hidden=false;
  }

  // Terminology compatibility: old saved/display text that still says 小票 is shown as 發票.
  function normalizeInvoiceWording(root){
    if(!root)return;
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    const nodes=[];let node;
    while((node=walker.nextNode()))nodes.push(node);
    nodes.forEach(function(n){
      if(n.nodeValue&&n.nodeValue.indexOf('小票')>=0)n.nodeValue=n.nodeValue.replace(/小票/g,'發票');
    });
  }

  window.forceRenderManagerProgress=render;
  window.showBookkeepingReward=showReward;
  window.normalizeInvoiceWording=normalizeInvoiceWording;

  render();
  normalizeInvoiceWording(document.body);

  const observer=new MutationObserver(function(records){
    records.forEach(function(r){
      r.addedNodes.forEach(function(n){if(n.nodeType===1||n.nodeType===3)normalizeInvoiceWording(n.nodeType===1?n:n.parentNode)});
    });
  });
  observer.observe(document.body,{childList:true,subtree:true});

  window.addEventListener('pageshow',function(){setTimeout(render,0)});
})();
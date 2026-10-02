(function(){
  const defs=[
    {id:'RPG-A01',cat:'記錄',name:'旅程的第一格',desc:'完成第 1 筆記帳',target:1,progress:function(){return state.entries.length},reward:{gold:30}},
    {id:'RPG-A02',cat:'記錄',name:'帳本開始變厚',desc:'累積 25 筆記帳',target:25,progress:function(){return state.entries.length},reward:{gold:80,box:1}},
    {id:'RPG-A03',cat:'記錄',name:'一百次鐘聲',desc:'累積 100 筆記帳',target:100,progress:function(){return state.entries.length},reward:{gold:200,box:2}},
    {id:'RPG-A04',cat:'習慣',name:'七日不斷線',desc:'最佳連續記帳達 7 天',target:7,progress:function(){return computeStreak().best},reward:{gold:100,box:1}},
    {id:'RPG-A05',cat:'探索',name:'第一次出勤',desc:'完成 1 次探索',target:1,progress:function(){ensureExplorationState();return state.exploration.runs||0},reward:{gold:40}},
    {id:'RPG-A06',cat:'探索',name:'熟悉的路線',desc:'累積完成 20 次探索',target:20,progress:function(){ensureExplorationState();return state.exploration.runs||0},reward:{gold:120,box:1}},
    {id:'RPG-A07',cat:'戰鬥',name:'第一次有效制壓',desc:'怪異有效制壓累積 1 次',target:1,progress:function(){ensureExplorationState();return Object.values(state.exploration.abnormalityProgress||{}).reduce(function(s,x){return s+Number(x.kills||0)},0)},reward:{gold:50}},
    {id:'RPG-A08',cat:'戰鬥',name:'處置班常客',desc:'怪異有效制壓累積 15 次',target:15,progress:function(){ensureExplorationState();return Object.values(state.exploration.abnormalityProgress||{}).reduce(function(s,x){return s+Number(x.kills||0)},0)},reward:{gold:180,box:1}},
    {id:'RPG-A09',cat:'收容',name:'門後的名字',desc:'完成第 1 種怪異收容',target:1,progress:function(){return containedAbnormalityCount()},reward:{gold:120,box:1}},
    {id:'RPG-A10',cat:'收容',name:'小型收容區',desc:'完成 5 種怪異收容',target:5,progress:function(){return containedAbnormalityCount()},reward:{gold:300,box:2}},
    {id:'RPG-A11',cat:'成長',name:'新人不再',desc:'任一罪人達 Lv.3',target:3,progress:function(){ensureExplorationState();return Math.max.apply(null,Object.values(state.exploration.sinners).map(function(x){return sinnerLevel(x)}))},reward:{gold:80,potion:1}},
    {id:'RPG-A12',cat:'成長',name:'十二人的經驗',desc:'12 名罪人全部達 Lv.2',target:12,progress:function(){ensureExplorationState();return Object.values(state.exploration.sinners).filter(function(x){return sinnerLevel(x)>=2}).length},reward:{gold:240,box:2}},
    {id:'RPG-A13',cat:'裝備',name:'第一次整備',desc:'配置任意 1 件罪人探索裝備',target:1,progress:function(){ensureExplorationState();return Object.values(state.exploration.sinners).filter(function(x){return !!x.gear}).length},reward:{gold:50}},
    {id:'RPG-A14',cat:'裝備',name:'三槽全開',desc:'同時裝備 3 件管理支援裝備',target:3,progress:function(){return (state.rpg.equipped||[]).length},reward:{gold:100,box:1}},
    {id:'RPG-A15',cat:'商店',name:'有備而來',desc:'在探索商店完成 5 次購買',target:5,progress:function(){ensureExplorationState();return (state.exploration.logs||[]).reduce(function(s,l){return s+(l.kind==='shop'&&l.reward&&String(l.reward).indexOf('購入')>=0?1:0)},0)},reward:{gold:150,box:1}}
  ];
  window.RPG_ACHIEVEMENTS=defs;

  function rewardText(r){const x=[];if(r.gold)x.push(r.gold+' 金幣');if(r.box)x.push('道具箱 ×'+r.box);if(r.water)x.push('瓶裝水 ×'+r.water);if(r.potion)x.push('治療藥水 ×'+r.potion);return x.join('、')}
  function grant(r){ensurePlayerState();if(r.gold)state.rpg.gold+=r.gold;if(r.box)state.rpg.itemBoxes=(state.rpg.itemBoxes||0)+r.box;if(r.water)state.rpg.consumables.water+=r.water;if(r.potion)state.rpg.consumables.potion+=r.potion}
  function check(){
    state.rpg.achievements=state.rpg.achievements||[];
    const fresh=[];
    defs.forEach(function(x){let p=0;try{p=x.progress()}catch(e){}if(p>=x.target&&!state.rpg.achievements.includes(x.id)){state.rpg.achievements.push(x.id);grant(x.reward);fresh.push(x)}});
    if(fresh.length){state.rpg.rewardLog='成就解鎖：'+fresh.map(function(x){return x.name}).join('、')+'\n獲得 '+fresh.map(function(x){return rewardText(x.reward)}).join('；');saveLocal()}
    return fresh;
  }
  function render(){
    try{
      check();
      const box=document.getElementById('achievementGrid'),summary=document.getElementById('achievementSummary');if(!box)return;
      const unlocked=state.rpg.achievements||[];
      if(summary)summary.innerHTML='<div class="mini wood panel"><div class="k">已解鎖</div><div class="num">'+unlocked.filter(function(id){return id.indexOf('RPG-')===0}).length+' / '+defs.length+'</div></div>'+
        '<div class="mini wood panel"><div class="k">探索次數</div><div class="num">'+(state.exploration&&state.exploration.runs||0)+'</div></div>'+
        '<div class="mini wood panel"><div class="k">已收容</div><div class="num">'+containedAbnormalityCount()+'</div></div>';
      box.innerHTML=defs.map(function(x){
        const p=Math.min(x.target,Number(x.progress()||0)),on=unlocked.includes(x.id),pct=Math.round(p/x.target*100);
        return '<article class="achievement-card wood '+(on?'unlocked':'locked')+'"><div class="achievement-badge">'+(on?'UNLOCKED':'LOCKED')+'</div>'+
          '<div class="achievement-id">'+x.id+'</div><div class="achievement-category">'+x.cat+'</div><div class="achievement-name">'+x.name+'</div><div class="achievement-desc">'+x.desc+'</div>'+
          '<div class="quest-progress"><div style="width:'+pct+'%"></div></div><div class="achievement-progress-text">'+p+' / '+x.target+'</div>'+
          '<div class="achievement-reward-line">REWARD / '+rewardText(x.reward)+'</div></article>';
      }).join('');
    }catch(err){const b=document.getElementById('achievementGrid');if(b)b.innerHTML='<div class="rpg-module-error">成就模組載入失敗：'+String(err.message||err)+'</div>'}
  }
  window.checkRpgAchievements=check;window.forceRenderAchievements=render;
  render();
  document.querySelectorAll('[data-tab="progress"],[data-goto="progress"]').forEach(function(b){b.addEventListener('click',function(){setTimeout(render,0)})});
})();
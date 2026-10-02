(function(){
  const DAILY=[
    {id:'book-1',cat:'記帳',name:'今日開帳',desc:'今天新增 1 筆記帳',goal:1,reward:{xp:10,gold:10},progress:function(ds){return ds.count}},
    {id:'book-3',cat:'記帳',name:'三筆成冊',desc:'今天新增 3 筆記帳',goal:3,reward:{xp:20,gold:20},progress:function(ds){return ds.count}},
    {id:'book-cat',cat:'記帳',name:'分類整理',desc:'今天使用 2 種不同分類',goal:2,reward:{xp:15,gold:15},progress:function(ds){return ds.cats}},
    {id:'field-1',cat:'探索',name:'今日出勤',desc:'今天完成 1 次探索',goal:1,reward:{xp:18,gold:15},progress:function(){return todayExplorations()}},
    {id:'field-3',cat:'探索',name:'深入三次',desc:'今天完成 3 次探索',goal:3,reward:{xp:30,box:1},progress:function(){return todayExplorations()}},
    {id:'fight-1',cat:'戰鬥',name:'遭遇處置',desc:'今天完成 1 次怪異有效制壓',goal:1,reward:{xp:25,potion:1},progress:function(){return todaySuppressions()}}
  ];
  const RPG=[
    {id:'rpg-run-5',cat:'探索',name:'路線熟悉',desc:'累積探索 5 次',goal:5,reward:{gold:60,water:2},progress:function(){ensureExplorationState();return state.exploration.runs||0}},
    {id:'rpg-contain-1',cat:'收容',name:'建立第一間收容室',desc:'完成 1 種怪異收容',goal:1,reward:{gold:100,box:1},progress:function(){return containedAbnormalityCount()}},
    {id:'rpg-level-3',cat:'成長',name:'培養主力',desc:'任一罪人達 Lv.3',goal:3,reward:{gold:80,potion:1},progress:function(){ensureExplorationState();return Math.max.apply(null,Object.values(state.exploration.sinners).map(function(x){return sinnerLevel(x)}))}},
    {id:'rpg-gear-2',cat:'整備',name:'雙人整備完成',desc:'至少 2 名罪人配置探索裝備',goal:2,reward:{gold:70,box:1},progress:function(){ensureExplorationState();return Object.values(state.exploration.sinners).filter(function(x){return !!x.gear}).length}}
  ];
  window.RPG_QUESTS={daily:DAILY,long:RPG};

  function todayExplorations(){ensureExplorationState();return Number(state.exploration.dailyProgress[today()]?.runs||0)}
  function todaySuppressions(){ensureExplorationState();return Number(state.exploration.dailyProgress[today()]?.suppressions||0)}
  function rewardText(r){const x=[];if(r.xp)x.push(r.xp+' EXP');if(r.gold)x.push(r.gold+' 金幣');if(r.box)x.push('道具箱 ×'+r.box);if(r.water)x.push('瓶裝水 ×'+r.water);if(r.potion)x.push('治療藥水 ×'+r.potion);return x.join('、')}
  function grant(r,label){
    ensurePlayerState();
    if(r.xp)grantXp(r.xp,'完成任務：'+label);
    const eff=equipmentEffects();
    if(r.gold)state.rpg.gold+=Math.round(r.gold*(1+(eff.goldBonus||0)));
    if(r.box)state.rpg.itemBoxes=(state.rpg.itemBoxes||0)+r.box;
    if(r.water)state.rpg.consumables.water+=r.water;
    if(r.potion)state.rpg.consumables.potion+=r.potion;
  }
  function ensureLongClaims(){state.rpg.longQuestClaims=state.rpg.longQuestClaims||{}}
  function check(){
    const d=today();ensureDaily(d);ensureLongClaims();const ds=dayStats(d),fresh=[];
    DAILY.forEach(function(q){const p=q.progress(ds),claim=state.daily[d].questClaims[q.id];if(p>=q.goal&&!claim){state.daily[d].questClaims[q.id]=true;grant(q.reward,q.name);fresh.push(q)}});
    RPG.forEach(function(q){const p=q.progress();if(p>=q.goal&&!state.rpg.longQuestClaims[q.id]){state.rpg.longQuestClaims[q.id]=true;grant(q.reward,q.name);fresh.push(q)}});
    checkStreakMilestones();
    if(fresh.length){state.rpg.rewardLog='任務完成：'+fresh.map(function(q){return q.name}).join('、')+'\n'+fresh.map(function(q){return rewardText(q.reward)}).join('；');saveLocal()}
    return fresh;
  }
  function card(q,p,claim){
    const done=p>=q.goal,pct=Math.min(100,Math.round(p/q.goal*100));
    return '<article class="quest wood panel '+(claim?'claimed':done?'ready':'')+'"><div class="quest-category">'+q.cat+'</div><div class="row"><div class="quest-name">'+(claim?'✓ ':'◇ ')+q.name+'</div><div class="quest-reward">'+rewardText(q.reward)+'</div></div>'+
      '<div class="quest-desc">'+q.desc+'</div><div class="quest-progress"><div style="width:'+pct+'%"></div></div><div class="quest-desc">'+Math.min(p,q.goal)+' / '+q.goal+(claim?' · 已領取':'')+'</div></article>';
  }
  function render(){
    try{
      check();const d=today();ensureDaily(d);ensureLongClaims();const ds=dayStats(d);
      const list=document.getElementById('questList'),long=document.getElementById('rpgQuestList'),sum=document.getElementById('questSummary');
      if(list)list.innerHTML=DAILY.map(function(q){return card(q,q.progress(ds),!!state.daily[d].questClaims[q.id])}).join('');
      if(long)long.innerHTML=RPG.map(function(q){return card(q,q.progress(),!!state.rpg.longQuestClaims[q.id])}).join('');
      if(sum){const claimed=DAILY.filter(function(q){return state.daily[d].questClaims[q.id]}).length;sum.innerHTML='<div class="mini wood panel"><div class="k">今日完成</div><div class="num">'+claimed+' / '+DAILY.length+'</div></div><div class="mini wood panel"><div class="k">今日探索</div><div class="num">'+todayExplorations()+'</div></div><div class="mini wood panel"><div class="k">今日制壓</div><div class="num">'+todaySuppressions()+'</div></div>'}
    }catch(err){const b=document.getElementById('questList');if(b)b.innerHTML='<div class="rpg-module-error">任務模組載入失敗：'+String(err.message||err)+'</div>'}
  }
  window.checkRpgQuests=check;window.forceRenderRpgQuests=render;
  render();
  document.querySelectorAll('[data-tab="quests"],[data-goto="quests"]').forEach(function(b){b.addEventListener('click',function(){setTimeout(render,0)})});
})();

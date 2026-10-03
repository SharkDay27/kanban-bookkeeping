(function(){
  const beginnerAbnos=EXPLORATION_AREAS.filter(a=>a.tier==='beginner').flatMap(a=>a.abnos);
  const beginnerEnemies=ENEMY_CATALOG.filter(e=>!INTERMEDIATE_ENEMIES.some(n=>n.id===e.id));
  const legacyEvents=['sealed-door','false-radio','abandoned-meal','mirror-corridor','red-file','hanging-sign','returning-footsteps','stalled-minute','fallen-shutter','last-sale','empty-queue','pressure-valve','moving-ladder','unlabeled-vial','repeating-monitor','unlit-crossing','hollow-waymark'];
  const originalRegional=['last-sale','empty-queue','pressure-valve','moving-ladder','unlabeled-vial','repeating-monitor','unlit-crossing','hollow-waymark'];
  const areaContained=id=>EXPLORATION_AREAS.find(a=>a.id===id).abnos.filter(n=>state.exploration.abnormalityProgress[n]?.contained).length;
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
    {id:'RPG-A15',cat:'商店',name:'有備而來',desc:'在探索商店完成 5 次購買',target:5,progress:function(){ensureExplorationState();return state.exploration.stats.shopPurchases||0},reward:{gold:150,box:1}}
  ];
  defs.push(
    {id:'RPG-A16',cat:'記錄',name:'不只一種日常',desc:'記錄 6 種不同支出分類',target:6,progress:()=>new Set(state.entries.filter(e=>e.type==='expense').map(e=>e.category)).size,reward:{gold:80}},
    {id:'RPG-A17',cat:'記錄',name:'收入也有來處',desc:'建立 10 筆收入紀錄',target:10,progress:()=>state.entries.filter(e=>e.type==='income').length,reward:{gold:100}},
    {id:'RPG-A18',cat:'探索',name:'四區足跡',desc:'探索全部 4 個初級區域',target:4,progress:()=>state.exploration.stats.visited.filter(id=>['zone-1','zone-2','zone-3','zone-4'].includes(id)).length,reward:{gold:180,box:1}},
    {id:'RPG-A19',cat:'探索',name:'意料之外',desc:'成功解決 10 次隨機事件',target:10,progress:()=>state.exploration.stats.eventsResolved||0,reward:{gold:120,water:3}},
    {id:'RPG-A20',cat:'收容',name:'一區安靜',desc:'完成一個區域全部怪異的收容',target:1,progress:()=>EXPLORATION_AREAS.filter(a=>a.abnos.every(id=>state.exploration.abnormalityProgress[id]?.contained)).length,reward:{gold:250,box:2}},
    {id:'RPG-A21',cat:'裝備',name:'同型整備',desc:'將同一種裝備配置給兩名罪人',target:2,progress:()=>Math.max(0,...Object.keys(FIELD_GEAR).map(id=>fieldGearCounts(id).used)),reward:{gold:100}},
    {id:'RPG-A22',cat:'成長',name:'熟練作業',desc:'任一罪人達 Lv.6，解鎖全部技能',target:6,progress:()=>Math.max(...Object.values(state.exploration.sinners).map(sinnerLevel)),reward:{gold:200,box:1}},
    {id:'RPG-A23',cat:'探索',name:'拆封的驚喜',desc:'開啟 10 個道具箱',target:10,progress:()=>state.exploration.stats.boxesOpened||0,reward:{gold:100,box:1}}
  );
  const hard=[
    {id:'RPG-H01',cat:'挑戰',name:'初級全域收容官',desc:'完成四個初級區域全部 20 種怪異收容',target:20,progress:()=>beginnerAbnos.filter(id=>state.exploration.abnormalityProgress[id]?.contained).length,reward:{gold:1500,box:5},badge:{id:'containment-master',name:'全域收容徽章',mark:'I'}},
    {id:'RPG-H02',cat:'挑戰',name:'十一份作戰檔案',desc:'初級 11 種普通敵人各擊敗至少 5 次',target:11,progress:()=>beginnerEnemies.filter(e=>(state.exploration.enemyProgress[e.id]?.kills||0)>=5).length,reward:{gold:900,box:3},badge:{id:'enemy-veteran',name:'討伐先鋒徽章',mark:'II'}},
    {id:'RPG-H03',cat:'挑戰',name:'每個岔路的答案',desc:'成功解決原有 17 種事件，每種至少 1 次',target:17,progress:()=>legacyEvents.filter(id=>(state.exploration.eventProgress[id]?.resolved||0)>0).length,reward:{gold:1000,box:3},badge:{id:'event-archivist',name:'異常解讀徽章',mark:'III'}},
    {id:'RPG-H04',cat:'挑戰',name:'區域專家',desc:'原有 8 種地區限定事件，各成功解決至少 3 次',target:8,progress:()=>originalRegional.filter(id=>(state.exploration.eventProgress[id]?.resolved||0)>=3).length,reward:{gold:900,box:3},badge:{id:'regional-expert',name:'四區勘察徽章',mark:'IV'}},
    {id:'RPG-H05',cat:'挑戰',name:'十二人的老練',desc:'12 名罪人全部達 Lv.10',target:12,progress:()=>Object.values(state.exploration.sinners).filter(d=>sinnerLevel(d)>=10).length,reward:{gold:1400,box:5},badge:{id:'sinner-veterans',name:'全員精銳徽章',mark:'V'}},
    {id:'RPG-H06',cat:'挑戰',name:'三十日的鐘聲',desc:'最佳連續記帳達 30 天',target:30,progress:()=>computeStreak().best,reward:{gold:800,box:3},badge:{id:'steady-clock',name:'三十日堅守徽章',mark:'VI'}},
    {id:'RPG-H07',cat:'挑戰',name:'黑區領航者',desc:'在外緣黑區成功解決 25 次隨機事件',target:25,progress:()=>state.exploration.stats.eventsResolvedByArea['zone-4']||0,reward:{gold:1200,box:4},badge:{id:'black-zone-guide',name:'黑區領航徽章',mark:'VII'}},
    {id:'RPG-H08',cat:'挑戰',name:'二百五十次出勤',desc:'累積完成 250 次探索',target:250,progress:()=>state.exploration.runs||0,reward:{gold:1000,box:4},badge:{id:'field-veteran',name:'長途出勤徽章',mark:'VIII'}}
  ];
  defs.push(
    {id:'RPG-A24',cat:'探索',name:'鞋上的鹽',desc:'探索沉潮港灣',target:1,progress:()=>Number(state.exploration.stats.visited.includes('zone-5')),reward:{gold:250,water:3}},
    {id:'RPG-A25',cat:'探索',name:'牆上的第一道記號',desc:'探索無窗迴廊',target:1,progress:()=>Number(state.exploration.stats.visited.includes('zone-6')),reward:{gold:300,potion:2}},
    {id:'RPG-A26',cat:'收容',name:'潮線之外',desc:'收容沉潮港灣的全部 6 種怪異',target:6,progress:()=>areaContained('zone-5'),reward:{gold:800,box:3}},
    {id:'RPG-A27',cat:'收容',name:'找到出口',desc:'收容無窗迴廊的全部 6 種怪異',target:6,progress:()=>areaContained('zone-6'),reward:{gold:1000,box:4}},
    {id:'RPG-A28',cat:'探索',name:'六區足跡',desc:'探索全部 6 個區域',target:6,progress:()=>EXPLORATION_AREAS.filter(a=>state.exploration.stats.visited.includes(a.id)).length,reward:{gold:500,box:2}},
    {id:'RPG-A29',cat:'裝備',name:'遠行整備',desc:'同時為兩名罪人配置新區域裝備',target:2,progress:()=>Object.values(state.exploration.sinners).filter(d=>REGIONAL_FIELD_GEAR[d.gear]).length,reward:{gold:350,box:1}}
  );
  hard.push(
    {id:'RPG-H09',cat:'挑戰',name:'潮與迴廊的封條',desc:'收容全部 12 種中級怪異',target:12,progress:()=>areaContained('zone-5')+areaContained('zone-6'),reward:{gold:2200,box:6},badge:{id:'intermediate-keeper',name:'深域收容徽章',mark:'IX'}},
    {id:'RPG-H10',cat:'挑戰',name:'深域討伐紀錄',desc:'6 種中級普通敵人各擊敗至少 10 次',target:6,progress:()=>INTERMEDIATE_ENEMIES.filter(e=>(state.exploration.enemyProgress[e.id]?.kills||0)>=10).length,reward:{gold:1600,box:4},badge:{id:'deep-hunter',name:'深域討伐徽章',mark:'X'}},
    {id:'RPG-H11',cat:'挑戰',name:'三十六條歸路',desc:'全部 36 種地區限定事件各成功解決至少 3 次',target:36,progress:()=>EXPLORATION_EVENTS.filter(e=>(state.exploration.eventProgress[e.id]?.resolved||0)>=3).length,reward:{gold:2000,box:5},badge:{id:'six-region-guide',name:'六區勘察徽章',mark:'XI'}},
    {id:'RPG-H12',cat:'挑戰',name:'遠行的全套工具',desc:'取得全部 6 種新區域罪人裝備',target:6,progress:()=>Object.keys(REGIONAL_FIELD_GEAR).filter(id=>state.exploration.fieldGear.includes(id)).length,reward:{gold:1400,box:3},badge:{id:'deep-outfitter',name:'遠行整備徽章',mark:'XII'}},
    {id:'RPG-H13',cat:'挑戰',name:'三十二份封存檔',desc:'完成全部 32 種怪異收容',target:32,progress:()=>containedAbnormalityCount(),reward:{gold:3000,box:8},badge:{id:'complete-keeper',name:'全域封存徽章',mark:'XIII'}}
  );
  hard.forEach(d=>{d.hard=true;d.reward.badge=d.badge.id;defs.push(d)});
  window.RPG_ACHIEVEMENTS=defs;
  let activeFilter='pending',category='all';

  function rewardText(r){const x=[];if(r.gold)x.push(r.gold+' 金幣');if(r.box)x.push('道具箱 ×'+r.box);if(r.water)x.push('瓶裝水 ×'+r.water);if(r.potion)x.push('治療藥水 ×'+r.potion);if(r.badge)x.push('成就徽章 ×1');return x.join('、')}
  function grant(r){ensurePlayerState();if(r.gold)state.rpg.gold+=r.gold;if(r.box)state.rpg.itemBoxes=(state.rpg.itemBoxes||0)+r.box;if(r.water)state.rpg.consumables.water+=r.water;if(r.potion)state.rpg.consumables.potion+=r.potion}
  function check(){
    ensureExplorationState();state.rpg.achievements=state.rpg.achievements||[];
    state.rpg.achievementBadges=Array.isArray(state.rpg.achievementBadges)?state.rpg.achievementBadges:[];
    const fresh=[];
    defs.forEach(function(x){let p=0;try{p=x.progress()}catch(e){}if(p>=x.target&&!state.rpg.achievements.includes(x.id)){state.rpg.achievements.push(x.id);grant(x.reward);fresh.push(x)}});
    let badgesChanged=false;hard.forEach(d=>{if(state.rpg.achievements.includes(d.id)&&!state.rpg.achievementBadges.some(b=>b.id===d.badge.id)){state.rpg.achievementBadges.push({id:d.badge.id,earnedAt:fresh.includes(d)?new Date().toISOString():''});badgesChanged=true;}});
    if(fresh.length){state.rpg.rewardLog='成就解鎖：'+fresh.map(function(x){return x.name}).join('、')+'\n獲得 '+fresh.map(function(x){return rewardText(x.reward)}).join('；');saveLocal()}
    if(badgesChanged&&!fresh.length)saveLocal();
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
      let medals=document.getElementById('achievementBadgeCollection');if(!medals){medals=document.createElement('section');medals.id='achievementBadgeCollection';medals.className='achievement-medals';summary.after(medals);}
      const owned=state.rpg.achievementBadges.filter(b=>hard.some(d=>d.badge.id===b.id));
      medals.innerHTML='<h3>成就徽章 · '+owned.length+' / '+hard.length+'</h3><p>完成困難挑戰後自動獲得。已獲得的徽章永久保留，會隨存檔一起保存。</p>'+(owned.length?'<div class="medal-grid">'+owned.map(b=>{const d=hard.find(d=>d.badge.id===b.id);return '<article class="achievement-medal"><span class="medal-emblem" aria-hidden="true">'+d.badge.mark+'</span><strong>'+d.badge.name+'</strong><span>'+d.name+(b.earnedAt?' · '+esc(new Date(b.earnedAt).toLocaleDateString('zh-TW')):'')+'</span></article>';}).join('')+'</div>':'<div class="medal-empty">尚未獲得徽章。可在「挑戰」類型查看目標與徽章。</div>');
      let filter=document.getElementById('achievementCategory');if(!filter){const wrap=document.createElement('label');wrap.className='achievement-category-filter';wrap.innerHTML='成就類型 <select id="achievementCategory"><option value="all">全部類型</option>'+[...new Set(defs.map(d=>d.cat))].map(c=>'<option>'+c+'</option>').join('')+'</select>';box.before(wrap);filter=wrap.querySelector('select');filter.onchange=()=>{category=filter.value;render()};}filter.value=category;
      const filtered=defs.filter(function(x){
        const on=unlocked.includes(x.id);
        return (category==='all'||x.cat===category)&&(activeFilter==='done'?on:!on);
      });
      box.innerHTML=filtered.length?filtered.map(function(x){
        const p=Math.min(x.target,Number(x.progress()||0)),on=unlocked.includes(x.id),pct=Math.round(p/x.target*100);
        return '<article class="achievement-card wood '+(on?'unlocked':'locked')+(x.hard?' hard':'')+'"><div class="achievement-badge">'+(on?'已完成':'進行中')+'</div>'+
          '<div class="achievement-id">'+x.id+'</div>'+(x.hard?'<div class="achievement-difficulty">困難挑戰</div>':'')+'<div class="achievement-category">'+x.cat+'</div><div class="achievement-name">'+x.name+'</div><div class="achievement-desc">'+x.desc+'</div>'+
          '<div class="quest-progress"><div style="width:'+pct+'%"></div></div><div class="achievement-progress-text">'+p+' / '+x.target+'</div>'+
          (x.badge?'<div class="achievement-badge-preview"><span class="medal-emblem" aria-hidden="true">'+x.badge.mark+'</span><span>'+x.badge.name+' · '+(on?'已獲得':'達成後獲得')+'</span></div>':'')+'<div class="achievement-reward-line">REWARD / '+rewardText(x.reward)+'</div></article>';
      }).join(''):'<div class="achievement-empty wood">'+(activeFilter==='done'?'目前還沒有已完成的成就。':'此類型目前沒有未完成成就。')+'</div>';
      const pendingBtn=document.getElementById('achievementPendingBtn'),doneBtn=document.getElementById('achievementDoneBtn');
      if(pendingBtn)pendingBtn.classList.toggle('active',activeFilter==='pending');
      if(doneBtn)doneBtn.classList.toggle('active',activeFilter==='done');
    }catch(err){const b=document.getElementById('achievementGrid');if(b)b.innerHTML='<div class="rpg-module-error">成就模組載入失敗：'+String(err.message||err)+'</div>'}
  }
  window.checkRpgAchievements=check;window.forceRenderAchievements=render;
  function setFilter(filter){
    activeFilter=filter==='done'?'done':'pending';
    render();
  }
  document.addEventListener('click',function(ev){
    const btn=ev.target&&ev.target.closest?ev.target.closest('[data-ach-filter]'):null;
    if(btn)setFilter(btn.dataset.achFilter);
  });
  render();
  document.querySelectorAll('[data-tab="progress"],[data-goto="progress"]').forEach(function(b){b.addEventListener('click',function(){setTimeout(render,0)})});
})();

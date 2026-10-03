/* LCB sinner core: identity, representative colors, RPG stats, EXP, HP, skills and combat */
const SINNERS=[
 {id:'01',name:'李箱',address:'但丁'},
 {id:'02',name:'浮士德',address:'但丁'},
 {id:'03',name:'堂吉訶德',address:'經理老爺'},
 {id:'04',name:'良秀',address:'時鐘'},
 {id:'05',name:'默爾索',address:'經理'},
 {id:'06',name:'鴻璐',address:'但丁閣下'},
 {id:'07',name:'希斯克利夫',address:'鐘錶頭'},
 {id:'08',name:'以實瑪利',address:'經理'},
 {id:'09',name:'羅佳',address:'但丁'},
 {id:'11',name:'辛克萊',address:'但丁經理'},
 {id:'12',name:'奧提斯',address:'執行經理'},
 {id:'13',name:'格里高爾',address:'經理'}
];
const SINNER_COLORS={
  '李箱':'#30363b',
  '浮士德':'#bd477d',
  '堂吉訶德':'#9b790d',
  '良秀':'#b43e49',
  '默爾索':'#4d6b85',
  '鴻璐':'#227b79',
  '希斯克利夫':'#78539e',
  '以實瑪利':'#ba5d22',
  '羅佳':'#a74360',
  '辛克萊':'#4d7737',
  '奧提斯':'#65712f',
  '格里高爾':'#886047',
  '阿賴耶':'#355f9f',
  '阿賴耶識':'#29456f'
};
function sinnerColorForSpeaker(speaker){
  const s=String(speaker||'');
  for(const name of Object.keys(SINNER_COLORS)){
    if(s.includes(name))return SINNER_COLORS[name];
  }
  return '#496b75';
}

const SINNER_FIELD_PROFILES={
 '李箱':{stats:{combat:4,observe:8,mobility:5,stability:7},specialty:'觀測解析',ego:'烏瞰刀',skills:[{lv:1,name:'烏瞰刀',desc:'怪異解析成功率提升'},{lv:3,name:'靜態推演',desc:'事件判定更穩定'},{lv:6,name:'軌跡讀取',desc:'高危區觀察加成'}]},
 '浮士德':{stats:{combat:5,observe:9,mobility:4,stability:8},specialty:'情報演算',ego:'表象放射器',skills:[{lv:1,name:'表象放射器',desc:'未知事件情報加成'},{lv:3,name:'最優解搜索',desc:'探索失敗懲罰降低'},{lv:6,name:'情報重構',desc:'裝備發現率提升'}]},
 '堂吉訶德':{stats:{combat:7,observe:4,mobility:8,stability:5},specialty:'先鋒突入',ego:'桑丘之血',skills:[{lv:1,name:'桑丘之血',desc:'戰鬥遭遇輸出提升'},{lv:3,name:'疾行突入',desc:'低中危區機動加成'},{lv:6,name:'不退之勢',desc:'負傷時仍保有戰力'}]},
 '良秀':{stats:{combat:9,observe:6,mobility:7,stability:4},specialty:'弱點切割',ego:'森羅炎象',skills:[{lv:1,name:'森羅炎象',desc:'怪異戰鬥爆發提升'},{lv:3,name:'斷面鑑賞',desc:'高危怪異弱點判定加成'},{lv:6,name:'收尾美學',desc:'擊殺時額外 EXP 機率提升'}]},
 '默爾索':{stats:{combat:8,observe:5,mobility:4,stability:9},specialty:'制壓固定',ego:'他人之鎖',skills:[{lv:1,name:'他人之鎖',desc:'制壓怪異時穩定性提升'},{lv:3,name:'程序執行',desc:'降低隨機事件波動'},{lv:6,name:'固定拘束',desc:'收容擊殺計數成功率提升'}]},
 '鴻璐':{stats:{combat:5,observe:7,mobility:8,stability:6},specialty:'適應感知',ego:'太虛幻境',skills:[{lv:1,name:'太虛幻境',desc:'稀有事件發現率提升'},{lv:3,name:'環境適應',desc:'區域等級差懲罰降低'},{lv:6,name:'餘裕觀察',desc:'額外道具機率提升'}]},
 '希斯克利夫':{stats:{combat:9,observe:4,mobility:7,stability:5},specialty:'強襲突破',ego:'裹屍袋',skills:[{lv:1,name:'裹屍袋',desc:'戰鬥判定大幅加成'},{lv:3,name:'硬闖',desc:'失敗時仍可能造成擊殺進度'},{lv:6,name:'怒勢追擊',desc:'高危遭遇追加戰力'}]},
 '以實瑪利':{stats:{combat:7,observe:8,mobility:6,stability:8},specialty:'追跡與風險判讀',ego:'捕鯨叉',skills:[{lv:1,name:'捕鯨叉',desc:'追跡怪異與戰鬥兼具加成'},{lv:3,name:'航路判讀',desc:'事件與補給發現率提升'},{lv:6,name:'獵物鎖定',desc:'重複遭遇同怪異時加成'}]},
 '羅佳':{stats:{combat:7,observe:5,mobility:7,stability:6},specialty:'機會判斷',ego:'覆水難收',skills:[{lv:1,name:'覆水難收',desc:'隨機事件收益波動提高'},{lv:3,name:'順手牽來',desc:'道具獲得量提升機率'},{lv:6,name:'賭一把',desc:'高風險探索成功時額外獎勵'}]},
 '辛克萊':{stats:{combat:6,observe:6,mobility:7,stability:5},specialty:'成長適應',ego:'知識樹之枝',skills:[{lv:1,name:'知識樹之枝',desc:'探索 EXP 獲得提高'},{lv:3,name:'迅速學習',desc:'等級低於區域時獲得更多 EXP'},{lv:6,name:'決意突破',desc:'危急事件戰力提升'}]},
 '奧提斯':{stats:{combat:7,observe:8,mobility:5,stability:8},specialty:'戰術指揮',ego:'致智慧與苦難',skills:[{lv:1,name:'致智慧與苦難',desc:'雙人隊伍整體判定提升'},{lv:3,name:'隊形校正',desc:'搭檔能力差距轉為加成'},{lv:6,name:'作戰預案',desc:'高危區失敗率下降'}]},
 '格里高爾':{stats:{combat:7,observe:6,mobility:5,stability:9},specialty:'生存韌性',ego:'某一日，突然',skills:[{lv:1,name:'某一日，突然',desc:'負傷與失敗事件抗性提升'},{lv:3,name:'老兵直覺',desc:'伏擊事件較易脫離'},{lv:6,name:'殘存韌性',desc:'低狀態時額外穩定加成'}]}
};


function sinnerLevel(data){return Math.max(1,Math.floor(Number(data&&data.exp||0)/100)+1)}
function ensureExplorationState(){
  if(!state.exploration){
    const sinners={};
    Object.keys(SINNER_FIELD_PROFILES).forEach(function(name){sinners[name]={exp:0,hp:100,maxHp:100,gear:''}});
    state.exploration={
      actions:state.entries.length,
      earned:state.entries.length,
      spent:0,
      runs:0,
      selected:['李箱','浮士德'],
      areaId:'zone-1',
      sinners:sinners,
      fieldGear:['field-vest','survey-lens'],
      abnormalityProgress:{},
      seenAbnormalities:[],
      lastResult:null
    };
  }
  if(!['balanced','potionFirst','conserve'].includes(state.exploration.healPolicy))state.exploration.healPolicy='balanced';
  state.exploration.spent=Math.max(0,Number(state.exploration.spent||0));
  state.exploration.bonusActions=Math.max(0,Number(state.exploration.bonusActions||0));
  state.exploration.earned=state.entries.length+state.exploration.bonusActions;
  state.exploration.actions=Math.max(0,state.exploration.earned-state.exploration.spent);
  state.exploration.logs=Array.isArray(state.exploration.logs)?state.exploration.logs:[];
  state.exploration.activeShop=state.exploration.activeShop||null;
  state.exploration.enemyProgress=state.exploration.enemyProgress||{};
  if(!state.exploration.eventProgress){
    state.exploration.eventProgress={};
    (state.exploration.logs||[]).forEach(l=>{
      const ev=typeof EXPLORATION_EVENTS!=='undefined'?EXPLORATION_EVENTS.find(e=>String(l.title||'').includes(e.name)):null;
      const id=l.kind==='event'?(l.eventId||ev?.id):l.kind==='shop'&&l.areaId?'shop-'+l.areaId:null;
      if(!id)return;const p=state.exploration.eventProgress[id]||(state.exploration.eventProgress[id]={encounters:0,resolved:0});p.encounters++;if(l.stamp==='RESOLVED')p.resolved++;
    });
  }
  state.exploration.encounters=state.exploration.encounters||Object.fromEntries((state.exploration.seenAbnormalities||[]).map(id=>[id,1]));
  state.exploration.stats=state.exploration.stats||{};
  state.exploration.stats.visited=Array.isArray(state.exploration.stats.visited)?state.exploration.stats.visited: [...new Set(state.exploration.logs.map(l=>l.areaId).filter(Boolean))];
  ['eventsResolved','shopPurchases'].forEach(k=>{if(state.exploration.stats[k]==null)state.exploration.stats[k]=state.exploration.logs.filter(l=>k==='eventsResolved'?l.kind==='event'&&l.stamp==='RESOLVED':l.kind==='shop'&&String(l.reward).includes('購入')).length});
  const fieldStats=state.exploration.stats;
  if(!fieldStats.eventsResolvedByArea){fieldStats.eventsResolvedByArea={};state.exploration.logs.filter(l=>l.kind==='event'&&l.stamp==='RESOLVED').forEach(l=>{if(l.areaId)fieldStats.eventsResolvedByArea[l.areaId]=(fieldStats.eventsResolvedByArea[l.areaId]||0)+1;});}
  ['supplyRecovered','gearRecovered','supplyFailures','gearFailures','fieldIncidentsWithInjury'].forEach(k=>{if(fieldStats[k]==null)fieldStats[k]=0;});
  Object.values(state.exploration.eventProgress).forEach(p=>{if(p.failures==null)p.failures=Math.max(0,(p.encounters||0)-(p.resolved||0));});
  if(!state.exploration.dailyProgress){
    state.exploration.dailyProgress={};state.exploration.logs.filter(l=>l.kind!=='revive').forEach(l=>{const key=localDateKey(l.at);if(!key)return;const day=state.exploration.dailyProgress[key]||(state.exploration.dailyProgress[key]={runs:0,suppressions:0});day.runs++;if(['SUPPRESSED','CONTAINED'].includes(l.stamp))day.suppressions++;});
  }
  state.exploration.runs=Math.max(0,Number(state.exploration.runs||0));
  state.exploration.selected=Array.isArray(state.exploration.selected)?state.exploration.selected.slice(0,2):['李箱','浮士德'];
  state.exploration.fieldGear=Array.isArray(state.exploration.fieldGear)?state.exploration.fieldGear:[];
  state.exploration.abnormalityProgress=state.exploration.abnormalityProgress||{};
  state.exploration.seenAbnormalities=Array.isArray(state.exploration.seenAbnormalities)?state.exploration.seenAbnormalities:[];
  state.exploration.sinners=state.exploration.sinners||{};
  Object.keys(SINNER_FIELD_PROFILES).forEach(function(name){
    const old=state.exploration.sinners[name]||{};
    const maxHp=Math.max(1,Number(old.maxHp||100)),legacyHp=old.hp!=null?old.hp:(old.condition!=null?old.condition:maxHp);
    state.exploration.sinners[name]={exp:Number(old.exp||0),hp:Math.max(0,Math.min(maxHp,Number(legacyHp))),maxHp:maxHp,gear:old.gear||''};
  });
}
function grantExplorationActions(n){
  // 行動點數由「目前記帳筆數 + 額外獎勵行動 - 已消耗探索次數」直接推導，避免不同畫面不同步。
  ensureExplorationState();
  return state.exploration.actions;
}
function sinnerEffectiveStats(name,ctx={}){
  ensureExplorationState();
  const profile=SINNER_FIELD_PROFILES[name],data=state.exploration.sinners[name],lv=sinnerLevel(data);
  const stats={...profile.stats};
  const effects=sinnerSkillEffects(name,ctx);
  Object.keys(stats).forEach(k=>stats[k]+=effects[k]||0);
  const gear=FIELD_GEAR[data.gear];
  if(gear)Object.keys(gear.stats).forEach(function(k){stats[k]=(stats[k]||0)+gear.stats[k]});
  const lvBonus=Math.floor((lv-1)/2);
  Object.keys(stats).forEach(function(k){stats[k]+=lvBonus});
  if(data.hp/data.maxHp<0.5)Object.keys(stats).forEach(function(k){stats[k]=Math.max(1,stats[k]-1)});
  return stats;
}
function unlockedFieldSkills(name){
  const data=state.exploration.sinners[name],lv=sinnerLevel(data);
  return SINNER_FIELD_PROFILES[name].skills.filter(function(x){return lv>=x.lv});
}
function awardSinnerExp(name,amount){
  ensureExplorationState();
  const data=state.exploration.sinners[name],before=sinnerLevel(data);
  data.exp+=Math.max(0,Math.round(amount));
  const after=sinnerLevel(data);
  return {before:before,after:after,gained:amount};
}
function teamFieldPower(names,area){
 const stats=names.map(n=>sinnerEffectiveStats(n,{area}));let total=0,relief=0;
 names.forEach((name,i)=>{const st=stats[i],ef=sinnerSkillEffects(name,{area}),lv=sinnerLevel(state.exploration.sinners[name]);
  total+=st.combat*1.1+st.observe+st.mobility*.7+st.stability*.9+lv*1.5+(ef.eventPower||0)+(names.length===2?ef.teamPower||0:0);
  if(names.length===2&&ef.disparityBonus){const other=stats[1-i];total+=Object.keys(st).reduce((sum,k)=>sum+Math.abs(st[k]-other[k]),0)*ef.disparityBonus;}
  relief+=ef.levelPenaltyRelief||0;
 });return total-area.level*2*(1-relief/names.length);
}
function maybeAutoHealSinner(name){return applyFieldHealing(name)}
function reviveSinner(name){
 const result=reviveFieldSinners([name]);if(result)toast(name+' 已復活'+(result.borrowed?'（已預扣 1 行動）':''));
}

function sinnerCombatDamage(name,ab,area){
 const st=sinnerEffectiveStats(name,{ab,area}),lv=sinnerLevel(state.exploration.sinners[name]),ef=sinnerSkillEffects(name,{ab,area});
 const support=equipmentEffects().allDamage||0,flat=(ef.flatDamage||0)+support;
 const notes=unlockedFieldSkills(name).filter(s=>sinnerSkillEnabled(name,s,{ab,area})&&Object.entries(s.effects||{}).some(([k,v])=>v&&(['damageBonus','flatDamage','combat','observe'].includes(k)||k==='highLevelDamage'&&ab.level>=5||k==='temporalObserve'&&temporalAbnormality(ab)))).map(s=>s.name);
 if(support)notes.push('管理支援 +'+support);
 const raw=st.combat*2.1+st.observe*.55+lv*1.7+flat+Math.random()*6;
 return {damage:Math.max(1,Math.round(raw*(1+(ef.damageBonus||0)))),notes};
}
function sinnerIncomingDamage(name,ab,killed,area){
 const st=sinnerEffectiveStats(name,{ab,area}),ef=sinnerSkillEffects(name,{ab,area});
 if(Math.random()>(killed?.28:.72))return 0;
 const base=5+ab.level*2+Math.floor(Math.random()*7)-Math.floor(st.stability*.65);
 return Math.max(1,Math.round(base*(ab.difficultyMultiplier||1)*(1-Math.min(.6,ef.damageReduction||0))));
}
function fieldGearCounts(id){
 const total=(state.exploration.fieldGear||[]).filter(g=>g===id).length;
 const users=Object.entries(state.exploration.sinners||{}).filter(([n,d])=>d.gear===id).map(([n])=>n);
 return {total,used:users.length,unused:Math.max(0,total-users.length),users};
}
function fieldGearAssignedElsewhere(gearId,name){
 const c=fieldGearCounts(gearId);return c.used-(state.exploration.sinners[name]?.gear===gearId?1:0)>=c.total;
}
function assignFieldGear(name,gearId){
  ensureExplorationState();
  if(gearId&&(!state.exploration.fieldGear.includes(gearId)||fieldGearAssignedElsewhere(gearId,name))){toast('這件裝備目前不可配置');return}
  state.exploration.sinners[name].gear=gearId||'';
  saveLocal();renderSinnerManagement();
}


const SINNER_STAT_GUIDE={
  combat:{name:'戰鬥',desc:'影響對怪異造成的基礎傷害；數值越高，直接制壓能力越強。'},
  observe:{name:'觀察',desc:'影響事件判讀、弱點辨識機率；辨識成功時隊伍本回合傷害 +15%。'},
  mobility:{name:'機動',desc:'影響戰鬥出手順序與閃避機率，也參與隊伍探索判定。'},
  stability:{name:'穩定',desc:'影響承受怪異攻擊與異常狀況時的抗性；數值越高，通常越不容易受到重傷。'}
};

window.SINNER_STAT_GUIDE=SINNER_STAT_GUIDE;
window.SINNER_FIELD_PROFILES=SINNER_FIELD_PROFILES;
window.SINNER_COLORS=SINNER_COLORS;
window.SINNERS=SINNERS;
window.sinnerColorForSpeaker=sinnerColorForSpeaker;
window.sinnerLevel=sinnerLevel;
window.ensureExplorationState=ensureExplorationState;
window.grantExplorationActions=grantExplorationActions;
window.sinnerEffectiveStats=sinnerEffectiveStats;
window.unlockedFieldSkills=unlockedFieldSkills;
window.awardSinnerExp=awardSinnerExp;
window.teamFieldPower=teamFieldPower;
window.maybeAutoHealSinner=maybeAutoHealSinner;
window.reviveSinner=reviveSinner;
window.sinnerCombatDamage=sinnerCombatDamage;
window.sinnerIncomingDamage=sinnerIncomingDamage;
window.fieldGearAssignedElsewhere=fieldGearAssignedElsewhere;
window.assignFieldGear=assignFieldGear;


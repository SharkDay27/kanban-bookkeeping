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
  '李箱':'#5f86b8',
  '浮士德':'#63c6d4',
  '堂吉訶德':'#e0bd4f',
  '良秀':'#d34f57',
  '默爾索':'#6b8ba6',
  '鴻璐':'#5ec9c8',
  '希斯克利夫':'#8a6bb7',
  '以實瑪利':'#d88749',
  '羅佳':'#c8617b',
  '辛克萊':'#79a95a',
  '奧提斯':'#8e9a55',
  '格里高爾':'#9a7358',
  '阿賴耶':'#355f9f',
  '阿賴耶識':'#29456f'
};
function sinnerColorForSpeaker(speaker){
  const s=String(speaker||'');
  for(const name of Object.keys(SINNER_COLORS)){
    if(s.includes(name))return SINNER_COLORS[name];
  }
  return '#c9c5bb';
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
  state.exploration.spent=Math.max(0,Number(state.exploration.spent||0));
  state.exploration.earned=state.entries.length;
  state.exploration.actions=Math.max(0,state.exploration.earned-state.exploration.spent);
  state.exploration.logs=Array.isArray(state.exploration.logs)?state.exploration.logs:[];
  state.exploration.activeShop=state.exploration.activeShop||null;
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
  // 行動點數由「目前記帳筆數 - 已消耗探索次數」直接推導，避免不同畫面不同步。
  ensureExplorationState();
  return state.exploration.actions;
}
function sinnerEffectiveStats(name){
  ensureExplorationState();
  const profile=SINNER_FIELD_PROFILES[name],data=state.exploration.sinners[name],lv=sinnerLevel(data);
  const stats={...profile.stats};
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
  let total=0;
  names.forEach(function(name){
    const st=sinnerEffectiveStats(name),lv=sinnerLevel(state.exploration.sinners[name]);
    total+=st.combat*1.1+st.observe+st.mobility*.7+st.stability*.9+lv*1.5;
    if(name==='奧提斯')total+=2;
    if(name==='以實瑪利')total+=1.5;
    if(name==='浮士德')total+=1.5;
  });
  return total-area.level*2;
}
function maybeAutoHealSinner(name){
  const data=state.exploration.sinners[name];ensurePlayerState();
  if(data.hp<=0)return {amount:0,item:''};
  const ratio=data.hp/data.maxHp;
  if(ratio<=0.45&&(state.rpg.consumables.water||0)>0){
    state.rpg.consumables.water--;
    const before=data.hp;data.hp=Math.min(data.maxHp,data.hp+25);
    return {amount:data.hp-before,item:'瓶裝水'};
  }
  if(ratio<=0.20&&(state.rpg.consumables.potion||0)>0){
    state.rpg.consumables.potion--;
    const before=data.hp;data.hp=Math.min(data.maxHp,data.hp+45);
    return {amount:data.hp-before,item:'小型治療藥水'};
  }
  return {amount:0,item:''};
}
function reviveSinner(name){
  ensureExplorationState();const ex=state.exploration,data=ex.sinners[name];
  if(!data||data.hp>0)return;
  if(ex.actions<=0){toast('沒有可用行動點數，無法復活');return}
  ex.spent++;ex.actions=Math.max(0,state.entries.length-ex.spent);
  data.hp=Math.max(1,Math.round(data.maxHp*0.5));
  ex.logs=Array.isArray(ex.logs)?ex.logs:[];
  ex.logs.unshift({at:new Date().toISOString(),area:'LCB 巴士',names:[name],kind:'revive',title:'罪人復活：'+name,detail:'消耗 1 次探索行動，恢復至 '+data.hp+' / '+data.maxHp+' HP。',reward:'',stamp:'REVIVED',xp:0,dialogue:[]});
  saveLocal();try{renderExploration();renderSinnerManagement()}catch(e){console.error(e)}
  toast(name+' 已復活');
}
function sinnerCombatDamage(name,ab,area){
  const data=state.exploration.sinners[name],st=sinnerEffectiveStats(name),lv=sinnerLevel(data),skills=unlockedFieldSkills(name);
  let mult=1,flat=0,notes=[];
  if(name==='良秀'){mult+=.22;notes.push('弱點切割');if(lv>=3&&ab.level>=5)mult+=.12}
  if(name==='希斯克利夫'){mult+=.25;notes.push('強襲突破');if(lv>=6&&area.risk==='EXTREME')mult+=.12}
  if(name==='堂吉訶德'){mult+=.14;notes.push('先鋒突入')}
  if(name==='默爾索'){mult+=.10;flat+=2;notes.push('制壓固定')}
  if(name==='以實瑪利'){mult+=.12;notes.push('追跡判讀')}
  if(name==='奧提斯'){mult+=.08;notes.push('戰術指揮')}
  if(name==='李箱'&&Math.random()<.22){mult+=.25;notes.push('軌跡讀取')}
  if(name==='浮士德'){flat+=Math.floor(st.observe/3);notes.push('情報演算')}
  if(name==='辛克萊'&&lv>=6){mult+=.10;notes.push('決意突破')}
  const manager=equipmentEffects();
  if(manager.allDamage){flat+=manager.allDamage;notes.push('管理支援 +'+manager.allDamage)}
  const raw=(st.combat*2.1)+(st.observe*.55)+(lv*1.7)+flat+(Math.random()*6);
  return {damage:Math.max(1,Math.round(raw*mult)),notes:notes};
}
function sinnerIncomingDamage(name,ab,killed){
  const data=state.exploration.sinners[name],st=sinnerEffectiveStats(name);
  let chance=killed?.28:.72;
  if(name==='鴻璐')chance-=.08;
  if(Math.random()>chance)return 0;
  let base=5+ab.level*2+Math.floor(Math.random()*7)-Math.floor(st.stability*.65);
  if(name==='默爾索')base=Math.round(base*.7);
  if(name==='格里高爾')base=Math.round(base*.78);
  if(name==='以實瑪利')base=Math.round(base*.88);
  return Math.max(1,base);
}
function fieldGearAssignedElsewhere(gearId,name){
  return Object.entries(state.exploration.sinners).some(function(pair){return pair[0]!==name&&pair[1].gear===gearId});
}
function assignFieldGear(name,gearId){
  ensureExplorationState();
  if(gearId&&(!state.exploration.fieldGear.includes(gearId)||fieldGearAssignedElsewhere(gearId,name))){toast('這件裝備目前不可配置');return}
  state.exploration.sinners[name].gear=gearId||'';
  saveLocal();renderSinnerManagement();
}


const SINNER_STAT_GUIDE={
  combat:{name:'戰鬥',desc:'影響對怪異造成的基礎傷害；數值越高，直接制壓能力越強。'},
  observe:{name:'觀察',desc:'影響事件判讀、怪異弱點辨識與部分戰鬥修正。'},
  mobility:{name:'機動',desc:'影響探索中的移動、追擊與脫離能力，並參與隊伍探索判定。'},
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

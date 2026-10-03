/* Original regional content. Intermediate encounters use twice the combat HP and damage. */
const INTERMEDIATE_AREAS=[
 {id:'zone-5',name:'沉潮港灣',level:12,requiredLevel:12,tier:'intermediate',difficultyMultiplier:2,risk:'HIGH',desc:'退潮後才露出的碼頭、沉船艙室與潮汐觀測站。水位不依月相變化；回程前務必確認繫索。',abnos:['A-501','A-502','A-503','A-504','A-505','A-506']},
 {id:'zone-6',name:'無窗迴廊',level:16,requiredLevel:16,tier:'intermediate',difficultyMultiplier:2,risk:'EXTREME',desc:'黃牆、潮濕地毯與不停嗡鳴的燈管。房間彼此相似，門牌、步數與時間都可能失去意義。',abnos:['A-601','A-602','A-603','A-604','A-605','A-606']}
];
const INTERMEDIATE_ABNORMALITIES={
 'A-501':{name:'返航的空船',area:'zone-5',level:12,kills:5,type:'執念型',note:'一艘無人漁船反覆駛進泊位。接住它的纜繩後，岸上的人會聽見自己的離港廣播。'},
 'A-502':{name:'逆潮鐘',area:'zone-5',level:13,kills:5,type:'時間型',note:'鐘聲先於敲擊響起，附近浪花逐滴退回海面。兩次鐘聲之間的時間長度不一致。'},
 'A-503':{name:'穿救生衣的人',area:'zone-5',level:13,kills:6,type:'誘引型',note:'在浪間揮手求援，衣內卻塞滿潮水。它靠近時，繫在岸上的繩索會朝水中滑去。'},
 'A-504':{name:'無聲鯨歌',area:'zone-5',level:14,kills:6,type:'聲響型',note:'水面下沒有可見個體。聽見歌聲的人會把四周的聲音誤認成來自水底。'},
 'A-505':{name:'鹽封的船長',area:'zone-5',level:15,kills:6,type:'擬人型',note:'全身覆著鹽殼，站在沉船舵前。每轉動一格船舵，附近通道便灌進一股海水。'},
 'A-506':{name:'第七次退潮',area:'zone-5',level:15,kills:7,type:'空間型',note:'退潮六次後，岸邊會多出一道原本不存在的潮痕。越過它的人會走進深海般幽暗的海床，回頭已看不見原來的碼頭。'},
 'A-601':{name:'請勿退房',area:'zone-6',level:16,kills:5,type:'執念型',note:'一張掛著房卡的空椅。房卡被拿走後，所有出口都會變成同一間客房。'},
 'A-602':{name:'第零層電梯',area:'zone-6',level:17,kills:5,type:'空間型',note:'只有零號按鍵亮著。電梯裡的樓層顯示每次開門都會少一位數。'},
 'A-603':{name:'比人早一步',area:'zone-6',level:17,kills:6,type:'時間型',note:'牆上的影子先於本人轉身。若追上影子，走廊會把追逐者剛走過的時間抹去。'},
 'A-604':{name:'地毯下的住客',area:'zone-6',level:18,kills:6,type:'寄生型',note:'潮濕地毯下有一團人形隆起，會追隨人的腳步移動；它停在腳下時，地毯便向下凹陷，試圖拖住踩上去的人。'},
 'A-605':{name:'沒有收件人的廣播',area:'zone-6',level:19,kills:6,type:'認知型',note:'天花板反覆呼叫通訊名單上沒有的姓名。若有人代為回答，自己的名字便會從終端上消失，搭檔也會逐漸認不出其聲音。'},
 'A-606':{name:'盡頭的自己',area:'zone-6',level:19,kills:7,type:'模仿型',note:'走廊盡頭有穿著探索者裝備的背影，總在探索者停步後才停下。靠近時，它會轉身露出相同的臉，伸手試圖將來者拉向身後的門。'}
};
const INTERMEDIATE_ENEMIES=[
 {id:'E-501',name:'潮穴鉗蟹',area:'zone-5',type:'野獸',level:12,hp:105,note:'盤據碼頭裂縫的巨蟹，以鉗腳夾斷繫索。',drop:'潮蟹硬鉗',price:90},
 {id:'E-502',name:'沉艙掠奪者',area:'zone-5',type:'人類',level:13,hp:115,note:'熟悉沉船內部的掠奪者，以漁叉攔截回收隊。',drop:'鍍錫漁叉頭',price:105},
 {id:'E-503',name:'故障潛航機',area:'zone-5',type:'機械',level:14,hp:125,note:'仍在碼頭水道巡行，以切割臂破壞攔路物。',drop:'耐壓螺旋芯',price:120},
 {id:'E-601',name:'壁縫爬行蟲',area:'zone-6',type:'野獸',level:16,hp:125,note:'在黃牆背面築巢，從剝落的壁紙下湧出。',drop:'蠟色甲殼',price:125},
 {id:'E-602',name:'迷廊佔據者',area:'zone-6',type:'人類',level:17,hp:135,note:'在迴廊中滯留的武裝者，會拆除他人的路線標記。',drop:'磨損黃銅鑰匙',price:140},
 {id:'E-603',name:'失控樓層巡機',area:'zone-6',type:'機械',level:18,hp:145,note:'沿牆掃描熱源的巡機，轉角後會立即突進。',drop:'蜂巢掃描模組',price:155}
];
const REGIONAL_FIELD_GEAR={
 'tide-harness':{name:'潮汐安全索',rarity:'rare',areas:['zone-5'],desc:'穩定 +4、機動 +2。固定繫索與重心，提高生存及回收判定。',stats:{stability:4,mobility:2}},
 'pressure-lens':{name:'耐壓觀測罩',rarity:'epic',areas:['zone-5'],desc:'觀察 +5、穩定 +2。協助潮下觀測與事件判讀。',stats:{observe:5,stability:2}},
 'boarding-pike':{name:'登艙制壓槍',rarity:'epic',areas:['zone-5'],desc:'戰鬥 +5、機動 +2。適合狹窄船艙的近距離制壓。',stats:{combat:5,mobility:2}},
 'route-spool':{name:'迴廊導引線',rarity:'rare',areas:['zone-6'],desc:'觀察 +4、機動 +3。標記轉角，提高事件與回收成功率。',stats:{observe:4,mobility:3}},
 'echo-guard':{name:'隔響作業盔',rarity:'epic',areas:['zone-6'],desc:'穩定 +5、觀察 +2。減少承傷，協助辨識異常來源。',stats:{stability:5,observe:2}},
 'corner-blade':{name:'轉角截擊刃',rarity:'legendary',areas:['zone-6'],desc:'戰鬥 +6、機動 +3。強化近距離攻擊與複雜地形移動。',stats:{combat:6,mobility:3}}
};
const REGIONAL_SUPPORT_GEAR={
 '潮位校對儀':{slot:'工具',rarity:'epic',areas:['zone-5'],desc:'事件與補給／裝備回收判定 +8；裝備後適用所有區域。',eventBonus:.20,source:'沉潮港灣商店'},
 '登艙指揮旗':{slot:'工具',rarity:'epic',areas:['zone-5'],desc:'全隊每次攻擊基礎傷害 +8，戰鬥 EXP +8%；裝備後適用所有區域。',allDamage:8,exploreXpBonus:.08,source:'沉潮港灣商店'},
 '迴廊校準盤':{slot:'工具',rarity:'epic',areas:['zone-6'],desc:'事件與補給／裝備回收判定 +10；裝備後適用所有區域。',eventBonus:.25,source:'無窗迴廊商店'},
 '返程信標':{slot:'徽章',rarity:'legendary',areas:['zone-6'],desc:'全隊基礎戰鬥傷害 +10、事件與回收判定 +4；裝備後適用所有區域。',allDamage:10,eventBonus:.10,source:'無窗迴廊商店'}
};
function resolveAbnormalityCombat(names,ab,area){
 const multiplier=area.difficultyMultiplier||1,maxHp=Math.round((30+ab.level*12)*multiplier),ex=state.exploration;
 const enemy={...ab,difficultyMultiplier:multiplier},attacks=names.map(name=>({name,damage:0,notes:[]}));
 const injuries=names.map(name=>({name,damage:0,hp:ex.sinners[name].hp,maxHp:ex.sinners[name].maxHp,healed:{amount:0,item:''}}));
 let remaining=maxHp,rounds=0;
 do{
  rounds++;
  attacks.forEach(hit=>{if(ex.sinners[hit.name].hp<=0||remaining<=0)return;const roll=sinnerCombatDamage(hit.name,enemy,area);const damage=Math.min(remaining,roll.damage);remaining-=damage;hit.damage+=damage;hit.notes=[...new Set(hit.notes.concat(roll.notes))];});
  injuries.forEach(inj=>{const data=ex.sinners[inj.name];if(data.hp<=0)return;const damage=sinnerIncomingDamage(inj.name,enemy,remaining===0);inj.damage+=damage;data.hp=Math.max(0,data.hp-damage);const heal=maybeAutoHealSinner(inj.name);inj.healed.amount+=heal.amount;if(heal.item)inj.healed.item=heal.item;inj.hp=data.hp;});
 }while(multiplier>1&&remaining>0&&names.some(n=>ex.sinners[n].hp>0)&&rounds<30);
 return {maxHp,attacks,injuries,remaining,killed:remaining===0,rounds};
}

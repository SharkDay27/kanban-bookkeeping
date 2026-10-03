/* Original regional content. Intermediate encounters use twice the combat HP and damage. */
const INTERMEDIATE_AREAS=[
 {id:'zone-5',name:'沉潮港灣',level:12,requiredLevel:12,tier:'intermediate',difficultyMultiplier:2,risk:'HIGH',desc:'退潮後才露出的碼頭、沉船艙室與潮汐觀測站。水位不依月相變化；回程前務必確認繫索。',abnos:['A-501','A-502','A-503','A-504','A-505','A-506']},
 {id:'zone-6',name:'無窗迴廊',level:16,requiredLevel:16,tier:'intermediate',difficultyMultiplier:2,risk:'EXTREME',desc:'黃牆、潮濕地毯與不停嗡鳴的燈管。房間彼此相似，門牌、步數與時間都可能失去意義。',abnos:['A-601','A-602','A-603','A-604','A-605','A-606']},
 ...FRONTIER_AREAS
];
const INTERMEDIATE_ABNORMALITIES={
 ...FRONTIER_ABNORMALITIES,
 'A-501':{name:'返航的空船',area:'zone-5',level:12,kills:5,type:'執念型',note:"一艘無人漁船，不停進同一個港位。接住它拋來的纜繩後，岸上的人會聽到廣播宣布自己已經離港。"},
 'A-502':{deathBurst:8,deathEffectLabel:'逆潮鐘殘響',name:'逆潮鐘',area:'zone-5',level:13,kills:5,type:'時間型',note:'鐘還沒被敲響，鐘聲就先傳了出來，附近的浪花也會倒退回海裡。每次鐘聲的間隔都不一樣；擊破鐘體後，殘留的聲響仍會傷人（擊倒時觸發一次殘響傷害）。'},
 'A-503':{name:'穿救生衣的人',area:'zone-5',level:13,kills:6,type:'誘引型',note:"穿著救生衣，在浪裡揮手求救，救生衣裡卻灌滿了海水。它一靠近，原本固定在岸上的繩索就開始滑向水中。"},
 'A-504':{name:'無聲鯨歌',area:'zone-5',level:14,kills:6,type:'聲響型',note:'水面下傳來鯨歌，卻找不到發出聲音的東西。聽過歌聲的人，會覺得身邊所有聲音都來自水底。'},
 'A-505':{name:'鹽封的船長',area:'zone-5',level:15,kills:6,type:'擬人型',note:'全身結著鹽殼，站在沉船的船舵前。它每轉動一下船舵，附近的通道就會湧進一股海水。'},
 'A-506':{name:'第七次退潮',area:'zone-5',level:15,kills:7,type:'空間型',note:"此海岸退潮六次後，會出現一道原本沒有的水痕。跨過那道痕跡，就像走進黑暗的深海海床，回頭也找不到原來的碼頭。"},
 'A-601':{name:'請勿退房',area:'zone-6',level:16,kills:5,type:'執念型',note:"空椅上掛著一張房卡。拿走房卡後，不管推開哪扇門，門後都會是同一間客房。"},
 'A-602':{name:'第零層電梯',area:'zone-6',level:17,kills:5,type:'空間型',note:'電梯裡只有「0」的按鍵亮著。每次開門，樓層顯示就會少一位數字，卻始終看不到熟悉的樓層。'},
 'A-603':{name:'比人早一步',area:'zone-6',level:17,kills:6,type:'時間型',note:'牆上的影子會比本人更早轉身。追上影子後，剛剛走過的那段時間就會消失，連自己何時走到這裡都說不清。'},
 'A-604':{name:'地毯下的住客',area:'zone-6',level:18,kills:6,type:'寄生型',note:"潮濕的地毯底下鼓起一個人形，會跟著腳步移動。它移到人的腳下時，地毯就會往下陷，把踩在上面的人拖住。"},
 'A-605':{name:'沒有收件人的廣播',area:'zone-6',level:19,kills:6,type:'認知型',note:"天花板的廣播不停呼叫不在現場的罪人名字，替那人答話後搭檔漸漸認不出自己的聲音。"},
 'A-606':{name:'盡頭的自己',area:'zone-6',level:19,kills:7,type:'模仿型',note:'走廊盡頭有一個穿著相同裝備的背影，總比來人晚一步停下。靠近後，它會轉身露出和來人一樣的臉，伸手把人拉向身後的門。'}
};
const INTERMEDIATE_ENEMIES=[
 ...FRONTIER_ENEMIES,
 {id:'E-501',name:'潮穴鉗蟹',area:'zone-5',type:'野獸',level:12,hp:105,note:'盤據碼頭裂縫的巨蟹，以鉗腳夾斷繫索。',drop:'潮蟹硬鉗',price:90},
 {id:'E-502',name:'沉艙掠奪者',area:'zone-5',type:'人類',level:13,hp:115,note:'熟悉沉船內部的掠奪者，以漁叉攔截回收隊。',drop:'鍍錫漁叉頭',price:105},
 {id:'E-503',name:'故障潛航機',area:'zone-5',type:'機械',level:14,hp:125,note:'仍在碼頭水道巡行，以切割臂破壞攔路物。',drop:'耐壓螺旋芯',price:120},
 {id:'E-601',name:'壁縫爬行蟲',area:'zone-6',type:'野獸',level:16,hp:125,note:'在黃牆背面築巢，從剝落的壁紙下湧出。',drop:'蠟色甲殼',price:125},
 {id:'E-602',name:'迷廊佔據者',area:'zone-6',type:'人類',level:17,hp:135,note:'在迴廊中滯留的武裝者，會拆除他人的路線標記。',drop:'磨損黃銅鑰匙',price:140},
 {id:'E-603',name:'失控樓層巡機',area:'zone-6',type:'機械',level:18,hp:145,note:'沿牆掃描熱源的巡機，轉角後會立即突進。',drop:'蜂巢掃描模組',price:155}
];
const REGIONAL_FIELD_GEAR={
 ...FRONTIER_FIELD_GEAR,
 'tide-harness':{name:'潮汐安全索',rarity:'rare',areas:['zone-5'],desc:'穩定 +4、機動 +2。固定繫索與重心，提高生存及回收判定。',stats:{stability:4,mobility:2}},
 'pressure-lens':{name:'耐壓觀測罩',rarity:'epic',areas:['zone-5'],desc:'觀察 +5、穩定 +2。協助潮下觀測與事件判讀。',stats:{observe:5,stability:2}},
 'boarding-pike':{name:'登艙制壓槍',rarity:'epic',areas:['zone-5'],desc:'戰鬥 +5、機動 +2。適合狹窄船艙的近距離制壓。',stats:{combat:5,mobility:2}},
 'route-spool':{name:'迴廊導引線',rarity:'rare',areas:['zone-6'],desc:'觀察 +4、機動 +3。標記轉角，提高事件與回收成功率。',stats:{observe:4,mobility:3}},
 'echo-guard':{name:'隔響作業盔',rarity:'epic',areas:['zone-6'],desc:'穩定 +5、觀察 +2。減少承傷，協助辨識異常來源。',stats:{stability:5,observe:2}},
 'corner-blade':{name:'轉角截擊刃',rarity:'legendary',areas:['zone-6'],desc:'戰鬥 +6、機動 +3。強化近距離攻擊與複雜地形移動。',stats:{combat:6,mobility:3}}
};
const REGIONAL_SUPPORT_GEAR={
 ...FRONTIER_SUPPORT_GEAR,
 '潮位校對儀':{slot:'工具',rarity:'epic',areas:['zone-5'],desc:'事件與補給／裝備回收判定 +8；裝備後適用所有區域。',eventBonus:.20,source:'沉潮港灣商店'},
 '登艙指揮旗':{slot:'工具',rarity:'epic',areas:['zone-5'],desc:'全隊每次攻擊基礎傷害 +8，戰鬥 EXP +8%；裝備後適用所有區域。',allDamage:8,exploreXpBonus:.08,source:'沉潮港灣商店'},
 '迴廊校準盤':{slot:'工具',rarity:'epic',areas:['zone-6'],desc:'事件與補給／裝備回收判定 +10；裝備後適用所有區域。',eventBonus:.25,source:'無窗迴廊商店'},
 '返程信標':{slot:'徽章',rarity:'legendary',areas:['zone-6'],desc:'全隊基礎戰鬥傷害 +10、事件與回收判定 +4；裝備後適用所有區域。',allDamage:10,eventBonus:.10,source:'無窗迴廊商店'}
};
function resolveAbnormalityCombat(names,ab,area){
 const multiplier=area.difficultyMultiplier||1,maxHp=Math.round((30+ab.level*12)*multiplier),enemy={...ab,difficultyMultiplier:multiplier};
 const fight=resolveFieldCombat(names,enemy,area,maxHp);
 return {...fight,killed:fight.success,attacks:fight.allies.map(a=>({name:a.name,damage:a.damage,notes:a.notes})),injuries:fight.allies.map(a=>({name:a.name,damage:a.taken,hp:a.hp,maxHp:a.maxHp,healed:a.healed}))};
}

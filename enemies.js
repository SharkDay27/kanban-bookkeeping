/* Ordinary opponents are separate from abnormalities and never add containment progress. */
const ENEMY_CATALOG=[
 ...INTERMEDIATE_ENEMIES,
 {id:'E-001',name:'流浪鬣犬',type:'野獸',area:'any',level:1,hp:45,note:'在廢棄通道和街巷間覓食，會追逐落單的行人。',drop:'鬣犬硬牙',price:12},
 {id:'E-002',name:'廢墟掠奪者',type:'人類',area:'any',level:1,hp:52,note:'在各區活動的掠奪者，攜帶簡陋武器，伺機搶走回收物。',drop:'掠奪者銅牌',price:16},
 {id:'E-003',name:'失控巡檢機',type:'機械',area:'any',level:2,hp:58,note:'沿殘存巡邏路線運作的小型機械，已無法辨別通行者。',drop:'報廢感測片',price:18},
 {id:'E-101',name:'商街扒手',type:'人類',area:'zone-1',level:1,hp:46,note:'躲在商店後場，利用櫃架與暗巷接近探索者。',drop:'銅製錶扣',price:14},
 {id:'E-102',name:'貨架爬蟲',type:'野獸',area:'zone-1',level:2,hp:56,note:'築巢於倒塌貨架間，會從紙箱與櫃板下突然竄出。',drop:'爬蟲硬殼',price:20},
 {id:'E-201',name:'鏽蝕維修機',type:'機械',area:'zone-2',level:3,hp:78,note:'僅在地下維修層運作，仍會以破損的工具臂驅逐靠近者。',drop:'鏽蝕傳動輪',price:26},
 {id:'E-202',name:'管道伏擊者',type:'人類',area:'zone-2',level:4,hp:88,note:'熟悉泵房和管道的伏擊者，經常封住轉角後再出手。',drop:'舊壓力錶',price:30},
 {id:'E-301',name:'封鎖區守衛',type:'人類',area:'zone-3',level:5,hp:110,note:'守著研究棟的殘餘警衛，把所有未登記的訪客視為入侵者。',drop:'失效識別晶片',price:38},
 {id:'E-302',name:'實驗室清掃機',type:'機械',area:'zone-3',level:6,hp:122,note:'損壞的清掃機仍在隔離區內反覆執行危險的清除程序。',drop:'陶瓷刀片',price:44},
 {id:'E-401',name:'黑區獵犬',type:'野獸',area:'zone-4',level:8,hp:150,note:'適應了失照軌道的獵犬，能憑細微聲響追蹤獵物。',drop:'黑區獸骨',price:54},
 {id:'E-402',name:'軌道劫掠者',type:'人類',area:'zone-4',level:9,hp:164,note:'盤據廢棄軌道的劫掠者，會從路基高處襲擊回收隊伍。',drop:'軌道合金扣',price:60}
];
const ENEMY_MATERIALS=Object.fromEntries(ENEMY_CATALOG.map(e=>[e.drop,{price:e.price,source:e.name,desc:'戰利品素材，僅供出售換取金幣。'}]));
function enemiesForArea(areaId){return ENEMY_CATALOG.filter(e=>(e.area==='any'&&EXPLORATION_AREAS.find(a=>a.id===areaId)?.tier==='beginner')||e.area===areaId)}
function enemyCombat(names,area){
 const ex=state.exploration,pool=enemiesForArea(area.id),base=pool[Math.floor(Math.random()*pool.length)];
 const enemy={...base,difficultyMultiplier:area.difficultyMultiplier||1,level:base.area==='any'?Math.max(base.level,area.level):base.level};
 const maxHp=Math.round((base.hp+(enemy.level-base.level)*12)*(area.difficultyMultiplier||1));const fight=resolveFieldCombat(names,enemy,area,maxHp),{remaining:hp,rounds,allies,success}=fight;
 ex.enemyProgress[enemy.id]=ex.enemyProgress[enemy.id]||{encounters:0,kills:0};
 ex.enemyProgress[enemy.id].encounters++;if(success)ex.enemyProgress[enemy.id].kills++;
 ex.encounters[enemy.id]=(ex.encounters[enemy.id]||0)+1;
 let reward='未取得戰利品';
 if(success){const qty=1+Math.floor(Math.random()*2);for(let i=0;i<qty;i++)state.rpg.inventory.push(enemy.drop);reward=enemy.drop+' ×'+qty+'（販售素材，單價 '+enemy.price+' G）';}
 return {title:(success?'敵方擊敗：':'敵方交戰：')+enemy.name,detail:'自動完成 '+rounds+' 回合交戰。'+(success?'敵方已擊敗。':'隊伍停止交戰，未取得素材。'),reward,stamp:success?'VICTORY':'DEFEAT',xp:success?22+enemy.level*2:10+enemy.level,success,enemyId:enemy.id,
  combat:{enemy:{name:enemy.name,maxHp,remaining:hp,level:enemy.level,type:enemy.type,category:'ordinary'},allies,timeline:fight.timeline,healPolicy:fight.healPolicy,result:{success,rounds,stopReason:fight.stopReason,drops:success?reward:''}}};
}

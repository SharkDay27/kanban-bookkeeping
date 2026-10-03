/* Revival is a separate operation: one charge per operation, including a two-person wipe. */
function explorationActionDebt(){return Math.max(0,state.exploration.spent-(state.entries.length+(state.exploration.bonusActions||0)))}
function refreshRevivalViews(){
 for(const fn of [window.renderExploration,window.renderRpg,window.forceRenderSinnerManagement])if(typeof fn==='function')fn();
}
function reviveFieldSinners(names,automatic=false){
 ensureExplorationState();const ex=state.exploration,fallen=[...new Set(names)].filter(n=>ex.sinners[n]&&ex.sinners[n].hp<=0);
 if(!fallen.length)return null;
 const borrowed=ex.actions<=0;
 ex.spent++;ex.actions=Math.max(0,state.entries.length+(ex.bonusActions||0)-ex.spent);
 fallen.forEach(n=>ex.sinners[n].hp=Math.max(1,Math.round(ex.sinners[n].maxHp*.5)));
 const debt=explorationActionDebt(),cost=borrowed?'預扣 1 次探索行動':'消耗 1 次探索行動';
 const detail='但丁轉動時鐘，'+(automatic?'強行將兩名罪人從死亡中帶回。':'讓'+fallen.join('、')+'重新甦醒。')+cost+'，'+fallen.map(n=>n+' 恢復至 '+ex.sinners[n].hp+' / '+ex.sinners[n].maxHp+' HP').join('；')+'。'+(debt?'目前尚欠 '+debt+' 次行動；之後新增記帳取得的行動會先抵銷欠額。':'');
 ex.logs.unshift({at:new Date().toISOString(),area:'LCB 巴士',names:fallen,kind:'revive',title:automatic?'但丁緊急復活隊伍':'罪人復活：'+fallen.join('、'),detail,reward:'',stamp:'REVIVED',xp:0,dialogue:[],automatic,borrowed,actionCost:1});
 ex.logs=ex.logs.slice(0,100);state.rpg.rewardLog=detail;saveLocal();refreshRevivalViews();
 return {names:fallen,detail,borrowed,debt};
}
function showFieldRevivalDialog(names,automatic=false){
 const dlg=document.getElementById('fieldRevivalDialog');if(!dlg)return;
 const title=document.getElementById('fieldRevivalTitle'),message=document.getElementById('fieldRevivalMessage'),confirm=document.getElementById('fieldRevivalConfirm'),cancel=document.getElementById('fieldRevivalCancel');
 if(dlg.open)dlg.close();
 title.textContent=automatic?'但丁緊急介入':names.join('、')+'已倒下';
 if(automatic){
  const result=reviveFieldSinners(names,true);if(!result)return;message.textContent=result.detail;confirm.textContent='繼續';cancel.hidden=true;confirm.onclick=()=>dlg.close();
 }else{
  const debt=state.exploration.actions<=0;
  message.textContent='是否讓但丁轉動時鐘，復活'+names.join('、')+'？復活後恢復 50% HP，'+(debt?'將預扣 1 次探索行動；之後新增記帳取得的行動會先抵銷欠額。':'消耗 1 次探索行動。')+'倒下的罪人無法使用水或藥水恢復。';
  confirm.textContent=debt?'預扣 1 行動復活':'消耗 1 行動復活';cancel.hidden=false;cancel.textContent='稍後復活';
  confirm.onclick=()=>{reviveFieldSinners(names);dlg.close()};cancel.onclick=()=>dlg.close();
 }
 dlg.showModal();
}
function handleExplorationKnockouts(names){
 const fallen=names.filter(n=>state.exploration.sinners[n]?.hp<=0);
 if(fallen.length)showFieldRevivalDialog(fallen,fallen.length===2);
}
function fieldGearStatLabel(gear){const labels={combat:'戰鬥',observe:'觀察',mobility:'機動',stability:'穩定'};return Object.entries(gear.stats||{}).map(([key,value])=>(labels[key]||key)+' '+(value>=0?'+':'')+value).join('、')||'無額外能力值'}

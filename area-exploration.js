/* Independent region selection; state remains in the shared save. */
window.renderExplorationAreas=function(){
 const box=document.getElementById('explorationAreas');if(!box)return;const ex=state.exploration;
 box.innerHTML=EXPLORATION_AREAS.map(a=>{
  const locked=!!a.requiredLevel&&(ex.selected.length!==2||ex.selected.some(n=>sinnerLevel(ex.sinners[n])<a.requiredLevel));const active=ex.areaId===a.id,done=a.abnos.length>0&&a.abnos.every(id=>ex.abnormalityProgress[id]?.contained);
  return '<button type="button" aria-pressed="'+active+'" class="exploration-area-card wood tier-'+a.tier+' '+(active?'active ':'')+(locked?'level-locked ':'')+(done?'contained':'')+'" data-area="'+a.id+'"><div class="area-card-top"><span class="area-risk">RISK / '+a.risk+'</span>'+(active?'<span class="area-selected">已選擇 ✓</span>':'')+'</div><div class="area-name">'+esc(a.name)+'</div><div class="area-level">'+(a.tier==='intermediate'?'中級 · 兩名罪人需 Lv.':'初級 · 建議 Lv.')+a.level+(a.tier==='intermediate'?' · 戰鬥耐久／傷害 ×2':'')+(locked?' · 等級未達':'')+'</div><div class="area-desc">'+esc(a.desc)+'</div>'+(done?'<span class="contained-seal area-seal">已收容</span>':'')+'</button>';
 }).join('');
 box.querySelectorAll('[data-area]').forEach(b=>b.onclick=()=>{ex.areaId=b.dataset.area;saveLocal();renderExploration();
  if(window.matchMedia('(max-width:700px)').matches){
   const picker=document.getElementById('explorationTeamPicker'),panel=picker?.closest('.panel');
   if(panel)requestAnimationFrame(()=>panel.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth',block:'start'}));
  }});
};

/* Independent region selection; state remains in the shared save. */
window.renderExplorationAreas=function(){
 const box=document.getElementById('explorationAreas');if(!box)return;const ex=state.exploration;
 box.innerHTML=EXPLORATION_AREAS.map(a=>{
  const active=ex.areaId===a.id,done=a.abnos.length>0&&a.abnos.every(id=>ex.abnormalityProgress[id]?.contained);
  return '<button type="button" aria-pressed="'+active+'" class="exploration-area-card wood '+(active?'active ':'')+(done?'contained':'')+'" data-area="'+a.id+'"><div class="area-card-top"><span class="area-risk">RISK / '+a.risk+'</span>'+(active?'<span class="area-selected">已選擇 ✓</span>':'')+'</div><div class="area-name">'+esc(a.name)+'</div><div class="area-level">建議等級 Lv.'+a.level+'</div><div class="area-desc">'+esc(a.desc)+'</div>'+(done?'<span class="contained-seal area-seal">已收容</span>':'')+'</button>';
 }).join('');
 box.querySelectorAll('[data-area]').forEach(b=>b.onclick=()=>{ex.areaId=b.dataset.area;saveLocal();renderExploration()});
};

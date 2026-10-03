/* Shared automatic combat: both ordinary foes and abnormalities follow the same phases. */
const FIELD_HEAL_POLICIES={
 balanced:{label:'均衡補給',desc:'HP ≤45% 使用水；HP ≤20% 優先藥水，重傷且沒有水時也會使用藥水。'},
 potionFirst:{label:'優先藥水',desc:'HP ≤45% 優先使用藥水；沒有藥水時使用水。'},
 conserve:{label:'節省補給',desc:'只在 HP ≤20% 時使用補給；依缺少的 HP 優先選水或藥水。'}
};
function fieldHealPolicy(){return FIELD_HEAL_POLICIES[state.exploration.healPolicy]?state.exploration.healPolicy:'balanced'}
function applyFieldHealing(name){
 const d=state.exploration.sinners[name];ensurePlayerState();if(!d||d.hp<=0)return {amount:0,item:''};
 const ratio=d.hp/d.maxHp,policy=fieldHealPolicy();if(ratio>(policy==='conserve'?.2:.45))return {amount:0,item:''};
 const priority=policy==='potionFirst'||policy==='balanced'&&ratio<=.2||policy==='conserve'&&d.maxHp-d.hp>=45?['potion','water']:['water','potion'];
 const item=priority.find(k=>(state.rpg.consumables[k]||0)>0&&(policy!=='balanced'||k!=='potion'||ratio<=.3));
 if(!item)return {amount:0,item:''};
 const effect={water:{amount:25,name:'瓶裝水'},potion:{amount:45,name:'小型治療藥水'}}[item],before=d.hp;
 state.rpg.consumables[item]--;d.hp=Math.min(d.maxHp,d.hp+effect.amount);
 return {amount:d.hp-before,item:effect.name,itemId:item};
}
function resolveFieldCombat(names,enemy,area,maxHp){
 const ex=state.exploration,allies=names.map(name=>({name,damage:0,taken:0,hp:ex.sinners[name].hp,maxHp:ex.sinners[name].maxHp,notes:[],healed:{amount:0,item:'',items:{}}}));
 const timeline=[];let remaining=maxHp,rounds=0;
 const alive=()=>allies.filter(a=>ex.sinners[a.name].hp>0);
 const effects=n=>sinnerSkillEffects(n,{ab:enemy,area});
 const stats=n=>sinnerEffectiveStats(n,{ab:enemy,area});
 const note=(a,text)=>{if(!a.notes.includes(text))a.notes.push(text)};
 function heal(a,events){const h=applyFieldHealing(a.name);if(!h.amount)return;a.healed.amount+=h.amount;a.healed.items[h.item]=(a.healed.items[h.item]||0)+1;a.healed.item=Object.entries(a.healed.items).map(([item,qty])=>item+' ×'+qty).join('、');events.push({kind:'heal',actor:a.name,text:a.name+'使用'+h.item+'，HP +'+h.amount+' → '+ex.sinners[a.name].hp});}
 function hurt(a,damage,events,source){
  const d=ex.sinners[a.name],taken=Math.min(d.hp,damage);if(taken<=0)return;d.hp-=taken;a.taken+=taken;
  events.push({kind:'hurt',actor:a.name,damage:taken,text:source+'：'+a.name+'受到 '+taken+' 傷害，HP '+d.hp+' / '+d.maxHp});
  if(d.hp<=0)events.push({kind:'down',actor:a.name,text:a.name+'已倒下。'});else heal(a,events);
 }
 function receive(a,events,deathEffect=false){
  if(ex.sinners[a.name].hp<=0)return;
  const ef=effects(a.name),evade=Math.min(.35,.03+stats(a.name).mobility*.012+(ef.evasion||0));
  if(!deathEffect&&Math.random()<evade){note(a,'閃避');events.push({kind:'dodge',actor:a.name,text:a.name+'避開'+enemy.name+'的攻擊。'});return;}
  let damage=deathEffect?Math.max(1,Math.round(enemy.deathBurst*(enemy.difficultyMultiplier||1)*(1-Math.min(.6,ef.damageReduction||0)))):sinnerIncomingDamage(a.name,enemy,false,area);
  if(!damage){events.push({kind:'miss',actor:enemy.name,text:enemy.name+'的攻擊未命中'+a.name+'。'});return;}
  const guard=alive().find(g=>g!==a&&effects(g.name).coverReduction&&ex.sinners[g.name].hp/ex.sinners[g.name].maxHp>.3);
  if(guard&&Math.random()<(effects(guard.name).coverChance||.3)){
   const blocked=Math.min(damage-1,Math.round(damage*effects(guard.name).coverReduction));
   if(blocked>0){damage-=blocked;note(guard,'掩護');events.push({kind:'cover',actor:guard.name,text:guard.name+'掩護'+a.name+'，減少 '+blocked+' 傷害。'});hurt(guard,Math.max(1,Math.round(blocked*.5*(1-Math.min(.6,effects(guard.name).damageReduction||0)))),events,'掩護承傷');}
  }
  hurt(a,damage,events,deathEffect?enemy.deathEffectLabel:enemy.name+'攻擊');
 }
 while(remaining>0&&alive().length&&rounds<30){
  rounds++;const events=[],startHp=remaining;
  // Mobility decides order; tied positions rotate rather than always favoring the first slot.
  const order=alive().sort((a,b)=>stats(b.name).mobility-stats(a.name).mobility||((names.indexOf(a.name)+rounds)%names.length)-((names.indexOf(b.name)+rounds)%names.length));
  const observer=alive().sort((a,b)=>stats(b.name).observe-stats(a.name).observe)[0];
  const expose=observer&&Math.random()<Math.min(.5,.04+stats(observer.name).observe*.02+(effects(observer.name).exposeChance||0));
  if(expose){note(observer,'弱點辨識');events.push({kind:'expose',actor:observer.name,text:observer.name+'辨識破綻，本回合隊伍傷害 +15%。'});}
  for(const a of order){
   if(remaining<=0||ex.sinners[a.name].hp<=0)break;
   const hit=sinnerCombatDamage(a.name,enemy,area),damage=Math.min(remaining,Math.round(hit.damage*(expose?1.15:1)));remaining-=damage;a.damage+=damage;hit.notes.forEach(n=>note(a,n));
   events.push({kind:'attack',actor:a.name,damage,text:a.name+'造成 '+damage+' 傷害'+(hit.notes.length?'（'+hit.notes.join('、')+'）':'')+'，敵方 HP '+remaining+' / '+maxHp});
  }
  if(remaining<=0){
   events.push({kind:'defeat',actor:enemy.name,text:enemy.name+'已擊倒，停止一般攻擊。'});
   if(enemy.deathBurst){events.push({kind:'deathEffect',actor:enemy.name,text:'特殊機制：'+enemy.deathEffectLabel+'（基礎傷害 '+enemy.deathBurst+'，受區域難度與減傷影響）。'});alive().slice().forEach(a=>receive(a,events,true));}
  }else{
   const interrupter=alive().find(a=>effects(a.name).interruptChance&&Math.random()<Math.min(.3,effects(a.name).interruptChance+stats(a.name).observe*.005));
   if(interrupter){note(interrupter,'打斷');events.push({kind:'interrupt',actor:interrupter.name,text:interrupter.name+'打斷'+enemy.name+'，本回合敵方無法攻擊。'});}
   else alive().slice().forEach(a=>receive(a,events));
  }
  timeline.push({round:rounds,startHp,endHp:remaining,events});
 }
 const success=remaining===0,stopReason=success?'victory':alive().length?'roundLimit':'teamDown';
 if(stopReason==='roundLimit')timeline[timeline.length-1]?.events.push({kind:'retreat',text:'交戰已達 30 回合，隊伍撤離；本次不算擊敗。'});
 allies.forEach(a=>a.hp=ex.sinners[a.name].hp);
 return {maxHp,remaining,success,rounds,stopReason,allies,timeline,healPolicy:fieldHealPolicy()};
}
function renderFieldRounds(combat){
 const rounds=combat?.timeline;if(!Array.isArray(rounds)||!rounds.length)return '';
 const policy=FIELD_HEAL_POLICIES[combat.healPolicy]?.label||'均衡補給';
 return '<details class="combat-rounds"><summary>回合戰報 · '+rounds.length+' 回合 · '+policy+'<span aria-hidden="true">⌄</span></summary><div class="combat-rounds-body">'+rounds.map(r=>'<details class="combat-round"><summary>第 '+Number(r.round)+' 回合 <span>敵方 HP '+Number(r.startHp)+' → '+Number(r.endHp)+'</span></summary><ol>'+r.events.map(e=>'<li class="combat-event event-'+esc(e.kind)+'">'+esc(e.text)+'</li>').join('')+'</ol></details>').join('')+'</div></details>';
}

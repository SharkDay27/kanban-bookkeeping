/* Every listed skill is declarative and consumed by combat, events, loot or EXP. */
const SINNER_SKILL_EFFECTS={
 '李箱':[
  {desc:'觀察 +1',effects:{observe:1}},
  {desc:'事件判定 +4',effects:{eventPower:4}},
  {desc:'HIGH／EXTREME 區域：觀察額外 +2',when:'highRisk',effects:{observe:2}}],
 '浮士德':[
  {desc:'事件判定 +4',effects:{eventPower:4}},
  {desc:'探索未制壓或事件失敗時，額外獲得 6 EXP',when:'failure',effects:{flatXp:6}},
  {desc:'隊伍裝備回收權重 +4（基準 14）',effects:{gearWeight:4}}],
 '堂吉訶德':[
  {desc:'戰鬥傷害 +14%',effects:{damageBonus:.14}},
  {desc:'機動 +2',effects:{mobility:2}},
  {desc:'HP 低於 50%：戰鬥傷害額外 +18%',when:'lowHp',effects:{damageBonus:.18}}],
 '良秀':[
  {desc:'戰鬥傷害 +22%',effects:{damageBonus:.22}},
  {desc:'Lv.5 以上怪異：傷害 +12%；時間性怪異：觀察 +2',effects:{highLevelDamage:.12,temporalObserve:2}},
  {desc:'有效制壓成功時，自身 EXP +15%',when:'kill',effects:{xpBonus:.15}}],
 '默爾索':[
  {desc:'穩定 +2',effects:{stability:2}},
  {desc:'事件判定 +4',effects:{eventPower:4}},
  {desc:'受到的戰鬥傷害 -15%',effects:{damageReduction:.15}}],
 '鴻璐':[
  {desc:'隊伍隨機事件權重 +4（基準 24）',effects:{eventWeight:4}},
  {desc:'自身分攤的區域等級判定懲罰 -50%',effects:{levelPenaltyRelief:.5}},
  {desc:'隊伍補給發現權重 +4（基準 18）',effects:{supplyWeight:4}}],
 '希斯克利夫':[
  {desc:'戰鬥傷害 +25%',effects:{damageBonus:.25}},
  {desc:'基礎戰鬥傷害 +3',effects:{flatDamage:3}},
  {desc:'HIGH／EXTREME 區域：戰鬥傷害額外 +12%',when:'highRisk',effects:{damageBonus:.12}}],
 '以實瑪利':[
  {desc:'戰鬥與觀察各 +1',effects:{combat:1,observe:1}},
  {desc:'隊伍補給發現權重 +4（基準 18）',effects:{supplyWeight:4}},
  {desc:'再次遭遇已交戰的怪異時，傷害 +15%',when:'repeat',effects:{damageBonus:.15}}],
 '羅佳':[
  {desc:'隊伍補給發現權重 +4（基準 18）',effects:{supplyWeight:4}},
  {desc:'補給發現時，隊伍有 25% 機率額外取得一份補給',effects:{extraLootChance:.25}},
  {desc:'HIGH／EXTREME 區域探索成功時，自身 EXP +20%',when:'highRiskSuccess',effects:{xpBonus:.20}}],
 '辛克萊':[
  {desc:'自身探索 EXP +10%',effects:{xpBonus:.10}},
  {desc:'自身等級低於區域建議等級時，EXP 額外 +15%',when:'underLevel',effects:{xpBonus:.15}},
  {desc:'HP 低於 50%：戰鬥 +2',when:'lowHp',effects:{combat:2}}],
 '奧提斯':[
  {desc:'雙人隊伍事件判定 +4',effects:{teamPower:4}},
  {desc:'事件判定增加搭檔四項能力差距總和的 30%',effects:{disparityBonus:.30}},
  {desc:'HIGH／EXTREME 區域：事件判定額外 +6',when:'highRisk',effects:{eventPower:6}}],
 '格里高爾':[
  {desc:'受到的戰鬥傷害 -15%',effects:{damageReduction:.15}},
  {desc:'探索未制壓或事件失敗時，額外獲得 6 EXP',when:'failure',effects:{flatXp:6}},
  {desc:'HP 低於 50%：穩定 +3',when:'lowHp',effects:{stability:3}}]
};
Object.entries(SINNER_SKILL_EFFECTS).forEach(([name,defs])=>defs.forEach((d,i)=>Object.assign(SINNER_FIELD_PROFILES[name].skills[i],d)));
function temporalAbnormality(ab){return /時間|時序|時鐘|時間性|temporal/i.test([ab?.type,ab?.name].join(' '))}
function sinnerSkillEffects(name,ctx={}){
 const data=state.exploration.sinners[name],lv=sinnerLevel(data),area=ctx.area||EXPLORATION_AREAS.find(a=>a.id===state.exploration.areaId)||{},highRisk=['HIGH','EXTREME'].includes(area.risk);
 const conditions={highRisk,lowHp:data.hp/data.maxHp<.5,failure:ctx.success===false,kill:ctx.kind==='abnormality'&&ctx.success===true,repeat:!!(ctx.ab&&state.exploration.encounters?.[ctx.ab.id]>0),underLevel:lv<area.level,highRiskSuccess:highRisk&&ctx.success===true};
 const out={};SINNER_FIELD_PROFILES[name].skills.forEach(s=>{if(lv<s.lv||s.when&&!conditions[s.when])return;Object.entries(s.effects).forEach(([k,v])=>out[k]=(out[k]||0)+v)});
 if(ctx.ab){if(ctx.ab.level>=5)out.damageBonus=(out.damageBonus||0)+(out.highLevelDamage||0);if(temporalAbnormality(ctx.ab))out.observe=(out.observe||0)+(out.temporalObserve||0)}
 return out;
}
function explorationSkillWeights(names,area){const weights={abnormality:30,event:24,supply:18,gear:14,shop:14};names.forEach(n=>{const e=sinnerSkillEffects(n,{area});weights.event+=e.eventWeight||0;weights.supply+=e.supplyWeight||0;weights.gear+=e.gearWeight||0});return weights}
function sinnerExplorationXp(name,base,ctx){const e=sinnerSkillEffects(name,ctx);return Math.max(1,Math.round(base*(1+(e.xpBonus||0))+(e.flatXp||0)))}
window.SINNER_SKILL_EFFECTS=SINNER_SKILL_EFFECTS;

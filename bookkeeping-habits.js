/* Daily encouragement follows the actual save day, never the entered transaction date. */
function bookkeepingHabitState(){
 ensureExplorationState();const ex=state.exploration;
 const h=ex.bookkeepingHabits||(ex.bookkeepingHabits={dailyClaims:{},favorites:[]});
 h.dailyClaims=h.dailyClaims&&typeof h.dailyClaims==='object'?h.dailyClaims:{};
 h.favorites=Array.isArray(h.favorites)?h.favorites.slice(0,6):[];return h;
}
function awardDailyBookkeeping(){
 const h=bookkeepingHabitState(),day=today();if(h.dailyClaims[day])return {awarded:false};
 ensurePlayerState();const before=explorationActionDebt();
 h.dailyClaims[day]={at:new Date().toISOString(),actions:1,water:1};
 state.exploration.bonusActions++;state.rpg.consumables.water++;
 ensureExplorationState();
 const result={awarded:true,actions:1,water:1,debtPaid:before-explorationActionDebt()};
 state.rpg.rewardLog+='\n每日首次記帳：額外行動 +1、瓶裝水 +1'+(result.debtPaid?'（行動已抵銷預扣欠額）':'');
 return result;
}
function bookkeepingMonthProgress(){
 const day=today(),month=day.slice(0,7),rows=state.entries.filter(e=>/^\d{4}-\d{2}-\d{2}$/.test(e.date)&&e.date.startsWith(month)&&e.date<=day),days=new Set(rows.map(e=>e.date));
 const expense=rows.filter(e=>e.type==='expense'),income=rows.filter(e=>e.type==='income'),sum=a=>a.reduce((s,e)=>s+(Number(e.amount)||0),0),categories={};
 expense.forEach(e=>categories[e.category||'其他']=(categories[e.category||'其他']||0)+(Number(e.amount)||0));
 const leading=Object.entries(categories).sort((a,b)=>b[1]-a[1])[0];
 return {month,days:days.size,count:rows.length,income:sum(income),expense:sum(expense),leading};
}
function renderBookkeepingHabits(){
 const box=document.getElementById('bookkeepingProgress');if(!box)return;
 const h=bookkeepingHabitState(),p=bookkeepingMonthProgress(),claimed=!!h.dailyClaims[today()];
 box.innerHTML='<div class="habit-progress-head"><strong>本月已整理 '+p.days+' 天收支 <span>· '+p.count+' 筆</span></strong><span class="habit-daily '+(claimed?'claimed':'')+'">'+(claimed?'今日首次獎勵已領取 ✓':'今日首次記帳：行動 +1・水 +1')+'</span></div><div class="habit-progress-summary"><span>收入 <b>'+esc(money(p.income))+'</b></span><span>支出 <b>'+esc(money(p.expense))+'</b></span><span>'+(p.leading?'支出最多：'+esc(p.leading[0])+' '+esc(money(p.leading[1])):'記下第一筆，就能看見分類摘要')+'</span></div>';
}
function bookkeepingTemplate(e){return {type:e.type==='income'?'income':'expense',store:e.store||'',amount:Number(e.amount)||0,category:e.category||'其他',payment:e.payment||'現金',note:e.note||''}}
function bookkeepingTemplateKey(e){return JSON.stringify([e.type,e.store,e.amount,e.category,e.payment])}
let activeBookkeepingTemplates=[];
function renderBookkeepingTemplates(){
 const box=document.getElementById('bookkeepingTemplates');if(!box)return;
 const h=bookkeepingHabitState(),type=document.getElementById('etype').value,groups=new Map();
 state.entries.filter(e=>e.type===type).forEach(e=>{const t=bookkeepingTemplate(e),key=bookkeepingTemplateKey(t),item=groups.get(key);if(item)item.count++;else groups.set(key,{...t,count:1,key});});
 const favorites=h.favorites.filter(e=>e.type===type).map(e=>({...e,favorite:true})),seen=new Set(favorites.map(bookkeepingTemplateKey));
 const common=[...groups.values()].sort((a,b)=>b.count-a.count).filter(t=>!seen.has(bookkeepingTemplateKey(t))).slice(0,Math.max(0,6-favorites.length));
 activeBookkeepingTemplates=[...favorites,...common];
 box.innerHTML=activeBookkeepingTemplates.length?activeBookkeepingTemplates.map((t,i)=>'<div class="habit-template"><button type="button" class="wood" data-use-template="'+i+'"><span>'+(t.favorite?'★ ':'')+esc(t.store||'未命名紀錄')+'</span><small>'+esc(t.category)+' · '+esc(money(t.amount))+'</small></button>'+(t.favorite?'<button type="button" class="template-remove" data-remove-template="'+i+'" aria-label="移除常用項目 '+esc(t.store)+'">×</button>':'')+'</div>').join(''):'<p class="habit-template-empty">記帳後會顯示常用項目。也可將目前填寫的內容存為常用。</p>';
 box.querySelectorAll('[data-use-template]').forEach(b=>b.onclick=()=>fillBookkeepingTemplate(activeBookkeepingTemplates[Number(b.dataset.useTemplate)]));
 box.querySelectorAll('[data-remove-template]').forEach(b=>b.onclick=()=>{const t=activeBookkeepingTemplates[Number(b.dataset.removeTemplate)];h.favorites=h.favorites.filter(e=>bookkeepingTemplateKey(e)!==bookkeepingTemplateKey(t));saveLocal();renderBookkeepingTemplates()});
}
function fillBookkeepingTemplate(t){
 if(!t)return;const get=id=>document.getElementById(id),date=get('edate').value||today();
 get('eid').value='';get('etype').value=t.type;syncEntryTypeUI();get('eamt').value=t.amount||'';get('estore').value=t.store;get('ecat').value=t.category;get('epay').value=PAYMENT_OPTIONS.includes(t.payment)?t.payment:'其他';get('enote').value=t.note||'';get('edate').value=date;
 get('dlgTitle').textContent=t.type==='income'?'新增收入':'新增支出';get('del').style.display='none';get('saveAgain').style.display='';renderQuickCats();get('eamt').focus();
}
function repeatBookkeepingEntry(id){const e=state.entries.find(e=>e.id===id);if(!e)return;openEdit('',e.type);fillBookkeepingTemplate(bookkeepingTemplate(e));document.getElementById('edate').value=today()}
function saveBookkeepingFavorite(){
 const get=id=>document.getElementById(id),t=bookkeepingTemplate({type:get('etype').value,store:get('estore').value.trim(),amount:get('eamt').value,category:get('ecat').value,payment:get('epay').value,note:get('enote').value});
 if(!t.store||!Number.isFinite(t.amount)||t.amount<=0){toast('先填寫用途與有效金額，再存為常用');return;}
 const h=bookkeepingHabitState(),key=bookkeepingTemplateKey(t);if(h.favorites.some(e=>bookkeepingTemplateKey(e)===key)){toast('這個項目已在常用清單');return;}
 if(h.favorites.length>=6){toast('最多保留 6 個常用項目，請先移除一個');return;}
 h.favorites.push(t);saveLocal();renderBookkeepingTemplates();toast('已存為常用項目');
}
function bindBookkeepingTools(){
 document.querySelectorAll('[data-bookkeeping-date]').forEach(b=>b.onclick=()=>{const d=new Date(today()+'T12:00:00');d.setDate(d.getDate()+Number(b.dataset.bookkeepingDate));document.getElementById('edate').value=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')});
 const favorite=document.getElementById('saveBookkeepingFavorite');if(favorite)favorite.onclick=saveBookkeepingFavorite;
}

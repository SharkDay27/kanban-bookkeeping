(function(){
  const el=id=>document.getElementById(id);
  let selectedDate=today(),calendarMonth=selectedDate.slice(0,7),returnMonth=null;
  const safe=v=>esc(String(v==null?'':v));
  function day(value){
    if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return null;
    const [y,m,d]=value.split('-').map(Number),date=new Date(y,m-1,d,12);
    return date.getFullYear()===y&&date.getMonth()===m-1&&date.getDate()===d?date:null;
  }
  function renderLedger(){
    const page=el('dailyLedgerPage');if(!page)return;
    const date=day(selectedDate);if(!date)return;
    renderExtras();
    const rows=state.entries.filter(x=>x.date===selectedDate);
    const income=rows.filter(x=>x.type==='income').reduce((sum,x)=>sum+Number(x.amount||0),0);
    const expense=rows.filter(x=>x.type==='expense').reduce((sum,x)=>sum+Number(x.amount||0),0);
    const net=income-expense,incomeCount=rows.filter(x=>x.type==='income').length;
    const weekday=['星期日','星期一','星期二','星期三','星期四','星期五','星期六'][date.getDay()];
    el('dailyLedgerDate').value=selectedDate;
    page.innerHTML='<header class="ledger-page-head"><div><div class="ledger-eyebrow">DAILY LEDGER</div><div class="ledger-day">'+safe(selectedDate.slice(5).replace('-','.'))+'<span>'+weekday+'</span></div></div><span class="ledger-count">共 '+rows.length+' 筆記錄</span></header>'+
      '<div class="ledger-summary"><div><span>當日收入</span><strong class="ledger-income">'+safe(money(income))+'</strong></div><div><span>當日支出</span><strong class="ledger-expense">'+safe(money(expense))+'</strong></div><div><span>當日結餘</span><strong class="'+(net<0?'ledger-expense':'ledger-income')+'">'+(net>0?'+ ':'')+safe(money(net))+'</strong></div></div>'+
      '<h3 class="ledger-list-title">今日明細</h3><div class="ledger-column-head"><span>項目</span><span>分類・付款</span><span>金額</span></div><ul class="ledger-list">'+
      (rows.length?rows.map(x=>{
        const incoming=x.type==='income',note=String(x.note||'').trim();
        return '<li class="ledger-row" role="button" tabindex="0" data-ledger-edit="'+safe(x.id)+'" aria-label="編輯 '+safe(x.store||'記錄')+'"><div class="ledger-item"><strong>'+safe(x.store||'未命名紀錄')+'</strong>'+(note?'<p>'+safe(note)+'</p>':'')+'</div><div class="ledger-meta">'+safe(x.category||'其他')+'・'+safe(x.payment||'未設定')+'</div><strong class="ledger-amount '+(incoming?'ledger-income':'ledger-expense')+'">'+(incoming?'+ ':'− ')+safe(money(x.amount))+'</strong></li>';
      }).join(''):'<li class="ledger-empty">這一天尚無收支記錄。<span>新增記錄後，會在這裡彙整。</span></li>')+'</ul>'+
      '<footer class="ledger-footer"><span>收入 '+incomeCount+' 筆 · 支出 '+(rows.length-incomeCount)+' 筆</span><span>本日結餘 <strong class="'+(net<0?'ledger-expense':'ledger-income')+'">'+(net>0?'+ ':'')+safe(money(net))+'</strong></span></footer>';
  }
  const extras=document.createElement('div');extras.className='ledger-extras';
  extras.innerHTML='<details class="ledger-calendar-panel" open><summary>月曆收支總覽</summary><div class="ledger-month-controls"><button type="button" id="ledgerMonthPrev" aria-label="上個月">‹</button><input type="month" id="ledgerMonth" aria-label="收支總覽月份"><button type="button" id="ledgerMonthNext" aria-label="下個月">›</button></div><p class="ledger-help">每日支出與截至當日的帳上結餘；點選日期查看日記帳。</p><div id="ledgerMonthTotals"></div><div class="ledger-weekdays">'+['日','一','二','三','四','五','六'].map(d=>'<span>'+d+'</span>').join('')+'</div><div id="ledgerCalendar" class="ledger-calendar"></div></details><div class="ledger-search"><label for="ledgerSearch">搜尋所有記帳記錄</label><input type="search" id="ledgerSearch" placeholder="店家、備註、分類、付款方式或金額"><div id="ledgerSearchResults" aria-live="polite"></div></div>';
  el('dailyLedgerPage').before(extras);
  el('calendar').append(extras.querySelector('.ledger-calendar-panel'));
  const backButton=document.createElement('button');backButton.type='button';backButton.id='ledgerBackCalendar';backButton.textContent='‹ 返回月曆收支總覽';backButton.hidden=true;
  el('journal').prepend(backButton);
  backButton.onclick=()=>{if(returnMonth)calendarMonth=returnMonth;setTab('calendar');el('calendar').scrollIntoView({block:'start'})};
  const originalOpenEdit=openEdit;openEdit=function(id,presetType){originalOpenEdit(id,presetType);document.querySelector('#dlg .bookkeeping-quick-tools').style.setProperty('display',id?'none':'','important')};
  const note=document.createElement('div');note.className='ledger-daily-note';
  note.innerHTML='<label for="ledgerDailyNote">每日一句備註</label><textarea id="ledgerDailyNote" rows="2" maxlength="300" placeholder="今天有什麼值得記下的？"></textarea><span class="ledger-help" id="ledgerNoteStatus">自動儲存</span>';
  el('dailyLedgerPage').after(note);
  function chooseDate(value){if(!day(value))return;selectedDate=value;calendarMonth=value.slice(0,7);renderLedger()}
  function renderExtras(){
    state.profile.dailyNotes=state.profile.dailyNotes||{};
    if(document.activeElement!==el('ledgerDailyNote'))el('ledgerDailyNote').value=state.profile.dailyNotes[selectedDate]||'';
    el('ledgerNoteStatus').textContent='自動儲存';
    el('ledgerMonth').value=calendarMonth;
    const [year,month]=calendarMonth.split('-').map(Number),start=new Date(year,month-1,1,12),days=new Date(year,month,0,12).getDate(),totals={};
    let income=0,expense=0;
    state.entries.filter(x=>String(x.date).startsWith(calendarMonth+'-')).forEach(x=>{const t=totals[x.date]||(totals[x.date]={income:0,expense:0});t[x.type==='income'?'income':'expense']+=Number(x.amount)||0;if(x.type==='income')income+=Number(x.amount)||0;else expense+=Number(x.amount)||0});
    let balance=Number(state.profile.initialAmount)||0;
    state.entries.filter(x=>day(String(x.date))&&x.date<calendarMonth+'-01').forEach(x=>{balance+=(x.type==='income'?1:-1)*(Number(x.amount)||0)});
    const monthEndBalance=balance+income-expense;
    el('ledgerMonthTotals').innerHTML='<div class="ledger-month-totals"><span>收入 <strong class="ledger-income">'+safe(money(income))+'</strong></span><span>支出 <strong class="ledger-expense">'+safe(money(expense))+'</strong></span><span>月底帳上結餘 <strong class="'+(monthEndBalance<0?'ledger-expense':'ledger-income')+'">'+safe(money(monthEndBalance))+'</strong></span></div>';
    let cells='<span class="ledger-calendar-blank"></span>'.repeat(start.getDay());
    for(let d=1;d<=days;d++){
      const key=calendarMonth+'-'+String(d).padStart(2,'0'),t=totals[key]||{income:0,expense:0};
      balance+=t.income-t.expense;
      const net=balance;
      cells+='<button type="button" class="ledger-calendar-day '+(key===selectedDate?'selected':'')+' '+(key===today()?'today':'')+'" data-ledger-day="'+key+'" aria-label="'+key+'，支出 '+safe(money(t.expense))+'，帳上結餘 '+safe(money(net))+'"><span>'+d+'</span>'+'<small class="ledger-expense"><span>支出</span><b>'+safe(t.expense.toLocaleString(currentCurrency().locale,{maximumFractionDigits:currentCurrency().digits}))+'</b></small><small class="'+(net<0?'ledger-expense':'ledger-income')+'"><span>帳上結餘</span><b>'+safe(net.toLocaleString(currentCurrency().locale,{maximumFractionDigits:currentCurrency().digits}))+'</b></small></button>';
    }
    el('ledgerCalendar').innerHTML=cells;
    renderSearch();
  }
  function renderSearch(){
    const query=el('ledgerSearch').value.trim().toLowerCase(),box=el('ledgerSearchResults');
    if(!query){box.innerHTML='';return}
    const matches=state.entries.filter(x=>[x.store,x.note,x.category,x.payment,x.amount,x.date,...(x.items||[]).map(i=>i.name)].join(' ').toLowerCase().includes(query)).sort((a,b)=>String(b.date).localeCompare(String(a.date)));
    box.innerHTML='<p class="ledger-help">找到 '+matches.length+' 筆記錄，點選可直接編輯。</p>'+matches.slice(0,100).map(x=>'<button type="button" class="ledger-search-result" data-ledger-search-edit="'+safe(x.id)+'"><span><small>'+safe(x.date)+'</small><strong>'+safe(x.store||'未命名紀錄')+'</strong></span><span class="'+(x.type==='income'?'ledger-income':'ledger-expense')+'">'+(x.type==='income'?'+ ':'− ')+safe(money(x.amount))+'</span></button>').join('')+(matches.length>100?'<p class="ledger-help">目前顯示前 100 筆，請縮小搜尋範圍。</p>':'');
  }
  function moveMonth(offset){const date=day(calendarMonth+'-01');date.setMonth(date.getMonth()+offset);calendarMonth=date.getFullYear()+'-'+String(date.getMonth()+1).padStart(2,'0');renderExtras()}
  el('ledgerMonthPrev').onclick=()=>moveMonth(-1);el('ledgerMonthNext').onclick=()=>moveMonth(1);
  el('ledgerMonth').onchange=e=>{if(day(e.target.value+'-01'))calendarMonth=e.target.value;renderExtras()};
  el('ledgerSearch').oninput=renderSearch;
  el('ledgerDailyNote').oninput=e=>{state.profile.dailyNotes=state.profile.dailyNotes||{};if(e.target.value)state.profile.dailyNotes[selectedDate]=e.target.value;else delete state.profile.dailyNotes[selectedDate];saveLocal();el('ledgerNoteStatus').textContent='已儲存'};
  document.addEventListener('click',e=>{
    const button=e.target.closest('[data-ledger-day],[data-ledger-edit],[data-ledger-search-edit]');if(!button)return;
    if(button.dataset.ledgerDay){returnMonth=calendarMonth;backButton.hidden=false;chooseDate(button.dataset.ledgerDay);setTab('journal');el('journal').scrollIntoView({block:'start'})}
    else if(button.dataset.ledgerEdit||button.dataset.ledgerSearchEdit){const id=button.dataset.ledgerEdit||button.dataset.ledgerSearchEdit,entry=state.entries.find(x=>x.id===id);if(entry){chooseDate(entry.date);openEdit(id)}}

  });
  document.addEventListener('keydown',e=>{if(e.target.matches('[data-ledger-edit]')&&['Enter',' '].includes(e.key)){e.preventDefault();e.target.click()}});
  function moveDate(offset){
    const date=day(selectedDate);date.setDate(date.getDate()+offset);
    selectedDate=date.getFullYear()+'-'+String(date.getMonth()+1).padStart(2,'0')+'-'+String(date.getDate()).padStart(2,'0');calendarMonth=selectedDate.slice(0,7);renderLedger();
  }
  el('dailyLedgerPrev').onclick=()=>moveDate(-1);
  el('dailyLedgerNext').onclick=()=>moveDate(1);
  el('dailyLedgerToday').onclick=()=>{chooseDate(today())};
  el('dailyLedgerDate').addEventListener('change',e=>{chooseDate(e.target.value)});
  TAB_LABELS.journal='日記帳';TAB_LABELS.calendar='月曆收支總覽';
  const originalSetTab=setTab;setTab=function(id){originalSetTab(id);if(['journal','calendar'].includes(id))renderLedger()};
  const originalRender=render;render=function(){originalRender();renderLedger()};
  window.forceRenderDailyLedger=renderLedger;
  window.addEventListener('pageshow',renderLedger);
  renderLedger();
})();

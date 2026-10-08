(function(){
  const el=id=>document.getElementById(id);
  let selectedDate=today();
  const safe=v=>esc(String(v==null?'':v));
  function day(value){
    if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return null;
    const [y,m,d]=value.split('-').map(Number),date=new Date(y,m-1,d,12);
    return date.getFullYear()===y&&date.getMonth()===m-1&&date.getDate()===d?date:null;
  }
  function renderLedger(){
    const page=el('dailyLedgerPage');if(!page)return;
    const date=day(selectedDate);if(!date)return;
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
        return '<li class="ledger-row"><div class="ledger-item"><strong>'+safe(x.store||'未命名紀錄')+'</strong>'+(note?'<p>'+safe(note)+'</p>':'')+'</div><div class="ledger-meta">'+safe(x.category||'其他')+'・'+safe(x.payment||'未設定')+'</div><strong class="ledger-amount '+(incoming?'ledger-income':'ledger-expense')+'">'+(incoming?'+ ':'− ')+safe(money(x.amount))+'</strong></li>';
      }).join(''):'<li class="ledger-empty">這一天尚無收支記錄。<span>新增記錄後，會在這裡彙整。</span></li>')+'</ul>'+
      '<footer class="ledger-footer"><span>收入 '+incomeCount+' 筆 · 支出 '+(rows.length-incomeCount)+' 筆</span><span>本日結餘 <strong class="'+(net<0?'ledger-expense':'ledger-income')+'">'+(net>0?'+ ':'')+safe(money(net))+'</strong></span></footer>';
  }
  function moveDate(offset){
    const date=day(selectedDate);date.setDate(date.getDate()+offset);
    selectedDate=date.getFullYear()+'-'+String(date.getMonth()+1).padStart(2,'0')+'-'+String(date.getDate()).padStart(2,'0');renderLedger();
  }
  el('dailyLedgerPrev').onclick=()=>moveDate(-1);
  el('dailyLedgerNext').onclick=()=>moveDate(1);
  el('dailyLedgerToday').onclick=()=>{selectedDate=today();renderLedger()};
  el('dailyLedgerDate').addEventListener('change',e=>{if(day(e.target.value))selectedDate=e.target.value;renderLedger()});
  TAB_LABELS.journal='日記帳';
  const originalSetTab=setTab;setTab=function(id){originalSetTab(id);if(id==='journal')renderLedger()};
  const originalRender=render;render=function(){originalRender();renderLedger()};
  window.forceRenderDailyLedger=renderLedger;
  window.addEventListener('pageshow',renderLedger);
  renderLedger();
})();

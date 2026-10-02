(function(){
  const COLORS=['#6f8d76','#9b5156','#71849d','#9b8154','#786788','#4f8990','#9a6e7f','#7c845a'];
  function e(v){return typeof esc==='function'?esc(v):String(v==null?'':v)}
  function cash(v){return typeof money==='function'?money(v):String(v)}
  function group(rows){
    const out={};rows.forEach(function(x){const k=x.category||'其他';out[k]=(out[k]||0)+Number(x.amount||0)});
    return Object.entries(out).sort(function(a,b){return b[1]-a[1]});
  }
  function pie(pieId,legendId,data){
    const p=document.getElementById(pieId),l=document.getElementById(legendId);if(!p||!l)return;
    const total=data.reduce(function(s,x){return s+x[1]},0);
    if(!total){p.style.background='#24262b';l.innerHTML='<div class="stats-module-empty">目前沒有資料。</div>';return}
    let acc=0,parts=[];
    data.forEach(function(row,i){const start=acc/total*360;acc+=row[1];parts.push(COLORS[i%COLORS.length]+' '+start+'deg '+(acc/total*360)+'deg')});
    p.style.background='conic-gradient('+parts.join(',')+')';
    l.innerHTML=data.map(function(row,i){const pct=Math.round(row[1]/total*100);return '<div class="legend-row"><span class="legend-dot" style="background:'+COLORS[i%COLORS.length]+'"></span><span>'+e(row[0])+' · '+pct+'%</span><strong>'+e(cash(row[1]))+'</strong></div>'}).join('');
  }
  function render(){
    try{
      const monthEl=document.getElementById('month');
      const m=(monthEl&&monthEl.value)||today().slice(0,7);
      const rows=(state.entries||[]).filter(function(x){return String(x.date||'').indexOf(m)===0});
      const incomeRows=rows.filter(function(x){return x.type==='income'}),expenseRows=rows.filter(function(x){return x.type==='expense'});
      const income=incomeRows.reduce(function(s,x){return s+Number(x.amount||0)},0);
      const expense=expenseRows.reduce(function(s,x){return s+Number(x.amount||0)},0);
      const net=income-expense;

      pie('incomeExpensePie','incomeExpenseLegend',[['收入',income],['支出',expense]].filter(function(x){return x[1]>0}));
      pie('expenseCategoryPie','expenseCategoryLegend',group(expenseRows));
      pie('incomeCategoryPie','incomeCategoryLegend',group(incomeRows));

      const si=document.getElementById('statsIncome'),se=document.getElementById('statsExpense'),sn=document.getElementById('statsNet'),sc=document.getElementById('statsComment');
      if(si){si.textContent=cash(income);si.style.color='var(--green)'}
      if(se){se.textContent=cash(expense);se.style.color='var(--red)'}
      if(sn){sn.textContent=cash(net);sn.style.color=net<0?'var(--red)':'var(--green)'}
      if(sc){
        if(!rows.length)sc.textContent=m+' 尚無記帳資料。';
        else{
          const top=group(expenseRows)[0];
          sc.innerHTML='<div class="stats-period-label">PERIOD / '+e(m)+'</div>'+
            '<div>'+rows.length+' 筆紀錄；收入 '+e(cash(income))+'，支出 '+e(cash(expense))+'，淨額 '+e(cash(net))+'。</div>'+
            (top?'<div style="margin-top:6px">最大支出分類：'+e(top[0])+'（'+e(cash(top[1]))+'）</div>':'');
        }
      }
    }catch(err){
      ['incomeExpenseLegend','expenseCategoryLegend','incomeCategoryLegend','statsComment'].forEach(function(id){const x=document.getElementById(id);if(x)x.innerHTML='<div class="rpg-module-error">統計模組載入失敗：'+e(err.message||err)+'</div>'});
    }
  }
  window.forceRenderStatistics=render;
  render();
  document.querySelectorAll('[data-tab="stats"],[data-goto="stats"]').forEach(function(btn){btn.addEventListener('click',function(){setTimeout(render,0)})});
  const month=document.getElementById('month');if(month)month.addEventListener('change',render);
  window.addEventListener('pageshow',function(){setTimeout(render,0)});
})();
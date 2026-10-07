/* Presentation only: keep bookkeeping, progression and save data unchanged. */
(function(){
  'use strict';
  const balance=document.getElementById('balance');
  const summary=document.querySelector('.summary');
  if(balance&&summary){const card=balance.closest('.stat');card.classList.add('balance-stat');summary.prepend(card)}
  const daily=document.getElementById('todayExpense');
  if(daily)daily.closest('.stat').classList.add('daily-stat');
  const notice=document.querySelector('.zone-privacy');
  const currency=document.getElementById('currencySelect');
  if(notice&&currency){
    const group=document.createElement('div');group.className='utility-strip';
    const row=document.createElement('div');row.className='utility-strip-row';
    const heading=document.createElement('button');heading.type='button';heading.className='privacy-toggle';
    heading.innerHTML='<span>資料保存說明</span><span class="privacy-chevron" aria-hidden="true">⌄</span>';
    heading.setAttribute('aria-expanded','false');heading.setAttribute('aria-controls','privacyPanel');
    const panel=document.createElement('div');panel.id='privacyPanel';panel.className='privacy-panel';panel.inert=true;
    const inner=document.createElement('div');inner.className='privacy-panel-inner';
    notice.before(group);group.append(row,panel);row.append(heading,currency);panel.append(inner);inner.append(notice);
    heading.addEventListener('click',function(){const open=heading.getAttribute('aria-expanded')!=='true';heading.setAttribute('aria-expanded',String(open));group.classList.toggle('is-open',open);panel.inert=!open});
    const oldConsole=document.getElementById('currencyConsole');if(oldConsole)oldConsole.hidden=true;
  }
  const otherFunctions=document.querySelector('.other-functions');
  if(otherFunctions){
    const panel=otherFunctions.querySelector('.other-functions-body');
    function syncOtherFunctions(){
      const open=otherFunctions.open;
      panel.hidden=!open;panel.inert=!open;
      panel.style.setProperty('display',open?'grid':'none','important');
      otherFunctions.querySelector('summary').setAttribute('aria-expanded',String(open));
    }
    otherFunctions.addEventListener('toggle',syncOtherFunctions);
    new MutationObserver(syncOtherFunctions).observe(otherFunctions,{attributes:true,attributeFilter:['open']});
    document.addEventListener('click',function(event){if(otherFunctions.open&&!otherFunctions.contains(event.target))otherFunctions.open=false});
    document.addEventListener('keydown',function(event){if(event.key==='Escape'&&otherFunctions.open){otherFunctions.open=false;otherFunctions.querySelector('summary').focus()}});
    syncOtherFunctions();
  }
  const paths={adventure:'M3 10 12 3l9 7v10H3Z M9 20v-7h6v7',book:'M5 3h14v18H5Z M8 7h8 M8 11h8 M8 15h5',commentary:'M4 4h16v13H9l-5 4Z M8 8h8 M8 12h5',explore:'m12 3 9 9-9 9-9-9Z m4 5-3 7-7 3 3-7Z'};
  document.querySelectorAll('.bottom button').forEach(function(button){
    const label=button.querySelector('span');
    if(!label)return;
    const title=label.textContent;
    const path=button.id==='bottomAdd'?'M12 5v14 M5 12h14':paths[button.dataset.goto];
    if(path){button.replaceChildren();button.insertAdjacentHTML('afterbegin','<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="'+path+'"/></svg>');button.append(label)}
    button.setAttribute('aria-label',title);
  });
  function updatePage(id){
    document.body.dataset.currentTab=id;
    document.querySelectorAll('[data-tab],[data-goto]').forEach(function(button){
      if((button.dataset.tab||button.dataset.goto)===id)button.setAttribute('aria-current','page');
      else button.removeAttribute('aria-current');
    });
  }
  if(typeof window.setTab==='function'){
    const original=window.setTab;
    window.setTab=function(id){original(id);updatePage(id);window.scrollTo({top:0,behavior:'auto'})};
  }
  updatePage(document.querySelector('section.section.active')?.id||'adventure');
  const notificationRoot=document.getElementById('notificationRoot');
  function placeNotifications(){if(!notificationRoot)return;const dialog=document.querySelector('dialog[open]');const parent=dialog||document.body;if(notificationRoot.parentElement!==parent)parent.append(notificationRoot)}
  const notificationObserver=new MutationObserver(placeNotifications);
  document.querySelectorAll('dialog').forEach(function(dialog){notificationObserver.observe(dialog,{attributes:true,attributeFilter:['open']})});
  placeNotifications();
  document.querySelectorAll('.field').forEach(function(field){const label=field.querySelector('label'),input=field.querySelector('input[id],select[id],textarea[id]');if(label&&input&&!label.htmlFor)label.htmlFor=input.id});
})();

/* Presentation only: keep bookkeeping, progression and save data unchanged. */
(function(){
  'use strict';
  const balance=document.getElementById('balance');
  const summary=document.querySelector('.summary');
  if(balance&&summary){const card=balance.closest('.stat');card.classList.add('balance-stat');summary.prepend(card)}
  const daily=document.getElementById('todayExpense');
  if(daily)daily.closest('.stat').classList.add('daily-stat');
  const notice=document.querySelector('.zone-privacy');
  if(notice){
    const details=document.createElement('details');details.className='privacy-collapse';
    const heading=document.createElement('summary');heading.textContent='資料保存與備份說明';
    notice.before(details);details.append(heading,notice);
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

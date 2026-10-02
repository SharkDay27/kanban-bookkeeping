(function(){
  const KEY='kb-theme';
  function apply(theme){theme=theme==='light'?'light':'dark';document.documentElement.dataset.theme=theme;try{localStorage.setItem(KEY,theme)}catch(e){}document.querySelectorAll('[data-theme-option]').forEach(function(b){const on=b.dataset.themeOption===theme;b.classList.toggle('active',on);b.setAttribute('aria-pressed',on?'true':'false')})}
  document.addEventListener('click',function(e){const b=e.target&&e.target.closest?e.target.closest('[data-theme-option]'):null;if(b)apply(b.dataset.themeOption)});
  let t='dark';try{t=localStorage.getItem(KEY)||document.documentElement.dataset.theme||'dark'}catch(e){}apply(t);window.setAppTheme=apply;
})();
/* Native details remain keyboard accessible; scroll control follows reduced-motion preference. */
(function(){
 const button=document.getElementById('backToTop');
 if(button){
  const update=()=>button.hidden=window.scrollY<360;
  window.addEventListener('scroll',update,{passive:true});window.addEventListener('pageshow',update);update();
  button.addEventListener('click',()=>window.scrollTo({top:0,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'}));
 }
 const profile=document.querySelector('.manager-profile');
 if(profile&&window.matchMedia('(max-width: 700px)').matches)profile.open=false;
})();

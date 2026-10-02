(function(){
  function safeEsc(value){
    if(typeof esc==='function')return esc(value);
    return String(value==null?'':value).replace(/[&<>"']/g,function(ch){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch];
    });
  }

  function errorCard(message){
    var box=document.getElementById('sinnerManagementGrid');
    if(!box)return;
    box.innerHTML='<div class="wood panel" style="grid-column:1/-1;border-left:4px solid #9b4f55">'+
      '<div class="archive-id">LCB // ROSTER-ERROR</div>'+
      '<div style="font-size:16px;font-weight:900;margin-top:5px">罪人檔案載入失敗</div>'+
      '<div class="sub" style="margin-top:7px">'+safeEsc(message)+'</div></div>';
  }

  function render(){
    var box=document.getElementById('sinnerManagementGrid');
    if(!box)return;

    try{
      if(typeof ensureExplorationState!=='function')throw new Error('探索資料尚未初始化。');
      if(typeof SINNER_FIELD_PROFILES==='undefined')throw new Error('罪人能力資料未載入。');
      if(typeof FIELD_GEAR==='undefined')throw new Error('探索裝備資料未載入。');

      ensureExplorationState();

      var ex=state.exploration;
      var owned=Array.from(new Set(Array.isArray(ex.fieldGear)?ex.fieldGear:[]))
        .filter(function(id){return FIELD_GEAR[id]});

      box.innerHTML=Object.keys(SINNER_FIELD_PROFILES).map(function(name){
        var p=SINNER_FIELD_PROFILES[name];
        var data=ex.sinners[name]||{exp:0,hp:100,maxHp:100,gear:''};
        var lv=typeof sinnerLevel==='function'?sinnerLevel(data):Math.max(1,Math.floor(Number(data.exp||0)/100)+1);
        var exp=Math.max(0,Number(data.exp||0)%100);
        var st=typeof sinnerEffectiveStats==='function'
          ?sinnerEffectiveStats(name)
          :Object.assign({},p.stats||{combat:1,observe:1,mobility:1,stability:1});

        var gearOptions=['<option value="">LCB 標準裝備</option>'].concat(
          owned.map(function(id){
            var selected=data.gear===id;
            var unavailable=false;
            if(typeof fieldGearAssignedElsewhere==='function'){
              unavailable=fieldGearAssignedElsewhere(id,name);
            }
            return '<option value="'+safeEsc(id)+'" '+(selected?'selected':'')+' '+(unavailable&&!selected?'disabled':'')+'>'+
              safeEsc(FIELD_GEAR[id].name)+(unavailable&&!selected?'（已配置）':'')+'</option>';
          })
        ).join('');

        var skills=Array.isArray(p.skills)?p.skills:[];
        return '<article class="sinner-file wood">'+
          '<div class="sinner-file-head"><div>'+
            '<div class="archive-id">LCB // '+safeEsc(name)+'</div>'+
            '<div class="sinner-file-name" style="color:'+(typeof sinnerColorForSpeaker==='function'?sinnerColorForSpeaker(name):'#eee9df')+'">'+safeEsc(name)+'</div>'+
          '</div><div class="sinner-level">Lv.'+lv+'</div></div>'+
          '<div class="sinner-specialty">'+safeEsc(p.specialty||'—')+' / 基礎 E.G.O：'+safeEsc(p.ego||'—')+'</div>'+
          '<div class="sinner-exp"><div style="width:'+exp+'%"></div><span>'+exp+' / 100 EXP</span></div>'+
          '<div class="sinner-hp-row"><span>HP</span><b>'+Number(data.hp||0)+' / '+Number(data.maxHp||100)+'</b></div>'+
          '<div class="sinner-hp-bar"><div style="width:'+Math.max(0,Math.min(100,Math.round((Number(data.hp||0)/Math.max(1,Number(data.maxHp||100)))*100)))+'%"></div></div>'+
          (Number(data.hp||0)<=0?'<button type="button" class="wood sinner-revive-btn" data-revive-sinner="'+safeEsc(name)+'">消耗 1 行動復活</button>':'')+
          '<div class="sinner-stat-grid">'+
            '<span>戰鬥 <b>'+Number(st.combat||0)+'</b></span>'+
            '<span>觀察 <b>'+Number(st.observe||0)+'</b></span>'+
            '<span>機動 <b>'+Number(st.mobility||0)+'</b></span>'+
            '<span>穩定 <b>'+Number(st.stability||0)+'</b></span>'+
          '</div>'+
          '<label class="sinner-gear-label">探索裝備'+
            '<select class="wood sinner-gear-select" data-sinner-gear="'+safeEsc(name)+'">'+gearOptions+'</select>'+
          '</label>'+
          '<div class="sinner-skill-list">'+skills.map(function(skill){
            var unlocked=lv>=Number(skill.lv||1);
            return '<div class="sinner-skill '+(unlocked?'unlocked':'locked')+'">'+
              '<b>Lv.'+Number(skill.lv||1)+' / '+safeEsc(skill.name||'技能')+'</b>'+
              '<span>'+safeEsc(unlocked?(skill.desc||'已解鎖'):'尚未解鎖')+'</span></div>';
          }).join('')+'</div>'+
        '</article>';
      }).join('');

      box.querySelectorAll('[data-revive-sinner]').forEach(function(btn){
        btn.addEventListener('click',function(){if(typeof reviveSinner==='function'){reviveSinner(btn.dataset.reviveSinner);setTimeout(render,0)}});
      });
      box.querySelectorAll('[data-sinner-gear]').forEach(function(sel){
        sel.addEventListener('change',function(){
          if(typeof assignFieldGear==='function'){
            assignFieldGear(sel.dataset.sinnerGear,sel.value);
            setTimeout(render,0);
          }
        });
      });
    }catch(err){
      errorCard(err&&err.message?err.message:String(err));
    }
  }

  window.forceRenderSinnerManagement=render;

  // Run once after app.js, even if app.js's render() aborted midway.
  render();

  // Extra safety for direct tab clicks and bfcache restores on iPhone Safari.
  document.querySelectorAll('[data-tab="sinners"],[data-goto="sinners"]').forEach(function(btn){
    btn.addEventListener('click',function(){setTimeout(render,0)});
  });
  window.addEventListener('pageshow',function(){setTimeout(render,0)});
})();
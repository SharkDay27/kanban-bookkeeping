(function(){
  function e(v){return typeof esc==='function'?esc(v):String(v==null?'':v)}
  function render(){
    try{
      ensurePlayerState();ensureExplorationState();
      const ex=state.exploration,catalog=window.RPG_EQUIPMENT_CATALOG||EQUIPMENT_EFFECTS;
      const consumables=document.getElementById('backpackConsumables');
      if(consumables)consumables.innerHTML=Object.entries(CONSUMABLE_EFFECTS).map(function(pair){
        const key=pair[0],item=pair[1],count=Number(state.rpg.consumables[key]||0);
        const rarity=typeof itemRarityForName==='function'?itemRarityForName(item.name):{className:'rarity-common',label:'一般'};
        return '<article class="pack-item wood consumable-card '+rarity.className+'"><div class="pack-item-head"><strong>'+e(item.name)+'</strong><span class="pack-count">'+rarity.label+' · ×'+count+'</span></div><div class="pack-desc">'+e(item.desc)+'</div></article>';
      }).join('');

      const field=document.getElementById('backpackFieldGear');
      if(field){
        const ids=[...new Set(ex.fieldGear||[])].filter(function(id){return FIELD_GEAR[id]});
        field.innerHTML=ids.length?ids.map(function(id){
          const g=FIELD_GEAR[id],assigned=Object.entries(ex.sinners||{}).find(function(pair){return pair[1].gear===id});
          const stats=Object.entries(g.stats||{}).map(function(p){const names={combat:'戰鬥',observe:'觀察',mobility:'機動',stability:'穩定'};return '<span>'+names[p[0]]+' +'+p[1]+'</span>'}).join('');
          const rarity=typeof itemRarity==='function'?itemRarity(g.rarity):{className:'rarity-common',label:'一般'};
          return '<article class="wood equipment-card-v2 '+rarity.className+'"><div class="pack-item-head"><strong>'+e(g.name)+'</strong><span class="pack-state rarity-label">'+rarity.label+'</span></div><div class="pack-desc">'+e(g.desc)+'</div><div class="equipment-attr">'+stats+'</div><div class="equipment-source">罪人探索裝備 · '+rarity.label+(assigned?' · 配置：'+e(assigned[0]):' · 未配置')+'</div></article>';
        }).join(''):'<div class="empty">尚未取得探索裝備。探索、商店與道具箱都有機會取得。</div>';
      }

      const support=document.getElementById('backpackEquipment');
      if(support){
        const owned=[...new Set((state.rpg.inventory||[]).filter(function(x){return !!catalog[x]}))],equipped=state.rpg.equipped||[];
        support.innerHTML=owned.length?owned.map(function(name){
          const item=catalog[name],on=equipped.includes(name),attrs=window.rpgEquipmentAttributes?window.rpgEquipmentAttributes(item):[item.desc];
          const rarity=typeof itemRarity==='function'?itemRarity(item.rarity):{className:'rarity-common',label:String(item.rarity||'一般')};
          return '<button type="button" class="wood equipment-card-v2 '+rarity.className+' '+(on?'equipped':'')+'" data-support-equip="'+e(name)+'"><div class="pack-item-head"><strong>'+e(name)+'</strong><span class="pack-state rarity-label">'+rarity.label+(on?' · EQUIPPED':'')+'</span></div>'+
            '<div class="pack-desc">'+e(item.desc)+'</div><div class="equipment-attr">'+attrs.map(function(x){return '<span>'+e(x)+'</span>'}).join('')+'</div>'+
            '<div class="equipment-source">'+rarity.label+' / '+e(item.slot)+' / '+e(item.source)+'</div><div class="equipment-action">'+(on?'點擊卸下':'點擊裝備（最多 3 件）')+'</div></button>';
        }).join(''):'<div class="empty">尚無管理支援裝備。可由道具箱、探索與商店取得。</div>';
        support.querySelectorAll('[data-support-equip]').forEach(function(btn){btn.onclick=function(){toggleEquip(btn.dataset.supportEquip);setTimeout(render,0)}});
      }

      const materials=document.getElementById('backpackMaterials');
      if(materials){
        const counts={};
        (state.rpg.inventory||[]).filter(function(x){return !catalog[x]}).forEach(function(x){counts[x]=(counts[x]||0)+1});
        materials.innerHTML=Object.keys(counts).length?Object.entries(counts).map(function(pair){
          return '<article class="pack-item wood"><div class="pack-item-head"><strong>'+e(pair[0])+'</strong><span class="pack-count">×'+pair[1]+'</span></div><div class="pack-desc">怪異掉落／收容材料</div></article>';
        }).join(''):'<div class="empty">目前沒有材料。</div>';
      }
    }catch(err){
      ['backpackConsumables','backpackFieldGear','backpackEquipment','backpackMaterials'].forEach(function(id){
        const el=document.getElementById(id);if(el)el.innerHTML='<div class="rpg-module-error">背包載入失敗：'+e(err.message||err)+'</div>';
      });
    }
  }
  window.forceRenderBackpack=render;
  render();
  document.querySelectorAll('[data-tab="backpack"],[data-goto="backpack"]').forEach(function(b){b.addEventListener('click',function(){setTimeout(render,0)})});
  window.addEventListener('pageshow',function(){setTimeout(render,0)});
})();
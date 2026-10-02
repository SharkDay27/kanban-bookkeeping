(function(){
  const SUPPORT_BASE={common:55,uncommon:90,rare:140,epic:220,legendary:360};
  const FIELD_BASE={'field-vest':60,'survey-lens':75,'runner-boots':65,'shock-baton':95,'field-kit':150};
  const MATERIAL_BASE={'史萊姆凝膠':12,'鐵殼碎片':16,'紅線紙片':15,'齒輪牙片':18,'失真鱗粉':24,'黑箱扣件':28,'廢線束':20,'白面鏡片':30};
  const CONSUMABLE_BASE={water:5,potion:14};
  function rk(v){return typeof itemRarity==='function'?itemRarity(v).key:(v||'common')}
  function price(kind,key,name,rarity){if(kind==='consumable')return CONSUMABLE_BASE[key]||5;if(kind==='field')return FIELD_BASE[key]||50;if(kind==='support')return SUPPORT_BASE[rk(rarity)]||55;if(kind==='material')return MATERIAL_BASE[name]||18;return 10}
  function items(){
    ensureExplorationState();ensurePlayerState();
    const out=[],catalog=window.RPG_EQUIPMENT_CATALOG||{},ex=state.exploration||{fieldGear:[],sinners:{}},cons=state.rpg.consumables||{};
    if(cons.water>0)out.push({token:'consumable|water',kind:'consumable',key:'water',name:'瓶裝水',qty:cons.water,rarity:'common',price:price('consumable','water','瓶裝水','common'),canSell:true});
    if(cons.potion>0)out.push({token:'consumable|potion',kind:'consumable',key:'potion',name:'小型治療藥水',qty:cons.potion,rarity:'uncommon',price:price('consumable','potion','小型治療藥水','uncommon'),canSell:true});
    [...new Set(ex.fieldGear||[])].forEach(function(id){const g=FIELD_GEAR[id];if(!g)return;const counts=fieldGearCounts(id);out.push({token:'field|'+id,kind:'field',key:id,name:g.name,qty:counts.total,used:counts.used,available:counts.unused,rarity:g.rarity||'common',price:price('field',id,g.name,g.rarity),canSell:counts.unused>0,reason:counts.unused===0?'所有份數均已配置':''})});
    const inv=state.rpg.inventory||[];
    [...new Set(inv.filter(function(x){return !!catalog[x]}))].forEach(function(name){const item=catalog[name],on=(state.rpg.equipped||[]).includes(name),count=inv.filter(function(x){return x===name}).length;out.push({token:'support|'+encodeURIComponent(name),kind:'support',key:name,name:name,qty:count,used:on?1:0,available:count-(on?1:0),rarity:item.rarity||'common',price:price('support',name,name,item.rarity),canSell:count>(on?1:0),reason:count<=(on?1:0)?'所有份數均已裝備':''})});
    const mats={};inv.filter(function(x){return !catalog[x]}).forEach(function(x){mats[x]=(mats[x]||0)+1});
    Object.entries(mats).forEach(function(p){out.push({token:'material|'+encodeURIComponent(p[0]),kind:'material',key:p[0],name:p[0],qty:p[1],rarity:'common',price:price('material',p[0],p[0],'common'),canSell:true})});
    return out;
  }
  function sell(token){const item=items().find(function(x){return x.token===token});if(!item)return {ok:false,message:'找不到可出售物品'};if(!item.canSell)return {ok:false,message:item.reason||'目前不可出售'};
    if(item.kind==='consumable')state.rpg.consumables[item.key]--;
    else if(item.kind==='field'){const i=state.exploration.fieldGear.indexOf(item.key);if(i<0)return {ok:false,message:'庫存不足'};state.exploration.fieldGear.splice(i,1)}
    else{const i=state.rpg.inventory.indexOf(item.key);if(i<0)return {ok:false,message:'庫存不足'};state.rpg.inventory.splice(i,1)}
    state.rpg.gold+=item.price;state.rpg.rewardLog='出售：'+item.name+'\n獲得 '+item.price+' 金幣。';saveLocal();return {ok:true,item:item,gold:item.price};
  }
  window.itemSellPrice=price;window.inventorySellables=items;window.sellInventoryToken=sell;
})();

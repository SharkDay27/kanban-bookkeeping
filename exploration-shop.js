(function(){
  const SUPPLIES={
    water:{id:'water',kind:'supply',name:'瓶裝水',basePrice:12,desc:'探索中罪人 HP ≤45% 時自動使用，回復 25 HP。'},
    potion:{id:'potion',kind:'supply',name:'小型治療藥水',basePrice:30,desc:'瓶裝水不足且 HP ≤20% 時自動使用，回復 45 HP。'}
  };
  const GEAR_PRICES={
    'runner-boots':115,
    'field-vest':125,
    'survey-lens':130,
    'shock-baton':140,
    'field-kit':210
  };
  const AREA_SHOPS={
    'zone-1':{name:'封鎖線雜貨攤',flavor:'由撤離區留下的臨時商販組成，補給價格最接近基準。',mult:1.00},
    'zone-2':{name:'維修層零件販子',flavor:'貨物多由維修通道回收，運送成本略高。',mult:1.08},
    'zone-3':{name:'研究棟回收櫃',flavor:'僅接受金幣交換封存物資；高危區補給有額外風險成本。',mult:1.18},
    'zone-4':{name:'黑區行腳商',flavor:'能把貨帶進外緣黑區本身就是成本，價格最高但裝備出現率也較高。',mult:1.30}
  };

  function roundPrice(n){return Math.max(1,Math.round(n/5)*5)}
  function shuffled(arr){
    const out=arr.slice();
    for(let i=out.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[out[i],out[j]]=[out[j],out[i]]}
    return out;
  }
  function stockId(){return 'S-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7)}
  function createExplorationShop(area,names){
    ensureExplorationState();
    const info=AREA_SHOPS[area.id]||AREA_SHOPS['zone-1'];
    const riskBonus=area.level>=8?3:area.level>=5?2:1;
    const stock=[
      {stockId:stockId(),type:'supply',itemId:'water',name:SUPPLIES.water.name,desc:SUPPLIES.water.desc,price:roundPrice(SUPPLIES.water.basePrice*info.mult),qty:2+Math.floor(Math.random()*3)},
      {stockId:stockId(),type:'supply',itemId:'potion',name:SUPPLIES.potion.name,desc:SUPPLIES.potion.desc,price:roundPrice(SUPPLIES.potion.basePrice*info.mult),qty:1+Math.floor(Math.random()*2)}
    ];
    const unowned=shuffled(Object.keys(FIELD_GEAR).filter(function(id){return !state.exploration.fieldGear.includes(id)}));
    unowned.slice(0,Math.min(riskBonus,unowned.length)).forEach(function(id){
      const g=FIELD_GEAR[id],variance=.95+Math.random()*.1;
      stock.push({stockId:stockId(),type:'gear',itemId:id,name:g.name,desc:g.desc,price:roundPrice((GEAR_PRICES[id]||140)*info.mult*variance),qty:1});
    });
    const shop={
      id:'SHOP-'+Date.now(),areaId:area.id,name:info.name,flavor:info.flavor,mult:info.mult,
      openedAt:new Date().toISOString(),team:(names||[]).slice(0,2),stock:stock,purchases:[]
    };
    state.exploration.activeShop=shop;
    return shop;
  }

  function buyExplorationShopItem(id){
    ensureExplorationState();
    const shop=state.exploration.activeShop;
    if(!shop){toast('目前沒有可交易的商店');return}
    const item=(shop.stock||[]).find(function(x){return x.stockId===id});
    if(!item||item.qty<=0){toast('商品已售罄');return}
    const price=Number(item.finalPrice||item.price);
    if(state.rpg.gold<price){toast('金幣不足');return}
    if(item.type==='gear'&&state.exploration.fieldGear.includes(item.itemId)){toast('已持有這件探索裝備');item.qty=0;saveLocal();renderExplorationShop();return}

    state.rpg.gold-=price;item.qty--;
    if(item.type==='supply'){
      ensurePlayerState();state.rpg.consumables[item.itemId]=(state.rpg.consumables[item.itemId]||0)+1;
    }else if(item.type==='gear'){
      state.exploration.fieldGear.push(item.itemId);
    }
    shop.purchases.push({at:new Date().toISOString(),name:item.name,price:price,type:item.type});
    const log=(state.exploration.logs||[]).find(function(x){return x.kind==='shop'&&x.title==='隨機事件：'+shop.name});
    if(log){
      const bought=shop.purchases.map(function(x){return x.name+' '+x.price+'G'}).join('、');
      log.reward=bought?'購入：'+bought:'可使用金幣購買物資';
    }
    state.rpg.rewardLog='商店購入：'+item.name+'\n支付 '+price+' 金幣。';
    saveLocal();
    try{renderExplorationShop();renderBackpack();renderSinnerManagement();renderRpg()}catch(e){console.error(e)}
    toast('購入 '+item.name);
  }

  function renderExplorationShop(){
    const mount=document.getElementById('explorationShop');
    if(!mount)return;
    ensureExplorationState();
    const shop=state.exploration.activeShop;
    if(!shop){mount.hidden=true;mount.innerHTML='';return}
    mount.hidden=false;
    mount.innerHTML='<div class="shop-head"><div><div class="shop-kicker">RANDOM EVENT // FIELD SHOP</div><div class="shop-title">'+esc(shop.name)+'</div></div>'+
      '<div class="shop-wallet">CURRENT GOLD<b>'+Number(state.rpg.gold||0)+' G</b></div></div>'+
      '<div class="shop-flavor">'+esc(shop.flavor)+'</div>'+
      '<div class="shop-stock">'+(shop.stock||[]).map(function(item){
        const sold=item.qty<=0,canBuy=!sold&&state.rpg.gold>=item.price;
        const effects=typeof equipmentEffects==='function'?equipmentEffects():{shopDiscount:0};
        const finalPrice=Math.max(1,Math.round(item.price*(1-(effects.shopDiscount||0))));
        item.finalPrice=finalPrice;
        return '<article class="shop-item '+(sold?'soldout':'')+'"><div class="shop-item-head"><div><div class="shop-item-name">'+esc(item.name)+'</div>'+
          '<div class="shop-item-kind">'+(item.type==='gear'?'EQUIPMENT':'SUPPLY')+'</div></div><div class="shop-price">'+finalPrice+' G</div></div>'+
          '<div class="shop-item-desc">'+esc(item.desc)+'</div><div class="shop-item-foot"><span class="shop-stock-count">STOCK / '+item.qty+'</span>'+
          '<button type="button" class="wood shop-buy" data-shop-buy="'+esc(item.stockId)+'" '+(canBuy?'':'disabled')+'>'+(sold?'售罄':canBuy?'購買':'金幣不足')+'</button></div></article>';
      }).join('')+'</div>'+
      '<div class="shop-note">價格基準：補給品依回復效益定價；裝備依能力增幅定價；深入高風險區域會有約 8%～30% 的物流／風險加價。商店保留至下一次探索開始。</div>';
    mount.querySelectorAll('[data-shop-buy]').forEach(function(btn){btn.onclick=function(){buyExplorationShopItem(btn.dataset.shopBuy)}});
  }

  window.createExplorationShop=createExplorationShop;
  window.buyExplorationShopItem=buyExplorationShopItem;
  window.renderExplorationShop=renderExplorationShop;
  document.addEventListener('DOMContentLoaded',function(){setTimeout(renderExplorationShop,0)});
  window.addEventListener('pageshow',function(){setTimeout(renderExplorationShop,0)});
})();
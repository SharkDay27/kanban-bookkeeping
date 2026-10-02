(function(){
  const LEVELS={
    common:{key:'common',label:'一般',className:'rarity-common',rank:1},
    uncommon:{key:'uncommon',label:'精良',className:'rarity-uncommon',rank:2},
    rare:{key:'rare',label:'稀有',className:'rarity-rare',rank:3},
    epic:{key:'epic',label:'史詩',className:'rarity-epic',rank:4},
    legendary:{key:'legendary',label:'傳說',className:'rarity-legendary',rank:5}
  };
  const NAME_MAP={
    '瓶裝水':'common',
    '小型治療藥水':'uncommon',
    '銅幣袋':'common',
    '史萊姆膠':'uncommon'
  };
  function normalize(value){
    if(LEVELS[value])return value;
    const map={'一般':'common','普通':'common','精良':'uncommon','稀有':'rare','史詩':'epic','傳說':'legendary','致命':'legendary'};
    return map[value]||'common';
  }
  window.ITEM_RARITIES=LEVELS;
  window.itemRarity=function(value){return LEVELS[normalize(value)]};
  window.itemRarityForName=function(name){return LEVELS[normalize(NAME_MAP[name]||'common')]};
})();
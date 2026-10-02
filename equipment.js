(function(){
  const catalog={
    '銀色羽毛筆':{slot:'工具',rarity:'一般',desc:'記帳經驗獲得 +15%',expBonus:.15,source:'道具箱'},
    '見習短劍':{slot:'武裝',rarity:'一般',desc:'探索戰鬥時每名罪人傷害 +2',allDamage:2,source:'道具箱'},

    '黃金算盤':{slot:'工具',rarity:'稀有',desc:'每日／探索任務經驗獲得 +15%',questXpBonus:.15,source:'道具箱'},
    '幸運硬幣':{slot:'飾品',rarity:'一般',desc:'獲得金幣時額外 +10%',goldBonus:.10,source:'道具箱'},
    '商人斗篷':{slot:'防具',rarity:'稀有',desc:'探索商店售價 -8%',shopDiscount:.08,source:'道具箱'},
    '王者徽章':{slot:'徽章',rarity:'稀有',desc:'探索戰鬥時每名罪人傷害 +3',allDamage:3,source:'探索／道具箱'},
    '管理者徽章':{slot:'徽章',rarity:'史詩',desc:'探索 EXP +8%，隨機事件判定 +6%',exploreXpBonus:.08,eventBonus:.06,source:'收容／道具箱'},
    '黑箱定位器':{slot:'工具',rarity:'稀有',desc:'探索掉落裝備／補給的機會小幅提升',lootBonus:.08,source:'探索事件'},
    '應急通訊器':{slot:'工具',rarity:'一般',desc:'隨機事件判定 +5%',eventBonus:.05,source:'道具箱'},
    '回收商識別證':{slot:'飾品',rarity:'史詩',desc:'探索商店售價 -12%',shopDiscount:.12,source:'商店／道具箱'}
  };
  window.RPG_EQUIPMENT_CATALOG=catalog;

  function attrs(item){
    const out=[];
    if(item.expBonus)out.push('記帳 EXP +'+Math.round(item.expBonus*100)+'%');
    if(item.questXpBonus)out.push('任務 EXP +'+Math.round(item.questXpBonus*100)+'%');
    if(item.goldBonus)out.push('金幣收益 +'+Math.round(item.goldBonus*100)+'%');
    if(item.shopDiscount)out.push('商店折扣 '+Math.round(item.shopDiscount*100)+'%');
    if(item.exploreXpBonus)out.push('探索 EXP +'+Math.round(item.exploreXpBonus*100)+'%');
    if(item.eventBonus)out.push('事件判定 +'+Math.round(item.eventBonus*100)+'%');
    if(item.lootBonus)out.push('探索掉落 +'+Math.round(item.lootBonus*100)+'%');
    return out;
  }
  window.rpgEquipmentAttributes=attrs;

  // Preserve existing gear while allowing newly introduced support equipment to appear in rewards.
  window.rpgSupportEquipmentNames=function(){return Object.keys(catalog)};
})();
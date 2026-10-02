(function(){
  const catalog={
    '銀色羽毛筆':{slot:'工具',rarity:'common',desc:'適合日常記帳與經理成長的文書工具。',expBonus:.15,source:'道具箱'},
    '見習短劍':{slot:'武裝',rarity:'common',desc:'輕量制壓武裝，適合補足直接輸出的探索編成。',allDamage:2,source:'道具箱'},

    '黃金算盤':{slot:'工具',rarity:'rare',desc:'用於提高任務回饋效率的管理工具。',questXpBonus:.15,source:'道具箱'},
    '幸運硬幣':{slot:'飾品',rarity:'common',desc:'偏向資源累積的幸運型飾品。',goldBonus:.10,source:'道具箱'},
    '商人斗篷':{slot:'防具',rarity:'rare',desc:'與探索商販交易時較容易取得有利價格。',shopDiscount:.08,source:'道具箱'},
    '王者徽章':{slot:'徽章',rarity:'rare',desc:'高階制壓徽章，強化探索隊伍的直接火力。',allDamage:3,source:'探索／道具箱'},
    '管理者徽章':{slot:'徽章',rarity:'legendary',desc:'兼顧探索成長與現場判讀的高階管理徽章。',exploreXpBonus:.08,eventBonus:.06,source:'收容／道具箱'},
    '黑箱定位器':{slot:'工具',rarity:'rare',desc:'協助定位可回收物資與裝備的搜尋工具。',lootBonus:.08,source:'探索事件'},
    '應急通訊器':{slot:'工具',rarity:'common',desc:'提高通訊與現場協調效率，降低事件判斷失誤。',eventBonus:.05,source:'道具箱'},
    '回收商識別證':{slot:'飾品',rarity:'epic',desc:'資深回收商通行證，可取得更好的交易條件。',shopDiscount:.12,source:'商店／道具箱'}
  };
  window.RPG_EQUIPMENT_CATALOG=catalog;

  function attrs(item){
    const out=[];
    if(item.allDamage)out.push('全隊基礎戰鬥傷害 +'+item.allDamage);
    if(item.expBonus)out.push('記帳 EXP +'+Math.round(item.expBonus*100)+'%');
    if(item.questXpBonus)out.push('任務 EXP +'+Math.round(item.questXpBonus*100)+'%');
    if(item.goldBonus)out.push('金幣收益 +'+Math.round(item.goldBonus*100)+'%');
    if(item.shopDiscount)out.push('商店折扣 '+Math.round(item.shopDiscount*100)+'%');
    if(item.exploreXpBonus)out.push('探索戰鬥 EXP +'+Math.round(item.exploreXpBonus*100)+'%');
    if(item.eventBonus)out.push('事件判定 +'+Math.round(item.eventBonus*100)+'%');
    if(item.lootBonus)out.push('探索掉落 +'+Math.round(item.lootBonus*100)+'%');
    return out;
  }
  window.rpgEquipmentAttributes=attrs;

  // Preserve existing gear while allowing newly introduced support equipment to appear in rewards.
  window.rpgSupportEquipmentNames=function(){return Object.keys(catalog)};
})();

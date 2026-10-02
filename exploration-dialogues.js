(function(){
  function pick(arr){return arr[Math.floor(Math.random()*arr.length)]}
  function speech(name,text){return {speaker:name,text:text,visibility:'public',kind:'speech'}}
  function action(name,text){return {speaker:name,text:text,visibility:'public',kind:'action'}}

  const EVENT={
    'sealed-door':{
      '李箱':['撞擊的間隔沒有變。先別開，讓它再重複一次。'],
      '浮士德':['它不是在胡亂撞門。受力點太固定了，先看它想讓我們做什麼。'],
      '堂吉訶德':['門後若真有人求援，吾等不能不管！……但先確認那到底是不是人！'],
      '良秀':['別開。先聽。'],
      '默爾索':['門仍可承受撞擊。繼續觀察即可。'],
      '鴻璐':['它好像不是急著出來，倒像在等我們回應。'],
      '希斯克利夫':['先別碰。裡頭那玩意要是在等我們開門，現在開才蠢。'],
      '以實瑪利':['等等，先找另一條路。只有一個退路的時候別去開未知的門。'],
      '羅佳':['催得這麼急，我反而更不想開了。'],
      '辛克萊':['它每次撞完都會停一下……像是在聽我們有沒有動。'],
      '奧提斯':['先確認兩側撤離路線，再接觸門後目標。'],
      '格里高爾':['這聲音聽著就麻煩。門先留著吧。']
    },
    'false-radio':{
      '李箱':['多出一道聲音，不代表真的多出了一個人。'],
      '浮士德':['只有兩個發訊端。第三道聲音沒有正常來源。'],
      '堂吉訶德':['竟敢假冒同伴！吾絕不會上當！'],
      '良秀':['聲音像。呼吸不像。假的。'],
      '默爾索':['不要回覆。直接切斷外放。'],
      '鴻璐':['它知道我們的名字，可是完全不像真的認識我們。'],
      '希斯克利夫':['關掉。越聽越像在釣我們回話。'],
      '以實瑪利':['別回它。真的，一句都別回。它就是在等我們自己把資訊送出去。'],
      '羅佳':['第三個隊員都幫我們準備好了？可惜今天真的只有兩個。'],
      '辛克萊':['那是我的聲音……可我根本沒說過那句。'],
      '奧提斯':['停止語音通訊。改用視線與手勢確認。'],
      '格里高爾':['收訊差已經夠煩了，現在還多送一個不存在的人進來。']
    },
    'abandoned-meal':{
      '李箱':['桌面像停在剛有人離席的一刻。只是這一刻停了多久，尚不可知。'],
      '浮士德':['兩份餐點的溫度幾乎一致。這不是普通的「剛端上來」。'],
      '堂吉訶德':['香氣確實誘人……但越是如此越不可掉以輕心！'],
      '良秀':['擺得不差。氣味不對。'],
      '默爾索':['不食用。必要時只保留樣本。'],
      '鴻璐':['剛好兩份呢。像是早就知道我們會來。'],
      '希斯克利夫':['我沒說我要吃。只是這味道在這鬼地方也太明顯了。'],
      '以實瑪利':['別碰餐具。剛好兩份這件事本身就不對勁。'],
      '羅佳':['越像免費招待，我越不敢碰。'],
      '辛克萊':['這裡明明很久沒有人……為什麼還在冒熱氣？'],
      '奧提斯':['視為誘導性物件。禁止食用。'],
      '格里高爾':['我是不挑食啦，但這桌我真的不敢動。']
    },
    'mirror-corridor':{
      '李箱':['倒影若有自己的遲疑，那便已不是倒影。'],
      '浮士德':['不同鏡面的延遲不一樣。它們不是同一個「我們」。'],
      '堂吉訶德':['那面鏡中的吾，方才是不是比吾本人先轉過來了？！'],
      '良秀':['先別砸。碎了只會多出更多贗品。'],
      '默爾索':['保持交叉視線。不要背對鏡面。'],
      '鴻璐':['它們好像不是在照我們，是在觀察我們怎麼動。'],
      '希斯克利夫':['那混蛋剛剛比我先轉頭。真讓人火大。'],
      '以實瑪利':['看著我，別看鏡子。只要我們還能確認彼此的位置就行。'],
      '羅佳':['另一個自己在旁邊練習怎麼騙你，真不好玩。'],
      '辛克萊':['我沒有轉頭……可是鏡子裡的我剛才轉了。'],
      '奧提斯':['鏡像不可作為導航基準。只認實際隊友位置。'],
      '格里高爾':['我第一次這麼懷念只會把人照難看的普通鏡子。']
    },
    'red-file':{
      '李箱':['尚未發生之事被寫得如此篤定，反倒像是在等我們替它完成。'],
      '浮士德':['別把它當預言。把它當成會干擾選擇的物件，反而比較好處理。'],
      '堂吉訶德':['未來豈能由一份來路不明的文件決定！'],
      '良秀':['提前寫好的結局最無聊。合上。'],
      '默爾索':['封存。後續決策不依據該文件。'],
      '鴻璐':['如果我們故意不照著做，它上面的字會自己改嗎？'],
      '希斯克利夫':['收起來。別讓破紙替我們選路。'],
      '以實瑪利':['先別驗證內容。你越想證明它對不對，就越容易照著它走。'],
      '羅佳':['要是寫我會發財，我可能還願意多看兩眼。事故報告就免了。'],
      '辛克萊':['如果我們照著做……那到底算它預測到了，還是我們讓它成真？'],
      '奧提斯':['立即隔離。不得作為作戰依據。'],
      '格里高爾':['提前看到麻煩，一點也不會讓麻煩變少。']
    }
  };

  const ACTION={
    '良秀':{
      'sealed-door':['良秀沒有接話，只把刀鞘貼近門板，跟著撞擊節奏輕敲了兩下。'],
      'false-radio':['良秀直接按掉外放，低頭看了眼仍在閃爍的訊號燈。'],
      'abandoned-meal':['良秀用刀鞘把餐具推遠，俯身聞了一下氣味，隨即皺眉。'],
      'mirror-corridor':['良秀把刀尖停在兩面鏡子的交界，等著哪一道影子先動。'],
      'red-file':['良秀掃了一眼檔案，直接闔上，壓到其他封存物下面。'],
      'combat':['良秀沒有說話，趁怪異重心偏移時直接切進死角，沿著舊傷補上第二刀。'],
      'shop':['良秀逐件掂過裝備，只把真正順手的留在手邊。'],
      'supply':['良秀檢查過封口，直接把補給丟進回收袋。'],
      'gear':['良秀試了試配重，沒說什麼，只把裝備收下。']
    },
    '以實瑪利':{
      'sealed-door':['以實瑪利先回頭確認後方通道，才重新看向那扇門。'],
      'false-radio':['以實瑪利伸手示意安靜，直接把通訊器調成靜音。'],
      'mirror-corridor':['以實瑪利伸手抓住搭檔的手臂，先把彼此位置固定下來。'],
      'combat':['以實瑪利沒有追擊，先把搭檔往安全側帶開，盯著怪異下一次起手。']
    },
    '希斯克利夫':{combat:['希斯克利夫啐了一聲，怪異一退就直接壓上前，不讓它重新拉開距離。']},
    '默爾索':{combat:['默爾索沒有追擊，只站到怪異最可能突進的位置，把牠的路線堵死。']},
    '堂吉訶德':{combat:['堂吉訶德往前跨了一步，又在搭檔示意後硬生生停住，改從側面繞入。']},
    '浮士德':{combat:['浮士德盯著先前的傷口看了兩秒，才示意搭檔改打另一個位置。']},
    '辛克萊':{combat:['辛克萊先確認搭檔的位置，才跟著空出的路線補上攻擊。']},
    '奧提斯':{combat:['奧提斯抬手示意壓低位置，自己把怪異的退路逼向狹窄處。']},
    '格里高爾':{combat:['格里高爾後撤半步避開第一下，等怪異撲空才從側面補上攻擊。']},
    '羅佳':{combat:['羅佳笑了一下，沒急著冒進，等怪異把注意力移開才從另一側出手。']},
    '鴻璐':{combat:['鴻璐偏頭觀察了一會兒，等某個動作再次重複才跟著出手。']},
    '李箱':{combat:['李箱沿著怪異先前移動的軌跡往前一步，正好卡住牠下一次退路。']}
  };

  const PAIR={
    'sealed-door':{
      '希斯克利夫|浮士德':['行，你看規律。我盯著門，真衝出來我處理。'],
      '良秀|以實瑪利':['先找路。門晚點開也不會跑。'],
      '以實瑪利|良秀':['對，先不開。你看門，我去確認旁邊有沒有別的通道。'],
      '羅佳|默爾索':['你說得還真乾脆……好啦，先不開。']
    },
    'false-radio':{
      '辛克萊|浮士德':['如果真的只有兩個來源……那第三個聲音到底是怎麼進來的？'],
      '希斯克利夫|鴻璐':['你可別因為好奇就回它。這東西明擺著在等。'],
      '良秀|辛克萊':['別盯著自己的聲音發呆。假的就是假的。'],
      '以實瑪利|辛克萊':['先別想它為什麼像你。把通訊關掉，看著我就好。']
    },
    'mirror-corridor':{
      '希斯克利夫|李箱':['行，你說哪面不對。我負責別讓它靠近。'],
      '良秀|希斯克利夫':['別砸。碎片多了，只會讓贗品更多。'],
      '辛克萊|以實瑪利':['好，我看著你。你也別讓我離開視線。'],
      '以實瑪利|辛克萊':['嗯，就這樣。別去確認鏡子裡那個你，先確認我。']
    },
    'red-file':{
      '良秀|浮士德':['你封。我不想聽有人把結局提前念完。'],
      '希斯克利夫|以實瑪利':['好，不驗證。把它收起來，別讓破紙替我們選路。'],
      '羅佳|浮士德':['連「試試看它準不準」都不要？……行吧，這次聽你的。'],
      '以實瑪利|鴻璐':['別真的試。就算只是好奇，也可能正好落進它想要的結果裡。']
    }
  };

  const COMBAT_REPLY={
    '李箱':{
      win:['剛才那一下讓它的節奏斷了。這條路可行。'],
      lose:['它還能動。看來我們漏掉了一個轉折。']
    },
    '浮士德':{
      win:['有反應。第二段攻擊才是真正讓它停下來的部分。'],
      lose:['先別急著加力。剛才有一段攻擊其實沒什麼效果。']
    },
    '堂吉訶德':{
      win:['好！奏效了！方才的配合再來一次也行！'],
      lose:['還差一點！但它反擊前的動作吾已看見了！']
    },
    '良秀':{
      win:['收尾還行。'],
      lose:['傷口太散。下次收乾淨。']
    },
    '默爾索':{
      win:['攻擊順序有效。'],
      lose:['傷害不足。下一次改變順序。']
    },
    '鴻璐':{
      win:['原來它真正怕的是剛才那一下。'],
      lose:['它有受傷，可是也開始習慣我們的動作了。']
    },
    '希斯克利夫':{
      win:['行，總算趴下了。'],
      lose:['嘖，真夠硬。下次別跟它磨。']
    },
    '以實瑪利':{
      win:['等等，剛才那一下很明顯。它不是一直都那麼硬，抓到時機就行。','看到了嗎？它真正露出空檔是在第二次轉身。下次別跟它正面耗。'],
      lose:['先走。真的，別再跟它換血了；我們已經知道這一輪傷害不夠。','夠了，先撤。再打下去只是在拿我們自己的血量補資料。']
    },
    '羅佳':{
      win:['漂亮～這次可不是白忙。'],
      lose:['好啦，別跟它賭耐力。我們看起來比較虧。']
    },
    '辛克萊':{
      win:['剛才真的配合上了……它被壓住的那一下很明顯。'],
      lose:['確實有打中，可這還不夠。先別再冒險了。']
    },
    '奧提斯':{
      win:['有效。保留本次輸出順序。'],
      lose:['繼續糾纏沒有價值。先撤，再調整編成。']
    },
    '格里高爾':{
      win:['呼……至少這回是它先倒。'],
      lose:['夠硬的。再耗下去先趴的可能是我們。']
    }
  };

  const SOCIAL={
    '李箱':['先照你說的走。若有變化，再換一條路。','你看到的和我看到的並不衝突。'],
    '浮士德':['嗯，可以先這樣。剩下的等現場再給答案。','我知道你的意思。先別把結論定死就好。'],
    '堂吉訶德':['好！那便照此行事！','吾也看見那處不對勁了！'],
    '良秀':['行。你先來。','嗯。這次你說得對。'],
    '默爾索':['可以。按此執行。','可行。條件改變再調整。'],
    '鴻璐':['原來你在意的是那裡。那我也再看看。','可以呀，我也想看看它接下來會怎樣。'],
    '希斯克利夫':['行，就這麼辦。','可以。真出問題再一起收拾。'],
    '以實瑪利':['好，那先這樣。你別離我太遠。','可以，但情況一變就撤，別硬撐。','我知道你想繼續看，可先把退路留著，好嗎？','對，我也覺得那裡不對。你先別碰，我去看另一邊。'],
    '羅佳':['好啦，就先這麼來～','可以啊，但別把唯一的退路堵死。'],
    '辛克萊':['好，我會注意那一點。','嗯……這樣應該比較穩。'],
    '奧提斯':['可以執行。保持警戒。','方案可行，但不要放鬆。'],
    '格里高爾':['行啊。先別把自己送進去就好。','嗯，先這樣。真有怪事再改。']
  };

  function eventLine(name,kind,ctx){
    const event=ctx&&ctx.eventId;
    if(event&&EVENT[event]&&EVENT[event][name])return pick(EVENT[event][name]);
    if(kind==='abnormality'){
      const x=COMBAT_REPLY[name]||{};
      return pick((ctx&&ctx.success?x.win:x.lose)||['先看它下一步。']);
    }
    if(kind==='shop'){
      const shop={
        '以實瑪利':['先補藥和水。裝備可以等，真的撐不住時可沒東西能替代補給。','價格先放一邊。誰的血量最低？先把會救命的買齊。'],
        '良秀':['缺什麼買什麼。別挑一堆漂亮廢物。'],
        '羅佳':['先看價格～稀有歸稀有，被當肥羊可不行。'],
        '希斯克利夫':['缺什麼買什麼，別因為難得遇到就亂花。'],
        '浮士德':['先看隊伍缺口。價格不是唯一判準。']
      };
      return pick(shop[name]||['先看看有沒有現在真的缺的東西。']);
    }
    if(kind==='supply')return pick(['補給還能用，帶走吧。','封裝沒壞。這次運氣不錯。']);
    if(kind==='gear')return pick(['狀態還行。帶回去再分配。','先收下，實戰裡好不好用之後就知道。']);
    return pick(SOCIAL[name]||['先看現場。']);
  }

  function act(name,kind,ctx){
    const event=ctx&&ctx.eventId;
    if(ACTION[name]&&event&&ACTION[name][event])return pick(ACTION[name][event]);
    const bucket=kind==='abnormality'?'combat':kind;
    if(ACTION[name]&&ACTION[name][bucket])return pick(ACTION[name][bucket]);
    return null;
  }

  function pairLine(name,other,kind,ctx){
    const event=ctx&&ctx.eventId;
    const key=name+'|'+other;
    if(event&&PAIR[event]&&PAIR[event][key])return pick(PAIR[event][key]);
    if(kind==='abnormality'){
      if(name==='以實瑪利'){
        const otherInj=(ctx.injuries||[]).find(function(x){return x.name===other});
        if(otherInj&&otherInj.damage>0)return pick([
          other+'，先退半步。你剛才那一下吃得太實了，我來看它下一次怎麼出手。',
          '你還能動吧？能就先別急著還手，先把距離拉開。'
        ]);
      }
      return eventLine(name,kind,ctx);
    }
    return pick(SOCIAL[name]||[eventLine(name,kind,ctx)]);
  }

  function uniquePush(lines,item,used){
    if(!item||!item.text)return false;
    const key=item.speaker+'|'+item.kind+'|'+item.text;
    if(used.has(key))return false;
    used.add(key);lines.push(item);return true;
  }

  function followCandidate(name,other,kind,ctx,used){
    const selfInj=(ctx.injuries||[]).find(function(x){return x.name===name});
    if(kind==='abnormality'&&selfInj&&selfInj.hp<=0){
      return action(name,name+'失去支撐，武器先落在地上，整個人跟著倒下。');
    }
    if(kind==='abnormality'&&selfInj&&selfInj.damage>0&&Math.random()<.45){
      const hurt={
        '以實瑪利':['我沒事。先看它，別因為我亂掉位置。','還能動。先別過來，守住你那邊。'],
        '希斯克利夫':['嘖，擦傷而已。先把它壓住。'],
        '格里高爾':['還行，老毛病都比這煩。先顧前面。'],
        '辛克萊':['我、我還能動。先不用管我。']
      };
      if(hurt[name])return speech(name,pick(hurt[name]));
    }
    const actionText=act(name,kind,ctx);
    if(actionText&&Math.random()<(name==='良秀'?.55:.22))return action(name,actionText);
    return speech(name,pairLine(name,other,kind,ctx));
  }

  window.generateExplorationDialogue=function(names,kind,ctx){
    if(!Array.isArray(names)||names.length<2)return [];
    const first=names[0],second=names[1],lines=[],used=new Set();

    const firstAct=act(first,kind,ctx);
    if(firstAct&&Math.random()<(first==='良秀'?.58:.18))uniquePush(lines,action(first,firstAct),used);
    else uniquePush(lines,speech(first,eventLine(first,kind,ctx)),used);

    const secondAct=act(second,kind,ctx);
    if(secondAct&&Math.random()<(second==='良秀'?.52:.15))uniquePush(lines,action(second,secondAct),used);
    else uniquePush(lines,speech(second,pairLine(second,first,kind,ctx)),used);

    // 不為了湊滿六句硬塞台詞：大多數 2～4 段，只有真的有新的反應才延長。
    const desired=Math.random()<.18?5:(Math.random()<.45?4:3);
    let turn=0,misses=0;
    while(lines.length<desired&&lines.length<6&&misses<4){
      const name=turn%2===0?first:second;
      const other=name===first?second:first;
      const item=followCandidate(name,other,kind,ctx,used);
      if(uniquePush(lines,item,used))misses=0;else misses++;
      turn++;
      // 如果場面已經有完整「觀察→回應→行動」，自然收尾。
      if(lines.length>=3&&Math.random()<.24)break;
    }

    // 同一個人連續出現完全相同類型的短句時，寧可刪掉也不跳針。
    const compact=[];
    lines.forEach(function(line){
      const prev=compact[compact.length-1];
      if(prev&&prev.speaker===line.speaker&&prev.text===line.text)return;
      compact.push(line);
    });

    if((first==='良秀'||second==='良秀')&&compact.length<5&&Math.random()<.16){
      uniquePush(compact,{speaker:'阿賴耶識（刀鞘）',text:pick(['刀鞘在良秀手邊輕輕碰了一下。','刀鞘短促地震了一聲。']),visibility:'public',kind:'action'},used);
      if(compact.length<6&&Math.random()<.55){
        uniquePush(compact,{speaker:'阿賴耶（刀鞘內）',text:pick(['媽媽不是沒在聽，她只是已經先去看下一步了。','我覺得她剛才其實是在配合，只是不太會特地說出來。']),visibility:'user-only',kind:'speech'},used);
      }
    }
    return compact.slice(0,6);
  };
})();
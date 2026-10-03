/* Original fan dialogue informed by the cast's main-story / interlude interactions.
   Actions are separate beats; no automatic call-and-response or unconfirmed names. */
function regionalPersonalAction(name,focus,failed=false){
 const acts={
  '李箱':()=>name+'在原本的記號旁停下，重新辨認'+focus+'所在的位置。',
  '浮士德':()=>name+'對照終端紀錄，沒有走進'+focus+'的影響範圍。',
  '堂吉訶德':()=>failed?name+'急忙收住前衝的腳步，扶住牆面才站穩。':name+'向前探了半步，又停下來確認'+focus+'的位置。',
  '良秀':()=>name+'抬起刀鞘，將搭檔攔在'+focus+'的另一側。',
  '默爾索':()=>name+'移到穩固的位置，留出兩人可以通行的空間。',
  '鴻璐':()=>name+'看了看'+focus+'，收回探出去的手，跟上搭檔。',
  '希斯克利夫':()=>name+'踢開腳邊的碎屑，伸手把搭檔帶離'+focus+'。',
  '以實瑪利':()=>name+'先照過腳下，再確認身後的來路沒有被擋住。',
  '羅佳':()=>name+'原本已經探身向前，看清'+focus+'後才收回腳步。',
  '辛克萊':()=>name+'抓緊背包帶，沿搭檔留下的位置慢慢退開。',
  '奧提斯':()=>name+'抬手示意停步，移到能看清通道的位置。',
  '格里高爾':()=>name+'把鬆開的背包帶拉回肩上，讓出靠牆的路。'
 };
 return (acts[name]||(()=>name+'停在搭檔身旁。'))();
}
const REGIONAL_FAILURE_VOICES={
 'zone-1':['店已閉，吾等也該離去了。','通道已封閉。從後場返回。','吾等先退！此處已過不去了！','退。別碰。','撤離原通道。','剛才還能過，現在可擠不進去了。','嘖，這破地方。走另一邊。','別硬擠，沿來路出去。','好啦，今天就逛到這裡。','出口……被擋住了。先回去吧。','停止前進。改走後場。','算了，別在這裡耗著了。'],
 'zone-2':['此路已斷，且另尋一途。','設備變化超出預期。撤出機房。','先退開！吾會跟上！','別站那。','停止接近設備。','它好像不打算讓我們過去呢。','都這樣了還走什麼。退！','扶著管架，先退到平台。','行，不跟這破機器較勁了。','先往回走……別踩到那裡。','離開運轉範圍，向後撤。','這回真撐不住了，走吧。'],
 'zone-3':['尚未解明，並不妨礙吾等離開。','先離開影響範圍，再確認資料。','此處已起變化，吾等先撤！','別碰。出去。','退出隔離範圍。','看來它不喜歡被我們看著呢。','別管那東西了，先出去。','不要回頭拿東西，先離開。','東西就留給它吧，人先出去。','先走吧……門還沒完全關上。','停止接觸樣本，撤至走廊。','這地方待不住了，快出去。'],
 'zone-4':['來路尚存，且莫再向深處行。','原路線已不可通行。退回標記處。','吾看見來時的標記了！這邊！','退回去。','沿既有標記返回。','路變窄了。再走就回不去了吧。','別往裡擠了，回去！','跟著標記，別追聲音。','算啦，今天不跟它賭。','記號還在那邊……我們先回去。','維持間距。沿來路撤離。','先回去吧，這裡可沒有第二條退路。'],
 'zone-5':['岸尚在身後，且先回岸上。','水位已改變。撤至高處。','浪過來了！吾等先上去！','上岸。','移動至高處。','水一下子就到這裡了呢。','別站水邊！上去！','抓穩扶手，先回岸上！','鞋子濕了也比人掉下去好，走啦。','扶手還在……抓住這裡！','離開水線，向上層撤離。','先別管那些東西了，人上去再說。'],
 'zone-6':['吾所留之痕尚在，且循此歸去。','門牌已失去參考價值。沿繫線返回。','吾留下的記號尚在！跟吾來！','別追。回頭。','沿實際標記撤離。','它又換了門牌，還好線沒有斷呢。','別盯著門牌，跟著線走！','確認同伴在身邊，再往回走。','好啦，這間就不住了。','線還在這裡……我們沒有走散。','停止前進，確認兩人的位置。','這走廊真夠折騰的。先回記號那裡吧。']
};
function regionalEventDialogue(names,ev,ctx={}){
 if(ev&&FRONTIER_AREAS.some(a=>a.id===ev.area))return frontierEventDialogue(names,ev,ctx);
 if(!ev?.lines)return null;
 const [first,second]=names,speech=(speaker,text)=>({speaker,text,kind:'speech'}),action=(speaker,text)=>({speaker,text,kind:'action'});
 const failed=ctx.success===false,focus=ev.observe,cast=SINNERS.map(s=>s.name);
 if(failed){
  if(ev.theme==='time'&&names.includes('良秀')){const other=names.find(n=>n!=='良秀');return [action(other,ev.failure),speech('良秀','節奏又變了。退。'),action('良秀','良秀敲擊刀鞘確認變快的間隔，在下一次變化前帶搭檔退回尚未受影響的位置。')];}
  const injuries=(ctx.injuries||[]).filter(i=>i.damage>0),hurt=injuries[0];
  const incident=action(first,ev.failure);
  const retreat=speech(second,REGIONAL_FAILURE_VOICES[ev.area][cast.indexOf(second)]);
  const reaction=action(hurt?.name||first,hurt?hurt.name+'按住受傷的位置，重新站穩後沿搭檔留出的空間撤離。':regionalPersonalAction(first,focus,true));
  return Math.random()<.5?[incident,retreat,reaction]:[incident,reaction,retreat,action(second,second+'確認同伴跟上，沒有再靠近事發位置。')];
 }
 if(ev.theme==='time'&&names.includes('良秀')){
  const other=names.find(n=>n!=='良秀');
  return Math.random()<.5?[action(other,regionalPersonalAction(other,focus)),speech('良秀',ev.lines['良秀']||'時間錯了。跟我走。'),action('良秀','良秀以指節敲了兩次刀鞘，在動作與聲音重新重合的空隙帶搭檔通過。')]:[speech('良秀',ev.lines['良秀']||'時間錯了。先別動。'),action('良秀','良秀先停在異常邊緣，辨清那一拍的差距才帶搭檔繞過。')];
 }
 if(names.includes('羅佳')&&names.includes('格里高爾')&&ev.theme==='lure')return [action('羅佳','羅佳靠近'+focus+'，停在伸手便能碰到的位置。'),speech('羅佳',ev.lines['羅佳']||'格雷格，你說再靠近一點會怎樣？'),speech('格里高爾',ev.lines['格里高爾']||'別拿自己試啊。先看看退路還在不在。'),action('羅佳','羅佳回頭看過出口，收回手，朝另一條路走去。')];
 const voice=ev.lines[first]||FIELD_EVENT_VOICES[ev.theme][first];
 const lead=speech(first,voice),react=action(second,regionalPersonalAction(second,focus));
 const result=action(first,ev.success);
 const variant=Math.floor(Math.random()*3);
 return variant===0?[lead,react]:variant===1?[action(first,regionalPersonalAction(first,focus)),lead,react]:[lead,react,result,action(second,second+'走過轉角，確認搭檔仍在身旁。')];
}
function regionalAbnormalityDialogue(names,ctx){
 if(FRONTIER_ABNORMALITIES[ctx.abnormalityId])return frontierAbnormalityDialogue(names,ctx);
 const ab=INTERMEDIATE_ABNORMALITIES[ctx.abnormalityId];if(!ab)return null;
 const [first,second]=names,speech=(speaker,text)=>({speaker,text,kind:'speech'}),action=(speaker,text)=>({speaker,text,kind:'action'});
 const clues={'A-501':'還在往岸上靠的空船','A-502':'先響後動的鐘','A-503':'灌滿水的救生衣','A-504':'水底的歌聲','A-505':'覆著鹽殼的船舵','A-506':'新露出的第七道潮痕','A-601':'掛在空椅上的房卡','A-602':'只亮著零號的按鍵','A-603':'早一步轉身的影子','A-604':'地毯下的人形','A-605':'沒有人回應的廣播','A-606':'盡頭穿著相同裝備的人影'};
 const focus=clues[ctx.abnormalityId];
 if(ab.type==='時間型'&&names.includes('良秀'))return [speech('良秀',ctx.success?'那一拍，抓到了。':'它搶了一拍。別跟著動。'),action('良秀','良秀盯著'+focus+'，敲擊刀鞘對照動作的間隔，等錯開的時間重新接上才示意搭檔移動。')];
 if(ctx.success===false)return [action(first,ab.name+'仍未停止活動，兩人讓開正面。'),speech(second,REGIONAL_FAILURE_VOICES[ab.area][SINNERS.findIndex(s=>s.name===second)]),action(first,regionalPersonalAction(first,focus,true))];
 const sea={'李箱':'潮尚未止，且莫久留。','浮士德':'目標已停止活動。確認返程水位。','堂吉訶德':'成功了！……吾等還需留意腳下！','良秀':'完了。上岸。','默爾索':'制壓完成。回到平台。','鴻璐':'海水倒是一點也沒停呢。','希斯克利夫':'嘖，一身鹽水。先回去。','以實瑪利':'先確認繫索，別在退潮線上停。','羅佳':'行，今天可沒白濕這雙鞋。','辛克萊':'船架那邊還能走……我們先過去吧。','奧提斯':'制壓完成。確認高處的返程路線。','格里高爾':'呼……先回岸上喘口氣吧。'};
 const hall={'李箱':'盡頭未改，吾等已留了歸路。','浮士德':'目標已停止活動。仍須以實際標記返程。','堂吉訶德':'已然制伏！吾的記號還在那邊！','良秀':'完了。跟上。','默爾索':'制壓完成。沿導引線返回。','鴻璐':'打完了，門牌還在換呢。','希斯克利夫':'別再給我換路了。走！','以實瑪利':'看著繫線，先離開這個房間。','羅佳':'好啦，這裡可沒有值得多住一晚的東西。','辛克萊':'剛剛的記號沒變……還能回去。','奧提斯':'確認同伴位置，沿原路撤回。','格里高爾':'總算能走了。這燈聲真夠煩的。'};
 const line=speech(first,(ab.area==='zone-5'?sea:hall)[first]),react=action(second,regionalPersonalAction(second,focus));
 return Math.random()<.5?[line,react]:[action(first,first+'確認'+focus+'不再追近。'),line,react];
}

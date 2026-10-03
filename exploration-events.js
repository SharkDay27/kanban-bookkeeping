/* Regional field incidents and noncombat resolution. No field result awards EXP. */
function explorationEventsForArea(areaId){return EXPLORATION_EVENTS.filter(ev=>ev.area===areaId)}
function resolveFieldAttempt(names,area,kind,event){
 const manager=equipmentEffects(),power=teamFieldPower(names,area)+(manager.eventBonus||0)*40;
 const difficulty=(40+area.level*5+(event?.difficulty||0)+(kind==='gear'?4:0))*(area.difficultyMultiplier||1);
 const chance=Math.max(.15,Math.min(.92,.55+(power-difficulty)/110));
 return {success:Math.random()<chance,chance};
}
function fieldFailureInjuries(names,area){
 if(Math.random()>=.65)return [];
 // Sometimes only the exposed explorer is hurt; severe incidents can hit both.
 const targets=Math.random()<.3?names:[names[Math.floor(Math.random()*names.length)]];
 return targets.map(name=>{
  const stats=sinnerEffectiveStats(name,{area}),d=state.exploration.sinners[name];
  const damage=Math.min(d.hp,Math.max(2,Math.round((7+area.level*2+Math.random()*7-stats.stability*.45-stats.mobility*.2)*(area.difficultyMultiplier||1))));
  d.hp=Math.max(0,d.hp-damage);const healed=maybeAutoHealSinner(name);
  return {name,damage,hp:d.hp,maxHp:d.maxHp,healed};
 });
}
function fieldInjuryDescription(injuries){return injuries.map(x=>x.name+' 受到 '+x.damage+' 傷害，HP '+x.hp+' / '+x.maxHp+(x.healed?.amount?'；自動使用'+x.healed.item+'，恢復 '+x.healed.amount+' HP':'')+(x.hp<=0?'【倒下】':'')).join('；')}
const FIELD_EVENT_VOICES={
 terrain:{'李箱':'足跡比路牌更可信。先看看腳下。','浮士德':'固定點已經鬆動。不要直接踏過去。','堂吉訶德':'等等！前方的地面似乎不穩！','良秀':'腳下。別踩。','默爾索':'停步。先確認承重。','鴻璐':'看著還能走，腳下卻已經裂開了呢。','希斯克利夫':'這破路。先別往前擠。','以實瑪利':'踩我走過的位置，先別越過去。','羅佳':'哎，先慢一點。我可不想掉下去。','辛克萊':'這裡的痕跡……是不是剛剛才留下的？','奧提斯':'停止前進。先確認可承重的位置。','格里高爾':'先等一下吧。這地方踩著不太踏實。'},
 sound:{'李箱':'聲音先至，來者卻不見蹤跡。且再聽一回。','浮士德':'聲音的方向與震動不一致。先停下確認。','堂吉訶德':'有動靜！……但吾還看不見來者。','良秀':'別出聲。聽。','默爾索':'無法確認來源。暫停移動。','鴻璐':'它剛才在後面，現在好像又到前面去了。','希斯克利夫':'吵死了。先聽清楚是哪邊。','以實瑪利':'停一下。別讓我們的腳步蓋過它。','羅佳':'聽到了吧？我可沒踢到東西。','辛克萊':'不是我們的腳步……我們已經停下了。','奧提斯':'保持安靜。留意兩側通道。','格里高爾':'這聲音到底是哪來的啊……先別走。'},
 time:{'李箱':'時刻已過，眼前之物卻尚未跟上。','浮士德':'終端與現場的時間不一致。不要用畫面判斷位置。','堂吉訶德':'方才不是已經走過此處了嗎？！','良秀':'少了一拍。時間不對。','默爾索':'記錄與現場不一致。重新確認出口。','鴻璐':'我們剛剛走的那幾步，好像不算數呢。','希斯克利夫':'又是這地方？我可沒往回走。','以實瑪利':'先別信時鐘。看著身旁的人走。','羅佳':'剛剛那段路白走了？先別急著再走一次。','辛克萊':'我記得剛剛走過了……可它還停在那裡。','奧提斯':'停止依賴時間顯示。確認實際位置。','格里高爾':'這回連時間都不肯往前走了。'},
 mechanical:{'李箱':'聲響漸急。它恐怕不會等吾等通過。','浮士德':'支撐部位已超過負荷。先避開正面。','堂吉訶德':'吾看見裂痕了！先別從下面過！','良秀':'撐不住了。讓開。','默爾索':'結構不穩定。改走側道。','鴻璐':'它還在動呢。明明已經沒有電了。','希斯克利夫':'都壞成這樣了，還想直接過去？','以實瑪利':'退到側邊，別站在它正前方。','羅佳':'等等，這聲音可不像還能撐住的樣子。','辛克萊':'它剛才是不是又動了一下？','奧提斯':'離開受力方向。不要停在正面。','格里高爾':'這東西隨時會掉吧？我們繞一下。'},
 lure:{'李箱':'它如此急於邀人，吾等反而不必急著答應。','浮士德':'它正在誘導我們靠近。不要跟隨指示。','堂吉訶德':'竟想用此等把戲誘吾上當！','良秀':'餌。別碰。','默爾索':'沒有接觸的必要。繞行。','鴻璐':'它好像一直在等我們走過去呢。','希斯克利夫':'催什麼催。誰說我們要過去了？','以實瑪利':'先別靠近。看它在引我們去哪裡。','羅佳':'催成這樣，反倒想看看它藏了什麼。先別碰啊。','辛克萊':'它好像只在我們看過去的時候才動。','奧提斯':'忽略誘導訊號。維持原定路線。','格里高爾':'越是催著你去，越不像有好事。'},
 chemical:{'李箱':'無名之物既已溢出，且給它留些距離。','浮士德':'未標示成分。不要接觸滲出的液體。','堂吉訶德':'有東西漏出來了！吾等先退開！','良秀':'漏了。別沾。','默爾索':'無法確認成分。維持距離。','鴻璐':'連標籤都沒留，這要怎麼知道裡面是什麼？','希斯克利夫':'別伸手。誰知道這玩意會把手弄成什麼樣。','以實瑪利':'先看地上，別踩到流出來的東西。','羅佳':'這可不能光看著乾淨就去碰啊。','辛克萊':'是不是流到櫃子外面了？先退一點吧。','奧提斯':'避免接觸。尋找未污染的撤離路線。','格里高爾':'沒標籤的東西我可不敢碰。離遠一點吧。'}
};
function newFieldEventScene(names,ev){
 const regional=regionalEventDialogue(names,ev,{success:true});if(regional)return regional;
 const [first,second]=names,speech=(speaker,text)=>({speaker,text,kind:'speech'}),action=(speaker,text)=>({speaker,text,kind:'action'});
 if(ev.theme==='time'&&names.includes('良秀')){const other=names.find(n=>n!=='良秀');return [action(other,other+'停下腳步，看著與終端顯示不同步的現場。'),speech('良秀','時間少了一拍。先別動。'),action('良秀','良秀在刀鞘上敲了兩下，等聲音與動作重合才帶搭檔繞開異常的區段。')];}
 if(ev.theme==='lure'&&names.includes('羅佳')&&names.includes('格里高爾'))return [action('羅佳','羅佳往前探了探身，還沒踏進亮起的標記。'),speech('羅佳','格雷格，你說走過去會怎樣？'),speech('格里高爾','別拿自己試啊。你看，連它後面的門都關上了。'),action('羅佳','羅佳抬眼看了看門口，收回原本準備邁出去的腳。')];
 if(ev.theme==='chemical'&&names.includes('堂吉訶德')&&names.includes('浮士德'))return [speech('堂吉訶德','浮士德小姐！吾可先將它搬到旁邊？'),speech('浮士德','堂吉訶德小姐，先別碰。試管已經裂開了。'),action('堂吉訶德','堂吉訶德停在櫃前，低頭找過腳下的液體後才慢慢退開。')];
 if(ev.theme==='terrain'&&names.includes('辛克萊')&&names.includes('希斯克利夫'))return [speech('辛克萊','希斯克利夫先生，那邊好像還能走……'),action('希斯克利夫','希斯克利夫伸手攔住辛克萊，用腳尖撥開遮住裂縫的碎屑。'),speech('希斯克利夫','先看腳下。踩空了我可拉不住你。')];

 const observation={
  '李箱':name=>name+'借著燈光記下'+ev.observe+'的位置。','浮士德':name=>name+'停在接觸範圍之外，對照'+ev.observe+'與通道的位置。','堂吉訶德':name=>name+'快步湊近，看到'+ev.observe+'的變化後又退了半步。','良秀':name=>ev.theme==='time'?name+'敲了敲刀鞘，對照聲音與動作的間隔，將搭檔攔在異常區段外。':name+'瞥向'+ev.observe+'，抬起刀鞘攔在搭檔身前。','默爾索':name=>name+'確認'+ev.observe+'的位置，移到旁邊的穩固地面。','鴻璐':name=>name+'好奇地看向'+ev.observe+'，腳步卻停在搭檔身旁。','希斯克利夫':name=>name+'盯了'+ev.observe+'一眼，把腳邊礙事的雜物踢開。','以實瑪利':name=>name+'用燈照過'+ev.observe+'，先確認身後的來路。','羅佳':name=>name+'原本已經探身向前，看清'+ev.observe+'後收住了步子。','辛克萊':name=>name+'握住背包帶，目光停在'+ev.observe+'上。','奧提斯':name=>name+'打手勢示意停步，沿'+ev.observe+'兩側查看可通行的位置。','格里高爾':name=>name+'停下揉了揉肩膀，避開'+ev.observe+'所在的方向。'
 };
 const lines=[speech(first,FIELD_EVENT_VOICES[ev.theme][first]),action(second,observation[second](second))];
 if(Math.random()<.5)lines.unshift(action(first,observation[first](first)));
 return lines;
}

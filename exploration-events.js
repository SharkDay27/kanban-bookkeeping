/* Regional field incidents and noncombat resolution. No field result awards EXP. */
const EXTRA_EXPLORATION_EVENTS=[
 {id:'hanging-sign',name:'搖晃的路牌',area:'any',theme:'terrain',desc:'頭頂的路牌只剩一條固定索，通道下方散著新掉落的碎片。',success:'沿牆繞過吊索下方，確認了可通行的路線。',failure:'吊索突然斷裂，兩人被迫退回轉角。',hazard:'落下的碎片',observe:'那條固定索',difficulty:0},
 {id:'returning-footsteps',name:'折返的腳步',area:'any',theme:'sound',desc:'身後的腳步聲總在兩人停下後才停，回頭卻看不到任何人。',success:'改變步距後辨明了回聲來源，離開聲音聚集的通道。',failure:'回聲突然從前方傳來，兩人在轉角處失去了方向。',hazard:'轉角散落的尖銳殘骸',observe:'跟在後面的腳步聲',difficulty:3},
 {id:'stalled-minute',name:'遺失的一分鐘',area:'any',theme:'time',desc:'終端時間跳過了一分鐘，但走廊盡頭的水滴仍停在半空。',success:'避開停滯的區段，終端與現場的時間重新一致。',failure:'踏入異常範圍後，周圍動作突然加速，隊伍只得撤出。',hazard:'突然恢復移動的雜物',observe:'停在半空的水滴',difficulty:5},
 {id:'fallen-shutter',name:'半落的鐵捲門',area:'any',theme:'mechanical',desc:'鐵捲門卡在半空，門後透出工作燈的光，馬達卻已燒毀。',success:'確認支架後繞過捲門，找到另一側的通道。',failure:'捲門再次下滑，隊伍未能進入門後通道。',hazard:'下滑的金屬門片',observe:'捲門的支架',difficulty:2},
 {id:'last-sale',name:'最後一場特賣',area:'zone-1',theme:'lure',desc:'商店櫥窗忽然亮起，只剩一秒的折扣倒數不斷重新開始。',success:'辨明倒數並未結束，避開了自動開啟的櫥窗。',failure:'靠近價牌時櫥窗突然合攏，隊伍匆忙退開。',hazard:'合攏的櫥窗與玻璃碎片',observe:'反覆重來的倒數',difficulty:3},
 {id:'empty-queue',name:'沒有人的隊伍',area:'zone-1',theme:'lure',desc:'地面排隊標記逐一亮起，空蕩的收銀台不斷呼叫下一位。',success:'沒有踏入排隊標記，從後場繞過收銀區。',failure:'踏入標記後欄杆自行收攏，出口被暫時封住。',hazard:'突然收攏的排隊欄杆',observe:'亮起的排隊標記',difficulty:1},
 {id:'pressure-valve',name:'超壓的閥門',area:'zone-2',theme:'mechanical',desc:'壓力錶指針來回震動，閥門縫隙傳出越來越尖的聲音。',success:'避開洩壓方向，在蒸氣噴出前通過維修側道。',failure:'閥門提前洩壓，蒸氣封住了原定路線。',hazard:'高溫蒸氣',observe:'壓力錶的指針',difficulty:4},
 {id:'moving-ladder',name:'移位的維修梯',area:'zone-2',theme:'terrain',desc:'維修梯每次被燈照到，都比上一次更靠近井口。',success:'在穩固位置重新固定梯腳，繞過維修井。',failure:'梯腳滑入井口，周圍的踏板一併鬆脫。',hazard:'鬆脫的踏板',observe:'梯腳留下的刮痕',difficulty:3},
 {id:'unlabeled-vial',name:'無標籤的樣本',area:'zone-3',theme:'chemical',desc:'隔離櫃裡的試管沒有標籤，一支裂開的玻璃管正在滲出透明液體。',success:'隔離了破損樣本，從尚未污染的通道離開。',failure:'隔離櫃內突然加壓，破損試管向外噴濺。',hazard:'樣本液與玻璃碎片',observe:'裂開的試管',difficulty:5},
 {id:'repeating-monitor',name:'重播的觀測室',area:'zone-3',theme:'time',desc:'監視器反覆播放兩人走入房間的畫面，門外的時鐘卻一格也沒有前進。',success:'對照現場節奏找出未被重播的出口，離開觀測室。',failure:'畫面與現場同時跳回起點，房門在兩人身後突然關上。',hazard:'突然閉合的房門',observe:'不再走動的時鐘',difficulty:7},
 {id:'unlit-crossing',name:'失照的平交道',area:'zone-4',theme:'sound',desc:'平交道警鈴在黑暗中響起，兩側軌道都看不見列車的燈。',success:'等震動平息後沿路基通過，沒有踏入警鈴指向的軌道。',failure:'路基突然震動，隊伍被迫離開原定的通行位置。',hazard:'震動中飛起的道碴',observe:'沒有車燈的軌道',difficulty:8},
 {id:'hollow-waymark',name:'空心的路標',area:'zone-4',theme:'terrain',desc:'每個路標都指向同一條岔路，路旁的腳印卻只進不出。',success:'留下新的實際標記，從腳印以外的路線返回主道。',failure:'岔路在身後收窄，來時的地面開始崩落。',hazard:'崩落的路面',observe:'只有去程的腳印',difficulty:6}
];
function explorationEventsForArea(areaId){return EXPLORATION_EVENTS.filter(ev=>!ev.area||ev.area==='any'||ev.area===areaId)}
function resolveFieldAttempt(names,area,kind,event){
 const manager=equipmentEffects(),power=teamFieldPower(names,area)+(manager.eventBonus||0)*40;
 const difficulty=40+area.level*5+(event?.difficulty||0)+(kind==='gear'?4:0);
 const chance=Math.max(.15,Math.min(.92,.55+(power-difficulty)/110));
 return {success:Math.random()<chance,chance};
}
function fieldFailureInjuries(names,area){
 if(Math.random()>=.65)return [];
 // Sometimes only the exposed explorer is hurt; severe incidents can hit both.
 const targets=Math.random()<.3?names:[names[Math.floor(Math.random()*names.length)]];
 return targets.map(name=>{
  const stats=sinnerEffectiveStats(name,{area}),d=state.exploration.sinners[name];
  const damage=Math.min(d.hp,Math.max(2,Math.round(7+area.level*2+Math.random()*7-stats.stability*.45-stats.mobility*.2)));
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

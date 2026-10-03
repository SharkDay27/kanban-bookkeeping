/* New fan exchanges; confirmed addresses follow sinner-addresses.js and the user's table.
   Voice references: Huiji 9-07, 7.5-12, 7.5-22 and 4.5-10 (main story/interludes). */
const FRONTIER_VOICES={
 'zone-7':{
  '李箱':'街仍在此，居民卻不再循往日之路。且看清出口。','浮士德':'隔離標記不代表這裡仍然安全。先確認現場。','堂吉訶德':'吾想看看還有沒有人……先確認退路便是！','良秀':'別碰。看路。','默爾索':'沿未被封堵的通道移動。','鴻璐':'燈還亮著呢。只是好像沒有人打算出來。','希斯克利夫':'這地方沒一條好走的路。跟上。','以實瑪利':'記下剛才的轉角，別跟著撤離廣播走。','羅佳':'這裡可不像真把人撤乾淨了。先看看另一邊。','辛克萊':'那扇門……剛才還是開著的。','奧提斯':'確認側道。別堵在正門口。','格里高爾':'這股味道真夠嗆的。先把罩子扣好吧。'
 },
 'zone-8':{
  '李箱':'星光仍在遠處，這一處空白卻似正向吾等靠近。','浮士德':'資料不足。先記下現象，不必替它補上答案。','堂吉訶德':'窗外竟是……吾等先把繫索扣好，再看！','良秀':'看夠了。回頭。','默爾索':'返回標記仍在。沿實際艙段移動。','鴻璐':'真想知道那邊有什麼。不過它好像也想知道我們是誰。','希斯克利夫':'別光顧著看外面。門在哪，先記住。','以實瑪利':'繫索別鬆開。這裡的方向顯示不太可靠。','羅佳':'哎，這景色真沒見過。可窗邊怎麼比剛才更冷了？','辛克萊':'那個影子……是在玻璃上，還是在外面？','奧提斯':'保留返程標記。未知訊號不要回覆。','格里高爾':'在這地方，我寧可聽見熟悉的引擎聲。'
 }
};
const FRONTIER_FAILURE_VOICES={
 'zone-7':['來路尚未封死，且先退回。','隔離設備已失效。從側門離開。','這邊！吾看見維修梯了！','退。別踩水。','原通道已封堵。改走側道。','它把門也堵上了呢。走另一邊吧。','別再撿了！先出去！','沿剛才的牆邊走，別碰地上的東西。','行啦，東西留著，人先回去。','這裡還能過……先跟我走。','退出污染範圍，確認同伴跟上。','別硬闖了。側門還開著。'],
 'zone-8':['艙門仍在身後，且莫追逐遠處之光。','停止操作。沿實際標記返程。','繫索還在！吾等從這邊回去！','別追。拉回來。','關閉內側艙門，離開此艙段。','先不看那邊了。線還連著門口呢。','拉緊那根線！別往外飄！','扣住扶手，沿繫索回去。','好啦，這個窗口今天就看到這裡。','門口的記號還在……我們先回去。','固定裝備，撤回內側隔離門。','先回去吧。我可不想留在這裡等它靠近。']
};
function frontierPersonalAction(name,area,focus,failed=false){
 const city={
 '李箱':'在街角留下新的記號，再看一眼'+focus+'。','浮士德':'將終端轉向'+focus+'，留在隔離標記外。','堂吉訶德':failed?'急忙避開落下的殘骸，扶住門框站穩。':'朝'+focus+'走了半步，看到搭檔停下便收住腳步。','良秀':'用刀鞘攔住搭檔，先看過'+focus+'兩側的通道。','默爾索':'固定鬆動的門板，留出兩人能通過的空間。','鴻璐':'低頭看過雨水裡的痕跡，沒有踏進'+focus+'旁的水窪。','希斯克利夫':'把礙路的空罐踢到牆邊，伸手拉住搭檔的背包帶。','以實瑪利':'用燈照過排水口，確認來路仍能通行。','羅佳':'探身查看'+focus+'，在腳邊的水跡前停住。','辛克萊':'握緊背包帶，沿搭檔確認過的乾燥位置移動。','奧提斯':'示意搭檔靠牆，檢查旁側出口。','格里高爾':'拉緊面罩邊緣，側身讓搭檔先過門口。'
 };
 const space={
 '李箱':'將繫索扣在扶手上，記下'+focus+'與艙門的距離。','浮士德':'遮住終端上的陌生訊號，重新核對實際艙號。','堂吉訶德':failed?'猛地抓住扶手，重新扣好鬆開的繫索。':'伸手想靠近'+focus+'，繫索拉緊後才停下。','良秀':'按住搭檔的肩，將人帶離'+focus+'正前方。','默爾索':'鎖住鬆動的扣具，將飄起的工具固定到牆面。','鴻璐':'看過'+focus+'的邊緣，轉頭確認搭檔仍在身旁。','希斯克利夫':'把飄到眼前的工具塞進袋裡，拉緊回程繫索。','以實瑪利':'沿繫索確認艙門位置，再將備用扣具扣到扶手上。','羅佳':'湊近查看'+focus+'，聽見扣具拉緊便退回扶手旁。','辛克萊':'握住固定索，將燈光移回兩人走過的門框。','奧提斯':'固定背包，抬手指向仍亮著的返程艙號。','格里高爾':'把背包扣回腰側，騰出一隻手抓住扶手。'
 };
 return name+(area==='zone-7'?city:space)[name];
}
const FRONTIER_PAIR_EVENTS={
 'q-sealed-gate':{names:['良秀','奧提斯'],lines:[['良秀','拆了。'],['奧提斯','先斷電。馬達還在轉。'],['良秀','開關在哪？']]},
 'q-ward-knock':{names:['堂吉訶德','以實瑪利'],lines:[['堂吉訶德','以實瑪利小姐，裡面會不會還有人？'],['以實瑪利','先退到側邊。敲門聲在換位置。']]},
 'q-culture-spill':{names:['良秀','浮士德'],lines:[['良秀','白髮，它在聽？'],['浮士德','菌絲隨震動移動。良秀小姐，先別敲。']]},
 'q-rescue-light':{names:['羅佳','格里高爾'],lines:[['羅佳','格雷格，你說後面還藏了什麼？'],['格里高爾','先別坐進去啊。另一邊連門都沒有。']]},
 'q-rooftop-route':{names:['辛克萊','希斯克利夫'],lines:[['辛克萊','希斯克利夫先生，那邊的梯子好像還能用。'],['希斯克利夫','嗯。先看固定的地方，別急著踩。']]},
 's-unsent-reply':{names:['良秀','浮士德'],lines:[['良秀','白髮，這句還沒說。'],['浮士德','良秀小姐，不要照著錄音回答。先中斷重播。']]},
 's-black-window':{names:['羅佳','格里高爾'],lines:[['羅佳','格雷格，再看一眼嘛。剛才那塊黑的會動。'],['格里高爾','我看見了。別貼那麼近，玻璃都起霜了。']]},
 's-pressure-seam':{names:['默爾索','奧提斯'],lines:[['默爾索','奧提斯，內側隔離門尚可關閉。'],['奧提斯','關上。我確認兩人都在這一側。']]},
 's-floating-cargo':{names:['堂吉訶德','羅佳'],lines:[['堂吉訶德','吾拉住了！只是它還在往那邊……'],['羅佳','我也來。先扣到梁上，別拿自己跟它拔河嘛。']]},
 's-ninth-breath':{names:['辛克萊','良秀'],lines:[['辛克萊','良秀小姐，它好像在學我們呼吸。'],['良秀','呼吸裝置先關掉。']]},
 's-unnamed-chart':{names:['李箱','鴻璐'],lines:[['鴻璐','這條線好像還沒畫完。會一直往外延伸嗎？'],['李箱','它尚未畫出盡頭，吾等卻已留有歸路。且先記下此處。']]}
};
function frontierEventDialogue(names,ev,ctx={}){
 const [a,b]=names,failed=ctx.success===false,speech=(speaker,text)=>({speaker,text,kind:'speech'}),act=(speaker,text)=>({speaker,text,kind:'action'});
 if(failed){
  const lines=[act(a,ev.failure),speech(b,FRONTIER_FAILURE_VOICES[ev.area][SINNERS.findIndex(s=>s.name===b)])];
  const hurt=(ctx.injuries||[]).find(i=>i.damage>0);
  if(hurt)lines.push(act(hurt.name,hurt.name+(ev.area==='zone-7'?'按住受傷處，靠著門框站穩後跟上搭檔。':'扣緊固定索，按住受傷處移回扶手旁。')));
  else if(Math.random()<.5)lines.push(act(a,frontierPersonalAction(a,ev.area,ev.observe,true)));
  if(ev.theme==='time'&&names.includes('良秀'))lines.splice(1,1,speech('良秀',ev.id==='s-unsent-reply'?'又少一拍。別跟錄音走。':'又少一拍。看實際位置。'));
  return lines;
 }
 if(ev.theme==='time'&&names.includes('良秀'))return [speech('良秀',ev.lines['良秀']),act('良秀','良秀敲了兩次刀鞘，察覺聲音與動作錯開，將搭檔攔在異常區段外。'),act(names.find(n=>n!=='良秀'),ev.success)];
 const pair=FRONTIER_PAIR_EVENTS[ev.id];
 if(pair&&pair.names.every(n=>names.includes(n))){const lines=pair.lines.map(([speaker,text])=>speech(speaker,text));if(lines.length<4)lines.push(act(pair.names[0],ev.success));return lines;}
 const lead=speech(a,ev.lines[a]||FRONTIER_VOICES[ev.area][a]),reaction=act(b,frontierPersonalAction(b,ev.area,ev.observe));
 return Math.random()<.4?[lead,reaction]:Math.random()<.5?[act(a,ev.desc),lead,reaction]:[lead,reaction,act(a,ev.success),act(b,b+(ev.area==='zone-7'?'走過街角，確認搭檔跟上才繼續移動。':'扣回返程繫索，與搭檔一起返回標記艙段。'))];
}
function frontierAbnormalityDialogue(names,ctx){
 const ab=FRONTIER_ABNORMALITIES[ctx.abnormalityId],[a,b]=names,act=(speaker,text)=>({speaker,text,kind:'action'}),speech=(speaker,text)=>({speaker,text,kind:'speech'});
 if(ab.type==='時間型'&&names.includes('良秀'))return [speech('良秀',ctx.success?'那一拍，斷了。': '它又提前了。別跟著動。'),act('良秀','良秀對照'+ab.focus+'的變化，在錯開的間隔接回之前帶搭檔離開。')];
 if(ctx.success===false)return [act(a,ab.name+'仍在活動，兩人退出正面。'),speech(b,FRONTIER_FAILURE_VOICES[ab.area][SINNERS.findIndex(s=>s.name===b)]),act(a,frontierPersonalAction(a,ab.area,ab.focus,true))];
 const lines=[act(a,ab.focus+'停止變化，兩人仍沒有靠近。'),speech(b,FRONTIER_VOICES[ab.area][b])];
 if(Math.random()<.6)lines.push(act(a,frontierPersonalAction(a,ab.area,ab.focus)));return lines;
}
const FRONTIER_RECOVERY_FAILURES={
 'zone-7':{supply:{detail:'補給箱底部已被培養液浸透，拆卸時隔離架斷裂；只能放棄回收。',hazard:'隔離架碎片'},gear:{detail:'裝備扣座被菌絲填滿，取出時整片固定架崩落；裝備無法帶回。',hazard:'崩落的固定架'}},
 'zone-8':{supply:{detail:'補給封裝已失壓，鬆脫貨架被氣流扯向走廊；箱內物資無法回收。',hazard:'被氣流扯動的貨架'},gear:{detail:'裝備底座的磁扣反轉，固定臂突然回彈；裝備被鎖在隔離艙內。',hazard:'回彈的固定臂'}}
};
const FRONTIER_RECOVERY_VOICES={
 'zone-7':['封裝尚完整，可帶回隔離線。','表面與封口都沒有滲漏，可以回收。','這份仍完好！吾先看看底下！','封口好。收。','封裝完整，未見滲漏。','外面這麼亂，這份倒還乾淨呢。','底下也看過了？行，拿走。','底部沒浸到，裝進乾的袋子。','還有能用的啊。分我一袋嘛。','封口沒破……我把回收袋打開。','回收前確認表面，避免碰到地面污水。','這份還行。先別讓袋子碰地上。'],
 'zone-8':['封口仍在，至少尚未被此處的空白取走。','封裝壓力正常，可以帶回轉接艙。','這份沒漏！吾把扣帶繫上便帶走！','封口好。扣住。','封裝正常。固定到回收袋。','沒在漂呢。扣具應該還能用吧。','收進袋子，別讓它飄走。','先固定，別一鬆手又得追。','拿到了。這回可別讓它自己飛回去。','我扣好了……你再看一下。','固定物資後返程，不要留下鬆散物件。','先扣好吧。我可不想在這裡追一整袋東西。']
};
const FRONTIER_GEAR_VOICES={
 'zone-7':['固定座尚在，先解開外側的扣。','接點沒有浸到培養液。可以拆卸。','這件還能用！吾先找找固定扣！','扣具還行。帶回去。','固定架可拆卸，先解除卡榫。','藏在罩子底下，難怪沒被雨淋到呢。','這扣子還挺牢。先別硬拽。','從乾的那一側拆，別讓袋子碰到水。','能拆下來吧？我幫你托著。','我托住了……你先解那邊的扣子。','解除固定座後回收，不要破壞接點。','下面還有一個扣，先別急著搬。'],
 'zone-8':['此物尚有扣具，吾等也可留住它的歸路。','磁扣仍能解除。先固定回收袋。','吾已扣好袋子！可以開始拆了！','扣住。再拆。','先固定零件，再解除磁扣。','一拆開就會飄吧？我先把袋口拿過來。','把那個小零件收好，別讓它又飛走。','先繫住。拆的時候看著另一頭。','我托著，你把扣子解了就好。','扣帶拉緊了……可以拆這邊了。','先確認固定索，再解除裝備底座。','先扣到袋裡吧，別在這裡換裝備。']
};
function frontierRecoveryDialogue(names,kind,ctx){
 const area=ctx.areaId;if(!FRONTIER_AREAS.some(a=>a.id===area)||!['supply','gear','quiet'].includes(kind))return null;
 const [a,b]=names,act=(speaker,text)=>({speaker,text,kind:'action'}),speech=(speaker,text)=>({speaker,text,kind:'speech'});
 if(ctx.success===false)return [act(a,ctx.failureReason),speech(b,FRONTIER_FAILURE_VOICES[area][SINNERS.findIndex(s=>s.name===b)]),act(a,frontierPersonalAction(a,area,area==='zone-7'?'破損的隔離架':'鬆脫的固定臂',true))];
 if(kind==='quiet'){
  if(names.includes('良秀')&&Math.random()<.2){const age=ARAYA_AGES[Math.floor(Math.random()*ARAYA_AGES.length)],daughter={child:'媽媽，回來陪我吃飯好不好？我留了你的。','high-school':'好。媽媽，回來先坐一會兒吧。',college:'媽媽，我在巴士等。回來別又忙著整理。',adult:'知道了。媽媽，今天的東西回來我幫你收。'};return [act('良秀','良秀返回'+(area==='zone-7'?'隔離線':'轉接艙')+'後打開巴士通訊。'),speech('良秀','沒事。回去了。'),speech('阿賴耶',daughter[age.id])].map(l=>({...l,arayaAge:age.id}));}
  return [speech(a,FRONTIER_VOICES[area][a]),act(b,frontierPersonalAction(b,area,area==='zone-7'?'街角的隔離燈':'艙門旁的返程標記'))];
 }
 const voice=(kind==='gear'?FRONTIER_GEAR_VOICES:FRONTIER_RECOVERY_VOICES)[area][SINNERS.findIndex(s=>s.name===a)];
 return [speech(a,voice),act(b,b+(area==='zone-7'?'用乾淨包布裹住回收物，沒有碰到腳邊的積水。':'把回收物固定到袋內扣帶，確認沒有零件散落。'))];
}

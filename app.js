const KEY='kanban-bookkeeping-rpg-v4';
const OLD_KEYS=['kanban-bookkeeping-rpg-v3','kanban-bookkeeping-rpg-v2','kanban-bookkeeping-rpg-v1','kanban-bookkeeping-safe-v1'];
const EXPENSE_CATS=['餐飲','飲料','交通','服飾','學習','日用品','訂閱','娛樂','醫療','其他'];
const INCOME_CATS=['薪資','獎金','退款','零用錢','投資','禮金','其他收入'];
const XP_PER_ENTRY=10;
const CATEGORY_COLORS=Object.fromEntries([
 ['餐飲','#a85c39','#fae5d8'],['飲料','#346b91','#dfedf8'],['交通','#52669b','#e4e9fa'],
 ['服飾','#995474','#f7e2ed'],['學習','#78619a','#ece6f7'],['日用品','#557b46','#e6f0df'],
 ['訂閱','#735b9d','#e9e3f8'],['娛樂','#99701f','#fff0d4'],['醫療','#a05259','#f9e3e5'],['其他','#5f7480','#e9eff2'],
 ['薪資','#397451','#ddf0e2'],['獎金','#946b22','#fbefd1'],['退款','#357a79','#e0f2ef'],['零用錢','#7d5e99','#eee3f6'],
 ['投資','#39758b','#e0eff5'],['禮金','#a1576a','#f8e1e8'],['其他收入','#52765e','#e3efe5']
].map(([name,accent,bg])=>[name,{accent,border:accent,bg,text:accent,active:bg}]));
const CATEGORY_MIGRATION={'便利商店':'其他','購物':'其他','生活用品':'日用品','訂閱/數位':'訂閱'};
function categoryStyle(cat){
  const p=CATEGORY_COLORS[cat]||CATEGORY_COLORS['其他'];
  return '--cat-accent:'+p.accent+';--cat-border:'+p.border+';--cat-bg:'+p.bg+';--cat-text:'+p.text+';--cat-active:'+p.active;
}
const MONSTER_CATALOG=[
 {id:'M-001',name:'灰燼史萊姆',risk:'LOW',hp:60,note:'半流體收容單位。對例行紀錄反應穩定。',shape:'slime'},
 {id:'M-002',name:'鐵殼蠕蟲',risk:'LOW',hp:72,note:'外殼會隨作業次數逐步龜裂。',shape:'worm'},
 {id:'M-003',name:'紅眼紙偶',risk:'MEDIUM',hp:84,note:'會模仿被歸檔資料的標題與編號。',shape:'doll'},
 {id:'M-004',name:'齒輪獵犬',risk:'MEDIUM',hp:96,note:'規律作業可抑制其活動性。',shape:'hound'},
 {id:'M-005',name:'失真燈蛾',risk:'MEDIUM',hp:108,note:'偏好停留於高亮度資料區域。',shape:'moth'},
 {id:'M-006',name:'黑箱擬態',risk:'HIGH',hp:120,note:'外觀近似封存箱，接觸前須確認編號。',shape:'mimic'},
 {id:'M-007',name:'廢線聚合體',risk:'HIGH',hp:132,note:'由失效線路與未結案紀錄形成。',shape:'wire'},
 {id:'M-008',name:'白面觀測者',risk:'HIGH',hp:150,note:'僅在長期連續作業期間出現。',shape:'observer'}
];

const EQUIPMENT_EFFECTS={
 '銀色羽毛筆':{desc:'記帳 EXP +20%',expBonus:.20},
 '見習短劍':{desc:'每日怪物傷害 +3',monsterDamage:3},
 '幸運硬幣':{desc:'開箱金幣 +20%',goldBonus:.20},
 '黃金算盤':{desc:'每日指令 EXP +15%',questXpBonus:.15},
 '商人斗篷':{desc:'開箱金幣 +25%',goldBonus:.25},
 '王者徽章':{desc:'月度 BOSS 傷害 +5',bossDamage:5},
 '管理者徽章':{desc:'所有戰鬥傷害 +3',allDamage:3}
};
const CONSUMABLE_EFFECTS={
 'water':{name:'瓶裝水',heal:25,desc:'探索時罪人狀態 ≤45% 會優先自動使用'},
 'potion':{name:'小型治療藥水',heal:45,desc:'無瓶裝水且罪人狀態 ≤20% 時自動使用'}
};
const MONSTER_DROPS={
 'M-001':'史萊姆凝膠','M-002':'鐵殼碎片','M-003':'紅線紙片','M-004':'齒輪牙片',
 'M-005':'失真鱗粉','M-006':'黑箱扣件','M-007':'廢線束','M-008':'白面鏡片'
};
const BOSS_CATALOG=[
 {id:'B-001',name:'月蝕管理者',hp:520,shape:'observer',reward:'管理者徽章'},
 {id:'B-002',name:'赤鐘處刑機',hp:580,shape:'hound',reward:'王者徽章'},
 {id:'B-003',name:'封存黑匣',hp:640,shape:'mimic',reward:'黃金算盤'},
 {id:'B-004',name:'失序觀測塔',hp:700,shape:'wire',reward:'商人斗篷'}
];
const ACHIEVEMENTS=[
 {id:'A-001',name:'第一份檔案',desc:'建立第 1 筆記錄',gold:10},
 {id:'A-002',name:'穩定記錄者',desc:'累積 10 筆記錄',gold:20},
 {id:'A-003',name:'檔案室常客',desc:'累積 50 筆記錄',gold:50},
 {id:'A-004',name:'七日連續作業',desc:'連續記錄達 7 天',gold:40},
 {id:'A-005',name:'異常處置員',desc:'探索中累積完成 5 次有效怪異制壓',gold:50},
 {id:'A-006',name:'完全武裝',desc:'至少 2 名罪人配置探索裝備',gold:30},
 {id:'A-007',name:'正式收容',desc:'完成至少 1 種怪異的收容條件',gold:100},
 {id:'A-008',name:'正向結算',desc:'任一月份收入大於支出',gold:60}
];

const QUESTS=[
 {id:'q1',name:'今日第一筆',desc:'今天新增至少 1 筆記錄',goal:1,rewardXp:10},
 {id:'q2',name:'完整記錄',desc:'今天新增至少 3 筆記錄',goal:3,rewardXp:20},
 {id:'q3',name:'分類探索',desc:'今天記錄至少 2 種不同分類',goal:2,rewardXp:15}
];

const FIELD_GEAR={
 'field-vest':{name:'收容防護背心',rarity:'common',desc:'偏重防護與承傷，適合需要提高生存穩定性的罪人。',stats:{stability:2}},
 'survey-lens':{name:'異常觀測鏡',rarity:'uncommon',desc:'協助辨識怪異行動與環境線索，適合觀察型探索者。',stats:{observe:2}},
 'runner-boots':{name:'機動作業靴',rarity:'common',desc:'降低複雜地形移動負擔，強化追擊與脫離能力。',stats:{mobility:2}},
 'shock-baton':{name:'制壓電擊棍',rarity:'rare',desc:'近距離制壓工具，適合直接提高戰鬥輸出的編成。',stats:{combat:2}},
 'field-kit':{name:'多用途作業組',rarity:'epic',desc:'四項能力各 +1，兼顧戰鬥、事件判讀與生存。',stats:{combat:1,observe:1,mobility:1,stability:1}},
 'signal-earpiece':{name:'定向收訊耳機',rarity:'uncommon',desc:'觀察 +2、穩定 +1。提高事件判讀能力，減輕現場混亂的影響。',stats:{observe:2,stability:1}},
 'climbing-harness':{name:'維修攀行帶',rarity:'uncommon',desc:'機動 +2、穩定 +1。協助通過狹窄地形，提高回收判定及生存能力。',stats:{mobility:2,stability:1}},
 'reinforced-gloves':{name:'加固作業手套',rarity:'common',desc:'戰鬥 +1、穩定 +1。兼顧近距離制壓與防護。',stats:{combat:1,stability:1}},
 'rangefinder':{name:'便攜測距儀',rarity:'rare',desc:'觀察 +3、機動 +1。擅長辨認安全路線與異常位置。',stats:{observe:3,mobility:1}},
 'impact-shield':{name:'折疊抗衝盾',rarity:'rare',desc:'穩定 +3、戰鬥 +1。降低承傷並提高制壓能力。',stats:{stability:3,combat:1}},
 'precision-blade':{name:'精密制壓刃',rarity:'epic',desc:'戰鬥 +3、機動 +1。適合需要快速擊倒敵人的編成。',stats:{combat:3,mobility:1}},
 'hazard-suit':{name:'隔離作業服',rarity:'epic',desc:'穩定 +3、觀察 +2。提高高危事件判讀與生存能力。',stats:{stability:3,observe:2}},
 'survey-array':{name:'複合觀測組',rarity:'legendary',desc:'觀察 +4、穩定 +2。專精高危異常判讀，亦協助戰鬥觀察。',stats:{observe:4,stability:2}}

};

const EXPLORATION_AREAS=[
 {id:'zone-1',name:'廢棄商業區',level:1,risk:'LOW',desc:'封鎖後的商業街、百貨後場與地下通道。常見與消費、廣告、人群殘響相關的怪異。',abnos:['A-101','A-114','A-126','A-139','A-148']},
 {id:'zone-2',name:'地下維修層',level:3,risk:'MEDIUM',desc:'泵房、維修井、管線與輸送設備構成的複雜區域。機械型與聲響型怪異較常出現。',abnos:['A-203','A-227','A-241','A-256','A-269']},
 {id:'zone-3',name:'封鎖研究棟',level:5,risk:'HIGH',desc:'舊研究設施與觀測室仍殘留未終止的實驗。認知、鏡像與檔案型怪異密度較高。',abnos:['A-311','A-338','A-352','A-367','A-379']},
 {id:'zone-4',name:'外緣黑區',level:8,risk:'EXTREME',desc:'城市邊緣的失照區與廢棄軌道帶。空間、獵食與無法穩定觀測的高危怪異活動頻繁。',abnos:['A-402','A-417','A-431','A-446','A-459']}
];

const ABNORMALITY_CATALOG={
 'A-101':{name:'逆向時鐘',level:1,kills:2,area:'zone-1',type:'時間型',note:'櫥窗內的老式時鐘。所有指針皆向反方向運作；靠近者會短暫忘記自己剛做過的事。'},
 'A-114':{name:'紙面訪客',level:2,kills:3,area:'zone-1',type:'模仿型',note:'會從傳單、收據與海報中形成薄片人影，模仿最近接觸紙張的人。'},
 'A-126':{name:'永不打烊的店員',level:2,kills:3,area:'zone-1',type:'執念型',note:'徘徊在已封鎖商店櫃檯後方，持續向不存在的顧客重複結帳流程。'},
 'A-139':{name:'折扣紅標',level:3,kills:3,area:'zone-1',type:'誘引型',note:'會附著在物品表面並逐步降低持有者對危險的判斷，只留下「現在不拿就虧了」的念頭。'},
 'A-148':{name:'空席食客',level:3,kills:4,area:'zone-1',type:'群體型',note:'餐飲區的空椅會自行拉開；若有人入座，周圍會出現看不見的用餐聲與多餘餐具。'},

 'A-203':{name:'空洞售貨機',level:3,kills:3,area:'zone-2',type:'交換型',note:'投入任何物品後，都可能吐出與原物毫無關聯的東西；機內空間遠大於外觀尺寸。'},
 'A-227':{name:'低語井',level:4,kills:4,area:'zone-2',type:'聲響型',note:'維修井深處會重複探索者未曾說出口的念頭，並逐次改成更具敵意的語氣。'},
 'A-241':{name:'管線寄生體',level:4,kills:4,area:'zone-2',type:'寄生型',note:'藏在蒸氣管與電纜槽內，以熱量和震動為食；受驚時會讓整段管線像活物般抽動。'},
 'A-256':{name:'十四號維修工',level:5,kills:4,area:'zone-2',type:'擬人型',note:'穿著老式作業服，永遠背對觀測者維修同一面牆；繞到正面時只會看見一盞工作燈。'},
 'A-269':{name:'失速輸送帶',level:5,kills:5,area:'zone-2',type:'機械型',note:'無電源時仍會自行運轉，並把附近鬆散物件送往一個圖紙上不存在的方向。'},

 'A-311':{name:'鏡中獸',level:5,kills:4,area:'zone-3',type:'鏡像型',note:'只在反射面中移動，實體位置無法直接觀測；鏡面越多，活動範圍越大。'},
 'A-338':{name:'無名司書',level:6,kills:5,area:'zone-3',type:'認知型',note:'會替不存在的人整理不存在的檔案；被它點名者會短暫失去自我認知。'},
 'A-352':{name:'零號受試者',level:6,kills:5,area:'zone-3',type:'實驗型',note:'透明隔離室內總能看見一道人影，但所有監視紀錄都顯示房間自始至終空無一物。'},
 'A-367':{name:'錯誤答案集',level:7,kills:5,area:'zone-3',type:'資訊型',note:'一本會自動翻頁的實驗紀錄。閱讀者越確信其中內容錯誤，周圍現實越會向書中記錄靠攏。'},
 'A-379':{name:'分裂觀測者',level:7,kills:6,area:'zone-3',type:'觀測型',note:'只有透過兩種不同觀測設備同時觀看才會顯形；兩份影像中的姿態永遠不一致。'},

 'A-402':{name:'食光列車',level:8,kills:5,area:'zone-4',type:'空間型',note:'通過區域時會使所有照明逐段熄滅，之後才聽見軌道聲；沒有任何人看過完整車體。'},
 'A-417':{name:'灰白天使',level:10,kills:6,area:'zone-4',type:'獵殺型',note:'靜止時近似石像；只在無人直視時改變位置，且每次移動都會更接近最近的活物。'},
 'A-431':{name:'邊界拾荒者',level:8,kills:5,area:'zone-4',type:'捕食型',note:'拖著由廢鐵、骨片與路牌拼成的袋子，會收走任何被判定為「無人認領」的東西。'},
 'A-446':{name:'無月犬群',level:9,kills:6,area:'zone-4',type:'群獵型',note:'只會在完全沒有自然光的區域留下足跡。單一個體不可見，但犬群會共同追逐同一目標。'},
 'A-459':{name:'折疊街口',level:11,kills:7,area:'zone-4',type:'空間型',note:'一段會把四個方向折回原點的街口。長時間滯留後，探索者會開始看見「沒有跟隊的自己」。'}
};

const EXPLORATION_EVENTS=[
 {id:'sealed-door',name:'封死的防火門',desc:'前方通道被不明力量從另一側反覆撞擊。'},
 {id:'false-radio',name:'錯頻廣播',desc:'通訊器傳來並不存在的第三名隊員聲音。'},
 {id:'abandoned-meal',name:'仍溫熱的餐桌',desc:'無人區域裡出現剛擺好的兩套餐點。'},
 {id:'mirror-corridor',name:'錯位鏡廊',desc:'鏡中的兩名罪人比本人慢了半拍才轉頭。'},
 {id:'red-file',name:'紅色封存檔',desc:'地面上有一份標著兩名探索者姓名的未來日期檔案。'},
 ...EXTRA_EXPLORATION_EVENTS
];
let state=load();ensureExplorationState();
function $(id){return document.getElementById(id)}
function localDateKey(value=new Date()){const d=new Date(value);if(isNaN(d.getTime()))return '';return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function today(){return localDateKey()}

const PAYMENT_OPTIONS=['現金','轉帳','信用卡','支付寶','微信','其他'];
const HANS_PHRASES={
 '主要幣別':'主要币别','新台幣':'新台币','台幣':'台币','人民幣':'人民币','日幣':'日币','美金':'美元',
 '選擇主要幣別':'选择主要币别','帳本金額統一以所選幣別顯示':'账本金额统一以所选币别显示',
 '切換幣別不會自動換算既有數字':'切换币别不会自动换算既有数字',
 '初始金額':'初始金额','累計收入':'累计收入','累計支出':'累计支出','目前剩餘':'目前余额','本月淨額':'本月净额',
 '連續記錄':'连续记录','由你自行設定':'由你自行设置','所有收入記錄':'所有收入记录','所有支出記錄':'所有支出记录',
 '最長':'最长','終端':'终端','記錄':'记录','任務':'任务','背包':'背包','圖鑑':'图鉴','成就':'成就','評議':'评议','統計':'统计','設定':'设置','裝備':'装备','消耗品':'消耗品','材料與其他物品':'材料与其他物品','瓶裝水':'瓶装水','小型治療藥水':'小型治疗药水','使用者生命':'用户生命','使用':'使用',
 '新增支出':'新增支出','新增收入':'新增收入','匯入發票 CSV':'导入发票 CSV','匯出 CSV':'导出 CSV','備份 JSON':'备份 JSON',
 '還原 JSON':'还原 JSON','清除本機資料':'清除本机数据','資料只保存在目前瀏覽器':'数据只保存在当前浏览器',
 '換裝置或清除 Safari 網站資料前':'更换设备或清除 Safari 网站数据前','請先備份 JSON':'请先备份 JSON',
 '薪資':'薪资','交易紀錄已歸檔':'交易记录已归档','請保持資料完整性':'请保持数据完整性',
 '支出是結果':'支出是结果','淨額才是本期報表的結論':'净额才是本期报表的结论','薪資週期已登錄':'薪资周期已登录',
 '到期時將顯示提示':'到期时将显示提示','人格檔案':'人格档案','每新增一筆收入或支出':'每新增一笔收入或支出',
 '該人格檔案獲得經驗值':'该人格档案获得经验值','每筆紀錄':'每笔记录','今日收容單位':'今日收容单位',
 '新增紀錄將視為一次作業':'新增记录将视为一次作业','完成指令時追加處置效果':'完成指令时追加处置效果',
 '新增記錄':'新增记录','編輯記錄':'编辑记录','金額':'金额','店家／用途':'店家／用途','收入來源':'收入来源',
 '分類':'分类','日期、付款方式、備註（選填）':'日期、付款方式、备注（选填）','日期':'日期','付款方式':'付款方式',
 '備註':'备注','需要時再填即可':'需要时再填即可','取消':'取消','刪除':'删除','儲存並再記一筆':'保存并再记一笔','儲存':'保存',
 '現金':'现金','轉帳':'转账','信用卡':'信用卡','支付寶':'支付宝','微信':'微信','其他':'其他',
 '餐飲':'餐饮','飲料':'饮料','交通':'交通','服飾':'服饰','學習':'学习','日用品':'日用品','訂閱':'订阅',
 '娛樂':'娱乐','醫療':'医疗','生活用品':'生活用品','獎金':'奖金','退款':'退款','零用錢':'零用钱','投資':'投资',
 '禮金':'礼金','其他收入':'其他收入','所有分類':'所有分类','收入':'收入','支出':'支出',
 '罪人評議':'罪人评议','罪人評議記錄':'罪人评议记录','依時間':'按时间','依罪人':'按罪人','查看評議記錄':'查看评议记录',
 '確認':'确认','尚無罪人評議':'暂无罪人评议','新增一筆收入或支出後':'新增一笔收入或支出后',
 '評議會固定保存於此':'评议会固定保存在这里','全部':'全部','筆評議':'条评议',
 '資金設定':'资金设置','顯示名稱':'显示名称','每月薪資日':'每月薪资日','提前提醒':'提前提醒','儲存設定':'保存设置',
 '薪資日當天':'薪资日当天','提前 1 天':'提前 1 天','提前 3 天':'提前 3 天',
 '目前剩餘金額的計算方式為':'当前余额的计算方式为','累計':'累计','發票':'发票','會自動視為支出':'会自动视为支出',
 '請由你手動新增':'请手动新增','統計':'统计','本月收支構成':'本月收支构成','支出分類分布':'支出分类分布',
 '收入來源分布':'收入来源分布','月度管理摘要':'月度管理摘要'
};
const HANS_CHARS={
 '體':'体','幣':'币','帳':'账','額':'额','選':'选','別':'别','顯':'显','換':'换','會':'会','動':'动','舊':'旧','數':'数','據':'据',
 '錄':'录','計':'计','餘':'余','淨':'净','連':'连','長':'长','終':'终','務':'务','圖':'图','鑑':'鉴','評':'评','統':'统','設':'设',
 '備':'备','還':'还','機':'机','資':'资','瀏':'浏','覽':'览','請':'请','發':'发','歸':'归','檔':'档','結':'结','論':'论','週':'周',
 '獲':'获','經':'经','驗':'验','筆':'笔','紀':'纪','錄':'录','視':'视','為':'为','處':'处','置':'置','編':'编','輯':'辑','來':'来',
 '源':'源','類':'类','註':'注','填':'填','刪':'删','儲':'储','轉':'转','寶':'宝','飲':'饮','購':'购','訂':'订','閱':'阅','娛':'娱',
 '醫':'医','療':'疗','獎':'奖','錢':'钱','投':'投','禮':'礼','時':'时','間':'间','無':'无','於':'于','條':'条','稱':'称','當':'当',
 '構':'构','匯':'汇','總':'总','價':'价','較':'较','與':'与','這':'这','個':'个','後':'后','應':'应','該':'该','裡':'里','讓':'让',
 '還':'还','過':'过','進':'进','開':'开','關':'关','實':'实','際':'际','種':'种','簡':'简','繁':'繁'
};
function toHansText(input){
 let s=String(input==null?'':input);
 Object.keys(HANS_PHRASES).sort(function(a,b){return b.length-a.length}).forEach(function(k){s=s.split(k).join(HANS_PHRASES[k])});
 return Array.from(s).map(function(ch){return HANS_CHARS[ch]||ch}).join('');
}
function isHans(){return !!(state&&state.profile&&state.profile.language==='zh-Hans')}
function localizeText(s){return isHans()?toHansText(s):String(s==null?'':s)}
let languageObserver=null;
function translateDom(root){
 if(!isHans()||!root)return;
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
 const nodes=[];let n;
 while((n=walker.nextNode()))nodes.push(n);
 nodes.forEach(function(node){
   if(node.parentElement&&['SCRIPT','STYLE'].includes(node.parentElement.tagName))return;
   const next=toHansText(node.nodeValue);
   if(next!==node.nodeValue)node.nodeValue=next;
 });
 root.querySelectorAll&&root.querySelectorAll('[placeholder],[aria-label],[title]').forEach(function(el){
   ['placeholder','aria-label','title'].forEach(function(attr){
     if(el.hasAttribute(attr))el.setAttribute(attr,toHansText(el.getAttribute(attr)));
   });
 });
}
function setupLanguageObserver(){
 if(languageObserver){languageObserver.disconnect();languageObserver=null}
 if(!isHans())return;
 translateDom(document.body);
 languageObserver=new MutationObserver(function(list){
   list.forEach(function(m){
     if(m.type==='characterData'){const next=toHansText(m.target.nodeValue);if(next!==m.target.nodeValue)m.target.nodeValue=next}
     m.addedNodes&&m.addedNodes.forEach(function(node){
       if(node.nodeType===Node.TEXT_NODE){const next=toHansText(node.nodeValue);if(next!==node.nodeValue)node.nodeValue=next}
       else if(node.nodeType===Node.ELEMENT_NODE)translateDom(node);
     });
   });
 });
 languageObserver.observe(document.body,{subtree:true,childList:true,characterData:true});
}
function setLanguage(lang){
 if(lang!=='zh-Hans'&&lang!=='zh-Hant')return;
 state.profile.language=lang;
 saveLocal();
 location.reload();
}
function renderLanguageSwitch(){
 const lang=(state.profile&&state.profile.language)||'zh-Hant';
 document.documentElement.lang=lang;
 document.querySelectorAll('[data-language]').forEach(function(btn){
   btn.classList.toggle('active',btn.dataset.language===lang);
   btn.setAttribute('aria-pressed',btn.dataset.language===lang?'true':'false');
 });
}

const CURRENCIES={
 TWD:{code:'TWD',symbol:'NT$',name:'新台幣',locale:'zh-TW',digits:0},
 CNY:{code:'CNY',symbol:'CN¥',name:'人民幣',locale:'zh-CN',digits:2},
 JPY:{code:'JPY',symbol:'JP¥',name:'日幣',locale:'ja-JP',digits:0},
 USD:{code:'USD',symbol:'US$',name:'美金',locale:'en-US',digits:2}
};
function currentCurrency(){return CURRENCIES[(state&&state.profile&&state.profile.currency)||'TWD']||CURRENCIES.TWD}
function money(n){
 const c=currentCurrency(),v=Number(n)||0;
 return c.symbol+v.toLocaleString(c.locale,{minimumFractionDigits:0,maximumFractionDigits:c.digits});
}
function setCurrency(code){
 if(!CURRENCIES[code])return;
 state.profile.currency=code;
 saveLocal();
 render();
 toast('主要幣別已切換為 '+CURRENCIES[code].code+' / '+CURRENCIES[code].name);
}
function renderCurrencySelector(){
 const c=currentCurrency();
 if($('currencySelect'))$('currencySelect').value=c.code;
}
function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
function toast(msg){const t=$('toast');t.textContent=localizeText(msg);t.style.display='block';clearTimeout(toast._t);toast._t=setTimeout(()=>t.style.display='none',2400)}
function saveLocal(){localStorage.setItem(KEY,JSON.stringify(state))}
function defaultState(){return {entries:[],profile:{initialAmount:0,name:'但丁',currency:'TWD',language:'zh-Hant'},rpg:{xp:0,gold:0,itemBoxes:0,chests:{wood:0,silver:0,gold:0},inventory:[],equipped:[],consumables:{water:3,potion:0},player:{hp:100,maxHp:100,lastCombat:'尚無受擊紀錄。'},lastContainment:null,achievements:[],achievementBadges:[],monthlyBosses:{},rewardLog:'開始記錄來啟動管理流程。',streakMilestones:[]},exploration:null,daily:{}}}
function normalizeEntry(x){return {...x,type:x.type||'expense',category:CATEGORY_MIGRATION[x.category]||x.category||'其他',amount:Number(x.amount||0),date:x.date||today(),payment:x.payment||'現金',store:x.store||'未命名紀錄',items:Array.isArray(x.items)?x.items:[],note:x.note||''}}
function migrate(old){const s=defaultState();
  if(Array.isArray(old)){s.entries=old.map(v=>normalizeEntry(v));return s}
  if(old?.entries)s.entries=old.entries.map(v=>normalizeEntry(v));
  if(old?.profile)s.profile={...s.profile,...old.profile};s.profile.name='但丁';
  if(old?.rpg){
    s.rpg.xp=Number(old.rpg.xp||0); s.rpg.gold=Number(old.rpg.gold||0);
    s.rpg.inventory=Array.isArray(old.rpg.inventory)?old.rpg.inventory:[];
    s.rpg.rewardLog=old.rpg.rewardLog||old.rpg.lastReward||s.rpg.rewardLog;
    if(old.rpg.chests)s.rpg.chests={wood:Number(old.rpg.chests.wood||0),silver:Number(old.rpg.chests.silver||0),gold:Number(old.rpg.chests.gold||0)};
    else s.rpg.chests={wood:0,silver:0,gold:0};
    s.rpg.itemBoxes=Number(old.rpg.itemBoxes!=null?old.rpg.itemBoxes:(s.rpg.chests.wood+s.rpg.chests.silver+s.rpg.chests.gold));
    s.rpg.streakMilestones=Array.isArray(old.rpg.streakMilestones)?old.rpg.streakMilestones:[];
    s.rpg.equipped=Array.isArray(old.rpg.equipped)?old.rpg.equipped:[];
    s.rpg.achievements=Array.isArray(old.rpg.achievements)?old.rpg.achievements:[];
    s.rpg.achievementBadges=Array.isArray(old.rpg.achievementBadges)?old.rpg.achievementBadges.filter(b=>b&&typeof b.id==='string').map(b=>({id:b.id,earnedAt:typeof b.earnedAt==='string'?b.earnedAt:''})):[];
    s.rpg.longQuestClaims={...(old.rpg.longQuestClaims||{})};
    s.rpg.monthlyBosses=old.rpg.monthlyBosses||{};
    s.rpg.player={...s.rpg.player,...(old.rpg.player||{})};
    s.rpg.lastContainment=old.rpg.lastContainment||null;
    s.rpg.player.maxHp=Math.max(1,Number(s.rpg.player.maxHp||100));
    s.rpg.player.hp=Math.max(0,Math.min(s.rpg.player.maxHp,Number(s.rpg.player.hp??s.rpg.player.maxHp)));
    s.rpg.consumables={...s.rpg.consumables,...(old.rpg.consumables||{})};
    if(!old.rpg.consumables){
      const oldPotions=s.rpg.inventory.filter(function(x){return x==='小型治療藥水'}).length;
      if(oldPotions)s.rpg.consumables.potion+=oldPotions;
      s.rpg.inventory=s.rpg.inventory.filter(function(x){return x!=='小型治療藥水'&&x!=='瓶裝水'});
    }
  }
  s.exploration=old.exploration||null;
  s.daily=old.daily||{};
  return s;
}
function load(){try{const raw=localStorage.getItem(KEY);if(raw)return migrate(JSON.parse(raw));for(const k of OLD_KEYS){const o=localStorage.getItem(k);if(o){const s=migrate(JSON.parse(o));localStorage.setItem(KEY,JSON.stringify(s));return s}}return defaultState()}catch(e){return defaultState()}}
function allCategories(){return [...new Set([...EXPENSE_CATS,...INCOME_CATS,...state.entries.map(x=>x.category).filter(Boolean)])]}
function updateCategoryOptions(type){const list=(type==='income'?INCOME_CATS:EXPENSE_CATS).concat(state.entries.filter(x=>x.type===type).map(x=>x.category));const uniq=[...new Set(list)];$('ecat').innerHTML=uniq.map(c=>`<option>${c}</option>`).join('')}
function refreshFilters(){const cats=allCategories();const prev=$('cat').value;$('cat').innerHTML='<option value="">所有分類</option>'+cats.map(c=>`<option>${c}</option>`).join('');$('cat').value=prev;updateCategoryOptions($('etype').value)}
function entriesForDate(d){return state.entries.filter(x=>x.date===d)}
function dayStats(d){const e=entriesForDate(d),expense=e.filter(x=>x.type==='expense').reduce((s,x)=>s+x.amount,0),income=e.filter(x=>x.type==='income').reduce((s,x)=>s+x.amount,0);return {count:e.length,cats:new Set(e.map(x=>x.category)).size,expense,income,net:income-expense}}
function monsterForDate(d){
  const score=[...d].reduce((s,ch)=>s+ch.charCodeAt(0),0);
  return MONSTER_CATALOG[score%MONSTER_CATALOG.length];
}
function ensureDaily(d){
  if(!state.daily[d])state.daily[d]={questClaims:{}};
  if(!state.daily[d].monster){
    const spec=monsterForDate(d);
    state.daily[d].monster={id:spec.id,name:spec.name,maxHp:spec.hp,hp:spec.hp,defeated:false};
  }else if(!state.daily[d].monster.id){
    const match=MONSTER_CATALOG.find(x=>x.name===state.daily[d].monster.name)||MONSTER_CATALOG[0];
    state.daily[d].monster.id=match.id;
  }
  if(!state.daily[d].questClaims)state.daily[d].questClaims={}
}
function computeStreak(){const dates=[...new Set(state.entries.map(x=>x.date))].sort();if(!dates.length)return {current:0,best:0};let best=1,run=1,bestEnding=dates[0],runEnding=dates[0];for(let i=1;i<dates.length;i++){const a=new Date(dates[i-1]+'T00:00:00'),b=new Date(dates[i]+'T00:00:00'),diff=Math.round((b-a)/86400000);if(diff===1){run++;runEnding=dates[i];if(run>best){best=run;bestEnding=runEnding}}else if(diff>1){run=1;runEnding=dates[i]}}let current=0;let last=dates[dates.length-1];let td=today();let yd=new Date();yd.setDate(yd.getDate()-1);const y=localDateKey(yd);if(last===td||last===y){current=run;let tempRun=1;for(let i=dates.length-1;i>0;i--){const a=new Date(dates[i-1]+'T00:00:00'),b=new Date(dates[i]+'T00:00:00'),diff=Math.round((b-a)/86400000);if(diff===1)tempRun++;else break}current=tempRun}return {current,best}}

function pickExplorationLoot(){
  ensurePlayerState();
  const roll=Math.random();
  if(roll<.55){state.rpg.consumables.water++;return '瓶裝水 ×1'}
  if(roll<.8){state.rpg.consumables.potion++;return '小型治療藥水 ×1'}
  state.rpg.itemBoxes=(state.rpg.itemBoxes||0)+1;return '道具箱 ×1';
}
function pickFieldGear(){
 ensureExplorationState();const id=weightedEquipmentPick(Object.keys(FIELD_GEAR),id=>FIELD_GEAR[id].rarity);
 state.exploration.fieldGear.push(id);return FIELD_GEAR[id].name+' ×1';
}
function availableAbnormalities(area){return (area.abnos||[]).filter(id=>!state.exploration.abnormalityProgress[id]?.contained)}
function explorationEventKind(names=state.exploration.selected,area=EXPLORATION_AREAS.find(a=>a.id===state.exploration.areaId)){
 const weights=explorationSkillWeights(names,area),bonus=Math.min(.16,Number(equipmentEffects().lootBonus||0));
 weights.supply+=bonus*100;weights.gear+=bonus*20;
 if(availableAbnormalities(area).length===0)weights.abnormality=0;
 let roll=Math.random()*Object.values(weights).reduce((s,n)=>s+n,0);
 for(const [kind,w] of Object.entries(weights)){roll-=w;if(roll<0)return kind;}return 'shop';
}
function explorationXpLabel(result){
  const gains=Object.entries(result.xpBySinner||{}).filter(([,xp])=>Number(xp)>0);
  if(gains.length)return gains.map(([name,xp])=>name+' EXP +'+xp).join(' · ');
  return Number(result.xp)>0?'EXP +'+result.xp:'不獲得 EXP';
}
function runExploration(){
  ensureExplorationState();
  const ex=state.exploration;
  if(ex.actions<=0){toast('沒有可用探索行動');return}
  const names=(ex.selected||[]).filter(function(n){return SINNER_FIELD_PROFILES[n]});
  if(names.length!==2||names[0]===names[1]){toast('請選擇兩名不同罪人');return}
  if(names.some(function(n){return ex.sinners[n].hp<=0})){toast('隊伍中有倒下的罪人，請先復活');return}
  const area=EXPLORATION_AREAS.find(function(x){return x.id===ex.areaId})||EXPLORATION_AREAS[0];
  ex.activeShop=null;
  ex.actions--;ex.spent++;ex.runs++;
  if(!ex.stats.visited.includes(area.id))ex.stats.visited.push(area.id);
  let kind=explorationEventKind(names,area);
  if(kind==='abnormality'&&availableAbnormalities(area).length===0)kind='quiet';
  let title='',detail='',reward='',stamp='FIELD',xp=0,ctx={area:area.name,kind:kind},combat=null;
  let resultSuccess=true;

  if(kind==='quiet'){
    title='平安無事的巡查';detail='走過預定路線，沒有遭遇敵人、異常事件或可回收物。隊伍平安返回。';stamp='CLEAR';ctx.success=true;
  }else if(kind==='enemy'){
    const fight=enemyCombat(names,area);({title,detail,reward,stamp,xp,combat}=fight);resultSuccess=fight.success;ctx.enemyId=fight.enemyId;
  }else if(kind==='abnormality'){
    const remainingPool=availableAbnormalities(area),id=remainingPool[Math.floor(Math.random()*remainingPool.length)],ab=ABNORMALITY_CATALOG[id];
    if(!ex.seenAbnormalities.includes(id))ex.seenAbnormalities.push(id);
    const prog=ex.abnormalityProgress[id]||{kills:0,contained:false};
    const maxHp=30+ab.level*12,attacks=[],damageTotal=0;
    let total=0;
    names.forEach(function(n){
      const hit=sinnerCombatDamage(n,{...ab,id},area);total+=hit.damage;attacks.push({name:n,damage:hit.damage,notes:hit.notes});
    });
    const remaining=Math.max(0,maxHp-total),killed=remaining===0;
    const injuries=[];
    names.forEach(function(n){
      const dmg=sinnerIncomingDamage(n,ab,killed),data=ex.sinners[n];
      if(dmg>0){data.hp=Math.max(0,data.hp-dmg);const healed=maybeAutoHealSinner(n);injuries.push({name:n,damage:dmg,hp:data.hp,maxHp:data.maxHp,healed:healed});}
      else injuries.push({name:n,damage:0,hp:data.hp,maxHp:data.maxHp,healed:{amount:0,item:''}});
    });
    resultSuccess=killed;
    if(killed){
      prog.kills++;
      title='怪異制壓：'+ab.name;
      detail='怪異 HP '+maxHp+' → 0。'+attacks.map(function(x){return x.name+' '+x.damage+' 傷害'+(x.notes.length?'（'+x.notes.join('、')+'）':'')}).join('；')+'。收容進度 '+Math.min(prog.kills,ab.kills)+' / '+ab.kills+'。';
      xp=34+ab.level*3;
      if(prog.kills>=ab.kills&&!prog.contained){prog.contained=true;state.rpg.itemBoxes=(state.rpg.itemBoxes||0)+1;reward='正式收容完成，道具箱 ×1';stamp='CONTAINED'}
      else{reward='有效制壓 +1';stamp='SUPPRESSED'}
    }else{
      title='怪異交戰：'+ab.name;
      detail='怪異 HP '+maxHp+' → '+remaining+'。'+attacks.map(function(x){return x.name+' '+x.damage+' 傷害'+(x.notes.length?'（'+x.notes.join('、')+'）':'')}).join('；')+'。怪異未被擊倒，本次不增加收容擊殺數。';
      xp=16+ab.level;stamp='ENGAGED';
    }
    const injuryText=injuries.map(function(x){
      return x.name+(x.damage?' 受到 '+x.damage+' 傷害，HP '+x.hp+' / '+x.maxHp:' 未受傷')+
        (x.healed.amount?'，自動使用'+x.healed.item+' +'+x.healed.amount:'')+(x.hp<=0?'【倒下】':'');
    }).join('；');
    detail+=' '+injuryText+'。';
    ex.abnormalityProgress[id]=prog;
    ex.encounters[id]=(ex.encounters[id]||0)+1;
    combat={
      enemy:{name:ab.name,maxHp:maxHp,remaining:remaining,level:ab.level,type:ab.type},
      allies:attacks.map(function(hit){
        const inj=injuries.find(function(x){return x.name===hit.name})||{damage:0,hp:0,maxHp:100,healed:{amount:0,item:''}};
        return {name:hit.name,damage:hit.damage,notes:hit.notes||[],taken:inj.damage||0,hp:inj.hp,maxHp:inj.maxHp,healed:inj.healed||{amount:0,item:''}};
      }),
      result:{success:killed,contained:!!prog.contained,progress:Math.min(prog.kills,ab.kills),required:ab.kills}
    };
    ctx.abnormality=ab.name;ctx.abnormalityId=id;ctx.abnormalityType=ab.type;ctx.success=resultSuccess;ctx.attacks=attacks;ctx.injuries=injuries;ctx.remaining=remaining;ctx.maxHp=maxHp;
  }else if(kind==='event'){
    const pool=explorationEventsForArea(area.id),ev=pool[Math.floor(Math.random()*pool.length)];
    resultSuccess=resolveFieldAttempt(names,area,kind,ev).success;
    title='隨機事件：'+ev.name;detail=ev.desc;
    if(resultSuccess){ex.stats.eventsResolved++;reward='安全通過；獲得額外探索資料';detail+=' '+(ev.success||'確認異常範圍後，隊伍安全通過。');stamp='RESOLVED'}
    else{ctx.failureReason=ev.failure||'異常突然擴大，隊伍未能通過，只得沿來路撤離。';detail+=' '+ctx.failureReason;ctx.hazard=ev.hazard||'異常波及的現場殘骸';stamp='INCIDENT'}
    const eventProgress=ex.eventProgress[ev.id]||(ex.eventProgress[ev.id]={encounters:0,resolved:0,failures:0});eventProgress.encounters++;if(resultSuccess)eventProgress.resolved++;else eventProgress.failures=(eventProgress.failures||0)+1;
    if(resultSuccess){ex.stats.eventsResolvedByArea[area.id]=(ex.stats.eventsResolvedByArea[area.id]||0)+1;}
    ctx.event=ev.name;ctx.eventId=ev.id;ctx.success=resultSuccess;
  }else if(kind==='supply'){
    title='補給回收';resultSuccess=resolveFieldAttempt(names,area,kind).success;
    if(resultSuccess){
      reward=pickExplorationLoot();
      const extraChance=names.reduce((sum,n)=>sum+(sinnerSkillEffects(n,{area}).extraLootChance||0),0);
      if(extraChance&&Math.random()<extraChance)reward+='；順手牽來：'+pickExplorationLoot();
      detail='確認封裝完好後，帶回可使用的補給。';stamp='SUPPLY';ex.stats.supplyRecovered++;
    }else{
      ctx.failureReason='補給箱的支架突然傾倒，破損包裝無法回收。';ctx.hazard='傾倒的箱架';
      detail=ctx.failureReason;reward='未取得補給';stamp='INCIDENT';ex.stats.supplyFailures++;
    }
    ctx.success=resultSuccess;
  }else if(kind==='shop'){
    const shop=typeof createExplorationShop==='function'?createExplorationShop(area,names):null;
    title='隨機事件：'+(shop?shop.name:'臨時補給商');
    detail=shop
      ?shop.flavor+' 商品價格會依區域風險與物資類型調整，商店會保留到下一次探索開始。'
      :'探索途中遇到一名臨時補給商。';
    reward='可使用金幣購買補給品或探索裝備';
    stamp='SHOP';
    if(shop){const key='shop-'+area.id;const p=ex.eventProgress[key]||(ex.eventProgress[key]={encounters:0,resolved:0});p.encounters++;}
    ctx.shopName=shop?shop.name:'臨時補給商';ctx.success=true;
  }else{
    title='裝備回收';resultSuccess=resolveFieldAttempt(names,area,'gear').success;
    if(resultSuccess){reward=pickFieldGear();detail='完成拆卸與檢查，帶回可配置的探索裝備。';stamp='GEAR';ex.stats.gearRecovered++;}
    else{ctx.failureReason='固定扣在拆卸時斷裂，裝備跌入無法接近的殘骸下。';ctx.hazard='斷裂的固定架';detail=ctx.failureReason;reward='未取得裝備';stamp='INCIDENT';ex.stats.gearFailures++;}
    ctx.success=resultSuccess;
  }
  if(!resultSuccess&&['event','supply','gear'].includes(kind)){
    ctx.injuries=fieldFailureInjuries(names,area);
    if(ctx.injuries.length){detail+=' '+ctx.hazard+'波及隊伍。'+fieldInjuryDescription(ctx.injuries)+'。';ex.stats.fieldIncidentsWithInjury++;}
    else detail+=' 隊伍及時退開，未受傷。';
  }

  const managerEffects=equipmentEffects();
  if(!['enemy','abnormality'].includes(kind))xp=0;
  if(xp>0&&managerEffects.exploreXpBonus)xp=Math.max(1,Math.round(xp*(1+managerEffects.exploreXpBonus)));
  const levelUps=[];
  const xpBySinner={};
  names.forEach(function(n){xpBySinner[n]=sinnerExplorationXp(n,xp,{area,kind,success:resultSuccess});if(xpBySinner[n]>0){const res=awardSinnerExp(n,xpBySinner[n]);if(res.after>res.before)levelUps.push(n+' Lv.'+res.after)}});
  if(levelUps.length)reward+=(reward?'；':'')+'升級：'+levelUps.join('、');
  const dialogue=kind==='enemy'?[]:typeof generateExplorationDialogue==='function'?generateExplorationDialogue(names,kind,ctx):[];
  ex.lastResult={at:new Date().toISOString(),areaId:area.id,area:area.name,names:names,kind:kind,title:title,detail:detail,reward:reward,stamp:stamp,xp:xp,dialogue:dialogue,combat:combat,eventId:ctx.eventId,enemyId:ctx.enemyId,dialogueVersion:7,xpBySinner:xpBySinner,injuries:ctx.injuries||[],failureReason:ctx.failureReason||''};
  ex.logs=Array.isArray(ex.logs)?ex.logs:[];
  ex.logs.unshift({
    at:ex.lastResult.at,areaId:area.id,area:area.name,names:[...names],kind:kind,title:title,detail:detail,
    reward:reward,stamp:stamp,xp:xp,dialogue:Array.isArray(dialogue)?dialogue:[],combat:combat,eventId:ctx.eventId,enemyId:ctx.enemyId,dialogueVersion:7,xpBySinner:xpBySinner,injuries:ctx.injuries||[],failureReason:ctx.failureReason||''
  });
  const dailyKey=localDateKey(ex.lastResult.at),daily=ex.dailyProgress[dailyKey]||(ex.dailyProgress[dailyKey]={runs:0,suppressions:0});
  daily.runs++;if(combat?.result?.success&&kind==='abnormality')daily.suppressions++;
  ex.logs=ex.logs.slice(0,100);
  // spent 已增加，重新依記帳筆數校正剩餘行動點數。
  ex.earned=state.entries.length;
  ex.actions=Math.max(0,ex.earned-ex.spent);
  saveLocal();
  if(typeof window!=='undefined'&&typeof window.checkRpgQuests==='function')window.checkRpgQuests();
  checkAchievements();
  try{renderExploration();renderSinnerManagement();renderBestiary();renderBackpack();renderQuests();renderProgress()}catch(e){console.error('exploration render',e)}
  if($('exploreReportPanel'))$('exploreReportPanel').open=true;
  toast('探索完成：'+title);
}
function containedAbnormalityCount(){
  ensureExplorationState();
  return Object.values(state.exploration.abnormalityProgress||{}).filter(function(x){return x&&x.contained}).length;
}
function renderCombatBreakdown(combat){
  if(!combat||!combat.enemy)return '';
  const enemy=combat.enemy,result=combat.result||{},ordinary=enemy.category==='ordinary',allies=Array.isArray(combat.allies)?combat.allies:[];
  const enemyHtml='<div class="combat-report-row enemy"><div class="combat-report-label">ENEMY / '+(ordinary?'敵方':'怪異')+'</div><div class="combat-report-main"><strong>'+esc(enemy.name)+'</strong><span>HP '+enemy.maxHp+' → '+enemy.remaining+' · Lv.'+enemy.level+(enemy.type?' · '+esc(enemy.type):'')+'</span></div></div>';
  const allyHtml=allies.map(function(x){
    const notes=x.notes&&x.notes.length?' · '+esc(x.notes.join('、')):'';
    const taken=x.taken>0?' · 受到 '+x.taken+' 傷害':' · 未受傷';
    const healed=x.healed&&x.healed.amount?' · '+esc(x.healed.item)+' +'+x.healed.amount:'';
    return '<div class="combat-report-row ally"><div class="combat-report-label">ALLY / 我方</div><div class="combat-report-main"><strong>'+esc(x.name)+'</strong><span>造成 '+x.damage+' 傷害'+notes+taken+' · HP '+x.hp+' / '+x.maxHp+healed+'</span></div></div>';
  }).join('');
  const resultText=ordinary?(result.success?'戰鬥勝利':'隊伍停止交戰'):result.contained?'正式收容完成':result.success?'有效制壓完成':'怪異未被擊倒';
  const progress=ordinary?'交戰 '+Number(result.rounds||1)+' 回合':'收容進度 '+Number(result.progress||0)+' / '+Number(result.required||0);
  const resultHtml='<div class="combat-report-row outcome '+(result.success?'success':'pending')+'"><div class="combat-report-label">RESULT / 結果</div><div class="combat-report-main"><strong>'+resultText+'</strong><span>'+progress+'</span></div></div>';
  return '<div class="combat-report">'+enemyHtml+allyHtml+resultHtml+'</div>';
}
function explorationStatusClass(stamp){
  const classes={VICTORY:'victory',DEFEAT:'defeat',RESOLVED:'resolved',ENGAGED:'engaged',SUPPLY:'supply',GEAR:'gear',SHOP:'shop',CONTAINED:'contained',SUPPRESSED:'suppressed',INCIDENT:'incident',CLEAR:'clear'};
  return 'status-'+(classes[String(stamp||'').toUpperCase()]||'field');
}
function reviewedExplorationLines(lines){
  return typeof reviewExplorationDialogue==='function'?reviewExplorationDialogue(lines):(Array.isArray(lines)?lines:[]);
}
function renderExploration(){
  ensureExplorationState();const ex=state.exploration;
  if($('exploreActions'))$('exploreActions').textContent=ex.actions;
  if($('exploreActionsHome'))$('exploreActionsHome').textContent=ex.actions;
  if($('exploreRunsHome'))$('exploreRunsHome').textContent=ex.runs;
  if($('containedCountHome'))$('containedCountHome').textContent=containedAbnormalityCount();
  if($('exploreTeamHome'))$('exploreTeamHome').textContent=(ex.selected||[]).join('＋')||'未指定';

  if(typeof renderExplorationAreas==='function')renderExplorationAreas();

  const picker=$('explorationTeamPicker');
  if(picker){
    picker.innerHTML=Object.keys(SINNER_FIELD_PROFILES).map(function(name){
      const on=ex.selected.includes(name),data=ex.sinners[name],lv=sinnerLevel(data),profile=SINNER_FIELD_PROFILES[name],down=data.hp<=0;
      const color=(typeof sinnerColorForSpeaker==='function'?sinnerColorForSpeaker(name):'#d7d2c7');
      return '<button type="button" class="team-sinner wood '+(on?'active ':'')+(down?'down':'')+'" data-team-sinner="'+esc(name)+'" '+(down?'disabled':'')+'>'+
        '<div class="team-sinner-head"><strong style="color:'+color+'">'+esc(name)+'</strong><span>Lv.'+lv+'</span></div>'+
        '<div class="team-sinner-meta">'+esc(profile.specialty)+' · HP '+data.hp+'/'+data.maxHp+(down?' · DOWN':'')+'</div></button>';
    }).join('');
    picker.querySelectorAll('[data-team-sinner]').forEach(function(btn){btn.onclick=function(){
      const n=btn.dataset.teamSinner,idx=ex.selected.indexOf(n);
      if(idx>=0)ex.selected.splice(idx,1);
      else{if(ex.selected.length>=2)ex.selected.shift();ex.selected.push(n)}
      saveLocal();renderExploration();
    }});
  }

  const r=ex.lastResult;
  if($('exploreResultStamp')){
    $('exploreResultStamp').textContent=r?r.stamp:'STANDBY';
    $('exploreResultStamp').className='archive-stamp '+explorationStatusClass(r&&r.stamp);
  }
  if($('exploreResult'))$('exploreResult').innerHTML=r
    ?'<div class="explore-result-title">'+esc(r.title)+'</div><div class="explore-result-meta">'+esc(r.area)+' / '+esc(r.names.join('＋'))+' / '+esc(explorationXpLabel(r))+'</div>'+
      (r.combat?renderCombatBreakdown(r.combat):'<div class="explore-result-detail">'+esc(r.detail)+'</div>')+
      (r.reward?'<div class="explore-reward">REWARD / '+esc(r.reward)+'</div>':'')
    :'等待探索命令。';
  if($('exploreDialogue'))$('exploreDialogue').innerHTML=r&&r.dialogue&&r.dialogue.length
    ?'<div class="explore-dialogue-head">EVENT DIALOGUE / 現場對話</div>'+reviewedExplorationLines(r.dialogue).map(function(line){
      const speaker=typeof normalizeExplorationTraditional==='function'?normalizeExplorationTraditional(line.speaker):line.speaker;
      const txt=typeof normalizeExplorationTraditional==='function'?normalizeExplorationTraditional(line.text):line.text;
      const color=typeof sinnerColorForSpeaker==='function'?sinnerColorForSpeaker(speaker):'#d08b91';
      return '<div class="explore-dialogue-line '+(line.kind==='action'?'action':'')+'"><b style="color:'+color+'">'+esc(speaker)+'</b><span>'+esc(txt)+'</span></div>';
    }).join('')
    :'';

  if($('exploreHomeCode'))$('exploreHomeCode').textContent=r?r.stamp:'STANDBY';
  if($('exploreHomeMain'))$('exploreHomeMain').textContent=r?r.title:'尚未執行探索。';
  if($('exploreHomeDetail'))$('exploreHomeDetail').textContent=r?(r.area+' / '+r.names.join('＋')+(r.reward?' / '+r.reward:'')):'前往「探索」頁籤選擇區域與兩名罪人。';

  const logBox=$('explorationLog');
  if(logBox){
    const logs=Array.isArray(ex.logs)?ex.logs:[];
    logBox.innerHTML=logs.length?logs.map(function(log){
      const when=new Date(log.at);
      const time=isNaN(when.getTime())?'':when.toLocaleString('zh-TW',{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'});
      return '<article class="exploration-log-entry wood">'+
        '<div class="exploration-log-head"><span class="record-kind-badge '+explorationStatusClass(log.stamp)+'">'+esc(log.stamp||'FIELD')+'</span><time>'+esc(time)+'</time></div>'+
        '<div class="exploration-log-title">'+esc(log.title||'探索紀錄')+'</div>'+
        '<div class="exploration-log-meta">'+esc(log.area||'未知區域')+' / '+esc((log.names||[]).join('＋'))+' / '+esc(explorationXpLabel(log))+'</div>'+
        (log.combat?renderCombatBreakdown(log.combat):'<div class="exploration-log-detail">'+esc(log.detail||'')+'</div>')+
        (log.reward?'<div class="exploration-log-reward">REWARD / '+esc(log.reward)+'</div>':'')+
        (Array.isArray(log.dialogue)&&log.dialogue.length?'<div class="exploration-log-dialogue">'+reviewedExplorationLines(log.dialogue).map(function(line){
          const speaker=typeof normalizeExplorationTraditional==='function'?normalizeExplorationTraditional(line.speaker):line.speaker;
          const txt=typeof normalizeExplorationTraditional==='function'?normalizeExplorationTraditional(line.text):line.text;
          const color=(typeof sinnerColorForSpeaker==='function'?sinnerColorForSpeaker(speaker):'#d08b91');
          return '<div class="'+(line.kind==='action'?'action':'')+'"><b style="color:'+color+'">'+esc(speaker)+'</b> <span>'+esc(txt)+'</span></div>';
        }).join('')+'</div>':'')+
      '</article>';
    }).join(''):'<div class="empty">尚無探索紀錄。</div>';
  }

  if(typeof renderExplorationShop==='function')renderExplorationShop();
  const home=$('homeContainmentProgress');
  if(home){
    const rows=Object.entries(ABNORMALITY_CATALOG).map(function(pair){
      const id=pair[0],ab=pair[1],p=ex.abnormalityProgress[id]||{kills:0,contained:false};
      const known=ex.seenAbnormalities.includes(id)||p.contained||Number(p.kills)>0;
      if(!known)return '<article class="containment-progress-row containment-unknown" aria-label="尚未接觸的怪異，探索後解鎖"><div class="containment-file-head"><span class="containment-file-id">未登錄</span><span class="containment-pending">未接觸</span></div><div class="containment-obscured" aria-hidden="true"><div class="containment-file-name">尚未辨識的怪異</div><div class="containment-file-progress">制壓進度尚未確認</div><div class="containment-meter"><span style="width:35%"></span></div></div><div class="containment-unknown-hint">探索後揭露名稱與收容進度</div></article>';
      const required=Math.max(1,Number(ab.kills)||1),kills=p.contained?required:Math.max(0,Math.min(Number(p.kills)||0,required)),pct=Math.round(kills/required*100);
      return '<article class="containment-progress-row '+(p.contained?'done':'')+'">'+
        '<div class="containment-file-head"><span class="containment-file-id">'+esc(id)+'</span>'+
        (p.contained?'<span class="contained-seal" aria-label="已收容">已收容</span>':'<span class="containment-pending">'+(kills?'收容中':'未收容')+'</span>')+'</div>'+
        '<div class="containment-file-name">'+esc(ab.name)+'</div>'+
        '<div class="containment-file-progress"><span>制壓進度</span><b>'+kills+' / '+required+'</b></div>'+
        '<div class="containment-meter" role="progressbar" aria-label="'+esc(ab.name)+'收容進度" aria-valuemin="0" aria-valuemax="'+required+'" aria-valuenow="'+kills+'"><span style="width:'+pct+'%"></span></div></article>';
    });
    home.innerHTML=rows.join('');
  }
}
function renderSinnerManagement(){
  ensureExplorationState();
  const box=$('sinnerManagementGrid');if(!box)return;
  const owned=[...new Set(state.exploration.fieldGear)];
  box.innerHTML=Object.keys(SINNER_FIELD_PROFILES).map(function(name){
    const p=SINNER_FIELD_PROFILES[name],data=state.exploration.sinners[name],lv=sinnerLevel(data),exp=data.exp%100,st=sinnerEffectiveStats(name),skills=unlockedFieldSkills(name);
    const options=['<option value="">LCB 標準裝備</option>'].concat(owned.map(function(id){
      const unavailable=fieldGearAssignedElsewhere(id,name),selected=data.gear===id;
      return '<option value="'+id+'" '+(selected?'selected':'')+' '+(unavailable&&!selected?'disabled':'')+'>'+esc(FIELD_GEAR[id].name)+(unavailable&&!selected?'（已配置）':'')+'</option>';
    })).join('');
    return '<article class="sinner-file wood">'+
      '<div class="sinner-file-head"><div><div class="archive-id">LCB // '+esc(name)+'</div><div class="sinner-file-name">'+esc(name)+'</div></div><div class="sinner-level">Lv.'+lv+'</div></div>'+
      '<div class="sinner-specialty">'+esc(p.specialty)+' / 基礎 E.G.O：'+esc(p.ego)+'</div>'+
      '<div class="sinner-exp"><div style="width:'+exp+'%"></div><span>'+exp+' / 100 EXP</span></div>'+
      '<div class="sinner-condition">CONDITION / '+data.condition+'%</div>'+
      '<div class="sinner-stat-grid"><span>戰鬥 <b>'+st.combat+'</b></span><span>觀察 <b>'+st.observe+'</b></span><span>機動 <b>'+st.mobility+'</b></span><span>穩定 <b>'+st.stability+'</b></span></div>'+
      '<label class="sinner-gear-label">探索裝備<select class="wood sinner-gear-select" data-sinner-gear="'+esc(name)+'">'+options+'</select></label>'+
      '<div class="sinner-skill-list">'+p.skills.map(function(skill){const unlocked=lv>=skill.lv;return '<div class="sinner-skill '+(unlocked?'unlocked':'locked')+'"><b>Lv.'+skill.lv+' / '+esc(skill.name)+'</b><span>'+esc(unlocked?skill.desc:'尚未解鎖')+'</span></div>'}).join('')+'</div>'+
      '</article>';
  }).join('');
  box.querySelectorAll('[data-sinner-gear]').forEach(function(sel){sel.onchange=function(){assignFieldGear(sel.dataset.sinnerGear,sel.value)}});
}
function equipmentEffects(){
  const out={monsterDamage:0,bossDamage:0,expBonus:0,questXpBonus:0,goldBonus:0,allDamage:0,shopDiscount:0,exploreXpBonus:0,eventBonus:0,lootBonus:0};
  const catalog=(typeof window!=='undefined'&&window.RPG_EQUIPMENT_CATALOG)||EQUIPMENT_EFFECTS;
  (state.rpg.equipped||[]).forEach(function(name){
    const e=catalog[name]||EQUIPMENT_EFFECTS[name];
    if(e)Object.keys(out).forEach(function(k){out[k]+=Number(e[k]||0)});
  });
  out.shopDiscount=Math.min(.25,out.shopDiscount);
  return out;
}
function toggleEquip(name){
  const catalog=(typeof window!=='undefined'&&window.RPG_EQUIPMENT_CATALOG)||EQUIPMENT_EFFECTS;
  if(!catalog[name]&&!EQUIPMENT_EFFECTS[name])return;
  state.rpg.equipped=state.rpg.equipped||[];
  const i=state.rpg.equipped.indexOf(name);
  if(i>=0){state.rpg.equipped.splice(i,1);toast('已卸下 '+name)}
  else if(state.rpg.equipped.length>=3){toast('最多同時裝備 3 件');return}
  else if(!state.rpg.inventory.includes(name)){toast('尚未持有這件裝備');return}
  else{state.rpg.equipped.push(name);toast('已裝備 '+name)}
  checkAchievements();saveLocal();render();
}
function currentMonth(){return today().slice(0,7)}
function ensureMonthlyBoss(month){
  month=month||currentMonth();
  state.rpg.monthlyBosses=state.rpg.monthlyBosses||{};
  if(!state.rpg.monthlyBosses[month]){
    const idx=[...month].reduce(function(s,ch){return s+ch.charCodeAt(0)},0)%BOSS_CATALOG.length;
    const b=BOSS_CATALOG[idx];
    state.rpg.monthlyBosses[month]={id:b.id,name:b.name,maxHp:b.hp,hp:b.hp,defeated:false};
  }
  return state.rpg.monthlyBosses[month];
}
function damageBoss(base){
  const b=ensureMonthlyBoss();
  if(b.defeated)return;
  const e=equipmentEffects();
  const dmg=Math.max(1,Math.round(base+e.bossDamage+e.allDamage));
  b.hp=Math.max(0,b.hp-dmg);
  if(b.hp===0&&!b.defeated){
    b.defeated=true;
    const spec=BOSS_CATALOG.find(function(x){return x.id===b.id})||BOSS_CATALOG[0];
    state.rpg.gold+=100;
    state.rpg.itemBoxes=(state.rpg.itemBoxes||0)+1;
    state.rpg.inventory.unshift(spec.reward);
    state.rpg.rewardLog='月度 BOSS 鎮壓完成！\n獲得 100 金幣、道具箱 ×1 與 '+spec.reward+'。';
  }
}
function anyPositiveMonth(){
  const m={};
  state.entries.forEach(function(x){
    const k=x.date.slice(0,7);
    if(!m[k])m[k]={income:0,expense:0};
    m[k][x.type==='income'?'income':'expense']+=x.amount;
  });
  return Object.values(m).some(function(x){return x.income>x.expense});
}
function defeatedMonsterCount(){
  let n=0;
  Object.values(state.daily||{}).forEach(function(d){if(d&&d.monster&&d.monster.defeated)n++});
  return n;
}
function defeatedBossCount(){
  return Object.values(state.rpg.monthlyBosses||{}).filter(function(b){return b.defeated}).length;
}
function achievementMet(id){
  const st=computeStreak();
  if(id==='A-001')return state.entries.length>=1;
  if(id==='A-002')return state.entries.length>=10;
  if(id==='A-003')return state.entries.length>=50;
  if(id==='A-004')return st.best>=7;
  if(id==='A-005'){ensureExplorationState();return Object.values(state.exploration.abnormalityProgress||{}).reduce(function(s,x){return s+Number(x&&x.kills||0)},0)>=5}
  if(id==='A-006'){ensureExplorationState();return Object.values(state.exploration.sinners||{}).filter(function(x){return !!x.gear}).length>=2}
  if(id==='A-007')return containedAbnormalityCount()>=1;
  if(id==='A-008')return anyPositiveMonth();
  return false;
}
function checkAchievements(){
  if(typeof window!=='undefined'&&typeof window.checkRpgAchievements==='function')return window.checkRpgAchievements();
  state.rpg.achievements=state.rpg.achievements||[];
}

function grantXp(xp,reason){
  const e=equipmentEffects(),isQuest=reason.includes('每日執行指令')||reason.startsWith('完成任務：'),bonus=isQuest?e.questXpBonus:e.expBonus;
  const gain=Math.max(1,Math.round(xp*(1+bonus))),beforeLv=Math.floor(state.rpg.xp/100)+1;
  state.rpg.xp+=gain;
  const afterLv=Math.floor(state.rpg.xp/100)+1,levelUps=Math.max(0,afterLv-beforeLv);
  if(levelUps>0)state.rpg.itemBoxes=(state.rpg.itemBoxes||0)+levelUps;
  state.rpg.rewardLog=reason+'\nEXP +'+gain+(levelUps?'\n經理升級 ×'+levelUps+'，獲得道具箱 ×'+levelUps:'');
  return {gain:gain,levelUps:levelUps,beforeLv:beforeLv,afterLv:afterLv};
}
function ensurePlayerState(){
  state.rpg.player=state.rpg.player||{hp:100,maxHp:100,lastCombat:'尚無受擊紀錄。'};
  state.rpg.player.maxHp=Math.max(1,Number(state.rpg.player.maxHp||100));
  state.rpg.player.hp=Math.max(0,Math.min(state.rpg.player.maxHp,Number(state.rpg.player.hp??state.rpg.player.maxHp)));
  state.rpg.consumables=state.rpg.consumables||{water:3,potion:0};
  state.rpg.consumables.water=Math.max(0,Number(state.rpg.consumables.water||0));
  state.rpg.consumables.potion=Math.max(0,Number(state.rpg.consumables.potion||0));
}
function useConsumable(kind,autoUse=false){
  ensurePlayerState();
  const item=CONSUMABLE_EFFECTS[kind];
  if(!item||Number(state.rpg.consumables[kind]||0)<=0)return false;
  if(state.rpg.player.hp>=state.rpg.player.maxHp){if(!autoUse)toast('HP 已滿');return false}
  state.rpg.consumables[kind]--;
  const before=state.rpg.player.hp;
  state.rpg.player.hp=Math.min(state.rpg.player.maxHp,state.rpg.player.hp+item.heal);
  const healed=state.rpg.player.hp-before;
  state.rpg.player.lastCombat=(autoUse?'自動飲用 ':'使用 ')+item.name+'，回復 '+healed+' HP。';
  if(!autoUse){saveLocal();render();toast(item.name+'：HP +'+healed)}
  return true;
}
function autoHealAfterHit(){
  ensurePlayerState();
  const ratio=state.rpg.player.hp/state.rpg.player.maxHp;
  if(ratio<=0.45&&state.rpg.consumables.water>0)return useConsumable('water',true);
  return false;
}
function monsterCounterAttack(){
  ensureDaily(today());ensurePlayerState();
  const m=state.daily[today()].monster;
  if(!m||m.defeated||state.rpg.player.hp<=0)return {damage:0,healed:0,autoWater:false};
  if(Math.random()>=0.35)return {damage:0,healed:0,autoWater:false};
  const spec=MONSTER_CATALOG.find(function(x){return x.id===m.id})||MONSTER_CATALOG[0];
  const ranges={LOW:[4,8],MEDIUM:[7,12],HIGH:[10,16]},range=ranges[spec.risk]||ranges.LOW;
  const dmg=range[0]+Math.floor(Math.random()*(range[1]-range[0]+1));
  state.rpg.player.hp=Math.max(0,state.rpg.player.hp-dmg);
  const beforeHeal=state.rpg.player.hp;
  const didHeal=autoHealAfterHit();
  const healed=didHeal?state.rpg.player.hp-beforeHeal:0;
  state.rpg.player.lastCombat=m.name+'反擊，造成 '+dmg+' 傷害。'+(didHeal?' HP 偏低，已自動飲用瓶裝水。':'');
  if(state.rpg.player.hp===0)state.rpg.player.lastCombat+=' 使用者已失去作業能力，請在背包使用治療物品。';
  return {damage:dmg,healed:healed,autoWater:didHeal};
}
function damageMonster(amount,allowCounter=true){
  const d=today();ensureDaily(d);ensurePlayerState();
  const m=state.daily[d].monster;
  if(m.defeated)return {damage:0,counter:0,healed:0,defeated:true};
  const e=equipmentEffects(),dmg=Math.max(1,Math.round(amount+e.monsterDamage+e.allDamage));
  const before=m.hp;
  m.hp=Math.max(0,m.hp-dmg);
  const actual=Math.max(0,before-m.hp);
  let drop='',counter={damage:0,healed:0,autoWater:false};
  if(m.hp===0){
    m.defeated=true;
    state.rpg.gold+=20;
    state.rpg.itemBoxes=(state.rpg.itemBoxes||0)+1;
    drop=MONSTER_DROPS[m.id]||'';
    if(drop&&!state.rpg.inventory.includes(drop))state.rpg.inventory.unshift(drop);
    state.rpg.rewardLog='每日收容單位處置完成！\n獲得 20 金幣、道具箱 ×1'+(drop?' 與 '+drop:'')+'。';
  }else if(allowCounter){
    counter=monsterCounterAttack();
  }
  const hitPct=Math.round((1-m.hp/m.maxHp)*100);
  state.rpg.lastContainment={
    at:new Date().toISOString(),
    monster:m.name,
    damage:actual,
    remaining:m.hp,
    maxHp:m.maxHp,
    progress:hitPct,
    counter:Number(counter.damage||0),
    healed:Number(counter.healed||0),
    autoWater:!!counter.autoWater,
    defeated:!!m.defeated,
    drop:drop
  };
  return {damage:actual,counter:Number(counter.damage||0),healed:Number(counter.healed||0),defeated:!!m.defeated,drop:drop};
}
function checkStreakMilestones(){
  const st=computeStreak(),ms=[{n:3,count:1},{n:7,count:1},{n:14,count:2},{n:30,count:3}];
  for(const m of ms){
    if(st.current>=m.n&&!state.rpg.streakMilestones.includes(m.n)){
      state.rpg.streakMilestones.push(m.n);
      state.rpg.itemBoxes=(state.rpg.itemBoxes||0)+m.count;
      state.rpg.rewardLog='連續記錄 '+m.n+' 天達成！\n獲得道具箱 ×'+m.count+'。';
    }
  }
}
function checkQuests(){
  if(typeof window!=='undefined'&&typeof window.checkRpgQuests==='function')window.checkRpgQuests();
  else checkStreakMilestones();
  checkAchievements();
}
function openItemBox(){
  if((state.rpg.itemBoxes||0)<=0){toast('沒有道具箱');return}
  state.rpg.itemBoxes--;
  ensurePlayerState();ensureExplorationState();
  const roll=Math.random();
  let reward='';
  if(roll<0.40){
    const water=1+Math.floor(Math.random()*3),potion=Math.random()<0.35?1:0;
    state.rpg.consumables.water+=water;state.rpg.consumables.potion+=potion;
    reward='補給：瓶裝水 ×'+water+(potion?'、小型治療藥水 ×1':'');
  }else if(roll<0.78){
    const gold=30+Math.floor(Math.random()*71);state.rpg.gold+=gold;reward='金幣 ×'+gold;
  }else if(roll<0.86){
    reward='探索裝備：'+pickFieldGear();
  }else if(roll<0.90){
    const pool=typeof window.rpgSupportEquipmentNames==='function'?window.rpgSupportEquipmentNames():Object.keys(EQUIPMENT_EFFECTS);
    const loot=weightedEquipmentPick(pool,name=>window.RPG_EQUIPMENT_CATALOG?.[name]?.rarity);state.rpg.inventory.unshift(loot);reward='管理支援裝備：'+loot+' ×1';
  }else if(roll<0.98){
    state.rpg.itemBoxes+=1;state.rpg.gold+=100;reward='額外道具箱 ×1 ＋ 金幣 ×100';
  }else{
    state.rpg.gold+=200;state.rpg.consumables.potion+=2;state.rpg.consumables.water+=3;
    reward='稀有補給包：金幣 ×200、治療藥水 ×2、瓶裝水 ×3';
  }
  state.exploration.stats.boxesOpened=(state.exploration.stats.boxesOpened||0)+1;
  recordRandomEvent({kind:'box',title:'道具箱開啟',detail:'開啟一個道具箱。',reward:reward,stamp:'SUPPLY'});
  state.rpg.rewardLog='開啟道具箱！\n獲得 '+reward+'。';
  saveLocal();try{render()}catch(e){console.error(e)}toast('獲得 '+reward);
}
function monsterSprite(shape,locked=false){
  const base=locked?'#3b3d43':'#c7c3b8', edge=locked?'#24252a':'#666870', red=locked?'#44464c':'#b52d2d';
  if(shape==='worm')return `<svg viewBox="0 0 80 60" width="86" height="70"><path d="M12 38c7-18 18-25 31-18 10 5 14 15 25 14-5 14-17 18-30 13-12-5-18-2-26 4z" fill="${base}" stroke="${edge}" stroke-width="3"/><circle cx="53" cy="29" r="3" fill="${red}"/></svg>`;
  if(shape==='doll')return `<svg viewBox="0 0 70 70" width="72" height="72"><rect x="20" y="10" width="30" height="24" fill="${base}" stroke="${edge}" stroke-width="3"/><path d="M24 36h22l6 22H18z" fill="#24262c" stroke="${edge}" stroke-width="3"/><circle cx="29" cy="22" r="3" fill="${red}"/><circle cx="41" cy="22" r="3" fill="${red}"/></svg>`;
  if(shape==='hound')return `<svg viewBox="0 0 80 60" width="86" height="70"><path d="M15 39l10-19 19 3 10 10 13 5-8 9-15-3-13 8z" fill="${base}" stroke="${edge}" stroke-width="3"/><circle cx="49" cy="31" r="3" fill="${red}"/><path d="M25 20l-7-9 13 5" fill="${base}" stroke="${edge}" stroke-width="3"/></svg>`;
  if(shape==='moth')return `<svg viewBox="0 0 80 70" width="86" height="72"><path d="M39 22C25 3 8 10 13 30c4 14 16 15 27 9M41 22C55 3 72 10 67 30c-4 14-16 15-27 9" fill="${base}" stroke="${edge}" stroke-width="3"/><rect x="36" y="18" width="8" height="32" fill="#24262c"/><circle cx="40" cy="19" r="3" fill="${red}"/></svg>`;
  if(shape==='mimic')return `<svg viewBox="0 0 80 60" width="86" height="70"><rect x="15" y="17" width="50" height="34" fill="#292b31" stroke="${edge}" stroke-width="3"/><path d="M16 32h48" stroke="${red}" stroke-width="4"/><path d="M28 32l5 8 5-8 5 8 5-8" fill="none" stroke="${base}" stroke-width="3"/></svg>`;
  if(shape==='wire')return `<svg viewBox="0 0 80 70" width="86" height="72"><path d="M12 48C18 15 30 57 38 21s16 30 30-5M17 24c9 6 15 11 25 4s17-4 23 10" fill="none" stroke="${base}" stroke-width="5"/><circle cx="39" cy="34" r="7" fill="#24262c" stroke="${red}" stroke-width="3"/></svg>`;
  if(shape==='observer')return `<svg viewBox="0 0 80 70" width="86" height="72"><ellipse cx="40" cy="34" rx="26" ry="18" fill="${base}" stroke="${edge}" stroke-width="3"/><ellipse cx="40" cy="34" rx="12" ry="8" fill="#17181c"/><circle cx="40" cy="34" r="4" fill="${red}"/></svg>`;
  return `<svg viewBox="0 0 64 64" width="70" height="70"><path d="M14 40c0-15 9-24 18-24s18 9 18 24c0 7-5 12-11 12H25c-6 0-11-5-11-12z" fill="${base}" stroke="${edge}" stroke-width="3"/><circle cx="25" cy="35" r="3" fill="#1b1c20"/><circle cx="39" cy="35" r="3" fill="#1b1c20"/><path d="M26 44c4 3 8 3 12 0" stroke="${red}" stroke-width="2.5" fill="none"/></svg>`;
}
function renderBestiary(){
  if(typeof window.forceRenderBestiary==='function')return window.forceRenderBestiary();
  ensureExplorationState();
  const grid=$('bestiaryGrid');if(!grid)return;
  const ex=state.exploration;
  grid.innerHTML=Object.entries(ABNORMALITY_CATALOG).map(function(pair){
    const id=pair[0],ab=pair[1],seen=ex.seenAbnormalities.includes(id),p=ex.abnormalityProgress[id]||{kills:0,contained:false};
    return '<div class="bestiary-card wood '+(seen?'':'locked')+'">'+
      '<div class="bestiary-status '+(p.contained?'done':seen?'':'unknown')+'">'+(p.contained?'CONTAINED':seen?'OBSERVED':'UNKNOWN')+'</div>'+
      '<div class="specimen"><div class="abno-glyph">'+(seen?'◈':'?')+'</div></div>'+
      '<div class="bestiary-code">'+(seen?id:'A-???')+' / LV '+(seen?ab.level:'?')+'</div>'+
      '<div class="bestiary-name">'+(seen?esc(ab.name):'未確認怪異')+'</div>'+
      '<div class="bestiary-meta">'+(seen?esc(ab.note):'尚未於區域探索中遭遇。')+'<br>'+
      '制壓進度 / '+(seen?Math.min(p.kills,ab.kills)+' / '+ab.kills:'? / ?')+'</div>'+
      '</div>';
  }).join('');
}
function renderBoss(){
  const b=ensureMonthlyBoss(),spec=BOSS_CATALOG.find(function(x){return x.id===b.id})||BOSS_CATALOG[0];
  if(!$('bossName'))return;
  $('bossIcon').innerHTML=monsterSprite(spec.shape,false);
  $('bossName').textContent=spec.name;$('bossMonth').textContent=currentMonth();
  $('bossHpFill').style.width=Math.round(b.hp/b.maxHp*100)+'%';$('bossHpText').textContent=b.hp+' / '+b.maxHp;
  $('bossState').textContent=b.defeated?'DISPOSED':'ACTIVE';
  $('bossMeta').textContent=b.defeated?'本月 BOSS 已完成鎮壓。':'每筆新紀錄造成 12 基礎傷害；每日指令追加 15 傷害。';
  $('bossReward').textContent='REWARD / 100 金幣＋金寶箱 ×1＋'+spec.reward;
}
function rank(lv){if(lv>=20)return '傳奇帳本大師';if(lv>=12)return '黃金終端家';if(lv>=7)return '熟練記錄戰士';if(lv>=4)return '見習帳本獵人';return '新手村記錄員'}
function renderRpg(){
  ensurePlayerState();ensureExplorationState();
  const xp=state.rpg.xp,lv=Math.floor(xp/100)+1,cur=xp%100;
  $('lv').textContent='Lv.'+lv;
  $('rank').textContent='但丁｜LCB 執行經理';
  $('xpText').textContent=cur+' / 100 EXP';
  $('xpFill').style.width=cur+'%';$('xpPct').textContent=cur+'%';
  $('gold').textContent=state.rpg.gold;
  if($('itemBoxCount'))$('itemBoxCount').textContent=state.rpg.itemBoxes||0;
  if($('managerActions'))$('managerActions').textContent=state.exploration.actions||0;
  if($('managerSupply'))$('managerSupply').textContent=(state.rpg.consumables.water||0)+' / '+(state.rpg.consumables.potion||0);
  $('rewardLog').textContent=state.rpg.rewardLog;
  const ds=dayStats(today());
  if($('streakBig'))$('streakBig').textContent=computeStreak().current;
  if($('bestBig'))$('bestBig').textContent=computeStreak().best;
  if($('todayCount'))$('todayCount').textContent=ds.count;
  if($('todayNet')){$('todayNet').textContent=money(ds.net);$('todayNet').style.color=ds.net<0?'var(--red)':'var(--green)'}
}
function renderSummary(){const expense=state.entries.filter(x=>x.type==='expense').reduce((s,x)=>s+x.amount,0),income=state.entries.filter(x=>x.type==='income').reduce((s,x)=>s+x.amount,0),init=Number(state.profile.initialAmount||0),bal=init+income-expense,m=$('month').value||today().slice(0,7),monthEntries=state.entries.filter(x=>x.date.startsWith(m)),mIncome=monthEntries.filter(x=>x.type==='income').reduce((s,x)=>s+x.amount,0),mExpense=monthEntries.filter(x=>x.type==='expense').reduce((s,x)=>s+x.amount,0),monthNet=mIncome-mExpense,st=computeStreak();$('initialAmount').textContent=money(init);$('allIncome').textContent=money(income);$('allIncome').style.color='var(--green)';$('allExpense').textContent=money(expense);$('allExpense').style.color='var(--red)';$('balance').textContent=money(bal);$('balance').style.color=bal<0?'var(--red)':'var(--green)';$('monthNet').textContent=money(monthNet);$('monthNet').style.color=monthNet<0?'var(--red)':'var(--green)';$('monthLabel').textContent=m;$('streak').textContent=st.current+' 天';$('bestStreak').textContent='最長 '+st.best+' 天';if($('streakBig'))$('streakBig').textContent=st.current;if($('bestBig'))$('bestBig').textContent=st.best}
function renderQuests(){
  if(typeof window!=='undefined'&&typeof window.forceRenderRpgQuests==='function')return window.forceRenderRpgQuests();
  const box=$('questList');if(box)box.innerHTML='<div class="empty">任務模組載入中。</div>';
}
function filtered(){const m=$('month').value,t=$('typeFilter').value,c=$('cat').value,q=$('search').value.trim().toLowerCase();return state.entries.filter(x=>(!m||x.date.startsWith(m))&&(!t||x.type===t)&&(!c||x.category===c)&&(!q||[x.store,x.note,x.invoice,x.category,...(x.items||[]).map(i=>i.name)].join(' ').toLowerCase().includes(q))).sort((a,b)=>b.date.localeCompare(a.date)||b.amount-a.amount)}
function renderBoard(){
  if(typeof window!=='undefined'&&typeof window.forceRenderRecords==='function')return window.forceRenderRecords();
  const box=$('board');if(box)box.innerHTML='<div class="empty wood panel">紀錄模組載入中。</div>';
}
function renderBackpack(){
  if(typeof window!=='undefined'&&typeof window.forceRenderBackpack==='function')return window.forceRenderBackpack();
  ensurePlayerState();ensureExplorationState();
  const consumables=$('backpackConsumables');
  if(consumables){
    consumables.innerHTML=Object.entries(CONSUMABLE_EFFECTS).map(function(pair){
      const key=pair[0],item=pair[1],count=Number(state.rpg.consumables[key]||0);
      return '<div class="pack-item wood consumable-card"><div class="pack-item-head"><strong>'+esc(item.name)+'</strong><span class="pack-count">×'+count+'</span></div>'+
        '<div class="pack-desc">'+esc(item.desc)+'</div></div>';
    }).join('');
  }

  const field=$('backpackFieldGear');
  if(field){
    field.innerHTML=state.exploration.fieldGear.length?state.exploration.fieldGear.map(function(id){
      const gear=FIELD_GEAR[id],assigned=Object.entries(state.exploration.sinners).find(function(pair){return pair[1].gear===id});
      return '<div class="pack-item wood equipment-card"><div class="pack-item-head"><strong>'+esc(gear.name)+'</strong><span class="pack-state">'+(assigned?'→ '+esc(assigned[0]):'STORED')+'</span></div><div class="pack-desc">'+esc(gear.desc)+'</div></div>';
    }).join(''):'<div class="empty pack-empty">尚未取得探索裝備。</div>';
  }

  const equipped=state.rpg.equipped||[];
  const equipmentNames=[...new Set(state.rpg.inventory.filter(function(x){return !!EQUIPMENT_EFFECTS[x]}))];
  const eqBox=$('backpackEquipment');
  if(eqBox){
    eqBox.innerHTML=equipmentNames.length?equipmentNames.map(function(x){
      const eq=EQUIPMENT_EFFECTS[x],on=equipped.includes(x);
      return '<button type="button" class="pack-item wood equipment-card '+(on?'equipped':'')+'" data-equip="'+esc(x)+'">'+
        '<div class="pack-item-head"><strong>'+esc(x)+'</strong><span class="pack-state">'+(on?'EQUIPPED':'STORED')+'</span></div>'+
        '<div class="pack-desc">'+esc(eq.desc)+'</div><div class="loot-action">'+(on?'點擊卸下':'點擊裝備')+'</div></button>';
    }).join(''):'<div class="empty pack-empty">尚無管理支援裝備。</div>';
    eqBox.querySelectorAll('[data-equip]').forEach(function(el){el.onclick=function(){toggleEquip(el.dataset.equip)}});
  }

  const materialCounts={};
  state.rpg.inventory.filter(function(x){return !EQUIPMENT_EFFECTS[x]}).forEach(function(x){materialCounts[x]=(materialCounts[x]||0)+1});
  const matBox=$('backpackMaterials');
  if(matBox)matBox.innerHTML=Object.keys(materialCounts).length?Object.entries(materialCounts).map(function(pair){
    return '<div class="pack-item wood material-card"><div class="pack-item-head"><strong>'+esc(pair[0])+'</strong><span class="pack-count">×'+pair[1]+'</span></div><div class="pack-desc">收容材料／其他物品</div></div>';
  }).join(''):'<div class="empty pack-empty">目前沒有材料或其他物品。</div>';
}
function renderProgress(){
  if(typeof window!=='undefined'&&typeof window.forceRenderAchievements==='function')return window.forceRenderAchievements();
  const ag=$('achievementGrid'),unlocked=state.rpg.achievements||[];
  if(!ag)return;
  ag.innerHTML=ACHIEVEMENTS.map(function(item){
    const on=unlocked.includes(item.id);
    return '<div class="achievement-card wood '+(on?'unlocked':'locked')+'">'+
      '<div class="achievement-badge">'+(on?'UNLOCKED':'LOCKED')+'</div>'+
      '<div class="achievement-id">'+esc(item.id)+'</div>'+
      '<div class="achievement-name">'+esc(item.name)+'</div>'+
      '<div class="achievement-desc">'+esc(item.desc)+'</div>'+
      '<div class="achievement-reward">REWARD / '+item.gold+' 金幣</div></div>';
  }).join('');
}
function render(){
  backfillMissingComments();refreshFilters();renderLanguageSwitch();renderCurrencySelector();renderSummary();
  renderRpg();renderQuests();renderBoard();renderCharts();renderBestiary();checkAchievements();
  renderProgress();renderBackpack();renderExploration();renderSinnerManagement();renderCommentaryArchive();
  if($('initialInput'))$('initialInput').value=state.profile.initialAmount||'';
}

function speakerMarkup(name){
 const value=String(name||'');if(value.includes('阿賴耶'))return '<span class="speaker-main">阿賴耶</span>';
 return esc(value);
}
function recordRandomEvent(event){
 ensureExplorationState();const ex=state.exploration;ex.eventLogs=Array.isArray(ex.eventLogs)?ex.eventLogs:[];
 ex.eventLogs.unshift({at:new Date().toISOString(),area:'LCB 巴士',names:[],...event});ex.eventLogs=ex.eventLogs.slice(0,200);
}
function renderCommentLines(comment){
  if(!comment||!Array.isArray(comment.lines))return '';
  return comment.lines.map(function(line){
    const color=typeof sinnerColorForSpeaker==='function'?sinnerColorForSpeaker(line.speaker):'#c9c5bb';
    return '<div class="commentary-line" style="--speaker-color:'+color+'"><div class="commentary-speaker">'+speakerMarkup(line.speaker)+'</div><div class="commentary-text">'+esc(line.text)+'</div></div>';
  }).join('');
}
function showSinnerComment(comment){
  if(!comment)return;
  const dlg=$('commentDlg'),body=$('commentDlgBody'),tag=$('commentDlgTag');
  if(!dlg||!body)return;
  body.innerHTML='<div class="commentary-meta" style="margin-bottom:8px">'+esc(comment.category||'未分類')+(arayaAgeLabel(comment)?' · 阿賴耶／'+esc(arayaAgeLabel(comment)):'')+(comment.amount!=null?' / '+money(comment.amount):'')+'</div>'+renderCommentLines(comment);
  if(tag)tag.textContent=commentKindLabel(comment.kind).replace(/^.*\/\s*/,'');
  if(dlg.open)dlg.close();
  requestAnimationFrame(function(){
    try{dlg.showModal()}catch(e){dlg.setAttribute('open','')}
  });
}
function backfillMissingComments(){
  let changed=false;
  state.entries.forEach(function(entry){
    if(entry.comment&&entry.comment.version!==COMMENTARY_VERSION){entry.comment=refreshSinnerComment(entry);changed=true;}
    if(!entry.comment && entry.source && String(entry.source).startsWith('手動')){
      entry.comment=generateSinnerComment(entry);changed=true;
    }
  });
  if(typeof refreshExplorationDialogues==='function'&&refreshExplorationDialogues())changed=true;
  if(changed)saveLocal();
}

let commentaryView='time';
let commentarySinner='all';
function sinnerForLineSpeaker(speaker){
  if(!speaker)return null;
  if(String(speaker).includes('阿賴耶'))return '良秀';
  const found=SINNERS.find(function(s){return String(speaker).includes(s.name)});
  return found?found.name:null;
}
function commentEntryCard(entry,opts){
  opts=opts||{};
  const rare=entry.comment.kind==='duo'||entry.comment.kind==='group'||entry.comment.kind==='all';
  let lines=entry.comment.lines||[];
  if(opts.sinner){
    lines=lines.filter(function(line){return sinnerForLineSpeaker(line.speaker)===opts.sinner || (opts.sinner==='良秀'&&String(line.speaker).includes('阿賴耶'))});
    if(entry.comment.kind==='araya'&&opts.sinner==='良秀')lines=entry.comment.lines||[];
  }
  if(!lines.length)return '';
  const copy={...entry.comment,lines:lines};
  return '<div class="commentary-entry wood kind-'+esc(entry.comment.kind)+' '+(opts.sinner?'compact-by-sinner':'')+'"><div class="commentary-head"><div><b>'+esc(entry.store)+'</b><div class="commentary-meta">'+esc(entry.date)+' / '+(entry.type==='income'?'收入':'支出')+' / '+esc(entry.category||'其他')+' / '+money(entry.amount)+(arayaAgeLabel(entry.comment)?' · 阿賴耶／'+esc(arayaAgeLabel(entry.comment)):'')+'</div></div><span class="commentary-tag '+(rare?'rare':'')+'">'+commentKindLabel(entry.comment.kind)+'</span></div><div class="commentary-lines">'+renderCommentLines(copy)+'</div></div>';
}
function setCommentaryView(view){
  commentaryView=view==='sinner'?'sinner':'time';
  $('commentViewTime')?.classList.toggle('active',commentaryView==='time');
  $('commentViewSinner')?.classList.toggle('active',commentaryView==='sinner');
  if($('sinnerFilterBar'))$('sinnerFilterBar').style.display=commentaryView==='sinner'?'flex':'none';
  renderCommentaryArchive();
}
function renderSinnerFilters(rows){
  const bar=$('sinnerFilterBar');if(!bar)return;
  const counts={};
  SINNERS.forEach(function(s){counts[s.name]=0});
  rows.forEach(function(entry){
    const present=new Set();
    (entry.comment.lines||[]).forEach(function(line){const n=sinnerForLineSpeaker(line.speaker);if(n)present.add(n)});
    present.forEach(function(n){counts[n]=(counts[n]||0)+1});
  });
  bar.innerHTML='<button type="button" class="sinner-filter '+(commentarySinner==='all'?'active':'')+'" data-sinner="all">全部</button>'+
    SINNERS.map(function(s){return '<button type="button" class="sinner-filter '+(commentarySinner===s.name?'active':'')+'" data-sinner="'+esc(s.name)+'">'+esc(s.name)+'<span class="count">'+(counts[s.name]||0)+'</span></button>'}).join('');
  bar.querySelectorAll('[data-sinner]').forEach(function(btn){btn.onclick=function(){commentarySinner=btn.dataset.sinner;renderCommentaryArchive()}});
}
function renderCommentaryArchive(){
  const box=$('commentaryList');if(!box)return;
  const rows=state.entries.filter(function(x){return x.comment&&x.comment.lines&&x.comment.lines.length}).sort(function(a,b){
    const ca=a.comment.createdAt||a.date,cb=b.comment.createdAt||b.date;return cb.localeCompare(ca);
  });
  $('commentViewTime')?.classList.toggle('active',commentaryView==='time');
  $('commentViewSinner')?.classList.toggle('active',commentaryView==='sinner');
  if($('sinnerFilterBar'))$('sinnerFilterBar').style.display=commentaryView==='sinner'?'flex':'none';
  if(!rows.length){box.innerHTML='<div class="empty wood panel">尚無罪人評議。新增一筆收入或支出後，評議會固定保存於此。</div>';return}
  if(commentaryView==='time'){
    box.innerHTML=rows.map(function(entry){return commentEntryCard(entry)}).join('');
    return;
  }
  renderSinnerFilters(rows);
  const sinners=commentarySinner==='all'?SINNERS.map(function(s){return s.name}):[commentarySinner];
  const groups=sinners.map(function(name){
    const sinner=SINNERS.find(function(s){return s.name===name});
    const matched=rows.filter(function(entry){
      return (entry.comment.lines||[]).some(function(line){return sinnerForLineSpeaker(line.speaker)===name}) ||
        (name==='良秀'&&entry.comment.kind==='araya');
    });
    if(!matched.length)return '';
    return '<div class="sinner-group"><div class="sinner-group-head"><div><div class="sinner-group-code">SINNER // '+esc(sinner?sinner.id:'--')+'</div><div class="sinner-group-name" style="--speaker-color:'+(typeof sinnerColorForSpeaker==='function'?sinnerColorForSpeaker(name):'#c9c5bb')+'">'+esc(name)+'</div></div><div class="sinner-group-count">'+matched.length+' 筆評議</div></div>'+
      matched.map(function(entry){return commentEntryCard(entry,{sinner:name})}).join('')+'</div>';
  }).join('');
  box.innerHTML=groups||'<div class="empty wood panel">此罪人目前尚無評議紀錄。</div>';
}


function syncVisualViewport(){
  const vv=window.visualViewport;
  const h=Math.max(320,Math.round(vv?vv.height:window.innerHeight));
  const top=Math.round(vv?vv.offsetTop:0);
  document.documentElement.style.setProperty('--vvh',h+'px');
  document.documentElement.style.setProperty('--vvo',top+'px');
  const keyboardOpen=window.innerHeight-h>120;
  document.body.classList.toggle('keyboard-open',keyboardOpen);
}
function setupIphoneSafariInput(){
  syncVisualViewport();
  if(window.visualViewport){
    window.visualViewport.addEventListener('resize',syncVisualViewport,{passive:true});
    window.visualViewport.addEventListener('scroll',syncVisualViewport,{passive:true});
  }
  window.addEventListener('orientationchange',function(){setTimeout(syncVisualViewport,180)},{passive:true});
  const dlg=$('dlg');
  if(dlg){
    dlg.addEventListener('focusin',function(e){
      if(!e.target.matches('input,select,textarea'))return;
      setTimeout(function(){
        try{e.target.scrollIntoView({block:'center',behavior:'smooth'})}catch(_){}
      },260);
    });
    dlg.addEventListener('close',function(){
      document.body.classList.remove('keyboard-open');
      syncVisualViewport();
    });
  }
}

function syncEntryTypeUI(){
  const type=$('etype').value;
  document.querySelectorAll('[data-entry-type]').forEach(b=>b.classList.toggle('active',b.dataset.entryType===type));$('dlg').classList.toggle('type-expense',type==='expense');$('dlg').classList.toggle('type-income',type==='income');
  $('estoreLabel').textContent=type==='income'?'收入來源':'店家／用途';
  $('estore').placeholder=type==='income'?'例如：薪資、退款、獎金':'例如：午餐、超商、交通';
  updateCategoryOptions(type);
  renderQuickCats();
}
function renderQuickCats(){
  const type=$('etype').value, cats=type==='income'?INCOME_CATS:EXPENSE_CATS, current=$('ecat').value;
  $('quickCats').innerHTML=cats.map(cat=>`<button type="button" class="quick-cat ${cat===current?'active':''}" style="${categoryStyle(cat)}" data-quick-cat="${esc(cat)}">${esc(cat)}</button>`).join('');
  document.querySelectorAll('[data-quick-cat]').forEach(b=>b.onclick=()=>{$('ecat').value=b.dataset.quickCat;renderQuickCats()});
}
function openEdit(id,presetType){const entry=id?state.entries.find(x=>x.id===id):null;$('dlgTitle').textContent=entry?'編輯記錄':(presetType==='income'?'新增收入':'新增支出');$('eid').value=entry?.id||'';$('etype').value=entry?.type||presetType||'expense';updateCategoryOptions($('etype').value);$('edate').value=entry?.date||today();$('eamt').value=entry?.amount??'';$('estore').value=entry?.store||'';$('ecat').value=entry?.category||($('etype').value==='income'?'薪資':'其他');const payCandidate=entry?.payment||state.profile.lastPayment||'現金';$('epay').value=PAYMENT_OPTIONS.includes(payCandidate)?payCandidate:'其他';$('enote').value=entry?.note||'';$('del').style.display=entry?'':'none';$('saveAgain').style.display=entry?'none':'';syncEntryTypeUI();syncVisualViewport();$('dlg').showModal();setTimeout(()=>{syncVisualViewport();$('eamt').focus()},120)}
function saveEntry(keepOpen=false){
  if(!$('edate').value){toast('請選擇日期');return}if(!(Number($('eamt').value)>0)){toast('請輸入大於 0 的金額');$('eamt').focus();return}
  const id=$('eid').value,old=state.entries.find(function(x){return x.id===id}),type=$('etype').value;
  const obj={...(old||{}),id:id||('manual-'+Date.now()),type:type,date:$('edate').value,amount:Number($('eamt').value||0),store:$('estore').value.trim()||'未命名紀錄',category:$('ecat').value,payment:$('epay').value,note:$('enote').value.trim(),source:old&&old.source?old.source:(type==='income'?'手動收入':'手動支出'),items:old&&old.items?old.items:[]};
  let freshComment=null;
  if(id){
    if(old?.comment&&(old.category!==obj.category||old.amount!==obj.amount||old.type!==obj.type)){obj.comment=authoredComment(obj,old.comment.kind,old.comment.lines?.[0]?.speaker);obj.comment.createdAt=old.comment.createdAt||obj.date;}
    state.entries=state.entries.map(function(x){return x.id===id?obj:x});
    state.rpg.rewardLog='已編輯記錄：'+obj.store+'\n編輯不會額外獲得 EXP。';
    toast('已更新記錄');
  }else{
    obj.comment=generateSinnerComment(obj);freshComment=obj.comment;
    state.entries.unshift(obj);
    const xpResult=grantXp(XP_PER_ENTRY,(type==='income'?'新增收入':'新增支出')+'：'+obj.store);
    grantExplorationActions(1);
    ensureExplorationState();
    window.lastBookkeepingReward={
      xp:Number(xpResult&&xpResult.gain||XP_PER_ENTRY),
      levelUps:Number(xpResult&&xpResult.levelUps||0),
      actions:Number(state.exploration.actions||0),
      itemBoxes:Number(state.rpg.itemBoxes||0),
      gold:Number(state.rpg.gold||0),
      at:Date.now()
    };
  }
  state.profile.lastPayment=obj.payment;
  checkQuests();checkAchievements();saveLocal();
  if(!id&&typeof window.forceRenderManagerProgress==='function')window.forceRenderManagerProgress();
  if(!id&&typeof window.showBookkeepingReward==='function')window.showBookkeepingReward(window.lastBookkeepingReward);

  if(keepOpen&&!id){
    const keepType=obj.type;
    $('eamt').value='';$('estore').value='';$('enote').value='';$('etype').value=keepType;syncEntryTypeUI();
    setTimeout(function(){try{render()}catch(e){console.error('render after saveAgain',e)}$('eamt').focus()},40);
  }else{
    $('dlg').close();
    // 先顯示罪人評議，再做其餘畫面刷新；即使某個頁籤渲染失敗，評議也不會被吃掉。
    if(freshComment)setTimeout(function(){showSinnerComment(freshComment)},30);
    setTimeout(function(){try{render()}catch(e){console.error('render after save',e)}},80);
  }
}
function deleteEntry(){const id=$('eid').value;if(!id)return;if(confirm('確定刪除這筆記錄？')){state.entries=state.entries.filter(x=>x.id!==id);state.rpg.rewardLog='你刪除了一筆記錄。';saveLocal();$('dlg').close();render();toast('已刪除記錄')}}
function parseCSVLoose(text){const rows=[];let row=[],field='',q=false;for(let i=0;i<text.length;i++){const c=text[i],n=text[i+1];if(q){if(c==='"'&&n==='"'){field+='"';i++}else if(c==='"'){q=false}else field+=c}else{if(c==='"')q=true;else if(c===','){row.push(field);field=''}else if(c==='\n'){row.push(field);rows.push(row);row=[];field=''}else if(c!=='\r')field+=c}}if(field.length||row.length){row.push(field);rows.push(row)}if(!rows.length)return [];const head=rows[0],out=[];rows.slice(1).forEach(r=>{if(!r.some(Boolean))return;while(r.length<head.length)r.push('');if(r.length>head.length)r=[...r.slice(0,head.length-1),r.slice(head.length-1).join(',')];out.push(Object.fromEntries(head.map((k,i)=>[k,r[i]||'']))) });return out}
function autoExpenseCategory(store,items){
 const t=(store+' '+items.join(' ')).toLowerCase(),rules=[
  ['醫療',['藥局','診所','醫院','掛號','處方']],['服飾',['服飾','uniqlo','襯衫','外套','褲','襪','鞋']],
  ['學習',['課程','學費','教材','教科書','誠品','紀伊國屋']],['日用品',['洗衣精','洗碗精','衛生紙','牙刷','牙膏','洗髮','肥皂','清潔劑']],
  ['訂閱',['apple','google','icloud','netflix','spotify','youtube','訂閱']],['交通',['捷運','台鐵','高鐵','uber','停車','加油']],
  ['娛樂',['電影','影城','遊戲','steam']],['飲料',['茶','咖啡','飲料','鮮奶','拿鐵']],
  ['餐飲',['餐盒','便當','早餐','午餐','晚餐','飯','麵','餐廳','雞腿','壽司','鍋']]
 ];for(const [cat,kws] of rules){if(kws.some(k=>t.includes(k)))return cat}return '其他';
}
async function importCsvFiles(ev){const files=[...ev.target.files];if(!files.length)return;let added=0,updated=0;for(const file of files){const text=(await file.text()).replace(/^\ufeff/,'');const rows=parseCSVLoose(text);const groups={};rows.forEach(r=>{const inv=(r['發票號碼']||'').trim(),d=(r['發票日期']||'').trim();if(inv&&/^\d{8}$/.test(d))(groups[inv]??=[]).push(r)});for(const [inv,rs] of Object.entries(groups)){const d=rs[0]['發票日期'],date=`${d.slice(0,4)}-${d.slice(4,6)}-${d.slice(6,8)}`,store=(rs[0]['賣方名稱']||'未命名店家').trim(),items=rs.map(r=>({name:(r['消費明細_品名']||'未提供品名').trim(),amount:Number(r['消費明細_金額']||r['發票金額']||0)})),amount=items.reduce((s,i)=>s+i.amount,0),id='inv-'+inv,old=state.entries.find(x=>x.id===id),obj={id,type:'expense',date,invoice:inv,store,amount,category:old?.category||autoExpenseCategory(store,items.map(i=>i.name)),payment:old?.payment||'未設定',note:old?.note||'',items,source:'電子發票',comment:old?.comment||null};if(old){state.entries=state.entries.map(x=>x.id===id?obj:x);updated++}else{obj.comment=generateSinnerComment(obj);state.entries.push(obj);added++}}}
if(added){grantXp(added*XP_PER_ENTRY,`匯入發票完成，共新增 ${added} 筆`);grantExplorationActions(added)}else state.rpg.rewardLog=`匯入完成，沒有新增資料。更新了 ${updated} 筆資料。`;checkQuests();saveLocal();render();toast(`匯入完成：新增 ${added} 筆，更新 ${updated} 筆`);ev.target.value=''}
function download(name,content,type){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([content],{type}));a.download=name;a.click()}
function backupJson(){download('終端記錄備份.json',JSON.stringify(state,null,2),'application/json')}
async function restoreJson(ev){const file=ev.target.files?.[0];if(!file)return;try{const parsed=JSON.parse(await file.text());if(!parsed||(!Array.isArray(parsed.entries)&&!Array.isArray(parsed)))throw new Error();if(confirm('確定用這份備份覆蓋目前資料？')){state=migrate(parsed);saveLocal();render();toast('已還原備份')}}catch(e){alert('無法還原：這不是有效的備份 JSON。')}ev.target.value=''}
function clearLocalData(){if(confirm('確定清除這台裝置上的所有記錄與 RPG 進度？此動作無法復原。')){state=defaultState();saveLocal();render();toast('已清除本機資料')}}
function exportCsv(){const rows=filtered();const head=['日期','類型','店家/用途/來源','金額','分類','付款方式','發票號碼','備註','來源'];const body=rows.map(x=>[x.date,x.type==='income'?'收入':'支出',x.store,x.amount,x.category,x.payment,x.invoice||'',x.note||'',x.source||'']);const q=v=>/[",\n]/.test(String(v??''))?`"${String(v).replaceAll('"','""')}"`:String(v??'');const text='\ufeff'+[head,...body].map(r=>r.map(q).join(',')).join('\n');download('終端記錄匯出.csv',text,'text/csv;charset=utf-8')}

const CHART_COLORS=['#b52d2d','#d2cec4','#797b83','#8b7046','#59675d','#715a65','#8f6b6b','#555860','#aaa69c','#6f6251'];
function pieData(rows,keyFn){const map={};rows.forEach(x=>{const k=keyFn(x)||'其他';map[k]=(map[k]||0)+Number(x.amount||0)});return Object.entries(map).sort((a,b)=>b[1]-a[1])}
function setPie(pieId,legendId,data){const pie=$(pieId),legend=$(legendId),total=data.reduce((s,x)=>s+x[1],0);if(!total){pie.style.background='#24262b';legend.innerHTML='<div class="chart-empty">目前沒有資料</div>';return}let acc=0,parts=[];data.forEach(([name,val],i)=>{const start=acc/total*360;acc+=val;const end=acc/total*360;parts.push(`${CHART_COLORS[i%CHART_COLORS.length]} ${start}deg ${end}deg`)});pie.style.background=`conic-gradient(${parts.join(',')})`;legend.innerHTML=data.map(([name,val],i)=>`<div class="legend-row"><span class="legend-dot" style="background:${CHART_COLORS[i%CHART_COLORS.length]}"></span><span>${esc(name)}</span><strong>${money(val)}</strong></div>`).join('')}
function renderCharts(){
  const m=$('month').value||today().slice(0,7), rows=state.entries.filter(x=>x.date.startsWith(m)),incomeRows=rows.filter(x=>x.type==='income'),expenseRows=rows.filter(x=>x.type==='expense');
  const income=incomeRows.reduce((s,x)=>s+x.amount,0),expense=expenseRows.reduce((s,x)=>s+x.amount,0),net=income-expense;
  setPie('incomeExpensePie','incomeExpenseLegend',[['收入',income],['支出',expense]].filter(x=>x[1]>0));
  setPie('expenseCategoryPie','expenseCategoryLegend',pieData(expenseRows,x=>x.category));
  setPie('incomeCategoryPie','incomeCategoryLegend',pieData(incomeRows,x=>x.category));
  $('statsIncome').textContent=money(income);$('statsIncome').style.color='var(--green)';$('statsExpense').textContent=money(expense);$('statsExpense').style.color='var(--red)';$('statsNet').textContent=money(net);$('statsNet').style.color=net<0?'var(--red)':'var(--green)';
  $('statsComment').textContent=income||expense?(net>=0?`本月目前是正淨額 ${money(net)}。繼續維持記錄，就能看清楚金幣流向。`:`本月目前支出高於收入 ${money(Math.abs(net))}。這只是資訊提示，不影響 RPG 獎勵。`):'先建立一些收入／支出檔案索引，就能看到完整分析。';
}

function saveSettings(){state.profile.initialAmount=Number($('initialInput').value||0);state.profile.name='但丁';saveLocal();render();toast('已儲存設定')}
const TAB_LABELS={adventure:'終端',book:'記錄',quests:'任務',explore:'探索',sinners:'罪人管理',backpack:'背包',bestiary:'圖鑑',progress:'成就',commentary:'評議',stats:'統計',settings:'設定'};
function setMainMenuOpen(open){
  const menu=$('mainMenuTabs'),toggle=$('mainMenuToggle');
  if(!menu||!toggle)return;
  menu.classList.toggle('collapsed',!open);
  menu.classList.toggle('open',open);
  menu.setAttribute('aria-hidden',open?'false':'true');
  toggle.setAttribute('aria-expanded',open?'true':'false');
  toggle.classList.toggle('open',open);
}
function toggleMainMenu(){
  const menu=$('mainMenuTabs');
  setMainMenuOpen(menu?menu.classList.contains('collapsed'):true);
}
function setTab(id){
  document.querySelectorAll('.section').forEach(function(el){el.classList.toggle('active',el.id===id)});
  document.querySelectorAll('.tabs button').forEach(function(btn){btn.classList.toggle('active',btn.dataset.tab===id)});
  document.querySelectorAll('.bottom [data-goto]').forEach(function(btn){btn.classList.toggle('active',btn.dataset.goto===id)});
  if($('mainMenuCurrent'))$('mainMenuCurrent').textContent=TAB_LABELS[id]||'主功能';
  setMainMenuOpen(false);
  if(id==='sinners'&&typeof window.forceRenderSinnerManagement==='function'){
    window.forceRenderSinnerManagement();
  }
  if(id==='bestiary'&&typeof window.forceRenderBestiary==='function'){
    window.forceRenderBestiary();
  }
  if(id==='explore'){
    try{renderExploration()}catch(e){console.error('render exploration tab',e)}
    if($('exploreBtn'))$('exploreBtn').onclick=runExploration;
  }
  if(id==='backpack'&&typeof window.forceRenderBackpack==='function')window.forceRenderBackpack();
  if(id==='progress'&&typeof window.forceRenderAchievements==='function')window.forceRenderAchievements();
  if(id==='quests'&&typeof window.forceRenderRpgQuests==='function')window.forceRenderRpgQuests();
  if(id==='stats'&&typeof window.forceRenderStatistics==='function')window.forceRenderStatistics();
  if(id==='book'&&typeof window.forceRenderRecords==='function')window.forceRenderRecords();
}
function drawSprite(kind){
  if(kind==='star')return `<svg viewBox="0 0 64 64" width="44" height="44" aria-hidden="true"><circle cx="32" cy="32" r="23" fill="#1c1d22" stroke="#b52d2d" stroke-width="4"/><path d="M32 16l4 12 12 4-12 4-4 12-4-12-12-4 12-4z" fill="#d6d2c7"/></svg>`;
  if(kind==='hero')return `<svg viewBox="0 0 80 80" width="74" height="74" aria-label="但丁時鐘頭像">
    <rect x="28" y="4" width="24" height="10" rx="2" fill="#303138" stroke="#777983" stroke-width="3"/>
    <circle cx="40" cy="40" r="28" fill="#202126" stroke="#8e3f45" stroke-width="5"/>
    <circle cx="40" cy="40" r="21" fill="#d7d0bf" stroke="#5d5f67" stroke-width="3"/>
    <g stroke="#37383e" stroke-width="2">
      <path d="M40 21v5M40 54v5M21 40h5M54 40h5"/>
      <path d="M27 27l4 4M49 49l4 4M53 27l-4 4M31 49l-4 4"/>
    </g>
    <circle cx="40" cy="40" r="3.5" fill="#8e3f45"/>
    <path d="M40 40V27M40 40l10 7" stroke="#8e3f45" stroke-width="3.5" stroke-linecap="round"/>
    <path d="M26 65l-8 9M54 65l8 9" stroke="#6f7078" stroke-width="4" stroke-linecap="round"/>
  </svg>`;
  if(kind==='slime')return `<svg viewBox="0 0 64 64" width="70" height="70"><path d="M14 40c0-15 9-24 18-24s18 9 18 24c0 7-5 12-11 12H25c-6 0-11-5-11-12z" fill="#c7c3b8" stroke="#666870" stroke-width="3"/><circle cx="25" cy="35" r="3" fill="#1b1c20"/><circle cx="39" cy="35" r="3" fill="#1b1c20"/><path d="M26 44c4 3 8 3 12 0" stroke="#b52d2d" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg>`;
  return ''
}
function npcSprite(kind){
  const art={
    clerk:`<svg viewBox="0 0 64 64" width="64" height="64"><rect x="18" y="8" width="28" height="18" fill="#d8d3c7" stroke="#666870" stroke-width="3"/><rect x="20" y="28" width="24" height="20" fill="#2a2b31" stroke="#7a7b84" stroke-width="3"/><path d="M22 38h20" stroke="#b52d2d" stroke-width="3"/><circle cx="28" cy="18" r="2.5" fill="#15161a"/><circle cx="36" cy="18" r="2.5" fill="#15161a"/></svg>`,
    merchant:`<svg viewBox="0 0 64 64" width="64" height="64"><rect x="17" y="9" width="30" height="17" fill="#cfc8b6" stroke="#666870" stroke-width="3"/><rect x="20" y="28" width="24" height="22" fill="#322a22" stroke="#7b6647" stroke-width="3"/><path d="M20 12h24" stroke="#a98b4d" stroke-width="3"/><circle cx="28" cy="18" r="2.5" fill="#15161a"/><circle cx="37" cy="18" r="2.5" fill="#15161a"/></svg>`,
    fairy:`<svg viewBox="0 0 64 64" width="64" height="64"><circle cx="32" cy="20" r="10" fill="#dedad1" stroke="#6c6d73" stroke-width="3"/><path d="M22 40c3-7 17-7 20 0v10H22z" fill="#292b32" stroke="#767882" stroke-width="3"/><path d="M18 28l8 6M46 28l-8 6" stroke="#b52d2d" stroke-width="3"/><circle cx="28" cy="20" r="2.2" fill="#15161a"/><circle cx="36" cy="20" r="2.2" fill="#15161a"/></svg>`
  };
  return art[kind]||art.clerk
}
function mapIcon(kind){
  const icons={
    book:`<svg viewBox="0 0 64 64" width="38" height="38"><rect x="14" y="12" width="36" height="40" fill="#d4d0c5" stroke="#5f6067" stroke-width="3"/><path d="M24 12v40" stroke="#8b8d96" stroke-width="3"/></svg>`,
    quest:`<svg viewBox="0 0 64 64" width="38" height="38"><rect x="18" y="10" width="28" height="42" fill="#d4d0c5" stroke="#5f6067" stroke-width="3"/><path d="M24 22h16M24 30h16M24 38h10" stroke="#b52d2d" stroke-width="3"/></svg>`,
    bank:`<svg viewBox="0 0 64 64" width="38" height="38"><rect x="14" y="22" width="36" height="26" fill="#24262d" stroke="#7a6c51" stroke-width="3"/><path d="M12 22l20-10 20 10" fill="none" stroke="#a98b4d" stroke-width="3"/></svg>`,
    home:`<svg viewBox="0 0 64 64" width="38" height="38"><path d="M14 28l18-14 18 14v22H14z" fill="#24262d" stroke="#7a7b84" stroke-width="3"/><path d="M27 50V34h10v16" stroke="#b52d2d" stroke-width="3"/></svg>`
  };
  return `<div style="display:grid;place-items:center">${icons[kind]||icons.book}</div>`
}
function mountIcons(){
  if($('logo'))$('logo').innerHTML=drawSprite('star');
  if($('heroIcon'))$('heroIcon').innerHTML=drawSprite('hero');
  if($('npcClerk'))$('npcClerk').innerHTML=npcSprite('clerk');
  if($('npcMerchant'))$('npcMerchant').innerHTML=npcSprite('merchant');
}
if($('mainMenuToggle'))$('mainMenuToggle').onclick=toggleMainMenu;
document.querySelectorAll('[data-language]').forEach(function(btn){btn.onclick=function(){setLanguage(btn.dataset.language)}});if($('currencySelect'))$('currencySelect').addEventListener('change',function(){setCurrency(this.value)});
$('etype').addEventListener('change',syncEntryTypeUI);document.querySelectorAll('[data-entry-type]').forEach(b=>b.onclick=()=>{$('etype').value=b.dataset.entryType;syncEntryTypeUI()});$('dlg').addEventListener('click',e=>{if(e.target===$('dlg'))$('dlg').close()});$('ecat').addEventListener('change',renderQuickCats);
$('save').onclick=()=>saveEntry(false);$('saveAgain').onclick=()=>saveEntry(true);$('closeDlg').onclick=()=>$('dlg').close();$('closeCommentDlg').onclick=()=>$('commentDlg').close();$('commentViewTime').onclick=()=>setCommentaryView('time');$('commentViewSinner').onclick=()=>setCommentaryView('sinner');$('goCommentArchive').onclick=()=>{$('commentDlg').close();setTab('commentary')};$('del').onclick=deleteEntry;$('csv').addEventListener('change',importCsvFiles);$('export').onclick=exportCsv;$('backup').onclick=backupJson;$('restore').addEventListener('change',restoreJson);$('clear').onclick=clearLocalData;$('saveSettings').onclick=saveSettings;if($('exploreBtn'))$('exploreBtn').onclick=runExploration;$('addExpense').onclick=()=>openEdit('', 'expense');$('addIncome').onclick=()=>openEdit('', 'income');$('fab').onclick=()=>openEdit('', 'expense');$('bottomAdd').onclick=()=>openEdit('', 'expense');['month','typeFilter','cat','search'].forEach(id=>$(id).addEventListener('input',render));if($('openItemBox'))$('openItemBox').onclick=openItemBox;document.querySelectorAll('.tabs button').forEach(btn=>btn.onclick=()=>setTab(btn.dataset.tab));document.querySelectorAll('[data-goto]').forEach(btn=>btn.onclick=()=>setTab(btn.dataset.goto));if(!$('month').value){$('month').value=today().slice(0,7)}mountIcons();render();setupIphoneSafariInput();setupLanguageObserver();


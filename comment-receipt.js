/* Local PNG renderer: no uploads or third-party image dependencies. */
(function(){
  'use strict';
  const crumpledPaper=new Image();
  const crumpledPaperReady=new Promise(resolve=>{crumpledPaper.onload=()=>resolve(true);crumpledPaper.onerror=()=>resolve(false)});
  crumpledPaper.src='receipt-crumpled-paper.svg?v=20261008p1';
  const dialog=document.createElement('dialog');
  dialog.id='receiptDialog';dialog.setAttribute('aria-labelledby','receiptTitle');
  dialog.innerHTML='<div class="receipt-shell"><header class="receipt-header"><div><h2 id="receiptTitle">製作評議收據</h2><p>熱感紙樣式 · PNG 圖片</p></div><button type="button" data-receipt-close aria-label="關閉收據預覽">×</button></header><div class="receipt-scroll"><div class="receipt-options"><label><input type="checkbox" id="receiptDetails" checked>包含記帳明細</label><details><summary>選擇要印出的評議 <span id="receiptCount"></span></summary><div class="receipt-line-picker" id="receiptLinePicker"></div><div class="receipt-selection"><button type="button" data-receipt-all>全選</button><button type="button" data-receipt-none>清空</button></div></details></div><p id="receiptStatus" role="status" aria-live="polite"></p><div id="receiptPreview" class="receipt-preview"></div><p class="receipt-help">圖片由本機產生。iPhone 可用「分享／儲存」選擇儲存影像；長篇評議會自動分張。</p></div><footer class="receipt-footer"><button type="button" id="receiptShare">分享／儲存</button><button type="button" class="primary" id="receiptDownload">下載 PNG</button></footer></div>';
  document.body.appendChild(dialog);
  const el=id=>document.getElementById(id);
  let current=null,selected=new Set(),pages=[],generation=0,currentComment=null;
  const originalCard=commentEntryCard;
  commentEntryCard=function(entry,opts){
    const html=originalCard(entry,opts);if(!html)return html;
    const button='<div class="receipt-card-action"><button type="button" data-receipt-entry="'+esc(entry.id)+'" data-receipt-sinner="'+esc(opts&&opts.sinner||'')+'">製作收據</button></div>';
    return html.slice(0,-6)+button+'</div>';
  };
  const originalShow=showSinnerComment;
  showSinnerComment=function(comment){currentComment=comment;originalShow(comment)};
  const liveButton=document.createElement('button');liveButton.type='button';liveButton.textContent='製作收據';
  liveButton.onclick=()=>{
    const entry=state.entries.find(e=>e.comment===currentComment);
    if(entry)open(entry,'');else toast('請從評議記錄選擇要製作的收據');
  };
  document.querySelector('.comment-dialog-actions').prepend(liveButton);
  document.addEventListener('click',e=>{
    const button=e.target.closest('[data-receipt-entry]');if(!button)return;
    const entry=state.entries.find(x=>String(x.id)===button.dataset.receiptEntry);
    if(entry)open(entry,button.dataset.receiptSinner);
  });
  function open(entry,sinner){
    current=JSON.parse(JSON.stringify(entry));
    selected=new Set(current.comment.lines.map((l,i)=>i).filter(i=>!sinner||sinnerForLineSpeaker(current.comment.lines[i].speaker)===sinner||(sinner==='良秀'&&current.comment.kind==='araya')));
    el('receiptDetails').checked=true;
    el('receiptLinePicker').innerHTML=current.comment.lines.map((l,i)=>'<label><input type="checkbox" data-receipt-line="'+i+'" '+(selected.has(i)?'checked':'')+'><span><b>'+esc(l.speaker||'旁白')+(l.kind==='action'?' · 動作／旁白':'')+'</b><span>'+esc(l.text)+'</span></span></label>').join('');
    dialog.showModal();dialog.querySelector('.receipt-scroll').scrollTop=0;refresh();
  }
  dialog.querySelector('[data-receipt-close]').onclick=()=>dialog.close();
  dialog.addEventListener('close',()=>{generation++;release();current=null;el('receiptPreview').replaceChildren()});
  el('receiptDetails').onchange=refresh;
  el('receiptLinePicker').onchange=e=>{const i=Number(e.target.dataset.receiptLine);e.target.checked?selected.add(i):selected.delete(i);refresh()};
  for(const action of ['all','none'])dialog.querySelector('[data-receipt-'+action+']').onclick=()=>{
    selected=action==='all'?new Set(current.comment.lines.map((_,i)=>i)):new Set();
    el('receiptLinePicker').querySelectorAll('input').forEach(x=>x.checked=selected.has(Number(x.dataset.receiptLine)));refresh();
  };
  function release(){pages.forEach(p=>URL.revokeObjectURL(p.url));pages=[]}
  function filename(i){return '罪人評議收據_'+String(current.date||'').replace(/[^\d-]/g,'')+'_'+String(current.id||'').replace(/[^a-zA-Z0-9]/g,'').slice(-8)+(pages.length>1?'_'+String(i+1).padStart(2,'0'):'')+'.png'}
  el('receiptDownload').onclick=()=>{
    pages.forEach((p,i)=>{const a=document.createElement('a');a.href=p.url;a.download=filename(i);document.body.appendChild(a);a.click();a.remove()});
    el('receiptStatus').textContent='已交給瀏覽器下載；也可長按預覽圖片儲存。';
  };
  el('receiptShare').onclick=async()=>{
    const files=pages.map((p,i)=>new File([p.blob],filename(i),{type:'image/png'}));
    if(!navigator.canShare||!navigator.canShare({files})){el('receiptDownload').click();return}
    try{await navigator.share({files,title:'罪人評議收據'})}catch(e){if(e.name!=='AbortError')el('receiptStatus').textContent='分享未完成，請使用下載 PNG 或長按預覽儲存。'}
  };
  async function refresh(){
    const run=++generation;release();el('receiptPreview').replaceChildren();
    const count=selected.size;el('receiptCount').textContent='（'+count+'／'+current.comment.lines.length+'）';
    el('receiptDownload').disabled=el('receiptShare').disabled=true;
    if(!count){el('receiptStatus').textContent='請至少選擇一段評議。';return}
    el('receiptStatus').textContent='正在排印…';
    try{
      await document.fonts.ready;
      if(themeFor(current,selected)?.surface==='crumpled')await crumpledPaperReady;
      if(run!==generation)return;
      const canvases=render(current,selected,el('receiptDetails').checked);
      for(const canvas of canvases){
        const blob=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error('PNG 產生失敗')),'image/png'));
        if(run!==generation)return;
        const url=URL.createObjectURL(blob);pages.push({blob,url});const img=document.createElement('img');img.src=url;img.alt='罪人評議收據，第 '+pages.length+' 張';el('receiptPreview').appendChild(img);
        if(canvases.length>1){const link=document.createElement('a');link.href=url;link.download='罪人評議收據_'+String(current.date||'')+'_'+String(pages.length).padStart(2,'0')+'.png';link.textContent='下載第 '+pages.length+' 張';el('receiptPreview').appendChild(link);}
      }
      el('receiptDownload').disabled=false;el('receiptShare').disabled=false;
      const theme=themeFor(current,selected);el('receiptStatus').textContent=(theme?'已套用'+theme.sinner+'的「'+theme.name+'」風格。':'')+(pages.length>1?'收據已分成 '+pages.length+' 張，下載時會依序儲存。':'收據已準備好。');
    }catch(e){if(run===generation){release();el('receiptPreview').replaceChildren();el('receiptStatus').textContent='圖片產生失敗，請重新選擇評議再試一次。'}}
  }
  // Personality-inspired graphic treatments, never replacement dialogue.
  const THEMES={
    '李箱':{surface:'manuscript',name:'手稿筆記',paper:'#f8f8f3',ink:'#34383a',family:'serif',pad:58,gap:28,dash:[2,7],header:'觀測手札',mark:'01 / OBSERVATION',border:false},
    '浮士德':{surface:'laboratory',name:'實驗紀錄',paper:'#fafafa',ink:'#303238',family:'mono',pad:46,gap:16,dash:[9,3],header:'分析紀錄',mark:'02 / ANALYSIS',border:true},
    '堂吉訶德':{surface:'handmade',name:'貼紙手札',paper:'#fcfaf1',ink:'#494235',family:'serif',pad:48,gap:20,dash:[6,3],header:'騎士行動紀錄',mark:'03 / QUEST',border:true},
    '良秀':{surface:'burnt',name:'焦痕短箋',paper:'#faf8f5',ink:'#3d2929',family:'serif',pad:60,gap:32,dash:[],header:'評議短箋',mark:'04 / R.',border:false},
    '默爾索':{surface:'typewriter',name:'打字機單據',paper:'#f9fafb',ink:'#28323b',family:'mono',pad:42,gap:14,dash:[],header:'作業紀錄單',mark:'05 / REPORT',border:true},
    '鴻璐':{name:'雅緻便箋',paper:'#f7faf7',ink:'#29433f',family:'serif',pad:58,gap:26,dash:[1,5],header:'隨筆留存',mark:'06 / MEMO',border:false},
    '希斯克利夫':{surface:'crumpled',name:'揉皺票根',paper:'#f8f5f0',ink:'#3f3336',family:'mono',pad:68,gap:18,dash:[15,5],header:'現場記錄',mark:'07 / FIELD',border:true,weight:600},
    '以實瑪利':{surface:'nautical',name:'航海圖與羅盤',paper:'#faf8f2',ink:'#3f3b32',family:'mono',pad:46,gap:20,dash:[10,4,2,4],header:'航路記錄單',mark:'08 / LOG',border:true},
    '羅佳':{name:'生活小票',paper:'#fcf7f3',ink:'#4a3335',family:'sans',pad:48,gap:24,dash:[4,5],header:'今日小記',mark:'09 / DAILY',border:false},
    '辛克萊':{surface:'student',name:'學生筆記本',paper:'#f8faf4',ink:'#344034',family:'serif',pad:54,gap:24,dash:[2,4],header:'個人筆記',mark:'11 / NOTES',border:false},
    '奧提斯':{surface:'operations',name:'作戰紀錄',paper:'#f9f9f2',ink:'#3b4030',family:'mono',pad:42,gap:16,dash:[12,3],header:'作戰紀錄',mark:'12 / OPERATIONS',border:true,weight:600},
    '格里高爾':{name:'日常留存單',paper:'#f8f6f0',ink:'#423c32',family:'sans',pad:50,gap:22,dash:[7,5],header:'日常記錄單',mark:'13 / RECORD',border:false}
  };
  function themeFor(entry,chosen){
    const names=new Set();
    entry.comment.lines.forEach((line,i)=>{if(!chosen.has(i))return;const name=sinnerForLineSpeaker(line.speaker||'');if(THEMES[name])names.add(name)});
    if(names.size!==1)return null;
    const sinner=[...names][0];return {...THEMES[sinner],sinner};
  }
  function charredEdge(v,phase){
    const hash=n=>{const x=Math.sin(n*127.1+phase*311.7)*43758.5453;return x-Math.floor(x)};
    const noise=scale=>{const t=v/scale,n=Math.floor(t),f=t-n;return hash(n)*(1-f)+hash(n+1)*f};
    return 3+noise(91)*15+noise(23)*7+noise(3)*3;
  }
  function paintPaper(ctx,W,H,P,theme,entry){
    if(theme.surface==='crumpled'&&crumpledPaper.complete&&crumpledPaper.naturalWidth)return;
    ctx.save();const kind=theme.surface;
    let seed=Array.from(String(entry.id||'paper')).reduce((v,c)=>(Math.imul(v,31)+c.charCodeAt(0))>>>0,7123);
    const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
    if(['manuscript','student','handmade'].includes(kind)){
      ctx.strokeStyle=kind==='student'?'rgba(66,105,154,.13)':'rgba(100,95,72,.08)';ctx.lineWidth=1;
      for(let y=80;y<H-30;y+=kind==='student'?38:46){ctx.beginPath();ctx.moveTo(20,y);ctx.lineTo(W-20,y);ctx.stroke()}
      if(kind==='student'){ctx.strokeStyle='rgba(170,71,65,.2)';ctx.beginPath();ctx.moveTo(29,28);ctx.lineTo(29,H-28);ctx.stroke();}
      ctx.strokeStyle='rgba(60,62,55,.13)';
      for(let y=380;y<H-80;y+=210){ctx.beginPath();ctx.moveTo(W-P+13,y);ctx.bezierCurveTo(W-P+32,y-12,W-P+5,y+25,W-P+22,y+29);ctx.stroke()}
    }
    if(kind==='laboratory'){
      ctx.strokeStyle='rgba(64,91,110,.07)';ctx.lineWidth=1;
      for(let x=16;x<W;x+=24){ctx.beginPath();ctx.moveTo(x,18);ctx.lineTo(x,H-18);ctx.stroke()}
      for(let y=18;y<H;y+=24){ctx.beginPath();ctx.moveTo(14,y);ctx.lineTo(W-14,y);ctx.stroke()}
    }
    if(kind==='nautical'){
      // A restrained, fictional nautical chart behind the receipt text.
      ctx.strokeStyle='rgba(80,115,126,.10)';ctx.lineWidth=.7;
      for(let x=28;x<W;x+=88){ctx.beginPath();ctx.moveTo(x,18);ctx.lineTo(x,H-18);ctx.stroke()}
      for(let y=30;y<H;y+=88){ctx.beginPath();ctx.moveTo(14,y);ctx.lineTo(W-14,y);ctx.stroke()}
      const chartSeed=random()*Math.PI*2;
      function coast(cx,cy,rx,ry,phase,scale){
        const points=[];
        for(let n=0;n<72;n++){const angle=n*Math.PI/36,r=1+.17*Math.sin(angle*3+phase)+.09*Math.sin(angle*7-phase)+.055*Math.cos(angle*13+phase);points.push({x:cx+Math.cos(angle)*rx*r*scale,y:cy+Math.sin(angle)*ry*r*scale})}
        ctx.beginPath();const last=points[points.length-1],first=points[0];ctx.moveTo((last.x+first.x)/2,(last.y+first.y)/2);
        for(let n=0;n<points.length;n++){const p=points[n],q=points[(n+1)%points.length];ctx.quadraticCurveTo(p.x,p.y,(p.x+q.x)/2,(p.y+q.y)/2)}ctx.closePath();
      }
      const islands=[[-10,H*.26,133,178,chartSeed],[W+22,H*.66,160,225,chartSeed+2],[W*.75,H*.17,55,92,chartSeed+1],[W*.23,H*.83,42,65,chartSeed+3],[W*.8,H*.88,26,42,chartSeed+4]];
      for(const island of islands){
        ctx.strokeStyle='rgba(93,125,132,.11)';ctx.lineWidth=.8;
        for(const scale of [1.12,1.23,1.35]){coast(...island,scale);ctx.stroke()}
        coast(...island,1);ctx.fillStyle='rgba(157,142,101,.095)';ctx.fill();ctx.strokeStyle='rgba(92,106,90,.25)';ctx.lineWidth=1.15;ctx.stroke();
        coast(...island,.82);ctx.strokeStyle='rgba(118,114,85,.10)';ctx.lineWidth=.7;ctx.stroke();
      }
      // Rhumb lines, depth soundings, and a dotted course give the chart its maritime detail.
      const ox=75,oy=H*.64;ctx.strokeStyle='rgba(122,104,65,.065)';ctx.lineWidth=.6;
      for(let n=0;n<16;n++){const angle=n*Math.PI/8;ctx.beginPath();ctx.moveTo(ox,oy);ctx.lineTo(ox+Math.cos(angle)*H,oy+Math.sin(angle)*H);ctx.stroke()}
      ctx.fillStyle='rgba(69,104,116,.20)';ctx.font='italic 11px Georgia, serif';ctx.textAlign='center';
      for(let n=0;n<30;n++){const x=25+random()*(W-50),y=160+random()*(H-200);ctx.fillText(String(12+Math.floor(random()*88)),x,y)}
      ctx.font='italic 16px Georgia, serif';ctx.fillStyle='rgba(69,104,116,.16)';ctx.fillText('N O R T H   S E A',W*.5,H*.42);
      ctx.strokeStyle='rgba(133,83,62,.19)';ctx.lineWidth=1;ctx.setLineDash([3,6]);ctx.beginPath();ctx.moveTo(65,H*.9);ctx.bezierCurveTo(W*.7,H*.82,W*.22,H*.56,W*.68,H*.3);ctx.stroke();ctx.setLineDash([]);
      for(const [x,y] of [[65,H*.9],[W*.68,H*.3]]){ctx.beginPath();ctx.arc(x,y,3,0,Math.PI*2);ctx.stroke()}
    }
    if(kind==='crumpled'){
      // Independent, uneven bends in a continuous paper surface, with quiet flat areas.
      const w=320,h=Math.ceil(H/2),heights=new Float32Array(w*h);
      const phase=random()*6.28;
      for(let y=0;y<h;y++)for(let x=0;x<w;x++)heights[y*w+x]=3.1*Math.sin(x*.028+y*.017+phase)+1.4*Math.sin(x*.013-y*.039+phase*2);
      const count=Math.ceil(H/48);
      for(let n=0;n<count;n++){
        const x=random()*w,y=random()*h,angle=random()*Math.PI*2,length=18+random()*74,
          bend=(random()-.5)*24,width=.8+random()*5.8,amplitude=(random()>.25?1:-1)*(1.8+random()*3.4),
          dx=Math.cos(angle),dy=Math.sin(angle),points=[];
        for(let k=0;k<=6;k++){const t=k/6,curve=Math.sin(t*Math.PI)*bend;points.push({x:x+dx*length*t-dy*curve,y:y+dy*length*t+dx*curve})}
        const minX=Math.max(0,Math.floor(Math.min(...points.map(p=>p.x))-width*4)),maxX=Math.min(w-1,Math.ceil(Math.max(...points.map(p=>p.x))+width*4)),
          minY=Math.max(0,Math.floor(Math.min(...points.map(p=>p.y))-width*4)),maxY=Math.min(h-1,Math.ceil(Math.max(...points.map(p=>p.y))+width*4));
        for(let py=minY;py<=maxY;py++)for(let px=minX;px<=maxX;px++){
          let distance=Infinity,progress=0;
          for(let k=0;k<6;k++){const a=points[k],b=points[k+1],vx=b.x-a.x,vy=b.y-a.y,t=Math.max(0,Math.min(1,((px-a.x)*vx+(py-a.y)*vy)/(vx*vx+vy*vy))),d=Math.hypot(px-a.x-vx*t,py-a.y-vy*t);if(d<distance){distance=d;progress=(k+t)/6}}
          const taper=Math.pow(Math.sin(progress*Math.PI),.65),localWidth=width*(.6+.7*Math.sin(progress*Math.PI));
          heights[py*w+px]+=amplitude*taper*Math.exp(-distance*distance/(2*localWidth*localWidth));
        }
      }
      const relief=document.createElement('canvas');relief.width=w;relief.height=h;const rc=relief.getContext('2d'),pixels=rc.createImageData(w,h);
      for(let y=0;y<h;y++)for(let x=0;x<w;x++){
        const i=y*w+x,left=heights[y*w+Math.max(0,x-1)],right=heights[y*w+Math.min(w-1,x+1)],up=heights[Math.max(0,y-1)*w+x],down=heights[Math.min(h-1,y+1)*w+x];
        const slope=(right-left)*.65+(down-up)*.8;
        const light=Math.max(-28,Math.min(8,-slope*15))+(random()-.5)*1.2;
        pixels.data[i*4]=246+light;pixels.data[i*4+1]=244+light;pixels.data[i*4+2]=239+light;pixels.data[i*4+3]=255;
      }
      rc.putImageData(pixels,0,0);ctx.drawImage(relief,0,0,W,H);
    }
    if(kind==='operations'){
      ctx.strokeStyle='rgba(72,81,51,.10)';ctx.lineWidth=.8;ctx.strokeRect(22,22,W-44,H-44);
      ctx.beginPath();ctx.moveTo(34,220);ctx.lineTo(34,H-34);ctx.moveTo(W-34,220);ctx.lineTo(W-34,H-34);ctx.stroke();
      for(let y=260;y<H-40;y+=58){ctx.beginPath();ctx.moveTo(24,y);ctx.lineTo(W-24,y);ctx.stroke()}
      ctx.save();ctx.translate(W-95,H-85);ctx.rotate(-.12);ctx.strokeStyle='rgba(104,53,40,.28)';ctx.fillStyle='rgba(104,53,40,.28)';ctx.lineWidth=2;ctx.strokeRect(-65,-17,130,34);ctx.font='bold 15px monospace';ctx.textAlign='center';ctx.fillText('REVIEWED',0,5);ctx.restore();
      ctx.font='10px monospace';ctx.fillStyle='rgba(72,81,51,.35)';ctx.fillText('LCB / FIELD OPERATIONS',30,17);
    }
    if(kind==='burnt'){
      // Shade the folds on a separate layer, then soften the paper relief once.
      const paperContext=ctx,relief=document.createElement('canvas');relief.width=W;relief.height=H;ctx=relief.getContext('2d');
      ctx.save();const rowCount=Math.ceil(H/130),points=[];
      for(let row=0;row<=rowCount;row++){const list=[];for(let col=0;col<=5;col++)list.push({x:col*W/5+(col>0&&col<5?(random()-.5)*94:0),y:row*H/rowCount+(row>0&&row<rowCount?(random()-.5)*90:0)});points.push(list)}
      function facet(a,b,c){ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.lineTo(c.x,c.y);ctx.closePath();const gradient=ctx.createLinearGradient(a.x,a.y,c.x,c.y);const strength=kind==='crumpled'?.12:.065;gradient.addColorStop(0,'rgba(74,62,42,'+(random()*strength)+')');gradient.addColorStop(.45,'rgba(230,220,196,0)');gradient.addColorStop(1,'rgba(255,255,255,'+(random()*.6)+')');ctx.fillStyle=gradient;ctx.fill();}
      for(let row=0;row<rowCount;row++)for(let col=0;col<5;col++){const a=points[row][col],b=points[row][col+1],c=points[row+1][col],d=points[row+1][col+1];facet(a,b,d);facet(a,c,d);}
      ctx.restore();
      for(let n=0;n<(kind==='crumpled'?85:18);n++){
        const x=random()*W,y=random()*H,dx=(random()-.5)*170,dy=(random()-.5)*170;
        ctx.save();ctx.lineWidth=2+random()*7;ctx.strokeStyle='rgba(50,43,32,'+(kind==='crumpled'?.075:.04)+')';ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x+dx*.4+10,y+dy*.5,x+dx,y+dy);ctx.stroke();
        ctx.restore();ctx.lineWidth=.6;ctx.strokeStyle='rgba(255,255,255,.42)';ctx.beginPath();ctx.moveTo(x+2,y-2);ctx.quadraticCurveTo(x+dx*.4+12,y+dy*.5-2,x+dx+2,y+dy-2);ctx.stroke();
      }
      const shade=ctx.createLinearGradient(0,0,W,0);shade.addColorStop(0,'rgba(72,58,35,.22)');shade.addColorStop(.07,'rgba(72,58,35,0)');shade.addColorStop(.92,'rgba(72,58,35,0)');shade.addColorStop(1,'rgba(72,58,35,.18)');ctx.fillStyle=shade;ctx.fillRect(0,0,W,H);
      ctx=paperContext;ctx.save();ctx.filter='blur(2px)';ctx.drawImage(relief,0,0);ctx.restore();
    }
    if(kind==='burnt'){
      // Narrow charcoal crust with a mottled heat stain and brittle, chipped rim.
      function burnBand(v,phase,vertical,far){
        const edge=charredEdge(v,phase),width=13+9*Math.sin(v*.013+phase)+8*Math.sin(v*.041+phase*.7);
        const depth=edge+Math.max(9,width),start=far?(vertical?W:H):0;
        const gradient=vertical?ctx.createLinearGradient(start,0,far?W-depth:depth,0):ctx.createLinearGradient(0,start,0,far?H-depth:depth);
        gradient.addColorStop(0,'#100e0c');gradient.addColorStop(Math.min(.65,(edge+3)/depth),'#1d1712');
        gradient.addColorStop(Math.min(.81,(edge+7)/depth),'rgba(85,43,17,.94)');gradient.addColorStop(.88,'rgba(167,104,42,.42)');gradient.addColorStop(1,'rgba(193,151,83,0)');
        ctx.fillStyle=gradient;
        if(vertical)ctx.fillRect(far?W-depth:0,v,depth,1);else ctx.fillRect(v,far?H-depth:0,1,depth);
      }
      for(let y=0;y<H;y++){burnBand(y,0,true,false);burnBand(y,1,true,true)}
      for(let x=0;x<W;x++){burnBand(x,2,false,false);burnBand(x,3,false,true)}
      // Carbon flecks and short branching fractures stay outside the text area.
      for(let n=0;n<(W+H)*.9;n++){
        const side=n%4,vertical=side<2,far=side===1||side===3,v=random()*(vertical?H:W),phase=side,
          d=charredEdge(v,phase)+random()*11,x=vertical?(far?W-d:d):v,y=vertical?v:(far?H-d:d);
        ctx.fillStyle=random()>.35?'rgba(9,7,5,.55)':'rgba(206,183,145,.3)';
        ctx.fillRect(x,y,.5+random()*1.7,.5+random()*2);
        if(n%11===0){ctx.strokeStyle='rgba(5,4,3,.7)';ctx.lineWidth=.55;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+(vertical?4:2),y+(vertical?2:4));ctx.lineTo(x+(vertical?7:0),y+(vertical?0:7));ctx.stroke()}
      }
    }
    if(kind==='typewriter'){ctx.strokeStyle='rgba(80,70,55,.045)';for(let y=20;y<H;y+=3){ctx.beginPath();ctx.moveTo(10,y);ctx.lineTo(W-10,y);ctx.stroke()}}
    ctx.restore();
  }
  function paintEmblem(ctx,W,P,y,theme){
    ctx.save();ctx.translate(W/2,y+36);ctx.strokeStyle=theme.ink;ctx.fillStyle=theme.ink;ctx.lineWidth=1;ctx.font='16px "KaiTi", serif';ctx.textAlign='center';ctx.textBaseline='middle';
    const kind=theme.surface;
    if(kind==='nautical'){
      ctx.beginPath();ctx.arc(0,0,29,0,Math.PI*2);ctx.arc(0,0,22,0,Math.PI*2);ctx.stroke();
      for(let n=0;n<8;n++){ctx.save();ctx.rotate(n*Math.PI/4);ctx.beginPath();ctx.moveTo(0,-27);ctx.lineTo(5,0);ctx.lineTo(0,13);ctx.lineTo(-5,0);ctx.closePath();ctx.stroke();ctx.restore()}ctx.font='12px monospace';ctx.fillText('N',0,-36);ctx.fillText('S',0,36);ctx.fillText('W',-38,0);ctx.fillText('E',38,0);
    }else if(kind==='operations'){
      ctx.lineWidth=1.5;ctx.strokeRect(-122,-28,244,56);ctx.beginPath();ctx.moveTo(-75,-28);ctx.lineTo(-75,28);ctx.moveTo(-75,0);ctx.lineTo(122,0);ctx.stroke();
      ctx.font='bold 22px monospace';ctx.fillText('LCB',-99,0);ctx.font='bold 12px monospace';ctx.fillText('OPERATIONS LOG',23,-13);ctx.font='11px monospace';ctx.fillText('UNIT 12 / FIELD REPORT',23,14);
    }else if(kind==='laboratory'){
      ctx.strokeRect(-70,-24,140,48);ctx.beginPath();ctx.moveTo(-52,-17);ctx.lineTo(-52,3);ctx.lineTo(-65,18);ctx.lineTo(-35,18);ctx.lineTo(-47,3);ctx.lineTo(-47,-17);ctx.moveTo(-60,10);ctx.lineTo(-40,10);ctx.stroke();ctx.font='14px monospace';ctx.fillText('LAB / 02',15,-7);ctx.fillText('OBSERVATION',15,11);
    }else if(kind==='handmade'){
      // White die-cut collage stickers inspired by the supplied black-and-white badge.
      function sticker(x,angle,draw){ctx.save();ctx.translate(x,0);ctx.rotate(angle);ctx.shadowColor='rgba(0,0,0,.2)';ctx.shadowBlur=3;ctx.shadowOffsetY=2;ctx.fillStyle='#f8f7ef';ctx.beginPath();ctx.moveTo(-32,-30);ctx.lineTo(26,-30);ctx.lineTo(32,-24);ctx.lineTo(32,26);ctx.lineTo(-25,30);ctx.lineTo(-33,22);ctx.closePath();ctx.fill();ctx.shadowColor='transparent';ctx.strokeStyle='#242320';ctx.lineWidth=1.4;ctx.strokeRect(-27,-24,52,48);ctx.fillStyle='#242320';draw();ctx.restore()}
      sticker(-88,-.22,()=>{ctx.beginPath();ctx.ellipse(0,-5,18,17,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#f8f7ef';ctx.beginPath();ctx.ellipse(-7,-6,4,6,-.2,0,Math.PI*2);ctx.ellipse(7,-6,4,6,.2,0,Math.PI*2);ctx.fill();ctx.fillStyle='#242320';ctx.fillRect(-10,8,20,11);ctx.fillStyle='#f8f7ef';for(let n=0;n<4;n++)ctx.fillRect(-8+n*5,10,2,6);ctx.strokeStyle='#242320';ctx.beginPath();ctx.moveTo(-21,20);ctx.lineTo(20,26);ctx.moveTo(-19,27);ctx.lineTo(20,19);ctx.stroke()});
      sticker(84,.2,()=>{ctx.font='bold 25px serif';ctx.fillText('★',0,-5);ctx.font='bold 8px monospace';ctx.fillText('ADVENTURE',0,16);ctx.beginPath();ctx.moveTo(-22,-19);ctx.lineTo(-15,-19);ctx.moveTo(15,21);ctx.lineTo(22,21);ctx.stroke()});
      sticker(-9,.08,()=>{ctx.beginPath();ctx.moveTo(-10,16);ctx.lineTo(-7,-12);ctx.lineTo(5,-18);ctx.lineTo(15,-8);ctx.lineTo(7,-3);ctx.lineTo(14,4);ctx.lineTo(7,18);ctx.closePath();ctx.stroke();ctx.beginPath();ctx.moveTo(-20,18);ctx.lineTo(21,18);ctx.moveTo(-6,-13);ctx.lineTo(-16,-22);ctx.moveTo(-16,-22);ctx.lineTo(2,-17);ctx.stroke();ctx.font='bold 8px monospace';ctx.fillText('HERO',0,24)});
    }else if(kind==='student'){
      ctx.fillText('重點筆記',0,-10);ctx.beginPath();ctx.moveTo(-60,8);ctx.lineTo(62,5);ctx.moveTo(73,-16);ctx.lineTo(73,21);ctx.lineTo(65,13);ctx.moveTo(73,21);ctx.lineTo(81,13);ctx.stroke();ctx.font='13px "KaiTi",serif';ctx.fillText('日期・金額・分類',0,26);
    }else if(kind==='manuscript'){
      ctx.save();ctx.rotate(-.05);ctx.fillText('觀察 ／ 隨記',0,-5);ctx.beginPath();ctx.moveTo(-70,12);ctx.bezierCurveTo(-20,8,20,20,72,12);ctx.stroke();ctx.restore();
    }else if(kind==='typewriter'){ctx.font='20px "Courier New",monospace';ctx.fillText('----- REPORT -----',0,0)}
    else if(kind==='burnt'){ctx.beginPath();ctx.moveTo(-67,17);ctx.lineTo(63,-16);ctx.stroke()}
    else if(kind==='crumpled'){ctx.font='13px monospace';ctx.fillText('FIELD COPY',0,0)}
    ctx.restore();
  }
  function render(entry,chosen,details){
    const theme=themeFor(entry,chosen);
    const fonts={hand:'"Kaiti TC", "KaiTi", "BiauKai", serif',serif:'"Noto Serif TC", "Songti TC", "PMingLiU", serif',sans:'"Noto Sans TC", "PingFang TC", sans-serif'};
    const W=640,P=theme?theme.pad:46,max=theme?.surface==='crumpled'?11720:11800,font=theme&&['manuscript','handmade','student'].includes(theme.surface)?fonts.hand:theme&&fonts[theme.family]?fonts[theme.family]:'"SFMono-Regular", Consolas, "Noto Sans Mono CJK TC", monospace';
    const measure=document.createElement('canvas').getContext('2d');
    let commands=[];
    const text=(value,size=24,align='left',gap=0)=>{
      measure.font=(theme&&theme.weight?theme.weight+' ':'')+size+'px '+font;
      for(const paragraph of String(value??'').split(/\r?\n/)){
        let line='';for(const char of Array.from(paragraph)){if(line&&measure.measureText(line+char).width>W-P*2){commands.push({text:line,size,align,h:Math.ceil(size*1.55)});line=''}line+=char}
        commands.push({text:line,size,align,h:Math.ceil(size*1.55)});
      }
      if(gap)commands.push({h:gap});
    };
    const rule=()=>commands.push({rule:true,h:28});
    text('LCB  記帳手札',30,'center');text(theme?theme.header:'罪 人 評 議 收 據',24,'center',12);if(theme){if(theme.surface)commands.push({decoration:theme.surface,h:84});commands.push({stamp:theme.mark,h:44});text(theme.sinner+' / '+theme.name,22,'center',12)}rule();
    text('日期  '+entry.date,22);
    const id=String(entry.id||'').replace(/[^a-zA-Z0-9]/g,'').slice(-12).toUpperCase();text('編號  '+(id||'LOCAL'),20);
    if(details){
      text((entry.type==='income'?'收入':'支出')+'  '+(entry.category||'其他'),22);text('用途  '+(entry.store||'未填寫'),22);rule();text('金額  '+money(entry.amount),30,'right',8);
      if(entry.note)text('備註  '+entry.note,22);
    }
    rule();text('評議紀錄',22,'center',8);
    entry.comment.lines.forEach((line,i)=>{if(!chosen.has(i))return;
      text((line.speaker||'旁白')+(line.kind==='action'?' / 動作':'') ,24,'left',4);
      text(line.kind==='action'?'（'+line.text+'）':line.text,24,'left',theme?theme.gap:18);
    });
    rule();text('共 '+chosen.size+' 段評議',20,'center');text('記帳留存 · 非交易憑證',20,'center');text('LCB / END OF RECORD',18,'center',10);
    const parts=[];let part=[],height=84;
    for(const command of commands){if(height+command.h>max){parts.push(part);part=[];height=84}part.push(command);height+=command.h}if(part.length)parts.push(part);
    return parts.map((part,index)=>{
      const H=84+part.reduce((s,x)=>s+x.h,0)+(parts.length>1?36:0)+(theme?.surface==='crumpled'?80:0);
      const canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;const ctx=canvas.getContext('2d');
      // Neutral thermal paper, with restrained grain; no fake stains or UI cards.
      const photoPaper=theme?.surface==='crumpled'&&crumpledPaper.complete&&crumpledPaper.naturalWidth;
      if(photoPaper){
        ctx.drawImage(crumpledPaper,40,50,944,1440,0,0,W,H);ctx.save();
      }else{
      ctx.beginPath();
      if(theme&&['burnt','crumpled'].includes(theme.surface)){
        const edge=theme.surface==='burnt'?charredEdge:(v,phase)=>3+Math.abs(5*Math.sin(v*.031+phase)+4*Math.cos(v*.067+phase));
        // Join adjacent edges inside the paper; never cross paths at a corner.
        const corner=28;ctx.moveTo(corner,edge(corner,2));
        for(let x=corner;x<=W-corner;x+=2)ctx.lineTo(x,edge(x,2));
        ctx.quadraticCurveTo(W-edge(corner,1),edge(W-corner,2),W-edge(corner,1),corner);
        for(let y=corner;y<=H-corner;y+=2)ctx.lineTo(W-edge(y,1),y);
        ctx.quadraticCurveTo(W-edge(H-corner,1),H-edge(W-corner,3),W-corner,H-edge(W-corner,3));
        for(let x=W-corner;x>=corner;x-=2)ctx.lineTo(x,H-edge(x,3));
        ctx.quadraticCurveTo(edge(H-corner,0),H-edge(corner,3),edge(H-corner,0),H-corner);
        for(let y=H-corner;y>=corner;y-=2)ctx.lineTo(edge(y,0),y);
        ctx.quadraticCurveTo(edge(corner,0),edge(corner,2),corner,edge(corner,2));
      }else{ctx.moveTo(0,8);for(let x=0;x<W;x+=16){ctx.lineTo(x+8,2);ctx.lineTo(x+16,8)}ctx.lineTo(W,H-8);for(let x=W;x>0;x-=16){ctx.lineTo(x-8,H-2);ctx.lineTo(x-16,H-8)}}ctx.closePath();ctx.fillStyle=theme?theme.paper:'#fafaf7';ctx.fill();ctx.save();ctx.clip();
      }
      let seed=91431;if(!photoPaper)for(let j=0;j<W*H/140;j++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const x=seed%W;seed=(Math.imul(seed,1664525)+1013904223)>>>0;ctx.fillStyle='rgba(40,40,35,0.028)';ctx.fillRect(x,seed%H,1,1)}
      if(theme&&theme.surface)paintPaper(ctx,W,H,P,theme,entry);
      let y=photoPaper?82:42;ctx.textBaseline='top';
      for(const c of part){if(c.decoration){paintEmblem(ctx,W,P,y,theme)}else if(c.stamp){ctx.strokeStyle=theme.ink;ctx.fillStyle=theme.ink;ctx.font='18px '+font;ctx.textAlign='center';if(theme.border)ctx.strokeRect(P,y,W-2*P,30);ctx.fillText(c.stamp,W/2,y+5)}else if(c.rule){ctx.strokeStyle=theme?theme.ink:'#555';ctx.lineWidth=theme&&theme.weight?2:1;ctx.setLineDash(theme?theme.dash:[7,5]);ctx.beginPath();ctx.moveTo(P,y+10);ctx.lineTo(W-P,y+10);ctx.stroke();ctx.setLineDash([])}else if(c.text){ctx.font=(theme&&theme.weight?theme.weight+' ':'')+c.size+'px '+font;ctx.fillStyle=theme?theme.ink:'#292927';ctx.textAlign=c.align;if(theme&&theme.surface==='typewriter'){ctx.globalAlpha=.82;ctx.fillText(c.text,c.align==='center'?W/2:c.align==='right'?W-P:P,y+.6);ctx.globalAlpha=1}ctx.fillText(c.text,c.align==='center'?W/2:c.align==='right'?W-P:P,y)}y+=c.h}
      if(parts.length>1){ctx.font='18px '+font;ctx.textAlign='center';ctx.fillText((index+1)+' / '+parts.length,W/2,y+8)}
      ctx.restore();return canvas;
    });
  }
  renderCommentaryArchive();
})();


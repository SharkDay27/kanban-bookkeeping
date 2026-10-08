/* Local PNG renderer: no uploads or third-party image dependencies. */
(function(){
  'use strict';
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
      await document.fonts.ready;if(run!==generation)return;
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
    '李箱':{name:'留白詩稿',paper:'#f8f8f3',ink:'#34383a',family:'serif',pad:58,gap:28,dash:[2,7],header:'觀測手札',mark:'01 / OBSERVATION',border:false},
    '浮士德':{name:'分析紀錄',paper:'#fafafa',ink:'#303238',family:'mono',pad:46,gap:16,dash:[9,3],header:'分析紀錄',mark:'02 / ANALYSIS',border:true},
    '堂吉訶德':{name:'騎士委託單',paper:'#fcfaf1',ink:'#494235',family:'serif',pad:48,gap:20,dash:[6,3],header:'騎士行動紀錄',mark:'03 / QUEST',border:true},
    '良秀':{name:'銳線短箋',paper:'#faf8f5',ink:'#3d2929',family:'serif',pad:60,gap:32,dash:[],header:'評議短箋',mark:'04 / R.',border:false},
    '默爾索':{name:'制式作業單',paper:'#f9fafb',ink:'#28323b',family:'mono',pad:42,gap:14,dash:[],header:'作業紀錄單',mark:'05 / REPORT',border:true},
    '鴻璐':{name:'雅緻便箋',paper:'#f7faf7',ink:'#29433f',family:'serif',pad:58,gap:26,dash:[1,5],header:'隨筆留存',mark:'06 / MEMO',border:false},
    '希斯克利夫':{name:'粗印票根',paper:'#f8f5f0',ink:'#3f3336',family:'mono',pad:42,gap:18,dash:[15,5],header:'現場記錄',mark:'07 / FIELD',border:true,weight:600},
    '以實瑪利':{name:'航路紀錄',paper:'#faf8f2',ink:'#3f3b32',family:'mono',pad:46,gap:20,dash:[10,4,2,4],header:'航路記錄單',mark:'08 / LOG',border:true},
    '羅佳':{name:'生活小票',paper:'#fcf7f3',ink:'#4a3335',family:'sans',pad:48,gap:24,dash:[4,5],header:'今日小記',mark:'09 / DAILY',border:false},
    '辛克萊':{name:'筆記頁',paper:'#f8faf4',ink:'#344034',family:'serif',pad:54,gap:24,dash:[2,4],header:'個人筆記',mark:'11 / NOTES',border:false},
    '奧提斯':{name:'戰術報告',paper:'#f9f9f2',ink:'#3b4030',family:'mono',pad:42,gap:16,dash:[12,3],header:'行動評議報告',mark:'12 / BRIEFING',border:true,weight:600},
    '格里高爾':{name:'日常留存單',paper:'#f8f6f0',ink:'#423c32',family:'sans',pad:50,gap:22,dash:[7,5],header:'日常記錄單',mark:'13 / RECORD',border:false}
  };
  function themeFor(entry,chosen){
    const names=new Set();
    entry.comment.lines.forEach((line,i)=>{if(!chosen.has(i))return;const name=sinnerForLineSpeaker(line.speaker||'');if(THEMES[name])names.add(name)});
    if(names.size!==1)return null;
    const sinner=[...names][0];return {...THEMES[sinner],sinner};
  }
  function render(entry,chosen,details){
    const theme=themeFor(entry,chosen);
    const fonts={serif:'"Noto Serif TC", "Songti TC", "PMingLiU", serif',sans:'"Noto Sans TC", "PingFang TC", sans-serif'};
    const W=640,P=theme?theme.pad:46,max=11800,font=theme&&fonts[theme.family]?fonts[theme.family]:'"SFMono-Regular", Consolas, "Noto Sans Mono CJK TC", monospace';
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
    text('LCB  記帳手札',30,'center');text(theme?theme.header:'罪 人 評 議 收 據',24,'center',12);if(theme){commands.push({stamp:theme.mark,h:44});text(theme.sinner+' / '+theme.name,22,'center',12)}rule();
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
      const H=84+part.reduce((s,x)=>s+x.h,0)+(parts.length>1?36:0);
      const canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;const ctx=canvas.getContext('2d');
      // Neutral thermal paper, with restrained grain; no fake stains or UI cards.
      ctx.beginPath();ctx.moveTo(0,8);for(let x=0;x<W;x+=16){ctx.lineTo(x+8,2);ctx.lineTo(x+16,8)}ctx.lineTo(W,H-8);for(let x=W;x>0;x-=16){ctx.lineTo(x-8,H-2);ctx.lineTo(x-16,H-8)}ctx.closePath();ctx.fillStyle=theme?theme.paper:'#fafaf7';ctx.fill();ctx.save();ctx.clip();
      let seed=91431;for(let j=0;j<W*H/140;j++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const x=seed%W;seed=(Math.imul(seed,1664525)+1013904223)>>>0;ctx.fillStyle='rgba(40,40,35,0.028)';ctx.fillRect(x,seed%H,1,1)}
      let y=42;ctx.textBaseline='top';
      for(const c of part){if(c.stamp){ctx.strokeStyle=theme.ink;ctx.fillStyle=theme.ink;ctx.font='18px '+font;ctx.textAlign='center';if(theme.border)ctx.strokeRect(P,y,W-2*P,30);ctx.fillText(c.stamp,W/2,y+5)}else if(c.rule){ctx.strokeStyle=theme?theme.ink:'#555';ctx.lineWidth=theme&&theme.weight?2:1;ctx.setLineDash(theme?theme.dash:[7,5]);ctx.beginPath();ctx.moveTo(P,y+10);ctx.lineTo(W-P,y+10);ctx.stroke();ctx.setLineDash([])}else if(c.text){ctx.font=(theme&&theme.weight?theme.weight+' ':'')+c.size+'px '+font;ctx.fillStyle=theme?theme.ink:'#292927';ctx.textAlign=c.align;ctx.fillText(c.text,c.align==='center'?W/2:c.align==='right'?W-P:P,y)}y+=c.h}
      if(parts.length>1){ctx.font='18px '+font;ctx.textAlign='center';ctx.fillText((index+1)+' / '+parts.length,W/2,y+8)}
      ctx.restore();return canvas;
    });
  }
  renderCommentaryArchive();
})();


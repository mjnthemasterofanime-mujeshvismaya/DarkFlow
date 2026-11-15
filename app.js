// HabitFlow - app.js (actions + startup)
const dl=(n,t)=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([t],{type:'application/json'}));a.download=n;document.body.appendChild(a);a.click();a.remove();toast('Saved '+n)};
const norm=o=>{if(Array.isArray(o.habits)&&o.log)return{...newState(),...o};if(Array.isArray(o.tasks)&&Array.isArray(o.reminders)&&Array.isArray(o.notes))return{...newState(),tasks:o.tasks,reminders:o.reminders,notes:o.notes,settings:{...newState().settings,...o.settings}};throw 0};
const A={
 tab(e){tab=e.dataset.k;render()},lrn(e){lrn=e.dataset.k;render()},jc(e){jc=e.dataset.k;render()},close,
 pickD(e){selD=e.dataset.k;render()},wk(e){wkOff+=+e.dataset.d;selD=addD(addD(weekStart(),wkOff*7),0);render()},wkNow(){wkOff=0;selD=today();render()},
 tog(e){const{id,d}=e.dataset;if(d>today())return toast('Future days can be completed once they arrive');const l=S.log[d]=S.log[d]||{};if(l[id])delete l[id];else l[id]={t:Date.now()};if(!Object.keys(l).length)delete S.log[d];save();close();render()},
 habNote(e){habNoteSheet(e.dataset.id,e.dataset.d)},
 saveHN(e){const{id,d}=e.dataset;if(d>today())return toast('Future days can be completed once they arrive');const l=S.log[d]=S.log[d]||{};l[id]={...l[id],t:(l[id]&&l[id].t)||Date.now(),n:$('#f_n').value.trim()};save();close();render()},
 newHab(){habSheet()},editHab(e){habSheet(S.habits.find(x=>x.id===e.dataset.id))},habs:habsSheet,
 saveHab(e){const v=$('#f_t').value.trim(),days=[...document.querySelectorAll('.wd:checked')].map(x=>+x.value);if(!v)return toast('Give the habit a name');if(!days.length)return toast('Pick at least one weekday');
  const o={title:v,days,cat:$('#f_c').value,mins:+$('#f_m').value||0,time:$('#f_tm').value,notify:$('#f_n').value==='1'};
    if(o.notify){primeAlarmAudio();if('Notification'in window&&Notification.permission==='default')askPerm()}
    if(e.dataset.id)Object.assign(S.habits.find(x=>x.id===e.dataset.id),o);else S.habits.push({id:uid(),since:today(),...o});save();close();render();nativeSync();toast('Habit saved')},
 delHab(e){S.habits.find(x=>x.id===e.dataset.id).off=today();save();close();render();nativeSync();toast('Habit removed. Past history is kept.')},
 mv(e){const l=S.habits,i=l.findIndex(x=>x.id===e.dataset.id),j=i+(+e.dataset.d);let k=j;while(l[k]&&l[k].off)k+=+e.dataset.d;if(!l[k])return;[l[i],l[k]]=[l[k],l[i]];save();habsSheet();render()},
 newJ(){jSheet()},editJ(e){jSheet(S.journal.find(x=>x.id===e.dataset.id))},
 saveJ(e){const t=$('#f_t').value.trim();if(!t)return toast('Give the entry a title');const cat=$('#f_c').value,old=e.dataset.id&&S.journal.find(x=>x.id===e.dataset.id),o={title:t,cat,cc:cat==='Custom'?$('#f_cc').value.trim():'',date:$('#f_dt').value||today(),desc:$('#f_d').value,find:'',thought:'',tags:old?(old.tags||[]):[],updated:Date.now()};
  if(e.dataset.id)Object.assign(S.journal.find(x=>x.id===e.dataset.id),o);else S.journal.push({id:uid(),...o});save();close();render();toast('Entry saved')},
 delJ(e){confirmSheet('This entry will be permanently deleted.','doDelJ');window._j=e.dataset.id},doDelJ(){S.journal=S.journal.filter(x=>x.id!==window._j);save();close();render();toast('Entry deleted')},
 aniNote(e){aniSheet(+e.dataset.i)},aniTog(e){const i=+e.dataset.i;S.ani[i]={...S.ani[i],done:!(S.ani[i]&&S.ani[i].done)};save();render()},saveAni(e){const i=+e.dataset.i;S.ani[i]={...S.ani[i],n:$('#f_n').value.trim()};save();close();render()},
 tMode(e){if(T&&T.run)return;T=null;focusMode=e.dataset.mode;focusPreset=focusMode==='focus'?25:5;render()},
 tPreset(e){if(T&&T.run)return;T=null;focusPreset=+e.dataset.mins;render()},
 tStart(){const mode=T?T.mode:focusMode,minutes=T&&tRemaining()>0?T.minutes:focusPreset,seconds=minutes*60;T={lang:lrn,mode,minutes,total:seconds,left:seconds,run:true,startedAt:Date.now()};render()},
 tPause(){T.left=tRemaining();T.run=false;render()},tResume(){T.startedAt=Date.now();T.run=true;render()},tReset(){T=null;render()},
 tExpire(){if(!T||!T.run)return;T.left=0;T.run=false;if(T.mode==='focus')focusCycles++;toast(T.mode==='focus'?'Focus session complete. Take a break.':'Break complete. Ready to focus?');render()},
 tFin(){T.left=tRemaining();T.run=false;if(T.mode==='break'){T=null;render();toast('Break ended');return}finSheet()},
 saveSes(e){const elapsed=tSecs();S.ses.push({id:uid(),lang:T.lang,secs:elapsed,note:$('#f_n').value.trim(),date:today()});if(e.dataset.id){const l=S.log[today()]=S.log[today()]||{};l[e.dataset.id]={t:Date.now(),n:'Study session '+Math.max(1,Math.round(elapsed/60))+' min'}}T=null;save();close();render();toast('Session saved')},
 async perm(){await askPerm();nativeSync();render()},
 async testAlarm(){if(!S.settings.alarmSound)return toast('Turn reminder sound on first');toast(await playAlarmSound(true)?'Alarm sound is working':'Sound could not play. Check device volume and try again')},
 data:dataSheet,copy(){const t=$('#js');t.select();navigator.clipboard?.writeText(t.value).then(()=>toast('Copied'),()=>toast('Press and hold to copy the selected text'))},
 expAll(){dl('DARKFLOW-backup-'+today()+'.json',JSON.stringify(S))},expJ(){dl('DARKFLOW-journal-'+today()+'.json',JSON.stringify(S.journal,null,1))},expH(){dl('DARKFLOW-history-'+today()+'.json',JSON.stringify({habits:S.habits,log:S.log,sessions:S.ses},null,1))},
 imp(){try{window._imp=norm(JSON.parse($('#js').value));confirmSheet('This replaces everything currently in DARKFLOW.','doImp')}catch(x){toast('That doesn’t look like a DARKFLOW, HabitFlow, DAYFORGE or DAYMARK backup')}},
 doImp(){S=window._imp;migrate();save();applyTheme();close();render();nativeSync();toast('Data imported')},
 clear(){confirmSheet('This permanently deletes all habit history, journal entries and sessions. Export a backup first.','doClear')},
 doClear(){S=newState();save();close();render();nativeSync();toast('All data reset')}
};
document.addEventListener('click',e=>{const el=e.target.closest('[data-a]');if(el&&A[el.dataset.a])A[el.dataset.a](el,e);else if(e.target.id==='ov')close()});
document.addEventListener('change',e=>{if(e.target.id==='fi'){const f=e.target.files[0];if(!f)return;f.text().then(t=>{try{window._imp=norm(JSON.parse(t));confirmSheet('This replaces everything currently in DARKFLOW.','doImp')}catch(x){toast('That file isn’t a DARKFLOW, HabitFlow, DAYFORGE or DAYMARK backup')}});return}if(e.target.id==='f_c'){document.querySelector('.custom-category-field')?.toggleAttribute('hidden',e.target.value!=='Custom');return}
 const k=e.target.dataset.s;if(!k)return;let v=e.target.value;if(v==='true')v=true;if(v==='false')v=false;if(k==='sum'&&v&&'Notification'in window&&Notification.permission==='default')askPerm();S.settings[k]=v;if(k==='alarmSound'&&v)primeAlarmAudio();save();applyTheme();render();nativeSync()});
document.addEventListener('input',e=>{if(e.target.id==='jq'){jq=e.target.value;const p=e.target.selectionStart;render();const i=$('#jq');i.focus();i.setSelectionRange(p,p)}});
document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
(async()=>{try{db=await open();const s=await load();if(s){if(!s.v)await snap(s);S={...newState(),...s,settings:{...newState().settings,...s.settings}}}
 const c=migrate();save();if(c)toast(c+' DAYMARK note'+(c>1?'s':'')+' moved to your journal')}catch(e){toast('Storage unavailable: changes won’t be kept')}
 applyTheme();render();setInterval(tick,20000);setInterval(()=>{const d=new Date(),h=S.settings.h24?d.getHours():((d.getHours()%12)||12);document.querySelectorAll('[data-clock-part="hours"]').forEach(e=>e.textContent=pad2(h));document.querySelectorAll('[data-clock-part="minutes"]').forEach(e=>e.textContent=pad2(d.getMinutes()));document.querySelectorAll('[data-clock-part="seconds"]').forEach(e=>e.textContent=pad2(d.getSeconds()));document.querySelectorAll('[data-clock-part="ampm"]').forEach(e=>e.textContent=d.getHours()<12?'AM':'PM');if(T){const left=tRemaining();document.querySelectorAll('[data-timepart="minutes"]').forEach(e=>e.textContent=pad2(Math.floor(left/60)));document.querySelectorAll('[data-timepart="seconds"]').forEach(e=>e.textContent=pad2(left%60));if(T.run&&left===0)A.tExpire()}},1000);tick();nativeSync()})();
if('serviceWorker'in navigator)addEventListener('load',()=>navigator.serviceWorker.register('service-worker.js').catch(()=>{}));

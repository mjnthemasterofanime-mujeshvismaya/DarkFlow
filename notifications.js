// HabitFlow - notifications.js
let alarmAudio;
function playAlarmSound(){if(!S.settings.alarmSound||window.Capacitor?.isNativePlatform?.())return;if(!alarmAudio)alarmAudio=new Audio('./habitflow-alarm.wav');alarmAudio.currentTime=0;alarmAudio.play().catch(()=>{})}
async function askPerm(){if(!('Notification'in window)){toast('This browser doesn’t support notifications. Reminders will show in the app only.');return false}
 if(Notification.permission==='granted')return true;if(Notification.permission==='denied'){toast('Notifications are blocked in browser settings');return false}
 try{return(await Notification.requestPermission())==='granted'}catch(e){toast('Notification permission isn’t available here');return false}}
const mins=t=>{const[h,m]=t.split(':').map(Number);return h*60+m};
function ping(title,body){playAlarmSound();toast('🔔 '+title);if('Notification'in window&&Notification.permission==='granted')try{new Notification(title,{body})}catch(e){}}
// In-app alerts: fire within 60 minutes after the scheduled time, once per day per habit.
function tick(){if(!S.settings.notify)return;const t=today(),n=new Date(),hm=String(n.getHours()).padStart(2,'0')+':'+String(n.getMinutes()).padStart(2,'0');let ch=false;
 dayStat(t).l.forEach(h=>{const k=t+h.id;if(!h.notify||!h.time||isDone(t,h)||S.fired[k])return;const d=mins(hm)-mins(h.time);if(d>=0&&d<=60){S.fired[k]=1;ch=true;ping(h.title,S.settings.msg)}});
 if(S.settings.sum&&!S.fired[t+'sum']&&hm>=S.settings.sumTime){const r=dayStat(t);if(r.n>r.dn)ping('HabitFlow',(r.n-r.dn)+' habits left today. '+S.settings.msg);S.fired[t+'sum']=1;ch=true}
 if(ch){save();if(tab==='today'||tab==='plan')render()}}
// Android (Capacitor LocalNotifications): weekly repeating reminders. Not available in the browser.
async function nativeSync(){const L=window.Capacitor&&Capacitor.Plugins&&Capacitor.Plugins.LocalNotifications;if(!L||!Capacitor.isNativePlatform||!Capacitor.isNativePlatform())return;
 try{let p=await L.checkPermissions();if(p.display!=='granted')p=await L.requestPermissions();if(p.display!=='granted')return;
 const q=await L.getPending();if(q.notifications.length)await L.cancel(q);if(!S.settings.notify)return;
 const withSound=!!S.settings.alarmSound,sound='habitflow_alarm.wav',channelId=withSound?'habitflow-reminders-sound':'habitflow-reminders-silent';
 await L.createChannel({id:channelId,name:'HabitFlow reminders',description:'HabitFlow scheduled habit reminders',importance:4,...(withSound?{sound}:{})});
 const ns=[];let id=1;S.habits.filter(h=>!h.off&&h.notify&&h.time).forEach(h=>h.days.forEach(d=>{const[hh,mm]=h.time.split(':').map(Number);ns.push({id:id++,title:h.title,body:S.settings.msg,channelId,...(withSound?{sound}:{}),schedule:{on:{weekday:d+1,hour:hh,minute:mm},allowWhileIdle:true}})}));
 if(S.settings.sum){const[hh,mm]=S.settings.sumTime.split(':').map(Number);ns.push({id:9999,title:'HabitFlow',body:S.settings.msg,channelId,...(withSound?{sound}:{}),schedule:{on:{hour:hh,minute:mm},allowWhileIdle:true}})}
 if(ns.length)await L.schedule({notifications:ns})}catch(e){}}

// DAYFORGE - utils.js (data model, schedule, analytics helpers)
const $=s=>document.querySelector(s),ymd=d=>{d=new Date(d);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')},
today=()=>ymd(new Date()),uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6),
esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])),
pd=s=>new Date(s+'T00:00:00');
const P=d=>`<path d="${d}"/>`;
const IC={today:P('M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z'),plan:'<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4M16 3v4M3 10h18"/>',learn:P('M3 7l9-4 9 4-9 4zM7 9.5V15c0 1.5 2.2 3 5 3s5-1.500 5-3V9.5'),jrn:P('M6 3h12v18l-6-4-6 4z'),prog:P('M4 20V10M10 20V4M16 20v-7M22 20H2'),set:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>'};
const TABS=[['today','Dashboard'],['plan','Planner'],['learn','Learning'],['jrn','Journal'],['prog','Progress'],['set','Settings']];
const DAYS=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],MON=[1,2,3,4,5,6,0];
// Habit order below is the display order on every day.
const SEED=[['English Speaking',[1,2,3,4,5],20,'English'],['English Conversation',[6],30,'English'],['English Speaking Test',[0],30,'English'],['Japanese',[1,3,5],30,'Japanese'],['Korean',[2,4],30,'Korean'],['Japanese Revision',[6,0],30,'Japanese'],['Korean Revision',[6,0],30,'Korean'],['2D Animation',[1,2,3,4,5],45,'Animation'],['Animation Project',[6],90,'Animation'],['Animation Review',[0],45,'Animation'],['Book Reading',[0,1,2,3,4,5,6],30,'Reading'],['Explore Something Interesting',[1,2,3,4,5],20,'Explore'],['Weekly Reflection',[0],15,'Reflection']];
const CATS=['English','Japanese','Korean','Animation','Reading','Explore','Reflection','Other'];
// Animation curriculum: [topic, assignment, weekday it is scheduled]
const ANI=[['Drawing Fundamentals','Lines, shapes and forms.',1],['Human Anatomy','Body proportions and poses.',2],['Character Design','Faces and expressions.',3],['Perspective & Backgrounds','Draw an environment.',4],['Animation Principles','Timing and spacing.',5],['Animation Production','Create a short animation.',6],['Weekly Review','Analyse and improve your work.',0]];
const LRN={English:['Pronunciation','Vocabulary','Grammar','Listening','Conversation','Speaking practice'],Japanese:['Hiragana','Katakana','Kanji','Vocabulary','Grammar','Conversation'],Korean:['Hangul','Vocabulary','Grammar','Listening','Conversation']};
const KNOW={'Psychology':['Emotions','Memory','Personality','Human behaviour'],'Science & Astronomy':['Physics','Biology','Chemistry','Space','Universe'],'World History & Mythology':['Civilizations','Legends','Cultures','Folklore'],'Philosophy & Critical Thinking':['Logic','Ethics','Reasoning','Existence'],'Economics & Finance':['Money','Markets','Business','Accounting'],'Filmmaking & Cinematography':['Camera','Lighting','Editing','Composition']};
const weekStart=(d=new Date())=>{d=new Date(d);d.setDate(d.getDate()-((d.getDay()+6)%7));return ymd(d)};
const addD=(k,n)=>{const d=pd(k);d.setDate(d.getDate()+n);return ymd(d)};
const mkSeed=()=>SEED.map(([title,days,mins,cat],i)=>({id:'h'+(i+1),title,days,mins,cat,time:'',notify:false,since:weekStart()}));
const newState=()=>({v:2,habits:mkSeed(),log:{},journal:[],ses:[],ani:{},fired:{},settings:{theme:'dark',fdow:1,h24:false,notify:true,alarmSound:true,sum:false,sumTime:'20:00',msg:'Time for your next habit.'}});
let S=newState(),tab='today',lrn='English',selD=today(),wkOff=0,jq='',jc='All',db=null,T=null;

// ---- habit data ----
const isDone=(d,h)=>!!(S.log[d]&&S.log[d][h.id]);
const sched=d=>S.habits.filter(h=>h.since<=d&&(!h.off||d<h.off)&&h.days.includes(pd(d).getDay()));
function dayStat(d){const l=sched(d),dn=l.filter(h=>isDone(d,h)).length;return{l,n:l.length,dn,pct:l.length?Math.round(dn/l.length*100):0}}
function rangeStat(a,b){let n=0,dn=0,best=null;for(let k=a;k<=b&&k<=today();k=addD(k,1)){const s=dayStat(k);n+=s.n;dn+=s.dn;if(s.n&&(!best||s.pct>best.pct))best={k,pct:s.pct}}return{n,dn,pct:n?Math.round(dn/n*100):0,best}}
// Streaks follow scheduled days only: unscheduled days are skipped, a pending today does not break the streak.
function hStreak(h){const t=today();let d=pd(t),n=0;for(let i=0;i<1000;i++){const k=ymd(d);if(k<h.since)break;if(h.days.includes(d.getDay())&&(!h.off||k<h.off)){if(isDone(k,h))n++;else if(k!==t)break}d.setDate(d.getDate()-1)}return n}
function hBest(h){const t=today();let n=0,b=0;for(let k=h.since;k<=t;k=addD(k,1)){if(!h.days.includes(pd(k).getDay())||(h.off&&k>=h.off))continue;if(isDone(k,h)){n++;b=Math.max(b,n)}else if(k!==t)n=0}return b}
function hStat(h){const t=today();let n=0,dn=0;for(let k=h.since;k<=t;k=addD(k,1)){if(!h.days.includes(pd(k).getDay())||(h.off&&k>=h.off))continue;const d=isDone(k,h);if(d||k!==t)n++;if(d)dn++}return{n,dn,pct:n?Math.round(dn/n*100):0}}
function dStreak(){const t=today();let n=0;for(let k=t,i=0;i<1000;k=addD(k,-1),i++){const s=dayStat(k);if(!s.n)continue;if(s.dn===s.n)n++;else if(k!==t)break}return n}

// ---- migration from DAYMARK (tasks/reminders/notes) ----
// Old arrays are kept untouched in the state; notes are copied into the journal once (ids prefixed 'n_').
function migrate(){let c=0;if(!S.v||S.v<2){S.v=2;S.habits=S.habits||mkSeed();S.log=S.log||{};S.journal=S.journal||[];S.ses=S.ses||[];S.ani=S.ani||{};S.fired=S.fired||{}}
 S.habits=S.habits&&S.habits.length?S.habits:mkSeed();S.journal=S.journal||[];
 (S.notes||[]).forEach(n=>{const id='n_'+n.id;if(S.journal.some(j=>j.id===id))return;S.journal.push({id,title:n.title||'Untitled',cat:'Custom',cc:'Imported notes',desc:n.body||'',find:'',thought:'',date:ymd(n.created||Date.now()),tags:['imported'],updated:n.updated||Date.now()});c++});
 S.settings={theme:'dark',fdow:1,h24:false,notify:true,alarmSound:true,sum:false,sumTime:'20:00',msg:'Time for your next habit.',...S.settings};return c}

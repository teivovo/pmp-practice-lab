const test=require('node:test');
const assert=require('node:assert/strict');
global.window=global;
require('../questions.js');const originalBank=JSON.parse(JSON.stringify(PMP_BANK));require('../questions-expansion.js');require('../core.js');require('../topics.js');
const B=PMP_BANK,C=PMPCore;
function sample(){const ids=C.mock(B,()=>.4);return{v:2,ids,a:ids.map(()=>[]),f:ids.map(()=>0),r:ids.map(()=>0),i:0,mode:'mock',left:14400,last:Date.now(),paused:false,done:false,section:0,bounds:[18,99,180],breakUntil:0};}
test('Bank has 400 unique items covering every topic',()=>{
 assert.equal(B.length,400);assert.equal(new Set(B.map(q=>q.id)).size,400);assert.equal(new Set(B.map(q=>q.stem)).size,400);
 assert.deepEqual(B.reduce((a,q)=>(a[q.domain]=(a[q.domain]||0)+1,a),{}),{People:131,Process:164,'Business Environment':105});
 assert.deepEqual(B.slice(0,180),originalBank);
 for(const [domain,topics] of Object.entries(PMP_TOPICS)){assert.deepEqual([...new Set(B.filter(q=>q.domain===domain).map(q=>q.task))].sort((a,b)=>a-b),topics.map((_,i)=>i+1));}
 for(const q of B){assert.ok(q.explanation.length>80);assert.ok(q.answer.every(a=>Number.isInteger(a)&&a>=0&&a<q.options.length));if(q.type==='match'){assert.equal(q.answer.length,q.rows.length);assert.equal(new Set(q.answer).size,q.answer.length);}else if(q.type==='multi')assert.ok(q.answer.length>1);else assert.equal(q.answer.length,1);if(q.case)assert.ok(PMP_CASES[q.case]);}
});
test('All item types score correctly, including exact multi-select and ordered matching',()=>{
 for(const q of B){assert.equal(C.grade(q,q.answer),true,`answer key ${q.id}`);assert.equal(C.grade(q,[]),false);if(q.type==='multi'){assert.equal(C.grade(q,[...q.answer].reverse()),true);assert.equal(C.grade(q,q.answer.slice(1)),false);assert.equal(C.grade(q,[...q.answer,q.options.findIndex((_,i)=>!q.answer.includes(i))]),false);}if(q.type==='match'){assert.equal(C.grade(q,Array(q.rows.length).fill(-1)),false);const wrong=[...q.answer];[wrong[0],wrong[1]]=[wrong[1],wrong[0]];assert.equal(C.grade(q,wrong),false);}}
});
test('Mocks sample six complete cases and preserve domain, approach, and format coverage',()=>{
 const seen=new Set(),seenCases=new Set();let seed=731;const random=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
 for(let n=0;n<200;n++){
  const ids=C.mock(B,random),items=ids.map(id=>B[id-1]);ids.forEach(id=>seen.add(id));
  assert.equal(ids.length,180);assert.equal(new Set(ids).size,180);
  assert.ok(items.slice(0,18).every(q=>q.case));assert.ok(items.slice(18).every(q=>!q.case));
  assert.equal(new Set(items.slice(0,18).map(q=>q.case)).size,6);
  for(let i=0;i<18;i+=3){const group=items.slice(i,i+3);assert.equal(new Set(group.map(q=>q.case)).size,1);seenCases.add(group[0].case);}
  assert.deepEqual(items.reduce((a,q)=>(a[q.domain]=(a[q.domain]||0)+1,a),{}),{People:59,Process:74,'Business Environment':47});
  assert.equal(items.filter(q=>q.approach==='Predictive').length,72);
  for(const type of ['single','multi','match','hotspot','dropdown'])assert.ok(items.some(q=>q.type===type));
  assert.ok(items.some(q=>q.graphic));
 }
 assert.equal(seen.size,400);assert.equal(seenCases.size,12);
});
test('Existing 180-item saves remain compatible after the bank expansion',()=>{
 const s=sample();s.ids=C.mock(originalBank,()=>.4);s.a=s.ids.map(id=>[...originalBank[id-1].answer]);s.i=99;s.section=2;
 assert.equal(C.valid(C.unpack(C.pack(s)),B),true);assert.equal(C.summary(s,B).correct,180);
});
test('New numerical answer keys and charts use consistent quantities',()=>{
 const find=phrase=>B.find(q=>q.stem.includes(phrase));const answer=q=>q.options[q.answer[0]];
 assert.equal(answer(find('Current cost efficiency is expected to persist')),'$750,000');
 assert.equal(answer(find('What TCPI is required')),'1.20');
 assert.equal(answer(find('beta-weighted PERT')),'8 days');
 assert.equal(answer(find('EAC $840,000')),'$525,000');
 assert.equal(answer(find('25% probability of a $160,000')),'$40,000');
 for(const q of B.filter(q=>q.graphic==='bars')){assert.equal(q.chart.labels.length,q.chart.values.length);assert.ok(q.chart.values.every(n=>Number.isFinite(n)&&n>=0));}
 assert.equal(B.filter(q=>q.case).length,36);
});
test('Practice filters select only the requested domain, topic, and format',()=>{for(const [d,topics] of Object.entries(PMP_TOPICS)){for(let t=1;t<=topics.length;t++){const ids=C.select(B,180,d,'all',()=>.5,`${d}:${t}`,'topic');assert.ok(ids.length);assert.ok(ids.every(id=>B[id-1].domain===d&&B[id-1].task===t));assert.equal(new Set(ids).size,ids.length);}}assert.ok(C.select(B,10,'People','multi').every(id=>B[id-1].type==='multi'));assert.ok(C.select(B,10,'People','hotspot').length>=2);});
test('Packed cookie round-trips a fully answered full mock within one cookie budget',()=>{const s=sample();s.a=s.ids.map(id=>[...B[id-1].answer]);s.f.fill(1);s.r.fill(1);s.i=179;s.section=2;s.left=1234.123456789;s.done=true;s.paused=true;const packed=C.pack(s);assert.ok(Buffer.byteLength(Buffer.from(JSON.stringify(packed)).toString('base64'))<3700);assert.deepEqual(C.unpack(packed),s);assert.equal(C.valid(C.unpack(packed),B),true);assert.equal(C.summary(s,B).correct,180);});
test('Invalid, incompatible, duplicate, and out-of-range saved states fail safely',()=>{const s=sample();assert.equal(C.valid(s,B),true);for(const bad of [{...s,v:1},{...s,i:180},{...s,ids:s.ids.map(()=>1)},{...s,section:5},{...s,bounds:[0,1,180]},{...s,left:NaN},{...s,paused:true},{...s,section:1,i:0},{...s,a:s.a.map(()=>[999])}])assert.equal(C.valid(bad,B),false);assert.equal(C.unpack({ids:'!',a:'',f:'',r:''}),null);});
test('Clock counts offline exam time, excludes breaks, and expires after break overrun',()=>{
 const s=sample();s.last=100000;s.left=1000;C.advance(s,160000);assert.equal(s.left,940);
 s.breakUntil=760000;C.advance(s,460000);assert.equal(s.left,940);assert.equal(s.breakUntil,760000);
 const event=C.advance(s,820000);assert.equal(event.breakEnded,true);assert.equal(s.left,880);assert.equal(s.breakUntil,0);
 assert.equal(C.advance(s,1900000).expired,true);assert.equal(s.left,0);
 const paused={...sample(),mode:'timed',paused:true,last:0};C.advance(paused,99999999);assert.equal(paused.left,14400);
 const study={...sample(),mode:'study',last:0};C.advance(study,99999999);assert.equal(study.left,14400);
});

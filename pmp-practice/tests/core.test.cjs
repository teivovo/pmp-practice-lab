const test=require('node:test');
const assert=require('node:assert/strict');
global.window=global;
require('../questions.js');require('../core.js');require('../topics.js');
const B=PMP_BANK,C=PMPCore;
function sample(){const ids=C.mock(B,()=>.4);return{v:2,ids,a:ids.map(()=>[]),f:ids.map(()=>0),r:ids.map(()=>0),i:0,mode:'mock',left:14400,last:Date.now(),paused:false,done:false,section:0,bounds:[18,99,180],breakUntil:0};}
test('Bank has 180 unique items and the rounded 2026 domain/approach mix',()=>{
 assert.equal(B.length,180);assert.equal(new Set(B.map(q=>q.id)).size,180);assert.equal(new Set(B.map(q=>q.stem)).size,180);
 assert.deepEqual(B.reduce((a,q)=>(a[q.domain]=(a[q.domain]||0)+1,a),{}),{People:59,Process:74,'Business Environment':47});
 assert.equal(B.filter(q=>q.approach==='Predictive').length,72);
 for(const [domain,topics] of Object.entries(PMP_TOPICS)){assert.deepEqual([...new Set(B.filter(q=>q.domain===domain).map(q=>q.task))].sort((a,b)=>a-b),topics.map((_,i)=>i+1));}
 for(const q of B){assert.ok(q.explanation.length>80);assert.ok(q.answer.every(a=>Number.isInteger(a)&&a>=0&&a<q.options.length));if(q.type==='match'){assert.equal(q.answer.length,q.rows.length);assert.equal(new Set(q.answer).size,q.answer.length);}else if(q.type==='multi')assert.ok(q.answer.length>1);else assert.equal(q.answer.length,1);if(q.case)assert.ok(PMP_CASES[q.case]);}
});
test('All item types score correctly, including exact multi-select and ordered matching',()=>{
 for(const q of B){assert.equal(C.grade(q,q.answer),true,`answer key ${q.id}`);assert.equal(C.grade(q,[]),false);if(q.type==='multi'){assert.equal(C.grade(q,[...q.answer].reverse()),true);assert.equal(C.grade(q,q.answer.slice(1)),false);assert.equal(C.grade(q,[...q.answer,q.options.findIndex((_,i)=>!q.answer.includes(i))]),false);}if(q.type==='match'){assert.equal(C.grade(q,Array(q.rows.length).fill(-1)),false);const wrong=[...q.answer];[wrong[0],wrong[1]]=[wrong[1],wrong[0]];assert.equal(C.grade(q,wrong),false);}}
});
test('Mock preserves all six linked cases before independent sections, without duplicates',()=>{for(let n=0;n<40;n++){const ids=C.mock(B);assert.equal(ids.length,180);assert.equal(new Set(ids).size,180);assert.ok(ids.slice(0,18).every(id=>B[id-1].case));assert.ok(ids.slice(18).every(id=>!B[id-1].case));for(let i=0;i<18;i+=3)assert.equal(new Set(ids.slice(i,i+3).map(id=>B[id-1].case)).size,1);}});
test('Practice filters select only the requested domain, topic, and format',()=>{for(const [d,topics] of Object.entries(PMP_TOPICS)){for(let t=1;t<=topics.length;t++){const ids=C.select(B,180,d,'all',()=>.5,`${d}:${t}`,'topic');assert.ok(ids.length);assert.ok(ids.every(id=>B[id-1].domain===d&&B[id-1].task===t));assert.equal(new Set(ids).size,ids.length);}}assert.ok(C.select(B,10,'People','multi').every(id=>B[id-1].type==='multi'));assert.deepEqual(C.select(B,10,'People','hotspot'),[]);});
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

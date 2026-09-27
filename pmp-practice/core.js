(function(root){
'use strict';
const VERSION=2;
const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function answered(q,a){return Array.isArray(a)&&(q.type==='match'?a.length===q.rows.length&&a.every(x=>Number.isInteger(x)&&x>=0):q.type==='multi'?a.length===q.answer.length:a.length===1);}
function grade(q,a){if(!answered(q,a))return false;return q.type==='match'?eq(a,q.answer):eq([...a].sort((x,y)=>x-y),[...q.answer].sort((x,y)=>x-y));}
function shuffle(list,random=Math.random){const a=[...list];for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function select(bank,count,domain='all',format='all',random=Math.random,topic='all',order='random'){
 const pool=bank.filter(q=>(domain==='all'||q.domain===domain)&&(topic==='all'||`${q.domain}:${q.task}`===topic)&&(format==='all'||(format==='case'?!!q.case:q.type===format)));
 const groups=new Map();pool.forEach(q=>{const key=q.case||`q${q.id}`;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(q.id);});
 const chosen=[];for(const g of order==='topic'?[...groups.values()].sort((a,b)=>{const x=bank.find(q=>q.id===a[0]),y=bank.find(q=>q.id===b[0]);return x.domain.localeCompare(y.domain)||x.task-y.task;}):shuffle([...groups.values()],random)){if(chosen.length+g.length<=count)chosen.push(...g);}
 return chosen;
}
function valid(s,bank){
 if(!s||s.v!==VERSION||!Array.isArray(s.ids)||!s.ids.length||s.ids.length>bank.length||new Set(s.ids).size!==s.ids.length||!s.ids.every(id=>bank.some(q=>q.id===id)))return false;
 if(!['study','timed','mock'].includes(s.mode)||!Number.isInteger(s.i)||s.i<0||s.i>=s.ids.length||!Number.isFinite(s.left)||s.left<0||s.left>s.ids.length*80||!Number.isFinite(s.last)||s.last<0||typeof s.paused!=='boolean'||typeof s.done!=='boolean')return false;
 if(s.mode==='mock'&&(!Array.isArray(s.bounds)||s.bounds.length!==3||s.ids.length!==180||s.bounds[0]!==18||s.bounds[1]!==99||s.bounds[2]!==180||![0,1,2].includes(s.section)||!Number.isFinite(s.breakUntil)||s.breakUntil<0||s.paused&&!s.done||!s.done&&(s.i<(s.section?s.bounds[s.section-1]:0)||s.i>=s.bounds[s.section])))return false;
 if(!Array.isArray(s.a)||s.a.length!==s.ids.length||!Array.isArray(s.f)||s.f.length!==s.ids.length||!Array.isArray(s.r)||s.r.length!==s.ids.length||![...s.f,...s.r].every(n=>n===0||n===1))return false;
 return s.a.every((a,i)=>{const q=bank.find(q=>q.id===s.ids[i]);return Array.isArray(a)&&a.length<=(q.type==='match'?q.rows.length:q.type==='multi'?q.answer.length:1)&&a.every(n=>Number.isInteger(n)&&n>=(q.type==='match'?-1:0)&&n<q.options.length)&&(q.type==='match'||new Set(a).size===a.length);});
}
function summary(s,bank){const domains={};let correct=0,attempted=0;s.ids.forEach((id,i)=>{const q=bank.find(q=>q.id===id),ok=grade(q,s.a[i]);if(ok)correct++;if(answered(q,s.a[i]))attempted++;if(!domains[q.domain])domains[q.domain]=[0,0];domains[q.domain][1]++;if(ok)domains[q.domain][0]++;});return {correct,attempted,total:s.ids.length,domains};}
function pack(s){return {...s,ids:s.ids.map(n=>n.toString(36).padStart(2,'0')).join(''),a:s.a.map(a=>a.map(n=>(n+1).toString(36)).join('')).join('.'),f:s.f.join(''),r:s.r.join('')};}
function unpack(s){if(!s||typeof s.ids!=='string'||typeof s.a!=='string'||typeof s.f!=='string'||typeof s.r!=='string'||s.ids.length%2||!/^[0-9a-z]+$/.test(s.ids)||!/^[0-9a-z.]*$/.test(s.a)||!/^[01]+$/.test(s.f)||!/^[01]+$/.test(s.r))return null;return {...s,ids:s.ids.match(/.{2}/g).map(x=>parseInt(x,36)),a:s.a.split('.').map(a=>[...a].map(x=>parseInt(x,36)-1)),f:[...s.f].map(Number),r:[...s.r].map(Number)};}
function mock(bank,random=Math.random){const grouped=new Map();bank.filter(q=>q.case).forEach(q=>{if(!grouped.has(q.case))grouped.set(q.case,[]);grouped.get(q.case).push(q.id);});return [...shuffle([...grouped.values()],random).flat(),...shuffle(bank.filter(q=>!q.case).map(q=>q.id),random)];}
function advance(s,now){let breakEnded=false;if(!s||s.done||s.paused||s.mode==='study')return{expired:false,breakEnded};if(s.breakUntil){if(now<s.breakUntil)return{expired:false,breakEnded};s.last=s.breakUntil;s.breakUntil=0;breakEnded=true;}s.left=Math.max(0,s.left-Math.max(0,(now-s.last)/1000));s.last=now;return{expired:s.left===0,breakEnded};}
root.PMPCore={VERSION,answered,grade,select,valid,summary,pack,unpack,mock,advance};
})(typeof window==='undefined'?globalThis:window);

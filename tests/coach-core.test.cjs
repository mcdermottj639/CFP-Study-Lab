const test = require('node:test');
const assert = require('node:assert/strict');
const C = require('../coach-core.js');
process.env.TZ = 'America/New_York';
const q = {m:'FP512',d:'C',t:'Risk',q:'A risk question'};

test('local days and weeks respect Eastern midnight and DST',()=>{
  assert.equal(C.day('2026-10-14T02:30:00Z'),'2026-10-13');
  assert.equal(C.week('2026-10-18'),'2026-10-12');
  assert.equal(C.addDay('2026-11-01',1),'2026-11-02');
  assert.equal(C.gap('2026-10-31','2026-11-02'),2);
});
test('same-day retries never masquerade as delayed recall',()=>{
  const t=new Date('2026-10-13T12:00:00-04:00').getTime();
  let r=C.schedule(null,q,false,t);
  assert.equal(r.due,'2026-10-14');
  r=C.schedule(r,q,true,t+1000);
  assert.equal(r.retained,false);assert.equal(r.checks,0);
  r=C.schedule(r,q,true,t+86400000);
  assert.equal(r.retained,true);assert.equal(r.checks,1);assert.equal(r.due,'2026-10-17');
  r=C.schedule(r,q,false,t+2*86400000);
  assert.equal(r.retained,false);assert.equal(r.step,0);
});
test('sync is idempotent and preserves two devices, counters and completed-session tombstones',()=>{
  const a=C.blank(),b=C.blank();a.time.one={ms:12000,day:'2026-10-13'};
  b.time.one={ms:20000,day:'2026-10-13'};b.time.two={ms:7000,day:'2026-10-13'};
  a.active={id:'old'};a.activeUpdatedAt=100;b.active=null;b.activeUpdatedAt=101;
  a.completed.a={at:90,day:'2026-10-13'};b.completed.b={at:91,day:'2026-10-13'};
  const merged=C.merge(a,b);assert.equal(merged.active,null);assert.equal(merged.time.one.ms,20000);
  assert.equal(Object.keys(merged.completed).length,2);
  assert.deepEqual(C.merge(merged,merged),merged);
  assert.equal(C.merge(undefined,undefined),undefined);
});
test('weekly goal counts distinct days and cases independently',()=>{
  const s=C.blank();
  for(let i=0;i<4;i++)s.completed[i]={day:C.addDay('2026-10-12',i),at:i,kind:'guided',caseDone:false};
  s.completed.repeat={day:'2026-10-12',at:10,kind:'guided'};
  s.completed.client={day:'2026-10-18',at:11,kind:'case-only',caseDone:true};
  const stat=C.stats(s,[],'2026-10-18');assert.equal(stat.days,4);assert.equal(stat.cases,1);assert.equal(stat.goalMet,true);
  assert.equal(stat.completedToday,true);
});
test('first-attempt weekly accuracy is not inflated by repeated retries',()=>{
  const ts=new Date('2026-10-13T12:00:00-04:00').getTime();
  const attempts=[{questionKey:'q',correct:0,ts,src:'coach'},{questionKey:'q',correct:1,ts:ts+1,src:'coach'},{questionKey:'other',correct:1,ts,src:'card'}];
  assert.equal(C.stats(C.blank(),attempts,'2026-10-13').accuracy,0);
});
test('reminder respects weekdays, completion and skip-today',()=>{
  const s=C.blank(),t=new Date('2026-10-13T19:30:00-04:00');s.settings.reminders=true;
  assert.equal(C.dueReminder(s,[],t),true);
  s.completed.x={day:'2026-10-13',kind:'guided'};assert.equal(C.dueReminder(s,[],t),false);
  delete s.completed.x;s.nudges['2026-10-13']={at:+t};assert.equal(C.dueReminder(s,[],t),false);
});
test('priority selects due reviews and de-duplicates generated question families',()=>{
  const s=C.blank(),t=new Date('2026-10-13T12:00:00-04:00');
  s.reviews[q.q]={due:'2026-10-12',retained:false};
  const ranked=C.rankQuestions([{...q,q:'Other'},q,{...q,g:'gen'}, {...q,g:'gen',q:'Variant'}],s,[],t);
  assert.equal(ranked[0].q,q.q);assert.equal(ranked.length,3);
});

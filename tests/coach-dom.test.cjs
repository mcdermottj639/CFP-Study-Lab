/* DOM integration checks, not a visual browser test. Install jsdom outside the app
   and set NODE_PATH to its node_modules before running node --test. */
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {JSDOM,ResourceLoader,VirtualConsole}=require('jsdom');
const root=path.resolve(__dirname,'..');
const opened=[];test.after(()=>opened.forEach(dom=>dom.window.close()));
class LocalResources extends ResourceLoader{
  fetch(url){const p=new URL(url).pathname.slice(1);if(p==='vendor/chart.umd.js')return Promise.resolve(Buffer.from('window.Chart=function(){this.destroy=function(){}};'));
    if(p==='cfp-gist-sync.js')return Promise.resolve(Buffer.from('/* network sync excluded from isolated DOM test */'));
    const file=path.resolve(root,p);return file.startsWith(root+path.sep)&&fs.existsSync(file)?Promise.resolve(fs.readFileSync(file)):null;}
}
async function open(saved,hash=''){
  const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
  const dom=new JSDOM(fs.readFileSync(path.join(root,'index.html'),'utf8'),{url:'https://cfp.test/'+hash,runScripts:'dangerously',resources:new LocalResources(),pretendToBeVisual:true,virtualConsole:vc,beforeParse(w){
    w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};w.confirm=()=>true;
    w.URL.createObjectURL=()=> 'blob:local';w.URL.revokeObjectURL=()=>{};w.HTMLAnchorElement.prototype.click=function(){};
    if(saved)w.localStorage.setItem('cfpStudyHome.v1',saved);
  }});
  opened.push(dom);
  await new Promise(r=>dom.window.addEventListener('load',()=>setTimeout(r,15)));
  return {dom,w:dom.window,errors,eval:s=>dom.window.eval(s),click:(sel)=>{const el=dom.window.document.querySelector(sel);assert.ok(el,'Missing '+sel);el.click();},saved:()=>dom.window.localStorage.getItem('cfpStudyHome.v1')};
}
function finish(a){
  for(let i=0;i<100&&a.eval('!!S.coach.active');i++){
    const s=a.eval('S.coach.active.steps[S.coach.active.index]');
    if(s.type==='lesson'){if(!s.revealed)a.click('[data-caction="lesson-reveal"]');a.click('[data-caction="next"]');}
    else if(s.type==='case'){if(!s.revealed)a.click('[data-caction="case-reveal"]');a.click('[data-caction="case-done"]');}
    else{if(!s.result)a.click('[data-caction="answer"][data-value="'+s.q.a+'"]');a.click('[data-caction="next"]');}
  }
  assert.equal(a.eval('S.coach.active'),null);
}
test('fresh boot, 3-minute session, duplicate click guard, saved resume and recap',async()=>{
  let a=await open();assert.deepEqual(a.errors,[]);assert.ok(a.w.document.querySelector('#coachHome h2'));
  assert.ok(!a.w.document.querySelector('#schedCard').textContent.includes('NaN'));
  a.eval('CFPCoach.launch(3)');assert.equal(a.eval('S.coach.active.steps.length'),3);
  const q=a.eval('S.coach.active.steps[0].q'),wrong=(q.a+1)%q.o.length;
  a.click('[data-caction="answer"][data-value="'+wrong+'"]');a.click('[data-caction="answer"][data-value="'+wrong+'"]');
  assert.equal(a.eval('S.attempts.length'),1);assert.equal(a.eval('S.coach.active.steps[0].result.ok'),false);
  const saved=a.saved();a.dom.window.close();a=await open(saved,'#coach');
  assert.equal(a.eval('S.coach.active.steps[0].result.ok'),false);finish(a);
  assert.equal(a.eval('Object.keys(S.coach.completed).length'),1);assert.equal(a.eval('S.attempts.length'),3);
  assert.ok(a.w.document.querySelector('#coach').textContent.includes('2 / 3'));
  assert.deepEqual(a.errors,[]);a.dom.window.close();
});
test('10- and 25-minute paths include learning and client teach-back; self-check is not graded accuracy',async()=>{
  for(const n of [10,25]){const a=await open();a.eval('CFPCoach.launch('+n+')');
    assert.ok(a.eval('S.coach.active.steps.some(x=>x.type==="lesson")'));assert.ok(a.eval('S.coach.active.steps.some(x=>x.type==="case")'));
    const questions=a.eval('S.coach.active.steps.filter(x=>x.q).length');finish(a);
    assert.equal(a.eval('S.attempts.length'),questions);assert.equal(a.eval('Object.values(S.coach.completed)[0].caseDone'),true);
    assert.deepEqual(a.errors,[]);a.dom.window.close();}
});
test('case notes safely persist and restore; skip reminder and preferences work',async()=>{
  let a=await open();a.eval('CFPCoach.launch(10,"case-only")');
  const input=a.w.document.querySelector('#coachDraft');input.value='<img src=x onerror=alert(1)> Useful notes';input.dispatchEvent(new a.w.Event('input',{bubbles:true}));
  a.click('[data-caction="case-reveal"]');assert.equal(a.w.document.querySelector('#coach img'),null);
  a.w.document.querySelector('[data-coach-check="0"]').click();const saved=a.saved();a.dom.window.close();
  a=await open(saved,'#coach');assert.equal(a.w.document.querySelector('#coachDraft').value,input.value);assert.equal(a.w.document.querySelector('[data-coach-check="0"]').checked,true);
  finish(a);a.eval('go("mobile")');a.w.document.querySelector('#coachDays').value='5';a.w.document.querySelector('#coachReminderOn').checked=true;a.click('[data-caction="save-settings"]');
  assert.equal(a.eval('S.coach.settings.shortGoal'),5);assert.equal(a.eval('S.coach.settings.reminders'),true);a.click('[data-caction="calendar"]');
  assert.ok(a.w.document.querySelector('#coachSettingsStatus').textContent.includes('Calendar file prepared'));
  assert.deepEqual(a.errors,[]);a.dom.window.close();
});
test('legacy progress preserved; independent domain evidence, generated coverage, sync idempotency',async()=>{
  const a=await open();a.eval(`S.attempts=[{mod:'FP511',domain:'A',correct:1,src:'mcq',conf:2,ts:Date.now()}];S.seen={FP511:{}};S.cards.c0={ease:2.5,reps:2};save();`);
  const saved=a.saved();a.dom.window.close();const b=await open(saved);
  assert.equal(b.eval('S.attempts.length'),1);assert.equal(b.eval('S.cards.c0.reps'),2);
  assert.ok(b.eval('domainReadiness(DOMAINS.find(d=>d.k==="A")).score')>0);
  assert.equal(b.eval('domainReadiness(DOMAINS.find(d=>d.k==="H")).score'),0);
  assert.equal(b.eval('JSON.stringify(mergeState(S,S))===JSON.stringify(S)'),true);
  b.eval('go("analytics")');assert.ok(b.w.document.querySelector('#calNote').textContent.includes('Your own recall ratings'));
  b.eval('var _q=MCQ.find(q=>q.g);markSeen(_q.m,"q:"+mcqKey(_q));');
  assert.ok(b.eval('moduleMastery(_q.m,moduleOf(_q))')>=0);
  assert.deepEqual(b.errors,[]);b.dom.window.close();
});
test('ordinary quiz and flashcards keep immediate feedback and all card filters',async()=>{
  const a=await open();a.eval('go("study");runQuiz("FP512")');
  a.click('#opts .opt');assert.ok(a.w.document.querySelector('#rev').textContent.length>5);
  assert.equal(a.eval('S.attempts[S.attempts.length-1].conf'),null);assert.equal(a.eval('Object.keys(S.coach.reviews).length'),1);
  a.eval('window.MODF="ALL";window.CARDFILTER="all";window.TIERF="all";runFlash("FP512")');
  assert.ok(a.w.document.querySelector('#flashface'));assert.deepEqual(a.errors,[]);a.dom.window.close();
});
test('active-time measurement ignores hidden and idle time and preserves legacy counters',async()=>{
  const a=await open();a.eval('S.sessions.legacy=50;CFPCoach.launch(3);var _realNow=Date.now;var _now=_realNow();Date.now=()=>_now;');
  a.eval('_now+=5000;CFPActivity.flush()');const first=a.eval('Object.values(S.coach.time).reduce((n,x)=>n+x.ms,0)');assert.ok(first>=5000&&first<7000);
  Object.defineProperty(a.w.document,'visibilityState',{configurable:true,value:'hidden'});
  a.eval('_now+=5000;CFPActivity.flush()');assert.equal(a.eval('Object.values(S.coach.time).reduce((n,x)=>n+x.ms,0)'),first);
  Object.defineProperty(a.w.document,'visibilityState',{configurable:true,value:'visible'});
  a.eval('_now+=120000;CFPActivity.flush()');assert.equal(a.eval('Object.values(S.coach.time).reduce((n,x)=>n+x.ms,0)'),first);
  assert.equal(a.eval('S.sessions.legacy'),50);assert.ok(+a.eval('totalHours()')<0.1);
  a.dom.window.close();
});
test('return from a reader merges its measured time without losing an active session',async()=>{
  const a=await open();a.eval('CFPCoach.launch(3)');const id=a.eval('S.coach.active.id');
  const other=JSON.parse(a.saved());other.coach.time.reader={day:'2026-10-13',ms:9000,at:Date.now()};
  a.w.dispatchEvent(new a.w.StorageEvent('storage',{key:'cfpStudyHome.v1',newValue:JSON.stringify(other)}));
  assert.equal(a.eval('S.coach.time.reader.ms'),9000);assert.equal(a.eval('S.coach.active.id'),id);
  a.dom.window.close();
});
test('three free-study questions count a day once and stop the in-app reminder',async()=>{
  const a=await open();a.eval('go("study");runQuiz("FP512")');
  for(let i=0;i<3;i++){a.click('#opts .opt');a.click('.revnext .btn');}
  assert.equal(a.eval('CFPCoachCore.stats(S.coach,S.attempts).days'),1);
  assert.equal(a.eval('CFPCoachCore.stats(S.coach,S.attempts).completedToday'),true);
  a.dom.window.close();
});
test('all new assets are offline-cached and case source tabs exist',()=>{
  const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
  for(const f of ['coach.js','coach-core.js','coach.css','coach-cases.js','study-activity.js']){assert.ok(sw.includes("'./"+f+"'"));assert.ok(fs.existsSync(path.join(root,f)));}
  const vm=require('node:vm'),ctx={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'coach-cases.js'),'utf8'),ctx);
  assert.equal(ctx.window.CFP_CLIENT_CASES.length,10);
  for(const c of ctx.window.CFP_CLIENT_CASES){const [file,hash]=c.source.split('#'),html=fs.readFileSync(path.join(root,file),'utf8');assert.ok(html.includes('data-tab="'+hash+'"'),c.id+' source tab');}
});

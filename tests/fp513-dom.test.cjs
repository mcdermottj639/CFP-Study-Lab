/* FP513 DOM integration (jsdom; set NODE_PATH to a node_modules with jsdom@26). */
const test = require('node:test'), assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path');
const { JSDOM, ResourceLoader, VirtualConsole } = require('jsdom');
const root = path.resolve(__dirname, '..');
const opened = []; test.after(() => opened.forEach((d) => d.window.close()));
class Local extends ResourceLoader {
  fetch(url) {
    const p = new URL(url).pathname.slice(1);
    if (p === 'vendor/chart.umd.js') return Promise.resolve(Buffer.from('window.Chart=function(){this.destroy=function(){}};'));
    if (p === 'cfp-gist-sync.js') return Promise.resolve(Buffer.from('/* sync excluded */'));
    const f = path.resolve(root, p); return f.startsWith(root + path.sep) && fs.existsSync(f) ? Promise.resolve(fs.readFileSync(f)) : null;
  }
}
async function open(saved, hash = '') {
  const errors = [], vc = new VirtualConsole(); vc.on('jsdomError', (e) => errors.push(e.message));
  const dom = new JSDOM(fs.readFileSync(path.join(root, 'index.html'), 'utf8'), { url: 'https://cfp.test/' + hash, runScripts: 'dangerously', resources: new Local(), pretendToBeVisual: true, virtualConsole: vc, beforeParse(w) {
    w.scrollTo = () => {}; w.HTMLElement.prototype.scrollIntoView = () => {}; w.confirm = () => true; w.URL.createObjectURL = () => 'blob:x'; w.URL.revokeObjectURL = () => {};
    if (saved) w.localStorage.setItem('cfpStudyHome.v1', saved);
  } });
  opened.push(dom);
  await new Promise((r) => dom.window.addEventListener('load', () => setTimeout(r, 15)));
  return { dom, w: dom.window, errors, eval: (s) => dom.window.eval(s), $: (s) => dom.window.document.querySelector(s), saved: () => dom.window.localStorage.getItem('cfpStudyHome.v1') };
}

// A v2.113.0-era save: FP512 in progress, card states on FP511/FP512 indices, attempts, coach reviews, a deadline.
const LEGACY = JSON.stringify({ cards: { c0: { ease: 2.5, reps: 3, intj: 6, due: '2026-12-01' }, c578: { ease: 2.1, reps: 1, flag: true } }, attempts: [{ mod: 'FP512', domain: 'C', topic: 'Risk Principles', correct: 1, ts: 1790000000000, src: 'mcq', questionKey: 'x' }],
  misses: [], sessions: { '2026-10-01': 4 }, mastery: { FP512: { n: 10, c: 8 } }, seen: { FP512: { 'q:x': 1 } }, mcqDue: {}, newSeen: {}, modReady: { FP512_1: { score: 80, ts: '2026-10-01' } }, objChecked: {}, history: [{ d: '2026-10-01', r: 22 }],
  newPerDay: 0, examDate: '2027-03-10', goal: 30, courseDue: { FP512: '2026-11-01' }, coursePassed: {}, lastStudy: '2026-10-01', streak: 2 });

test('upgrade from v2.113.0 keeps every record; FP512 shows passed; FP513 active with the verified deadline', async () => {
  const a = await open(LEGACY);
  assert.deepEqual(a.errors, []);
  assert.equal(a.eval('S.cards.c0.reps'), 3); assert.equal(a.eval('S.cards.c578.flag'), true);
  assert.equal(a.eval('S.attempts.length'), 1); assert.equal(a.eval('S.modReady.FP512_1.score'), 80); assert.equal(a.eval('S.history[0].d'), '2026-10-01');
  assert.equal(a.eval('S.courseDue.FP512'), '2026-11-01', 'existing FP512 date untouched');
  assert.equal(a.eval('S.coursePassed.FP512'), true); assert.equal(a.eval('S.courseDue.FP513'), '2027-02-15');
  assert.equal(a.eval('MODULES.find(m=>m.id==="FP513").status'), 'current'); assert.equal(a.eval('MODULES.find(m=>m.id==="FP512").status'), 'done');
  // one-time: if Jack un-ticks FP512 it stays un-ticked across reloads
  a.eval('S.coursePassed.FP512=false;save()'); const s = a.saved(); a.dom.window.close();
  const b = await open(s); assert.equal(b.eval('S.coursePassed.FP512'), false); assert.equal(b.eval('S.cards.c0.reps'), 3);
  assert.equal(b.eval('JSON.stringify(mergeState(S,S))===JSON.stringify(S)'), true, 'merge stays idempotent'); b.dom.window.close();
});

test('Today shows the FP513 card; Continue FP513 starts an FP513-only session in the current module', async () => {
  const a = await open(LEGACY);
  const card = a.$('#fp513Today'); assert.ok(card, 'FP513 card'); assert.match(card.textContent, /FP513 · Investment Planning/); assert.match(card.textContent, /Module 1/); assert.match(card.textContent, /LO 1\.1\.1/);
  assert.match(card.textContent, /0\/48/); assert.ok(!/NaN|undefined/.test(card.textContent));
  // Today's focus and the coach hero follow the FP513 sequence (Module 1 first), not the module with the most cards
  assert.match(a.$('#todayPlan').textContent, /FP513 Module 1/); assert.match(a.$('#coachHome').textContent, /Securities Markets/);
  a.eval('S.attempts.push({mod:"FP512",domain:"C",topic:"x",correct:1,ts:1790000000001,src:"mcq",questionKey:mcqKey(MCQ.find(q=>q.m==="FP512"))});save()');
  a.$('[data-fp5="continue"]').click();
  const steps = a.eval('S.coach.active.steps.map(s=>s.q?s.q.m+"|"+(s.q.lo||""):s.type)');
  assert.ok(steps.some((s) => /^FP513\|LO 1\./.test(s)), 'module-1 FP513 questions: ' + steps.join(','));
  assert.equal(a.eval('S.coach.active.focus.course'), 'FP513');
  assert.ok(steps.every((s) => !/^FP51[12]\|/.test(s)), 'no FP511/FP512 questions in an FP513 session (v2.117.0): ' + steps.join(','));
  assert.deepEqual(a.errors, []); a.dom.window.close();
});

// v2.117.0 regression — Jack: "Continue FP513" resumed an unfinished FP512 session and pulled 39 FP511/FP512 reviews in.
test('switching FP512 → FP513: unfinished FP512 session is parked, overdue older reviews stay out, Mixed review has them', async () => {
  const a = await open(LEGACY);
  // an unfinished FP512 session with one answered question
  a.eval('CFPCoach.launch(10,null,{course:"FP512",mod:1},true)');
  assert.equal(a.eval('S.coach.active.focus.course'), 'FP512');
  const fp512Id = a.eval('S.coach.active.id');
  a.eval('S.coach.active.index=1;save()');
  // overdue reviews from FP511 and FP512
  a.eval('MCQ.filter(q=>q.m==="FP512"||q.m==="FP511").slice(0,39).forEach(function(q){S.coach.reviews[CFPCoachCore.key(q)]={qKey:CFPCoachCore.key(q),course:q.m,due:"2026-01-01",lastDay:"2025-12-31",at:1,step:0,wrong:1,checks:0,retained:false};});save()');
  a.$('[data-fp5="continue"]').click();
  const act = a.eval('({c:S.coach.active.focus.course, ms:S.coach.active.steps.filter(x=>x.q).map(x=>x.q.m)})');
  assert.equal(act.c, 'FP513', 'Continue FP513 opens FP513, not the saved FP512 session');
  assert.ok(act.ms.length && act.ms.every((m) => m === 'FP513'), 'FP513-only questions: ' + act.ms.join(','));
  assert.equal(a.eval('S.coach.parked.FP512.id'), fp512Id, 'FP512 session kept'); assert.equal(a.eval('S.coach.parked.FP512.index'), 1, 'its place kept');
  assert.match(a.$('#coachHome') ? (a.eval('CFPCoach.home(),document.getElementById("coachHome").textContent')) : '', /Saved .*session · step 2/);
  // pressing Continue FP513 again resumes the same FP513 session
  const fp513Id = a.eval('S.coach.active.id'); a.$('[data-fp5="continue"]').click(); assert.equal(a.eval('S.coach.active.id'), fp513Id);
  // survives a reload and a sync merge
  a.eval('save()'); const saved = a.saved(); a.dom.window.close();
  const b = await open(saved);
  assert.equal(b.eval('S.coach.parked.FP512.id'), fp512Id);
  assert.equal(b.eval('JSON.stringify(mergeState(S,S))===JSON.stringify(S)'), true, 'merge stays idempotent with a parked session');
  // resuming the saved FP512 session parks FP513 the same way
  b.eval('CFPCoach.unpark("FP512")'); assert.equal(b.eval('S.coach.active.id'), fp512Id); assert.equal(b.eval('S.coach.parked.FP513.id'), fp513Id);
  // Mixed review is where FP511/FP512 overdue items go
  b.eval('CFPCoach.launch(10,"mixed")');
  assert.equal(b.eval('S.coach.active.kind'), 'mixed');
  assert.ok(b.eval('S.coach.active.steps.filter(x=>x.q).some(x=>x.q.m!=="FP513")'), 'mixed review includes older courses');
  assert.ok(b.eval('!!S.coach.parked.FP512 && !!S.coach.parked.FP513'), 'both course sessions still parked');
  assert.equal(b.eval('S.attempts.length'), 1, 'no progress records added or lost by switching');
  assert.deepEqual(b.errors, []); b.dom.window.close();
});

test('FP513 is selectable in Study, all 9 modules filter, Module Hub opens with objectives and calc drills', async () => {
  const a = await open();
  a.eval('go("study")'); assert.equal(a.$('#studyModule').value, 'FP513', 'Study defaults to FP513');
  a.eval('fillModuleNumSelect && fillModuleNumSelect("FP513")');
  const opts = [...a.w.document.querySelectorAll('#studyModuleNum option')].map((o) => o.value);
  for (let m = 1; m <= 9; m++) assert.ok(opts.includes(String(m)), 'module ' + m);
  for (let m = 1; m <= 9; m++) { a.eval('openModule("FP513",' + m + ')'); const t = a.$('#modhub').textContent; assert.ok(t.length > 200, 'hub ' + m); }
  a.eval('openModule("FP513",4)'); assert.match(a.$('#modhub').textContent, /Calc drills|calc/i);
  assert.deepEqual(a.errors, []); a.dom.window.close();
});

test('calculation lab: FP513 drill shows assumptions, tolerance, formula, inputs and diagnoses a known mistake', async () => {
  const a = await open();
  a.eval('go("study");window.MODF="7";runCalc("FP513")');
  assert.match(a.$('#studyArea').textContent, /accepted within/);
  // force a known drill: taxable-equivalent yield, answer with the classic (1 − t) multiplication mistake
  a.eval('window._fx=FP513CALC.drills.find(d=>d.id==="tey");');
  a.eval('(function(){var g=window._fx,c=g.gen(null,{muni:0.03,t:0.24});document.getElementById("studyArea").innerHTML="<div id=calcrev></div><input id=calcin>";document.getElementById("calcin").value=String(3*0.76);window._probe=calcSolutionHtml(c,3*0.76,false);})()');
  const html = a.eval('window._probe');
  assert.match(html, /Formula:/); assert.match(html, /after-tax yield of a taxable bond/);
  assert.deepEqual(a.errors, []); a.dom.window.close();
});

test('cumulative forms A/B: ~42 cross-module questions, scored, with objective diagnostics; Kaplan log is manual', async () => {
  const a = await open();
  const nA = a.eval('FP513COURSE.buildForm("A").length'), nB = a.eval('FP513COURSE.buildForm("B").length');
  assert.ok(nA >= 38 && nB >= 38, nA + '/' + nB);
  assert.equal(a.eval('new Set(FP513COURSE.buildForm("A").map(q=>moduleOf(q))).size'), 9);
  assert.equal(a.eval('FP513COURSE.buildForm("A").filter(q=>!q.g).every(q=>FP513COURSE.buildForm("B").filter(x=>!x.g).every(x=>x.q!==q.q))'), true, 'forms A and B never share a static question');
  a.eval('FP513COURSE.runForm("A")');
  for (let i = 0; i < 60 && a.$('#opts .opt'); i++) a.$('#opts .opt').click();
  await new Promise((r) => setTimeout(r, 20));
  assert.match(a.$('#studyArea').textContent, /Objective-level diagnostics/);
  assert.equal(a.eval('S.fp513.forms.length'), 1);
  a.eval('go("analytics")');
  const an = a.$('#fp513Analytics'); assert.ok(an); assert.match(an.textContent, /First-try accuracy/); assert.match(an.textContent, /no pass probability/);
  a.$('#fp5OffScore').value = '84'; a.$('#fp5OffAdd').click();
  assert.equal(a.eval('S.fp513.official.length'), 1); assert.equal(a.eval('S.fp513.official[0].score'), 84);
  // merge keeps both devices' Kaplan entries
  assert.equal(a.eval('mergeState(S,{fp513:{official:[{id:"k1",date:"2026-12-01",kind:"Final exam",score:90}]}}).fp513.official.length'), 2);
  assert.deepEqual(a.errors, []); a.dom.window.close();
});

test('FP513 reader: tabs, LO deep link, bookmarks and Teach narration load without errors', async () => {
  const errors = [], vc = new VirtualConsole(); vc.on('jsdomError', (e) => errors.push(e.message));
  const dom = new JSDOM(fs.readFileSync(path.join(root, 'apps/fp513-reading.html'), 'utf8'), { url: 'https://cfp.test/apps/fp513-reading.html#lo-4.1.2', runScripts: 'dangerously', resources: new Local(), pretendToBeVisual: true, virtualConsole: vc,
    beforeParse(w) { w.scrollTo = () => {}; w.HTMLElement.prototype.scrollIntoView = () => {}; w.speechSynthesis = { getVoices: () => [], speak() {}, cancel() {}, addEventListener() {} }; } });
  opened.push(dom);
  await new Promise((r) => dom.window.addEventListener('load', () => setTimeout(r, 40)));
  const d = dom.window.document;
  assert.equal(d.querySelector('.tab-btn.active').getAttribute('data-tab'), 'valuation', 'deep link opens the LO tab');
  assert.equal(d.querySelectorAll('.tab-btn').length, 11);
  const star = d.querySelector('#lo-4\\.1\\.2 .fp5-bm'); assert.ok(star); star.click();
  assert.match(dom.window.localStorage.getItem('fp513ReaderBookmarks'), /lo-4\.1\.2/);
  assert.ok(dom.window.READER_TEACH['fp513-reading.html'].valuation.length >= 6);
  assert.deepEqual(errors.filter((e) => !/speechSynthesis|Not implemented/.test(e)), []); dom.window.close();
});

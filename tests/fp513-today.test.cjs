/* FP513 Today Learning Command Center (v2.118.0, issue #8). jsdom; NODE_PATH -> node_modules with jsdom@26. */
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


// A v2.113.0-era save (same as fp513-dom.test.cjs): FP512 in progress, CFP exam date 2027-03-10.
const LEGACY = JSON.stringify({ cards: { c0: { ease: 2.5, reps: 3, intj: 6, due: '2026-12-01' }, c578: { ease: 2.1, reps: 1, flag: true } }, attempts: [{ mod: 'FP512', domain: 'C', topic: 'Risk Principles', correct: 1, ts: 1790000000000, src: 'mcq', questionKey: 'x' }],
  misses: [], sessions: { '2026-10-01': 4 }, mastery: { FP512: { n: 10, c: 8 } }, seen: { FP512: { 'q:x': 1 } }, mcqDue: {}, newSeen: {}, modReady: { FP512_1: { score: 80, ts: '2026-10-01' } }, objChecked: {}, history: [{ d: '2026-10-01', r: 22 }],
  newPerDay: 0, examDate: '2027-03-10', goal: 30, courseDue: { FP512: '2026-11-01' }, coursePassed: {}, lastStudy: '2026-10-01', streak: 2 });
const day = (d, h = 10) => new Date(2026, 10, d, h).getTime();   // local time, Nov 2026
// helpers evaluated in the page: two distinct static questions of one objective, and a generator key
const SETUP = `window.Q = (lo) => MCQ.filter(q => q.m === 'FP513' && q.lo === lo && !q.g);
  window.att = (q, ok, ts) => { S.attempts.push({ mod: 'FP513', domain: q.d, topic: q.t, correct: ok ? 1 : 0, conf: null, ts: ts, src: 'mcq', questionKey: mcqKey(q) }); };
  window.st = (lo) => FP513COURSE.loStatus()[lo];`;

test('fresh account: compact header, two labelled countdowns, neutral 0/4 metrics, Not started, no NaN', async () => {
  const a = await open(LEGACY);
  const t = a.$('#fp513Today'); assert.ok(t);
  assert.match(t.textContent, /FP513 · Investment Planning/);
  assert.match(t.textContent, /days of Kaplan access/); assert.match(t.textContent, /days to CFP exam/);
  const m = [...t.querySelectorAll('.fp5-metric')].map((x) => x.textContent);
  assert.deepEqual(m, ['0/4Attempted', '0/4Proficient', '0/4Recalled later']);
  assert.match(t.querySelector('.fp5-obj').textContent, /LO 1\.1\.1/); assert.match(t.querySelector('.fp5-obj').textContent, /Not started/);
  assert.match(t.querySelector('.fp5-obj').textContent, /book p\. 2/);
  assert.ok(t.querySelector('[data-fp5="continue"]').textContent.includes('Continue learning'));
  assert.ok(!/NaN|undefined|null/.test(t.textContent + a.$('#fp513Detail').innerHTML));
  assert.equal(a.eval('FP513COURSE.PROF.minKeys'), 2); assert.equal(a.eval('FP513COURSE.PROF.minAcc'), 0.7);
  assert.deepEqual(a.errors, []); a.dom.window.close();
});

test('evidence rules: one right or one wrong is not proficient; repeats and number variants are one question; recall needs a later day', async () => {
  const a = await open(); a.eval(SETUP);
  a.eval(`att(Q('LO 1.1.1')[0], true, ${day(10)})`);
  let s = a.eval(`st('LO 1.1.1')`); assert.equal(s.attempted, true); assert.equal(s.proficient, false); assert.equal(s.status, 'practice'); assert.equal(s.thin, true);
  a.eval(`att(Q('LO 1.2.1')[0], false, ${day(10)})`); assert.equal(a.eval(`st('LO 1.2.1').proficient`), false);
  // the same question right five times = one key
  a.eval(`for (let i = 0; i < 5; i++) att(Q('LO 1.1.1')[0], true, ${day(10)} + i)`); assert.equal(a.eval(`st('LO 1.1.1').proficient`), false);
  // generator variants share their key (q.g) — fresh numbers never add a second question
  const gen = a.eval(`(MCQ.find(q => q.m === 'FP513' && q.g && q.lo) || {}).lo || ''`);
  if (gen) {
    a.eval(`(function(){ const g = MCQ.find(q => q.m === 'FP513' && q.g && q.lo === '${gen}'); for (let i = 0; i < 4; i++) att(mcqFresh(g), true, ${day(10)} + i); })()`);
    assert.equal(a.eval(`st('${gen}').nKeys`), 1, 'numeric variants = one key'); assert.equal(a.eval(`st('${gen}').proficient`), false);
  }
  // a second distinct question right -> proficient on day 10; same-day correct is not "recalled later"
  a.eval(`att(Q('LO 1.1.1')[1], true, ${day(10, 14)})`); s = a.eval(`st('LO 1.1.1')`);
  assert.equal(s.proficient, true); assert.equal(s.recalled, false); assert.equal(s.profDay, '2026-11-10');
  a.eval(`att(Q('LO 1.1.1')[0], true, ${day(10, 22)})`); assert.equal(a.eval(`st('LO 1.1.1').recalled`), false, 'same local day');
  a.eval(`att(Q('LO 1.1.1')[1], true, ${day(11, 8)})`); assert.equal(a.eval(`st('LO 1.1.1').recalled`), true, 'next local day');
  // latest answers mostly wrong -> back to Needs practice (history kept, never auto-passed)
  a.eval(`att(Q('LO 1.1.1')[0], false, ${day(12)}); att(Q('LO 1.1.1')[1], false, ${day(12)} + 1)`);
  s = a.eval(`st('LO 1.1.1')`); assert.equal(s.proficient, false); assert.equal(s.status, 'practice'); assert.equal(s.recalled, true, 'recall history kept');
  // flashcard attempts never count
  a.eval(`S.attempts.push({mod:'FP513',topic:'x',correct:1,ts:${day(12)},src:'card'})`); assert.equal(a.eval(`st('LO 1.3.1').attempted`), false);
  a.eval('save(); FP513COURSE.todayCard()');
  const m = [...a.$('#fp513Today').querySelectorAll('.fp5-metric b')].map((x) => x.textContent);
  assert.deepEqual(m, ['2/4', '0/4', '1/4']);
  assert.deepEqual(a.errors, []); a.dom.window.close();
});

test('review due status, Module 9 as integrated-case progress, partial M1–M8 with no 0/0 or NaN, never locked', async () => {
  const a = await open(); a.eval(SETUP);
  const k = a.eval(`mcqKey(Q('LO 2.1.1')[0])`);
  a.eval(`att(Q('LO 2.1.1')[0], false, ${day(10)}); S.coach.reviews[${JSON.stringify(k)}] = { qKey: ${JSON.stringify(k)}, course: 'FP513', due: '2026-01-01', step: 0 }; save()`);
  assert.equal(a.eval(`st('LO 2.1.1').status`), 'due');
  // touch every M1–M8 objective once
  a.eval(`FP513COURSE.LOS.forEach((l, i) => { const q = Q(l.id)[0]; if (q) att(q, i % 2 === 0, ${day(10)} + i); }); save()`);
  a.eval(`FP513COURSE.select({ mod: 9 })`);
  const t = a.$('#fp513Today');
  assert.match(t.textContent, /Integrated case/); assert.ok(!/0\/0|NaN|undefined/.test(t.textContent), t.textContent);
  assert.match(t.querySelector('.fp5-metric span').textContent, /Attempted/);
  const total = a.eval(`FP513COURSE.caseStatus().total`); assert.ok(total >= 20, 'case items: ' + total);
  a.eval(`att(MCQ.find(q => q.m === 'FP513' && moduleOf(q) === 9), false, ${day(11)}); FP513COURSE.todayCard()`);
  assert.equal(t.querySelector('.fp5-metric b').textContent, '1/' + total);
  // modules are all selectable (no lock); recommendation is separate from proficiency
  for (let m = 1; m <= 9; m++) { a.eval(`FP513COURSE.select({ mod: ${m} })`); assert.match(a.$('#fp513Today .fp5-mod').textContent, new RegExp('Module ' + m)); }
  assert.equal(a.eval('FP513COURSE.currentModule(FP513COURSE.evidence())'), 9, 'every LO attempted -> recommended module advances');
  assert.equal(a.eval(`Object.values(FP513COURSE.loStatus()).filter(x => x.proficient).length`), 0, '…but nothing is proficient');
  assert.deepEqual(a.errors, []); a.dom.window.close();
});

test('navigator: picking an objective updates the detail page in place; Back to recommended; Practice runs that objective only', async () => {
  const a = await open();
  a.eval(`FP513COURSE.select({ mod: 4 })`);
  const det = a.$('#fp513Detail'); const before = det;
  a.$('[data-fp5lo="LO 4.1.2"]').click();
  assert.equal(a.$('#fp513Detail'), before, 'same node, no remount');
  assert.match(a.$('#fp513Detail').textContent, /LO 4\.1\.2/); assert.match(a.$('#fp513Detail').textContent, /Duration and convexity/);
  assert.match(a.$('#fp513Today .fp5-obj').textContent, /LO 4\.1\.2/); assert.ok(a.$('#fp513Today .fp5-nav').open, 'navigator stays open');
  assert.ok(a.$('#fp513Today [data-fp5="calc"]'), 'calc link where the objective has calculations');
  assert.equal(a.eval('JSON.parse(localStorage.getItem("cfp:fp513-sel")).lo'), 'LO 4.1.2');
  // Practice: exact objective
  a.$('#fp513Today [data-fp5="practice"]').click();
  assert.match(a.$('#studyArea').textContent, /LO 4\.1\.2/);
  a.$('#opts .opt').click();
  assert.equal(a.eval(`FP513COURSE.loStatus()['LO 4.1.2'].n`), 1, 'answer recorded against the objective');
  a.eval('go("dash")'); a.$('[data-fp5="reset"]').click();
  assert.match(a.$('#fp513Today .fp5-obj').textContent, /LO 1\.1\.1/); assert.equal(a.eval('localStorage.getItem("cfp:fp513-sel")'), null);
  assert.deepEqual(a.errors, []); a.dom.window.close();
});

test('Continue learning parks an FP512 session, opens FP513 only, leads with the picked objective, and resumes on a second tap', async () => {
  const a = await open(LEGACY);
  a.eval('CFPCoach.launch(10,null,{course:"FP512",mod:1},true)'); const id512 = a.eval('S.coach.active.id');
  a.eval('MCQ.filter(q=>q.m==="FP512"||q.m==="FP511").slice(0,39).forEach(function(q){S.coach.reviews[CFPCoachCore.key(q)]={qKey:CFPCoachCore.key(q),course:q.m,due:"2026-01-01",step:0};});save();go("dash")');
  a.eval(`FP513COURSE.select({ lo: 'LO 6.2.1' })`);
  a.$('#fp513Today [data-fp5="continue"]').click();
  const s = a.eval('({c:S.coach.active.focus.course, lo:S.coach.active.focus.lo, ms:S.coach.active.steps.filter(x=>x.q).map(x=>x.q.m+"|"+(x.q.lo||""))})');
  assert.equal(s.c, 'FP513'); assert.equal(s.lo, 'LO 6.2.1');
  assert.ok(s.ms.every((m) => /^FP513\|/.test(m)), s.ms.join(','));
  assert.match(s.ms[0], /LO 6\.2\.1/, 'picked objective first: ' + s.ms.join(','));
  assert.equal(a.eval('S.coach.parked.FP512.id'), id512);
  const id513 = a.eval('S.coach.active.id'); a.eval('go("dash")'); a.$('#fp513Today [data-fp5="continue"]').click(); assert.equal(a.eval('S.coach.active.id'), id513);
  for (let i = 0; i < 3; i++) { a.eval('CFPCoach.unpark("FP512")'); a.eval('go("dash")'); a.$('#fp513Today [data-fp5="continue"]').click(); }
  assert.equal(a.eval('S.coach.active.id'), id513); assert.equal(a.eval('S.coach.parked.FP512.id'), id512, 'switching repeatedly keeps both sessions');
  assert.equal(a.eval('JSON.stringify(mergeState(S,S))===JSON.stringify(S)'), true);
  assert.deepEqual(a.errors, []); a.dom.window.close();
});

test('metric tap opens Analytics filtered to that module, with the metric column marked; Read deep-links the objective', async () => {
  const a = await open();
  a.eval(`FP513COURSE.select({ mod: 7 })`);
  a.$('#fp513Today [data-fp5ev="recalled"]').click();
  assert.equal(a.eval('document.getElementById("analytics").classList.contains("hidden")'), false);
  const ev = a.$('#fp5Evidence'); assert.ok(ev); assert.match(ev.textContent, /Module 7/); assert.match(ev.textContent, /LO 7\.4\.1/);
  assert.ok(ev.querySelector('th.fp5-hl').textContent.includes('Recalled later'));
  ev.querySelector('[data-fp5evmod="2"]').click(); assert.match(a.$('#fp5Evidence').textContent, /LO 2\.5\.1/);
  a.eval('go("dash")'); a.eval(`FP513COURSE.select({ lo: 'LO 3.5.1' })`);
  assert.equal(a.eval('FP513COURSE.readUrl()'), 'apps/fp513-reading.html#lo-3.5.1');
  a.eval(`FP513COURSE.select({ mod: 9 })`); assert.match(a.eval('FP513COURSE.readUrl()'), /^apps\/fp513-reading\.html/);
  assert.deepEqual(a.errors, []);
  a.dom.window.close();
});

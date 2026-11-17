/* FP513 release checks: progress protection, reproducible builds, content integrity,
 * reader/Teach anchors, offline cache, and "no licensed textbook in the public repo". */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), os = require('node:os'), crypto = require('node:crypto'), cp = require('node:child_process');
const root = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

function arr(h, name) {
  const m = 'const ' + name + '=[', i = h.indexOf(m); let d = 0, s = false, e = false;
  for (let p = i + m.length - 1; p < h.length; p++) {
    const c = h[p];
    if (s) { if (e) e = false; else if (c === '\\') e = true; else if (c === '"') s = false; }
    else if (c === '"') s = true; else if (c === '[') d++; else if (c === ']') { d--; if (!d) return JSON.parse(h.slice(i + m.length - 1, p + 1)); }
  }
  throw new Error('array not found ' + name);
}
const html = read('index.html'), CARDS = arr(html, 'CARDS'), MCQ = arr(html, 'MCQ');
const fp = (a) => crypto.createHash('sha256').update(JSON.stringify(a.map((c) => [c.m, c.f]))).digest('hex');

test('flashcard progress is index-based: the 579 FP511/FP512 cards keep their exact order', () => {
  // Fingerprint of CARDS[0..578] at v2.113.0 (c4a9b59). Changing it would remap every saved card state.
  assert.equal(fp(CARDS.slice(0, 579)), '700828d50e530482036c08c7423510b897f7bc85962629882b84b921952fa132');
  assert.ok(CARDS.slice(579).every((c) => c.m === 'FP513'), 'FP513 cards are appended after FP511/FP512');
  // FP513's own order is now also progress-bearing: future content may only APPEND after these.
  const fpCards = JSON.parse(read('content/fp513.cards.json'));
  assert.deepEqual(CARDS.slice(579, 579 + fpCards.length).map((c) => c.f), fpCards.map((c) => c.f));
});

test('FP511/FP512 questions are unchanged and still first', () => {
  const old = MCQ.filter((q) => q.m !== 'FP513');
  assert.equal(old.length, 421);
  assert.ok(MCQ.slice(0, 421).every((q) => q.m !== 'FP513'));
  const H = (a) => crypto.createHash('sha256').update(JSON.stringify(a)).digest('hex');
  // exact content hashes of the v2.113.0 arrays (c4a9b59): FP511/FP512 text, options and keys untouched
  assert.equal(H(MCQ.slice(0, 421)), '71b616c125957bb469a9275d23a7b71ce8d1aaa87b6b7e2423252360a72b5dbe');
  assert.equal(H(CARDS.slice(0, 579)), '9118ae7dd7eaa8a5945588baebcf8d9dd00619b7035e7244310d090a703c00be');
});

test('generated FP513 files are in sync with their sources (build_fp513 --check)', () => {
  const r = cp.spawnSync(process.execPath, ['scripts/build_fp513.mjs', '--check'], { cwd: root, encoding: 'utf8' });
  assert.equal(r.status, 0, r.stdout + r.stderr);
});

test('a clean rebuild in a scratch copy reproduces index.html byte-for-byte', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'fp513-build-'));
  for (const d of ['src', 'scripts', 'content']) fs.cpSync(path.join(root, d), path.join(tmp, d), { recursive: true });
  for (const r of [['scripts/build_index.mjs'], ['scripts/add_content.mjs', 'add']]) {
    const out = cp.spawnSync(process.execPath, r, { cwd: tmp, encoding: 'utf8' });
    assert.equal(out.status, 0, out.stdout + out.stderr);
  }
  assert.equal(fs.readFileSync(path.join(tmp, 'index.html'), 'utf8'), html);
  fs.rmSync(tmp, { recursive: true, force: true });
});

test('importer refuses a rebuild that would drop a course', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'fp513-guard-'));
  for (const d of ['src', 'scripts', 'content']) fs.cpSync(path.join(root, d), path.join(tmp, d), { recursive: true });
  fs.rmSync(path.join(tmp, 'content/fp513.mcqs.json'));
  cp.spawnSync(process.execPath, ['scripts/build_index.mjs'], { cwd: tmp });
  const out = cp.spawnSync(process.execPath, ['scripts/add_content.mjs', 'add'], { cwd: tmp, encoding: 'utf8' });
  assert.notEqual(out.status, 0); assert.match(out.stderr, /FP513/);
  fs.rmSync(tmp, { recursive: true, force: true });
});

test('every FP513 item: schema, objective, module, rationale and generator wiring', () => {
  const los = JSON.parse(read('content/fp513/los.json')).map((l) => l.id);
  const vm = require('node:vm'), ctx = { window: {} };
  vm.runInNewContext(read('mcq-why-fp513.js'), ctx);
  const why = ctx.window.MCQWHY, calc = require('../fp513-calc.js');
  const f13 = MCQ.filter((q) => q.m === 'FP513');
  assert.equal(f13.length, 358);
  for (const q of f13) {
    assert.ok(los.includes(q.lo), 'lo ' + q.q.slice(0, 40));
    assert.equal(q.o.length, 4); assert.equal(new Set(q.o).size, 4); assert.ok(q.a >= 0 && q.a < 4);
    assert.ok(q.e && q.e.length <= 650, 'explanation length');
    if (q.g) { assert.ok(calc.mcqgen[q.g], 'generator ' + q.g); continue; }
    const w = why[q.q]; assert.ok(w, 'rationale for ' + q.q.slice(0, 50));
    assert.deepEqual(Object.keys(w).sort(), q.o.filter((_, i) => i !== q.a).sort(), 'rationale keys ' + q.q.slice(0, 40));
    assert.ok(!/INTRODUCTION|LEARNING OBJECTIVE|After completing this module/.test(q.e), 'no PDF bleed');
  }
  for (const c of CARDS.filter((c) => c.m === 'FP513')) assert.ok(los.includes(c.lo) && c.f.length > 10 && c.b.length > 2);
  // every LO has cards and questions
  for (const lo of los) {
    assert.ok(CARDS.some((c) => c.lo === lo), lo + ' cards');
    assert.ok(f13.filter((q) => q.lo === lo).length >= 4, lo + ' questions');
  }
  const cov = JSON.parse(read('content/fp513/coverage.json')).objectives;
  assert.equal(cov.length, 48); assert.ok(cov.every((r) => r.status === 'covered — reviewed'));
});

test('reader: every objective anchored, every hub/coach tab exists, Teach anchors resolve', () => {
  const r = read('apps/fp513-reading.html');
  for (const l of JSON.parse(read('content/fp513/los.json'))) assert.ok(r.includes('id="lo-' + l.id.slice(3) + '"'), l.id + ' anchor');
  const vm = require('node:vm'), w = { READER_MAP: {}, TAB_MAP: {}, MODOBJ: {}, MODSYN: {}, MODEX: {}, MODCHEAT: {} };
  vm.runInNewContext(read('module-content.js'), { window: w });
  for (const tab of Object.values(w.TAB_MAP.FP513)) assert.ok(r.includes('data-tab="' + tab + '"') && r.includes('id="tab-' + tab + '"'), tab);
  for (let m = 1; m <= 9; m++) { assert.ok(w.MODOBJ.FP513[m] && w.MODOBJ.FP513[m].length, 'objectives M' + m); assert.ok(w.MODCHEAT.FP513[m], 'cheat M' + m); }
  assert.ok(w.FP513_CASE && w.FP513_CASE.items.length >= 20, 'scenario item-set');
  const t = { window: {} }; vm.runInNewContext(read('reader-teach.js'), t);
  const teach = t.window.READER_TEACH['fp513-reading.html'];
  const heads = [...r.matchAll(/<h3>([\s\S]*?)<\/h3>/g)].map((m) => m[1].replace(/<[^>]+>/g, '').replace(/&middot;/g, '·').replace(/&amp;/g, '&').replace(/&[a-z]+;/g, ' ').toLowerCase());
  let n = 0;
  for (const [tab, list] of Object.entries(teach)) {
    assert.ok(r.includes('id="tab-' + tab + '"'), 'teach tab ' + tab);
    for (const e of list) { n++; assert.ok(heads.some((h) => h.includes(e.at.toLowerCase())), 'teach anchor "' + e.at + '"'); assert.ok(!/<[a-z]/i.test(e.say), 'plain text'); }
  }
  assert.ok(n >= 60, 'teach sections: ' + n);
  assert.ok(!/<script[^>]*>[^<]*(chartLifeCycle|chartRisk)/.test(r), 'no FP512 chart code copied');
});

test('offline: every precached asset exists; FP513 files are precached', () => {
  const sw = read('sw.js');
  const list = [...sw.matchAll(/'\.\/([^']*)'/g)].map((m) => m[1]).filter((p) => p && !p.endsWith('/'));
  for (const p of list) assert.ok(fs.existsSync(path.join(root, p)), 'missing precached ' + p);
  for (const p of ['fp513-calc.js', 'fp513-course.js', 'mcq-why-fp513.js', 'apps/fp513-reading.html']) assert.ok(list.includes(p), p + ' precached');
  assert.match(sw, /const VERSION = 'v2\.114\.0'/);
  assert.match(html, /v2\.114\.0/);
});

test('no licensed textbook text, PDF or answer key is published', () => {
  const tracked = cp.execSync('git ls-files --cached --others --exclude-standard', { cwd: root, encoding: 'utf8' }).split('\n');
  assert.ok(!tracked.some((f) => /\.pdf$/i.test(f) && /513/.test(f)), 'no FP513 PDF');
  assert.ok(!tracked.some((f) => /content\/fp513\/src\//.test(f) || /M\d\.txt$/.test(f)), 'no extracted textbook text');
  const pub = ['content/fp513.cards.json', 'content/fp513.mcqs.json', 'apps/fp513-reading.html'].map(read).join(' ');
  assert.ok(!/All rights reserved|may not be reproduced|Module \d Answer Key/i.test(pub), 'no copied front matter / answer keys');
  assert.ok(!/Madison/.test(read('content/fp513.mcqs.json')), 'Module 9 uses an original case, not the textbook case');
});

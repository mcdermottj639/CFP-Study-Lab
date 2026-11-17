// v2.115.0 iPhone Duo layouts — static guards (the rendered checks live in tests/duo-browser.cjs).
const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const root = path.resolve(__dirname, '..'), read = f => fs.readFileSync(path.join(root, f), 'utf8');
const splitSel = s => { const out = []; let d = 0, cur = ''; for (const c of s) { if (c === '(') d++; if (c === ')') d--; if (c === ',' && !d) { out.push(cur); cur = ''; } else cur += c; } out.push(cur); return out; };

test('every duo.css rule is keyed to a fold pose, the side strip, a duo element, or the short-screen query', () => {
  let css = read('duo.css').replace(/\/\*[\s\S]*?\*\//g, '');
  const SAFE = /data-duo-pose|pf-side-status|#duo[A-Z]|\.duo-/;
  const m = css.indexOf('@media (max-height: 720px)');
  assert.ok(m > 0, 'short-screen block present');
  css = css.slice(0, m) + css.slice(css.indexOf('\n}\n', m) + 3);
  assert.ok(!/@media/.test(css), 'only the short-screen @media block is expected');
  const bad = [];
  (css.match(/[^{}]+\{[^{}]*\}/g) || []).forEach(rule => splitSel(rule.split('{')[0]).forEach(x => { if (x.trim() && !SAFE.test(x)) bad.push(x.trim()); }));
  assert.deepEqual(bad, [], 'unkeyed selectors would change a normal phone/desktop');
});

test('short-screen rules only touch the app header', () => {
  const after = read('duo.css').split('@media (max-height: 720px)')[1]; const block = after.slice(after.indexOf('{') + 1).split('\n}\n')[0];
  (block.match(/^\s*([^{}@]+)\{/gm) || []).forEach(s => assert.match(s, /#appHeader/));
});

test('duo.js parses, and the app, all readers and the service worker load it', () => {
  new vm.Script(read('duo.js'));
  const idx = read('index.html');
  assert.match(idx, /<link rel="stylesheet" href="duo.css">\s*<\/head>/, 'duo.css loads last in <head>');
  assert.match(idx, /<script src="fp513-course.js"><\/script>\s*<script src="duo.js"><\/script>/);
  for (const r of ['fp511', 'fp512', 'fp513']) {
    const h = read('apps/' + r + '-reading.html');
    assert.ok(h.includes('<!-- duo-injected --><link rel="stylesheet" href="../duo.css"><script src="../duo.js"></script>'), r);
    assert.ok(h.lastIndexOf('duo-injected') > h.lastIndexOf('reader-theme.js'), r + ': runs after the reader chrome is built');
  }
  const sw = read('sw.js');
  assert.ok(sw.includes("'./duo.js'") && sw.includes("'./duo.css'"));
});

test('detection stays inert without fold APIs and honours the manual choice', () => {
  const js = read('duo.js');
  assert.match(js, /post !== 'continuous'/);
  assert.match(js, /cfp:duo-mode/);
  assert.match(js, /\[\?&\]duo=\(book\|seated\|off\|auto\)/);
  assert.match(js, /if \(apis\) setInterval/, '1s poll only when a fold API exists');
});

// Optional browser regression for the v2.115.0–v2.117.0 iPhone Duo layouts (book, seated, flat).
//   PLAYWRIGHT_MODULE=/opt/npm-tools/node_modules/playwright \
//   PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/google-chrome node tests/duo-browser.cjs
// Chrome emulates the fold with CDP Emulation.setDeviceMetricsOverride displayFeature,
// which drives window.viewport.segments (the API Safari 27.1 exposes behind a feature flag).
// Serves the repo itself on a random port; no network. Screenshots go to $DUO_SHOTS when set.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs = require('node:fs'), path = require('node:path'), http = require('node:http'), assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..'), shots = process.env.DUO_SHOTS;
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
const POSES = {
  book: { width: 951, height: 676, feature: { orientation: 'vertical', offset: 475, maskLength: 0 } },
  seated: { width: 466, height: 677, feature: { orientation: 'horizontal', offset: 339, maskLength: 0 } },
  seatedDesktop: { width: 1280, height: 900, feature: { orientation: 'horizontal', offset: 450, maskLength: 0 } },
  folded: { width: 466, height: 677 }, open: { width: 960, height: 676 }, phone: { width: 390, height: 844 },
  manualBook: { width: 960, height: 676, query: '?duo=book' },
};
const PROBE = `(() => {
  const W = innerWidth, r = document.documentElement, over = [], fixedIn = [];
  document.querySelectorAll('body *').forEach(e => {
    const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden') return;
    const b = e.getBoundingClientRect();
    if (b.width && b.right > W + 1) { let p = e.parentElement, clip = false;
      while (p && p !== document.body) { if (/(auto|scroll|hidden|clip)/.test(getComputedStyle(p).overflowX)) { clip = true; break; } p = p.parentElement; }
      if (!clip) over.push(e.id || e.className || e.tagName); }
    if (cs.position === 'fixed') { let p = e.parentElement;
      while (p && p !== document.body) { if (/(auto|scroll)/.test(getComputedStyle(p).overflowY)) { fixedIn.push(e.id || e.className); break; } p = p.parentElement; } }
  });
  const rect = id => { const e = document.getElementById(id); if (!e || e.hidden) return null; const b = e.getBoundingClientRect(); return { l: b.left, r: b.right, t: b.top, b: b.bottom }; };
  const wrap = document.querySelector('.wrap') || document.getElementById('rdrWrap');
  const wb = wrap.getBoundingClientRect();
  return { pose: r.getAttribute('data-duo-pose'), sw: r.scrollWidth, W, scrollY, over, fixedIn,
    left: rect('duoL'), top: rect('duoTop'), toc: rect('duoToc'), wrap: { l: wb.left, t: wb.top, b: wb.bottom },
    foldL: parseFloat(getComputedStyle(r).getPropertyValue('--fold-left')) || null,
    foldR: parseFloat(getComputedStyle(r).getPropertyValue('--fold-right')) || null,
    foldT: parseFloat(getComputedStyle(r).getPropertyValue('--fold-top')) || null,
    foldB: parseFloat(getComputedStyle(r).getPropertyValue('--fold-bottom')) || null,
    spread: document.body.classList.contains('duo-spread') };
})()`;

(async () => {
  const server = http.createServer((req, res) => {
    const u = decodeURIComponent(req.url.split('?')[0].split('#')[0]);
    const f = path.join(root, u === '/' ? 'index.html' : u);
    if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
  }).listen(0, '127.0.0.1');
  await new Promise(r => server.once('listening', r));
  const base = 'http://127.0.0.1:' + server.address().port + '/';
  const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE, args: ['--no-sandbox'] });
  let failures = 0;
  async function open(poseName, url, prep) {
    const P = POSES[poseName];
    const ctx = await browser.newContext({ viewport: { width: P.width, height: P.height }, serviceWorkers: 'block' });
    const page = await ctx.newPage(), errs = [];
    page.on('pageerror', e => errs.push(String(e)));
    const emulate = async () => {
      if (!P.feature) return;
      const c = await ctx.newCDPSession(page);
      await c.send('Emulation.setDeviceMetricsOverride', { width: P.width, height: P.height, deviceScaleFactor: 1, mobile: true, displayFeature: P.feature });
      try { await c.send('Emulation.setDevicePostureOverride', { posture: { type: 'folded' } }); } catch (e) {}
    };
    await emulate();
    await page.goto(base + url + (P.query || ''));
    await page.waitForTimeout(1500);
    if (prep) { await page.evaluate(prep); await page.waitForTimeout(700); }
    const res = await page.evaluate(PROBE);
    if (shots) { fs.mkdirSync(shots, { recursive: true }); await page.screenshot({ path: path.join(shots, poseName + '-' + url.replace(/[^a-z0-9]+/gi, '_') + (prep ? '-' + prep.length : '') + '.png') }); await emulate(); }
    const extra = await page.evaluate(`(() => ({ rp: !!document.querySelector('.duo-spread-card > .duo-rp'), topMode: document.body.getAttribute('data-duo-top'), tocSecs: document.querySelectorAll('#duoToc [data-duo-sec]').length }))()`);
    await ctx.close();
    return Object.assign(res, extra, { errs });
  }
  async function check(name, fn) {
    try { await fn(); console.log('ok   ' + name); } catch (e) { failures++; console.log('FAIL ' + name + '\n     ' + e.message); }
  }
  const flat = r => { assert.equal(r.pose, null); assert.equal(r.left, null); assert.equal(r.top, null); };
  const clean = r => { assert.equal(r.sw, r.W, 'sideways overflow'); assert.deepEqual(r.over, [], 'elements past the right edge'); assert.deepEqual(r.fixedIn, [], 'fixed element inside a scroller'); assert.deepEqual(r.errs, [], 'page errors'); assert.equal(r.scrollY, 0); };
  const quiz = "(() => { go('study'); const m = document.getElementById('studyModule'); m.value = 'FP513'; m.dispatchEvent(new Event('change')); document.getElementById('studyMode').value = 'quiz'; document.getElementById('startBtn').click(); })()";
  const flash = quiz.replace("'quiz'", "'flash'") + ";document.getElementById('flashface').click()";
  const coach = "CFPCoach.launch(3, null, { course: 'FP513', mod: 1 })";

  for (const route of ['dash', 'modules', 'analytics', 'mobile']) {
    await check('book ' + route + ': left page | crease | right page', async () => {
      const r = await open('book', 'index.html', "go('" + route + "')"); clean(r);
      assert.equal(r.pose, 'book'); assert.ok(r.left && r.left.r <= r.foldL + 1, 'left page ends at the crease');
      assert.ok(r.wrap.l >= r.foldR - 1, 'right page starts after the crease');
    });
    await check('seated ' + route + ': featured top, page below', async () => {
      const r = await open('seated', 'index.html', "go('" + route + "')"); clean(r);
      assert.equal(r.pose, 'seated'); assert.ok(r.top && r.top.b <= r.foldT + 1, 'top pane above the fold');
      assert.ok(r.wrap.t >= r.foldB - 1, 'page starts below the fold');
    });
  }
  await check('book quiz: question left page, answer right page', async () => {
    const r = await open('book', 'index.html', quiz + ";document.querySelector('#studyArea .opt').click()"); clean(r);
    assert.ok(r.spread && r.rp, 'spread with a right page');
  });
  await check('book flashcard: answer opens on the right page', async () => {
    const r = await open('book', 'index.html', flash); clean(r); assert.ok(r.spread && r.rp);
  });
  await check('book coach session: spread', async () => {
    const r = await open('book', 'index.html', coach); clean(r); assert.ok(r.spread && r.rp);
  });
  await check('seated quiz: question mirrored on top', async () => {
    const r = await open('seated', 'index.html', quiz); clean(r); assert.equal(r.topMode, 'q');
  });
  await check('seated desktop size: same split', async () => {
    const r = await open('seatedDesktop', 'index.html'); clean(r); assert.equal(r.pose, 'seated');
  });
  await check('manual ?duo=book without sensors splits at the middle', async () => {
    const r = await open('manualBook', 'index.html'); clean(r); assert.equal(r.pose, 'book'); assert.ok(r.foldL > 400 && r.foldR < 560);
  });
  for (const rd of ['fp511', 'fp512', 'fp513']) {
    await check('book ' + rd + ' reader: contents | text', async () => {
      const r = await open('book', 'apps/' + rd + '-reading.html'); clean(r);
      assert.ok(r.toc && r.toc.r <= r.foldL + 1 && r.wrap.l >= r.foldR - 1 && r.tocSecs > 0);
    });
    await check('seated ' + rd + ' reader: contents over text', async () => {
      const r = await open('seated', 'apps/' + rd + '-reading.html'); clean(r);
      assert.ok(r.toc && r.toc.b <= r.foldT + 1 && r.wrap.t >= r.foldB - 1);
    });
  }
  // ---- v2.117.0: slide decks, context-aware pages, collapsible contents, status strip ----
  await check('book calc drill: problem + input left, solution page right', async () => {
    const r = await open('book', 'index.html', quiz.replace("'quiz'", "'calc'")); clean(r);
    assert.ok(r.spread && r.rp, 'calc card split');
  });
  for (const dk of ['fp513-ai', 'fp512-m3-kaplan', 'fp511-ai']) {
    await check('book ' + dk + ' deck: topics | slides', async () => {
      const r = await open('book', 'apps/' + dk + '-slides.html'); clean(r);
      assert.equal(r.pose, 'book'); assert.ok(r.toc && r.toc.r <= r.foldL + 1 && r.wrap.l >= r.foldR - 1 && r.tocSecs > 3);
    });
    await check('seated ' + dk + ' deck: topics over slides', async () => {
      const r = await open('seated', 'apps/' + dk + '-slides.html'); clean(r);
      assert.ok(r.toc && r.toc.b <= r.foldT + 1 && r.wrap.t >= r.foldB - 1);
    });
  }
  for (const p of ['folded', 'open', 'phone']) {
    await check(p + ' deck: flat, untouched', async () => { const r = await open(p, 'apps/fp513-ai-slides.html'); clean(r); flat(r); assert.equal(r.toc, null); });
    await check(p + ': Book button only on the big inner screen (app, reader, deck)', async () => {
      for (const u of ['index.html', 'apps/fp513-reading.html', 'apps/fp513-ai-slides.html']) {
        const P = POSES[p], ctx = await browser.newContext({ viewport: { width: P.width, height: P.height }, serviceWorkers: 'block' }), page = await ctx.newPage();
        await page.goto(base + u); await page.waitForTimeout(800);
        const vis = await page.evaluate("(() => { const b = document.getElementById('duoBtn'); return !!b && getComputedStyle(b).display !== 'none'; })()");
        assert.equal(vis, p === 'open', u); await ctx.close();
      }
    });
  }
  await check('Full page folds the contents away; ☰ Contents brings it back', async () => {
    const r = await open('book', 'apps/fp513-reading.html', "document.querySelector('#duoToc [data-duo-wide]').click()"); clean(r);
    assert.ok(!r.toc || r.toc.r - r.toc.l === 0, 'contents hidden'); assert.ok(r.wrap.l <= 1, 'text spans both pages');
    const r2 = await open('book', 'apps/fp513-ai-slides.html', "document.querySelector('#duoToc [data-duo-wide]').click();document.getElementById('duoTocBtn').click()"); clean(r2);
    assert.ok(r2.toc && r2.wrap.l >= r2.foldR - 1, 'split view again');
  });
  await check('deck topic tap scrolls the right page, highlights it, and is remembered', async () => {
    const P = POSES.manualBook, ctx = await browser.newContext({ viewport: { width: P.width, height: P.height }, serviceWorkers: 'block' }), page = await ctx.newPage(), errs = [];
    page.on('pageerror', e => errs.push(String(e)));
    await page.goto(base + 'apps/fp513-ai-slides.html?duo=book'); await page.waitForTimeout(900);
    await page.evaluate("document.querySelectorAll('#duoToc [data-duo-sec]')[3].click()"); await page.waitForTimeout(500);
    const a = await page.evaluate("({ st: document.getElementById('rdrWrap').scrollTop, now: (document.querySelector('#duoToc .now') || {}).textContent || '', sub: document.querySelectorAll('#duoToc .duo-sub [data-duo-sec]').length })");
    assert.ok(a.st > 500 && /Bond & Stock Valuation/.test(a.now) && a.sub > 0, JSON.stringify(a));
    await page.reload(); await page.waitForTimeout(1200);
    const b = await page.evaluate("({ st: document.getElementById('rdrWrap').scrollTop })");
    assert.ok(Math.abs(b.st - a.st) < 80, 'position restored ' + JSON.stringify([a.st, b.st]));
    assert.deepEqual(errs, []); await ctx.close();
  });
  await check('teach mode marks the narrated section on the left page', async () => {
    const r = await open('book', 'apps/fp512-m3-kaplan-slides.html', "speechSynthesis.speak = u => setTimeout(() => u.onstart && u.onstart(), 5); document.getElementById('rtTeachFab').click()");
    assert.deepEqual(r.errs, []);
    const P = POSES.manualBook, ctx = await browser.newContext({ viewport: { width: P.width, height: P.height }, serviceWorkers: 'block' }), page = await ctx.newPage();
    await page.goto(base + 'apps/fp512-m3-kaplan-slides.html?duo=book'); await page.waitForTimeout(900);
    await page.evaluate("speechSynthesis.speak = u => setTimeout(() => u.onstart && u.onstart(), 5); document.getElementById('rtTeachFab').click()"); await page.waitForTimeout(1200);
    const t = await page.evaluate("({ teach: !!document.querySelector('#duoToc .teach'), top: document.getElementById('duoToc').getBoundingClientRect().top })");
    assert.ok(t.teach, 'teaching marker'); assert.ok(t.top <= 1, 'contents use the space the hidden top bar left'); await ctx.close();
  });
  const side = r => "(() => { window.__duoForce = 1; const h = document.documentElement; h.classList.add('pf-side-status'); h.style.setProperty('--duo-r', '" + r + "px'); })()";
  for (const [pose, url] of [['book', 'apps/fp513-ai-slides.html'], ['book', 'apps/fp513-reading.html'], ['book', 'index.html'], ['folded', 'apps/fp513-ai-slides.html'], ['open', 'index.html']]) {
    await check(pose + ' ' + url + ' with the side status strip: bar clear of the icons, no overflow', async () => {
      const r = await open(pose, url, side(pose === 'folded' ? 97 : 105)); clean(r);
      const P = POSES[pose], ctx = await browser.newContext({ viewport: { width: P.width, height: P.height }, serviceWorkers: 'block' }), page = await ctx.newPage();
      await page.goto(base + url + (pose === 'book' ? '?duo=book' : '')); await page.waitForTimeout(900); await page.evaluate(side(pose === 'folded' ? 97 : 105)); await page.waitForTimeout(300);
      const c = await page.evaluate("(() => { const b = document.getElementById('rdrChrome'); if (!b) return null; const cs = getComputedStyle(b); return { pt: parseFloat(cs.paddingTop), pr: parseFloat(cs.paddingRight), last: Math.max(...[...b.querySelectorAll('button,a')].filter(x => x.offsetParent).map(x => x.getBoundingClientRect().right)) }; })()");
      if (c) { assert.ok(c.pt <= 6.5, 'no top safe-area band'); assert.ok(c.last <= P.width - (pose === 'folded' ? 97 : 105) + 1, 'controls left of the icons'); }
      await ctx.close();
    });
  }
  await check('Kaplan access countdown is labelled apart from the CFP exam countdown', async () => {
    const r = await open('folded', 'index.html'); clean(r);
    const P = POSES.folded, ctx = await browser.newContext({ viewport: { width: P.width, height: P.height }, serviceWorkers: 'block' }), page = await ctx.newPage();
    await page.goto(base + 'index.html'); await page.waitForTimeout(1200);
    const t = await page.evaluate("({ k: document.querySelector('#fp513Today .fp5-days').textContent, h: getComputedStyle(document.getElementById('countDays'), '::after').content })");
    assert.match(t.k, /Kaplan access/); assert.match(t.h, /CFP exam/); await ctx.close();
  });
  await check('open screen, no fold sensors: Book button splits the app, tap again for one page', async () => {
    const r = await open('open', 'index.html', "document.getElementById('duoBtn').click()"); clean(r);
    assert.equal(r.pose, 'book'); assert.ok(r.left && r.left.r <= r.foldL + 1);
    const r2 = await open('open', 'index.html', "document.getElementById('duoBtn').click();document.getElementById('duoBtn').click()"); flat(r2);
  });
  await check('open screen, no fold sensors: Book button in the reader chrome', async () => {
    const r = await open('open', 'apps/fp513-reading.html', "document.querySelector('#rdrChrome #duoBtn').click()"); clean(r);
    assert.equal(r.pose, 'book'); assert.ok(r.toc && r.wrap.l >= r.foldR - 1);
  });
  await check('folded outer screen: no Book button, manual book ignored', async () => {
    const r = await open('folded', 'index.html', "CFPDuo.setMode('book')"); flat(r);
  });
  for (const p of ['folded', 'open', 'phone']) {
    await check(p + ': flat, untouched', async () => { const r = await open(p, 'index.html'); clean(r); flat(r); });
    await check(p + ' reader: flat, untouched', async () => { const r = await open(p, 'apps/fp513-reading.html'); clean(r); flat(r); assert.equal(r.toc, null); });
  }
  await browser.close(); server.close();
  console.log(failures ? failures + ' failed' : 'all passed');
  process.exit(failures ? 1 : 0);
})();

/* duo.js — iPhone Duo layouts for the CFP Study Lab app and its Interactive Readers (v2.115.0).
 *
 * Layout only: no content, scoring or data changes. Ported from Sports Hub's duo.js (v372–v378)
 * fold detection, with the rules Jack settled there:
 *   • Viewport Segments + Device Posture APIs (Safari feature flags). JS segment list first,
 *     CSS env(viewport-segment-*) probes as fallback; inert when neither exists.
 *   • Two segments side by side  -> html[data-duo-pose="book"]   (--fold-left / --fold-right)
 *     Two segments stacked       -> html[data-duo-pose="seated"] (--fold-top / --fold-bottom)
 *     A ≥24px gutter is centred on the crease. Posture "continuous" = flat (no pose).
 *   • Folding often fires no resize: listen to the media queries, posture, visualViewport,
 *     visibility, plus a 1s signature poll while visible (only when a fold API exists).
 *   • A manual choice (Settings → Fold layout, or ?duo=book|seated|off|auto) overrides sensors,
 *     so the book view works even with the Safari flags off. Stored in localStorage 'cfp:duo-mode'.
 *   • html.pf-side-status + --duo-r when the right safe-area inset is the Duo's ~100px icon strip.
 *
 * App (index.html):
 *   book   — LEFT page: header, tabs, the FP513 course card and the route's summary panel
 *            (Today: coach; Analytics: evidence) — own scroll. RIGHT page: the rest of the route.
 *            Study route: a two-page spread — question on the left page, answer/explanation on
 *            the right page (like facing pages of a book).
 *   seated — TOP half: featured glance (the current question while studying, else the FP513
 *            compass with Continue). BOTTOM half: every route, scrolling, with the tab bar.
 * Readers (apps/*-reading.html):
 *   book   — LEFT page: table of contents (tabs + this tab's sections); RIGHT page: the text.
 *   seated — TOP half: the same contents list; BOTTOM half: the text, scrolling.
 * Safari rules from Sports Hub: lock the document (html overflow hidden) and scroll an inner
 * element; never put position:fixed elements inside the scroller.
 */
(function () {
  'use strict';
  var root = document.documentElement;
  var FOLD_GAP = 24, MODE_KEY = 'cfp:duo-mode';
  var IS_APP = !!document.getElementById('dash');
  var IS_READER = !IS_APP && !!document.querySelector('.tab-nav .tab-btn, .tab-btn');
  // Slide decks (apps/*-slides.html, v2.117.0): one long #rdrWrap page of .sect headers + .slide cards.
  var IS_DECK = !IS_APP && !IS_READER && !!document.getElementById('rdrWrap') && !!document.querySelector('.sect, .slide');
  var IS_DOC = IS_READER || IS_DECK;   // pages that get the contents | text book layout
  var FILE = (location.pathname.split('/').pop() || '').replace(/\.html$/, '');
  var POS_KEY = 'cfp:duo-pos:' + FILE, wide = false;   // wide = contents folded away, text across both pages
  var mode = 'auto';
  try {
    var q = (location.search.match(/[?&]duo=(book|seated|off|auto)\b/) || [])[1];
    if (q) localStorage.setItem(MODE_KEY, q);
    var saved = localStorage.getItem(MODE_KEY);
    if (/^(book|seated|off|auto)$/.test(saved || '')) mode = saved;
  } catch (e) {}

  // ---------- side status strip ----------
  function probeSide() {
    if (!document.body) return;
    var d = document.createElement('div');
    d.setAttribute('aria-hidden', 'true');
    d.style.cssText = 'position:fixed;top:0;left:0;width:0;height:0;visibility:hidden;pointer-events:none;padding-right:env(safe-area-inset-right,0px);padding-left:env(safe-area-inset-left,0px)';
    document.body.appendChild(d);
    var cs = getComputedStyle(d), r = parseFloat(cs.paddingRight) || 0, l = parseFloat(cs.paddingLeft) || 0;
    d.remove();
    if (r >= 60 && l < 20) { root.classList.add('pf-side-status'); root.style.setProperty('--duo-r', Math.round(r) + 'px'); }
    else if (!window.__duoForce) { root.classList.remove('pf-side-status'); root.style.removeProperty('--duo-r'); }
  }

  // ---------- fold detection ----------
  function mq(s) { try { return window.matchMedia ? window.matchMedia(s) : null; } catch (e) { return null; } }
  var MQ = { v2: mq('(vertical-viewport-segments: 2)'), h2: mq('(horizontal-viewport-segments: 2)'), folded: mq('(device-posture: folded)'), cont: mq('(device-posture: continuous)') };
  function envPx(expr) {
    if (!document.body) return NaN;
    var d = document.createElement('div');
    d.style.cssText = 'position:fixed;top:0;left:0;width:0;height:0;visibility:hidden;pointer-events:none;padding-top:' + expr;
    document.body.appendChild(d);
    var v = parseFloat(getComputedStyle(d).paddingTop); d.remove(); return v;
  }
  function ordered(s) {
    if (!s || s.length !== 2) return null;
    var pair = Array.prototype.slice.call(s);
    if (!pair.every(function (r) { return r && ['top', 'bottom', 'left', 'right'].every(function (k) { return isFinite(r[k]); }) && r.bottom > r.top && r.right > r.left; })) return null;
    return pair.sort(function (a, b) { return a.top - b.top || a.left - b.left; });
  }
  function segments() {
    var v = window.viewport, s = v && v.segments, pair = ordered(s);
    if (pair) return { src: 'js', n: 2, a: pair[0], b: pair[1] };
    var W = window.innerWidth, H = window.innerHeight;
    if (MQ.v2 && MQ.v2.matches) {
      var top = envPx('env(viewport-segment-bottom 0 0, -1px)'), nxt = envPx('env(viewport-segment-top 0 1, -1px)');
      if (top > 0 && nxt > 0) return { src: 'css', n: 2, a: { top: 0, bottom: top, left: 0, right: W }, b: { top: nxt, bottom: H, left: 0, right: W } };
    }
    if (MQ.h2 && MQ.h2.matches) {
      var right = envPx('env(viewport-segment-right 0 0, -1px)'), left = envPx('env(viewport-segment-left 1 0, -1px)');
      if (right > 0 && left > 0) return { src: 'css', n: 2, a: { top: 0, bottom: H, left: 0, right: right }, b: { top: 0, bottom: H, left: left, right: W } };
    }
    return { src: s ? 'js' : 'none', n: s ? s.length : null };
  }
  function posture() {
    var dp = navigator.devicePosture;
    if (dp && dp.type) return dp.type;
    if (MQ.folded && MQ.folded.matches) return 'folded';
    if (MQ.cont && MQ.cont.matches) return 'continuous';
    return '';
  }
  function setVars(name, a, b) {
    var keys = ['--fold-top', '--fold-bottom', '--fold-left', '--fold-right'];
    keys.forEach(function (k) { root.style.removeProperty(k); });
    if (name === 'seated') {
      var mid = (a.bottom + b.top) / 2;
      root.style.setProperty('--fold-top', Math.round(Math.min(a.bottom, mid - FOLD_GAP / 2)) + 'px');
      root.style.setProperty('--fold-bottom', Math.round(Math.max(b.top, mid + FOLD_GAP / 2)) + 'px');
    } else if (name === 'book') {
      var midx = (a.right + b.left) / 2;
      root.style.setProperty('--fold-left', Math.round(Math.min(a.right, midx - FOLD_GAP / 2)) + 'px');
      root.style.setProperty('--fold-right', Math.round(Math.max(b.left, midx + FOLD_GAP / 2)) + 'px');
    }
  }
  var current = '';
  function decide() {
    var seg = segments(), post = posture(), name = '', W = window.innerWidth, H = window.innerHeight;
    if (mode !== 'off' && seg.n === 2 && post !== 'continuous') {
      var a = seg.a, b = seg.b;
      if (b.top >= a.bottom - 1 && Math.abs(a.left - b.left) < 2) name = 'seated';
      else if (b.left >= a.right - 1 && Math.abs(a.top - b.top) < 2) name = 'book';
      if (mode === 'book' && name !== 'book') name = '';
      if (mode === 'seated' && name !== 'seated') name = '';
      if (name) setVars(name, a, b);
    }
    // No segment geometry (Safari often reports none): split at the middle of the layout
    // viewport when the user chose a split (button / Settings) or posture alone says "folded".
    // Only on the big inner screen (both sides >= 600px), never the folded outer display.
    var big = Math.min(W, H) >= 600, wide = W > H;
    var want = mode === 'book' || mode === 'seated' ? mode : (mode === 'auto' && post === 'folded' ? (wide ? 'book' : 'seated') : '');
    if (!name && big && want === 'book' && wide) { name = 'book'; setVars('book', { right: W / 2 }, { left: W / 2 }); }
    if (!name && big && want === 'seated' && !wide) { name = 'seated'; setVars('seated', { bottom: H / 2 }, { top: H / 2 }); }
    root.classList.toggle('duo-big', big);
    root.classList.toggle('duo-short', H <= 720 && W >= 420);
    root.classList.toggle('duo-deck', IS_DECK);
    if (!name) setVars('', null, null);
    if (name) root.setAttribute('data-duo-pose', name); else root.removeAttribute('data-duo-pose');
    var changed = name !== current; current = name;
    diag(seg, post, name);
    layout(changed);
    syncBtn();
  }
  function diag(seg, post, name) {
    var apis = (window.viewport && 'segments' in window.viewport ? 'S' : '') + (navigator.devicePosture ? 'P' : '') + (MQ.v2 && MQ.v2.media !== 'not all' ? 'M' : '');
    var txt = 'fold: ' + (post || 'n/a') + ' · ' + (seg.n == null ? '?' : seg.n) + ' seg · ' + (name || 'flat') + ' · ' + (apis || 'no APIs') + (seg.src === 'css' ? ' css' : '') + ' · mode ' + mode;
    root.setAttribute('data-duo-diag', txt);
    var el = document.getElementById('duoDiag'); if (el) el.textContent = txt;
  }

  // ---------- helpers: move nodes with placeholders so they always go home ----------
  var moved = [];
  function moveTo(node, host) {
    if (!node || !host || node.parentNode === host) return;
    var ph = document.createComment('duo-home'); node.parentNode.insertBefore(ph, node);
    moved.push({ node: node, ph: ph }); host.appendChild(node);
  }
  function restoreAll() {
    while (moved.length) { var m = moved.pop(); if (m.ph.parentNode) { m.ph.parentNode.insertBefore(m.node, m.ph); m.ph.remove(); } }
  }
  function el(tag, id, cls) { var e = document.getElementById(id); if (e) return e; e = document.createElement(tag); e.id = id; if (cls) e.className = cls; document.body.appendChild(e); return e; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  // ---------- app layouts ----------
  function activeRoute() {
    var s = document.querySelector('.wrap > section:not(.hidden)');
    return s ? s.id : 'dash';
  }
  // Book spread: a question card is split at the crease — question on the left page, answer on the right.
  var RIGHT = '#rev, #calcrev, #flashctrl, .c-feedback, .whynot, .c-next, .c-source, details';
  function spreadTargets() {
    var out = [], route = activeRoute();
    if (route === 'study') {
      var area = document.getElementById('studyArea');
      if (area) area.querySelectorAll('#rev, #calcrev, #flashctrl').forEach(function (n) { var c = n.closest('.card'); if (c && area.contains(c) && out.indexOf(c) < 0) out.push(c); });
    } else if (route === 'coach') {
      document.querySelectorAll('#coach .c-card').forEach(function (c) { if (c.querySelector('.c-question')) out.push(c); });
    }
    return out;
  }
  function spreadify(card) {
    if (card.__duo) return;
    var lp = document.createElement('div'), rp = document.createElement('div');
    lp.className = 'duo-lp'; rp.className = 'duo-rp';
    Array.prototype.slice.call(card.children).forEach(function (ch) { (ch.matches(RIGHT) ? rp : lp).appendChild(ch); });
    card.appendChild(lp); card.appendChild(rp); card.classList.add('duo-spread-card'); card.__duo = true;
  }
  function unspreadAll() {
    document.querySelectorAll('.duo-spread-card').forEach(function (card) {
      ['duo-lp', 'duo-rp'].forEach(function (k) {
        var w = card.querySelector(':scope > .' + k); if (!w) return;
        while (w.firstChild) card.insertBefore(w.firstChild, w);
        w.remove();
      });
      card.classList.remove('duo-spread-card'); card.__duo = false;
    });
  }
  // Flashcards in a spread: front stays on the left page, the answer opens on the right page.
  function flashSpread(card) {
    var face = card.querySelector('#flashface'), rp = card.querySelector(':scope > .duo-rp'); if (!face || !rp) return;
    var inner = face.firstElementChild, old = rp.querySelector('.duo-back');
    var flipped = inner && inner.firstElementChild && inner.firstElementChild.classList.contains('muted');
    if (!flipped) { if (old) old.remove(); card.classList.remove('duo-flipped'); return; }
    var back = inner.querySelector(':scope > .duo-backtext');
    if (!back) {
      back = document.createElement('span'); back.className = 'duo-backtext';
      var n = inner.firstElementChild.nextSibling;
      while (n) { var nx = n.nextSibling; back.appendChild(n); n = nx; }
      inner.appendChild(back);
    }
    if (!old || old.__src !== back.innerHTML) {
      if (old) old.remove();
      var d = document.createElement('div'); d.className = 'duo-back flash'; d.innerHTML = back.innerHTML; d.__src = back.innerHTML;
      rp.insertBefore(d, rp.firstChild);
    }
    card.classList.add('duo-flipped');
  }
  var lastSig = '';
  function layoutApp(force) {
    var pose = current, route = activeRoute(), cards = pose === 'book' ? spreadTargets() : [];
    var spread = cards.length > 0, sig = pose + '|' + route + '|' + spread;
    if (spread) cards.forEach(function (c) { spreadify(c); flashSpread(c); });
    if (!force && sig === lastSig) { if (pose === 'seated') renderTop(); return; }
    lastSig = sig;
    restoreAll();
    if (!spread) unspreadAll();
    if (pose !== 'seated') document.body.removeAttribute('data-duo-top');
    document.body.classList.toggle('duo-spread', spread);
    var left = document.getElementById('duoL'), top = document.getElementById('duoTop');
    if (left) left.hidden = true; if (top) top.hidden = true;
    if (pose === 'book' && !spread) {
      left = el('aside', 'duoL', 'duo-page duo-left'); left.hidden = false; left.setAttribute('aria-label', 'Left page');
      moveTo(document.getElementById('appHeader'), left);
      moveTo(document.getElementById('tabs'), left);
      moveTo(document.getElementById('fp513Today'), left);
      if (route === 'dash') moveTo(document.getElementById('coachHome'), left);
      if (route === 'analytics') { moveTo(document.getElementById('coachAnalytics'), left); moveTo(document.getElementById('fp513Analytics'), left); }
      left.scrollTop = 0;
    } else if (pose === 'seated') {
      top = el('section', 'duoTop', 'duo-top'); top.hidden = false; top.setAttribute('aria-label', 'Featured');
      moveTo(document.getElementById('tabs'), document.body);   // keep the fixed tab bar out of the scroller
      var tb = document.getElementById('tabs'); if (tb) root.style.setProperty('--duo-nav', Math.ceil(tb.getBoundingClientRect().height) + 'px');
      renderTop();
    }
  }
  // Seated top half: the current question while studying, else the FP513 compass.
  function renderTop() {
    var top = document.getElementById('duoTop'); if (!top || top.hidden) return;
    var html = '', mode = '', route = activeRoute();
    var area = document.getElementById('studyArea');
    if (route === 'study' && area) {
      var face = area.querySelector('#flashface');
      var live = area.querySelector('#rev, #calcrev');
      var card = live && live.closest('.card');
      var qh = card && card.querySelector('h3');
      if (face) { mode = 'flash'; html = '<div class="duo-eyebrow">Flashcard · tap to flip</div><div class="duo-q duo-flip" data-duo-flip="1">' + face.innerHTML + '</div>'; }
      else if (qh) {
        mode = 'q'; var stem = card.querySelector('.casebox');
        html = '<div class="duo-eyebrow">' + (live.id === 'calcrev' ? 'Calculation' : 'Question') + '</div>' + (stem ? '<div class="duo-stem casebox">' + stem.innerHTML + '</div>' : '') + '<div class="duo-q">' + qh.innerHTML + '</div>';
        if (live.id === 'calcrev') { var ul = card.querySelector('h3 + ul'); if (ul) html += '<ul class="duo-asm">' + ul.innerHTML + '</ul>'; }
      }
    } else if (route === 'coach') {
      var cq = document.querySelector('#coach .c-question');
      if (cq) { mode = 'q'; var cs = cq.parentNode.querySelector('.casebox'); html = '<div class="duo-eyebrow">Question</div>' + (cs ? '<div class="duo-stem casebox">' + cs.innerHTML + '</div>' : '') + '<div class="duo-q">' + cq.innerHTML + '</div>'; }
    }
    if (!html) {
      var f = document.getElementById('fp513Today');
      var mod = f && f.querySelector('.fp5-mod'), nx = f && f.querySelector('.fp5-next'), days = f && f.querySelector('.fp5-days');
      html = '<div class="duo-eyebrow">FP513 · Investment Planning' + (days ? ' · ' + esc(Array.prototype.map.call(days.children.length ? days.children : [days], function (n) { return n.textContent.trim(); }).join(' ')) : '') + '</div>' +
        (mod ? '<div class="duo-q">' + mod.innerHTML + '</div>' : '') + (nx ? '<div class="duo-next">' + nx.innerHTML + '</div>' : '') +
        '<div class="duo-row"><button class="btn" data-duo-fwd="continue">Continue FP513 →</button><button class="btn gray sm" data-duo-fwd="read">📖 Read</button><button class="btn gray sm" data-duo-fwd="calc">🧮 Calc</button></div>';
    }
    document.body.setAttribute('data-duo-top', mode || 'compass');
    if (top.__html !== html) { top.__html = html; top.innerHTML = html; top.scrollTop = 0; }
  }
  document.addEventListener('click', function (e) {
    var f = e.target.closest && e.target.closest('[data-duo-flip]'); if (!f) return;
    var real = document.getElementById('flashface'); if (real) { e.preventDefault(); real.click(); }
  });
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-duo-fwd]'); if (!b) return;
    var real = document.querySelector('#fp513Today [data-fp5="' + b.getAttribute('data-duo-fwd') + '"]');
    if (real) { e.preventDefault(); real.click(); }
  });
  function settingsControl() {
    var host = document.querySelector('#mobile .card'); if (!host || document.getElementById('duoMode')) return;
    var box = document.createElement('div'); box.className = 'duo-settings';
    box.innerHTML = '<div class="small" style="margin-top:12px"><b>Fold layout (iPhone Duo)</b></div>' +
      '<div class="row" style="flex-wrap:wrap;gap:6px;margin-top:6px" id="duoMode">' +
      [['auto', 'Automatic'], ['book', 'Book (left · right)'], ['seated', 'Top · bottom'], ['off', 'Off']].map(function (o) {
        return '<button class="btn sm ' + (mode === o[0] ? '' : 'gray') + '" data-duo-mode="' + o[0] + '">' + o[1] + '</button>';
      }).join('') + '</div><div class="small muted" id="duoDiag" style="margin-top:4px"></div>';
    host.appendChild(box);
    box.addEventListener('click', function (e) {
      var b = e.target.closest('[data-duo-mode]'); if (!b) return;
      setMode(b.getAttribute('data-duo-mode'));
      box.querySelectorAll('[data-duo-mode]').forEach(function (x) { x.className = 'btn sm ' + (x === b ? '' : 'gray'); });
    });
    diag(segments(), posture(), current);
  }
  function setMode(m) { mode = m; try { localStorage.setItem(MODE_KEY, m); } catch (e) {} decide(); syncBtn(); }
  // Visible toggle on the big inner screen: one tap = book (landscape) or top/bottom (portrait).
  function toggleBtn() {
    var b = document.getElementById('duoBtn');
    if (!b) {
      b = document.createElement('button'); b.type = 'button'; b.id = 'duoBtn';
      var host = IS_DOC && window.__rdrChromeL;
      if (host) { b.className = 'rdr-cbtn'; host.appendChild(b); } else document.body.appendChild(b);
      b.addEventListener('click', function () {
        if (current) setMode('off'); else setMode(innerWidth > innerHeight ? 'book' : 'seated');
      });
    }
    syncBtn();
  }
  function syncBtn() {
    var b = document.getElementById('duoBtn'); if (!b) return;
    var wide = innerWidth > innerHeight;
    b.textContent = current ? '\u2715 Single page' : (wide ? '\uD83D\uDCD6 Book' : '\u2B12 Split');
    b.setAttribute('aria-pressed', String(!!current));
    b.title = (root.getAttribute('data-duo-diag') || '') + ' \u2014 tap to ' + (current ? 'go back to one page' : (wide ? 'split into two pages at the crease' : 'split top / bottom at the crease'));
  }

  // ---------- reader + deck layouts: contents on the left page, text on the right ----------
  function readerHeads(panel) {
    if (!panel) return [];
    return Array.prototype.slice.call(panel.querySelectorAll('.collapsible-header, .ch'));
  }
  function headLabel(h) {
    var t = h.querySelector('h1,h2,h3,h4') || h;
    return t.textContent.replace(/[−–—+\-▸▾▶▼›‹☆★]/g, ' ').replace(/\bEXAM\b\s*$/, '').replace(/\s+/g, ' ').trim();
  }
  function isCollapsed(h) {
    var c = h.nextElementSibling;
    return !!(c && (c.classList.contains('collapsed') || c.classList.contains('closed')));
  }
  function tocHead(title) {
    return '<div class="duo-tochead"><div class="duo-eyebrow">' + esc(title) + '</div>' +
      '<button type="button" class="duo-fold" data-duo-wide="1" title="Hide the contents and spread the text across both pages">Full page ⇥</button></div>';
  }
  // Exam review (FP513 decks): weak areas from the app's own FP513 evidence (cached by fp513-course.js).
  function weakHtml() {
    if (!/^fp513/.test(FILE)) return '';
    var w = null; try { w = JSON.parse(localStorage.getItem('cfp:fp513-weak') || 'null'); } catch (e) {}
    if (!w || !w.mods) return '<div class="duo-eyebrow duo-gap">Weak areas</div><div class="duo-none">Answer a few FP513 questions in the app and your weakest modules show here.</div>';
    var rows = Object.keys(w.mods).map(function (m) { var x = w.mods[m]; return { m: +m, n: x.n, pct: x.n ? Math.round(100 * x.ok / x.n) : null }; })
      .filter(function (r) { return r.n >= 2 && r.pct < 70; }).sort(function (a, b) { return a.pct - b.pct; }).slice(0, 4);
    var los = (w.los || []).slice(0, 4);
    if (!rows.length && !los.length) return '<div class="duo-eyebrow duo-gap">Weak areas</div><div class="duo-none">Nothing under 70% yet (needs 2+ answers).</div>';
    return '<div class="duo-eyebrow duo-gap">Weak areas</div><div class="duo-weak">' +
      rows.map(function (r) { return '<button type="button" data-duo-mod="' + r.m + '"><b>M' + r.m + '</b><span>' + r.pct + '%</span><i>' + r.n + ' answers</i></button>'; }).join('') +
      los.map(function (l) { return '<button type="button" data-duo-mod="' + l.mod + '"><b>' + esc(l.id) + '</b><span>' + l.ok + '/' + l.n + '</span><i>' + esc(l.text) + '</i></button>'; }).join('') + '</div>';
  }
  function deckSections() {
    return Array.prototype.slice.call(document.querySelectorAll('#rdrWrap .sect'));
  }
  function deckSlides(sect) {   // the slide cards that follow one section header, up to the next one
    var out = [], n = sect.nextElementSibling;
    while (n && !n.classList.contains('sect')) { var h = n.matches('.slide') ? n.querySelector('h3') : null; if (h) out.push(n); n = n.nextElementSibling; }
    return out;
  }
  function deckToc(toc) {
    var sects = deckSections(), cur = toc.__cur && toc.__cur.sect;
    var title = ((document.querySelector('.deck-head h1, h1') || {}).textContent || 'Contents').trim();
    var heads = [], html = tocHead(title) + weakHtml() + '<div class="duo-eyebrow duo-gap">Topics</div><ol class="duo-secs duo-decksecs">';
    sects.forEach(function (sc) {
      var lab = sc.querySelector('.lo'), h2 = sc.querySelector('h2'), i = heads.length; heads.push(sc);
      html += '<li><button type="button" data-duo-sec="' + i + '"><small>' + esc(lab ? lab.textContent.trim() : '') + '</small>' + esc(h2 ? h2.textContent.trim() : headLabel(sc)) + '</button>';
      if (sc === cur) {
        var sl = deckSlides(sc);
        if (sl.length) html += '<ol class="duo-sub">' + sl.map(function (s) { var j = heads.length; heads.push(s); return '<li><button type="button" data-duo-sec="' + j + '">' + esc(s.querySelector('h3').textContent.trim()) + '</button></li>'; }).join('') + '</ol>';
      }
      html += '</li>';
    });
    html += '</ol>';
    toc.__heads = heads; toc.__tabs = [];
    return html;
  }
  function readerToc() {
    var toc = el('nav', 'duoToc', 'duo-toc'); toc.setAttribute('aria-label', 'Contents');
    var html;
    if (IS_DECK) html = deckToc(toc);
    else {
      var tabs = Array.prototype.slice.call(document.querySelectorAll('.tab-btn'));
      var panel = document.querySelector('.section-panel.active, .panel.active');
      var heads = readerHeads(panel);
      var title = ((document.querySelector('.report-title h1, header h1, h1') || {}).textContent || 'Contents').trim();
      html = tocHead(title) + '<div class="duo-tabs">' +
        tabs.map(function (b, i) { return '<button type="button" data-duo-tab="' + i + '" class="' + (b.classList.contains('active') ? 'on' : '') + '">' + esc(b.textContent.trim()) + '</button>'; }).join('') +
        '</div><div class="duo-eyebrow duo-gap">In this tab</div><ol class="duo-secs">' +
        heads.map(function (h, i) { return '<li><button type="button" data-duo-sec="' + i + '">' + esc(headLabel(h)) + '</button></li>'; }).join('') + '</ol>';
      toc.__heads = heads; toc.__tabs = tabs;
    }
    if (toc.__html !== html) { toc.__html = html; toc.innerHTML = html; }
    return toc;
  }
  function scroller() { return document.getElementById('rdrWrap'); }
  // Teach mode: the block being narrated carries .rt-hi — mark its section on the left page.
  function teachHead(heads) {
    var hi = document.querySelector('.rt-hi'); if (!hi || !document.body.classList.contains('rt-on')) return -1;
    var best = -1;
    heads.forEach(function (h, i) {
      if (h === hi || h.contains(hi)) { best = i; return; }
      var c = h.closest('.section-card') || h.parentElement;
      if (!IS_DECK && c && c.contains(hi)) best = i;
      if (IS_DECK && (h.compareDocumentPosition(hi) & Node.DOCUMENT_POSITION_FOLLOWING)) best = i;
    });
    return best;
  }
  var tocT = 0, restored = false;
  function markToc() {
    var toc = document.getElementById('duoToc'), wrap = scroller();
    if (!toc || toc.hidden || !wrap || !toc.__heads) return;
    var lim = (current ? wrap.getBoundingClientRect().top : 0) + 32, cur = -1;
    toc.__heads.forEach(function (h, i) { var r = h.getBoundingClientRect(); if (r.height && r.top <= lim) cur = i; });
    var teach = teachHead(toc.__heads);
    if (IS_DECK) {   // nested list follows the section you are in
      var sects = deckSections(), cs = null;
      for (var k = sects.length - 1; k >= 0; k--) { if (sects[k].getBoundingClientRect().top <= lim) { cs = sects[k]; break; } }
      if (teach >= 0) { var th = toc.__heads[teach]; cs = th.classList.contains('sect') ? th : cs; }
      if ((toc.__cur && toc.__cur.sect) !== cs) { toc.__cur = { sect: cs }; readerToc(); return markToc(); }
    }
    toc.querySelectorAll('[data-duo-sec]').forEach(function (b, i) { b.classList.toggle('now', i === cur); b.classList.toggle('teach', i === teach); });
    var on = toc.querySelector(teach >= 0 ? '.teach' : '.now');
    if (on && on !== toc.__on) { toc.__on = on; var tb = toc.getBoundingClientRect(), ob = on.getBoundingClientRect(); if (ob.top < tb.top + 40 || ob.bottom > tb.bottom - 20) on.scrollIntoView({ block: 'center' }); }
    savePos(cur >= 0 ? toc.__heads[cur] : null);
  }
  // Remember where you were (tab + section) per reader/deck; restored the next time the book view opens.
  function savePos(h) {
    if (!h || !current) return;
    var tabs = toc_tabs(), ti = -1;
    tabs.forEach(function (b, i) { if (b.classList.contains('active')) ti = i; });
    var lab = IS_DECK ? ((h.querySelector('h2,h3') || h).textContent.trim()) : headLabel(h);
    try { localStorage.setItem(POS_KEY, JSON.stringify({ tab: ti, sec: lab, ts: Date.now() })); } catch (e) {}
  }
  function toc_tabs() { return Array.prototype.slice.call(document.querySelectorAll('.tab-btn')); }
  function restorePos() {
    if (restored || !current) return; restored = true;
    if (/^#./.test(location.hash)) return;   // a deep link (Module Hub → reader tab) wins
    var p = null; try { p = JSON.parse(localStorage.getItem(POS_KEY) || 'null'); } catch (e) {}
    if (!p || !p.sec) return;
    var tabs = toc_tabs();
    if (p.tab >= 0 && tabs[p.tab] && !tabs[p.tab].classList.contains('active')) tabs[p.tab].click();
    setTimeout(function () {
      var heads = IS_DECK ? Array.prototype.slice.call(document.querySelectorAll('#rdrWrap .sect, #rdrWrap .slide')) : readerHeads(document.querySelector('.section-panel.active, .panel.active'));
      var h = heads.filter(function (x) { return (IS_DECK ? ((x.querySelector('h2,h3') || x).textContent.trim()) : headLabel(x)) === p.sec; })[0];
      if (h) goTo(h);
    }, 60);
  }
  function goTo(h) {
    if (!IS_DECK && isCollapsed(h)) h.click();
    var t = IS_DECK ? h : (h.closest('.section-card') || h), w = scroller();
    if (current && w) w.scrollTop += t.getBoundingClientRect().top - w.getBoundingClientRect().top - 8;
    else t.scrollIntoView({ block: 'start' });
    setTimeout(markToc, 120);
  }
  document.addEventListener('scroll', function () { if (!IS_DOC || !current) return; clearTimeout(tocT); tocT = setTimeout(markToc, 80); }, true);
  function setWide(on) {
    wide = !!on; root.classList.toggle('duo-wide', wide && !!current);
    var b = document.getElementById('duoTocBtn'); if (b) { b.hidden = !(current && wide); }
    setTimeout(markToc, 60);
  }
  function tocBtn() {   // "☰ Contents" — brings the left page back after Full page
    var b = document.getElementById('duoTocBtn');
    if (!b && window.__rdrChromeL) {
      b = document.createElement('button'); b.type = 'button'; b.id = 'duoTocBtn'; b.className = 'rdr-cbtn';
      b.innerHTML = '<span>☰</span><span class="rdr-lbl">Contents</span>'; b.hidden = true;
      window.__rdrChromeL.appendChild(b);
      b.addEventListener('click', function () { setWide(false); });
    }
    if (b) b.hidden = !(current && wide);
  }
  function layoutReader() {
    var toc = document.getElementById('duoToc');
    if (current) { toc = readerToc(); toc.hidden = false; markToc(); restorePos(); } else if (toc) toc.hidden = true;
    root.classList.toggle('duo-wide', wide && !!current);
    tocBtn();
  }
  document.addEventListener('click', function (e) {
    if (!IS_DOC || !e.target.closest) return;
    var toc = document.getElementById('duoToc'); if (!toc || !toc.contains(e.target)) return;
    if (e.target.closest('[data-duo-wide]')) { setWide(true); return; }
    var t = e.target.closest('[data-duo-tab]'), s = e.target.closest('[data-duo-sec]'), m = e.target.closest('[data-duo-mod]');
    if (t) {
      var b = toc.__tabs[+t.getAttribute('data-duo-tab')]; if (b) b.click();
      var w = scroller(); if (w) w.scrollTop = 0;
      toc.querySelectorAll('[data-duo-tab]').forEach(function (x) { x.classList.toggle('on', x === t); });   // instant feedback
      setTimeout(layoutReader, 30);
    }
    if (s) {
      var h = toc.__heads[+s.getAttribute('data-duo-sec')];
      toc.querySelectorAll('[data-duo-sec]').forEach(function (x) { x.classList.toggle('now', x === s); });
      if (h) { if (IS_DECK && h.classList.contains('sect')) toc.__cur = { sect: h }; goTo(h); }
    }
    if (m) {
      var mod = m.getAttribute('data-duo-mod'), sc = deckSections().filter(function (x) { var l = x.querySelector('.lo'); return l && new RegExp('Module ' + mod + '\\b').test(l.textContent); })[0];
      if (sc) { toc.__cur = { sect: sc }; goTo(sc); }
    }
  });

  function layout(changed) {
    if (IS_APP) layoutApp(changed);
    if (IS_DOC) layoutReader();
  }

  // ---------- watchers ----------
  var t = 0;
  function later() { clearTimeout(t); t = setTimeout(function () { probeSide(); decide(); }, 120); }
  function watch() {
    [MQ.v2, MQ.h2, MQ.folded, MQ.cont].forEach(function (m) { if (m) { if (m.addEventListener) m.addEventListener('change', later); else if (m.addListener) m.addListener(later); } });
    var dp = navigator.devicePosture; if (dp && dp.addEventListener) dp.addEventListener('change', later);
    if (window.viewport && window.viewport.addEventListener) { try { window.viewport.addEventListener('segmentschange', later); } catch (e) {} }
    if (window.visualViewport) window.visualViewport.addEventListener('resize', later);
    window.addEventListener('resize', later); window.addEventListener('orientationchange', later);
    document.addEventListener('visibilitychange', later);
    var apis = !!(window.viewport || navigator.devicePosture || (MQ.v2 && MQ.v2.media !== 'not all'));
    var sig = '';
    if (apis) setInterval(function () {
      if (document.visibilityState !== 'visible') return;
      var s = segments(), n = posture() + '|' + s.n + '|' + innerWidth + 'x' + innerHeight + '|' + [s.a, s.b].map(function (r) { return r ? [r.top, r.bottom, r.left, r.right].map(Math.round).join(',') : ''; }).join('|');
      if (n !== sig) { sig = n; decide(); }
    }, 1000);
    // route / content changes
    if (window.MutationObserver) {
      if (IS_APP) {
        var mo = new MutationObserver(function () { if (current) layoutApp(false); });
        document.querySelectorAll('.wrap > section').forEach(function (s) { mo.observe(s, { attributes: true, attributeFilter: ['class'] }); });
        var area = document.getElementById('studyArea'), coach = document.getElementById('coach'), ft = document.getElementById('fp513Today');
        var mo2 = new MutationObserver(function () { if (current === 'seated') renderTop(); else if (current === 'book') layoutApp(false); });
        [area, coach, ft].forEach(function (n) { if (n) mo2.observe(n, { childList: true, subtree: true }); });
      }
      if (IS_DOC) {
        var mo4 = new MutationObserver(function () { if (current) { clearTimeout(tocT); tocT = setTimeout(markToc, 120); } });
        mo4.observe(document.body, { attributes: true, attributeFilter: ['class'] });
      }
      if (IS_READER) {
        var mo3 = new MutationObserver(function () { if (current) layoutReader(); });
        document.querySelectorAll('.section-panel, .panel').forEach(function (p) { mo3.observe(p, { attributes: true, attributeFilter: ['class'] }); });
      }
    }
  }

  function start() {
    probeSide(); decide(); watch();
    if (IS_APP) settingsControl();
    toggleBtn();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
  window.CFPDuo = { decide: decide, setMode: setMode, setWide: setWide, mode: function () { return mode; }, pose: function () { return current; } };
})();

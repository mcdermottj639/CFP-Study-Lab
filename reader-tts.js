/* Shared Interactive-Reader read-aloud ("audiobook mode") — fully offline.
 * Adds a floating 🎧 button that reads the ACTIVE tab aloud with the browser's
 * built-in Web Speech API (speechSynthesis) — the OS's own voices, so no vendored
 * asset, no CDN, no network (doesn't violate the offline rule).
 *
 * Reads block-by-block (each heading / paragraph / list-item is its own
 * utterance) so it (a) sidesteps iOS Safari's long-utterance cut-off, (b) can
 * highlight + auto-scroll the current block, and (c) auto-expands a collapsed
 * section when it reaches text inside it. A control strip gives ⏮ ⏭ prev/next,
 * ⏸/▶ pause, and ⏹ stop.
 *
 * Reader-agnostic: finds the current tab as the largest `.active` panel (same
 * convention reader-search.js relies on), so it works on FP511, FP512, and any
 * future reader with no per-reader code. Injected after reader-theme.js so its UI
 * sits on <body>, outside the dark-mode filter wrapper. Precached in sw.js. */
(function () {
  'use strict';
  if (window.__readerTTS) return; window.__readerTTS = true;
  if (!('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') return;

  var sp = window.speechSynthesis;

  // Honor ONLY an explicit user pick (⋯ voice picker's localStorage 'cfpTtsVoice').
  // Otherwise return null so we DON'T set utterance.voice — the OS default is used.
  // On iOS, force-setting a getVoices() entry often picks the compact/robotic
  // rendition, whereas leaving voice unset uses the user's chosen enhanced default
  // (e.g. Ava). Mirrors ttsPickVoice() in the app source (kept in sync).
  function allVoices() { try { return sp.getVoices() || []; } catch (e) { return []; } }
  function pickVoice() {
    var pref = null; try { pref = localStorage.getItem('cfpTtsVoice'); } catch (e) {}
    if (!pref) return null;                          // Automatic → OS default (don't override)
    var vs = allVoices(); if (!vs.length) return null;
    return vs.filter(function (v) { return v.voiceURI === pref || v.name === pref; })[0] || null;
  }
  // iOS/Safari populate getVoices() asynchronously — the first call on a fresh page
  // returns []. Warm it at load, and gate the first utterance on voices being ready
  // so the reader uses the chosen/best voice instead of falling back to the robotic
  // default. (This is why the app worked but the reader didn't: the app's ⋯ picker
  // calls getVoices() on load; the reader never did.)
  try { sp.getVoices(); sp.addEventListener('voiceschanged', function () {}); } catch (e) {}
  function ensureVoices(cb) {
    if (allVoices().length) { cb(); return; }
    var done = false, fire = function () { if (done) return; done = true; cb(); };
    try { sp.addEventListener('voiceschanged', fire); } catch (e) { try { sp.onvoiceschanged = fire; } catch (e2) {} }
    setTimeout(fire, 300);                          // fallback if the event never fires
  }

  function ready(fn) {
    if (document.readyState === 'complete') fn();
    else window.addEventListener('load', fn);
  }

  ready(function () {
    var tabs = [].slice.call(document.querySelectorAll('.tab-btn'));
    if (!tabs.length) return;                       // not a tabbed reader — skip

    injectStyles();

    var fab = el('button', 'rtFab');
    fab.type = 'button';
    fab.title = 'Read this tab aloud';
    fab.innerHTML = '🎧 Listen';
    document.body.appendChild(fab);

    var bar = el('div', 'rtBar');
    bar.innerHTML =
      '<button data-a="prev" title="Previous">⏮</button>' +
      '<button data-a="toggle" title="Pause / resume">⏸</button>' +
      '<button data-a="next" title="Next">⏭</button>' +
      '<button data-a="stop" title="Stop">⏹</button>' +
      '<button class="rt-speed" data-a="speed" title="Reading speed"></button>' +
      '<span class="rt-pos"></span>';
    document.body.appendChild(bar);
    var posEl = bar.querySelector('.rt-pos');
    var toggleBtn = bar.querySelector('[data-a="toggle"]');
    var speedBtn = bar.querySelector('[data-a="speed"]');

    var blocks = [], pos = 0, playing = false, paused = false, gen = 0;

    // Reading speed — tap to cycle, persisted in localStorage 'cfpTtsRate'.
    var RATES = [0.8, 1, 1.25, 1.5, 1.75, 2];
    var rate = 1;
    try { var sr = parseFloat(localStorage.getItem('cfpTtsRate')); if (sr >= 0.5 && sr <= 3) rate = sr; } catch (e) {}
    function fmtRate(r) { return (r === Math.round(r) ? r : r.toFixed(2).replace(/0$/, '')) + '×'; }
    function syncSpeed() { speedBtn.textContent = fmtRate(rate); }
    function cycleSpeed() {
      var i = RATES.indexOf(rate);
      rate = RATES[(i + 1) % RATES.length];
      try { localStorage.setItem('cfpTtsRate', String(rate)); } catch (e) {}
      syncSpeed();
      if (playing && !paused) playIndex(pos, true);   // re-speak current block at the new rate (can't retune in flight)
    }
    syncSpeed();

    fab.onclick = function () { if (playing) stop(); else start(); };
    bar.addEventListener('click', function (e) {
      var a = e.target && e.target.getAttribute && e.target.getAttribute('data-a');
      if (a === 'prev') jump(pos - 1);
      else if (a === 'next') jump(pos + 1);
      else if (a === 'toggle') togglePause();
      else if (a === 'stop') stop();
      else if (a === 'speed') cycleSpeed();
    });

    // Stop cleanly on tab switch / navigation away / tab hidden.
    tabs.forEach(function (t) { t.addEventListener('click', function () { if (playing) stop(); }); });
    window.addEventListener('pagehide', function () { sp.cancel(); });
    window.addEventListener('beforeunload', function () { sp.cancel(); });
    document.addEventListener('visibilitychange', function () { if (document.hidden && playing) stop(); });

    function textOf(e) { return (e.innerText || e.textContent || '').replace(/\s+/g, ' ').trim(); }

    // An element is a "leaf text block" if it has text and every child element is
    // inline — so <div class="callout">…</div>, stat cards, key-fact boxes, etc.
    // are read, not just the p/li/heading whitelist. Containers with block children
    // are recursed into instead.
    var INLINE = { B:1,I:1,EM:1,STRONG:1,SPAN:1,A:1,CODE:1,SUB:1,SUP:1,SMALL:1,MARK:1,BR:1,U:1,ABBR:1,TIME:1,WBR:1,S:1,Q:1,CITE:1,KBD:1,VAR:1,SAMP:1,BDI:1,BDO:1,DFN:1,LABEL:1,OUTPUT:1 };
    var SKIP = { SCRIPT:1,STYLE:1,NOSCRIPT:1,CANVAS:1,SVG:1,IMG:1,VIDEO:1,AUDIO:1,IFRAME:1,BUTTON:1,INPUT:1,SELECT:1,TEXTAREA:1,NAV:1,FORM:1 };
    function skipEl(el) {
      if (SKIP[el.tagName]) return true;
      if (el.id === 'rtBar' || el.id === 'rtFab') return true;
      if (el.classList && el.classList.contains('tab-btn')) return true;
      if (el.getAttribute && el.getAttribute('aria-hidden') === 'true') return true;
      return false;
    }
    function isLeafBlock(el) {
      if (!textOf(el)) return false;
      var k = el.children;
      for (var i = 0; i < k.length; i++) { if (!INLINE[k[i].tagName]) return false; }
      return true;
    }
    // A small container whose children are all simple leaf blocks and whose combined
    // text is short (a stat tile: number + label, a two-line badge, …). Reading these
    // as ONE phrase avoids choppy "15%" … "Exam Weight" fragments.
    function isCompactGroup(el) {
      var k = el.children; if (k.length < 2 || k.length > 6) return false;
      var total = 0;
      for (var i = 0; i < k.length; i++) {
        var c = k[i];
        if (SKIP[c.tagName] || c.tagName === 'TABLE' || !isLeafBlock(c)) return false;
        total += textOf(c).length;
      }
      return total > 0 && total <= 120;
    }
    // Collapse/expand toggle glyphs many section headers carry as their first/last
    // char (hyphen, Unicode minus U+2212, dashes, triangles, chevrons). Stripped so
    // "Course Scope & Module Map −" doesn't read as "…Map minus".
    var TOGGLE = '[\\s\\u00a0+\\-\\u2212\\u2013\\u2014\\u25be\\u25b8\\u25bc\\u25b6\\u25bd\\u25b2\\u25b4\\u203a\\u00bb\\u2039\\u00ab]';
    function blockText(el) {
      var t = textOf(el);
      return t.replace(new RegExp('^' + TOGGLE + '+'), '').replace(new RegExp(TOGGLE + '+$'), '').trim();
    }

    // ---- collect readable units from the active tab, in natural document order ----
    // Returns [{el, text}] so each unit has an element to highlight/scroll and the
    // exact text to speak. Walks the DOM generically so NOTHING with text is skipped;
    // tables are expanded row-by-row (each row paired with its header labels) so a
    // matrix reads as flowing sentences and highlights row-by-row.
    function collect() {
      var panels = [].slice.call(document.querySelectorAll('.active')).filter(function (n) {
        return !n.matches('.tab-btn,.collapsible-header,.collapsible-content,.ch,.cc');
      });
      var root = null, max = -1;
      panels.forEach(function (p) { var len = (p.textContent || '').length; if (len > max) { max = len; root = p; } });
      if (!root) root = document.getElementById('rdrWrap') || document.body;

      var units = [];
      function pushTable(tbl) {
        var rows = [].slice.call(tbl.querySelectorAll('tr'));
        if (!rows.length) { var tt = textOf(tbl); if (tt.length > 1) units.push({ el: tbl, text: tt }); return; }
        var head0 = [].slice.call(rows[0].children);
        var headerRow = head0.length > 1 && head0.some(function (c) { return c.tagName === 'TH'; });
        var cols = headerRow ? head0.map(textOf) : null;
        var pushed = 0;
        for (var i = headerRow ? 1 : 0; i < rows.length; i++) {
          var cells = [].slice.call(rows[i].children);
          if (!cells.length) continue;
          var rowLabel = cells[0].tagName === 'TH' ? textOf(cells[0]) : '';
          var parts = [];
          for (var j = rowLabel ? 1 : 0; j < cells.length; j++) {
            var val = textOf(cells[j]); if (!val) continue;
            var col = cols ? cols[j] : '';
            parts.push(col ? col + ': ' + val : val);
          }
          var line = (rowLabel ? rowLabel + '. ' : '') + parts.join('. ');
          if (line.trim().length > 1) { units.push({ el: rows[i], text: line }); pushed++; }
        }
        if (!pushed) { var t2 = textOf(tbl); if (t2.length > 1) units.push({ el: tbl, text: t2 }); }
      }
      (function walk(node) {
        var kids = node.children;
        for (var i = 0; i < kids.length; i++) {
          var el = kids[i];
          if (skipEl(el)) continue;
          if (el.tagName === 'TABLE') { pushTable(el); continue; }
          if (isLeafBlock(el)) { var t = blockText(el); if (t.length > 1) units.push({ el: el, text: t }); }
          else if (isCompactGroup(el)) { var g = blockText(el); if (g.length > 1) units.push({ el: el, text: g }); }
          else walk(el);
        }
      })(root);
      return units;
    }

    function start() {
      blocks = collect();
      if (!blocks.length) return;
      playing = true; paused = false;
      bar.classList.add('on');
      fab.classList.add('playing');
      fab.innerHTML = '⏹ Stop';
      ensureVoices(function () { if (playing) playIndex(0, true); });   // wait for the voice list before the 1st utterance
    }

    // viaCancel: cancel the queue first (start / skip / resume). On natural advance
    // (from onend) we DON'T cancel — that avoids the gap/clip between blocks, so it
    // flows continuously instead of stuttering.
    function playIndex(i, viaCancel) {
      gen++; var myGen = gen;
      if (i < 0) i = 0;
      pos = i;
      if (i >= blocks.length) { finish(); return; }
      var unit = blocks[i];
      reveal(unit.el);
      if (!unit.text) { playIndex(i + 1, viaCancel); return; }
      var u = new SpeechSynthesisUtterance(unit.text);
      u.rate = rate;
      var v = pickVoice(); if (v) { u.voice = v; u.lang = v.lang; }
      u.onend = function () { if (myGen === gen && playing && !paused) playIndex(pos + 1, false); };
      u.onerror = function () { if (myGen === gen && playing && !paused) playIndex(pos + 1, false); };
      if (viaCancel) sp.cancel();
      sp.speak(u);
      updateBar();
    }

    function jump(i) { if (!playing) return; paused = false; syncToggle(); playIndex(i, true); }

    function togglePause() {
      if (!playing) return;
      if (paused) { paused = false; try { sp.resume(); } catch (e) {} playIndex(pos, true); }  // resume by re-speaking current block (robust on iOS)
      else { paused = true; gen++; try { sp.cancel(); } catch (e) {} }
      syncToggle();
    }

    function finish() { stop(); }

    function stop() {
      playing = false; paused = false; gen++;
      try { sp.cancel(); } catch (e) {}
      clearHi();
      bar.classList.remove('on');
      fab.classList.remove('playing');
      fab.innerHTML = '🎧 Listen';
    }

    function reveal(node) {
      if (node.offsetParent === null && node.closest) {           // block is inside a collapsed section — expand it
        var cc = node.closest('.collapsible-content,.cc');
        if (cc) { var h = cc.previousElementSibling; if (h && /collapsible-header|ch/.test(h.className || '')) { try { h.click(); } catch (e) {} } }
      }
      clearHi();
      node.classList.add('rt-hi');
      try { node.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) { try { node.scrollIntoView(); } catch (e2) {} }
    }
    function clearHi() { [].slice.call(document.querySelectorAll('.rt-hi')).forEach(function (n) { n.classList.remove('rt-hi'); }); }

    function updateBar() { if (blocks.length) posEl.textContent = '¶ ' + (pos + 1) + '/' + blocks.length; }
    function syncToggle() { toggleBtn.textContent = paused ? '▶' : '⏸'; toggleBtn.title = paused ? 'Resume' : 'Pause'; }

    function injectStyles() {
      var css =
        '#rtFab{position:fixed;right:max(14px,env(safe-area-inset-right));bottom:calc(74px + env(safe-area-inset-bottom));z-index:9000;height:50px;padding:0 16px;border:none;border-radius:25px;background:linear-gradient(135deg,#2f8f6b,#3cae86);color:#fff;font:600 14px system-ui,-apple-system,sans-serif;display:inline-flex;align-items:center;gap:7px;cursor:pointer;box-shadow:0 6px 18px -4px rgba(20,60,44,.55)}' +
        '#rtFab.playing{background:linear-gradient(135deg,#c0453d,#dc6b3a)}' +
        '#rtBar{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(14px + env(safe-area-inset-bottom));z-index:9001;display:none;align-items:center;gap:4px;background:#fffdf8;border:1px solid #e2d8c6;border-radius:999px;padding:6px 8px;box-shadow:0 12px 34px -10px rgba(0,0,0,.45)}' +
        '#rtBar.on{display:inline-flex}' +
        '#rtBar button{border:none;background:#f1ece3;color:#3a2e25;width:40px;height:40px;border-radius:50%;font-size:15px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center}' +
        '#rtBar button:hover{background:#e7ddcd}' +
        '#rtBar button.rt-speed{width:auto;min-width:46px;border-radius:20px;padding:0 12px;font:700 13px system-ui,-apple-system,sans-serif;font-variant-numeric:tabular-nums}' +
        '#rtBar .rt-pos{font:600 12px system-ui,-apple-system,sans-serif;color:#7a6f5f;padding:0 8px;white-space:nowrap}' +
        '.rt-hi{background:#ffe9b8 !important;border-radius:3px;box-shadow:0 0 0 3px #ffe9b8;scroll-margin-top:80px}' +
        'html[data-theme="dark"] #rtBar{background:#241c16;border-color:#3a2e25}' +
        'html[data-theme="dark"] #rtBar button{background:#2f251d;color:#e8dccb}' +
        'html[data-theme="dark"] #rtBar button:hover{background:#3a2e25}' +
        'html[data-theme="dark"] #rtBar .rt-pos{color:#b7a996}';
      var s = document.createElement('style'); s.id = 'rtCSS'; s.textContent = css; document.head.appendChild(s);
    }
    function el(tag, id) { var e = document.createElement(tag); if (id) e.id = id; return e; }

    syncToggle();
  });
})();

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

  // Pick the best available voice (honoring the ⋯ voice picker's localStorage
  // 'cfpTtsVoice'). iOS hides Siri voices from web pages and defaults to the
  // low-quality compact voice, so we select explicitly. Mirrors ttsPickVoice()
  // in the app source (kept in sync).
  function allVoices() { try { return sp.getVoices() || []; } catch (e) { return []; } }
  function scoreVoice(v) {
    var u = ((v.voiceURI || '') + ' ' + (v.name || '')).toLowerCase(), s = 0;
    if (u.indexOf('premium') >= 0) s += 6; if (u.indexOf('enhanced') >= 0) s += 5; if (/siri/.test(u)) s += 4;
    if (/(ava|evan|zoe|nathan|joelle|allison|samantha|susan|tom|nicky|aaron)/.test(u)) s += 2;
    if (u.indexOf('compact') >= 0) s -= 3; if (/en-us/i.test(v.lang || '')) s += 1;
    if (/(novelty|bells|trinoids|bad news|good news|jester|organ|cellos|zarvox|whisper|bahh|boing|bubbles|wobble|superstar|albert|fred|ralph|kathy|junior)/.test(u)) s -= 20;
    return s;
  }
  function pickVoice() {
    var vs = allVoices(); if (!vs.length) return null;
    var pref = null; try { pref = localStorage.getItem('cfpTtsVoice'); } catch (e) {}
    if (pref) { var m = vs.filter(function (v) { return v.voiceURI === pref || v.name === pref; })[0]; if (m) return m; }
    var en = vs.filter(function (v) { return /^en/i.test(v.lang || ''); }); var pool = en.length ? en : vs;
    return pool.slice().sort(function (a, b) { return scoreVoice(b) - scoreVoice(a); })[0] || null;
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
      '<span class="rt-pos"></span>';
    document.body.appendChild(bar);
    var posEl = bar.querySelector('.rt-pos');
    var toggleBtn = bar.querySelector('[data-a="toggle"]');

    var blocks = [], pos = 0, playing = false, paused = false, gen = 0;

    fab.onclick = function () { if (playing) stop(); else start(); };
    bar.addEventListener('click', function (e) {
      var a = e.target && e.target.getAttribute && e.target.getAttribute('data-a');
      if (a === 'prev') jump(pos - 1);
      else if (a === 'next') jump(pos + 1);
      else if (a === 'toggle') togglePause();
      else if (a === 'stop') stop();
    });

    // Stop cleanly on tab switch / navigation away / tab hidden.
    tabs.forEach(function (t) { t.addEventListener('click', function () { if (playing) stop(); }); });
    window.addEventListener('pagehide', function () { sp.cancel(); });
    window.addEventListener('beforeunload', function () { sp.cancel(); });
    document.addEventListener('visibilitychange', function () { if (document.hidden && playing) stop(); });

    // ---- collect readable blocks from the active tab (leaf text blocks, in order) ----
    function collect() {
      var panels = [].slice.call(document.querySelectorAll('.active')).filter(function (n) {
        return !n.matches('.tab-btn,.collapsible-header,.collapsible-content,.ch,.cc');
      });
      var root = null, max = -1;
      panels.forEach(function (p) { var len = (p.textContent || '').length; if (len > max) { max = len; root = p; } });
      if (!root) root = document.getElementById('rdrWrap') || document.body;
      var sel = 'h1,h2,h3,h4,p,li,blockquote,dd,dt';
      return [].slice.call(root.querySelectorAll(sel)).filter(function (e) {
        if (e.querySelector(sel)) return false;                 // leaf text blocks only (no double-read of nested lists)
        if (e.closest('#rtBar,#rtFab')) return false;
        return (e.textContent || '').replace(/\s+/g, ' ').trim().length > 1;
      });
    }

    function plain(e) { return (e.innerText || e.textContent || '').replace(/\s+/g, ' ').trim(); }

    function start() {
      blocks = collect();
      if (!blocks.length) return;
      playing = true; paused = false;
      bar.classList.add('on');
      fab.classList.add('playing');
      fab.innerHTML = '⏹ Stop';
      playIndex(0);
    }

    function playIndex(i) {
      gen++; var myGen = gen;
      if (i < 0) i = 0;
      pos = i;
      if (i >= blocks.length) { finish(); return; }
      var node = blocks[i];
      reveal(node);
      var u = new SpeechSynthesisUtterance(plain(node));
      u.rate = 0.98;
      var v = pickVoice(); if (v) { u.voice = v; u.lang = v.lang; }
      u.onend = function () { if (myGen === gen && playing && !paused) playIndex(pos + 1); };
      u.onerror = function () { if (myGen === gen && playing && !paused) playIndex(pos + 1); };
      sp.cancel(); sp.speak(u);
      updateBar();
    }

    function jump(i) { if (!playing) return; paused = false; syncToggle(); playIndex(i); }

    function togglePause() {
      if (!playing) return;
      if (paused) { paused = false; try { sp.resume(); } catch (e) {} playIndex(pos); }  // resume by re-speaking current block (robust on iOS)
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

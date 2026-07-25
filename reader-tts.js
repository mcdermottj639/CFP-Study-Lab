/* Shared Interactive-Reader read-aloud — "podcast mode" — fully offline.
 * Adds a floating 🎙️ button that reads the WHOLE reader aloud, top to bottom,
 * FLOWING automatically from one tab to the next (so you press play once and can
 * put the phone down), with the browser's built-in Web Speech API
 * (speechSynthesis) — the OS's own voices, so no vendored asset, no CDN, no
 * network (doesn't violate the offline rule).
 *
 * Podcast qualities (v2.71.0):
 *  - Whole-reader playlist. All tabs are pre-collected into ONE flat block list up
 *    front. tab.click() switches tabs synchronously with no repaint (same trick
 *    reader-search.js uses), so building the playlist across every tab causes no
 *    visible flicker. Playback walks the flat list, auto-switching the active tab
 *    only when it reaches a block that lives on a different tab.
 *  - Resume where you left off. The current position is bookmarked in localStorage
 *    per reader (`cfpPodcast:<file>`) on every block, on pause/stop, and when the
 *    page is hidden. Pressing 🎧 Resume picks up at the same spot — even after you
 *    close and reopen the app. Reaching the end clears the bookmark.
 *  - Screen stays awake while playing (Wake Lock API where supported) so you can
 *    listen hands-free without the screen sleeping mid-episode.
 *  - Background recovery. If the OS stops speech when the screen locks / the tab is
 *    hidden (iOS does), returning to the page re-speaks the current block so you
 *    never lose your place. (True lock-screen playback isn't possible with the Web
 *    Speech API without a vendored audio asset, which the offline rule forbids.)
 *
 * Reads block-by-block (each heading / paragraph / list-item / table row is its own
 * utterance) so it (a) sidesteps iOS Safari's long-utterance cut-off, (b) can
 * highlight + auto-scroll the current block, and (c) auto-expands a collapsed
 * section when it reaches text inside it. A docked control bar gives ⏮ ⏭ prev/next,
 * ⏸/▶ pause, ⏹ stop, a reading-speed button, and a ¶ position counter.
 *
 * Reader-agnostic: tabs are the `.tab-btn` elements and the reading root per tab is
 * the largest `.active` panel (same conventions reader-search.js relies on), so it
 * works on FP511, FP512, and any future reader with no per-reader code. Injected
 * after reader-theme.js so its UI sits on <body>, outside the dark-mode filter
 * wrapper. Precached in sw.js. */
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
    var FILE = (location.pathname || '').split('/').pop() || 'reader';

    // A Kaplan per-module slide DECK is a single vertical-scroll page (no .tab-btn, no
    // collapsibles) that opts into Teach via window.DECK_TEACH[FILE] = [{at, say}, …].
    // Decks are TEACH-ONLY here — the verbatim Podcast reads poorly on a visual deck of
    // stat tiles/tables — so no 🎙️ FAB is shown. Everything else stays tab-based.
    var deckRoot = document.getElementById('rdrWrap');
    var deckTeach = (window.DECK_TEACH && window.DECK_TEACH[FILE]) || null;
    var isDeck = !tabs.length && !!deckRoot && !!(deckTeach && deckTeach.length);
    if (!tabs.length && !isDeck) return;            // not a tabbed reader and not a teachable deck — skip

    injectStyles();
    if (isDeck) document.body.classList.add('rt-deck');

    // Two modes share this player: 'read' = the whole-reader verbatim podcast;
    // 'teach' = a teacher's narration (window.READER_TEACH / window.DECK_TEACH) walkthrough.
    var mode = isDeck ? 'teach' : 'read';

    // Both modes now play the WHOLE reader start-to-finish, flowing tab to tab — read =
    // verbatim, teach = the teacher's narration — so each keeps one per-reader bookmark.
    function bmKey() { return mode === 'teach' ? ('cfpTeach:' + FILE) : ('cfpPodcast:' + FILE); }
    function readBookmark() { try { return JSON.parse(localStorage.getItem('cfpPodcast:' + FILE) || 'null'); } catch (e) { return null; } }
    function teachBookmark() { try { return JSON.parse(localStorage.getItem('cfpTeach:' + FILE) || 'null'); } catch (e) { return null; } }
    function loadBookmark() { try { return JSON.parse(localStorage.getItem(bmKey()) || 'null'); } catch (e) { return null; } }
    function saveBookmark(i) {
      try {
        var it = playlist[i];
        localStorage.setItem(bmKey(), JSON.stringify({ pos: i, txt: (it && it.text || '').slice(0, 40), n: playlist.length }));
      } catch (e) {}
    }
    function clearBookmark() { try { localStorage.removeItem(bmKey()); } catch (e) {} }

    function curTabId() { var a = document.querySelector('.tab-btn.active'); return a ? (a.getAttribute('data-tab') || '') : ''; }
    function teachMap() { return (window.READER_TEACH && window.READER_TEACH[FILE]) || null; }
    function hasTeach(tab) { var m = teachMap(); return !!(m && m[tab] && m[tab].length); }
    // Does this reader have ANY teacher narration? (teach now flows across the whole
    // reader, so the Teach FAB shows regardless of which tab you're on.)
    function readerHasTeach() { if (isDeck) return true; var m = teachMap(); return !!(m && Object.keys(m).length); }

    var fab = el('button', 'rtFab');
    fab.type = 'button';
    if (!isDeck) document.body.appendChild(fab);    // deck = Teach-only, no verbatim Podcast FAB

    // 👩‍🏫 Teach FAB (stacked above the Podcast FAB). Only shown on tabs that have
    // authored teaching narration; playing it speaks the teacher's script for that
    // tab instead of the page text verbatim.
    var teachFab = el('button', 'rtTeachFab');
    teachFab.type = 'button';
    teachFab.style.display = 'none';
    document.body.appendChild(teachFab);

    var bar = el('div', 'rtBar');
    bar.innerHTML =
      '<button data-a="toc" title="Contents — jump to a section">☰</button>' +
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

    // Contents overlay — a tab-grouped section list you can jump from.
    var toc = el('div', 'rtToc');
    toc.innerHTML =
      '<div class="rt-toc-panel">' +
        '<div class="rt-toc-head"><b>Contents</b><button class="rt-toc-close" aria-label="Close">✕</button></div>' +
        '<div class="rt-toc-list"></div>' +
      '</div>';
    document.body.appendChild(toc);
    var tocList = toc.querySelector('.rt-toc-list');
    toc.addEventListener('click', function (e) { if (e.target === toc || (e.target.closest && e.target.closest('.rt-toc-close'))) closeToc(); });
    tocList.addEventListener('click', function (e) {
      var row = e.target && e.target.closest ? e.target.closest('.rt-toc-sec') : null;
      if (!row) return;
      var i = parseInt(row.getAttribute('data-i'), 10);
      if (i >= 0) { closeToc(); jump(i); }
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && toc.classList.contains('on')) closeToc(); });

    // playlist = flat [{el, text, tab, tabLabel}] — across ALL tabs (read) or the
    // current tab's authored sections (teach), in order.
    var playlist = [], pos = 0, playing = false, paused = false, gen = 0, lastRevealEl = null;
    var autoSwitch = false;                            // true while WE switch tabs (so the tab-click listener doesn't stop us)
    var startOverride = null;                          // {index, text} one-shot: read a block from a double-clicked word

    var RATE_BASE = 0.95;                              // unhurried base pace
    // A lighter breath between blocks — the old fixed 220ms read halting/stiff. Teach
    // flows tighter still (its blocks are multi-sentence chunks, so fewer, smaller gaps).
    function gapMs() { return mode === 'teach' ? 70 : 150; }
    function sentence(t) { return /[.!?…:;,)]$/.test(t) ? t : t + '.'; }   // sentence-final cadence so blocks don't run together

    // Keep the screen awake while playing so a hands-free listen isn't cut short by
    // the display sleeping (offline, no asset; silently no-ops where unsupported).
    var wake = null;
    function requestWake() {
      try {
        if ('wakeLock' in navigator && navigator.wakeLock) {
          navigator.wakeLock.request('screen').then(function (w) { wake = w; }).catch(function () {});
        }
      } catch (e) {}
    }
    function releaseWake() { try { if (wake) { wake.release(); wake = null; } } catch (e) {} }

    // FABs reflect state: while playing they're hidden (the bar has its own Stop);
    // otherwise each offers Resume when a bookmark exists, else a fresh start.
    function reflectFab() {
      if (playing) return;                             // showBar handles the playing state
      if (!isDeck) {                                    // deck has no Podcast FAB
        var rb = readBookmark(), resume = rb && rb.pos > 0;
        fab.innerHTML = resume ? '🎧 Resume' : '🎙️ Podcast';
        fab.title = resume ? 'Resume the podcast where you left off' : 'Play the whole guide as a podcast';
      }
      updateTeachFab();
    }
    // Teach FAB shows whenever the reader has any narration (teach flows across it all).
    function updateTeachFab() {
      if (playing) return;
      if (!readerHasTeach()) { teachFab.style.display = 'none'; return; }
      teachFab.style.display = '';
      var tb = teachBookmark(), resume = tb && tb.pos > 0;
      teachFab.innerHTML = resume ? '👩‍🏫 Resume lesson' : '👩‍🏫 Teach';
      teachFab.title = resume ? 'Resume the teacher walkthrough where you left off' : 'A teacher walks you through the whole guide';
    }

    // Single source of truth for the player UI: docked control bar visible, 🎙️ FAB +
    // search FAB hidden (they'd pile up), and body.rt-on lifts the Home/Theme buttons
    // above the bar (see injectStyles).
    function showBar(on) {
      bar.classList.toggle('on', on);
      document.body.classList.toggle('rt-on', on);
      fab.classList.toggle('playing', on);
      if (on) { fab.innerHTML = '⏹ Stop'; fab.title = 'Stop'; }
      else reflectFab();
    }

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

    fab.onclick = function () { if (playing) stop(); else start('read'); };
    teachFab.onclick = function () { if (playing) stop(); else start('teach'); };
    bar.addEventListener('click', function (e) {
      var a = e.target && e.target.getAttribute && e.target.getAttribute('data-a');
      if (a === 'prev') jump(pos - 1);
      else if (a === 'next') jump(pos + 1);
      else if (a === 'toggle') togglePause();
      else if (a === 'stop') stop();
      else if (a === 'speed') cycleSpeed();
      else if (a === 'toc') openToc();
    });

    // A MANUAL tab tap while playing NAVIGATES the audio to that tab (jumps to its first
    // block) rather than stopping — so you can move the podcast/teacher to a new page.
    // Our own auto-advance switches (autoSwitch) are ignored. Use the bar's ⏹ to stop.
    tabs.forEach(function (t) { t.addEventListener('click', function () {
      if (autoSwitch) return;                          // our own auto-advance switch — ignore
      if (playing) { jumpToTab(t); return; }           // move playback to this tab, don't stop
      setTimeout(updateTeachFab, 0);                   // refresh the Teach FAB for the new tab (after the reader flips .active)
    }); });
    // Jump playback to the first block that lives on tab `t` (reader-agnostic: matches by
    // the tab-button element stored on each playlist entry).
    function jumpToTab(t) {
      for (var i = 0; i < playlist.length; i++) { if (playlist[i].tab === t) { jump(i); return; } }
    }

    // ---- Contents (table of contents you can jump from) ----
    // A clean label for a section header (strip toggle glyphs + a trailing EXAM marker).
    function tocLabel(elx) {
      var t = blockText(elx).replace(/\s*EXAM\s*$/i, '').trim();
      return t;
    }
    // Build TOC rows from the current playlist: a group row per tab, then a jumpable row
    // per section. In teach mode every distinct anchor (a section header) is a section; in
    // read mode the sections are the collapsible-header blocks the walk collected.
    function buildTOC() {
      var rows = [], lastTab = null, lastSecEl = null;
      for (var i = 0; i < playlist.length; i++) {
        var u = playlist[i];
        if (u.tab !== lastTab) { rows.push({ type: 'tab', label: u.tabLabel, index: i }); lastTab = u.tab; lastSecEl = null; }
        var isHeader = u.el && u.el.matches && u.el.matches('.collapsible-header, .ch');
        if ((mode === 'teach' || isHeader) && u.el !== lastSecEl) {
          var lbl = tocLabel(u.el);
          if (lbl && lbl.toLowerCase() !== (u.tabLabel || '').toLowerCase()) rows.push({ type: 'sec', label: lbl, index: i });
          lastSecEl = u.el;
        }
      }
      return rows;
    }
    function openToc() {
      var rows = buildTOC();
      // Which section are we in now? (last row whose index <= pos)
      var curRow = -1;
      for (var r = 0; r < rows.length; r++) { if (rows[r].index <= pos) curRow = r; else break; }
      var html = '';
      for (var i = 0; i < rows.length; i++) {
        var row = rows[i], cur = (i === curRow) ? ' rt-toc-cur' : '';
        if (row.type === 'tab') html += '<div class="rt-toc-tab">' + esc(row.label) + '</div>';
        else html += '<button class="rt-toc-sec' + cur + '" data-i="' + row.index + '">' + esc(row.label) + (cur ? ' <span class="rt-toc-now">▶ now</span>' : '') + '</button>';
      }
      tocList.innerHTML = html || '<div class="rt-toc-tab">No sections</div>';
      toc.classList.add('on');
      var now = tocList.querySelector('.rt-toc-cur');
      if (now) { try { now.scrollIntoView({ block: 'center' }); } catch (e) {} }
    }
    function closeToc() { toc.classList.remove('on'); }
    function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
    window.addEventListener('pagehide', function () { if (playing) saveBookmark(pos); sp.cancel(); });
    window.addEventListener('beforeunload', function () { if (playing) saveBookmark(pos); sp.cancel(); });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { if (playing) saveBookmark(pos); return; }
      // Back on screen: the OS may have killed speech while hidden (iOS on lock).
      // Re-acquire the wake lock and, if we should be talking but aren't, resume
      // the current block so we pick up exactly where we left off.
      if (playing && !paused) {
        requestWake();
        if (!sp.speaking && !sp.pending) playIndex(pos, true);
      }
    });

    // ---- Double-click / double-tap a word → start reading from there ----
    function unitIndexForNode(node) {
      var elx = node && node.nodeType === 3 ? node.parentElement : node;
      while (elx) {
        for (var i = 0; i < playlist.length; i++) { if (playlist[i].el === elx) return i; }
        elx = elx.parentElement;
      }
      return -1;
    }
    // Text from the double-click selection to the end of the block (leaf blocks only),
    // so a long paragraph starts at the exact word rather than from its top.
    function wordLevelText(unitEl) {
      try {
        var sel = window.getSelection();
        if (!sel || !sel.rangeCount) return null;
        var r = sel.getRangeAt(0);
        if (!unitEl.contains(r.startContainer)) return null;
        var before = document.createRange();
        before.setStart(unitEl, 0);
        before.setEnd(r.startContainer, r.startOffset);
        var full = unitEl.innerText || unitEl.textContent || '';
        var from = full.slice(before.toString().length).replace(/\s+/g, ' ').trim();
        return from.length > 1 ? from : null;
      } catch (e) { return null; }
    }
    // In TEACH mode the playlist anchors are section HEADERS, so map a tapped node to the
    // teach entry for its enclosing section (walk to the header, then to the section body's
    // preceding header). Lets you double-tap a section to send the teacher there.
    function teachIndexForNode(node) {
      var el = node && node.nodeType === 3 ? node.parentElement : node;
      if (!el || !el.closest) return -1;
      var header = el.closest('.collapsible-header, .ch');
      if (!header) { var cc = el.closest('.collapsible-content, .cc'); if (cc) header = cc.previousElementSibling; }
      if (!header) return -1;
      for (var i = 0; i < playlist.length; i++) { if (playlist[i].el === header) return i; }
      return -1;
    }
    // Deck: map a tapped node to the teach entry for its enclosing .slide/.sect (its
    // heading is the playlist anchor), so a double-tap sends the teacher to that slide.
    function deckTeachIndexForNode(node) {
      var el = node && node.nodeType === 3 ? node.parentElement : node;
      if (!el || !el.closest) return -1;
      var card = el.closest('.slide, .sect');
      var header = card ? card.querySelector('h2, h3, h4') : null;
      if (!header) return -1;
      for (var i = 0; i < playlist.length; i++) { if (playlist[i].el === header) return i; }
      return -1;
    }
    function startFromNode(node, allowWordLevel) {
      // Deck = Teach-only: a double-tap starts (or repositions) the teacher at the tapped slide.
      if (isDeck) {
        if (!playing) { playlist = buildTeachPlaylist(); if (!playlist.length) return; }
        var di = deckTeachIndexForNode(node); if (di < 0) di = 0;
        try { window.getSelection().removeAllRanges(); } catch (e) {}
        if (!playing) {
          playing = true; paused = false; mode = 'teach'; lastRevealEl = null;
          showBar(true); requestWake();
          ensureVoices(function () { if (playing) playIndex(di, true); });
        } else { jump(di); }
        return;
      }
      // While teaching, a double-tap repositions the TEACHER to the tapped section
      // (rather than switching into verbatim read).
      if (playing && mode === 'teach') {
        var ti = teachIndexForNode(node);
        if (ti >= 0) { try { window.getSelection().removeAllRanges(); } catch (e) {} jump(ti); }
        return;
      }
      if (!playing) { mode = 'read'; playlist = buildPlaylist(); }   // double-tap (when not playing) starts the verbatim read from here
      if (!playlist.length) return;
      var idx = unitIndexForNode(node);
      if (idx < 0) return;                            // click wasn't on readable content
      startOverride = null;
      if (allowWordLevel && playlist[idx].el && playlist[idx].el.tagName !== 'TR') {
        var wt = wordLevelText(playlist[idx].el);
        if (wt) startOverride = { index: idx, text: wt };
      }
      try { window.getSelection().removeAllRanges(); } catch (e) {}
      if (!playing) {
        playing = true; paused = false;
        showBar(true); requestWake();
        ensureVoices(function () { if (playing) playIndex(idx, true); });
      } else {
        jump(idx);
      }
    }
    document.addEventListener('dblclick', function (e) {
      var t = e.target;
      if (!t || !t.closest || t.closest('#rtBar,#rtFab')) return;
      startFromNode(t, true);
    });
    // Touch double-tap fallback (block-level — no reliable selection on tap).
    var lastTap = 0, lastX = 0, lastY = 0;
    document.addEventListener('touchend', function (e) {
      if (!e.changedTouches || e.changedTouches.length !== 1) return;
      var tch = e.changedTouches[0], now = (new Date()).getTime();
      var quick = (now - lastTap) < 350, near = Math.abs(tch.clientX - lastX) < 28 && Math.abs(tch.clientY - lastY) < 28;
      lastTap = now; lastX = tch.clientX; lastY = tch.clientY;
      if (quick && near) {
        var hit = document.elementFromPoint(tch.clientX, tch.clientY);
        if (hit && hit.closest && !hit.closest('#rtBar,#rtFab')) { startFromNode(hit, false); lastTap = 0; }
      }
    }, { passive: true });

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
    // "Course Scope & Module Map −" doesn't read "…Map minus".
    var TOGGLE = '[\\s\\u00a0+\\-\\u2212\\u2013\\u2014\\u25be\\u25b8\\u25bc\\u25b6\\u25bd\\u25b2\\u25b4\\u203a\\u00bb\\u2039\\u00ab]';
    function blockText(el) {
      var t = textOf(el);
      return t.replace(new RegExp('^' + TOGGLE + '+'), '').replace(new RegExp(TOGGLE + '+$'), '').trim();
    }

    // ---- collect readable units from ONE tab's panel, in natural document order ----
    // Returns [{el, text}] so each unit has an element to highlight/scroll and the
    // exact text to speak. Walks the DOM generically so NOTHING with text is skipped;
    // tables are expanded row-by-row (each row paired with its header labels) so a
    // matrix reads as flowing sentences and highlights row-by-row. Collapsed sections
    // are still collected (textOf falls back to textContent when innerText is empty
    // for a hidden node); playback expands them cosmetically when it reaches them.
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

    // ---- build the WHOLE-reader playlist across every tab ----
    // tab.click() switches tabs synchronously and the browser doesn't repaint
    // mid-loop, so clicking through all tabs to collect them causes no flicker; we
    // restore the originally-active tab at the end. Guarded by autoSwitch so the
    // tab-click stop-listener ignores these programmatic switches.
    function buildPlaylist() {
      var active = document.querySelector('.tab-btn.active') || tabs[0];
      var list = [];
      autoSwitch = true;
      tabs.forEach(function (t) {
        try { t.click(); } catch (e) {}
        var label = (t.textContent || '').replace(/\s+/g, ' ').trim();
        collect().forEach(function (u) { list.push({ el: u.el, text: u.text, tab: t, tabLabel: label }); });
      });
      try { active.click(); } catch (e) {}
      autoSwitch = false;
      return list;
    }

    // ---- build the TEACH playlist for the current tab ----
    // Each authored {at, say} becomes: an anchor element (a section header matched by
    // `at`) + one playlist entry per sentence of `say`, all sharing that anchor. So a
    // teacher explains a section while the reader scrolls to + expands it. Current tab
    // only (a teacher teaches what you're looking at), unlike the whole-reader podcast.
    function splitSentences(t) {
      return String(t).replace(/\s+/g, ' ').trim().match(/[^.!?]+[.!?]+["')\]]*|\S[^.!?]*$/g) || [String(t)];
    }
    // Group sentences into ~flowing chunks so the engine carries intonation across a
    // couple of sentences (natural, unhurried) instead of hard-stopping after each one
    // (the "stiff/reciting" cadence). Capped so an utterance stays well under iOS
    // Safari's long-utterance cut-off. One anchor still spans the whole section.
    function chunkSay(t) {
      var sents = splitSentences(t), out = [], buf = '';
      for (var i = 0; i < sents.length; i++) {
        var s = sents[i].trim(); if (!s) continue;
        if (!buf) buf = s;
        else if (buf.length + 1 + s.length <= 260) buf += ' ' + s;
        else { out.push(buf); buf = s; }
      }
      if (buf) out.push(buf);
      return out;
    }
    // Whole-reader teacher walkthrough: every tab's authored sections, in tab order,
    // flowing tab to tab (playback auto-switches tabs via focusTab). Synchronous tab
    // clicks = no flicker; restore the originally-active tab (same trick as buildPlaylist).
    // Deck teach: DECK_TEACH[FILE] is a flat [{at, say}] in slide order. Anchor each to a
    // heading (.sect h2 / .slide h3) in #rdrWrap, chunk the narration into flowing
    // multi-sentence utterances, and return one flat tab-less playlist. The shared player
    // scrolls to + highlights each anchor exactly as it does a reader section.
    function buildDeckTeachPlaylist() {
      var root = deckRoot || document.body;
      var headers = [].slice.call(root.querySelectorAll('h1,h2,h3,h4'));
      var list = [];
      deckTeach.forEach(function (it) {
        var anchor = null;
        if (it.at) {
          var needle = String(it.at).toLowerCase();
          for (var i = 0; i < headers.length; i++) {
            if ((headers[i].textContent || '').toLowerCase().indexOf(needle) >= 0) { anchor = headers[i]; break; }
          }
        }
        if (!anchor) anchor = root;
        chunkSay(it.say).forEach(function (s) { list.push({ el: anchor, text: s, tab: null, tabLabel: '' }); });
      });
      return list;
    }

    function buildTeachPlaylist() {
      if (isDeck) return buildDeckTeachPlaylist();
      var m = teachMap(); if (!m) return [];
      var active = document.querySelector('.tab-btn.active') || tabs[0];
      var list = [];
      autoSwitch = true;
      tabs.forEach(function (tabBtn) {
        var id = tabBtn.getAttribute('data-tab') || '';
        var items = m[id];
        if (!items || !items.length) return;
        try { tabBtn.click(); } catch (e) {}
        var label = (tabBtn.textContent || '').replace(/\s+/g, ' ').trim();
        var panels = [].slice.call(document.querySelectorAll('.active')).filter(function (n) {
          return !n.matches('.tab-btn,.collapsible-header,.collapsible-content,.ch,.cc');
        });
        var root = null, max = -1;
        panels.forEach(function (p) { var l = (p.textContent || '').length; if (l > max) { max = l; root = p; } });
        var headers = root ? [].slice.call(root.querySelectorAll('.collapsible-header,.ch,h1,h2,h3,h4')) : [];
        items.forEach(function (it) {
          var anchor = null;
          if (it.at) {
            var needle = String(it.at).toLowerCase();
            for (var i = 0; i < headers.length; i++) {
              if ((headers[i].textContent || '').toLowerCase().indexOf(needle) >= 0) { anchor = headers[i]; break; }
            }
          }
          if (!anchor) anchor = root;
          chunkSay(it.say).forEach(function (s) { list.push({ el: anchor, text: s, tab: tabBtn, tabLabel: label }); });
        });
      });
      try { active.click(); } catch (e) {}
      autoSwitch = false;
      return list;
    }

    function start(m) {
      mode = (m === 'teach') ? 'teach' : 'read';
      playlist = (mode === 'teach') ? buildTeachPlaylist() : buildPlaylist();
      if (!playlist.length) { mode = 'read'; return; }
      playing = true; paused = false; lastRevealEl = null;
      showBar(true); requestWake();
      var startAt = 0;
      var bm = loadBookmark();
      // Resume only if the reader hasn't changed shape since the bookmark (same block
      // count) and the block text still matches — otherwise fall back to the top.
      if (bm && bm.pos > 0 && bm.pos < playlist.length && bm.n === playlist.length) {
        if (!bm.txt || (playlist[bm.pos].text || '').slice(0, 40) === bm.txt) startAt = bm.pos;
      } else if (mode === 'teach') {
        // No resume → start the walkthrough at the tab you're currently on (so it plays
        // from here to the end); from the first tab that's the whole reader start-to-finish.
        var curBtn = document.querySelector('.tab-btn.active');
        for (var i = 0; i < playlist.length; i++) { if (playlist[i].tab === curBtn) { startAt = i; break; } }
      }
      ensureVoices(function () { if (playing) playIndex(startAt, true); });   // wait for the voice list before the 1st utterance
    }

    // Switch to the tab that owns this block, if it isn't already active.
    function focusTab(unit) {
      if (!unit.tab) return;
      var cur = document.querySelector('.tab-btn.active');
      if (cur === unit.tab) return;
      autoSwitch = true;
      try { unit.tab.click(); } catch (e) {}
      autoSwitch = false;
    }

    // viaCancel: cancel the queue first (start / skip / resume). On natural advance
    // (from onend) we DON'T cancel — that avoids the gap/clip between blocks, so it
    // flows continuously instead of stuttering.
    function playIndex(i, viaCancel) {
      gen++; var myGen = gen;
      if (i < 0) i = 0;
      pos = i;
      if (i >= playlist.length) { finish(); return; }
      var unit = playlist[i];
      focusTab(unit);
      reveal(unit.el);
      var txt = unit.text;
      if (startOverride && startOverride.index === i) { txt = startOverride.text; startOverride = null; }  // one-shot: start mid-block from a double-clicked word
      if (!txt) { playIndex(i + 1, viaCancel); return; }
      saveBookmark(i);
      var u = new SpeechSynthesisUtterance(sentence(txt));
      u.rate = RATE_BASE * rate;
      var v = pickVoice(); if (v) { u.voice = v; u.lang = v.lang; }
      // Pause a beat between blocks (a human breath) instead of running them together.
      u.onend = function () { if (myGen === gen && playing && !paused) setTimeout(function () { if (myGen === gen && playing && !paused) playIndex(pos + 1, false); }, gapMs()); };
      // Defer on error too (small delay) so a genuinely-erroring voice can't hammer,
      // and — with a whole-reader playlist now hundreds of blocks long — a fast error
      // chain can't recurse synchronously deep enough to blow the stack. gen-guarded.
      u.onerror = function () { if (myGen === gen && playing && !paused) setTimeout(function () { if (myGen === gen && playing && !paused) playIndex(pos + 1, false); }, 60); };
      if (viaCancel) sp.cancel();
      sp.speak(u);
      updateBar();
    }

    function jump(i) { if (!playing) return; paused = false; syncToggle(); playIndex(i, true); }

    function togglePause() {
      if (!playing) return;
      if (paused) { paused = false; requestWake(); try { sp.resume(); } catch (e) {} playIndex(pos, true); }  // resume by re-speaking current block (robust on iOS)
      else { paused = true; saveBookmark(pos); releaseWake(); gen++; try { sp.cancel(); } catch (e) {} }
      syncToggle();
    }

    function finish() { clearBookmark(); teardown(); }   // reached the end — start fresh next time

    function stop() { if (playing) saveBookmark(pos); teardown(); }   // keep the bookmark so 🎧 Resume works

    function teardown() {
      playing = false; paused = false; gen++; lastRevealEl = null;
      try { sp.cancel(); } catch (e) {}
      releaseWake();
      clearHi();
      closeToc();
      syncToggle();
      showBar(false);
    }

    function reveal(node) {
      if (node.offsetParent === null && node.closest) {           // block is inside a collapsed section — expand it
        var cc = node.closest('.collapsible-content,.cc');
        if (cc) { var h = cc.previousElementSibling; if (h && /collapsible-header|ch/.test(h.className || '')) { try { h.click(); } catch (e) {} } }
      }
      // Teach anchors a section HEADER — expand its body if collapsed so the content is
      // on screen while the teacher talks (class-based collapse: FP512 '.collapsed',
      // FP511 '.closed'; a header click toggles, so only click when actually collapsed).
      if (node.matches && node.matches('.collapsible-header,.ch')) {
        var body = node.nextElementSibling;
        if (body && (body.offsetParent === null || /(^|\s)(collapsed|closed)(\s|$)/.test(body.className || ''))) { try { node.click(); } catch (e) {} }
      }
      if (node === lastRevealEl) return;                          // teach re-uses one anchor per section — don't re-scroll on every sentence
      lastRevealEl = node;
      clearHi();
      node.classList.add('rt-hi');
      try { node.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) { try { node.scrollIntoView(); } catch (e2) {} }
    }
    function clearHi() { [].slice.call(document.querySelectorAll('.rt-hi')).forEach(function (n) { n.classList.remove('rt-hi'); }); }

    function updateBar() {
      if (!playlist.length) { posEl.textContent = ''; return; }
      var lbl = playlist[pos] && playlist[pos].tabLabel ? playlist[pos].tabLabel + ' · ' : '';
      posEl.textContent = lbl + '¶ ' + (pos + 1) + '/' + playlist.length;
    }
    function syncToggle() { toggleBtn.textContent = paused ? '▶' : '⏸'; toggleBtn.title = paused ? 'Resume' : 'Pause'; }

    function injectStyles() {
      var css =
        '#rtFab{position:fixed;right:max(14px,env(safe-area-inset-right));bottom:calc(74px + env(safe-area-inset-bottom));z-index:9000;height:50px;padding:0 16px;border:none;border-radius:25px;background:linear-gradient(135deg,#2f8f6b,#3cae86);color:#fff;font:600 14px system-ui,-apple-system,sans-serif;display:inline-flex;align-items:center;gap:7px;cursor:pointer;box-shadow:0 6px 18px -4px rgba(20,60,44,.55)}' +
        '#rtFab.playing{background:linear-gradient(135deg,#c0453d,#dc6b3a)}' +
        // 👩‍🏫 Teach FAB — stacked above the Podcast FAB, purple so the two are distinct.
        '#rtTeachFab{position:fixed;right:max(14px,env(safe-area-inset-right));bottom:calc(134px + env(safe-area-inset-bottom));z-index:9000;height:50px;padding:0 16px;border:none;border-radius:25px;background:linear-gradient(135deg,#6d5ae0,#8a6ff0);color:#fff;font:600 14px system-ui,-apple-system,sans-serif;display:inline-flex;align-items:center;gap:7px;cursor:pointer;box-shadow:0 6px 18px -4px rgba(50,40,110,.5)}' +
        'body.rt-on #rtTeachFab{display:none!important}' +
        // On a deck there is no Podcast FAB below it, so drop the Teach FAB to the base slot.
        'body.rt-deck #rtTeachFab{bottom:calc(74px + env(safe-area-inset-bottom))}' +
        // Docked player bar across the bottom — a single strip so the controls never
        // pile onto the corner buttons. While it's up, the 🎙️ + 🔍 FABs hide and the
        // Home/Theme/Back pills lift above it (body.rt-on rules below).
        '#rtBar{position:fixed;left:0;right:0;bottom:0;z-index:9002;display:none;align-items:center;justify-content:center;gap:6px;padding:9px 12px calc(9px + env(safe-area-inset-bottom));background:rgba(255,253,248,.97);border-top:1px solid #e2d8c6;box-shadow:0 -8px 26px -12px rgba(0,0,0,.35);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px)}' +
        '#rtBar.on{display:flex}' +
        '#rtBar button{flex:0 0 auto;border:none;background:#f1ece3;color:#3a2e25;width:42px;height:42px;border-radius:50%;font-size:15px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center}' +
        '#rtBar button:hover{background:#e7ddcd}' +
        '#rtBar button:active{transform:scale(.92)}' +
        '#rtBar button.rt-speed{width:auto;min-width:48px;border-radius:21px;padding:0 12px;font:700 13px system-ui,-apple-system,sans-serif;font-variant-numeric:tabular-nums}' +
        '#rtBar .rt-pos{font:600 12.5px system-ui,-apple-system,sans-serif;color:#7a6f5f;padding:0 4px 0 8px;white-space:nowrap;max-width:44vw;overflow:hidden;text-overflow:ellipsis;text-align:right}' +
        'body.rt-on #rtFab{display:none}' +
        'body.rt-on #rsFab{display:none!important}' +
        // While the docked bar is up, hide the Home/Theme/Back pills too (they'd cover
        // content just above the bar). The bar has Stop; navigation returns after stopping.
        'body.rt-on #fpslHome,body.rt-on #rdrTheme,body.rt-on #rdrBack{opacity:0;transform:translateY(30px);pointer-events:none}' +
        // Decks carry their own inline chrome (Home/Back/Theme) — hide it too while the bar is up.
        'body.rt-on #dkHome,body.rt-on #dkBack,body.rt-on #tgl{opacity:0;transform:translateY(30px);pointer-events:none;transition:opacity .2s ease,transform .2s ease}' +
        '.rt-hi{background:#ffe9b8 !important;border-radius:3px;box-shadow:0 0 0 3px #ffe9b8;scroll-margin-top:80px;scroll-margin-bottom:96px}' +
        // Contents overlay — a bottom sheet sitting above the docked bar.
        '#rtToc{position:fixed;inset:0;z-index:9003;display:none;background:rgba(20,16,12,.5);align-items:flex-end;justify-content:center}' +
        '#rtToc.on{display:flex}' +
        '.rt-toc-panel{background:#fffdf8;color:#2a2018;width:100%;max-width:640px;max-height:70vh;display:flex;flex-direction:column;border-radius:16px 16px 0 0;box-shadow:0 -18px 50px -18px rgba(0,0,0,.5);margin-bottom:calc(64px + env(safe-area-inset-bottom))}' +
        '.rt-toc-head{display:flex;align-items:center;justify-content:space-between;padding:13px 16px;border-bottom:1px solid #eadfce;font-size:16px}' +
        '.rt-toc-close{border:none;background:#f1ece3;color:#6b6256;width:30px;height:30px;border-radius:8px;font-size:15px;cursor:pointer}' +
        '.rt-toc-list{overflow:auto;padding:6px 8px 12px;-webkit-overflow-scrolling:touch}' +
        '.rt-toc-tab{font:700 12px system-ui,-apple-system,sans-serif;text-transform:uppercase;letter-spacing:.04em;color:#b0541f;padding:12px 10px 4px}' +
        '.rt-toc-sec{display:flex;align-items:center;gap:8px;width:100%;text-align:left;border:none;background:none;color:#2a2018;border-radius:10px;padding:11px 12px;font:15px/1.35 system-ui,-apple-system,sans-serif;cursor:pointer}' +
        '.rt-toc-sec:hover{background:#f6efe4}' +
        '.rt-toc-sec.rt-toc-cur{background:#ffe9b8;font-weight:700}' +
        '.rt-toc-now{margin-left:auto;font:700 11px system-ui;color:#b0541f;white-space:nowrap}' +
        'html[data-theme="dark"] #rtBar{background:rgba(23,18,14,.97);border-color:#3a2e25}' +
        'html[data-theme="dark"] #rtBar button{background:#2f251d;color:#e8dccb}' +
        'html[data-theme="dark"] #rtBar button:hover{background:#3a2e25}' +
        'html[data-theme="dark"] #rtBar .rt-pos{color:#b7a996}' +
        'html[data-theme="dark"] .rt-toc-panel{background:#241c16;color:#ece3d9}' +
        'html[data-theme="dark"] .rt-toc-head{border-color:#3a2e25}' +
        'html[data-theme="dark"] .rt-toc-close{background:#2f251d;color:#cdbfb0}' +
        'html[data-theme="dark"] .rt-toc-sec{color:#ece3d9}' +
        'html[data-theme="dark"] .rt-toc-sec:hover{background:#2f251d}' +
        'html[data-theme="dark"] .rt-toc-sec.rt-toc-cur{background:#5a4a20;color:#fff}';
      var s = document.createElement('style'); s.id = 'rtCSS'; s.textContent = css; document.head.appendChild(s);
    }
    function el(tag, id) { var e = document.createElement(tag); if (id) e.id = id; return e; }

    syncToggle();
    reflectFab();          // set the FAB label (Resume vs Podcast) on load
  });
})();

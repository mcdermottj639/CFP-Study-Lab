/* Shared Interactive-Reader search — fully offline, reader-agnostic.
 * Adds a floating 🔍 button that opens a search panel. It indexes EVERY tab and
 * collapsible section (incl. ones currently hidden — native find-in-page can't),
 * shows a results list with section context + snippet, and on tap switches to the
 * right tab, expands that section, scrolls to it, and highlights the match.
 *
 * Works on any reader that uses `.tab-btn[data-tab]` tabs + collapsible sections
 * (`.collapsible-header`/`.collapsible-content` or `.ch`/`.cc`). Injected after
 * reader-theme.js so its UI lives on <body> (outside the dark-mode filter wrapper).
 * Run via scripts/inject_reader_theme.mjs; precached in sw.js for offline. */
(function () {
  'use strict';
  if (window.__readerSearch) return; window.__readerSearch = true;

  function ready(fn) {
    if (document.readyState === 'complete') fn();
    else window.addEventListener('load', fn);
  }

  ready(function () {
    var tabs = [].slice.call(document.querySelectorAll('.tab-btn'));
    if (!tabs.length) return;                 // not a tabbed reader — skip

    injectStyles();
    var fab = el('button', 'rsFab', '🔍'); fab.title = 'Search this reader';
    document.body.appendChild(fab);
    var modal = buildModal();
    document.body.appendChild(modal);
    var input = modal.querySelector('#rsInput');
    var results = modal.querySelector('#rsResults');
    var count = modal.querySelector('#rsCount');

    var index = null, debounce;

    fab.onclick = open;
    modal.addEventListener('click', function (e) { if (e.target === modal) close(); });
    modal.querySelector('#rsClose').onclick = close;
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && modal.classList.contains('on')) close(); });
    input.addEventListener('input', function () { clearTimeout(debounce); debounce = setTimeout(run, 140); });

    function open() { modal.classList.add('on'); setTimeout(function () { input.focus(); }, 50); }
    function close() { modal.classList.remove('on'); }

    // ---- index (lazy, on first search; synchronous tab-probe = no flicker) ----
    function buildIndex() {
      if (index) return index;
      index = [];
      var headers = [].slice.call(document.querySelectorAll('.collapsible-header, .ch'));
      var cards = [].slice.call(document.querySelectorAll('.section-card, .card')).filter(function (c) {
        return !c.querySelector('.collapsible-header, .ch');     // non-collapsible cards
      });
      var units = headers.map(function (h) { return { probe: h, header: h, content: h.nextElementSibling }; })
        .concat(cards.map(function (c) { var h = c.querySelector('h1,h2,h3,h4'); return { probe: c, header: h, content: c }; }));
      var unitTab = new Map();
      var active = document.querySelector('.tab-btn.active') || tabs[0];
      // Probe each tab synchronously: both readers mark the live panel with `.active`,
      // so assign each unit to the tab whose active panel contains it (robust to how
      // inactive panels are hidden — display:none, opacity, etc.).
      tabs.forEach(function (t) {
        try { t.click(); } catch (e) {}
        var panels = [].slice.call(document.querySelectorAll('.active')).filter(function (el) {
          return !el.matches('.tab-btn,.collapsible-header,.collapsible-content,.ch,.cc');
        });
        units.forEach(function (u) {
          if (unitTab.has(u.probe) || !u.probe) return;
          for (var i = 0; i < panels.length; i++) { if (panels[i].contains(u.probe)) { unitTab.set(u.probe, t); break; } }
        });
      });
      try { active.click(); } catch (e) {}     // restore — all synchronous, browser never repaints mid-loop
      units.forEach(function (u) {
        if (!u.content) return;
        var tab = unitTab.get(u.probe) || active;
        var title = (u.header ? (u.header.innerText || u.header.textContent) : (tab.textContent || '')).replace(/[−+]\s*$/, '').trim();
        var body = (u.content.textContent || '').replace(/\s+/g, ' ').trim();
        index.push({ tab: tab, tabLabel: (tab.textContent || '').trim(), header: u.header, content: u.content,
          title: title, hay: (title + '  ' + body).toLowerCase(), body: body });
      });
      return index;
    }

    function run() {
      var q = input.value.trim().toLowerCase();
      results.innerHTML = ''; count.textContent = '';
      if (q.length < 2) return;
      var idx = buildIndex();
      var hits = [];
      for (var i = 0; i < idx.length; i++) {
        var e = idx[i], pos = e.hay.indexOf(q);
        if (pos < 0) continue;
        var titleHit = e.title.toLowerCase().indexOf(q) >= 0;
        hits.push({ e: e, score: (titleHit ? 0 : 1), pos: pos });
        if (hits.length > 60) break;
      }
      hits.sort(function (a, b) { return a.score - b.score; });
      count.textContent = hits.length ? (hits.length + (hits.length === 60 ? '+ matches' : ' match' + (hits.length > 1 ? 'es' : ''))) : 'No matches';
      hits.slice(0, 40).forEach(function (h) {
        var e = h.e;
        var item = el('button', null, '');
        item.className = 'rs-item';
        item.innerHTML = '<div class="rs-loc">' + esc(e.tabLabel) + ' › ' + esc(e.title || '(section)') + '</div>' +
          '<div class="rs-snip">' + snippet(e.body, q) + '</div>';
        item.onclick = function () { jumpTo(e, q); close(); };
        results.appendChild(item);
      });
    }

    function jumpTo(e, q) {
      clearHighlights();
      try { e.tab.click(); } catch (err) {}
      // expand the section if its content is collapsed/hidden
      if (e.header && e.content && e.content.offsetParent === null) { try { e.header.click(); } catch (err) {} }
      setTimeout(function () {
        var n = highlight(e.content, q);
        if (e.header) highlight(e.header, q);
        var target = e.header || e.content;
        try { target.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (err) { target.scrollIntoView(); }
      }, 60);
    }

    // ---- highlight helpers ----
    function clearHighlights() {
      [].slice.call(document.querySelectorAll('mark.rs-hi')).forEach(function (m) {
        var p = m.parentNode; p.replaceChild(document.createTextNode(m.textContent), m); p.normalize();
      });
    }
    function highlight(root, q) {
      if (!root || !q) return 0;
      var rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode: function (n) {
          if (!n.nodeValue || !rx.test(n.nodeValue)) return NodeFilter.FILTER_REJECT;
          if (n.parentNode && /^(SCRIPT|STYLE|MARK)$/.test(n.parentNode.tagName)) return NodeFilter.FILTER_REJECT;
          rx.lastIndex = 0; return NodeFilter.FILTER_ACCEPT;
        }
      });
      var nodes = [], n; while ((n = walker.nextNode())) nodes.push(n);
      var hits = 0;
      nodes.forEach(function (node) {
        var frag = document.createDocumentFragment(), last = 0, s = node.nodeValue, m; rx.lastIndex = 0;
        while ((m = rx.exec(s))) {
          frag.appendChild(document.createTextNode(s.slice(last, m.index)));
          var mk = document.createElement('mark'); mk.className = 'rs-hi'; mk.textContent = m[0];
          frag.appendChild(mk); last = m.index + m[0].length; hits++;
          if (m.index === rx.lastIndex) rx.lastIndex++;
        }
        frag.appendChild(document.createTextNode(s.slice(last)));
        node.parentNode.replaceChild(frag, node);
      });
      return hits;
    }

    function snippet(text, q) {
      var i = text.toLowerCase().indexOf(q); if (i < 0) return esc(text.slice(0, 90));
      var start = Math.max(0, i - 38), end = Math.min(text.length, i + q.length + 60);
      return (start > 0 ? '… ' : '') + esc(text.slice(start, i)) + '<b>' + esc(text.slice(i, i + q.length)) + '</b>' +
        esc(text.slice(i + q.length, end)) + (end < text.length ? ' …' : '');
    }

    function buildModal() {
      var m = el('div', 'rsModal', '');
      m.innerHTML =
        '<div class="rs-panel">' +
          '<div class="rs-top"><input id="rsInput" type="search" placeholder="Search this reader…" autocomplete="off">' +
          '<span id="rsCount" class="rs-count"></span><button id="rsClose" class="rs-close" aria-label="Close">✕</button></div>' +
          '<div id="rsResults" class="rs-list"></div>' +
        '</div>';
      return m;
    }
    function injectStyles() {
      var css =
        '#rsFab{position:fixed;right:max(14px,env(safe-area-inset-right));bottom:max(14px,env(safe-area-inset-bottom));z-index:9000;width:50px;height:50px;border:none;border-radius:50%;background:linear-gradient(135deg,#dc6b3a,#e6a23c);color:#fff;font-size:21px;cursor:pointer;box-shadow:0 6px 18px -4px rgba(74,48,28,.55)}' +
        '#rsModal{position:fixed;inset:0;z-index:9001;background:rgba(20,16,12,.45);display:none;align-items:flex-start;justify-content:center;padding:6vh 14px 14px}' +
        '#rsModal.on{display:flex}' +
        '.rs-panel{background:#fff;color:#22282e;width:100%;max-width:640px;border-radius:16px;box-shadow:0 24px 60px -18px rgba(0,0,0,.5);overflow:hidden;display:flex;flex-direction:column;max-height:84vh}' +
        '.rs-top{display:flex;align-items:center;gap:8px;padding:12px 14px;border-bottom:1px solid #eee4d4}' +
        '#rsInput{flex:1;border:1px solid #e2d8c6;border-radius:10px;padding:11px 12px;font:16px system-ui,-apple-system,sans-serif;background:#fbf7f0;color:#22282e}' +
        '#rsInput:focus{outline:none;border-color:#dc6b3a}' +
        '.rs-count{font:600 12px system-ui;color:#9a8c78;white-space:nowrap}' +
        '.rs-close{border:none;background:#f1ece3;color:#6b6256;width:30px;height:30px;border-radius:8px;font-size:15px;cursor:pointer}' +
        '.rs-list{overflow:auto;padding:6px}' +
        '.rs-item{display:block;width:100%;text-align:left;border:none;background:none;border-radius:10px;padding:10px 12px;cursor:pointer}' +
        '.rs-item:hover{background:#faf3ea}' +
        '.rs-loc{font:700 12px system-ui;color:#b0541f;margin-bottom:2px}' +
        '.rs-snip{font:13px/1.45 system-ui;color:#444}' +
        '.rs-snip b{color:#1f2a33;background:#ffe9b8}' +
        'mark.rs-hi{background:#ffd86b;color:inherit;border-radius:2px;padding:0 1px}' +
        'html[data-theme="dark"] .rs-panel{background:#241c16;color:#ece3d9}' +
        'html[data-theme="dark"] #rsInput{background:#1c150f;color:#ece3d9;border-color:#3a2e25}' +
        'html[data-theme="dark"] .rs-top{border-color:#3a2e25}' +
        'html[data-theme="dark"] .rs-item:hover{background:#2f251d}' +
        'html[data-theme="dark"] .rs-snip{color:#cdbfb0}' +
        'html[data-theme="dark"] .rs-snip b{color:#fff;background:#5a4a20}' +
        'html[data-theme="dark"] .rs-close{background:#2f251d;color:#cdbfb0}';
      var s = document.createElement('style'); s.id = 'rsCSS'; s.textContent = css; document.head.appendChild(s);
    }

    function el(tag, id, txt) { var e = document.createElement(tag); if (id) e.id = id; if (txt) e.textContent = txt; return e; }
    function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  });
})();

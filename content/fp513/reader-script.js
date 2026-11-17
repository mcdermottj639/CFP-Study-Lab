(function () {
  'use strict';
  // FP513 reader: tabs, collapsibles, deep links (#valuation or #lo-4.1.2), LO bookmarks, LO jump list.
  var tabBtns = document.querySelectorAll('.tab-btn');
  var panels = document.querySelectorAll('.section-panel');
  var BKEY = 'fp513ReaderBookmarks';

  function activateTab(tabId) {
    var btn = document.querySelector('.tab-btn[data-tab="' + tabId + '"]'), panel = document.getElementById('tab-' + tabId);
    if (!btn || !panel) return false;
    tabBtns.forEach(function (b) { b.classList.remove('active'); });
    panels.forEach(function (p) { p.classList.remove('active'); });
    btn.classList.add('active'); panel.classList.add('active');
    try { btn.scrollIntoView({ block: 'nearest', inline: 'center' }); } catch (e) {}
    return true;
  }
  function openSection(el) {
    var c = el.querySelector('.collapsible-content'), i = el.querySelector('.toggle-icon');
    if (c && c.classList.contains('collapsed')) { c.classList.remove('collapsed'); if (i) i.textContent = '−'; }
  }
  function go(hash) {
    hash = (hash || '').replace(/^#/, '');
    if (!hash) return activateTab('overview');
    if (/^lo-\d\.\d\.\d$/.test(hash)) {
      var el = document.getElementById(hash); if (!el) return activateTab('overview');
      var panel = el.closest('.section-panel'); if (panel) activateTab(panel.id.replace(/^tab-/, ''));
      openSection(el); setTimeout(function () { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 60);
      return true;
    }
    return activateTab(hash) || activateTab('overview');
  }
  window.fp513ReaderGo = go;

  tabBtns.forEach(function (btn) { btn.addEventListener('click', function () { var t = this.getAttribute('data-tab'); activateTab(t); try { history.replaceState(null, '', '#' + t); } catch (e) {} }); });
  document.querySelectorAll('[data-toggle]').forEach(function (header) {
    header.addEventListener('click', function (ev) {
      if (ev.target.closest('.fp5-bm')) return;
      var content = this.nextElementSibling, icon = this.querySelector('.toggle-icon');
      if (content && icon) { var col = content.classList.toggle('collapsed'); icon.textContent = col ? '+' : '−'; }
    });
  });
  document.addEventListener('click', function (ev) {
    var a = ev.target.closest('a[data-go]'); if (!a) return;
    ev.preventDefault(); var h = a.getAttribute('data-go'); go(h); try { history.replaceState(null, '', '#' + h); } catch (e) {}
  });

  // ---- bookmarks (per device) ----
  function bms() { try { return JSON.parse(localStorage.getItem(BKEY) || '[]'); } catch (e) { return []; } }
  function setBms(a) { try { localStorage.setItem(BKEY, JSON.stringify(a)); } catch (e) {} renderBms(); }
  document.querySelectorAll('.section-card[id^="lo-"]').forEach(function (card) {
    var h = card.querySelector('.collapsible-header'); if (!h) return;
    var b = document.createElement('button'); b.type = 'button'; b.className = 'fp5-bm'; b.setAttribute('aria-label', 'Bookmark this objective');
    b.textContent = bms().indexOf(card.id) >= 0 ? '★' : '☆';
    b.addEventListener('click', function (ev) {
      ev.stopPropagation(); var a = bms(), i = a.indexOf(card.id);
      if (i >= 0) a.splice(i, 1); else a.push(card.id);
      b.textContent = i >= 0 ? '☆' : '★'; setBms(a);
    });
    h.insertBefore(b, h.querySelector('.toggle-icon'));
  });
  function renderBms() {
    var box = document.getElementById('fp5Bookmarks'); if (!box) return;
    var a = bms().filter(function (id) { return document.getElementById(id); });
    box.innerHTML = a.length ? a.map(function (id) { var h3 = document.querySelector('#' + id.replace(/\./g, '\\.') + ' h3'); return '<a href="#' + id + '" data-go="' + id + '" class="pill">' + (h3 ? h3.textContent : id) + '</a>'; }).join(' ') : '<span class="text-sm">Tap ☆ on any objective to save it here.</span>';
  }
  renderBms();

  var st = document.createElement('style');
  st.textContent = '.section-card{scroll-margin-top:130px}.fp5-bm{background:none;border:0;font-size:1.15rem;line-height:1;cursor:pointer;color:#b4572f;padding:0 .4rem;margin-left:auto}.collapsible-header{display:flex;align-items:center;gap:.3rem}' +
    '.fp5-lojump{display:grid;gap:.35rem}.fp5-lojump a{display:block;text-decoration:none;padding:.45rem .6rem;border-radius:8px;background:rgba(138,92,214,.07);color:inherit;font-size:.86rem}.fp5-lojump a b{color:#6d28d9;margin-right:.3rem}' +
    '.tab-nav{overflow-x:auto;-webkit-overflow-scrolling:touch;flex-wrap:nowrap}.tab-btn{white-space:nowrap;flex:0 0 auto}' +
    '.fp5-svg{width:100%;max-width:560px;height:auto;display:block;margin:.5rem auto}.fp5-svg text{font-family:inherit}' +
    'html[data-theme="dark"] .fp5-lojump a{background:rgba(160,120,230,.14)}html[data-theme="dark"] .fp5-svg .ink{stroke:#d8d2c6}html[data-theme="dark"] .fp5-svg .inkf{fill:#d8d2c6}';
  document.head.appendChild(st);

  document.addEventListener('DOMContentLoaded', function () { go(location.hash); });
  if (document.readyState !== 'loading') go(location.hash);
  window.addEventListener('hashchange', function () { go(location.hash); });
})();

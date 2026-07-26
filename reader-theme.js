/* Interactive Reader theming: wraps content so dark mode can filter it without
 * breaking the fixed buttons, adds a theme toggle, and syncs dark mode with the
 * main app via the shared localStorage key 'cfpTheme'. */
(function () {
  function set(t) {
    if (t === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
    else document.documentElement.removeAttribute('data-theme');
  }
  try { set(localStorage.getItem('cfpTheme')); } catch (e) {}

  function init() {
    if (document.getElementById('rdrWrap') || !document.body) return;
    var b = document.body;
    var wrap = document.createElement('div');
    wrap.id = 'rdrWrap';
    // Move content into the wrapper, but leave injected buttons + scripts on body
    var kids = [];
    for (var i = 0; i < b.childNodes.length; i++) kids.push(b.childNodes[i]);
    kids.forEach(function (n) {
      if (n.nodeType === 1 && (n.id === 'fpslHome' || n.tagName === 'SCRIPT')) return;
      wrap.appendChild(n);
    });
    b.insertBefore(wrap, b.firstChild);

    // Wide tables clip past the right edge in portrait (their container is
    // overflow:hidden). Wrap each in a horizontal-scroll box so phones can swipe
    // to see every column instead of having to rotate to landscape.
    var tables = wrap.querySelectorAll('table');
    for (var t = 0; t < tables.length; t++) {
      var tbl = tables[t], par = tbl.parentNode;
      if (par && par.classList && par.classList.contains('tbl-scroll')) continue;
      var sc = document.createElement('div');
      sc.className = 'tbl-scroll';
      par.insertBefore(sc, tbl);
      sc.appendChild(tbl);
    }

    // ---- Top toolbar (menu bar) ----------------------------------------
    // All reader chrome lives in ONE fixed bar at the top instead of pills/FABs that
    // float over the content (and used to pop back in as you scrolled). Left group =
    // Back / Home / Theme; right group = the Podcast / Teach / Search FABs, which the
    // reader-tts.js & reader-search.js scripts mount into window.__rdrChromeR.
    b.classList.add('rdr-topbar');
    var chrome = document.createElement('div');
    chrome.id = 'rdrChrome';
    var gL = document.createElement('div'); gL.className = 'rdr-cg rdr-cl';
    var gR = document.createElement('div'); gR.className = 'rdr-cg rdr-cr';
    chrome.appendChild(gL); chrome.appendChild(gR);
    b.appendChild(chrome);
    window.__rdrChromeL = gL;
    window.__rdrChromeR = gR;   // FAB scripts append their controls here

    // "Back" — ALWAYS shown so there's a one-tap path back into the modules area
    // (Home still → dashboard). If we arrived from a specific Module Hub, return to
    // that exact module; otherwise return to the Modules tab (the module map).
    try {
      var ret = sessionStorage.getItem('cfpReaderReturn');
      var back = document.createElement('a');
      back.id = 'rdrBack'; back.className = 'rdr-cbtn';
      if (ret && /^[A-Za-z0-9]+\/\d+$/.test(ret)) {
        back.href = '../index.html#m/' + ret;
        back.innerHTML = '<span>‹</span><span class="rdr-lbl">Module ' + ret.split('/')[1] + '</span>';
      } else {
        back.href = '../index.html#modules';
        back.innerHTML = '<span>‹</span><span class="rdr-lbl">Modules</span>';
      }
      gL.appendChild(back);
    } catch (e) {}

    // Home — move the injected Home link into the bar, stripping its floating styles.
    var home = document.getElementById('fpslHome');
    if (home) {
      home.removeAttribute('style');
      home.className = 'rdr-cbtn rdr-home';
      home.innerHTML = '<span>⌂</span><span class="rdr-lbl">Home</span>';
      gL.appendChild(home);
    }

    // Theme toggle.
    var btn = document.createElement('button');
    btn.id = 'rdrTheme'; btn.type = 'button'; btn.className = 'rdr-cbtn';
    btn.innerHTML = '<span>🌙</span><span class="rdr-lbl">Theme</span>';
    btn.onclick = function () {
      var d = document.documentElement.getAttribute('data-theme') === 'dark';
      try { localStorage.setItem('cfpTheme', d ? 'light' : 'dark'); } catch (e) {}
      set(d ? 'light' : 'dark');
    };
    gL.appendChild(btn);

    // Measure the bar so the sticky tab-nav docks just below it and the initial
    // content clears it (CSS reads --rdrChromeH).
    function sizeBar() {
      var h = chrome.offsetHeight || 48;
      document.documentElement.style.setProperty('--rdrChromeH', h + 'px');
    }
    sizeBar();
    window.addEventListener('resize', sizeBar);
    window.addEventListener('load', sizeBar);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

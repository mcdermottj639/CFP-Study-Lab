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

    var btn = document.createElement('button');
    btn.id = 'rdrTheme';
    btn.type = 'button';
    btn.innerHTML = '🌙 Theme';
    btn.onclick = function () {
      var d = document.documentElement.getAttribute('data-theme') === 'dark';
      try { localStorage.setItem('cfpTheme', d ? 'light' : 'dark'); } catch (e) {}
      set(d ? 'light' : 'dark');
    };
    b.appendChild(btn);

    // "Back to module" — only when we arrived from a specific Module Hub. Returns
    // to that exact module (not the dashboard, which is what Home does).
    try {
      var ret = sessionStorage.getItem('cfpReaderReturn');
      if (ret && /^[A-Za-z0-9]+\/\d+$/.test(ret)) {
        var back = document.createElement('a');
        back.id = 'rdrBack';
        back.href = '../index.html#m/' + ret;
        back.innerHTML = '‹ Module ' + ret.split('/')[1];
        b.appendChild(back);
      }
    } catch (e) {}
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

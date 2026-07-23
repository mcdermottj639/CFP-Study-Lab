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

    // "Back" pill — ALWAYS shown so there's a one-tap path back into the modules
    // area (Home still → dashboard). If we arrived from a specific Module Hub, return
    // to that exact module; otherwise return to the Modules tab (the module map).
    try {
      var ret = sessionStorage.getItem('cfpReaderReturn');
      var back = document.createElement('a');
      back.id = 'rdrBack';
      if (ret && /^[A-Za-z0-9]+\/\d+$/.test(ret)) {
        back.href = '../index.html#m/' + ret;
        back.innerHTML = '‹ Module ' + ret.split('/')[1];
      } else {
        back.href = '../index.html#modules';
        back.innerHTML = '‹ Modules';
      }
      b.appendChild(back);
    } catch (e) {}

    // Auto-hide the floating chrome (Home / Theme / Back pills + the reader-tts &
    // search FABs) while the user scrolls, so they stop covering content. They slide
    // back on scroll-up or when scrolling stops, and are always shown near the top.
    // During audio playback the buttons are already handled by reader-tts (body.rt-on),
    // so this only matters while reading. CSS lives in reader-theme.css.
    (function () {
      var last = window.pageYOffset || 0, timer = null;
      function show() { document.body.classList.remove('rdr-hidechrome'); }
      function hide() { document.body.classList.add('rdr-hidechrome'); }
      window.addEventListener('scroll', function () {
        var y = window.pageYOffset || document.documentElement.scrollTop || 0;
        var dy = y - last; last = y;
        if (y < 140) show();                 // near the top of a tab — keep them visible
        else if (dy > 6) hide();             // scrolling down into content — get out of the way
        else if (dy < -6) show();            // scrolling back up — reveal
        clearTimeout(timer); timer = setTimeout(show, 900);   // reveal when scrolling stops
      }, { passive: true });
    })();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

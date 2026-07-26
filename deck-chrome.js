/* Shared chrome for the visual slide decks (apps/*-slides.html).
 * Builds ONE fixed top menu bar — Back / Home / Theme on the left, and (on Kaplan
 * decks) the 👩‍🏫 Teach control on the right, which reader-tts.js mounts into
 * window.__rdrChromeR. This replaces the pills that used to float at the bottom-left
 * over the slides. Self-contained: injects its own CSS. Must load BEFORE reader-tts.js
 * so window.__rdrChromeR exists when the Teach FAB is created. Mirrors the readers'
 * top bar (reader-theme.js / reader-theme.css). */
(function () {
  function init() {
    if (!document.body || document.getElementById('rdrChrome')) return;

    // ---- Bar styles (deck-scoped; readers get the same look from reader-theme.css) ----
    var css =
      ':root{--rdrChromeH:46px}' +
      '#rdrChrome{position:fixed;top:0;left:0;right:0;z-index:100000;display:flex;align-items:center;justify-content:space-between;gap:8px;' +
        'padding:6px max(10px,env(safe-area-inset-right)) 6px max(10px,env(safe-area-inset-left));padding-top:calc(6px + env(safe-area-inset-top));' +
        'background:rgba(255,253,248,.92);border-bottom:1px solid #e7dcc9;box-shadow:0 2px 14px -8px rgba(0,0,0,.4);' +
        '-webkit-backdrop-filter:saturate(1.4) blur(12px);backdrop-filter:saturate(1.4) blur(12px);' +
        'overflow-x:auto;overflow-y:hidden;transition:opacity .2s ease,transform .2s ease}' +
      '#rdrChrome::-webkit-scrollbar{display:none}' +
      '.rdr-cg{display:flex;align-items:center;gap:6px;flex:0 0 auto}' +
      '.rdr-cr{justify-content:flex-end}' +
      '#rdrChrome .rdr-cbtn,#rdrChrome #rtTeachFab{position:static!important;top:auto!important;right:auto!important;left:auto!important;bottom:auto!important;' +
        'height:33px!important;width:auto!important;min-width:0!important;padding:0 11px!important;border-radius:999px!important;border:none;' +
        'display:inline-flex;align-items:center;gap:5px;font:700 12px/1 system-ui,-apple-system,sans-serif;text-decoration:none;cursor:pointer;' +
        'white-space:nowrap;box-shadow:none!important;transform:none!important;opacity:1!important}' +
      '#rdrChrome .rdr-cbtn>span:first-child{font-size:15px;line-height:1}' +
      '#rdrChrome .rdr-home{background:#1f4d3a;color:#f4efe4;order:2}' +
      '#rdrChrome #dkBack{background:transparent;color:#1f4d3a;border:1.5px solid #1f4d3a;order:1}' +
      '#rdrChrome #tgl{background:#d0613a;color:#fff;order:3}' +
      '#rdrChrome #rtTeachFab{background:linear-gradient(135deg,#6d5ae0,#8a6ff0);color:#fff}' +
      'body.rdr-topbar #rdrWrap{padding-top:calc(var(--rdrChromeH) + 6px)}' +
      '#prog{top:0!important;z-index:100001!important}' +   // thin progress line rides the very top edge, above the bar
      'body.rt-on #rdrChrome{opacity:0;transform:translateY(-40px);pointer-events:none}' +
      'html[data-theme="dark"] #rdrChrome{background:rgba(23,18,14,.92);border-color:#3a2e25}' +
      'html[data-theme="dark"] #rdrChrome .rdr-home{background:#244d3a;color:#dff0e6}' +
      'html[data-theme="dark"] #rdrChrome #dkBack{color:#7fd3ac;border-color:#7fd3ac}' +
      '@media(max-width:430px){#rdrChrome #dkBack .rdr-lbl,#rdrChrome .rdr-home .rdr-lbl,#rdrChrome #tgl .rdr-lbl{display:none}' +
        '#rdrChrome #dkBack,#rdrChrome .rdr-home,#rdrChrome #tgl{width:33px!important;padding:0!important;justify-content:center}}';
    var st = document.createElement('style');
    st.textContent = css;
    document.head.appendChild(st);

    document.body.classList.add('rdr-topbar');
    var chrome = document.createElement('div');
    chrome.id = 'rdrChrome';
    var gL = document.createElement('div'); gL.className = 'rdr-cg rdr-cl';
    var gR = document.createElement('div'); gR.className = 'rdr-cg rdr-cr';
    chrome.appendChild(gL); chrome.appendChild(gR);
    document.body.appendChild(chrome);
    window.__rdrChromeL = gL;
    window.__rdrChromeR = gR;   // reader-tts.js mounts the Teach FAB here (Kaplan decks)

    // Back — exact module if we arrived from a Module Hub, else the module map.
    try {
      var ret = sessionStorage.getItem('cfpReaderReturn');
      var back = document.createElement('a');
      back.id = 'dkBack'; back.className = 'rdr-cbtn';
      if (ret && /^[A-Za-z0-9]+\/\d+$/.test(ret)) {
        back.href = '../index.html#m/' + ret;
        back.innerHTML = '<span>‹</span><span class="rdr-lbl">Module ' + ret.split('/')[1] + '</span>';
      } else {
        back.href = '../index.html#modules';
        back.innerHTML = '<span>‹</span><span class="rdr-lbl">Modules</span>';
      }
      gL.appendChild(back);
    } catch (e) {}

    // Home.
    var home = document.createElement('a');
    home.id = 'dkHome'; home.className = 'rdr-cbtn rdr-home';
    home.href = '../index.html';
    home.innerHTML = '<span>⌂</span><span class="rdr-lbl">Home</span>';
    gL.appendChild(home);

    // Theme — relocate the deck's existing #tgl button (keeps its click handler).
    var tgl = document.getElementById('tgl');
    if (tgl) {
      tgl.classList.add('rdr-cbtn');
      tgl.innerHTML = '<span>🌙</span><span class="rdr-lbl">Theme</span>';
      gL.appendChild(tgl);
    }

    function sizeBar() {
      document.documentElement.style.setProperty('--rdrChromeH', (chrome.offsetHeight || 46) + 'px');
    }
    sizeBar();
    window.addEventListener('resize', sizeBar);
    window.addEventListener('load', sizeBar);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

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
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

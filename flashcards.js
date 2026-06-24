/* Flashcard runner override — adds study options:
 *   • Term first / Definition first
 *   • Shuffle / In order
 *   • Auto-flip (hands-free review)
 * Choices persist in localStorage. Loads after the app's inline script and
 * replaces window.runFlash. Uses app globals: dueCards, filt, CARDS, shuffle,
 * gradeCard, go. */
(function () {
  if (typeof CARDS === 'undefined') return;

  var AUTO_MS = 3500;

  window.runFlash = function (mod) {
    var side = localStorage.getItem('cfpFlashSide') || 'term'; // term | def
    var order = localStorage.getItem('cfpFlashOrder') || 'shuffle'; // shuffle | inorder
    var auto = localStorage.getItem('cfpFlashAuto') === '1';
    var deck = [];
    var idx = 0;
    var timer = null;
    var area = document.getElementById('studyArea');

    function clearTimer() { if (timer) { clearTimeout(timer); timer = null; } }

    function buildDeck() {
      var mf = window.MODF;
      var modOk = function (c) {
        return !mf || mf === 'ALL' || typeof moduleOf !== 'function' || moduleOf(c) === +mf;
      };
      var d = dueCards().filter(function (x) { return (mod === 'ALL' || x.c.m === mod) && modOk(x.c); });
      if (!d.length) d = filt(CARDS, mod).map(function (c) { return { c: c, i: CARDS.indexOf(c) }; });
      deck = order === 'shuffle' ? shuffle(d) : d;
      idx = 0;
    }

    var faces = function (c) { return side === 'term' ? [c.f, c.b] : [c.b, c.f]; };

    window._fside = function (s) { side = s; localStorage.setItem('cfpFlashSide', s); draw(); };
    window._forder = function () {
      order = order === 'shuffle' ? 'inorder' : 'shuffle';
      localStorage.setItem('cfpFlashOrder', order);
      buildDeck(); draw();
    };
    window._fauto = function () {
      auto = !auto; localStorage.setItem('cfpFlashAuto', auto ? '1' : '0'); draw();
    };

    function controls() {
      return (
        '<div class="flashseg">' +
          '<button class="' + (side === 'term' ? 'on' : '') + '" onclick="window._fside(\'term\')">Term first</button>' +
          '<button class="' + (side === 'def' ? 'on' : '') + '" onclick="window._fside(\'def\')">Definition first</button>' +
        '</div>' +
        '<div class="flashopts">' +
          '<button class="' + (order === 'shuffle' ? 'on' : '') + '" onclick="window._forder()">🔀 ' + (order === 'shuffle' ? 'Shuffle' : 'In order') + '</button>' +
          '<button class="' + (auto ? 'on' : '') + '" onclick="window._fauto()">⏱ Auto-flip ' + (auto ? 'on' : 'off') + '</button>' +
        '</div>'
      );
    }

    function draw() {
      clearTimer();
      if (idx >= deck.length) {
        area.innerHTML =
          '<div class="card center"><h2>Deck complete 🎉</h2><p class="muted">' +
          deck.length + ' cards reviewed.</p><button class="btn" onclick="go(\'dash\')">Back to dashboard</button></div>';
        return;
      }
      var c = deck[idx].c;
      var front = faces(c)[0];
      area.innerHTML =
        '<div class="card"><div class="flex"><span class="small muted">Card ' +
        (idx + 1) + ' of ' + deck.length +
        '</span><span><span class="tag">' + c.m + '</span><span class="tag">' + c.t + '</span></span></div>' +
        controls() +
        '<div class="flash" id="flashface"><div>' + front +
        '<br><span class="small muted" style="margin-top:10px;display:inline-block">' + (auto ? '(auto-flip on)' : '(tap to flip)') + '</span></div></div>' +
        '<div id="flashctrl" class="center"></div></div>';
      document.getElementById('flashface').onclick = flip;
      if (auto) timer = setTimeout(flip, AUTO_MS);
    }

    function flip() {
      clearTimer();
      var c = deck[idx].c;
      var f = faces(c);
      document.getElementById('flashface').innerHTML =
        '<div><div class="muted small" style="margin-bottom:8px">' + f[0] + '</div>' + f[1] + '</div>';
      document.getElementById('flashctrl').innerHTML =
        '<div class="confbtns" style="margin-top:10px">' +
        '<button class="btn gray" onclick="window._fg(false)">Didn\'t know</button>' +
        '<button class="btn" onclick="window._fg(true)">Got it</button></div>';
      if (auto) timer = setTimeout(function () { idx++; draw(); }, AUTO_MS); // auto-advance (no grade)
    }

    window._fg = function (known) {
      clearTimer();
      gradeCard(deck[idx].i, known);
      idx++;
      draw();
    };

    buildDeck();
    draw();
  };
})();

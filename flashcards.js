/* Flashcard runner override — adds a "Term first / Definition first" toggle.
 * Loads after the app's inline script and replaces window.runFlash. Relies on
 * the app's globals: dueCards, filt, CARDS, shuffle, gradeCard, go. */
(function () {
  if (typeof CARDS === 'undefined') return; // app not present; do nothing

  window.runFlash = function (mod) {
    let deck = dueCards().filter((x) => mod === 'ALL' || x.c.m === mod);
    if (!deck.length) deck = filt(CARDS, mod).map((c) => ({ c, i: CARDS.indexOf(c) }));
    deck = shuffle(deck);
    let idx = 0;
    let side = localStorage.getItem('cfpFlashSide') || 'term'; // 'term' | 'def'
    const area = document.getElementById('studyArea');

    // returns [frontShown, backShown] based on the chosen starting side
    const faces = (c) => (side === 'term' ? [c.f, c.b] : [c.b, c.f]);

    window._fside = function (s) {
      side = s;
      localStorage.setItem('cfpFlashSide', s);
      draw();
    };

    function seg() {
      return (
        '<div class="flashseg">' +
        '<button class="' + (side === 'term' ? 'on' : '') + '" onclick="window._fside(\'term\')">Term first</button>' +
        '<button class="' + (side === 'def' ? 'on' : '') + '" onclick="window._fside(\'def\')">Definition first</button>' +
        '</div>'
      );
    }

    function draw() {
      if (idx >= deck.length) {
        area.innerHTML =
          '<div class="card center"><h2>Deck complete 🎉</h2><p class="muted">' +
          deck.length +
          ' cards reviewed.</p><button class="btn" onclick="go(\'dash\')">Back to dashboard</button></div>';
        return;
      }
      const { c } = deck[idx];
      const front = faces(c)[0];
      area.innerHTML =
        '<div class="card"><div class="flex"><span class="small muted">Card ' +
        (idx + 1) + ' of ' + deck.length +
        '</span><span><span class="tag">' + c.m + '</span><span class="tag">' + c.t + '</span></span></div>' +
        seg() +
        '<div class="flash" id="flashface">' + front +
        '<br><span class="small muted" style="margin-top:10px">(tap to flip)</span></div>' +
        '<div id="flashctrl" class="center"></div></div>';
      document.getElementById('flashface').onclick = flip;
    }

    function flip() {
      const { c } = deck[idx];
      const f = faces(c);
      document.getElementById('flashface').innerHTML =
        '<div><div class="muted small" style="margin-bottom:8px">' + f[0] + '</div>' + f[1] + '</div>';
      document.getElementById('flashctrl').innerHTML =
        '<div class="confbtns" style="margin-top:10px">' +
        '<button class="btn gray" onclick="window._fg(false)">Didn\'t know</button>' +
        '<button class="btn" onclick="window._fg(true)">Got it</button></div>';
    }

    window._fg = function (known) {
      const { i } = deck[idx];
      gradeCard(i, known);
      idx++;
      draw();
    };

    draw();
  };
})();

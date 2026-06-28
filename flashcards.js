/* Flashcard runner override — SM-2 study session.
 *   • Grading: Again / Hard / Good / Easy  (feeds the SM-2 engine in the app)
 *   • Keyboard: Space/Enter flip · 1-4 grade · f flag · these work while studying
 *   • Term first / Definition first · Shuffle / In order
 *   • Card filter (window.CARDFILTER): all | unseen | needwork | known (via cardStatus)
 *   • Flag/star a card; "Hard cards" mode (window._hardOnly) drills flagged/leech/low-ease
 *   • Auto-flip = hands-free PREVIEW (explicitly not graded)
 *   • Session position persists for the day so a reload resumes where you left off
 *   • Each graded card also logs a calibration attempt so flashcards show up in Analytics
 * Loads after the app's inline script and replaces window.runFlash. Uses app globals:
 * cardStatus, hardCards, filt, CARDS, shuffle, gradeCard, toggleFlag, go, S, save,
 * bumpMastery, plus window.MODF / window.CARDFILTER / moduleOf. */
(function () {
  if (typeof CARDS === 'undefined') return;

  var AUTO_MS = 3500;
  var SKEY = 'cfpFlashSession';
  var GRADES = [
    { g: 0, label: 'Again', key: '1', bg: '#d6453d' },
    { g: 1, label: 'Hard',  key: '2', bg: '#d98a1f' },
    { g: 2, label: 'Good',  key: '3', bg: '#1f9d6b' },
    { g: 3, label: 'Easy',  key: '4', bg: '#2f5fe0' }
  ];
  // grade -> {correct, conf} for the confidence-calibration analytics
  var CAL = { 0: { c: 0, conf: 1 }, 1: { c: 1, conf: 2 }, 2: { c: 1, conf: 3 }, 3: { c: 1, conf: 3 } };

  function ymdNow() { return new Date().toISOString().slice(0, 10); }

  window.runFlash = function (mod) {
    var hardOnly = !!window._hardOnly;
    window._hardOnly = false; // one-shot flag set by runHard()

    var side = localStorage.getItem('cfpFlashSide') || 'term'; // term | def
    var order = localStorage.getItem('cfpFlashOrder') || 'shuffle'; // shuffle | inorder
    var auto = localStorage.getItem('cfpFlashAuto') === '1';
    var deck = [];
    var idx = 0;
    var timer = null;
    var flipped = false;
    var area = document.getElementById('studyArea');

    function clearTimer() { if (timer) { clearTimeout(timer); timer = null; } }

    function modOk(c) {
      var mf = window.MODF;
      return !mf || mf === 'ALL' || typeof moduleOf !== 'function' || moduleOf(c) === +mf;
    }
    function inScope(x) { return (mod === 'ALL' || x.c.m === mod) && modOk(x.c); }

    function cardFilter() { return window.CARDFILTER || 'all'; }  // all | unseen | needwork | known

    function persist() {
      try {
        localStorage.setItem(SKEY, JSON.stringify({
          mod: mod, modf: (window.MODF || 'ALL'), hard: hardOnly, filter: cardFilter(), day: ymdNow(),
          ids: deck.map(function (d) { return d.i; }), idx: idx
        }));
      } catch (e) {}
    }
    function clearSession() { try { localStorage.removeItem(SKEY); } catch (e) {} }

    function restore() {
      try {
        var s = JSON.parse(localStorage.getItem(SKEY));
        // only resume an identical session (same course, SUB-MODULE, mode, AND filter) from the same day
        if (!s || s.day !== ymdNow() || s.mod !== mod || s.modf !== (window.MODF || 'ALL') || !!s.hard !== hardOnly || s.filter !== cardFilter()) return false;
        if (!Array.isArray(s.ids) || s.idx >= s.ids.length) return false;
        var d = s.ids.map(function (i) { return CARDS[i] ? { c: CARDS[i], i: i } : null; }).filter(Boolean);
        if (!d.length) return false;
        deck = d; idx = Math.min(s.idx, d.length - 1);
        return true;
      } catch (e) { return false; }
    }

    function buildDeck() {
      var src;
      if (hardOnly) {
        src = (typeof hardCards === 'function' ? hardCards() : []).filter(inScope);
      } else {
        // every card in scope (course + sub-module), then narrowed by the card filter
        src = filt(CARDS, mod).map(function (c) { return { c: c, i: CARDS.indexOf(c) }; });
        var f = cardFilter();
        if (f !== 'all' && typeof cardStatus === 'function') {
          src = src.filter(function (x) { return cardStatus(x.i) === f; });
        }
      }
      deck = order === 'shuffle' ? shuffle(src) : src;
      idx = 0;
    }

    var faces = function (c) { return side === 'term' ? [c.f, c.b] : [c.b, c.f]; };

    window._fside = function (s) { side = s; localStorage.setItem('cfpFlashSide', s); draw(); };
    window._forder = function () {
      order = order === 'shuffle' ? 'inorder' : 'shuffle';
      localStorage.setItem('cfpFlashOrder', order);
      buildDeck(); persist(); draw();
    };
    window._fauto = function () {
      auto = !auto; localStorage.setItem('cfpFlashAuto', auto ? '1' : '0'); draw();
    };
    window._fflag = function () {
      if (idx >= deck.length || typeof toggleFlag !== 'function') return;
      toggleFlag(deck[idx].i);
      var el = document.getElementById('flagbtn');
      if (el) { var on = isFlagged(deck[idx].i); el.textContent = on ? '★ Flagged' : '☆ Flag'; el.className = 'btn sm' + (on ? '' : ' gray'); }
    };
    function isFlagged(i) { var st = S.cards['c' + i]; return !!(st && st.flag); }

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
      flipped = false;
      if (idx >= deck.length) {
        clearSession();
        if (deck.length === 0) {
          var fl = cardFilter();
          var msg = fl === 'unseen' ? 'No unseen cards here — you’ve studied them all in this scope.'
            : fl === 'needwork' ? 'Nothing needs more work in this scope right now. 👍'
            : fl === 'known' ? 'No cards marked "know well" yet here — study some first.'
            : 'No cards match this filter.';
          area.innerHTML = '<div class="card center"><h2>Nothing to study</h2><p class="muted">' + msg +
            '</p><button class="btn" onclick="go(\'dash\')">Back to dashboard</button></div>';
          return;
        }
        area.innerHTML =
          '<div class="card center"><h2>Session complete 🎉</h2><p class="muted">' +
          deck.length + ' card' + (deck.length === 1 ? '' : 's') + ' reviewed.</p>' +
          '<button class="btn" onclick="go(\'dash\')">Back to dashboard</button> ' +
          '<button class="btn gray" onclick="go(\'analytics\')">See analytics</button></div>';
        return;
      }
      var c = deck[idx].c;
      var front = faces(c)[0];
      var flagOn = isFlagged(deck[idx].i);
      area.innerHTML =
        '<div class="card"><div class="flex"><span class="small muted">Card ' +
        (idx + 1) + ' of ' + deck.length +
        '</span><span><span class="tag">' + c.m + '</span><span class="tag">' + c.t + '</span> ' +
        '<button id="flagbtn" class="btn sm' + (flagOn ? '' : ' gray') + '" onclick="window._fflag()">' + (flagOn ? '★ Flagged' : '☆ Flag') + '</button></span></div>' +
        controls() +
        '<div class="flash" id="flashface"><div>' + front +
        '<br><span class="small muted" style="margin-top:10px;display:inline-block">' +
          (auto ? '(auto-flip preview — not graded)' : '(tap or press Space to flip)') + '</span></div></div>' +
        '<div id="flashctrl" class="center"></div></div>';
      document.getElementById('flashface').onclick = flip;
      if (auto) timer = setTimeout(flip, AUTO_MS);
    }

    function flip() {
      clearTimer();
      flipped = true;
      var c = deck[idx].c;
      var f = faces(c);
      document.getElementById('flashface').innerHTML =
        '<div><div class="muted small" style="margin-bottom:8px">' + f[0] + '</div>' + f[1] + '</div>';
      if (auto) {
        // hands-free preview: advance WITHOUT grading
        document.getElementById('flashctrl').innerHTML =
          '<div class="small muted" style="margin-top:10px">Auto-flip preview · turn off Auto-flip to grade</div>';
        timer = setTimeout(function () { idx++; persist(); draw(); }, AUTO_MS);
        return;
      }
      document.getElementById('flashctrl').innerHTML =
        '<div class="confbtns" style="margin-top:10px;display:flex;gap:6px;flex-wrap:wrap;justify-content:center">' +
        GRADES.map(function (x) {
          return '<button class="btn" style="background:' + x.bg + ';flex:1;min-width:70px" ' +
            'onclick="window._fg(' + x.g + ')">' + x.label + ' <span style="opacity:.7;font-size:11px">' + x.key + '</span></button>';
        }).join('') +
        '</div><div class="small muted" style="margin-top:6px">Again resets · Hard/Good/Easy space it out</div>';
    }

    window._fg = function (grade) {
      clearTimer();
      var item = deck[idx];
      gradeCard(item.i, grade);
      // calibration attempt so flashcards appear in the confidence chart + weak topics
      var cal = CAL[grade] || CAL[2];
      var c = item.c;
      try {
        S.attempts.push({ mod: c.m, domain: c.d, topic: c.t, correct: cal.c, conf: cal.conf, ts: Date.now() });
        save();
      } catch (e) {}
      idx++; persist(); draw();
    };

    // ---- keyboard shortcuts (active only while a flashcard is on screen) ----
    if (window._flashKey) document.removeEventListener('keydown', window._flashKey);
    window._flashKey = function (e) {
      if (document.getElementById('study').classList.contains('hidden')) return;
      if (!document.getElementById('flashface')) return;
      var t = e.target && e.target.tagName;
      if (t === 'INPUT' || t === 'TEXTAREA' || t === 'SELECT') return;
      if (idx >= deck.length) return;
      if (!flipped) {
        if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); flip(); }
        return;
      }
      if (auto) return;
      if (e.key === 'f' || e.key === 'F') { e.preventDefault(); window._fflag(); return; }
      var g = GRADES.filter(function (x) { return x.key === e.key; })[0];
      if (g) { e.preventDefault(); window._fg(g.g); }
      else if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); window._fg(2); } // Space = Good after flip
    };
    document.addEventListener('keydown', window._flashKey);

    if (!restore()) { buildDeck(); }
    persist();
    draw();
  };
})();

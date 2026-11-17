/* fp513-course.js — FP513 Investment Planning course layer (v2.114.0).
 *
 * Adds, without replacing any engine:
 *   - Today:      FP513 card — current module, next learning objective, Continue FP513,
 *                 outstanding reviews, LO progress, deadline + adjustable pacing plan.
 *   - Analytics:  FP513 panel — module completion, first-attempt accuracy, delayed retention,
 *                 calculation proficiency, weak objectives, full CFP-domain content coverage,
 *                 manual Kaplan score log (official results are never imported or implied).
 *   - Study:      two randomized cumulative FP513 practice forms (A/B) with LO diagnostics.
 *   - Coach:      FP513.prioritize() orders guided-session questions: due reviews → missed →
 *                 untested objectives → new material; coach.js adds one FP511/FP512 retention item.
 * Evidence comes only from S.attempts / S.coach / S.cards. Nothing here is a pass probability.
 * State: S.fp513 = { init, start, official:[{id,date,kind,score,weak}], forms:[{id,form,pct,n,ts}] }
 */
(function () {
  'use strict';
  if (typeof S === 'undefined' || typeof MCQ === 'undefined') return;
  var COURSE = 'FP513';
  var DEADLINE = '2027-02-15';
  var DEADLINE_SRC = 'Kaplan "Online Access" email of Nov 17 2026: every FP513 component (OnDemand, QBank, module quizzes & final exam, eBook) expires 2/15/2027.';
  var LOS = [
    ['LO 1.1.1', 1, 'Functions of financial intermediaries, investment bankers and dealers', 2], ['LO 1.2.1', 1, 'Primary and secondary market components, terms and mechanisms', 8],
    ['LO 1.3.1', 1, 'Characteristics and taxation of cash and cash equivalents', 16], ['LO 1.4.1', 1, 'Capital gains/losses, dividends and wash sales', 22],
    ['LO 2.1.1', 2, 'Debt security terms, characteristics and risks', 33], ['LO 2.2.1', 2, 'Convertible securities: conversion/investment value, premiums, downside risk', 53],
    ['LO 2.3.1', 2, 'Immunization, bond swaps, ladders, barbells and bullets', 57], ['LO 2.3.2', 2, 'Matching fixed-income securities to investor profiles', 59],
    ['LO 2.4.1', 2, 'Investment implications of yield curves', 63], ['LO 2.5.1', 2, 'Preferred stock terms and characteristics', 69],
    ['LO 3.1.1', 3, 'Characteristics and types of common stock', 77], ['LO 3.2.1', 3, 'Cash and stock distributions', 83],
    ['LO 3.3.1', 3, 'Open-/closed-end funds, UITs and separately managed accounts', 86], ['LO 3.4.1', 3, 'ETFs, hedge funds and GICs', 101],
    ['LO 3.5.1', 3, 'Average cost per share — averaging techniques', 105], ['LO 3.6.1', 3, 'Mutual fund selection factors', 110],
    ['LO 4.1.1', 4, 'Interest rates and bond prices', 127], ['LO 4.1.2', 4, 'Duration and convexity', 131],
    ['LO 4.2.1', 4, 'Fundamental and technical analysis vs. MPT', 143], ['LO 4.2.2', 4, 'Financial leverage and stock valuation', 158],
    ['LO 4.3.1', 4, 'Intrinsic value — stock valuation techniques', 162], ['LO 4.3.2', 4, 'Valuation metrics for buy decisions', 167],
    ['LO 5.1.1', 5, 'Investment real estate: ownership, valuation, taxation', 177], ['LO 5.2.1', 5, 'Types of option investments', 185],
    ['LO 5.2.2', 5, 'Options for speculation and hedging', 193], ['LO 5.3.1', 5, 'Futures: terms, uses and taxation', 202],
    ['LO 5.4.1', 5, 'Tangible asset investments', 207], ['LO 5.5.1', 5, 'Foreign securities: risks and benefits', 211],
    ['LO 5.5.2', 5, 'Exchange-rate effects on foreign returns', 216], ['LO 6.1.1', 6, 'Risk/return terminology for portfolios', 225],
    ['LO 6.1.2', 6, 'Systematic vs. unsystematic risk sources', 229], ['LO 6.2.1', 6, 'Beta and weighted beta', 232],
    ['LO 6.2.2', 6, 'Mean, standard deviation and 1/2/3-σ ranges', 235], ['LO 6.2.3', 6, 'Coefficient of variation', 242],
    ['LO 6.2.4', 6, 'Covariance, correlation and portfolio σ', 244], ['LO 6.2.5', 6, 'Coefficient of determination (R²)', 250],
    ['LO 7.1.1', 7, 'Measures of investment return', 259], ['LO 7.2.1', 7, 'Performance measures (Sharpe, Treynor, alpha…)', 267],
    ['LO 7.3.1', 7, 'Indicators of security returns', 272], ['LO 7.4.1', 7, 'Current yield, YTM, YTC, taxable-equivalent yield', 276],
    ['LO 8.1.1', 8, 'MPT assumptions, indifference curves, efficient frontier', 289], ['LO 8.2.1', 8, 'CML, CAPM and SML', 296],
    ['LO 8.3.1', 8, 'Three forms of the efficient market hypothesis', 306], ['LO 8.3.2', 8, 'EMH vs. other investment theories', 311],
    ['LO 8.4.1', 8, 'Investment policy statement components', 315], ['LO 8.5.1', 8, 'Investments across interest-rate and economic cycles', 322],
    ['LO 8.5.2', 8, 'Asset allocation methodologies', 326], ['LO 8.6.1', 8, 'Managing crisis events with severe financial consequences', 334]
  ].map(function (x) { return { id: x[0], mod: x[1], text: x[2], page: x[3] }; });
  var PACE = [{ weeks: '1–2', mods: [1, 2] }, { weeks: '3–4', mods: [3, 4] }, { weeks: '5–6', mods: [5, 6] }, { weeks: '7–8', mods: [7, 8] }, { weeks: '9', mods: [9] }];
  var DOMAINS_CONTENT = { A: 'FP511', B: 'FP511', H: 'FP511', C: 'FP512', D: 'FP513', E: 'FP514', F: 'FP515', G: 'FP516' };

  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  function localDay(ts) { var d = ts ? new Date(ts) : new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function daysBetween(a, b) { return Math.round((new Date(b + 'T00:00:00') - new Date(a + 'T00:00:00')) / 864e5); }
  function addDays(d, n) { var x = new Date(d + 'T00:00:00'); x.setDate(x.getDate() + n); return localDay(x.getTime()); }
  function st() { if (!S.fp513 || typeof S.fp513 !== 'object') S.fp513 = {}; var f = S.fp513; if (!Array.isArray(f.official)) f.official = []; if (!Array.isArray(f.forms)) f.forms = []; return f; }
  function modName(n) { return (typeof MODMETA !== 'undefined' && MODMETA[COURSE] && MODMETA[COURSE][n]) || ('Module ' + n); }
  function startDay() { var f = st(); if (!f.start) { f.start = localDay(); try { save(); } catch (e) {} } return f.start; }

  // ---------- question/LO index ----------
  var keyLo = {}, loQs = {}, loCards = {};
  function indexItems() {
    keyLo = {}; loQs = {}; loCards = {};
    MCQ.forEach(function (q) { if (q.m !== COURSE || !q.lo) return; var k = (typeof mcqKey === 'function') ? mcqKey(q) : (q.g || q.q); keyLo[k] = q.lo; (loQs[q.lo] = loQs[q.lo] || []).push(q); });
    CARDS.forEach(function (c, i) { if (c.m === COURSE && c.lo) (loCards[c.lo] = loCards[c.lo] || []).push(i); });
    if (window.FP513CALC) window.FP513CALC.drills.forEach(function (d) { keyLo['calc:' + d.id] = d.lo; });
  }
  indexItems();

  function loOfAttempt(a) { return a.lo || (a.questionKey && keyLo[a.questionKey]) || null; }

  // Evidence per LO. first = first attempt per question key; retained = a correct answer on a LATER
  // local day than an earlier attempt on the same key (same-day corrections never count).
  function evidence() {
    var per = {}, firstSeen = {}, keyDays = {};
    LOS.forEach(function (l) { per[l.id] = { n: 0, ok: 0, first: 0, firstOk: 0, calcN: 0, calcOk: 0, retained: 0, sameDayFix: 0, last: 0 }; });
    var atts = (S.attempts || []).filter(function (a) { return a.mod === COURSE; }).slice().sort(function (a, b) { return (a.ts || 0) - (b.ts || 0); });
    atts.forEach(function (a) {
      var lo = loOfAttempt(a); if (!lo || !per[lo]) return;
      var p = per[lo], k = a.questionKey || ('t:' + a.topic), d = localDay(a.ts);
      p.n++; if (a.correct) p.ok++; p.last = Math.max(p.last, a.ts || 0);
      if (a.src === 'calc' || /^fp513\./.test(a.questionKey || '')) { p.calcN++; if (a.correct) p.calcOk++; }
      if (!firstSeen[k]) { firstSeen[k] = { day: d, ok: !!a.correct }; p.first++; if (a.correct) p.firstOk++; }
      else {
        var prev = keyDays[k] || [];
        if (a.correct && prev.some(function (x) { return x < d; })) { p.retained++; }
        else if (a.correct && prev.indexOf(d) >= 0 && !firstSeen[k].ok) p.sameDayFix++;
      }
      (keyDays[k] = keyDays[k] || []).push(d);
    });
    // flashcard exposure (reviewed cards) per LO — shown as exposure, never as mastery
    Object.keys(loCards).forEach(function (lo) { if (per[lo]) per[lo].cardsSeen = loCards[lo].filter(function (i) { return S.cards && S.cards['c' + i]; }).length; });
    return per;
  }
  function moduleSummary(ev) {
    var mods = {};
    for (var m = 1; m <= 9; m++) mods[m] = { los: 0, tested: 0, retained: 0, n: 0, ok: 0, first: 0, firstOk: 0, calcN: 0, calcOk: 0 };
    LOS.forEach(function (l) { var e = ev[l.id], s = mods[l.mod]; s.los++; if (e.n) s.tested++; if (e.retained) s.retained++; s.n += e.n; s.ok += e.ok; s.first += e.first; s.firstOk += e.firstOk; s.calcN += e.calcN; s.calcOk += e.calcOk; });
    // Module 9 has no LOs of its own: summarize its case questions by attempts on its items
    (S.attempts || []).forEach(function (a) { if (a.mod === COURSE && (a.topic === 'Integrated Case' || a.topic === 'Case Study Approach')) { mods[9].n++; if (a.correct) mods[9].ok++; } });
    return mods;
  }
  function currentModule(ev) {
    var mods = moduleSummary(ev);
    for (var m = 1; m <= 8; m++) if (mods[m].tested < mods[m].los) return m;
    return 9;
  }
  function nextObjective(ev, mod) {
    var los = LOS.filter(function (l) { return l.mod === mod; });
    var untested = los.filter(function (l) { return !ev[l.id].n; })[0];
    if (untested) return { lo: untested, why: 'not yet tested' };
    var weakest = los.filter(function (l) { return ev[l.id].n; }).sort(function (a, b) { return ev[a.id].ok / ev[a.id].n - ev[b.id].ok / ev[b.id].n; })[0];
    return weakest ? { lo: weakest, why: Math.round(100 * ev[weakest.id].ok / ev[weakest.id].n) + '% correct so far' } : null;
  }
  function dueReviews() {
    var today = localDay(), r = (S.coach && S.coach.reviews) || {}, all = 0, f = 0;
    Object.keys(r).forEach(function (k) { if (r[k] && r[k].due && r[k].due <= today) { all++; if (r[k].course === COURSE) f++; } });
    return { all: all, fp513: f };
  }
  function pct(a, b) { return b ? Math.round(100 * a / b) : null; }
  function pctTxt(a, b) { var p = pct(a, b); return p == null ? '—' : p + '%'; }

  // ---------- coach prioritization (used by coach.js for FP513 sessions) ----------
  function prioritize(ranked) {
    var ev = evidence(), today = localDay(), rv = (S.coach && S.coach.reviews) || {}, missedKeys = {};
    (S.misses || []).forEach(function (m) { if (m.mod === COURSE) missedKeys[m.g || m.q] = 1; });
    function tier(q) {
      var k = (typeof mcqKey === 'function') ? mcqKey(q) : (q.g || q.q), r = rv[k];
      if (r && r.due && r.due <= today) return 0;                    // 1. outstanding delayed review
      if (missedKeys[k] && !(r && r.retained)) return 1;               // 2. previously missed FP513 question
      if (q.lo && ev[q.lo] && !ev[q.lo].n) return 2;                   // 3. untested learning objective
      return 3;                                                        // 4. new/other material in scope
    }
    return ranked.map(function (q, i) { return { q: q, t: tier(q), i: i }; }).sort(function (a, b) { return a.t - b.t || a.i - b.i; }).map(function (x) { return x.q; });
  }
  // One FP511/FP512 retention question for longer sessions: the longest-unseen previously answered item.
  function retentionPick(excludeKeys) {
    var last = {};
    (S.attempts || []).forEach(function (a) { if ((a.mod === 'FP511' || a.mod === 'FP512') && a.questionKey) last[a.questionKey] = Math.max(last[a.questionKey] || 0, a.ts || 0); });
    var pool = MCQ.filter(function (q) { var k = (typeof mcqKey === 'function') ? mcqKey(q) : q.q; return (q.m === 'FP511' || q.m === 'FP512') && last[k] && !(excludeKeys && excludeKeys[k]); });
    pool.sort(function (a, b) { return last[(a.g || a.q)] - last[(b.g || b.q)]; });
    return pool[0] || null;
  }

  // ---------- Today card ----------
  function todayCard() {
    var host = $('fp513Today');
    if (!host) { var anchor = $('coachHome'); if (!anchor) return; host = document.createElement('div'); host.id = 'fp513Today'; anchor.insertAdjacentElement('beforebegin', host); }
    var ev = evidence(), cur = currentModule(ev), nx = nextObjective(ev, cur), mods = moduleSummary(ev), dr = dueReviews();
    var tested = LOS.filter(function (l) { return ev[l.id].n; }).length, retained = LOS.filter(function (l) { return ev[l.id].retained; }).length;
    var passed = S.coursePassed && S.coursePassed[COURSE], due = (S.courseDue && S.courseDue[COURSE]) || DEADLINE, left = daysBetween(localDay(), due);
    var verified = due === DEADLINE;
    var start = startDay(), week = Math.max(1, Math.floor(daysBetween(start, localDay()) / 7) + 1);
    var plan = PACE.map(function (p, i) {
      var w0 = i * 2 + 1, w1 = p.mods[0] === 9 ? 9 : w0 + 1, a = addDays(start, (w0 - 1) * 7), b = addDays(start, w1 * 7 - 1), on = week >= w0 && week <= w1;
      var done = p.mods.every(function (m) { return m === 9 ? mods[9].n > 0 : mods[m].tested === mods[m].los; });
      return '<div class="fp5-pace' + (on ? ' on' : '') + '"><b>Wk ' + p.weeks + '</b><span>' + p.mods.map(function (m) { return 'M' + m; }).join(' + ') + '</span><span class="small muted">' + a.slice(5) + ' → ' + b.slice(5) + '</span>' + (done ? '<span class="fp5-ok">✓</span>' : '') + '</div>';
    }).join('') + '<div class="fp5-pace' + (week > 9 ? ' on' : '') + '"><b>Wk 10+</b><span>Weak-topic repair · Kaplan quizzes/QBank · final prep</span><span class="small muted">to ' + due.slice(5) + '</span></div>';
    var loLine = nx ? '<div class="fp5-next"><span class="tag">' + nx.lo.id + '</span> ' + esc(nx.lo.text) + ' <span class="small muted">· ' + nx.why + '</span></div>' : '';
    host.innerHTML = '<div class="card fp5-card">' +
      '<div class="fp5-head"><div style="min-width:0"><div class="small muted">Active course</div><h2 style="margin:2px 0">FP513 · Investment Planning</h2></div>' +
      '<div class="fp5-days"><b>' + (passed ? '✓' : (left >= 0 ? left : 0)) + '</b><span>' + (passed ? 'passed' : 'days left') + '</span></div></div>' +
      '<div class="fp5-mod"><b>Module ' + cur + '</b> — ' + esc(modName(cur)) + '</div>' + loLine +
      '<div class="row" style="flex-wrap:wrap;gap:8px;margin:10px 0 4px">' +
        '<button class="btn" data-fp5="continue">Continue FP513 →</button>' +
        '<button class="btn gray sm" data-fp5="read">📖 Read</button>' +
        '<button class="btn gray sm" data-fp5="calc">🧮 Calc lab</button>' +
        '<button class="btn gray sm" data-fp5="hub">Module hub</button></div>' +
      '<div class="fp5-stats">' +
        '<div><b>' + tested + '/48</b><span>objectives tested</span></div>' +
        '<div><b>' + retained + '/48</b><span>recalled on a later day</span></div>' +
        '<div><b>' + dr.fp513 + '</b><span>FP513 reviews due' + (dr.all > dr.fp513 ? ' (+' + (dr.all - dr.fp513) + ' other)' : '') + '</span></div></div>' +
      '<div class="bar" style="margin-top:8px" title="Objectives tested"><i style="width:' + Math.round(tested / 48 * 100) + '%"></i></div>' +
      '<details class="fp5-details"><summary>Suggested pace · week ' + Math.min(week, 10) + ' (adjustable, nothing is locked)</summary><div class="fp5-paces">' + plan + '</div>' +
        '<label class="small">Plan start <input type="date" id="fp5Start" value="' + start + '"></label> ' +
        '<div class="small muted" style="margin-top:6px">Deadline ' + due + (verified ? ' — verified: ' + esc(DEADLINE_SRC) : ' — your own date.') + ' Edit it in the course schedule below.</div></details>' +
      '<div class="small muted" style="margin-top:6px">Progress = questions you have actually answered. Reading or flipping cards is shown separately and never counts as mastery.</div>' +
      '</div>';
    var s = $('fp5Start'); if (s) s.onchange = function () { if (s.value) { st().start = s.value; save(); todayCard(); } };
    host.querySelectorAll('[data-fp5]').forEach(function (b) { b.onclick = function () { act(b.getAttribute('data-fp5'), cur, nx); }; });
  }
  function act(what, cur, nx) {
    if (what === 'continue') {
      if (window.CFPCoach && window.CFPCoach.launch) window.CFPCoach.launch((S.coach && S.coach.settings && S.coach.settings.minutes) || 10, null, { course: COURSE, mod: cur, name: modName(cur) });
      else if (typeof studyScoped === 'function') studyScoped(COURSE, cur, 'quiz');
    } else if (what === 'read') {
      var tab = ((window.TAB_MAP || {})[COURSE] || {})[cur]; location.href = 'apps/fp513-reading.html' + (tab ? '#' + tab : '');
    } else if (what === 'calc') { if (typeof studyScoped === 'function') studyScoped(COURSE, cur, 'calc'); }
    else if (what === 'hub') { if (typeof openModule === 'function') openModule(COURSE, cur); }
  }

  // ---------- Analytics panel ----------
  function analyticsPanel() {
    var host = $('fp513Analytics');
    if (!host) { var sec = $('analytics'); if (!sec) return; host = document.createElement('div'); host.id = 'fp513Analytics'; host.style.marginBottom = '14px'; var ca = $('coachAnalytics'); if (ca) ca.insertAdjacentElement('afterend', host); else sec.insertBefore(host, sec.firstChild); }
    var ev = evidence(), mods = moduleSummary(ev);
    var rows = '';
    for (var m = 1; m <= 9; m++) {
      var s = mods[m], ck = (S.modReady || {})[COURSE + '_' + m];
      rows += '<tr><td><b>M' + m + '</b> <span class="small muted">' + esc(modName(m)) + '</span></td>' +
        '<td data-l="Tested">' + (m === 9 ? (s.n ? 'started' : '—') : s.tested + '/' + s.los) + '</td>' +
        '<td data-l="First try">' + pctTxt(s.firstOk, s.first) + '</td><td data-l="Recalled later">' + (m === 9 ? '—' : s.retained + '/' + s.los) + '</td>' +
        '<td data-l="Calc">' + pctTxt(s.calcOk, s.calcN) + (s.calcN ? ' <span class="small muted">(' + s.calcN + ')</span>' : '') + '</td>' +
        '<td data-l="Checkpoint">' + (ck && ck.score != null ? ck.score + '%' : '—') + '</td></tr>';
    }
    var weak = LOS.filter(function (l) { var e = ev[l.id]; return e.n >= 2 && e.ok / e.n < 0.7; }).sort(function (a, b) { return ev[a.id].ok / ev[a.id].n - ev[b.id].ok / ev[b.id].n; }).slice(0, 8);
    var weakHtml = weak.length ? weak.map(function (l) { var e = ev[l.id]; return '<div class="fp5-weak"><span class="tag">' + l.id + '</span> ' + esc(l.text) + ' <span class="small muted">' + e.ok + '/' + e.n + '</span> <button class="btn gray sm" data-fp5drill="' + l.mod + '">Drill →</button></div>'; }).join('') : '<div class="small muted">No objective below 70% with at least 2 answers yet.</div>';
    var w = 0, loaded = 0; (typeof DOMAINS !== 'undefined' ? DOMAINS : []).forEach(function (d) { w += d.w; var c = DOMAINS_CONTENT[d.k]; if (c && (CARDS.some(function (x) { return x.m === c; }) || MCQ.some(function (x) { return x.m === c; }))) loaded += d.w; });
    var dom = (typeof DOMAINS !== 'undefined' ? DOMAINS : []).map(function (d) { var c = DOMAINS_CONTENT[d.k], has = c && (MCQ.some(function (x) { return x.m === c; })); return '<span class="tag" style="' + (has ? '' : 'opacity:.45') + '">' + d.k + ' ' + d.w + '%' + (has ? '' : ' · no material') + '</span>'; }).join(' ');
    var forms = st().forms.slice(-6).reverse().map(function (f) { return '<span class="tag">Form ' + f.form + ' · ' + f.pct + '% · ' + localDay(f.ts).slice(5) + '</span>'; }).join(' ');
    var off = st().official.slice().sort(function (a, b) { return (b.date || '').localeCompare(a.date || ''); }).map(function (r) { return '<div class="fp5-off"><b>' + esc(r.kind) + '</b> · ' + esc(r.date) + ' · <b>' + esc(r.score) + '%</b>' + (r.weak ? ' <span class="small muted">weak: ' + esc(r.weak) + '</span>' : '') + ' <button class="btn gray sm" data-fp5del="' + esc(r.id) + '">✕</button></div>'; }).join('') || '<div class="small muted">No official results entered.</div>';
    host.innerHTML = '<div class="card"><div class="flex"><h2>FP513 learning evidence</h2><span class="small muted">no pass probability</span></div>' +
      '<div class="fp5-tablewrap"><table class="fp5-table"><thead><tr><th>Module</th><th>Objectives tested</th><th>First-try accuracy</th><th>Recalled later</th><th>Calc proficiency</th><th>Checkpoint</th></tr></thead><tbody>' + rows + '</tbody></table></div>' +
      '<details class="fp5-details"><summary>How these are measured</summary><div class="small muted">First-try accuracy = the first answer to each distinct question. Recalled later = an objective answered correctly on a later day than an earlier attempt (same-day corrections are tracked but not counted). Calc proficiency = calculator drills + generated math questions. Checkpoint = your latest Module Hub exam. Flashcard exposure is not counted as mastery.</div></details>' +
      '<h3 style="margin-top:12px">Weak objectives</h3>' + weakHtml +
      (forms ? '<h3 style="margin-top:12px">Cumulative practice forms</h3><div>' + forms + '</div>' : '') +
      '<h3 style="margin-top:12px">Full CFP® blueprint — course material loaded</h3><div>' + dom + '</div><div class="small muted" style="margin-top:4px">' + loaded + '% of the exam blueprint has course material in the app. Domain weights per CFP Board 2021 Principal Knowledge Topics (Investment Planning 17% of the exam, not of each session).</div>' +
      '<h3 style="margin-top:12px">Kaplan official results (manual entry)</h3><div class="small muted" style="margin-bottom:6px">Typed by you from Kaplan. The app has no Kaplan connection and keeps these separate from app-made practice.</div>' + off +
      '<div class="row" style="flex-wrap:wrap;gap:6px;margin-top:8px"><input type="date" id="fp5OffDate" value="' + localDay() + '"><select id="fp5OffKind"><option>Module 1 quiz</option><option>Module 2 quiz</option><option>Module 3 quiz</option><option>Module 4 quiz</option><option>Module 5 quiz</option><option>Module 6 quiz</option><option>Module 7 quiz</option><option>Module 8 quiz</option><option>Module 9 quiz</option><option>Final exam</option><option>QBank set</option><option>Practice exam</option></select>' +
      '<input type="number" id="fp5OffScore" min="0" max="100" placeholder="Score %" style="width:90px"><input type="text" id="fp5OffWeak" placeholder="Weak topics (optional)"><button class="btn sm" id="fp5OffAdd">Add</button></div></div>';
    host.querySelectorAll('[data-fp5drill]').forEach(function (b) { b.onclick = function () { if (typeof studyScoped === 'function') studyScoped(COURSE, +b.getAttribute('data-fp5drill'), 'quiz'); }; });
    host.querySelectorAll('[data-fp5del]').forEach(function (b) { b.onclick = function () { var id = b.getAttribute('data-fp5del'); st().official = st().official.filter(function (r) { return r.id !== id; }); save(); analyticsPanel(); }; });
    var add = $('fp5OffAdd'); if (add) add.onclick = function () {
      var sc = parseFloat($('fp5OffScore').value); if (isNaN(sc) || sc < 0 || sc > 100) { if (typeof toast === 'function') toast('Enter a score from 0 to 100.'); return; }
      st().official.push({ id: 'k' + Date.now(), date: $('fp5OffDate').value || localDay(), kind: $('fp5OffKind').value, score: Math.round(sc * 10) / 10, weak: ($('fp5OffWeak').value || '').slice(0, 200) });
      save(); analyticsPanel();
    };
  }

  // ---------- cumulative practice forms ----------
  var FORM_PLAN = { 1: 3, 2: 5, 3: 5, 4: 5, 5: 5, 6: 4, 7: 4, 8: 5, 9: 3 };   // 39 static + 3 generated calc
  function hash(s) { var h = 0; for (var i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0; return Math.abs(h); }
  function shuffled(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function buildForm(form) {
    var half = form === 'A' ? 0 : 1, pool = [];
    Object.keys(FORM_PLAN).forEach(function (m) {
      var mq = MCQ.filter(function (q) { return q.m === COURSE && !q.g && moduleOf(q) === +m && hash(q.q) % 2 === half; });
      pool = pool.concat(shuffled(mq).slice(0, FORM_PLAN[m]));
    });
    var gens = MCQ.filter(function (q) { return q.m === COURSE && q.g; });
    pool = pool.concat(shuffled(gens).slice(0, 3));
    return shuffled(pool);
  }
  function runForm(form) {
    var pool = buildForm(form);
    if (pool.length < 10) { if (typeof toast === 'function') toast('FP513 questions are still loading.'); return; }
    if (typeof go === 'function') go('study'); if (typeof studyFocus === 'function') studyFocus(true);
    mcqRunner(pool, 'FP513 cumulative form ' + form, {
      exam: true, ordered: true,
      header: '<b>FP513 cumulative practice — Form ' + form + '</b> <span class="small muted">· ' + pool.length + ' questions across Modules 1–9, randomized each attempt. App-made practice; not a Kaplan exam.</span>',
      onDone: function (p, correct, n, results) {
        st().forms.push({ id: 'f' + Date.now(), form: form, pct: p, n: n, ts: Date.now() }); save();
        setTimeout(function () { var area = $('studyArea'); if (area) area.insertAdjacentHTML('afterbegin', diagnostics(results)); }, 0);
      }
    });
  }
  function diagnostics(results) {
    var by = {};
    (results || []).forEach(function (r) { var lo = r.q.lo || 'Case'; by[lo] = by[lo] || { n: 0, ok: 0, mod: loModule(r.q) || 9 }; by[lo].n++; if (r.ok) by[lo].ok++; });
    var rows = Object.keys(by).sort().map(function (lo) { var b = by[lo], p = Math.round(100 * b.ok / b.n), l = LOS.filter(function (x) { return x.id === lo; })[0];
      return '<tr><td><span class="tag">' + lo + '</span> <span class="small">' + esc(l ? l.text : 'Integrated case') + '</span></td><td style="color:' + (p >= 70 ? 'var(--good)' : 'var(--bad)') + '"><b>' + b.ok + '/' + b.n + '</b></td><td>' + (p < 70 ? '<button class="btn gray sm" onclick="studyScoped(\'FP513\',' + b.mod + ',\'quiz\')">Drill M' + b.mod + '</button>' : '') + '</td></tr>'; }).join('');
    return '<div class="card" style="margin-bottom:12px"><h3>Objective-level diagnostics</h3><div class="fp5-tablewrap"><table class="fp5-table"><tbody>' + rows + '</tbody></table></div></div>';
  }
  function loModule(q) { var m = q && q.lo && /^LO (\d+)\./.exec(q.lo); return m ? +m[1] : 0; }

  // ---------- styles ----------
  function css() {
    if ($('fp5css')) return;
    var s = document.createElement('style'); s.id = 'fp5css';
    s.textContent = '.fp5-card{margin-bottom:12px;border-left:4px solid #8a5cd6}.fp5-head{display:grid;grid-template-columns:1fr auto;gap:10px;align-items:center}.fp5-days{text-align:center;background:rgba(138,92,214,.1);border-radius:12px;padding:6px 10px;min-width:64px}.fp5-days b{display:block;font-size:22px;line-height:1.1;color:#8a5cd6}.fp5-days span{font-size:11px;color:var(--muted)}.fp5-mod{margin-top:6px}.fp5-next{margin-top:4px;font-size:13px;line-height:1.45}' +
      '.fp5-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:8px}.fp5-stats div{background:rgba(138,92,214,.08);border-radius:10px;padding:8px;min-width:0}.fp5-stats b{display:block;font-size:17px}.fp5-stats span{font-size:11px;color:var(--muted)}' +
      '.fp5-details{margin-top:8px}.fp5-details summary{cursor:pointer;font-weight:700;font-size:13px}.fp5-paces{display:grid;gap:6px;margin:8px 0}.fp5-pace{display:grid;grid-template-columns:62px 1fr auto auto;gap:8px;align-items:center;font-size:13px;padding:6px 8px;border-radius:8px;background:rgba(0,0,0,.03)}.fp5-pace.on{background:rgba(138,92,214,.14);font-weight:600}.fp5-ok{color:var(--good)}' +
      '.fp5-tablewrap{overflow-x:auto;-webkit-overflow-scrolling:touch;max-width:100%}.fp5-table{width:100%;border-collapse:collapse;font-size:12.5px}.fp5-table th,.fp5-table td{padding:5px 6px;border-bottom:1px solid var(--line);text-align:left;vertical-align:top}.fp5-table th{font-size:11px;color:var(--muted);font-weight:700}' +
      '.fp5-weak,.fp5-off{padding:5px 0;border-bottom:1px solid var(--line);font-size:13px}' +
      '#fp513Analytics input,#fp513Analytics select{max-width:100%;min-width:0}' +
      '@media(max-width:560px){.fp5-pace{grid-template-columns:52px 1fr;}.fp5-pace .small{grid-column:2}.fp5-table thead{display:none}.fp5-table tr{display:block;padding:6px 0;border-bottom:1px solid var(--line)}.fp5-table td{display:inline-block;border:0;padding:2px 8px 2px 0}.fp5-table td:first-child{display:block}.fp5-table td[data-l]::before{content:attr(data-l) ": ";color:var(--muted);font-size:11px}}' +
      'html[data-theme="dark"] .fp5-pace{background:rgba(255,255,255,.05)}html[data-theme="dark"] .fp5-stats div{background:rgba(160,120,230,.16)}';
    document.head.appendChild(s);
  }

  // ---------- hooks ----------
  css();
  // Today's focus / coach target: within FP513, follow the course sequence (current module),
  // not "weakest module", which on a fresh course just picks the module with the most cards.
  var origFocus = window.focusTarget;
  if (typeof origFocus === 'function') window.focusTarget = function () {
    var f = origFocus.apply(this, arguments);
    if (f && f.course === COURSE) { try { var m = currentModule(evidence()); f.mod = m; f.name = modName(m); f.mastery = (typeof moduleMastery === 'function') ? moduleMastery(COURSE, m) : f.mastery; } catch (e) {} }
    return f;
  };
  var origDash = window.renderDash;
  if (typeof origDash === 'function') window.renderDash = function () { origDash.apply(this, arguments); try { todayCard(); } catch (e) { console.warn('fp513 today', e); } };
  var origAnalytics = window.renderAnalytics;
  if (typeof origAnalytics === 'function') window.renderAnalytics = function () { origAnalytics.apply(this, arguments); try { analyticsPanel(); } catch (e) { console.warn('fp513 analytics', e); } };
  try { todayCard(); analyticsPanel(); } catch (e) { console.warn('fp513 init', e); }
  // The first dashboard render (and the coach hero) ran before this file loaded, so they used the
  // unwrapped focusTarget(). Re-render once so Today's focus + coach follow the FP513 sequence.
  try { var dash = $('dash'); if (dash && !dash.classList.contains('hidden') && typeof window.renderDash === 'function') window.renderDash(); } catch (e) { console.warn('fp513 rerender', e); }

  window.FP513COURSE = { LOS: LOS, DEADLINE: DEADLINE, DEADLINE_SRC: DEADLINE_SRC, evidence: evidence, moduleSummary: moduleSummary, currentModule: currentModule, nextObjective: nextObjective,
    prioritize: prioritize, retentionPick: retentionPick, runForm: runForm, buildForm: buildForm, diagnostics: diagnostics, todayCard: todayCard, analyticsPanel: analyticsPanel, reindex: indexItems };
})();

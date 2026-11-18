/* fp513-course.js — FP513 Investment Planning course layer (v2.114.0; Learning Command Center v2.118.0).
 *
 * Adds, without replacing any engine:
 *   - Today:      FP513 card — current module, next learning objective, Continue FP513,
 *                 outstanding reviews, LO progress, deadline + adjustable pacing plan.
 *   - Analytics:  FP513 panel — module completion, first-attempt accuracy, delayed retention,
 *                 calculation proficiency, weak objectives, full CFP-domain content coverage,
 *                 manual Kaplan score log (official results are never imported or implied).
 *   - Study:      two randomized cumulative FP513 practice forms (A/B) with LO diagnostics.
 *   - Coach:      FP513.prioritize() orders guided-session questions: due reviews → missed →
 *                 untested objectives → new material; older courses are reviewed only in Mixed review (v2.117.0).
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
  function prioritize(ranked, focus) {
    var wantLo = focus && focus.lo, ev = evidence(), today = localDay(), rv = (S.coach && S.coach.reviews) || {}, missedKeys = {};
    (S.misses || []).forEach(function (m) { if (m.mod === COURSE) missedKeys[m.g || m.q] = 1; });
    function tier(q) {
      var k = (typeof mcqKey === 'function') ? mcqKey(q) : (q.g || q.q), r = rv[k];
      if (wantLo && q.lo === wantLo) return -1;                         // 0. the objective picked on Today (v2.118.0)
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

  // Read-only summary for the slide decks' Duo "Weak areas" page (v2.117.0). Derived from the same
  // evidence the Analytics panel shows; never read back by the app, never touches S or scoring.
  function cacheWeak(ev, mods) {
    try {
      var m = {}; Object.keys(mods).forEach(function (k) { m[k] = { n: mods[k].n, ok: mods[k].ok }; });
      var los = LOS.filter(function (l) { var e = ev[l.id]; return e.n >= 2 && e.ok / e.n < 0.7; }).sort(function (a, b) { return ev[a.id].ok / ev[a.id].n - ev[b.id].ok / ev[b.id].n; })
        .slice(0, 6).map(function (l) { return { id: l.id, mod: l.mod, text: l.text, ok: ev[l.id].ok, n: ev[l.id].n }; });
      localStorage.setItem('cfp:fp513-weak', JSON.stringify({ ts: Date.now(), mods: m, los: los }));
    } catch (e) {}
  }

  // ---------- Learning Command Center evidence (v2.118.0, issue #8) ----------
  // Practice-evidence heuristics, NOT pass probabilities. Thresholds are pinned by tests/fp513-today.test.cjs.
  //   Attempted     = at least one LO-mapped answer (MCQ, coach, exam form or calc drill; flashcards never count).
  //   Proficient    = correct answers on >= PROF.minKeys DISTINCT question keys AND the latest answer on
  //                   >= PROF.minAcc of the keys tried is correct. Every numeric variant of a generator shares
  //                   one key (q.g / calc:<id>), so redrawing the same calculation never adds a second key.
  //   Recalled later = a correct answer on a LATER local day than the day the objective first became proficient.
  //   Review due    = a coach review on one of its keys is due today or earlier.
  var PROF = { minKeys: 2, minAcc: 0.7 };
  function loStatus() {
    var today = localDay(), per = {}, rv = (S.coach && S.coach.reviews) || {};
    LOS.forEach(function (l) { per[l.id] = { n: 0, keys: {}, nKeys: 0, okKeys: 0, latestOk: 0, attempted: false, proficient: false, profDay: null, recalled: false, recalledDay: null, reviewDue: false, last: 0 }; });
    var atts = (S.attempts || []).filter(function (a) { return a.mod === COURSE && a.src !== 'card'; }).slice().sort(function (a, b) { return (a.ts || 0) - (b.ts || 0); });
    atts.forEach(function (a) {
      var lo = loOfAttempt(a), p = lo && per[lo]; if (!p || !a.questionKey) return;
      var d = localDay(a.ts), k = p.keys[a.questionKey];
      if (!k) { k = p.keys[a.questionKey] = { n: 0, everOk: false, lastOk: false }; p.nKeys++; }
      k.n++; p.n++; p.last = Math.max(p.last, a.ts || 0); p.attempted = true;
      if (a.correct && !k.everOk) { k.everOk = true; p.okKeys++; }
      if (k.lastOk !== !!a.correct) { p.latestOk += a.correct ? 1 : -1; k.lastOk = !!a.correct; }
      if (p.profDay && !p.recalled && a.correct && d > p.profDay) { p.recalled = true; p.recalledDay = d; }
      var now = p.okKeys >= PROF.minKeys && p.latestOk / p.nKeys >= PROF.minAcc;
      if (now && !p.profDay) p.profDay = d;
      p.proficient = now;
    });
    Object.keys(rv).forEach(function (k) { var r = rv[k], lo = keyLo[k]; if (lo && per[lo] && r && r.due && r.due <= today) per[lo].reviewDue = true; });
    LOS.forEach(function (l) {
      var p = per[l.id];
      p.status = !p.attempted ? 'new' : p.reviewDue ? 'due' : p.proficient ? 'prof' : 'practice';
      p.thin = p.attempted && p.okKeys < PROF.minKeys;
    });
    return per;
  }
  var STATUS = { new: 'Not started', practice: 'Needs practice', prof: 'Proficient', due: 'Review due' };
  // Module 9 has no objectives of its own: integrated-case items, counted per distinct item.
  function caseStatus() {
    var items = MCQ.filter(function (q) { return q.m === COURSE && moduleOf(q) === 9; }), keys = {};
    items.forEach(function (q) { keys[(typeof mcqKey === 'function') ? mcqKey(q) : (q.g || q.q)] = { n: 0, ok: false, okDay: null, recalled: false }; });
    (S.attempts || []).filter(function (a) { return a.mod === COURSE && a.questionKey && keys[a.questionKey]; }).sort(function (a, b) { return (a.ts || 0) - (b.ts || 0); }).forEach(function (a) {
      var k = keys[a.questionKey], d = localDay(a.ts); k.n++;
      if (a.correct) { if (k.okDay && d > k.okDay) k.recalled = true; if (!k.okDay) k.okDay = d; }
      k.ok = !!a.correct;
    });
    var v = Object.keys(keys).map(function (x) { return keys[x]; });
    return { total: v.length, attempted: v.filter(function (k) { return k.n; }).length, ok: v.filter(function (k) { return k.ok; }).length, recalled: v.filter(function (k) { return k.recalled; }).length };
  }
  function moduleCounts(ls, m) {
    if (m === 9) { var c = caseStatus(); return { total: c.total, attempted: c.attempted, prof: c.ok, recalled: c.recalled, unit: 'case items' }; }
    var los = LOS.filter(function (l) { return l.mod === m; });
    return { total: los.length, attempted: los.filter(function (l) { return ls[l.id].attempted; }).length, prof: los.filter(function (l) { return ls[l.id].proficient; }).length,
      recalled: los.filter(function (l) { return ls[l.id].recalled; }).length, unit: 'objectives' };
  }
  // Recommendation (never a lock): review due in the recommended module -> not started -> needs practice
  // (lowest share of distinct keys correct) -> anywhere in the course -> Module 9 case.
  function recommend(ls) {
    var cur = currentModule(evidence());
    function pick(list) {
      var due = list.filter(function (l) { return ls[l.id].status === 'due'; })[0]; if (due) return { lo: due, why: 'a review on this objective is due today' };
      var nw = list.filter(function (l) { return ls[l.id].status === 'new'; })[0]; if (nw) return { lo: nw, why: 'not started yet; next in the course order' };
      var pr = list.filter(function (l) { return ls[l.id].status === 'practice'; }).sort(function (a, b) { return ls[a.id].latestOk / ls[a.id].nKeys - ls[b.id].latestOk / ls[b.id].nKeys; })[0];
      if (pr) { var e = ls[pr.id]; return { lo: pr, why: e.thin ? 'only ' + e.okKeys + ' question' + (e.okKeys === 1 ? '' : 's') + ' answered correctly so far; proficiency needs ' + PROF.minKeys : e.latestOk + ' of ' + e.nKeys + ' questions right on the latest try' }; }
      return null;
    }
    var r = pick(LOS.filter(function (l) { return l.mod === cur; })) || pick(LOS);
    if (r) { r.mod = r.lo.mod; return r; }
    return { lo: null, mod: 9, why: 'every objective is proficient; work the integrated case' };
  }
  var SEL_KEY = 'cfp:fp513-sel', sel = null, navOpen = false;
  try { sel = JSON.parse(localStorage.getItem(SEL_KEY) || 'null'); } catch (e) {}
  function setSel(v) { sel = v; try { if (v) localStorage.setItem(SEL_KEY, JSON.stringify(v)); else localStorage.removeItem(SEL_KEY); } catch (e) {} }
  function loById(id) { return LOS.filter(function (l) { return l.id === id; })[0] || null; }
  function calcLo(id) {
    return (window.FP513CALC ? window.FP513CALC.drills.some(function (d) { return d.lo === id; }) : false) || (loQs[id] || []).some(function (q) { return q.g; });
  }
  // What the dashboard shows: the user's pick (module and/or objective) or the recommendation.
  function focusNow(ls) {
    var rec = recommend(ls), lo = null, mod = rec.mod, why = rec.why, picked = false;
    if (sel && sel.lo && loById(sel.lo)) { lo = loById(sel.lo); mod = lo.mod; picked = true; why = 'you picked this objective'; }
    else if (sel && sel.mod >= 1 && sel.mod <= 9) {
      mod = +sel.mod; picked = true;
      if (mod === rec.mod) lo = rec.lo;
      else { var mr = LOS.filter(function (l) { return l.mod === mod; }); lo = mr.filter(function (l) { return ls[l.id].status === 'due'; })[0] || mr.filter(function (l) { return ls[l.id].status === 'new'; })[0] || mr.filter(function (l) { return ls[l.id].status === 'practice'; })[0] || mr[0] || null; why = 'first open objective in the module you picked'; }
    } else lo = rec.lo;
    return { mod: mod, lo: lo, why: why, picked: picked, rec: rec };
  }
  function shortTitle(t) { return t.length > 64 ? t.slice(0, 61).replace(/\s+\S*$/, '') + '…' : t; }

  // ---------- Today: FP513 Learning Command Center ----------
  function hostEl(id, before) {
    var h = $(id); if (h) return h;
    var anchor = $(before); if (!anchor) return null;
    h = document.createElement('div'); h.id = id; anchor.insertAdjacentElement('beforebegin', h); return h;
  }
  function todayCard() {
    var host = hostEl('fp513Today', 'coachHome'); if (!host) return;
    var detail = hostEl('fp513Detail', 'coachHome');
    var ev = evidence(), mods = moduleSummary(ev), ls = loStatus(), dr = dueReviews(), fx = focusNow(ls), cnt = moduleCounts(ls, fx.mod);
    cacheWeak(ev, mods);
    var passed = S.coursePassed && S.coursePassed[COURSE], due = (S.courseDue && S.courseDue[COURSE]) || DEADLINE, left = daysBetween(localDay(), due);
    var exam = S.examDate ? daysBetween(localDay(), S.examDate) : null;
    var start = startDay(), week = Math.max(1, Math.floor(daysBetween(start, localDay()) / 7) + 1);
    var plan = PACE.map(function (p, i) {
      var w0 = i * 2 + 1, w1 = p.mods[0] === 9 ? 9 : w0 + 1, a = addDays(start, (w0 - 1) * 7), b = addDays(start, w1 * 7 - 1), on = week >= w0 && week <= w1;
      var done = p.mods.every(function (m) { return m === 9 ? mods[9].n > 0 : mods[m].tested === mods[m].los; });
      return '<div class="fp5-pace' + (on ? ' on' : '') + '"><b>Wk ' + p.weeks + '</b><span>' + p.mods.map(function (m) { return 'M' + m; }).join(' + ') + '</span><span class="small muted">' + a.slice(5) + ' → ' + b.slice(5) + '</span>' + (done ? '<span class="fp5-ok">✓</span>' : '') + '</div>';
    }).join('') + '<div class="fp5-pace' + (week > 9 ? ' on' : '') + '"><b>Wk 10+</b><span>Weak-topic repair · Kaplan quizzes/QBank · final prep</span><span class="small muted">to ' + due.slice(5) + '</span></div>';
    var lo = fx.lo, e = lo ? ls[lo.id] : null, mUnit = fx.mod === 9 ? 'case items' : 'objectives';
    function metric(key, label, val, tip) {
      return '<button type="button" class="fp5-metric" data-fp5ev="' + key + '" title="' + esc(tip) + '"><b>' + val + '/' + cnt.total + '</b><span>' + label + '</span></button>';
    }
    var metrics = '<div class="fp5-metrics" aria-label="Module ' + fx.mod + ' evidence">' +
      metric('attempted', 'Attempted', cnt.attempted, fx.mod === 9 ? 'Case items answered at least once' : 'Objectives with at least one answer (questions, coach or calc; flashcards do not count)') +
      metric('prof', 'Proficient', cnt.prof, fx.mod === 9 ? 'Case items whose latest answer is correct' : 'Correct on ' + PROF.minKeys + '+ different questions and ' + Math.round(PROF.minAcc * 100) + '%+ of latest answers right. A practice heuristic, not a pass probability.') +
      metric('recalled', 'Recalled later', cnt.recalled, fx.mod === 9 ? 'Case items answered correctly again on a later day' : 'Correct again on a later day than it first became proficient') + '</div>';
    var obj;
    if (lo) {
      obj = '<div class="fp5-obj"><div class="fp5-obj-top"><span class="tag">' + lo.id + '</span><span class="fp5-st fp5-st-' + e.status + '">' + STATUS[e.status] + '</span></div>' +
        '<div class="fp5-next fp5-obj-title">' + esc(shortTitle(lo.text)) + '</div>' +
        '<div class="small muted fp5-obj-meta">Module ' + lo.mod + ' · book p. ' + lo.page + ' · ' + esc(fx.why) + '</div></div>';
    } else {
      var cs = caseStatus();
      obj = '<div class="fp5-obj"><div class="fp5-obj-top"><span class="tag">M9</span><span class="fp5-st fp5-st-' + (cs.attempted ? 'practice' : 'new') + '">' + (cs.attempted ? cs.attempted + '/' + cs.total + ' case items' : 'Not started') + '</span></div>' +
        '<div class="fp5-next fp5-obj-title">Integrated case (Calloway family)</div><div class="small muted fp5-obj-meta">' + esc(fx.why) + '</div></div>';
    }
    var hasCalc = lo ? calcLo(lo.id) : false, practiceLabel = lo ? '🎯 Practice ' + lo.id.replace('LO ', '') : '🎯 Practice M9';
    var links = '<div class="fp5-actions"><button class="btn fp5-go" data-fp5="continue">Continue learning →</button>' +
      '<div class="fp5-links"><button class="btn gray sm" data-fp5="read">📖 Read</button><button class="btn gray sm" data-fp5="practice">' + practiceLabel + '</button>' +
      (hasCalc ? '<button class="btn gray sm" data-fp5="calc">🧮 Calc</button>' : '') + '<button class="btn gray sm" data-fp5="hub">Module hub</button></div></div>';
    // Objective navigator: collapsed summary, one tap to a module, one more to an objective. Never locked.
    var all = { a: 0, p: 0 }; LOS.forEach(function (l) { if (ls[l.id].attempted) all.a++; if (ls[l.id].proficient) all.p++; });
    var chips = '';
    for (var m = 1; m <= 9; m++) {
      var mc = moduleCounts(ls, m);
      chips += '<button type="button" class="fp5-mchip' + (m === fx.mod ? ' on' : '') + '" data-fp5mod="' + m + '" title="' + esc(modName(m)) + '"><b>M' + m + '</b><span>' + (m === 9 ? (mc.attempted ? mc.attempted + '/' + mc.total : 'case') : mc.prof + '/' + mc.total) + '</span></button>';
    }
    var loRows = fx.mod === 9 ? '<div class="small muted" style="padding:6px 2px">Module 9 is the integrated case: no objectives of its own. Progress = case items (' + caseStatus().attempted + '/' + caseStatus().total + ' answered).</div>' :
      LOS.filter(function (l) { return l.mod === fx.mod; }).map(function (l) {
        var x = ls[l.id];
        return '<button type="button" class="fp5-lo' + (lo && lo.id === l.id ? ' on' : '') + '" data-fp5lo="' + l.id + '"><span class="fp5-dot fp5-st-' + x.status + '" aria-hidden="true"></span><span class="fp5-lo-id">' + l.id.replace('LO ', '') + '</span><span class="fp5-lo-t">' + esc(l.text) + '</span><span class="fp5-lo-s">' + STATUS[x.status] + '</span></button>';
      }).join('');
    var nav = '<details class="fp5-nav"' + (navOpen || document.documentElement.getAttribute('data-duo-pose') === 'book' ? ' open' : '') + '><summary><span>Objectives · M1–M9</span><span class="small muted">' + all.p + '/48 proficient · ' + all.a + '/48 attempted</span></summary>' +
      '<div class="fp5-mchips">' + chips + '</div><div class="small fp5-modname"><b>Module ' + fx.mod + '</b> · ' + esc(modName(fx.mod)) + (fx.picked ? ' <button type="button" class="fp5-reset" data-fp5="reset">Back to recommended</button>' : '') + '</div>' +
      '<div class="fp5-los">' + loRows + '</div></details>';
    var kap = '<div class="fp5-days" title="Kaplan course access ends ' + due + '; separate from your CFP exam date"><b>' + (passed ? '✓' : (left >= 0 ? left : 0)) + '</b><span>' + (passed ? 'passed' : 'days of Kaplan access') + '</span></div>';
    var cfp = '<div class="fp5-days fp5-exam" title="' + (S.examDate ? 'CFP exam date you set: ' + S.examDate : 'Set your CFP exam date in the schedule below') + '"><b>' + (exam == null ? '—' : Math.max(exam, 0)) + '</b><span>' + (exam == null ? 'CFP exam date not set' : 'days to CFP exam') + '</span></div>';
    host.innerHTML = '<div class="card fp5-card">' +
      '<div class="fp5-head"><div style="min-width:0"><h2 class="fp5-title">FP513 · Investment Planning</h2>' +
      '<div class="fp5-mod small"><b>Module ' + fx.mod + '</b> — ' + esc(modName(fx.mod)) + (lo ? ' · next <b>' + lo.id + '</b>' : '') + '</div></div>' +
      '<div class="fp5-countdowns">' + kap + cfp + '</div></div>' +
      metrics + obj + links + nav +
      '<div class="fp5-foot small muted"><span>' + dr.fp513 + ' FP513 review' + (dr.fp513 === 1 ? '' : 's') + ' due' + (dr.all > dr.fp513 ? ' · ' + (dr.all - dr.fp513) + ' older-course reviews wait in Mixed review' : '') + '</span></div>' +
      '<details class="fp5-details"><summary>Suggested pace · week ' + Math.min(week, 10) + ' (adjustable, nothing is locked)</summary><div class="fp5-paces">' + plan + '</div>' +
        '<label class="small">Plan start <input type="date" id="fp5Start" value="' + start + '"></label> ' +
        '<div class="small muted" style="margin-top:6px">Deadline ' + due + (due === DEADLINE ? ' — verified: ' + esc(DEADLINE_SRC) : ' — your own date.') + ' Edit it in the course schedule below.</div></details>' +
      '<details class="fp5-details"><summary>How progress is measured</summary><div class="small muted">Counts come only from questions you answered (coach, quizzes, forms, calc drills). Every number variant of the same calculation counts as one question. <b>Proficient</b> = right on ' + PROF.minKeys + '+ different questions and ' + Math.round(PROF.minAcc * 100) + '%+ of your latest answers right. <b>Recalled later</b> = right again on a later day. Reading and flashcards never count. These are practice evidence, not a pass probability.</div></details>' +
      '</div>';
    // Book-view right page: selected objective detail (static markup from data; never a clone of live DOM).
    if (detail) {
      var dt = '';
      if (lo) {
        var qn = (loQs[lo.id] || []).length;
        dt = '<div class="card fp5-detail-card"><div class="small muted">Selected objective · Module ' + lo.mod + ' · ' + esc(modName(lo.mod)) + '</div>' +
          '<h2 style="margin:4px 0 6px"><span class="tag">' + lo.id + '</span> ' + esc(lo.text) + '</h2>' +
          '<div class="fp5-obj-top"><span class="fp5-st fp5-st-' + e.status + '">' + STATUS[e.status] + '</span><span class="small muted">book p. ' + lo.page + '</span></div>' +
          '<div class="small" style="margin:8px 0">Why this one: ' + esc(fx.why) + '.</div>' +
          '<div class="fp5-ev"><div><b>' + e.n + '</b><span>answers</span></div><div><b>' + e.okKeys + '/' + e.nKeys + '</b><span>questions right at least once</span></div><div><b>' + (e.nKeys ? e.latestOk + '/' + e.nKeys : '—') + '</b><span>right on latest try</span></div><div><b>' + qn + '</b><span>questions in the bank</span></div></div>' +
          (e.thin ? '<div class="small muted" style="margin-top:6px">Not enough evidence yet: proficiency needs ' + PROF.minKeys + ' different questions answered correctly.</div>' : '') +
          (e.profDay ? '<div class="small muted" style="margin-top:6px">Proficient since ' + e.profDay + (e.recalled ? ' · recalled ' + e.recalledDay : ' · not yet recalled on a later day') + '</div>' : '') +
          '<div class="fp5-links" style="margin-top:10px"><button class="btn gray sm" data-fp5="read">📖 Read ' + lo.id.replace('LO ', '') + '</button><button class="btn gray sm" data-fp5="practice">' + practiceLabel + '</button>' + (hasCalc ? '<button class="btn gray sm" data-fp5="calc">🧮 Calc</button>' : '') + '<button class="btn gray sm" data-fp5="hub">Module hub</button></div></div>';
      } else {
        var c9 = caseStatus();
        dt = '<div class="card fp5-detail-card"><div class="small muted">Module 9 · ' + esc(modName(9)) + '</div><h2 style="margin:4px 0 6px">Integrated case</h2><div class="fp5-ev"><div><b>' + c9.attempted + '/' + c9.total + '</b><span>answered</span></div><div><b>' + c9.ok + '/' + c9.total + '</b><span>right on latest try</span></div><div><b>' + c9.recalled + '/' + c9.total + '</b><span>recalled later</span></div></div>' +
          '<div class="fp5-links" style="margin-top:10px"><button class="btn gray sm" data-fp5="practice">' + practiceLabel + '</button><button class="btn gray sm" data-fp5="hub">Module hub</button></div></div>';
      }
      detail.innerHTML = dt;
    }
    var s = $('fp5Start'); if (s) s.onchange = function () { if (s.value) { st().start = s.value; save(); todayCard(); } };
    [host, detail].forEach(function (h) {
      if (!h) return;
      h.querySelectorAll('[data-fp5]').forEach(function (b) { b.onclick = function () { act(b.getAttribute('data-fp5'), fx); }; });
      h.querySelectorAll('[data-fp5mod]').forEach(function (b) { b.onclick = function () { navOpen = true; setSel({ mod: +b.getAttribute('data-fp5mod') }); todayCard(); }; });
      h.querySelectorAll('[data-fp5lo]').forEach(function (b) { b.onclick = function () { navOpen = true; setSel({ lo: b.getAttribute('data-fp5lo') }); todayCard(); }; });
      h.querySelectorAll('[data-fp5ev]').forEach(function (b) { b.onclick = function () { showEvidence(fx.mod, b.getAttribute('data-fp5ev')); }; });
    });
    var nd = host.querySelector('.fp5-nav'); if (nd) nd.addEventListener('toggle', function () { navOpen = nd.open; });
  }
  // Reader deep link: the objective's anchor (id="lo-x.y.z" in apps/fp513-reading.html), else the module tab.
  function readUrl(fx) {
    var tab = ((window.TAB_MAP || {})[COURSE] || {})[fx.mod];
    return 'apps/fp513-reading.html' + (fx.lo ? '#lo-' + fx.lo.id.replace('LO ', '') : (tab ? '#' + tab : ''));
  }
  function act(what, fx) {
    var lo = fx.lo, mod = fx.mod;
    if (what === 'continue') {
      if (window.CFPCoach && window.CFPCoach.launch) window.CFPCoach.launch((S.coach && S.coach.settings && S.coach.settings.minutes) || 10, null, { course: COURSE, mod: mod, name: modName(mod), lo: lo ? lo.id : null });
      else if (typeof studyScoped === 'function') studyScoped(COURSE, mod, 'quiz');
    } else if (what === 'read') {
      location.href = readUrl(fx);
    } else if (what === 'practice') {
      var pool = lo ? (loQs[lo.id] || []) : MCQ.filter(function (q) { return q.m === COURSE && moduleOf(q) === 9; });
      if (!pool.length || typeof mcqRunner !== 'function') { if (typeof studyScoped === 'function') studyScoped(COURSE, mod, 'quiz'); return; }
      if (typeof go === 'function') go('study'); if (typeof studyFocus === 'function') studyFocus(true);
      mcqRunner(pool, (lo ? lo.id : 'Module 9') + ' practice', { header: '<b>' + (lo ? esc(lo.id) + ' · ' + esc(lo.text) : 'Module 9 · Integrated case') + '</b> <span class="small muted">· ' + pool.length + ' questions, instant feedback</span>' });
    } else if (what === 'calc') { if (typeof studyScoped === 'function') studyScoped(COURSE, mod, 'calc'); }
    else if (what === 'hub') { if (typeof openModule === 'function') openModule(COURSE, mod); }
    else if (what === 'reset') { setSel(null); todayCard(); }
  }
  // Tapping a metric opens the existing Analytics tab filtered to that module's objective evidence.
  var evFilter = null;
  function showEvidence(mod, metric) {
    evFilter = { mod: mod, metric: metric };
    if (typeof go === 'function') go('analytics');
    setTimeout(function () { var t = $('fp5Evidence'); if (t && t.scrollIntoView) t.scrollIntoView({ block: 'start' }); }, 0);
  }
  function evidenceTable(ls) {
    var mod = (evFilter && evFilter.mod) || focusNow(ls).mod, metric = evFilter && evFilter.metric;
    var chips = ''; for (var m = 1; m <= 9; m++) chips += '<button type="button" class="fp5-mchip' + (m === mod ? ' on' : '') + '" data-fp5evmod="' + m + '"><b>M' + m + '</b></button>';
    var col = function (k) { return metric === k ? ' class="fp5-hl"' : ''; };
    var body;
    if (mod === 9) { var c = caseStatus(); body = '<div class="small" style="margin-top:8px">Integrated case: <b>' + c.attempted + '/' + c.total + '</b> attempted · <b>' + c.ok + '/' + c.total + '</b> right on latest try · <b>' + c.recalled + '/' + c.total + '</b> recalled later.</div>'; }
    else body = '<div class="fp5-tablewrap"><table class="fp5-table"><thead><tr><th>Objective</th><th' + col('attempted') + '>Attempted</th><th' + col('prof') + '>Proficient</th><th' + col('recalled') + '>Recalled later</th><th>Status</th></tr></thead><tbody>' +
      LOS.filter(function (l) { return l.mod === mod; }).map(function (l) { var x = ls[l.id];
        return '<tr><td><span class="tag">' + l.id + '</span> <span class="small">' + esc(l.text) + '</span></td><td data-l="Attempted"' + col('attempted') + '>' + (x.attempted ? x.n + ' ans · ' + x.nKeys + ' q' : '—') + '</td><td data-l="Proficient"' + col('prof') + '>' + (x.proficient ? '✓ ' + x.okKeys + ' q right' : (x.thin ? 'not enough evidence' : (x.attempted ? x.latestOk + '/' + x.nKeys + ' latest' : '—'))) + '</td><td data-l="Recalled later"' + col('recalled') + '>' + (x.recalled ? '✓ ' + x.recalledDay : '—') + '</td><td data-l="Status">' + STATUS[x.status] + '</td></tr>'; }).join('') + '</tbody></table></div>';
    return '<div id="fp5Evidence" style="margin-top:12px"><h3>Objective evidence · Module ' + mod + '</h3><div class="fp5-mchips">' + chips + '</div>' + body + '</div>';
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
      '<details class="fp5-details"><summary>How these are measured</summary><div class="small muted">First-try accuracy = the first answer to each distinct question. Recalled later = an objective answered correctly on a later day than an earlier attempt (same-day corrections are tracked but not counted). Calc proficiency = calculator drills + generated math questions. Checkpoint = your latest Module Hub exam. Flashcard exposure is not counted as mastery. Objective evidence: Proficient = right on ' + PROF.minKeys + '+ different questions with ' + Math.round(PROF.minAcc * 100) + '%+ of latest answers right; number variants of one calculation are one question; Recalled later = right again on a later day than it became proficient.</div></details>' +
      evidenceTable(loStatus()) +
      '<h3 style="margin-top:12px">Weak objectives</h3>' + weakHtml +
      (forms ? '<h3 style="margin-top:12px">Cumulative practice forms</h3><div>' + forms + '</div>' : '') +
      '<h3 style="margin-top:12px">Full CFP® blueprint — course material loaded</h3><div>' + dom + '</div><div class="small muted" style="margin-top:4px">' + loaded + '% of the exam blueprint has course material in the app. Domain weights per CFP Board 2021 Principal Knowledge Topics (Investment Planning 17% of the exam, not of each session).</div>' +
      '<h3 style="margin-top:12px">Kaplan official results (manual entry)</h3><div class="small muted" style="margin-bottom:6px">Typed by you from Kaplan. The app has no Kaplan connection and keeps these separate from app-made practice.</div>' + off +
      '<div class="row" style="flex-wrap:wrap;gap:6px;margin-top:8px"><input type="date" id="fp5OffDate" value="' + localDay() + '"><select id="fp5OffKind"><option>Module 1 quiz</option><option>Module 2 quiz</option><option>Module 3 quiz</option><option>Module 4 quiz</option><option>Module 5 quiz</option><option>Module 6 quiz</option><option>Module 7 quiz</option><option>Module 8 quiz</option><option>Module 9 quiz</option><option>Final exam</option><option>QBank set</option><option>Practice exam</option></select>' +
      '<input type="number" id="fp5OffScore" min="0" max="100" placeholder="Score %" style="width:90px"><input type="text" id="fp5OffWeak" placeholder="Weak topics (optional)"><button class="btn sm" id="fp5OffAdd">Add</button></div></div>';
    host.querySelectorAll('[data-fp5evmod]').forEach(function (b) { b.onclick = function () { evFilter = { mod: +b.getAttribute('data-fp5evmod'), metric: evFilter && evFilter.metric }; analyticsPanel(); }; });
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
    s.textContent = '.fp5-card{margin-bottom:12px;border-left:4px solid #8a5cd6}.fp5-head{display:grid;grid-template-columns:1fr auto;gap:10px;align-items:center}.fp5-days{text-align:center;background:rgba(138,92,214,.1);border-radius:12px;padding:6px 10px;min-width:64px;max-width:108px}.fp5-days span{display:block;line-height:1.25}.fp5-days b{display:block;font-size:22px;line-height:1.1;color:#8a5cd6}.fp5-days span{font-size:11px;color:var(--muted)}.fp5-mod{margin-top:6px}.fp5-next{margin-top:4px;font-size:13px;line-height:1.45}' +
      '.fp5-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:8px}.fp5-stats div{background:rgba(138,92,214,.08);border-radius:10px;padding:8px;min-width:0}.fp5-stats b{display:block;font-size:17px}.fp5-stats span{font-size:11px;color:var(--muted)}' +
      '.fp5-details{margin-top:8px}.fp5-details summary{cursor:pointer;font-weight:700;font-size:13px}.fp5-paces{display:grid;gap:6px;margin:8px 0}.fp5-pace{display:grid;grid-template-columns:62px 1fr auto auto;gap:8px;align-items:center;font-size:13px;padding:6px 8px;border-radius:8px;background:rgba(0,0,0,.03)}.fp5-pace.on{background:rgba(138,92,214,.14);font-weight:600}.fp5-ok{color:var(--good)}' +
      '.fp5-tablewrap{overflow-x:auto;-webkit-overflow-scrolling:touch;max-width:100%}.fp5-table{width:100%;border-collapse:collapse;font-size:12.5px}.fp5-table th,.fp5-table td{padding:5px 6px;border-bottom:1px solid var(--line);text-align:left;vertical-align:top}.fp5-table th{font-size:11px;color:var(--muted);font-weight:700}' +
      '.fp5-weak,.fp5-off{padding:5px 0;border-bottom:1px solid var(--line);font-size:13px}' +
      '#fp513Analytics input,#fp513Analytics select{max-width:100%;min-width:0}' +
      '@media(max-width:560px){.fp5-pace{grid-template-columns:52px 1fr;}.fp5-pace .small{grid-column:2}.fp5-table thead{display:none}.fp5-table tr{display:block;padding:6px 0;border-bottom:1px solid var(--line)}.fp5-table td{display:inline-block;border:0;padding:2px 8px 2px 0}.fp5-table td:first-child{display:block}.fp5-table td[data-l]::before{content:attr(data-l) ": ";color:var(--muted);font-size:11px}}' +
      '.fp5-title{margin:0;font-size:19px;line-height:1.2}.fp5-head .fp5-mod{margin-top:2px}.fp5-countdowns{display:flex;gap:6px}.fp5-exam{background:rgba(0,0,0,.05)}.fp5-exam b{color:var(--ink,inherit)}' +
      '.fp5-metrics{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:10px}.fp5-metric{all:unset;box-sizing:border-box;cursor:pointer;min-height:56px;min-width:0;background:rgba(138,92,214,.08);border-radius:10px;padding:8px;display:flex;flex-direction:column;justify-content:center}.fp5-metric b{font-size:19px;line-height:1.1}.fp5-metric span{font-size:11.5px;color:var(--muted)}.fp5-metric:focus-visible{outline:2px solid #8a5cd6}' +
      '.fp5-obj{margin-top:10px;padding:10px;border-radius:10px;border:1px solid var(--line)}.fp5-obj-top{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.fp5-obj-title{font-weight:600;font-size:14px}.fp5-st{font-size:11.5px;font-weight:700;padding:2px 8px;border-radius:99px;background:rgba(0,0,0,.06)}.fp5-st-prof{background:rgba(31,122,77,.14);color:var(--good)}.fp5-st-due{background:rgba(176,115,31,.16);color:#9a6316}.fp5-st-practice{background:rgba(138,92,214,.14);color:#7448c0}' +
      '.fp5-actions{display:flex;flex-direction:column;gap:8px;margin-top:10px}.fp5-go{min-height:44px;width:100%;font-size:15px}.fp5-links{display:flex;flex-wrap:wrap;gap:6px}.fp5-links .btn{min-height:44px}' +
      '.fp5-nav{margin-top:10px;border-top:1px solid var(--line);padding-top:6px}.fp5-nav>summary{cursor:pointer;display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;align-items:center;min-height:44px;font-weight:700;font-size:13px}.fp5-mchips{display:grid;grid-template-columns:repeat(9,minmax(0,1fr));gap:4px;margin:6px 0}.fp5-mchip{all:unset;box-sizing:border-box;cursor:pointer;min-height:44px;min-width:0;border-radius:8px;background:rgba(0,0,0,.04);display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:12px}.fp5-mchip span{font-size:10px;color:var(--muted)}.fp5-mchip.on{background:rgba(138,92,214,.18);outline:1px solid #8a5cd6}' +
      '.fp5-modname{margin:4px 0}.fp5-reset{all:unset;cursor:pointer;color:#7448c0;text-decoration:underline;margin-left:6px;padding:8px 0}.fp5-los{display:grid;gap:4px}.fp5-lo{all:unset;box-sizing:border-box;cursor:pointer;min-height:44px;display:grid;grid-template-columns:10px 38px minmax(0,1fr) auto;gap:6px;align-items:center;padding:4px 6px;border-radius:8px;font-size:12.5px}.fp5-lo.on{background:rgba(138,92,214,.12)}.fp5-lo-t{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.fp5-lo-s{font-size:11px;color:var(--muted)}.fp5-dot{width:9px;height:9px;border-radius:50%;padding:0;background:#c9c3b8}.fp5-dot.fp5-st-prof{background:var(--good)}.fp5-dot.fp5-st-due{background:#c98a2b}.fp5-dot.fp5-st-practice{background:#8a5cd6}' +
      '.fp5-foot{margin-top:8px}#fp513Detail{display:none}.fp5-ev{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.fp5-ev div{background:rgba(138,92,214,.08);border-radius:10px;padding:8px;min-width:0}.fp5-ev b{display:block;font-size:17px}.fp5-ev span{font-size:11px;color:var(--muted)}.fp5-hl{background:rgba(138,92,214,.12)}' +
      '@media(max-width:520px){.fp5-head{grid-template-columns:1fr;gap:6px}.fp5-countdowns{justify-content:flex-start;flex-wrap:wrap}.fp5-countdowns .fp5-days{display:flex;align-items:baseline;gap:5px;max-width:none;min-width:0;padding:4px 10px;text-align:left}.fp5-countdowns .fp5-days b{font-size:16px}}' +
      '@media(max-width:380px){.fp5-lo{grid-template-columns:10px 34px minmax(0,1fr)}.fp5-lo-s{display:none}.fp5-mchip span{display:none}}' +
      'html[data-theme="dark"] .fp5-metric,html[data-theme="dark"] .fp5-ev div{background:rgba(160,120,230,.16)}html[data-theme="dark"] .fp5-mchip,html[data-theme="dark"] .fp5-exam,html[data-theme="dark"] .fp5-st{background:rgba(255,255,255,.07)}html[data-theme="dark"] .fp5-st-practice,html[data-theme="dark"] .fp5-reset{color:#c4a6f2}html[data-theme="dark"] .fp5-st-due{color:#e3b067}html[data-theme="dark"] .fp5-st-prof{color:#7fd1a3}html[data-theme="dark"] .fp5-dot{background:#5d574e}' +
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
    prioritize: prioritize, retentionPick: retentionPick, runForm: runForm, buildForm: buildForm, diagnostics: diagnostics, todayCard: todayCard, analyticsPanel: analyticsPanel, reindex: indexItems,
    PROF: PROF, loStatus: loStatus, caseStatus: caseStatus, moduleCounts: moduleCounts, recommend: recommend, focusNow: focusNow, readUrl: function () { return readUrl(focusNow(loStatus())); }, select: function (v) { setSel(v); todayCard(); }, showEvidence: showEvidence };
})();

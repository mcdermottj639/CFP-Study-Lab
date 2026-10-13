/* CFP learning coach: pure scheduling, progress and merge helpers. */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.CFPCoachCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  function day(value) {
    var d = value == null ? new Date() : new Date(value);
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function date(s) { return new Date(s + 'T12:00:00'); }
  function addDay(s, n) { var d = date(s); d.setDate(d.getDate() + n); return day(d); }
  function week(s) { var d = date(s || day()); return addDay(day(d), -((d.getDay() + 6) % 7)); }
  function gap(a, b) { return Math.round((date(b) - date(a)) / 86400000); }
  function key(q) { return q.g || q.q; }
  function id(prefix) { return (prefix || 'e') + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10); }
  function blank() {
    return { version: 1, settings: { minutes: 10, shortGoal: 4, caseGoal: 1, reminderDays: [1, 2, 4, 5], reminderTime: '19:00', reminders: true, updatedAt: 0 }, completed: {}, reviews: {}, time: {}, active: null, activeUpdatedAt: 0, nudges: {}, seeded: false };
  }
  function normalize(v) {
    var b = blank(), x = v || {};
    Object.keys(b).forEach(function (k) { if (x[k] != null) b[k] = x[k]; });
    b.settings = Object.assign({}, blank().settings, x.settings || {});
    return b;
  }
  function merge(a, b) {
    if (!a && !b) return undefined;
    var x = normalize(a), y = normalize(b), out = normalize(JSON.parse(JSON.stringify(x)));
    if (y.settings.updatedAt > x.settings.updatedAt) out.settings = y.settings;
    ['completed', 'reviews', 'nudges'].forEach(function (k) {
      Object.keys(y[k]).forEach(function (id) { if (!out[k][id] || (y[k][id].at || 0) > (out[k][id].at || 0)) out[k][id] = y[k][id]; });
    });
    Object.keys(y.time).forEach(function (id) { if (!out.time[id] || y.time[id].ms > out.time[id].ms) out.time[id] = y.time[id]; });
    if (y.activeUpdatedAt > x.activeUpdatedAt) { out.active = y.active; out.activeUpdatedAt = y.activeUpdatedAt; }
    out.seeded = x.seeded || y.seeded;
    return out;
  }
  function schedule(prior, q, correct, now) {
    now = now || Date.now();
    var today = day(now), old = prior || {}, elapsed = old.lastDay ? gap(old.lastDay, today) : 0;
    // Same-day retries repair understanding but never count as retained knowledge.
    var delayed = !!(correct && old.lastDay && elapsed >= 1);
    var step = correct ? (delayed ? Math.min(4, (old.step || 0) + 1) : (old.step || 0)) : 0;
    return { qKey: key(q), course: q.m, domain: q.d, topic: q.t, step: step,
      due: addDay(today, correct ? [1, 3, 7, 14, 30][step] : 1), lastDay: today, at: now,
      wrong: (old.wrong || 0) + (correct ? 0 : 1), checks: (old.checks || 0) + (delayed ? 1 : 0),
      retained: delayed ? true : (correct ? !!old.retained : false) };
  }
  function rankQuestions(pool, coach, attempts, now) {
    var today = day(now), reviews = coach.reviews || {}, seen = {}, stats = {};
    (attempts || []).forEach(function (a) {
      if (a.src === 'card') return;
      var tk = a.mod + '|' + a.topic;
      stats[tk] = stats[tk] || { n: 0, wrong: 0 };
      stats[tk].n++; if (!a.correct) stats[tk].wrong++;
      if (a.questionKey) seen[a.questionKey] = true;
    });
    var unique = {};
    return pool.filter(function (q) { var k = key(q); if (unique[k]) return false; unique[k] = true; return true; }).map(function (q, i) {
      var r = reviews[key(q)], st = stats[q.m + '|' + q.t], score = 0;
      if (r && r.due <= today) score += 100 + Math.min(20, gap(r.due, today));
      if (r && !r.retained) score += 20;
      if (st) score += 15 * st.wrong / st.n;
      if (!seen[key(q)]) score += 10;
      // Deterministic daily tie-break avoids serving the same few items every day.
      var h = 0; (today + key(q)).split('').forEach(function (c) { h = ((h << 5) - h + c.charCodeAt(0)) | 0; });
      return { q: q, score: score + (Math.abs(h) % 100) / 100, order: i };
    }).sort(function (a, b) { return b.score - a.score || a.order - b.order; }).map(function (x) { return x.q; });
  }
  function stats(coach, attempts, today) {
    today = today || day(); var start = week(today), prev = addDay(start, -7), end = addDay(start, 7);
    var done = Object.values(coach.completed || {}), current = done.filter(function (x) { return x.day >= start && x.day < end; });
    var earlier = done.filter(function (x) { return x.day >= prev && x.day < start; });
    function days(xs) { return new Set(xs.filter(function (x) { return x.kind !== 'case-only'; }).map(function (x) { return x.day; })).size; }
    var time = Object.values(coach.time || {}), ms = time.filter(function (x) { return x.day >= start && x.day < end; }).reduce(function (n, x) { return n + x.ms; }, 0);
    var priorMs = time.filter(function (x) { return x.day >= prev && x.day < start; }).reduce(function (n, x) { return n + x.ms; }, 0);
    var answers = (attempts || []).filter(function (a) { return a.src !== 'card' && a.questionKey && day(a.ts) >= start && day(a.ts) < end; });
    var distinct = {}; answers.forEach(function (a) { if (!distinct[a.questionKey] || a.ts < distinct[a.questionKey].ts) distinct[a.questionKey] = a; });
    var fresh = Object.values(distinct), reviews = Object.values(coach.reviews || {});
    var allDays = Array.from(new Set(done.map(function (x) { return x.day; }))).sort();
    var last = allDays[allDays.length - 1] || null;
    var wins = {}; done.forEach(function (x) { var w = week(x.day); wins[w] = wins[w] || new Set(); if (x.kind !== 'case-only') wins[w].add(x.day); });
    var goals = coach.settings || blank().settings;
    return { start: start, days: days(current), previousDays: days(earlier), cases: current.filter(function (x) { return x.caseDone; }).length,
      minutes: Math.round(ms / 60000), previousMinutes: Math.round(priorMs / 60000), totalMinutes: Math.round(time.reduce(function (n, x) { return n + x.ms; }, 0) / 60000),
      n: fresh.length, accuracy: fresh.length ? Math.round(100 * fresh.filter(function (x) { return x.correct; }).length / fresh.length) : null,
      due: reviews.filter(function (x) { return x.due <= today; }).length, recovered: reviews.filter(function (x) { return x.wrong && x.retained; }).length,
      best: Math.max(0, ...Object.values(wins).map(function (s) { return s.size; })),
      completedToday: current.some(function (x) { return x.day === today; }), last: last, comeback: !!(last && gap(last, today) >= 3),
      goalMet: days(current) >= goals.shortGoal && current.filter(function (x) { return x.caseDone; }).length >= goals.caseGoal };
  }
  function dueReminder(coach, attempts, now) {
    var d = new Date(now == null ? Date.now() : now), today = day(d), s = coach.settings || blank().settings;
    if (!s.reminders || !(s.reminderDays || []).includes(d.getDay()) || stats(coach, attempts, today).completedToday || coach.nudges[today]) return false;
    return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0') >= s.reminderTime;
  }
  function retention(coach) {
    var rs = Object.values(coach.reviews || {}).filter(function (x) { return x.checks; });
    return { n: rs.length, percent: rs.length ? Math.round(100 * rs.filter(function (x) { return x.retained; }).length / rs.length) : null };
  }
  return { day: day, addDay: addDay, week: week, gap: gap, key: key, id: id, blank: blank, normalize: normalize, merge: merge, schedule: schedule, rankQuestions: rankQuestions, stats: stats, dueReminder: dueReminder, retention: retention };
});

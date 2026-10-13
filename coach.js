/* Guided study UI. All lessons reuse the local, course-grounded content bank. */
(function () {
  'use strict';
  if (typeof S === 'undefined' || !window.CFPCoachCore) return;
  var C = window.CFPCoachCore, cases = window.CFP_CLIENT_CASES || [], clock = null;
  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); };
  var coachRef;
  function state() { if (!S.coach || S.coach !== coachRef) { S.coach = C.normalize(S.coach); coachRef = S.coach; } return S.coach; }
  function commit() { save(); }
  function touch() { state().activeUpdatedAt = Date.now(); commit(); }
  function btn(action, label, extra, primary) { return '<button class="c-btn' + (primary ? ' primary' : '') + '" data-caction="' + action + '" ' + (extra || '') + '>' + label + '</button>'; }
  function moduleName(course, mod) { return (typeof MODMETA !== 'undefined' && MODMETA[course] && MODMETA[course][mod]) || courseName(course); }
  function target() {
    var f = focusTarget();
    if (f && MCQ.some(function (q) { return q.m === f.course; })) return f;
    var course = MODULES.find(function (m) { return m.status === 'current' && MCQ.some(function (q) { return q.m === m.id; }); }) || MODULES.find(function (m) { return MCQ.some(function (q) { return q.m === m.id; }); });
    return course ? { course: course.id, mod: null, name: course.name } : null;
  }
  function reader(course, mod) {
    var url = (window.READER_MAP || {})[course], tab = ((window.TAB_MAP || {})[course] || {})[mod];
    return url ? url + (tab ? '#' + tab : '') : '';
  }
  function source(course, mod, custom) {
    var href = custom || reader(course, mod);
    return '<details class="c-source"><summary>' + esc(course) + ' · course source &amp; year</summary>2026 supplied course material. Some source tables use 2025 figures; alignment to your exam’s tax tables has not been verified.' +
      (href ? '<br><a data-coach-resource href="' + esc(href) + '">Open the course explanation →</a>' : '') + '</details>';
  }
  function links(course, mod) {
    var r = reader(course, mod), ds = ((window.DECKS || {})[course] || {})[mod] || [];
    return '<div class="c-row">' + (r ? '<a class="c-btn" data-coach-resource href="' + esc(r) + '">Reader + Teach mode</a>' : '') +
      (ds[0] ? '<a class="c-btn" data-coach-resource href="' + esc(ds[0].src) + '">Visual lesson</a>' : '') + '</div>';
  }
  function seed() {
    var s = state(); if (s.seeded) return;
    MCQ.forEach(function (q) {
      var k = C.key(q), old = (S.mcqDue || {})[k];
      if (!old) return;
      var misses = (S.misses || []).filter(function (m) { return m.g ? m.g === q.g : m.q === q.q; });
      if (!misses.length) return;
      var m = misses[misses.length - 1];
      s.reviews[k] = { qKey: k, course: q.m, domain: q.d, topic: q.t, due: old.due || C.day(), lastDay: m.ts ? C.day(m.ts) : C.addDay(C.day(), -1), at: m.ts || 0, step: 0, wrong: misses.length, checks: 0, retained: false };
    });
    s.seeded = true; commit();
  }
  function recordReview(q, ok, at) {
    var s = state(), k = C.key(q); s.reviews[k] = C.schedule(s.reviews[k], q, ok, at);
  }
  function freeCredit() {
    var s=state(),today=C.day(),id='free-'+today;
    var n=S.attempts.filter(function(a){return a.src!=='coach'&&a.ts&&C.day(a.ts)===today;}).length;
    if(n>=3&&!s.completed[id])s.completed[id]={id:id,day:today,at:Date.now(),kind:'free-study',questions:n,caseDone:false};
  }
  function chooseCase(f) {
    var relevant = cases.filter(function (c) { return c.course === f.course; });
    if (!relevant.length) relevant = cases.slice();
    var done = Object.values(state().completed), last = {};
    done.forEach(function (d) { if (d.caseId) last[d.caseId] = Math.max(last[d.caseId] || 0, d.at); });
    return relevant.sort(function (a, b) { return (last[a.id] || 0) - (last[b.id] || 0) || (a.mod === f.mod ? -1 : 0) - (b.mod === f.mod ? -1 : 0); })[0];
  }
  function build(minutes, kind, override) {
    var f = override || target(); if (!f) return null;
    var s = state(), scope = MCQ.filter(function (q) { return q.m === f.course && (!f.mod || moduleOf(q) === +f.mod); });
    if (!scope.length) scope = MCQ.filter(function (q) { return q.m === f.course; });
    var ranked = C.rankQuestions(scope, s, S.attempts), allRanked = C.rankQuestions(MCQ, s, S.attempts);
    var n = minutes === 3 ? 3 : minutes === 25 ? 13 : 6, reviewN = minutes === 25 ? 3 : (minutes === 3 ? 1 : 2);
    var used = {}, steps = [], chosen = chooseCase(f);
    function add(q, type) { var k = C.key(q); if (used[k]) return; used[k] = true; steps.push({ type: type, q: mcqFresh(q), originalKey: k, result: null }); }
    if (kind !== 'case-only') {
      allRanked.filter(function (q) { var r = s.reviews[C.key(q)]; return r && r.due <= C.day(); }).slice(0, reviewN).forEach(function (q) { add(q, 'review'); });
      ranked.forEach(function (q) { if (steps.length < n) add(q, steps.length < reviewN ? 'warmup' : 'practice'); });
      if (minutes !== 3 && steps.length) {
        var cds = CARDS.filter(function (c) { return c.m === f.course && (!f.mod || moduleOf(c) === +f.mod); });
        var focusQ = steps[Math.min(reviewN, steps.length - 1)].q;
        var card = cds.find(function (c) { return c.t === focusQ.t; }) || cds[0];
        if (card) steps.splice(Math.min(reviewN, steps.length), 0, { type: 'lesson', course: f.course, mod: f.mod, front: card.f, back: card.b, revealed: false });
      }
    }
    if ((minutes !== 3 || kind === 'case-only') && chosen) steps.push({ type: 'case', caseId: chosen.id, draft: '', checks: [], revealed: false });
    if (!steps.length) return null;
    return { id: C.id('session'), minutes: minutes, kind: kind || 'guided', focus: f, steps: steps, index: 0, started: Date.now(), day: C.day(), paused: false };
  }
  function launch(minutes, kind, override, replace) {
    var s = state();
    if (s.active && !replace) { resume(); toast('Resuming your saved session. Finish it or use Start fresh.'); return; }
    var session = build(minutes, kind, override);
    if (!session) { toast('Add course questions before starting a session.'); return; }
    s.active = session; s.settings.minutes = minutes; s.settings.updatedAt = Date.now(); touch();
    location.hash = 'coach'; go('coach'); render();
  }
  function resume() { if (!state().active) return launch(state().settings.minutes); state().active.paused = false; touch(); location.hash = 'coach'; go('coach'); render(); }
  function pause() { if (state().active) { state().active.paused = true; touch(); } stopClock(); if (window.CFPActivity) CFPActivity.flush(); go('dash'); location.hash = ''; }
  function stopClock() { if (clock) clearInterval(clock); clock = null; }
  function home() {
    var el = $('coachHome'); if (!el) return;
    var s = state(), st = C.stats(s, S.attempts), f = target(), active = s.active, mins = s.settings.minutes;
    var title = active ? 'Pick up where you left off.' : st.comeback ? 'A small session is a good restart.' : st.completedToday ? 'Your practice is in for today.' : 'Make a little progress today.';
    var copy = active ? 'Step ' + Math.min(active.index + 1, active.steps.length) + ' of ' + active.steps.length + ' · ' + moduleName(active.focus.course, active.focus.mod) : f ? moduleName(f.course, f.mod) : 'Your next lesson will appear when course content is available.';
    var goal = s.settings.shortGoal, pct = Math.min(100, Math.round(st.days / goal * 100));
    el.innerHTML = '<div class="c-hero"><div class="c-eyebrow">Your daily study coach</div><h2>' + title + '</h2><p class="c-muted">' + esc(copy) + '</p>' +
      (!active ? '<div class="c-segments" aria-label="Session length">' + [3,10,25].map(function (n) { return '<button data-caction="minutes" data-value="' + n + '" aria-pressed="' + (mins === n) + '">' + n + ' min</button>'; }).join('') + '</div>' : '') +
      '<div class="c-row">' + btn(active ? 'resume' : 'start', active ? 'Resume session →' : st.comeback ? 'Start a 3-minute comeback →' : 'Start my session →', '', true) +
      '<button class="c-link" data-caction="free">Free study</button></div><p class="c-muted" style="margin-bottom:0;font-size:11px">' + (mins === 3 ? 'Three questions. A clear finish.' : 'Review · learn · apply · explain. Time is approximate; pause whenever you need.') + '</p></div>' +
      '<div class="c-grid"><div class="c-card"><div class="c-eyebrow">This week</div><div class="c-flex"><h3 style="margin:0">' + st.days + ' of ' + goal + ' study days</h3><span class="c-chip">' + (st.goalMet ? 'Weekly goal met' : st.cases + '/' + s.settings.caseGoal + ' client cases') + '</span></div><div class="c-progress"><i style="width:' + pct + '%"></i></div><div class="c-dots">' + Array.from({length:7},function(_,i){var d=C.addDay(st.start,i),done=Object.values(s.completed).some(function(x){return x.day===d;});return '<span class="c-dot '+(done?'done':'')+'" title="'+d+'">'+['M','T','W','T','F','S','S'][i]+'</span>';}).join('') + '</div><p class="c-muted">' + (st.goalMet ? 'You reached your weekly practice target. Keep it light or explore a new case.' : 'A finished session or three free-study answers counts. Missed days never create a catch-up backlog.') + '</p><div class="c-row">' + btn('case', 'Practice a client conversation') + '</div></div>' +
      '<div class="c-card"><div class="c-eyebrow">Your learning is moving</div><div class="c-stats"><div class="c-stat"><b>'+st.minutes+'</b><span>active minutes this week</span></div><div class="c-stat"><b>'+st.recovered+'</b><span>missed concepts recalled later</span></div><div class="c-stat"><b>'+st.best+'</b><span>best week · study days</span></div></div><p class="c-muted">'+(st.n ? st.accuracy+'% on the first attempt per distinct question this week · '+st.n+' questions.' : 'Your first-attempt question results will appear here as you practice.')+'</p>'+btn('weekly','Open my weekly review')+'</div></div>';
    if (st.due) el.innerHTML += '<div class="c-notice">'+st.due+' review items are available. Your next session takes a small selection; there is no requirement to clear them all.</div>';
    if (C.dueReminder(s,S.attempts)) el.innerHTML += '<div class="c-notice">Your study window is here. '+btn('start','Start a short session')+' '+btn('snooze','Skip today’s reminder')+'</div>';
  }
  function shell(label, html) {
    var s = state().active;
    $('coach').innerHTML = '<div class="c-stage"><div class="c-head"><span class="c-eyebrow" style="margin:0">'+esc(label)+'</span>'+btn('pause','Save & close')+'</div>'+ (s ? '<div class="c-progress" aria-label="Session progress"><i style="width:'+Math.round(s.index/s.steps.length*100)+'%"></i></div>' : '') + html + '</div>';
  }
  function render() {
    stopClock(); var session = state().active;
    if (!session) { go('dash'); return; }
    if (session.index >= session.steps.length) return finish();
    var step = session.steps[session.index], label = 'Step '+(session.index+1)+' / '+session.steps.length+' · '+(step.type==='case'?'Client conversation':step.type==='lesson'?'Learn one idea':step.type==='review'?'Recall it again':step.type==='warmup'?'Warm up':'Apply it');
    if (step.type === 'lesson') {
      shell(label,'<div class="c-card"><span class="c-chip">'+esc(session.focus.course)+'</span><h3 class="c-question">'+step.front+'</h3><p class="c-muted">Try answering before you reveal the explanation.</p>'+ (!step.revealed ? btn('lesson-reveal','Teach me this', '',true) : '<div class="c-feedback">'+step.back+'<div>'+ttsBtn(step.back,'Listen to this explanation')+'</div></div><div class="c-next">'+btn('next','Try applying it →','',true)+'</div>') +'<details><summary>Explore this lesson</summary>'+links(step.course,step.mod)+'<p class="c-muted">Your session is saved. Return here for the application questions.</p></details>'+source(step.course,step.mod)+'</div>');
    } else if (step.type === 'case') renderCase(step,label);
    else {
      var q=step.q,r=step.result,mod=moduleOf(q);
      var options=q.o.map(function(o,i){var klass=r?(i===q.a?' correct':i===r.choice?' wrong':''):'';return '<button class="c-option'+klass+'" data-caction="answer" data-value="'+i+'" '+(r?'disabled':'')+'><b>'+String.fromCharCode(65+i)+'</b><span>'+o+'</span></button>';}).join('');
      var feedback=r?'<div class="c-feedback" role="status"><strong>'+(r.ok?'Correct.':'Let’s work through it.')+'</strong> '+q.e+'<div>'+ttsBtn(q.e,'Listen to the explanation')+'</div></div>'+whyNotHtml(q,r.choice)+(!r.ok?'<details open><summary>Repair this concept</summary><p class="c-muted">Explain the rule in your own words, then compare the tempting wrong answer with the correct one. This concept will return in a later session.</p>'+links(q.m,mod)+'</details>':'')+'<div class="c-next">'+btn('next','Continue →','',true)+'</div>':'';
      shell(label,'<div class="c-card"><div class="c-row"><span class="c-chip">'+esc(q.m)+'</span><span class="c-chip">'+esc(q.t)+'</span></div>'+(q.stem?'<div class="casebox">'+q.stem+'</div>':'')+'<div class="c-question">'+q.q+'</div><div class="c-options">'+options+'</div>'+feedback+source(q.m,mod)+'</div>');
    }
    $('coach').insertAdjacentHTML('beforeend','<div class="c-stage"><button class="c-link" data-caction="fresh">Start a fresh session</button></div>');
  }
  function renderCase(step,label) {
    var c=cases.find(function(x){return x.id===step.caseId;}); if(!c){next();return;}
    var html='<div class="c-card"><div class="c-eyebrow">Fictional client · '+esc(c.course)+' Module '+c.mod+'</div><h2>'+esc(c.title)+'</h2><p class="c-example">'+esc(c.scenario)+'</p><h3>'+esc(c.prompt)+'</h3><p class="c-muted">Explain it aloud in about 60 seconds, or write a few sentences below. Your self-check stays separate from scored questions.</p><label for="coachDraft" class="c-muted">Your explanation (optional notes)</label><textarea id="coachDraft" placeholder="Here is how I would explain this to the client…">'+esc(step.draft)+'</textarea><div class="c-row" style="margin-top:12px">'+btn('timer','Start 60-second practice')+'<span id="coachClock" class="c-muted" aria-live="polite"></span></div>';
    if(!step.revealed) html+='<div class="c-next">'+btn('case-reveal','Compare with the key points','',true)+'</div>';
    else html+='<div class="c-feedback"><b>Check the points your explanation covered</b><p class="c-muted">This is your assessment. Checked points do not increase exam accuracy.</p>'+c.points.map(function(p,i){return '<label class="c-check"><input type="checkbox" data-coach-check="'+i+'" '+(step.checks.includes(i)?'checked':'')+'><span>'+esc(p)+'</span></label>';}).join('')+'</div><div class="c-next">'+btn('case-done','Finish this conversation →','',true)+'</div>';
    html+=source(c.course,c.mod,c.source)+'<div class="c-source">'+esc(c.anchor)+'</div></div>';shell(label,html);
  }
  function answer(choice) {
    var s=state().active,step=s&&s.steps[s.index];if(!step||!step.q||step.result)return;
    var q=step.q;if(!Number.isInteger(choice)||choice<0||choice>=q.o.length)return;
    var ok=choice===q.a,at=Date.now();step.result={choice:choice,ok:ok,at:at};
    var questionKey=step.originalKey||C.key(q);
    S.attempts.push({id:s.id+':'+s.index,mod:q.m,domain:q.d,topic:q.t,correct:ok?1:0,conf:null,ts:at,src:'coach',questionKey:questionKey});
    bumpMastery(q.m,ok?1:0);markSeen(q.m,'q:'+questionKey);mcqSchedule(q,ok);recordReview(Object.assign({},q,{g:questionKey}),ok,at);
    if(!ok)S.misses.push({mod:q.m,topic:q.t,q:q.q,g:q.g,correct:q.o[q.a],e:q.e,ts:at});
    logSession();touch();render();
  }
  function next() {
    var a=state().active;if(!a)return;
    var p=a.steps[a.index];if(p&&p.q&&!p.result)return;
    ttsStop();a.index++;touch();render();window.scrollTo(0,0);
  }
  function finish() {
    var s=state(),a=s.active;if(!a)return;
    if(window.CFPActivity)CFPActivity.flush();
    var answered=a.steps.filter(function(x){return x.result;}),cs=a.steps.find(function(x){return x.type==='case';}),correct=answered.filter(function(x){return x.result.ok;}).length;
    var entry={id:a.id,day:C.day(),at:Date.now(),kind:a.kind,questions:answered.length,correct:correct,course:a.focus.course,mod:a.focus.mod,caseDone:!!(cs&&cs.done),caseId:cs?cs.caseId:null,caseCovered:cs?cs.checks.length:0,caseNotes:cs?cs.draft:''};
    s.completed[a.id]=entry;s.active=null;s.activeUpdatedAt=Date.now();commit();
    var stat=C.stats(s,S.attempts),mistakes=answered.filter(function(x){return !x.result.ok;}),caseObj=cs&&cases.find(function(x){return x.id===cs.caseId;});
    shell('Session complete','<div class="c-card"><div class="c-eyebrow">You showed up. You practised.</div><h2>'+(stat.goalMet?'Your weekly goal is complete.':'That’s a useful session in the bank.')+'</h2>'+(answered.length?'<div class="c-recap">'+correct+' / '+answered.length+'</div><p class="c-muted">questions correct · '+stat.days+' study days this week</p>':'<p>You practised explaining a planning concept to a client.</p>')+(caseObj?'<div class="c-notice">Client conversation: '+esc(caseObj.title)+'<br>You marked '+cs.checks.length+' of '+caseObj.points.length+' key points covered.</div>':'')+'<p>'+(mistakes.length?mistakes.length+' concepts will come back in a later session. Your next practice starts with a small selection.':'Your next session will mix new questions with later recall checks.')+'</p>'+(caseObj?'<details><summary>A takeaway for your next client conversation</summary><p>'+esc(caseObj.points[0])+'</p>'+source(caseObj.course,caseObj.mod,caseObj.source)+'</details>':'')+'<div class="c-row">'+btn('home','Done for now','',true)+btn('start','Another session')+'</div></div>');
    home();analytics();
  }
  function weekly() {
    var s=state(),st=C.stats(s,S.attempts),f=target(),r=C.retention(s);
    go('coach');shell('Your weekly review','<div class="c-card"><div class="c-eyebrow">Week of '+esc(new Date(st.start+'T12:00:00').toLocaleDateString(undefined,{month:'short',day:'numeric'}))+'</div><h2>See what your practice is doing.</h2><div class="c-stats"><div class="c-stat"><b>'+st.days+'/'+s.settings.shortGoal+'</b><span>study days · last week '+st.previousDays+'</span></div><div class="c-stat"><b>'+st.minutes+'</b><span>active minutes · last week '+st.previousMinutes+'</span></div><div class="c-stat"><b>'+st.cases+'</b><span>client conversations</span></div></div><p><b>'+st.recovered+'</b> previously missed concepts have been recalled correctly on a later day.</p><p class="c-muted">'+(r.n?r.percent+'% of '+r.n+' concepts with delayed checks are currently retained.':'Retention appears after you revisit concepts on a later day.')+'</p><h3>Your next two priorities</h3><ol><li>'+(st.due?'Revisit a small selection of the '+st.due+' available recall checks.':'Start a short session to build your first recall history.')+'</li><li>'+esc(f?'Practise '+moduleName(f.course,f.mod)+', then explain one idea to a client.':'Add the next course when your materials arrive.')+'</li></ol><div class="c-row">'+btn('start','Start my next session','',true)+btn('settings','Adjust my week')+'</div></div>');
  }
  function analytics() {
    var e=$('coachAnalytics');if(!e)return;
    var s=state(),st=C.stats(s,S.attempts),r=C.retention(s),f=target(),covered=DOMAINS.filter(function(d){return MCQ.some(function(q){return q.d===d.k;})||CARDS.some(function(c){return c.d===d.k;});}).reduce(function(n,d){return n+d.w;},0);
    e.innerHTML='<div class="c-card"><div class="c-eyebrow">Evidence, not a pass prediction</div><h2>Your learning progress</h2><div class="c-stats"><div class="c-stat"><b>'+(f?courseReadinessPct(f.course)+'%':'—')+'</b><span>'+(f?esc(f.course):'Current course')+' learning progress</span></div><div class="c-stat"><b>'+covered+'%</b><span>exam blueprint represented by loaded courses</span></div><div class="c-stat"><b>'+(r.percent==null?'—':r.percent+'%')+'</b><span>delayed recall · '+r.n+' checked concepts</span></div></div><p class="c-muted">Course progress combines coverage, question accuracy and exam practice. It is not a probability of passing. Watching or listening records active time; mastery requires answering.</p>'+btn('weekly','Review this week')+'<details><summary>Course coverage and source status</summary>'+MODULES.map(function(m){var has=MCQ.some(function(q){return q.m===m.id;});return '<div class="c-course"><div><b>'+esc(m.id)+'</b> '+esc(m.name)+'</div><span>'+(has?'Course material loaded':'Awaiting course materials')+'</span></div>';}).join('')+'<p class="c-muted">New courses need source material, question and flashcard banks, topic mapping and a reader before they can contribute coverage. Course editions and exam-year tax rules are separate checks.</p></details><p class="c-source">Active time starts with this update; earlier interaction-based hour estimates are not treated as measured time. Weekly accuracy counts the first attempt on each distinct question that week, including questions seen in earlier weeks. It is not an unseen-question exam score.</p></div>';
  }
  function settings() {
    var el=$('coachSettings');if(!el)return;var s=state().settings;
    el.innerHTML='<div class="c-card"><div class="c-eyebrow">Make this fit your week</div><h2>Study coach preferences</h2><div class="c-form"><label>Study days per week<select id="coachDays">'+[2,3,4,5,6,7].map(function(n){return '<option '+(s.shortGoal===n?'selected':'')+'>'+n+'</option>';}).join('')+'</select></label><label>Client cases per week<select id="coachCaseGoal">'+[1,2,3,4].map(function(n){return '<option '+(s.caseGoal===n?'selected':'')+'>'+n+'</option>';}).join('')+'</select></label><label>Preferred session<select id="coachMinutes">'+[3,10,25].map(function(n){return '<option value="'+n+'" '+(s.minutes===n?'selected':'')+'>'+n+' minutes</option>';}).join('')+'</select></label><label>Reminder time (your device’s local time)<input type="time" id="coachReminderTime" value="'+esc(s.reminderTime)+'"></label></div><p class="c-muted">Reminder days</p><div class="c-row">'+['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(function(d,i){return '<label class="c-check"><input type="checkbox" data-reminder-day="'+i+'" '+(s.reminderDays.includes(i)?'checked':'')+'>'+d+'</label>';}).join('')+'</div><label class="c-check"><input type="checkbox" id="coachReminderOn" '+(s.reminders?'checked':'')+'>Show a study reminder when the app is open; skip it after today’s session.</label><div class="c-row">'+btn('save-settings','Save preferences','',true)+btn('calendar','Add calendar reminders')+'</div><p class="c-muted">Calendar reminders can reach you while the app is closed and open your next session. They follow the calendar schedule; completing a session does not cancel a calendar alert. The app itself does not send background push notifications.</p><div id="coachSettingsStatus" role="status" class="c-muted"></div></div>';
  }
  function saveSettingsUI() {
    var s=state().settings;
    s.shortGoal=Number($('coachDays').value);s.caseGoal=Number($('coachCaseGoal').value);s.minutes=Number($('coachMinutes').value);
    s.reminderTime=$('coachReminderTime').value||'19:00';s.reminders=$('coachReminderOn').checked;
    s.reminderDays=Array.from(document.querySelectorAll('[data-reminder-day]:checked')).map(function(x){return Number(x.dataset.reminderDay);});
    s.updatedAt=Date.now();commit();home();$('coachSettingsStatus').textContent='Preferences saved. Your weekly goal updates immediately.';
  }
  function calendar() {
    saveSettingsUI();var s=state().settings;if(!s.reminderDays.length){$('coachSettingsStatus').textContent='Choose at least one reminder day.';return;}
    var d=new Date(),parts=s.reminderTime.split(':');d.setHours(+parts[0],+parts[1],0,0);
    while(d<=new Date()||!s.reminderDays.includes(d.getDay()))d.setDate(d.getDate()+1);
    function localStamp(d){return C.day(d).replaceAll('-','')+'T'+String(d.getHours()).padStart(2,'0')+String(d.getMinutes()).padStart(2,'0')+'00';}
    var url=new URL('index.html#coach',location.href).href,stamp=new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
    var lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//CFP Study Lab//Study Coach//EN','CALSCALE:GREGORIAN','BEGIN:VEVENT','UID:cfp-study-coach@study-lab','DTSTAMP:'+stamp,'DTSTART:'+localStamp(d),'DTEND:'+localStamp(new Date(d.getTime()+s.minutes*60000)),'RRULE:FREQ=WEEKLY;BYDAY='+s.reminderDays.map(function(n){return ['SU','MO','TU','WE','TH','FR','SA'][n];}).join(','),'SUMMARY:CFP — a little progress today','DESCRIPTION:Open your next guided session.\n'+url,'URL:'+url,'BEGIN:VALARM','TRIGGER:PT0M','ACTION:DISPLAY','DESCRIPTION:Your CFP study session is ready.','END:VALARM','END:VEVENT','END:VCALENDAR'];
    // RFC5545 logical newlines must be escaped and physical lines folded at 75 bytes.
    var ics=lines.map(function(line){return line.replace(/\n/g,'\\n').match(/.{1,72}/gu).join('\r\n ');}).join('\r\n')+'\r\n';
    var b=new Blob([ics],{type:'text/calendar;charset=utf-8'}),a=document.createElement('a'),href=URL.createObjectURL(b);a.href=href;a.download='CFP-study-reminders.ics';a.click();setTimeout(function(){URL.revokeObjectURL(href);},30000);
    $('coachSettingsStatus').textContent='Calendar file prepared. Open it and add the recurring study event to your calendar.';
  }
  var actions={
    minutes:function(el){state().settings.minutes=Number(el.dataset.value);state().settings.updatedAt=Date.now();commit();home();},
    start:function(){var st=C.stats(state(),S.attempts);launch(st.comeback?3:state().settings.minutes);},
    resume:resume,pause:pause,home:function(){go('dash');location.hash='';},free:function(){go('study');},
    case:function(){launch(10,'case-only');},weekly:weekly,settings:function(){go('mobile');settings();},
    answer:function(el){answer(Number(el.dataset.value));},next:next,
    'lesson-reveal':function(){state().active.steps[state().active.index].revealed=true;touch();render();},
    'case-reveal':function(){state().active.steps[state().active.index].revealed=true;touch();render();},
    'case-done':function(){var p=state().active.steps[state().active.index];if(!p.revealed)return;p.done=true;logSession();next();},
    timer:function(){stopClock();var left=60;$('coachClock').textContent='60 seconds';clock=setInterval(function(){left--;$('coachClock').textContent=left>0?left+' seconds':'Time to compare your explanation.';if(left<=0)stopClock();},1000);},
    fresh:function(){var a=state().active;if(!a)return;shell('Start fresh?','<div class="c-card"><h2>Keep your answers. Choose your next session.</h2><p>Answers already submitted remain in your history. Starting fresh replaces only this unfinished session.</p><div class="c-row">'+btn('replace','Start fresh','',true)+btn('resume','Keep this session')+'</div></div>');},
    replace:function(){launch(state().settings.minutes,'guided',null,true);},
    'save-settings':saveSettingsUI,calendar:calendar,
    snooze:function(){state().nudges[C.day()]={at:Date.now()};commit();home();}
  };
  document.addEventListener('click',function(ev){var el=ev.target.closest('[data-caction]');if(el&&actions[el.dataset.caction]){ev.preventDefault();actions[el.dataset.caction](el);}});
  document.addEventListener('input',function(ev){if(ev.target.id==='coachDraft'&&state().active){var p=state().active.steps[state().active.index];if(p.type==='case'){p.draft=ev.target.value.slice(0,6000);touch();}}});
  document.addEventListener('change',function(ev){if(ev.target.matches('[data-coach-check]')&&state().active){var p=state().active.steps[state().active.index],n=Number(ev.target.dataset.coachCheck);p.checks=p.checks.filter(function(x){return x!==n;});if(ev.target.checked)p.checks.push(n);touch();}});
  document.addEventListener('click',function(ev){if(ev.target.closest('[data-coach-resource]')&&state().active){touch();sessionStorage.setItem('cfpCoachReturn','1');}});
  window.CFPCoach={home:home,analytics:analytics,settings:settings,launch:launch,resume:resume,recordReview:recordReview,freeCredit:freeCredit,render:render,onNavigate:function(t){stopClock();if(t==='dash')home();if(t==='analytics')analytics();if(t==='mobile')settings();},recordFree:function(q,ok,at){recordReview(q,ok,at);freeCredit();}};
  window.addEventListener('storage',function(ev){
    if(ev.key!=='cfpStudyHome.v1'||!ev.newValue)return;
    try{var incoming=JSON.parse(ev.newValue);if(!Array.isArray(incoming.attempts))return;S=mergeState(S,incoming);state();home();analytics();}catch(e){}
  });
  seed();home();analytics();settings();
  var originalDash=window.renderDash;window.renderDash=function(){originalDash();home();};
  if(location.hash==='#coach')resume();
  setInterval(function(){if(document.visibilityState==='visible'&&!$('dash').classList.contains('hidden'))home();},60000);
})();

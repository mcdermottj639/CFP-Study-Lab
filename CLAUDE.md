# CLAUDE.md — CFP Study Home

Context for future sessions. Read this before changing anything.

> **Keep this file current.** Whenever you change the architecture, build pipeline,
> data model, content taxonomy, or add a feature/course, update the relevant
> section here in the SAME change (and bump the version example below if you
> shipped). Future sessions rely on this file being accurate — don't wait to be asked.

## What this is
An installable, **fully offline** Progressive Web App (PWA) to study for the
CFP® exam, deployed on GitHub Pages. One single app — no separate sub-apps in
the UI — plus two long-form **Interactive Readers** reachable from the Modules tab.

- **Live URL:** https://mcdermottj639.github.io/CFP-Study-Lab/
- **Repo:** `mcdermottj639/CFP-Study-Lab` (public — required for free GitHub Pages)
- **Working branch:** `claude/cfp-study-lab-mobile-4q6qpf`. Deploys happen from `main`.
- The app is **standalone/offline**: no external CDNs, no analytics, no backend.
  Progress is saved per-device in `localStorage` key `cfpStudyHome.v1`.

### Study engine / spaced repetition (SM-2)
The Study tab's scheduler lives in `src/study-home.src.html`. Flashcards use a
simplified **SM-2** algorithm (not the old Leitner boxes):
- Per-card state in `S.cards["c"+index]` = `{ease, intj(interval days), reps,
  lapses, due, last, leech, flag}`. `gradeCard(i, grade)` takes `grade` 0=Again
  1=Hard 2=Good 3=Easy (still accepts the legacy boolean). `srsMigrate()` upgrades
  old `{box}` saves in place.
- **Card filter (the primary flashcard control)** — `#studySession` select →
  `window.CARDFILTER` ∈ `all | unseen | needwork | known`. `cardStatus(i)` classifies
  each card: `unseen` (no SRS state), `needwork` (flag/leech/`lapses>=1`/`ease<2.5` —
  i.e. you pressed Hard/Again), else `known`. `flashcards.js` builds the deck from the
  in-scope cards filtered by status (no count cap, no due-date gating). Grading still
  updates ease/lapses (that's what drives the buckets) — it just no longer schedules a
  "due date." Same-day resume keys on course+sub-module+mode+**filter**.
  (History: the old spaced-rep "due today" / session-length count model — `dueCards`,
  `dueReviews`, `newPerDay`, `SESSLEN` — was removed in v2.13.0 in favor of this; those
  fns/`S.newPerDay` may still exist but are no longer surfaced.)
- Dashboard KPI shows **Unseen cards** (`unseenCount()`); the Module Hub shows
  per-module **unseen** counts (`moduleUnseenCount`). The separate **Hard cards** mode
  (`#studyMode`, `hardCards()`) is kept as-is, independent of the card filter. (Its
  dropdown label is **"Flagged & leech cards"** as of v2.20.0 to disambiguate it from the
  card filter's "Need more work" bucket — same `hard`/`runHard` mechanics.)

### Read-aloud answer explanations (TTS, v2.52.0)
Every MCQ answer explanation carries a **🔊 Listen** button that reads the explanation
aloud using the browser's built-in **Web Speech API** (`speechSynthesis` +
`SpeechSynthesisUtterance`) — the OS's own voices, so it's **fully offline, no vendored
asset, no CDN, no `https://`** (doesn't violate the offline rule). Helpers live in
`src/study-home.src.html` just above `mcqRunner`: `ttsSupported()`, `ttsPlain(html)`
(strips tags/entities to plain text via a scratch `<div>`), `ttsStop()`, `ttsSpeak(el)`
(toggle: tapping the active button stops; only one utterance plays at a time via
`window._ttsBtn`), and `ttsBtn(html,label)` which returns the button markup (empty string
where TTS is unsupported, so it degrades gracefully). `ttsBtn(q.e)` is spliced into all
three explanation render points in `mcqRunner`: the instant-feedback reveal (`_pick`, v2.96.0), the
endless-quiz recap review, and the scored-exam results review. Speech is cancelled on
navigation — `_next`, exam-advance (`_pick`), `_endQuiz`, and `go()` all call `ttsStop()`
so audio never bleeds across questions/tabs. Button styles = `.tts-btn` (pill, filled while
`.speaking`) in the source `<style>` block.

**Voice selection (v2.54.0, corrected v2.57.0).** `ttsPickVoice()` (source, next to the TTS helpers)
honors **only an explicit pick** in `localStorage.cfpTtsVoice`; with no pick it returns `null` and
`ttsSpeak` leaves `u.voice` **unset**, so the OS uses its own default voice. `reader-tts.js` mirrors
this (`pickVoice()`). **Why not auto-pick "the best" voice? (the v2.54–2.56 bug)** iOS **hides the
Siri voices (Voice 1–5) from web pages** and **doesn't expose the "(Enhanced)/(Premium)" labels** —
`getVoices()` just lists plain names like "Ava". Crucially, **force-setting** a `getVoices()` entry on
iOS often selects the low-quality *compact* rendition, whereas leaving `voice` unset uses the
**enhanced/premium voice the user set as their device default**. So the old auto-rank
(`ttsScoreVoice`) actively made every surface robotic while the ⋯-picker *preview* (which set no
voice) sounded right — the reported symptom. Fix: **"Automatic" = device default (no `u.voice`)**; the
explicit list is mainly for desktop. The **⋯ Backup & tools panel** picker (`#cfpTkVoice` + ▶︎ preview,
writes `cfpTtsVoice`; repopulates on `voiceschanged` + modal open) leads with "Automatic (device
default) — recommended" and tells iOS users to set their default in Settings → Accessibility → Spoken
Content → Voices → English.

**Read-aloud is spread across the whole app (v2.53.0)** using the same helpers. `ttsRow(html,label)`
(next to `ttsBtn`) wraps a Listen button in a spaced row (empty string where unsupported):
- **Flashcards** (`flashcards.js`) — a 🔊 Listen on the card face reads the **question** (front),
  and after flip a "🔊 Read answer" reads the back. Buttons live in `#flashctrl` (OUTSIDE
  `#flashface`) so tapping them doesn't also flip the card. `draw()`/`flip()` call `ttsHalt()`
  (thin wrapper over `window.ttsStop`) so audio stops on card change / flip. This is the
  hands-free drilling path.
- **Module Hub** (`renderModuleHub`) — `ttsRow` on **Learning objectives** (reads all objs),
  **How it connects** (`MODSYN`), and the **Worked example** (`MODEX`).
- **Exam cheat sheet** (`openCheatSheet`) — a toolbar 🔊 Listen reads the prose parts
  (`MODCHEAT` mustKnow + traps + tips; key-numbers/term tables are skipped as they read poorly).
  `closeCheatSheet()` calls `ttsStop()`.
- **Quick references** (`runKeys`/`runTips` via `openRefOverlay(html, readable)`) — pass a plain-text
  `readable` string to get a toolbar Listen (Key numbers and Exam tips & traps).

### Reader read-aloud — "podcast mode" (TTS, v2.53.0; whole-reader flowing + resume v2.71.0)
`reader-tts.js` (shared, injected after `reader-theme.js`/`reader-search.js` by
`inject_reader_theme.mjs` with its own `reader-tts-injected` marker; precached in `sw.js`;
in `CORE_ASSETS`) adds a floating **🎙️ Podcast** FAB (right side, stacked above the 🔍 search FAB)
that reads the reader aloud via `speechSynthesis` — fully offline, OS voices, no vendored
asset. It highlights (`.rt-hi`) + auto-scrolls each block and **auto-expands a collapsed section**
when it reaches text inside it (clicks the `.collapsible-header`/`.ch`).

**Podcast: whole-reader flowing + resume-where-you-left-off (v2.71.0).** The FAB was reworked from
"read the active tab" into a **podcast that plays the whole reader top-to-bottom, flowing across every
tab automatically** — press play once, put the phone down. `buildPlaylist()` clicks through **all**
`.tab-btn`s and `collect()`s each into ONE flat `playlist` of `{el,text,tab,tabLabel}` in document
order; because `tab.click()` switches tabs synchronously with no repaint (same trick
`reader-search.js` uses) this pre-collect causes **no visible flicker** and restores the originally-
active tab at the end. Playback walks the flat list; `focusTab(unit)` switches the active tab only
when a block lives on a different tab. **A manual tab tap JUMPS playback to that tab** (`jumpToTab` →
first playlist entry on that tab) rather than stopping — you navigate the audio by tapping tabs
(v2.72.5); our own auto-advance switches are ignored (guarded by an `autoSwitch` flag). Use the bar's
⏹ to stop.
- **Resume.** Position is bookmarked in `localStorage['cfpPodcast:'+<reader file>]` (per reader) on
  every block, on pause, on stop, and on `visibilitychange`-hidden — `{pos, txt(first 40 chars), n(playlist
  length)}`. `start()` resumes from the bookmark only if `n` still matches the current playlist length
  **and** the block text still matches (else falls back to the top). The FAB reads **🎧 Resume** when a
  bookmark with `pos>0` exists, else **🎙️ Podcast** (`reflectFab()`); **⏹ Stop** while playing.
  Reaching the end (`finish()`) **clears** the bookmark; a manual `stop()` **keeps** it so Resume works.
- **Screen stays awake** while playing via the Wake Lock API (`requestWake()`/`releaseWake()`, silent
  no-op where unsupported) so a hands-free listen isn't cut short by the display sleeping. Re-acquired
  on `visibilitychange`-visible.
- **Background recovery.** The OS may kill speech when the screen locks / tab is hidden (iOS does).
  On `visibilitychange`-visible, if we should be talking but aren't (`!sp.speaking && !sp.pending`) it
  **re-speaks the current block** so you never lose your place. (True lock-screen playback isn't
  possible with the Web Speech API without a vendored audio asset, which the offline rule forbids.)
- `onerror` advances via a 60 ms `setTimeout` (like `onend`'s `GAP`), `gen`-guarded — so a fast error
  chain over the now-hundreds-of-blocks playlist can't recurse synchronously deep enough to blow the
  stack. Double-tap-to-start and the ¶ counter operate over the whole-reader playlist (the counter
  shows `<tab label> · ¶ pos/total`).

### Reader "Teach mode" — a teacher talks you through it (TTS, v2.72.0)
Distinct from the verbatim podcast: **Teach mode** speaks a **conversational teacher's script** (the
"why," the plain-English version, the gotchas) while the reader **auto-scrolls to and expands the
section being taught** — "a teacher walking you through it as you scan," which the literal read-aloud
isn't. Same offline OS voice; different *words*. Built as a second mode inside the SAME player
(`reader-tts.js`) so it reuses the docked bar, pause/resume, speed, wake lock, and background recovery.
- **Content lives in `reader-teach.js`** (shared; injected BEFORE `reader-tts.js` by
  `inject_reader_theme.mjs`'s pattern with its own `reader-teach-injected` marker — currently injected
  via a one-off perl edit, add it to the injector if re-importing a reader; precached in `sw.js`, in
  `CORE_ASSETS`): `window.READER_TEACH[<reader file>][<tab data-tab>] = [ {at, say}, … ]`. `at` = a
  substring matched (case-insensitive) against a section header (`.collapsible-header`/`.ch`/`h1-4`) in
  that tab's panel; `say` = the narration. **Grounded strictly in the reader's own textbook-verified
  content** (the CLAUDE.md standing rule permits grounding from the audited reader). Add a tab/course =
  add an entry here, **no engine change**.
- **Player mechanics.** A second **👩‍🏫 Teach** FAB (`#rtTeachFab`, purple, stacked above the 🎙️ Podcast
  FAB) shows whenever the reader has any narration (`readerHasTeach()`; hidden while playing).
  **Whole-reader walkthrough (v2.72.3):** `start('teach')` builds a playlist across **every** tab in order
  (`buildTeachPlaylist` clicks through all tabs synchronously like `buildPlaylist`, restoring the active
  tab — no flicker), so teach **flows tab to tab start-to-finish** just like the read podcast (playback
  auto-switches tabs via `focusTab`). It **starts at the tab you're currently on** and plays to the end
  (from the first tab = the whole reader; resume-bookmark overrides). Each `{at,say}` → an anchor element +
  entries for the script grouped into **flowing multi-sentence chunks** (`chunkSay`, ≤260 chars — engine
  carries intonation across sentences instead of hard-stopping, the v2.72.1 "less stiff" fix; under iOS's
  long-utterance cut-off), all sharing the anchor. `reveal()` expands a collapsed section header
  (class-based: FP512 `.collapsed`, FP511 `.closed`; clicks only when actually collapsed) and, via
  `lastRevealEl`, **scrolls once per section** instead of re-yanking on every sentence.
- **Reposition mid-lesson (v2.72.5).** While playing, tapping a **tab** jumps the teacher to that tab
  (`jumpToTab`), and **double-tapping a section** jumps to that section's narration (`teachIndexForNode`
  maps the tapped node → its section header → the teach entry anchored to it). Read mode's double-tap
  starts the verbatim read from the tapped word instead (only when not already teaching).
- **Two independent whole-reader bookmarks.** `bmKey()` switches by mode: read = `cfpPodcast:<file>`,
  teach = `cfpTeach:<file>` (both per reader now that teach also flows across the whole reader). Each FAB
  reflects its own Resume state (`reflectFab`/`updateTeachFab`): 🎧 Resume / 👩‍🏫 Resume lesson. Reaching
  the end clears that mode's bookmark; a manual stop keeps it. Double-tap-to-start always forces `mode='read'`.
- **STATUS: complete + coverage-audited for FP511 + FP512.** Every tab of both readers is authored —
  **FP511: 9 tabs / 42 sections; FP512: 11 tabs / 52 sections; ~28k words total** — each grounded strictly
  in that tab's own extracted reader text and matching the pilot voice, with **every anchor runtime-verified**
  against a real section header (`.collapsible-header`/`.ch`). Built in two passes: (1) a per-tab authoring
  pass (one subagent per tab; shared brief + a `scratch_tabs.json` extraction of each tab's headers+text),
  then (2) a **coverage-audit pass** where an agent per reader compared each tab's narration against its
  full reader text and flagged untaught material, and a per-gap-tab expansion pass folded those items into
  the right sections (e.g. FP512 principles gained the Paul v. Virginia → US v. Southeastern Underwriters →
  McCarran-Ferguson case chain; FP511 statements gained the whole mortgage/leasing block; plus QLAC caps,
  Medigap K/L, HRA variants, LTC deduction limits, the 5 unnamed cognitive biases, FCBA, etc.). Assembled +
  anchor-validated + runtime-smoke-tested (all 20 tabs play, anchors resolve, no errors) by a scratch
  harness. To revise a tab, edit its entries in `reader-teach.js`. **When adding a new course reader
  (FP513+), author Teach narration for its tabs the same way (author pass, then coverage audit).**

### Teach mode on the per-module Kaplan slide decks (TTS, v2.75.0; all 13 decks v2.76.0)
The same 👩‍🏫 Teach walkthrough now runs on the **per-module Kaplan visual decks**
(`apps/fp5XX-mN-kaplan-slides.html`), not just the readers — the user wanted a teacher to talk them
through a specific module's deck (the verbatim Podcast stays a reader-only thing they listen to for the
whole course). Decks are **Teach-ONLY** (a visual deck of stat tiles/tables reads poorly aloud, so no
🎙️ Podcast FAB is shown).
- **Engine reuse, not a fork.** `reader-tts.js` was generalized: a deck is a single vertical-scroll page
  with **no `.tab-btn` and no collapsibles** (it wraps its content in `#rdrWrap` and carries its own inline
  Home/Back/Theme chrome). The engine now detects a deck — `isDeck = no .tab-btn && #rdrWrap present &&
  window.DECK_TEACH[FILE] has entries` — and if so runs teach over a **flat, tab-less playlist**
  (`buildDeckTeachPlaylist`) instead of the tab-flowing reader playlists. It reuses the whole shared player
  (docked bar, speed, resume bookmark `cfpTeach:<deck file>`, wake lock, background recovery, ☰ Contents,
  scroll+highlight). `body.rt-deck` drops the Teach FAB to the base slot (no Podcast FAB beneath it) and the
  `body.rt-on` hide-rule also hides the decks' `#dkHome`/`#dkBack`/`#tgl` while the bar is up. Double-tap a
  slide → start/reposition the teacher there (`deckTeachIndexForNode` maps a tapped node → its `.slide`/`.sect`
  heading anchor). If a deck has no `DECK_TEACH` entry the engine early-returns (harmless), so the two script
  tags can sit in any deck safely.
- **Content lives in `deck-teach.js`** (shared; **flat** per-deck list, unlike the reader's tab-keyed
  `READER_TEACH`): `window.DECK_TEACH[<deck file>] = [ {at, say}, … ]` in **slide order**, where `at` matches a
  substring of a deck heading (`.sect h2` / `.slide h3`, case-insensitive) and `say` is the narration
  (chunked at playback into flowing multi-sentence utterances). Grounded strictly in that deck's own
  Kaplan-sourced/audited slide content, matching the reader Teach voice. Precached in `sw.js`
  (`CORE_ASSETS`); each teachable deck loads `../deck-teach.js` then `../reader-tts.js` before `</body>`.
- **STATUS: complete — all 13 Kaplan per-module decks** (FP512 M1–M8 + FP511 M2,4,5,6,7). **352 `{at,say}`
  entries** total (each deck = its LO-section intros + one per slide; quiz sections skipped), grounded
  strictly in each deck's own Kaplan-sourced/audited slides and matching the pilot voice. Authored by one
  grounded author per deck (each read only its own deck + a pre-extracted heading brief), then a single
  verification gate confirmed **every anchor resolves to a real heading, in document order, across all 12**
  (`scratchpad/assemble.mjs`), and a headless pass smoke-tested a sample (Teach FAB shows, no Podcast FAB,
  chunks flow, zero console errors). Each deck loads `../deck-teach.js` + `../reader-tts.js` before
  `</body>`. To add a new course's decks (FP513+): author a flat `DECK_TEACH` list against that deck's slide
  headings, add the two `<script>` tags — no engine change. (The whole-course AI decks are intentionally
  left Teach-free.)

**Docked player bar + no-clutter layout (v2.60.0).** `#rtBar` is a **full-width bar docked at the
bottom** (not a centered pill — it was colliding with Home/Theme/search). `showBar(on)` toggles it,
sets `body.rt-on`, and while playing **hides the 🎧 `#rtFab` + 🔍 `#rsFab`** AND the
`#fpslHome`/`#rdrTheme`/`#rdrBack` pills (v2.72.7 — they used to be *lifted above* the bar but covered
content just above it; the bar has its own Stop, and nav returns after stopping). The bar has a
**☰ Contents** button (v2.72.6), ⏮ ⏭ prev/next, ⏸/▶ pause,
⏹ stop, a **reading-speed button** (`.rt-speed`, v2.58.0 — taps cycle `RATES` = 0.8/1/1.25/1.5/1.75/2×,
persisted in `localStorage.cfpTtsRate`), and a `¶ n/total` counter.
**Contents / table of contents (v2.72.6).** The ☰ button opens `#rtToc`, a bottom-sheet overlay listing
every **tab → section** for the current playlist (`buildTOC`): a group row per tab + a jumpable row per
section (teach = each distinct anchor; read = each `.collapsible-header`/`.ch` block), the current
section marked **▶ now** (`.rt-toc-cur`, auto-scrolled into view). Tapping a section `jump()`s playback
there and closes; backdrop/✕/Esc close. Labels come from `tocLabel()` (strips toggle glyphs + trailing
EXAM). Reader-agnostic — derived entirely from the playlist, so it works in both modes on any reader.
**Natural pacing (v2.60.0).** `u.rate = RATE_BASE(0.95) × rate` (so "1×" is an unhurried default, not
the old rushed 1.0); each block's text gets a sentence-final period (`sentence()`) so blocks don't run
together; and a **light gap** (`gapMs()` — 150 ms read / 70 ms teach, v2.72.1; was a fixed 220 ms that
read halting/stiff) is inserted between blocks on natural advance (a `setTimeout` inside `onend`,
re-checking the `gen`/`paused` guard) — a human breath instead of a continuous rush. Reader-agnostic: the reading root
is the largest `.active` panel (same convention `reader-search.js` uses), so it works on FP511, FP512,
and any future reader with **no per-reader code**. A **generation counter** (`gen`) guards the
utterance `onend` chain so cancel/skip/pause never double-advance. Pause re-speaks the current block
on resume (robust on iOS). A **manual** tab tap now jumps playback to that tab (v2.72.5, see above)
rather than stopping; `pagehide`/`beforeunload` save the bookmark then stop; when the tab is **hidden**
it saves the bookmark and keeps state so it can recover on return (see Podcast section above).
**Double-click / double-tap a word → start reading from there (v2.59.0).** A `dblclick` listener
(desktop) maps the click to its block via `unitIndexForNode()` and starts/jumps there; for leaf blocks
it computes `wordLevelText()` (a Range from the block start to the double-click selection) so a long
paragraph starts at the *exact word*, delivered as a one-shot `startOverride` on the first utterance.
A `touchend` double-tap detector (≤350 ms, <28 px) does the same at block granularity (no reliable
tap selection). If not already playing it collects + begins; if playing it `jump()`s.

**Generic collector — reads EVERYTHING, flowing (v2.56.0).** The original tag-whitelist collector
(`p/li/h*`) silently skipped anything in a styled `<div>` (callout boxes, stat tiles, cards). `collect()`
now walks the panel DOM generically and returns `[{el,text}]` units in document order:
- `isLeafBlock(el)` = has text and **every child element is inline** (`INLINE` set) → so div-based
  content is read, not just the whitelist. Containers with block children are recursed into.
- `isCompactGroup(el)` = a small container (2–6 all-leaf children, combined text ≤120 chars) is read as
  ONE phrase, so stat tiles read "15% CFP® Exam Weight" instead of choppy "15%" … "Exam Weight".
- **Tables are expanded row-by-row** (`pushTable`): each `<tr>` becomes its own unit (its own highlight),
  text = row header (first `<th>`) + each cell paired with its column header (top `<th>` row) → a matrix
  reads as flowing sentences and never hits the iOS long-utterance cut-off. Cells are not collected as
  leaves (no double-read). `<canvas>/<svg>/<img>/<button>/<nav>` etc. are skipped (`SKIP` set), as is
  `aria-hidden`.
- `blockText()` strips leading/trailing collapse-toggle glyphs (`TOGGLE` set incl. U+2212 minus,
  dashes, triangles/chevrons) so "Course Scope & Module Map −" doesn't read "…Map minus". Applied to
  leaf AND compact-group text.
- **Flow:** natural advance (from `onend`) does NOT call `sp.cancel()` before the next utterance (only
  start/skip/resume do) — removes the inter-block gap/clip so it reads continuously. Rate 0.96.

**Voice on the reader (v2.56.0 fix).** iOS/Safari populate `getVoices()` asynchronously (empty on first
call). The app warmed voices via its ⋯ picker but the reader didn't, so it fell back to the robotic
default even when the user had Ava selected. `reader-tts.js` now warms voices at load (`sp.getVoices()`
+ a `voiceschanged` listener) and `start()` gates the first utterance on `ensureVoices()` (waits for the
voice list, 300 ms fallback), so `pickVoice()` sees the real list and uses the chosen/best voice.

### Exam-version simulators + "why not the others?" + expectations (v2.61.0)
Built from a recent test-taker's exam-day debrief (the real CFP® exam ships in **three
forms** — Theory / Math / Case-Study — and a given sitting leans heavily one way; the hard
part is choosing between *two very plausible answers*; and breadth means some studied topics
never appear). Three coordinated additions, all in `src/study-home.src.html` unless noted:
- **Exam-version simulator modes** — a third `#studyMode` optgroup ("Exam-version simulators"):
  `vtheory` → `runTheoryExam`, `vmath` → `runMathExam`, `vcase` → `runCaseExam`. All are
  **scored** (`mcqRunner(...,{exam:true})` — answer all, then a verdict), mirroring the real
  deferred-feedback exam. `mcqSplit(mod)` partitions in-scope `MCQ` into `math` (has a `g`
  generator field) vs `theory` (no `g`). **Theory** = concept-heavy (≤20 theory + up to 2
  calc). **Math** = the generator-backed calc questions (fresh numbers) + a few concepts;
  flags "limited calc content" when thin. **Case** = up to 3 `SCENARIOS` sets flattened, each
  item carrying its own `stem` (global — scenarios have no module map, so `vcase` is in
  `GLOBAL_MODES`). `mcqRunner.draw()` renders `q.stem` in a `.casebox` above the question when
  present. `vtheory`/`vmath` honor course/module scope; only `vcase` is global.
- **"Why the other answers are wrong"** — per-distractor rationale (`whyNotHtml(q,picked)`,
  next to `mcqKey`) reads `window.MCQWHY` (**`mcq-why.js`**, loaded after `module-content.js`,
  precached in `sw.js`, in `CORE_ASSETS`), keyed by **exact question text → {exact wrong-option
  text: rationale}**. Spliced into all three explanation render points (instant-feedback
  reveal, endless recap review, exam results review; exam/recap pass `r.picked` so the user's
  pick is bold-tagged). **Only stable-text theory MCQs are covered** — generator (`g`) questions
  reshuffle their option text every serve so they're intentionally excluded. Degrades to nothing
  when a question has no entry. **Coverage: all 381 theory MCQs, 1,142 rationales.** Regenerate
  via the merge harness in the session scratchpad (`scratch_merge_why.mjs`) which validates every
  key against the live bank (drops unmatched question/option text, strips any correct-option
  leak) before writing `mcq-why.js`. Styles: `.whynot`/`.wn-h`/`.wn-you` in the source `<style>`.
- **Exam-day expectations** reference (`runExpectations()`, `EXPECT` data) — a printable overlay
  (reuses `openRefOverlay`) surfaced as a **🎓 Exam-day expectations** button in both "Quick
  references" rows (Dashboard + Modules tab), alongside Key numbers / Exam tips.
- **Scenario bank grew 2 → 8** (added FP511 cash-flow + fiduciary/conflicts, FP512 auto-PAP,
  disability-income, life-needs-analysis, Medicare/LTC) so `vcase`/`runScenario` feel substantial.

### Study mode dropdown — scoped vs. global (v2.20.0)
The `#studyMode` `<select>` is split into two `<optgroup>`s by what the course/sub-module
pickers actually affect, so the UI stops pretending scope applies when it doesn't:
- **"This course / module"** (honor `studyModule`+`studyModuleNum`+`CARDFILTER`): `flash`,
  `hard`, `quiz`, `exam`, `calc`.
- **"Across the whole exam"** (ignore all three pickers): `mcqreview` (`mcqDuePool()`),
  `mock` (`runMock`, blueprint-weighted), `scenario`, `ethics` (`d==="A"`). `runScenario`
  was **globalized** in v2.20.0 (uses the full `SCENARIOS` list instead of `filt(SCENARIOS,mod)`,
  which silently dead-ended under a specific module since scenarios have no topic→module map).
- `studyScopeSync()` (wired in `fillModuleSelect` + on `#studyMode` change; `GLOBAL_MODES`
  set) **dims** the three scope selects (opacity + tooltip) when a global mode is picked.
- **`exam` now routes to the scored `runModuleExam`** (was the unscored instant-feedback
  `runExam`, which duplicated `quiz`). So a Study-tab "Exam (scored)" is the SAME exam-style,
  deferred-feedback, verdict-producing run as the Module Hub's Exam — and when a specific
  module is selected it writes `S.modReady[course_mod]`, feeding the readiness composite and
  Analytics exam scoreboard (course-wide / `MODF==="ALL"` runs score but save no badge).
  `runExam` is now dead code (left defined, unreferenced). **Quiz** is an **endless**
  instant-feedback practice (v2.49.0): `runQuiz` calls `mcqRunner` with `{endless:true,
  restartMod:mod}` (no `limit`) — the runner keeps serving questions, **reshuffling the full
  in-scope pool each time it's exhausted** (`fullPool`/`draw()` loop) so it never hits the
  "complete" screen. **Instant-feedback reveal (v2.96.0):** tapping an option in a non-exam run
  (`_pick`) now reveals correct/wrong + explanation + Next **immediately** — the old
  confidence-calibration gate (a Guess/Unsure/Confident step in a `#conf` div that dimmed the
  options via `.dim` while it waited, which users read as "frozen / can't change my answer") was
  removed. MCQ attempts now log a neutral confidence (`record(oi,2)`); flashcard grading still
  supplies real confidence. The scored **exam** path (`_pick` with `exam`) is unchanged (lock +
  advance, reveal at the end). A persistent **"■ End & see recap"** button (`window._endQuiz`) lets you
  stop any time; the header shows a running `Q{answered+1} · {correct}/{answered} correct`
  counter. Ending calls `endlessRecap()` → score %, verdict, and **"🎯 Areas to work on"**
  (missed topics ranked by miss-count) + a collapsible review of missed questions, with
  Keep-practicing (`runQuiz(restartMod)`) / Dashboard / Analytics buttons. `mcqRunner` now
  tracks `answered` and accumulates `results` when `exam||endless` (was exam-only).
- **Leeches**: `lapses>=8` flags `leech`. **Flag/star** via `toggleFlag(i)`.
  `hardCards()` (flagged ∪ leech ∪ `ease<=2.0`) powers the **Hard cards** mode.
- **MCQ misses** schedule into `S.mcqDue[mcqKey(q)]` (Leitner ladder) via
  `mcqSchedule()`; the **Review missed questions** mode (`mcqDuePool()`) resurfaces
  them; they retire after enough correct answers. `mcqKey(q)` = `q.g || q.q` (see
  dynamic MCQs below).
- **Dynamic number MCQs (`MCQGEN`, v2.51.0)** — calculation-style bank questions get
  **fresh numbers on every serve** (the user was seeing e.g. the Zachary coinsurance
  question with identical numbers over and over). The `MCQGEN` map (in
  `src/study-home.src.html`, `/* MCQGEN-START */…END */` block next to `CALCGEN`) holds
  32 parameterized generators (coinsurance, TVM family, Section 79 imputed income,
  exclusion ratio, EIA/EIUL participation, UL Option A/B, MOOP, misstatement-of-age, …);
  a bank question opts in via a **`g` field** naming its generator (29 tagged in the source
  `MCQ` array + 3 in `content/fp512-textbook.mcqs.json`; `add_content.mjs` passes `g`
  through untouched). `mcqRunner` maps `mcqFresh()` over its pool per pass (and per endless
  reshuffle), so EVERY MCQ mode — readiness check, quiz, exam, mock, review — serves fresh
  numbers; distractors are generated from the same wrong-method logic as the originals
  (e.g. "forgot the deductible"). `mcqKey()` returns the stable `g` id so SRS scheduling,
  `markSeen`, and miss records survive the changing text (misses also store `g`;
  `mcqKeyMigrate()` at boot moves old text-keyed `mcqDue`/`seen` entries to `g` ids).
  A generator returns `null` on option-collision and `mcqFresh` retries (30×); each accepts
  an optional `fx` fixed-inputs object so tests can pin the original bank numbers — the
  regression+fuzz harness lives in the session scratchpad (`test-mcqgen.js`), pinning all
  32 against the original answers. Static-fact numeric questions (FDIC $250k, COBRA months,
  Coverdell $2,000…) are deliberately NOT tagged. NB the original `tax.medded` bank item was
  arithmetically wrong ($30,000−$15,000 keyed as "$14,500"); the generator computes correctly.
  When authoring generator code that gets spliced into the source, never use `String.replace`
  with the block as replacement — `$'` inside JS strings is a special replacement pattern
  (use index slicing).
- **Mastery coverage** uses DISTINCT items seen (`S.seen[mod]` via `markSeen()`),
  not attempt count, so re-drilling one card no longer inflates readiness.
- **Mock exam** samples WITHOUT replacement and reports any per-domain shortfall
  instead of silently duplicating questions.
- Study UI adds a **session-length** select (`#studySession` → `window.SESSLEN`)
  honored by both the flashcard deck and `mcqRunner`, plus the Hard-cards and
  Review-missed modes in `#studyMode`.

### Readiness composite & Analytics (v2.17.0)
Exam-readiness is no longer a flat `accuracy×coverage`. `domainReadiness(d)` blends
three transparent 0..1 sub-scores per domain — **Coverage** (`seenCount/totalItems`),
**Accuracy** (`domainAccuracy()`, weighting graded quizzes/exams above softer flashcard
self-grades: `accWeight()` = exam 1.15 · mcq/legacy 1.0 · card 0.5), and **Exam**
(`domainExam()` = mean of the latest module-exam scores in `S.modReady` for that course) —
with weights **cov .30 / acc .40 / exam .30** renormalized over present signals (Exam only
once taken), times a light **recency decay** (`daysSinceMod`, full ≤14d easing to a 0.85
floor by ~90d). `readiness()` then **blueprint-weights** these across the 8 domains by `d.w`
(unchanged). So module Exam scores now actually move the dashboard number. NOTE: accuracy/
coverage/exam are tracked per **module (course)**, so the 3 FP511 domains (A/B/H) share one
score — only the blueprint weights differ. Attempts now carry a **`src`** field
(`'exam'|'mcq'|'card'`); set in `mcqRunner.record` and `flashcards.js`.
- **Dashboard:** `#readyDrivers` sub-line ("X% covered · Y% accuracy · Z% exam avg",
  thin-data flagged under 8 answers) via `readinessBreakdown()`; `#readyTrend` inline-SVG
  **sparkline** of `S.history` (daily readiness snapshot written by `snapshotReadiness()` in
  `renderDash`, merged by date, capped 180); `dueReexam()` (exams >21 days old) adds a
  re-exam nudge to the today-plan. The domain chart now plots `domainReadiness().score`
  (was `masteryPct`).
- **Analytics page (`renderAnalytics`)** adds: **Biggest gaps** (`#gapList`, domains ranked
  by `exam weight × (1−readiness)` = points left on the table, each with a Study→ launch via
  `studyDomain(course,mode)` — course-wide sibling of `studyScoped`); **Module exam scoreboard**
  (`#examBoard`, latest %/▲▼/date/due-flag, Re-take→); **Card status by course** (`#cardStatusBoard`,
  known/needwork/unseen bar via `cardStatusCounts`); **actionable Weak topics** (`#weakTopicsBoard`,
  one-tap Drill→ scoped by `TOPIC_MOD`); plus thin-data flags on the calibration note.
- New state: `S.history` (array of `{d:ymd,r:readiness}`; defaulted in `load()`, merged in
  `mergeState`). `S.attempts[].src` is additive (legacy attempts treated as `mcq` weight).

### Exam schedule & pacing (v2.94.0)
Per-**course** deadlines + a CFP exam-day countdown, integrated into the Dashboard. (The user's
program sets a due date per *course* — e.g. FP512 due Sep 6 — not per module.) All in
`src/study-home.src.html`:
- **State:** `S.courseDue` = `{ COURSE: "YYYY-MM-DD" }`, `S.coursePassed` = `{ COURSE: true }`, plus the
  pre-existing `S.examDate` (the final CFP board exam). Defaulted in `load()` (migrated for old saves) and
  in the `S` init object. **`mergeState`** unions them — `courseDue` keeps this device's value else takes
  incoming, `coursePassed` is OR-wins — **guarded (`if(a.x||b.x)`) so `merge(x,x)` never synthesizes a key**
  and stays idempotent (required, or the gist sync reload-loops — see the sync section).
- **Dashboard card** (`#schedCard`, rendered by `renderSchedule()` inside `renderDash`): a big days-to-CFP-exam
  KPI + an editable exam-day `<input type=date>`, then one row per active course (name, editable due date,
  "passed" checkbox, and an on-track status). Only courses with content (`status!=='upcoming'`) or an
  already-set date/passed show. Inline editors call `setExamDate`/`setCourseDue`/`setCoursePassed` → `save()`
  + re-render.
- **On-track logic:** `courseReadinessPct(course)` = blueprint-weighted mean of that course's `domainReadiness`
  scores; `courseStatus(c)` returns passed ✓ / overdue / "on track" (≥70% ready) / "behind" (<70% & ≤10 days
  left) / "keep going". `courseSchedChip(c)` adds a compact 📅 due/passed pill to each **Modules-tab course
  card** (next to `statusPill` in `renderModules`). Colors are inline semantic (green/amber/red), readable in
  both themes. No new engine deps — a new course auto-appears once it has content or a date.
  **Once a course is marked passed, its date `<input>` is hidden** (renderSchedule shows only the
  passed checkbox + ✓ status — the deadline is moot).
- **🎯 Today's focus banner (v2.95.0)** — prepended to the Dashboard "Study this today" card by
  `renderTodayFocus()` (via `focusTarget()`). Picks the single highest-value target: the course with
  the **nearest not-passed deadline** (else the current module's course), then within it the **weakest
  module** (lowest `moduleMastery`, tie-broken by most unseen cards, skipping modules with no cards). Renders
  a one-line "Focus: FP512 Module N — Name (X% ready) · D days to your FP512 deadline" with a **Drill it →**
  button (`studyScoped(course,mod,'quiz')`, or `studyDomain` if no module resolves).

## How it's built (IMPORTANT — index.html is generated, don't hand-edit it)
`index.html` is **built** from a source artifact + overlays. Editing it directly
will be overwritten on the next build. The real sources are:

- `src/study-home.src.html` — the original app (the "CFP Study Home" artifact,
  built originally in Claude "cowork"). This is the upstream UI/engine.
- `scripts/build_index.mjs` — wraps the source into `index.html`, applying:
  1. `viewport-fit=cover`; PWA `<head>` (manifest, apple meta, icons, theme,
     early dark-mode applier)
  2. Chart.js CDN → local `vendor/chart.umd.js` (offline)
  3. A **Backup & tools** panel (⋯ top-right): export/import progress, dark-mode
     toggle, reset, version stamp (`APP_VERSION`)
  4. Service-worker registration with **auto-reload on `controllerchange`**
  5. A fresh **warm design system** (`<style id="freshUI">`): sand/terracotta
     palette, gradient accents, **Dancing Script** title, **mobile bottom tab
     bar**, plus an opt-in **warm dark mode** (`html[data-theme="dark"]`)
  6. **De-cowork FIXES**: the source had live Google-Drive/Kyle connectors that
     don't work in a deployed app. These regex-replace `moduleLinks()` to link
     directly to the local readers, no-op `loadDrive()`, drop the "Refresh from
     Drive" button and the "Push to Kyle" card (that tab is now **Settings**).
     If you re-import a newer source artifact, **check these FIXES still match.**
- `scripts/add_content.mjs add` — merges study content into `index.html`'s
  `CARDS`/`MCQ` arrays (see Content below). Run **after** build_index.

### Rebuild from scratch
```
node scripts/build_index.mjs            # reads src/study-home.src.html -> index.html
node scripts/add_content.mjs add        # merges content/ + applies fixups/replace
```
After any change, bump versions so devices update (see Versioning), commit, and
merge to `main` to deploy.

## Content pipeline (flashcards & questions)
Study content lives as JSON in `content/`, kept separate from the app so new
courses drop in without touching the engine. `add_content.mjs`:
- merges `content/*.cards.json` (`{m,d,t,f,b}`) and `content/*.mcqs.json`
  (`{m,d,t,q,o:[],a,e}`) into `index.html`'s arrays (de-duped by front/question,
  parse-validated, idempotent)
- applies `content/fixups.json` — corrections to **existing** cards matched by
  front text: `{ "f": "<front to match>", "b": "<new back>", "f2": "<new front?>" }`
- applies `content/replace.json` — literal `[{from,to}]` swaps across all fields
- `content/_audit.json` is the saved output of a past semantic review (not used at build)

### Flashcard authoring rules (STANDING — apply to ALL cards, every course)
Cards must be **atomic** so SM-2 grading and the `needwork`/`unseen`/`known` buckets
work at the right granularity (one missed term shouldn't force re-drilling a whole
cluster). The `f` (front) must be a real **question/prompt**, never a bare topic label
(no `"f":"Types of Insurance Agents"`). The "Definition first" toggle already gives the
def→term direction for free, so **do NOT author reverse-clone cards.** Decide a card's
shape by what it is:
- **Unrelated facts bundled together** (e.g. "How is ACV calculated, and what is
  subrogation?") → **split into separate atomic cards**, no list card. Test: if the two
  halves would never share one exam question, they don't share a card.
- **A term-set you must recall as a group** (contract characteristics, agent types,
  agent-authority types, contract-dispute doctrines) → **one list card** ("Name the four
  characteristics…") **+ one atomic card per term** ("What makes a contract *unilateral*?").
- **A binary / small contrast** (moral vs. morale, mutual vs. stock, pure vs. speculative,
  contributory vs. comparative) → **keep as ONE "distinguish X from Y" card.** Don't
  atomize — splitting adds friction with no learning gain.
- **A checklist of conditions/steps** (insurable-risk elements, 5 contract requirements,
  7-step RM process) → the **list card** is the primary target; only atomize an item that
  carries standalone definitional weight.

When two decks teach the same concept (the original app `CARDS` in `src/study-home.src.html`
vs. `content/*.cards.json`), **de-dupe to one keeper** — the de-dupe is by exact front text,
so differently-worded duplicates both survive unless you remove one. Policy: **content JSON is
the home**; author the reconciled atomic/list cards there and strip the duplicates out of the
source `CARDS` array. **STATUS: complete for FP511 + FP512** — every module of both courses
was reconciled this way (FP512 M1 in v2.18.0; all remaining FP511 M1–7 and FP512 M2–8 in
v2.19.0 via a 14-module author→QA agent pass). As a result **ALL FP511/FP512 flashcards now
live in `content/*.cards.json`** (the app `CARDS` array no longer contains any FP511/FP512
flashcards — only their MCQs remain in source). `content/extra.cards.json` is now empty and
`content/fixups.json` was cleared (its 3 corrections are baked into the reconciled cards).
Future courses (FP513+) should be authored atomic from the start, so this de-dupe step won't
recur — but keep applying the shape rules above.

Taxonomy (the `d` domain code drives analytics / exam-weight readiness):
| m | course | d | domain | weight |
|---|---|---|---|---|
| FP511 | General FP, Conduct & Psychology | A | Conduct & Regulation | 8% |
| FP511 | | B | General Principles | 15% |
| FP511 | | H | Psychology | 7% |
| FP512 | Risk, Insurance & Benefits | C | Risk Mgmt & Insurance | 11% |
| FP513 | Investment Planning | D | Investment | 17% |
| FP514 | Income Tax Planning | E | Tax | 14% |
| FP515 | Retirement | F | Retirement | 18% |
| FP516 | Estate Planning | G | Estate | 10% |

Current content: **FP511 + FP512 only** (~579 cards, ~421 MCQs), textbook-grounded
and audited. All flashcards are atomic/list-shaped (see authoring rules above). **FP513–518 are "coming soon"** placeholders — the user has NO
textbooks for them yet and will drop each into the Google Drive `CFP` folder when
available. `MODULES`/`DOMAINS` in the source already scaffold all 8.

### Per-module filtering (sub-modules within a course)
The Study tab can filter flashcards & quizzes down to a single **module within a
course** (e.g. "FP512 → Module 4 — Annuities"), in addition to the whole-course
filter. How it works (all in `src/study-home.src.html`, defined next to `MODULES`):
- `MODMETA` — `{ course: { moduleNumber: "Module name" } }`, mirroring the 8-module
  maps in the Interactive Readers' "Course Scope & Module Map" tables.
- `TOPIC_MOD` — `{ course: { "<topic t>": moduleNumber } }`. A card/MCQ's module is
  derived from its `t` (topic) via `moduleOf(x)` (0 = unmapped). **The data has no
  module field** — this topic→module lookup is the only thing that assigns modules,
  so it must cover BOTH the fine-grained `content/*.json` topics AND the coarse
  module-level topics shipped by the original app cards (e.g. "Life Insurance").
- `window.MODF` holds the active sub-module ("ALL" or a number); `filt()` and
  `runFlash()` (and `flashcards.js`'s deck builder) honor it. The `#studyModuleNum`
  `<select>` is populated by `fillModuleNumSelect()` and only lists modules that
  actually have content; it resets to "All modules" when the course changes.
- Validate coverage after editing: every card/MCQ topic should map (generic
  "FP511 textbook" MCQs are intentionally left unmapped → "All modules" only).

### Adding a new course (the standard request)
1. User puts the new course's textbook in their Drive `CFP` folder.
2. Generate `content/fp51X.cards.json` + `fp51X.mcqs.json` grounded ONLY in that
   textbook (tag with the right `m`/`d` from the table). Past method: download the
   PDFs from Drive (MCP `Google_Drive`), decode base64 to disk, read with the Read
   tool, author concise exam-focused Q&A. Quality > quantity; flag anything uncertain.
3. **Create a matching Interactive Reader** for the course (the user wants one per
   course) and run `node scripts/inject_reader_theme.mjs apps/fp51X-reading.html`.
   Link it from `moduleLinks()` in `build_index.mjs`.
4. **Add the course to the per-module filter:** in `src/study-home.src.html` add a
   `MODMETA.FP51X` entry (module names = the reader's module map) and `TOPIC_MOD.FP51X`
   mapping every topic you used to its module number. Without this the new course's
   flashcards/quizzes won't be filterable by module (they'd all be "unmapped").
5. `node scripts/add_content.mjs add`, bump versions, deploy.
6. **Add Module Hub content** for the course in `module-content.js` (`MODOBJ`,
   `MODSYN`, optional `MODEX`, plus `TAB_MAP.FP51X` and `READER_MAP.FP51X`). See
   the Module Hub section below.

## Module Hub (per-module deep dive — Modules tab)
Each course card on the Modules tab has a **"📂 N modules — tap to deep-dive"** button
(`courseModuleList` in `src/study-home.src.html`) that jumps STRAIGHT into the first
openable module's **Module Hub** (`#modhub` section, rendered by `renderModuleHub`) — no
intermediate list (v2.48.0; the old `<details>` module list was dropped since the hub's
own M1/M2/… `moduleSwitcher` chips navigate between modules faster than scrolling a list). A module is openable if it
has tagged cards/MCQs **or** authored teaching content (then it shows a "guide" badge,
e.g. FP511 M8 Case Study which has no cards). The hub assembles, all scoped to that one
module: learning-objectives self-check, "how it connects"
synthesis, a worked example, an auto quick-reference cheat-sheet (the module's cards),
module mastery %, item counts, and launch buttons (`studyScoped` → `window.MODF`-scoped).
(v2.66.0: the **📖 Deep-dive reader** button was REMOVED from the "Study this module"
quick-nav row — the reader now lives only on the Modules-tab course card alongside the AI
whole-course deck — and a **📄 Cheat sheet** button (`openCheatSheet`, shown when the module
has cards or `MODCHEAT` content) was added in its place. The `hasReader` const was dropped.):
**Flashcards**, **Readiness check** (`runAdaptive` — adaptive PRACTICE: instant feedback,
pool tiered missed→unseen→rest, not scored), and **Exam** (`runModuleExam` — exam-style:
answer all then a scored verdict + ⚠ weak-spot tags with reader/cheat-sheet links + a
collapsible full review; `mcqRunner(...,{exam:true})` defers feedback and `onDone` stores
`S.modReady[course_mod]` incl. `prev` for the ▲/▼ delta). Exam button shows "· limited"
when a module has <8 MCQs; hidden under 3 (e.g. Case Study). Self-check state =
`S.objChecked[course_mod]`. The hub header also has a **module switcher** (`moduleSwitcher`): ‹ Prev / Next › + M# chips to jump straight to another module's hub without returning to the module map (only openable modules are clickable). New state keys: `modReady`, `objChecked` (migrated in `load()`).

- **Calculator drills are module-tagged:** each `CALCGEN` generator in `src/study-home.src.html` has a `mods:[..]` array (a drill can belong to several modules). The Module Hub shows the **Calc drills** button only when a generator matches that module, and `runCalc` filters by `window.MODF` so a module-scoped launch runs only its drills (course-wide runs all). FP511 calc lives on M3/M4/M7; FP512 on M2/M4/M7.
- **Authored content lives in `module-content.js`** (loaded before `flashcards.js`,
  precached in `sw.js`): `MODOBJ[course][mod]` (objective strings), `MODSYN[course][mod]`
  (synthesis paragraph), `MODEX[course][mod]` (`{title, html}` worked example),
  `MODCHEAT[course][mod]` (`{keyNumbers:[[label,detail]], mustKnow:[], traps:[], tips:[]}`),
  `TAB_MAP[course][mod]` (reader tab id), `READER_MAP[course]` (reader path). The engine
  reads these with graceful fallbacks, so adding a course = add entries here, no engine change.

### Printable exam cheat sheet (Module Hub → "Exam cheat sheet")
`openCheatSheet(course,mod)` (in `src/study-home.src.html`) renders a full-screen,
**print-to-PDF** sheet from `MODCHEAT` + the module's cards: gradient header, ★ key
numbers grid, must-know rules beside ⚠ traps / ✓ tips boxes, and a two-column term
reference. `buildCheatHTML()` builds it; `ensureCheatCSS()` injects the `ck-*` styles
incl. an `@media print` block that hides everything but `#cheatPrint` (so "Save as PDF /
Print" outputs only the sheet, full-width, color-exact). Case-study modules author only
`mustKnow`+`tips` (no key-numbers/traps) so they render lighter. The hub shows the button
when a module has cards OR `MODCHEAT` content.
- **Visual upgrade (v2.64.0).** The `ck-*` styles were restyled to the warm visual-deck
  aesthetic (same data, no content change): key numbers render as **accent-bordered stat
  tiles** (responsive `auto-fit` grid, per-domain accent from `DOMAINS[].c`), must-know sits
  in its own **gold `.ck-know` box** beside warm-red `.ck-traps` / green `.ck-tips`, and the
  header gradient is green→domain-accent→terracotta. A `@media(max-width:560px)` rule
  collapses the key-number/main grids and term columns to 1-up on phones. This was the
  "option 2" chosen over building standalone per-module HTML visual guides — it upgrades the
  look of **every** FP511/FP512 module's cheat sheet at once with one styling change, and the
  static `INFOGRAPHICS` images were deliberately kept as-is (still surfaced on the "Visual
  guide" card).

**Global quick references** (the `KEYS` and `TIPS` data): `runKeys()` / `runTips()` render
into the SAME printable overlay via `openRefOverlay(html)` (reuses `#cheatWrap`/`ensureCheatCSS`).
They are NOT module-scoped study modes — they live as **"Quick references"** buttons on the
Dashboard and atop the Modules tab (📊 Key numbers · 🎯 Exam tips & traps), and were removed
from the Study `#studyMode` dropdown in v2.13.1.

## Interactive Readers
> **STANDING RULE — readers are the COMPLETE visualized source of truth.** Each course's
> reader must contain EVERYTHING in that course's textbook — every concept the flashcards,
> MCQs, or exam cheat-sheets (`MODCHEAT`) teach must also be explained in the reader. The
> **textbooks are the authority**, stored in Google Drive under **`CFP → Textbooks`** (each
> course as a whole PDF, plus split halves, e.g. `FP512 Modules 1-4` / `5-8`). When you add or
> revise a course — or whenever asked to check — run a **coverage cross-check**: extract the
> distinct card/MCQ topics + `MODCHEAT` key terms per course, grep the reader text, and confirm
> each concept is present (verify the *concept*, not just the phrase — many are worded
> differently). Fill any genuine gap with a concise, style-matched entry in the right tab,
> grounded in the textbook (the audited cards are a faithful textbook distillation and fine to
> ground from). This applies to ALL future courses (FP513+). (History: a v2.11.x audit added
> physical-hazard, 1035 exchange, Section 132 fringes, mutual-vs-stock, yield curve, financial
> therapy, cultural humility, PTIN, mortgage points, written-disclosure list, BOP-vs-CPP, etc.)

### Deep-knowledge layer — readers are the DEEP-understanding surface (v2.69.0)
The readers were re-roled as the **deep-understanding / reference layer** (vs. the slide decks'
visual first-pass). Rationale: the decks and readers had drifted to the *same altitude*; the
reader's unique job is the "why," the full mechanics, the exceptions, and the cross-module
picture a slide can't hold. Both readers now carry **five additive patterns** (existing content
untouched — every original table/box/chart stays; the new depth sits *behind* toggles and in
dedicated blocks). All content is **textbook-verified** (grounded via researcher passes over the
FP511/FP512 Modules PDFs in `CFP → Textbooks`; worked examples reuse the textbooks' own numbers).
- **1 · Depth stratification** — opt-in `🔬 Go deeper` expandables (`.deep-toggle` + a
  collapsed body). FP512 reuses `data-toggle`/`.collapsible-content.collapsed`/`.toggle-icon`;
  FP511 reuses its `data-t`/`.cc.closed`/`.tog`. Both start collapsed so the deep content is
  read-on-demand and wires into each reader's existing collapsible JS with **no new script**.
- **2 · Worked mechanics** (`.worked`) — a calc fully worked with formula, **calculator
  keystrokes** (`.keys`, dark terminal block), a `.wrong` common-wrong-method callout, and a
  `.tryit` variant. Examples use the textbook's framings: FP512 coinsurance (Zachary→$17,750),
  HLV (2.9126%→$1,281,305), exclusion ratio (Clara), §79 imputed income (Table I, John→$552),
  Part D, DI taxation; FP511 debt ratios (Grace), TVM keystrokes, 3-step education funding
  (Mary→$29,391/$3,434), AOTC ($800 refund), money illusion.
- **3 · Confused pairs** (`.confuse` + a `.tell` "how to tell them apart") — the two-plausible-
  answer distinctions (HO-3 vs HO-5, GMIB/GMWB/GLWB, MEC vs non-MEC, own-occ vs any-occ,
  cognitive vs emotional bias, fiduciary vs suitability, 529 vs Coverdell, AOTC vs LLC, …).
- **4 · Cross-module synthesis** (`.synth`) — tables/callouts that span modules/courses
  (annuity-vs-life-vs-IRA taxation; risk-process ↔ FP511 7-step planning process; life §101
  income-free-but-estate-included → FP516).
- **5 · Primary-source anchoring** — inline `.srcref` chips (`IRC §72`, `§1035`, `NAIC #275`,
  `DEFRA 1984`, `SECURE 2.0`, CFP Board Standards, etc.) + a per-tab `.sources` footer. Where a
  textbook names a concept but not the code number (e.g. FP512 names DEFRA 1984 / TAMRA 1988 for
  the §7702 / §7702A concepts), the footer says so. **All FP512 dollar figures are 2025-vintage**
  (the 2026 course text still prints 2025 limits; 2026 Medicare wasn't published at press time).
- CSS lives in each reader's own `<style>` block (a `DEEP READER LAYER` comment section). Colors
  use the readers' existing light-mode hues, so the **filter-based dark mode inverts them for
  free** — no dark-mode-specific rules needed. Coverage: FP512 ~15 go-deeper / 10 worked / 16
  confused / 5 synth / 9 sources; FP511 ~2 go-deeper / 5 worked / 12 confused / 1 synth / 6
  sources. When adding a new course reader (FP513+), author these five patterns from the start.

`apps/fp511-reading.html`, `apps/fp512-reading.html` — standalone long-form reading
docs (their own styling). They have injected: a "Home" button (back to `../index.html`),
SW registration, and the shared **reader theme** (`reader-theme.css` + `reader-theme.js`,
injected by `scripts/inject_reader_theme.mjs`). Theme = warm canvas + dark mode that
**syncs with the app** via the shared `cfpTheme` localStorage key (filter-based dark
mode on a content wrapper so fixed buttons/charts stay correct). Their Chart.js and
(FP512) MathJax are vendored locally (`vendor/chart.umd.js`, `vendor/mathjax/tex-mml-svg.js`).
- **Back to Module / Modules (v2.46.0, always-shown v2.70.0).** Opening a reader from a Module Hub
  (`openReaderTab`) stashes `sessionStorage.cfpReaderReturn = "COURSE/mod"`; `reader-theme.js`
  injects a **`#rdrBack`** pill (outlined so it reads distinct from the solid Home/Theme pills).
  As of **v2.70.0 the back pill is ALWAYS shown** (readers AND decks) so there's a one-tap path
  back into the modules area regardless of how you opened it: with `cfpReaderReturn` set it reads
  **‹ Module N** → `../index.html#m/COURSE/mod` (the exact hub); course-wide (flag cleared) it reads
  **‹ Modules** → `../index.html#modules` (the Modules tab / module map). The app's hash handler
  (`openFromHash`, next to `#m/` routing) now also recognizes **`#modules`** → `go('modules')`.
  Home still → Dashboard. **Slide decks** carry the identical logic in their own inline chrome
  script (`#dkBack`, baked into every `apps/*-slides.html` — no separate injector; update the block
  in each deck file). The Modules-tab course-card reader link still clears the flag on click so a
  course-wide open shows **‹ Modules**, not a stale module number.
- **Portrait overflow fixes (v2.46.0, in `reader-theme.css`/`.js`, so every reader benefits).**
  Wide tables were clipped past the right edge in portrait (`.collapsible-content{overflow:hidden}`
  with no scroll — you had to rotate to landscape). `reader-theme.js` now wraps each `<table>` in a
  `.tbl-scroll` div (`overflow-x:auto`) so it swipes horizontally; long words/inline content wrap
  (`overflow-wrap:break-word`); and `.key-list li` (which is `display:flex`, so mixed inline content
  became non-wrapping flex items) is overridden to `display:block` with a hanging ▸ marker. Verified
  headless at 390px: zero elements overflow the viewport outside a `.tbl-scroll` on either reader.
- **Auto-hide floating chrome on scroll (v2.72.7, in `reader-theme.css`/`.js`).** The six fixed buttons
  (Home/Theme/Back pills + the 🎙️ Podcast / 👩‍🏫 Teach / 🔍 search FABs) were covering reader content.
  A `scroll` listener in `reader-theme.js` toggles `body.rdr-hidechrome` — **scrolling down hides** all of
  them (fade + `translateY(30px)`, `pointer-events:none`), **scroll-up or a 900 ms scroll-stop reveals**
  them, and they're always shown within 140 px of the top. CSS targets all six IDs by `body.rdr-hidechrome`.
  Independent of playback (during playback they're already hidden by `body.rt-on`), so no flicker from the
  audio's own auto-scroll. Reader-agnostic.
- **Reader deep-linking:** both readers honor a URL hash (`…#annuities`) to open a
  specific tab — the Module Hub uses this. FP511 defers the initial hash open to the
  `load` event (its chart fns are defined late); FP512 opens it in `DOMContentLoaded`.
  Tab ids per module are in `TAB_MAP`. If you re-import a reader artifact, re-add the
  hash-open snippet near `activateTab('overview')` / the tab `go()` setup.
- **In-reader search** (`reader-search.js`, shared; injected by `inject_reader_theme.mjs` with its own `reader-search-injected` marker, precached in `sw.js`): a floating 🔍 opens a search panel that indexes EVERY tab + collapsible section (even hidden ones — native find-in-page can't), lists hits as **Tab › Section** + snippet, and on tap switches tab, expands the section, scrolls, and highlights. Reader-agnostic: maps sections→tabs by probing which `.active` panel contains them, and drives navigation by clicking the existing `.tab-btn`/section headers — so it works on FP511, FP512, and future readers with no per-reader code.
- **Reader read-aloud / "podcast mode"** (`reader-tts.js`, shared; injected by `inject_reader_theme.mjs` with its own `reader-tts-injected` marker, precached in `sw.js`): a floating 🎙️ Podcast FAB reads the **whole reader** aloud block-by-block via the offline Web Speech API, **flowing automatically across all tabs** (press play once, hands-free), highlighting + auto-scrolling each block and auto-expanding collapsed sections as it reaches them, with a ⏮/⏸/⏭/⏹ + speed control strip. **Resumes where you left off** (per-reader `localStorage` bookmark → FAB shows 🎧 Resume), keeps the screen awake (Wake Lock), and recovers if the OS stops speech while backgrounded. Reader-agnostic (tabs = `.tab-btn`, reading root = largest `.active` panel). A separate **👩‍🏫 Teach** FAB (`reader-teach.js`) instead speaks a **teacher's explanation** of the current tab (not verbatim) while auto-scrolling/expanding each section — pilot: FP512 » Insurance Principles. See the "Reader read-aloud" + "Teach mode" subsections under the Study engine for the full mechanics.

### Visual slide decks — native HTML, Kaplan vs AI (v2.62.0)
The **"Slide deck"** card no longer opens raw PDFs. Each course's slides are rebuilt as
**standalone responsive HTML "visual decks"** in `apps/` (`fp512-m{1..8}-kaplan-slides.html`,
`fp511-m{2,4,5,6,7}-kaplan-slides.html`, `fp511-ai-slides.html`, `fp512-ai-slides.html`,
`fp512-m{1,2}-ai-slides.html`) — mobile-first,
offline, self-contained (inline SVG charts, no CDN; only the vendored `../vendor/fonts`
Dancing-Script woff2), authored light-mode inside `#rdrWrap`. They turn the source slides'
dense text into comparison tables, stat tiles, SVG charts, colour-coded trap/tip callouts, a
styled worked-example (`.calc`), and tap-to-reveal quiz cards (`.quiz <details>`). The shared
component CSS + progress-bar/theme `<script>` live in the M3 template
(`apps/fp512-m3-kaplan-slides.html`) and are copied verbatim into each deck. Home + conditional
"‹ Back to module" chrome was injected by a one-off `inject_deck_chrome.mjs` (marker
`deck-chrome-injected`) — the decks pre-wrap `#rdrWrap`, so `reader-theme.js` bails (its own
`if(#rdrWrap)return`); the decks carry their own theme toggle/dark-mode (synced via `cfpTheme`)
instead of the reader-theme bundle.
- **Data: `window.DECKS`** (hand-authored in `module-content.js`, OUTSIDE the sync_media
  GEN markers) = `{ COURSE: { mod: [ {src, title, kind} ] } }`, `kind ∈ 'kaplan'|'ai'`. Module 0
  = whole-course deck (shown on the Modules-tab course card via `courseSlides`). Add a deck =
  drop the `apps/*.html` + add an entry here (no engine change); also add it to `CORE_ASSETS`
  in `sw.js` (decks ARE precached — they're small HTML) and bump versions.
- **`openDeck(course,mod,idx)`** (in `src/study-home.src.html`, next to `openReaderTab`) opens
  a deck full-screen like a reader: for a module deck it sets `sessionStorage.cfpReaderReturn`
  (so the deck's back pill → `../index.html#m/COURSE/mod`), for a whole-course deck (mod 0) it
  clears it (Home → dashboard). `deckKindBadge(kind)` renders the green **KAPLAN** / purple
  **AI** pill so the two sources are always visually distinct (Module-Hub "Slide deck" card,
  quick-jump button, and course card). The old PDF path (`window.SLIDES` + `openSlides` iframe
  viewer) is now **dead code** (left defined, unreferenced) — the raw NotebookLM PDFs still
  sit in `assets/slides/` and `SLIDES` is still regenerated by `sync_media.mjs`, but nothing
  surfaces them anymore (they can be deleted later). `INFOGRAPHICS`/`VIDEO` are unchanged.
- The 13 Kaplan decks are grounded in the College for Financial Planning® (Kaplan) course
  slides (FP512 M1–M8; FP511 M2,4,5,6,7 — the user hadn't uploaded FP511 M1/M3/M8 as of
  v2.63.0); the 4 AI decks in the NotebookLM PDFs (badged AI — the M7 Kaplan deck also corrects a source HSA-limit typo
  $8,500→$8,550; a few FP511 Kaplan decks reconstructed image-only source slides from the
  published CFP Board Code, flagged inline).
- **Whole-course AI decks = audited "High-Yield Exam Review" decks (v2.74.0).** The two module-0
  AI decks (`fp511-ai-slides.html`, `fp512-ai-slides.html`) were retitled from "Full-course
  walkthrough" to **"High-yield exam review"** (DECKS titles + in-deck `<title>`/h1/`.sub`) and
  **fully audited**: every figure/rule cross-checked against the textbook-audited repo sources
  (MODCHEAT, `content/*.json`, the readers); wrong NotebookLM claims fixed (e.g. the FP512
  risk-management matrix quadrants were flat-out wrong; collateral-source-vs-indemnity;
  HIPAA LTC trigger) or removed when unverifiable (e.g. "spend 10% of income on risk
  protection", 2503(b)/(c) trust rows); high-yield gaps filled from MODCHEAT/cards (FP511
  gained a whole Domain A Code & Standards section; FP512's M2/M5/M7 placeholder sections got
  real content: HO forms, PAP, COBRA/Medicare/HSA numbers, §79/§125). Sections now carry
  exam-domain weights (FP511 = A 8% + B 15% + H 7% = 30%; FP512 = C 11%); the old "verify
  figures" footer warning now states figures were cross-checked (AI provenance badge kept).
  These decks are the exam-cram surface; the readers remain the complete deep-dive.
  **The FP512 content pass is DONE** (v2.63.0): the
  genuinely-new facts were cross-checked into the flashcards (+24) and MCQs (+8) in
  `content/fp512-textbook.*.json` and into `apps/fp512-reading.html` (M3 settlement options,
  M7 group carve-out & §79 70/85 tests, inherited-annuity taxation, punitive-damages, ACA metal
  tiers, HIPAA-qualified LTC, etc.). An equivalent FP511 content cross-check is not yet done.

## Per-module media — infographics & slide decks (Module Hub)
Each Module Hub can show, under "Study this module", a **"Visual guide"** card (one-page
**infographic** images), a **"Slide deck"** card (native **HTML visual decks** — see the
"Visual slide decks" section just above; formerly NotebookLM slide PDFs), and a
**"Video"** card (NotebookLM/AI **video clips**), each scoped to that one module. All open a
full-screen popup or page; `renderModuleHub` reads the data maps with a graceful empty-default (no
card when a module has none). All in `src/study-home.src.html`:
- **Quick-jump buttons (v2.41.0).** The **"Study this module"** launch row gets a
  **📊 Visual guide**, **📊 Slide deck**, and **🎬 Video** button whenever that module has
  `INFOGRAPHICS`/`DECKS`/`VIDEO`. **Behavior (v2.67.0):** with exactly ONE item the button
  opens it directly (`openInfographic`/`openDeck`/`openVideo(course,mod,0)`); with MORE THAN
  ONE it instead **smooth-scrolls down to that section's card** via `hubScroll(id)` (the
  `#hubInfo`/`#hubDecks`/`#hubVideo` cards) so you pick from the full list rather than getting
  a guessed item-0 (label also pluralizes when >1). The fuller preview cards below list every
  item. (The **📖 Deep-dive reader** button was removed from this row in v2.66.0 — see the
  Module Hub section; the Slide-deck button uses `openDeck`/`window.DECKS`, not the dead PDF
  `openSlides`/`SLIDES` path.)
- **Infographics** — data `window.INFOGRAPHICS` (course → module → `[{src,title}]`).
  Thumbnail grid; `openInfographic`/`closeInfographic` show the image in `#infoWrap`
  (styles via `ensureInfoCSS`); tap backdrop or ✕ to close.
- **Slide decks** — data `window.SLIDES` (same shape). Labeled buttons; `openSlides`/
  `closeSlides` render the PDF in a full-screen `<iframe id="slideFrame">` inside
  `#slideWrap` (styles via `ensureSlideCSS`). The toolbar has an **⤢ Open** link
  (`target="_blank"`) as a fallback because **iOS Safari can't render a PDF inside an
  iframe**.
- **Videos (v2.42.0)** — data `window.VIDEO` (course → module → `[{src,title}]`; also
  supports whole-course under module 0). Labeled 🎬 buttons; `openVideo`/`closeVideo` render
  a full-screen HTML5 `<video id="videoEl" controls autoplay playsinline>` inside `#videoWrap`
  (styles via `ensureVideoCSS`); `closeVideo` pauses before clearing so audio stops. Keep
  clips as **H.264 video + AAC audio in MP4** — the most iOS-/Safari-compatible format (don't
  transcode NotebookLM MP4s to WebM; that *loses* Safari support). NB open-source Chromium
  can't decode H.264, so headless-browser tests show `error:4` even though real Safari/Chrome
  play fine — verify the file *serves* + the element gets the right `src`, not pixels.
  - **Toggleable captions (v2.97.0).** Drop a caption file next to a video, named the same
    (`FP512-M5-Health-Insurance-Review.vtt`, or a `.srt` which `sync_media.mjs` auto-converts to
    `.vtt` via `srtToVtt()`), and `sync_media` adds a `cc:'assets/video/….vtt'` field to that
    `window.VIDEO` entry. `openVideo` then renders a `<track kind="captions" … default>` so the
    HTML5 player shows a **CC toggle on PC and iPhone** (iOS exposes it in the native fullscreen
    controls). Filename-driven and a **no-op when no caption file exists** (no `cc`, no track).
    `.vtt` is runtime-cached like the video (same-origin SW path), so it's offline after first
    online view. Producing the caption text needs an external transcript/auto-caption — the
    sandbox has no speech-to-text.
- **Audio podcasts (v2.73.0)** — data `window.AUDIO` (course → module → `[{src,title}]`; module 0 =
  whole-course), for **NotebookLM Audio Overviews** (natural-voice "deep dive" episodes — the real human-
  sounding narration the offline TTS Teach/Podcast can't do). Surfaced as a **🎧 Podcast** card + quick-jump
  button in the Module Hub (and a 🎧 link on the course card for whole-course/module-0 episodes via
  `courseAudio`). `openAudio`/`closeAudio` render a **docked mini-player** (`#audioMini`, v2.73.4) — a
  compact bar above the bottom tab bar (`bottom:calc(56px + safe-area)`, `z-index:100005` so it floats
  over cheat-sheet/infographic overlays), NOT full-screen, so the podcast **keeps playing while you
  browse** the module hub / a cheat sheet / flashcards (it lives on `<body>` and in-app navigation
  doesn't remove it; opening a full *reader* is a separate page so playback pauses there). Title + ⤢-open
  fallback + ✕, then `<audio id="audioEl" controls autoplay>`; `closeAudio` pauses first. **Resume-where-
  you-left-off (v2.73.5):** the position is saved to `localStorage['cfpAudioPos:'+src]` on timeupdate
  (throttled), pause, close, and page-hide/background (`audioSaveCurrent`), and restored on
  `loadedmetadata` when you reopen; clears at end. **Keeps playing into the whole-course exam-review deck
  (v2.73.5):** while the mini-player is open (`podcastOpen()`), `openDeck` opens the deck in an in-app
  iframe overlay (`#deckWrap` → `openDeckOverlay`/`closeDeckOverlay`, z-index 100002 under the mini-player's
  100005) instead of a full navigation, so the audio doesn't stop; same-origin, so it hides the deck's own
  Home/back pills inside the frame and exits via the overlay ✕. (Full *readers* are still a real navigation
  → the podcast pauses+saves there; the readers have their own audio.) Files live in **`assets/audio/`** (`.m4a`/`.mp3`/`.aac`/`.ogg`),
  **NOT precached** — runtime-cached on first play via the SW range branch below. **M4A (AAC) is the ideal
  format** (native iOS/Safari playback, already compressed). Watch file size: **GitHub caps files at 100 MB**,
  and a raw NotebookLM export can exceed that — transcode down first (e.g. `ffmpeg -i in.m4a -c:a aac -b:a
  64k -ac 1 out.m4a`) so it fits the repo and caches well on a phone. Binary media can't be pulled through
  the Drive MCP tool at size (base64 overflows context) — get files in by **uploading them into the chat**
  (they land on disk) and copying into `assets/audio/`.
- **Media length badges (v2.88.0).** `sync_media.mjs` parses each video/audio file's real
  duration from its MP4/M4A `mvhd` atom (`probeDur()` — offline, no ffprobe) and writes a
  `dur` (seconds) field into the `window.VIDEO`/`window.AUDIO` entries. The Module Hub's 🎬
  video and 🎧 podcast buttons render a length chip via `mediaLen(g)` (in
  `src/study-home.src.html`, next to `openVideo`) — e.g. a full ~10-min lesson reads distinctly
  from a ~1-min high-yield clip, and a ~24-min podcast is labelled as such. `dur` is optional:
  if the atom can't be read the chip is simply omitted. Re-run `sync_media.mjs` after adding
  media to populate it.
- **SW range-safe media caching (v2.42.0).** `<video>`/`<audio>` fetch with a `Range` header,
  and the Cache API can't store/replay a `206`. So `sw.js`'s same-origin handler has a
  `req.headers.has('range')` branch that refetches the **full** file (no Range → `200`),
  caches it keyed by URL, and returns it (browsers accept a `200` for a Range request) — so
  runtime-cached video plays offline on later views.
- **Whole-course slide decks (Modules-tab course card, v2.36.0)** — a per-course deck lives
  under **module `0`** (`SLIDES[course][0]`). `courseSlides(course)` renders it as a **📑 link
  on the course card in `renderModules`, right under "📖 Open interactive reader" and above the
  "📂 N modules — tap to deep-dive" list** (the user wanted the course-wide NotebookLM slides
  reachable there for quick access). It reuses the same `openSlides(course,0,i)` viewer; module 0
  is never a real Module Hub so it only ever surfaces on the course card. Filename = **`FP<course>[-Free
  Text Title].pdf`** (NO `-M<module>` segment, e.g. `FP511.pdf` → default "Slide deck"); `sync_media.mjs`
  routes any `-M#`-less file to module 0 via its `NAME_COURSE` fallback. Same offline behavior as
  module slide PDFs (runtime-cached, not precached).
- **Files are LOCAL (offline rule).** Source media lives in Google Drive under
  **`CFP → Infographics`** and **`CFP → Slides Notebook LM`** — pull into the repo (or the
  user uploads here); never hot-link Drive. Storage split by size:
  - `assets/infographics/` images → stored as **WebP** (~0.4–0.5 MB each) and **precached**
    by `sw.js` into an **unversioned** `fpsl-media` cache (`MEDIA_ASSETS`), so they survive
    version bumps without re-downloading (kept out of the versioned core/runtime caches;
    `activate` cleanup excludes `MEDIA_CACHE`). **Convert source PNGs to WebP on ingestion**
    (`ffmpeg -i in.png -c:v libwebp -quality 92 out.webp`) — a text-dense 1536-wide guide goes
    ~4.5 MB PNG → ~0.4 MB WebP (10×) with text still crisp; q92 is the safe floor for dense
    tables. iOS Safari 14+/Chrome decode WebP fine. (v2.45.0 converted the original 9 PNGs; the
    old `.png` blobs may linger orphaned in existing devices' unversioned `fpsl-media` cache —
    harmless, browser-evictable.)
  - `assets/slides/` PDFs (~20–25 MB each), `assets/video/` clips (MP4), and `assets/audio/`
    podcasts (M4A/MP3) → **NOT precached** (too big for install); they're **runtime-cached on
    first view/play** by the SW's same-origin path (video/audio via the Range-safe branch above),
    so they're offline after being opened once online. Watch repo size as media piles up (GitHub:
    100 MB/file hard limit, ~1 GB repo soft) — compress or rehost if it grows. NotebookLM **video**
    exports as MP4 (fine); NotebookLM **audio** exports as WAV or a hefty M4A — transcode/compress
    down (target ~64 kbps: `ffmpeg -i in.m4a -c:a aac -b:a 64k -ac 1 out.m4a`) so it fits under the
    100 MB file limit and caches well on a phone.
  - **STANDING RULE — storage budget (media accumulates in git history).** A normal delete
    (`git rm`) removes a file from the live app/deploy immediately (the deployed PWA + phone
    precache only ever contain CURRENT files — history never ships), but it does NOT shrink the
    `.git` history on disk, so the repo size grows monotonically under casual add/delete. That
    history IS reclaimable — it's not permanent: purge a blob from all past commits with
    `git filter-repo` (or BFG) + a force-push to main (heavier one-time op; safe here since it's a
    single-user repo that deploys from main). So: delete media anytime to slim the app; run a
    history rewrite only when the repo itself approaches the limit. Budget against GitHub's
    **~1 GB repo/Pages soft limit** (100 MB/file hard).
    **As of v2.88.0: `.git` ≈ 470 MB, `assets/` ≈ 420 MB (audio 281 · video 121 · rest 18) — about
    half the soft limit for 2 courses.** At this density each further course adds ~250–400 MB, so
    all of FP513–518 would blow past 1 GB. Therefore: **always compress audio to ~64 kbps MONO
    before committing** (`-b:a 64k -ac 1` — a ~24-min NotebookLM episode goes ~23 MB → ~11 MB, no
    audible loss for speech); keep video's audio track ≤96 kbps and resolution modest. The sandbox
    ffmpeg is a Playwright video-only build and **can't transcode AAC/H.264**, so compression must
    happen before upload (the user already runs a compressor; ask for 64 kbps mono if files arrive
    large). If a future multi-course push still approaches the limit, move `assets/audio`+`video`
    to **Git LFS** (its free tier is only 1 GB, so compression comes first) — never rehost to an
    external host (breaks the offline rule).
- **Adding one is filename-driven, no engine change.** Name the file
  `FP<course>-M<module>[-Free Text Title].<ext>` (title optional → "Visual guide" /
  "Slide deck" / "Video" / "Podcast"; e.g. `FP512-M1-Insurance-and-Risk-Management-Guide.png`,
  `FP512-M1-Principles-of-Insurance.pdf`, `FP512-M2-High-Yield-Property-and-Casualty-Rules.mp4`,
  `FP512-M1-Mechanics-of-Financial-Risk.m4a`) — or `FP<course>[-Title].<ext>` with no `-M#`
  for a **whole-course** deck (→ module 0, shown on the course card; see above) — drop it in `assets/infographics/`,
  `assets/slides/`, or `assets/video/`, then run **`node scripts/sync_media.mjs`** — it regenerates the
  `window.INFOGRAPHICS` + `window.SLIDES` + `window.VIDEO` blocks in `module-content.js` and the
  `MEDIA_ASSETS` precache list in `sw.js` (delimited by `/* INFOGRAPHICS-GEN-START/END */`
  and `/* SLIDES-GEN-START/END */` markers — don't hand-edit between them). Then rebuild
  (`build_index` + `add_content`), bump versions, deploy. Multiple files per module are
  supported.

## E-reader exports — EPUB for the XTEINK X4 (`scripts/build_epub.mjs`)
The user has an **XTEINK X4** pocket e-ink reader (4.3", 800×480, no backlight, physical
page-turn buttons, native **EPUB/TXT**) for passive on-the-go review. The app's
interactivity (SRS grading, TTS/Teach, adaptive quizzing) doesn't port to a page-turn
device, so instead `scripts/build_epub.mjs` emits **reflowable EPUB study documents from
the same sources the app already uses** — one source of truth, regenerate after content
changes. These are **one-directional**: reading on the device does NOT sync progress back.
- **Zero dependencies / offline-safe.** EPUB is written by a tiny **pure-JS ZIP writer**
  (STORE method + CRC32, no `npm install`, no `zlib`); output is **EPUB 2.0 + toc.ncx** for
  broad cheap-reader compatibility. All XHTML is emitted fresh (inline-whitelist sanitizer
  `inlineXhtml()` — keeps `b/i/em/strong/sup/sub/br`, decodes entities, re-escapes) so every
  file is guaranteed well-formed. There is **no package.json** (it's git-ignored) and none is
  needed. Validate with: unzip + `xmllint --noout` over every `*.xhtml/*.opf/*.ncx`.
- **Run:** `node scripts/build_epub.mjs` → writes **`dist/ereader/`** (committed, so they're
  also downloadable from the live Pages URL and importable on the phone). 8 files, per course
  (FP511/FP512): `*-Flashcards.epub` (one Q per screen, answer on page-turn via `page-break`),
  `*-MCQ-Practice.epub` (Q+options, then answer + explanation + "why the others are wrong"
  from `mcq-why.js`), `*-Exam-Cram.epub` (per-module `MODCHEAT` key-numbers/must-know/traps/
  tips + `MODOBJ`/`MODSYN`), `*-Reader.epub` (each reader tab → a chapter, reflowed to plain
  prose — scripts/svg/canvas/buttons/nav dropped, **tables linearized to bullet rows** since
  480px can't hold them, collapsible/`.ch` headers → `<h3>`, trailing "EXAM" badge stripped).
- **Data sources:** `content/*.{cards,mcqs}.json`, `mcq-why.js` (`window.MCQWHY`),
  `module-content.js` (`MODCHEAT`/`MODOBJ`/`MODSYN`, loaded via a `window` shim), and
  `apps/*-reading.html`. Grouping matches the Study tab by parsing **`MODMETA`/`TOPIC_MOD`**
  out of `src/study-home.src.html` (`moduleOf`). **Adding a course (FP513+) needs no engine
  change** — once its content JSON, reader, and `MODMETA`/`TOPIC_MOD`/`MODCHEAT` entries exist,
  `build_epub.mjs` picks it up (extend the `['FP511','FP512']` course loop at the bottom).
  NB the reader panel-id prefix differs per reader (`panel-` FP511 vs `tab-` FP512).

## Icons
- App icon = cursive **"CFP"** (Dancing Script) on **deep green `#1f4d3a`**
  (green chosen so it's NOT confused with Claude's orange app icon).
- Generated by `scripts/generate_icons.mjs` (renders SVG→PNG via `@resvg/resvg-js`,
  font `vendor/fonts/DancingScript-700.ttf`). To regenerate:
  `npm i @resvg/resvg-js && node scripts/generate_icons.mjs`
- `scripts/generate_icons.py` is the OLD pure-Python block-letter generator
  (superseded by the .mjs script; kept for reference only).
- iOS caches home-screen icons. When the icon changes, bump the `?v=N` query on
  the `apple-touch-icon`/`favicon` links in `build_index.mjs`, and the user must
  **delete + re-add** the home-screen icon.

## Cloud sync & mergeable memory (opt-in)
Cross-device progress sync, layered on top of the offline-first localStorage store
(the app is 100% functional offline; sync is opt-in). The **mergeable-memory core**
(`mergeState(a,b)` in `src/study-home.src.html`, exposed as `window.cfpMergeState`)
reconciles two saves field-by-field so devices combine instead of clobbering: union
seen/flags/objectives, most-recent-wins per card (`_mergeCard`), de-dupe attempts/misses
by `ts` **or content hash when ts-less**, max streak/sessions, higher mcq box. **Import**
(Backup panel) offers Merge (uses this) or Replace. The sync backend (below) reuses the
same merge. **`mergeState` must be idempotent** (`merge(x,x)` stringify-equals `x`, incl.
key set — don't synthesize keys like `lastBackup` that `a` lacks) — the gist sync reloads
when a load-time merge changes local state, so a non-idempotent merge spins the page in an
endless reload loop (the v2.23.0 ts-less-attempt + synthesized-`lastBackup` bugs; both fixed
v2.24.0/v2.25.0). As a backstop `cfp-gist-sync.js` reloads **at most once per tab session**
via a **`sessionStorage` flag** (`cfpGistReloaded`). NB it MUST be sessionStorage, not a
module variable — a module flag resets on every reload and so can't break a cross-reload
loop (that was the v2.24.0 `reloadOnce` miss). Verify idempotency by running `merge(x,x)`.

> **History — Google Drive sync removed in v2.23.0.** The original backend (`cfp-sync.js`,
> v2.15.0) synced to the Drive app-data folder via Google Identity Services (GIS). GIS
> access tokens expire ~hourly and the only silent refresh relies on a hidden-iframe read
> of the Google session cookie — which iOS blocks inside an installed standalone PWA, and
> which (after the v2.21.0 on-load auto-refresh) tripped Safari's "allow … to sign in"
> prompt on **every load**, on both iPhone and desktop. It was deleted in favor of the
> popup-free GitHub Gist backend. `cfp-sync.js` no longer exists; if you ever reintroduce
> a Google backend, do NOT auto-run a silent token request on load.

### GitHub Gist sync — popup-free (v2.22.0, sole backend since v2.23.0)
**Why it's used:** a GitHub **personal access token (classic, `gist` scope)** does NOT
expire, so sync is fully silent on every platform (no popup ever, including the installed
iPhone PWA) — unlike Google's short-lived session tokens.
- **`cfp-gist-sync.js`** (loaded after `flashcards.js`; precached in `sw.js`): stores the
  save as one file (`cfp-study-progress.json`) in a **secret gist** via the GitHub REST
  API (`https://api.github.com/gists`). The token is pasted once and kept ONLY in this
  device's `localStorage` (`cfpGistToken`; never in the repo); the gist id is cached in
  `cfpGistId`. Flow: connect (paste token) → `findGist()` (lists the user's gists and
  links to the one holding our filename, so a 2nd device with the SAME token auto-joins,
  else `createGist`) → pull+merge+push (+reload if changed). `save()` is wrapped → 5s
  debounced silent `pushOnly`; on tab-hide → `pushOnly`; on load (if connected) →
  pull+merge+push once. All silent because the PAT never expires. Reuses
  `window.cfpMergeState`. A "Create a token (gist scope)" link points at GitHub's
  prefilled token page.
- **Tradeoff to remember:** the `gist` scope is all-or-nothing (the token can read/write
  ALL the user's gists, not just ours). Acceptable for a single-user personal app; keep
  the token gist-scoped only. Token lives in `localStorage`, so a future XSS would expose
  it — the app renders no untrusted HTML, so the surface is minimal.
- **Offline-rule exception:** `cfp-gist-sync.js` (api.github.com) is the ONE served file
  allowed to contain `https://`. It only reaches the network when the user has connected
  (a token is saved), so the core app stays dependency-free/offline.

### Backup & tools panel (⋯)
The ⋯ modal (built in `build_index.mjs`'s `TOOLKIT`) holds: dark-mode toggle, **Reset all
progress**, the version stamp, and the GitHub auto-sync UI (injected by `cfp-gist-sync.js`).
The manual **Export / Import progress** buttons were **removed in v2.23.0** (redundant once
auto-sync exists; the user asked to drop them) — the merge path (`window.cfpMergeState`)
they used still exists and is now driven only by the gist sync.

## Offline / fonts / vendored assets
Everything is local — repo scan for `https://` in served files must stay empty
(the only exceptions are `cfp-sync.js` (Google Drive) and `cfp-gist-sync.js`
(GitHub gist), the opt-in cloud-sync backends — see above).
- `vendor/chart.umd.js` (Chart.js 4.5.0), `vendor/mathjax/tex-mml-svg.js`
- `vendor/fonts/dancing-script-latin-{400,700}-normal.woff2` (title font, `@font-face`)
- App body uses system fonts; title uses Dancing Script.

## Service worker / versioning / deploy
- `sw.js` `VERSION` and `build_index.mjs` `APP_VERSION` should be bumped together
  (current: `v2.97.0`) on every shippable change so installed apps auto-update
  (install does a `cache: 'reload'` fetch; page reloads on `controllerchange`).
- `sw.js` precaches `CORE_ASSETS` (index, manifest, apps/readers, vendor, icons,
  theme files). Add new shipped assets there.
- Deploy = push to `main` → `.github/workflows/deploy-pages.yml` (GitHub Pages via
  Actions) auto-deploys. Repo must stay public; Pages source = "GitHub Actions".
- Standard flow: work on the working branch, then `git checkout main`, merge
  `--no-ff`, push main, checkout back. Retry pushes with backoff on network errors.

## Gotchas
- **Never hand-edit `index.html`** — change `src/`, `content/`, or `scripts/` and rebuild.
- The flashcard runner is overridden by `flashcards.js` (Term/Definition first,
  Shuffle/In-order, Auto-flip **preview**, **Again/Hard/Good/Easy grading**,
  keyboard shortcuts `Space`=flip · `1-4`=grade · `f`=flag, selectable session
  length, flag/star, and same-day session resume via `localStorage.cfpFlashSession`).
  It replaces `window.runFlash` and relies on the app globals `dueReviews,
  newCards, newRemainingToday, hardCards, filt, CARDS, shuffle, gradeCard,
  toggleFlag, go, S, save` plus `window.MODF` / `window.SESSLEN` / `moduleOf`.
  Each graded card also pushes a confidence-calibration attempt into `S.attempts`
  so flashcards show up in Analytics (Again→guess/wrong … Easy→confident/right).
- The source has an inert `MOBILE_TPL` string (old Kyle payload) containing a
  second `<style>`/`<title>` — it's not live DOM; ignore it.
- `build_index.mjs` FIXES use regex against the (minified) source — if the source
  artifact is updated, re-verify each FIX still matches (it logs a WARNING if not).

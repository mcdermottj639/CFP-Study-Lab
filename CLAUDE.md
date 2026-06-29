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
  (`#studyMode`, `hardCards()`) is kept as-is, independent of the card filter.
- **Leeches**: `lapses>=8` flags `leech`. **Flag/star** via `toggleFlag(i)`.
  `hardCards()` (flagged ∪ leech ∪ `ease<=2.0`) powers the **Hard cards** mode.
- **MCQ misses** schedule into `S.mcqDue[questionText]` (Leitner ladder) via
  `mcqSchedule()`; the **Review missed questions** mode (`mcqDuePool()`) resurfaces
  them; they retire after enough correct answers.
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

Current content: **FP511 + FP512 only** (~525 cards, ~413 MCQs), textbook-grounded
and audited. **FP513–518 are "coming soon"** placeholders — the user has NO
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
Each course card on the Modules tab expands to a clickable list of its modules
(`courseModuleList` in `src/study-home.src.html`); clicking one opens the **Module
Hub** (`#modhub` section, rendered by `renderModuleHub`). A module is openable if it
has tagged cards/MCQs **or** authored teaching content (then it shows a "guide" badge,
e.g. FP511 M8 Case Study which has no cards). The hub assembles, all scoped to that one
module: deep-dive reader link, learning-objectives self-check, "how it connects"
synthesis, a worked example, an auto quick-reference cheat-sheet (the module's cards),
module mastery %, item counts, and launch buttons (`studyScoped` → `window.MODF`-scoped):
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

`apps/fp511-reading.html`, `apps/fp512-reading.html` — standalone long-form reading
docs (their own styling). They have injected: a "Home" button (back to `../index.html`),
SW registration, and the shared **reader theme** (`reader-theme.css` + `reader-theme.js`,
injected by `scripts/inject_reader_theme.mjs`). Theme = warm canvas + dark mode that
**syncs with the app** via the shared `cfpTheme` localStorage key (filter-based dark
mode on a content wrapper so fixed buttons/charts stay correct). Their Chart.js and
(FP512) MathJax are vendored locally (`vendor/chart.umd.js`, `vendor/mathjax/tex-mml-svg.js`).
- **Reader deep-linking:** both readers honor a URL hash (`…#annuities`) to open a
  specific tab — the Module Hub uses this. FP511 defers the initial hash open to the
  `load` event (its chart fns are defined late); FP512 opens it in `DOMContentLoaded`.
  Tab ids per module are in `TAB_MAP`. If you re-import a reader artifact, re-add the
  hash-open snippet near `activateTab('overview')` / the tab `go()` setup.
- **In-reader search** (`reader-search.js`, shared; injected by `inject_reader_theme.mjs` with its own `reader-search-injected` marker, precached in `sw.js`): a floating 🔍 opens a search panel that indexes EVERY tab + collapsible section (even hidden ones — native find-in-page can't), lists hits as **Tab › Section** + snippet, and on tap switches tab, expands the section, scrolls, and highlights. Reader-agnostic: maps sections→tabs by probing which `.active` panel contains them, and drives navigation by clicking the existing `.tab-btn`/section headers — so it works on FP511, FP512, and future readers with no per-reader code.

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

## Cloud sync & mergeable memory (opt-in, v2.15.0)
Cross-device progress sync via the user's **Google Drive**, layered on top of the
offline-first localStorage store (the app is 100% functional offline; sync is opt-in).
- **Mergeable memory** — `mergeState(a,b)` in `src/study-home.src.html` (exposed as
  `window.cfpMergeState`) reconciles two saves field-by-field so devices combine
  instead of clobbering: union seen/flags/objectives, most-recent-wins per card
  (`_mergeCard`), de-dupe attempts/misses by `ts`, max streak/sessions, higher mcq box.
  **Import** (Backup panel) now offers Merge (uses this) or Replace.
- **`cfp-sync.js`** (loaded after flashcards.js; precached in `sw.js`): stores the save
  as a private file (`cfp-study-progress.json`) in the Drive **app-data folder** (scope
  `drive.appdata` — the app can only see its own file). OAuth via Google Identity
  Services (GIS), `CLIENT_ID` is a public web OAuth client (origin `mcdermottj639.github.io`).
  Flow: connect → pull+merge+push (+reload if changed); on load (if connected) silent
  pull+merge once; after `save()` (wrapped) + on tab-hide → background push-only (safe,
  no running-state mutation). UI injected into the ⋯ Backup & tools modal.
- **Offline-rule exception:** `cfp-sync.js` is the ONE served file allowed to contain
  `https://` (accounts.google.com GIS + googleapis.com) — it loads Google's script
  **lazily, only when the user connects**, so the core app stays dependency-free/offline.
- iOS caveat: OAuth popups can be flaky inside an installed standalone PWA; sign-in may
  be smoother in Safari. Tokens are short-lived (GIS, ~1h); silent refresh works while the
  Google session is valid, else the panel shows "Sync now / reconnect".

## Offline / fonts / vendored assets
Everything is local — repo scan for `https://` in served files must stay empty
(the sole exception is `cfp-sync.js`, the opt-in Google Drive sync — see above).
- `vendor/chart.umd.js` (Chart.js 4.5.0), `vendor/mathjax/tex-mml-svg.js`
- `vendor/fonts/dancing-script-latin-{400,700}-normal.woff2` (title font, `@font-face`)
- App body uses system fonts; title uses Dancing Script.

## Service worker / versioning / deploy
- `sw.js` `VERSION` and `build_index.mjs` `APP_VERSION` should be bumped together
  (current: `v2.17.0`) on every shippable change so installed apps auto-update
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

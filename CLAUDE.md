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
  `runExam` is now dead code (left defined, unreferenced). **Quiz** stays the quick 10-Q
  instant-feedback practice.
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

Current content: **FP511 + FP512 only** (~555 cards, ~413 MCQs), textbook-grounded
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

## Infographics (per-module visual guides — Module Hub)
Each Module Hub can show one or more **infographic** images (one-page visual study
guides) in a **"Visual guide"** card under "Study this module". Tapping a thumbnail
opens a full-screen popup viewer (`openInfographic`/`closeInfographic` in
`src/study-home.src.html`; thumb + `#infoWrap` styles via `ensureInfoCSS`). Tap the
backdrop or ✕ to close. The data map is `window.INFOGRAPHICS` (course → module →
`[{src,title}]`) in `module-content.js`, read by `renderModuleHub` with a graceful
empty-default (no card when a module has none).
- **Images are LOCAL (offline-first):** they live in `assets/infographics/` and are
  precached by `sw.js` into an **unversioned** `fpsl-media` cache (`MEDIA_ASSETS`),
  so they survive version bumps without re-downloading (kept out of the versioned
  core/runtime caches; the `activate` cleanup excludes `MEDIA_CACHE`). The source
  images live in Google Drive under **`CFP → Infographics`** — pull them into the repo
  (or the user uploads here), don't hot-link Drive (would break the offline rule).
- **Adding one is filename-driven, no engine change:** name the file
  `FP<course>-M<module>[-Free Text Title].<ext>` (e.g.
  `FP512-M1-Insurance-and-Risk-Management-Guide.png`; title optional → "Visual guide"),
  drop it in `assets/infographics/`, then run **`node scripts/sync_infographics.mjs`** —
  it regenerates the `window.INFOGRAPHICS` block in `module-content.js` AND the
  `MEDIA_ASSETS` precache list in `sw.js` (both delimited by `/* INFOGRAPHICS-GEN-START/END */`
  markers — don't hand-edit between them). Then rebuild (`build_index` + `add_content`),
  bump versions, deploy. Multiple images per module are supported. Note: source PNGs can be
  large (~4–5 MB each) — fine for a few, but consider compressing if the set grows.

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
  (current: `v2.26.0`) on every shippable change so installed apps auto-update
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

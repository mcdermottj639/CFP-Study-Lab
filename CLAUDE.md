# CLAUDE.md — CFP Study Home

Context for future sessions. Read this before changing anything.

## What this is
An installable, **fully offline** Progressive Web App (PWA) to study for the
CFP® exam, deployed on GitHub Pages. One single app — no separate sub-apps in
the UI — plus two long-form **Interactive Readers** reachable from the Modules tab.

- **Live URL:** https://mcdermottj639.github.io/CFP-Study-Lab/
- **Repo:** `mcdermottj639/CFP-Study-Lab` (public — required for free GitHub Pages)
- **Working branch:** `claude/cfp-study-lab-mobile-4q6qpf`. Deploys happen from `main`.
- The app is **standalone/offline**: no external CDNs, no analytics, no backend.
  Progress is saved per-device in `localStorage` key `cfpStudyHome.v1`.

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

### Adding a new course (the standard request)
1. User puts the new course's textbook in their Drive `CFP` folder.
2. Generate `content/fp51X.cards.json` + `fp51X.mcqs.json` grounded ONLY in that
   textbook (tag with the right `m`/`d` from the table). Past method: download the
   PDFs from Drive (MCP `Google_Drive`), decode base64 to disk, read with the Read
   tool, author concise exam-focused Q&A. Quality > quantity; flag anything uncertain.
3. **Create a matching Interactive Reader** for the course (the user wants one per
   course) and run `node scripts/inject_reader_theme.mjs apps/fp51X-reading.html`.
   Link it from `moduleLinks()` in `build_index.mjs`.
4. `node scripts/add_content.mjs add`, bump versions, deploy.

## Interactive Readers
`apps/fp511-reading.html`, `apps/fp512-reading.html` — standalone long-form reading
docs (their own styling). They have injected: a "Home" button (back to `../index.html`),
SW registration, and the shared **reader theme** (`reader-theme.css` + `reader-theme.js`,
injected by `scripts/inject_reader_theme.mjs`). Theme = warm canvas + dark mode that
**syncs with the app** via the shared `cfpTheme` localStorage key (filter-based dark
mode on a content wrapper so fixed buttons/charts stay correct). Their Chart.js and
(FP512) MathJax are vendored locally (`vendor/chart.umd.js`, `vendor/mathjax/tex-mml-svg.js`).

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

## Offline / fonts / vendored assets
Everything is local — repo scan for `https://` in served files must stay empty.
- `vendor/chart.umd.js` (Chart.js 4.5.0), `vendor/mathjax/tex-mml-svg.js`
- `vendor/fonts/dancing-script-latin-{400,700}-normal.woff2` (title font, `@font-face`)
- App body uses system fonts; title uses Dancing Script.

## Service worker / versioning / deploy
- `sw.js` `VERSION` and `build_index.mjs` `APP_VERSION` should be bumped together
  (e.g. `v2.7.12`) on every shippable change so installed apps auto-update
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
  Shuffle/In-order, Auto-flip). It replaces `window.runFlash` and relies on the
  app globals `dueCards, filt, CARDS, shuffle, gradeCard, go`.
- The source has an inert `MOBILE_TPL` string (old Kyle payload) containing a
  second `<style>`/`<title>` — it's not live DOM; ignore it.
- `build_index.mjs` FIXES use regex against the (minified) source — if the source
  artifact is updated, re-verify each FIX still matches (it logs a WARNING if not).

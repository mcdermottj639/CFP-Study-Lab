# CFP Study Home — CFP® Exam Prep (iPhone & iPad app)

One complete, installable, **fully offline** study app for the CFP® exam.

Open it once in Safari, **Add to Home Screen**, and it runs full-screen like a
native app — no App Store, no Apple Developer account, no Mac required.

### FP513 Investment Planning — v2.114.0

FP513 is now the active course (FP512 shows as passed; FP511/FP512 stay available for review).
Tap **Continue FP513** on Today to study your current module and next learning objective.

- **All 9 modules, 48 learning objectives** — every objective has flashcards, questions,
  a reader section, and a coverage row in `docs/fp513-coverage-matrix.md`
- **304 flashcards + 340 questions** (22 in an original integrated client case), each with
  "why the other answers are wrong"
- **Calculation lab** — 26 randomized drills (bond price, YTM/YTC, TEY, duration, convertibles,
  DDM, CAPM, beta, SD, correlation, Sharpe/Treynor/alpha, TWR/DWR, options, currency, cap rate,
  wash sales…) showing assumptions, formula, inputs, steps and the likely mistake you made
- **Interactive reader + Teach mode** — `apps/fp513-reading.html`, LO deep links, bookmarks,
  formula sheet, decision trees and diagrams
- **Two cumulative practice forms** with objective-level diagnostics, and a manual log for
  Kaplan's official scores (no Kaplan connection)
- **Pacing** to the Kaplan access end date (Feb 15 2027) — suggested, never locked

### Daily study coach — v2.113.0

Start a 3, 10 or 25-minute guided session on **Today**. Review older material, learn a
short lesson, apply it and practise explaining a concept to a fictional client. Sessions
save automatically. Set weekly study/case goals and reminder preferences in **Settings**.
Calendar reminders require importing the generated calendar event; in-app reminders
stop after today's practice. No background push notifications are sent.

Progress separates current-course learning, loaded exam coverage and delayed recall.
Active time is measured from this version onward; earlier estimated hours are not
reclassified as measured time. FP511–FP513 are loaded; later courses await materials.

### What's inside
A single all-in-one app (FP511 + FP512 + FP513) with:

- **Dashboard** — exam countdown, study streak, "study this today," weak-topic targeting
- **9 study modes** — flashcards, quiz, exam simulator, mock exam, scenario item-sets,
  calculator drills, ethics, key numbers, and exam tips
- **883 flashcards + 779 practice questions** across FP511, FP512 & FP513
- **Analytics** — mastery by module, flashcard recall ratings, domain readiness by
  official exam weights, and a mistake journal
- **Progress saved** on your device (`localStorage`)
- **100% offline** — no external dependencies (Chart.js is bundled locally)

FP514–FP518 are scaffolded in the module map as "coming soon."

---

## Install on your iPhone / iPad

1. Open the live URL in **Safari**: `https://mcdermottj639.github.io/CFP-Study-Lab/`
2. Tap **Share** (the square with an ↑) → **Add to Home Screen** → **Add**.
3. Launch **CFP Study** from the new icon — full-screen and works offline.

Repeat on each device. Progress is stored per-device; optional GitHub Gist sync can merge progress between devices.

---

## Deploy (GitHub Pages — already set up)

The repo is public and auto-deploys via GitHub Actions on every push to `main`
(see `.github/workflows/deploy-pages.yml`). The live URL is shown under
**Settings → Pages** and in each workflow run.

## Project structure

```
index.html              The complete CFP Study Home app (PWA hooks injected)
manifest.webmanifest    PWA manifest (name, icons, standalone display)
sw.js                   Service worker (offline caching)
vendor/chart.umd.js     Chart.js 4.5.0, bundled locally (no CDN)
icons/                  App icons (generated; see scripts/)
scripts/
  generate_icons.py     Regenerate icons (pure Python, no deps)
  build_index.mjs       Rebuild index.html from a source artifact + PWA hooks
.github/workflows/      GitHub Pages deploy workflow
```

### Updating

- **New app version:** `node scripts/build_index.mjs <source.html>` regenerates
  `index.html` with the PWA hooks re-applied.
- **Bump the offline cache:** increment `VERSION` in `sw.js` so devices fetch fresh files.
- **Regenerate icons:** `python3 scripts/generate_icons.py`.

---

*Personal study aid, not official CFP Board material. Always verify against current
CFP Board publications. CFP® is a trademark of the Certified Financial Planner Board
of Standards, Inc.*

# CFP Study Home — CFP® Exam Prep (iPhone & iPad app)

One complete, installable, **fully offline** study app for the CFP® exam.

Open it once in Safari, **Add to Home Screen**, and it runs full-screen like a
native app — no App Store, no Apple Developer account, no Mac required.

### What's inside
A single all-in-one app (FP511 + FP512) with:

- **Dashboard** — exam countdown, study streak, "study this today," weak-topic targeting
- **9 study modes** — flashcards, quiz, exam simulator, mock exam, scenario item-sets,
  calculator drills, ethics, key numbers, and exam tips
- **336 flashcards + 288 practice questions** across FP511 & FP512
- **Analytics** — mastery by module, confidence vs. accuracy, domain readiness by
  official exam weights, and a mistake journal
- **Progress saved** on your device (`localStorage`)
- **100% offline** — no external dependencies (Chart.js is bundled locally)

FP513–FP518 are scaffolded in the module map as "coming soon."

---

## Install on your iPhone / iPad

1. Open the live URL in **Safari**: `https://mcdermottj639.github.io/CFP-Study-Lab/`
2. Tap **Share** (the square with an ↑) → **Add to Home Screen** → **Add**.
3. Launch **CFP Study** from the new icon — full-screen and works offline.

Repeat on each device. Progress is stored per-device.

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

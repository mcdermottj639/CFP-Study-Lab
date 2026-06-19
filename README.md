# FP Study Lab — CFP® Exam Prep (iPhone & iPad app)

An installable, **offline-capable** study app that combines all of your CFP® prep
material into one home screen:

- **FP511 Study Lab** — flashcards, quizzes, match, exam simulator, progress tracking
- **FP511 Interactive Reading** — guided chapters with charts
- **FP512 Study Lab** — flashcards, quizzes, match, exam simulator, progress tracking
- **FP512 Interactive Reading** — guided chapters with worked formulas
- **Reference Library** — cheat sheet, provided-formulas sheet, and CFP Board
  key-element summaries (SECURE Act 2019, SECURE 2.0 2023, TCJA 2017, OBBBA 2025),
  ethics & process, and retirement planning — all available offline

It's a **Progressive Web App (PWA)**: no App Store, no Apple Developer account,
no Mac/Xcode. You add it to your home screen from Safari and it runs full-screen
like a native app, even with no internet.

---

## Install on your iPhone / iPad

1. Open the live site URL in **Safari** (see *Deploy* below for the URL).
2. Tap the **Share** button (the square with an up-arrow).
3. Scroll down and tap **Add to Home Screen**, then **Add**.
4. Launch **FP Study Lab** from the new icon — it opens full-screen and works offline.

> The first launch needs internet so it can cache everything. After that it works
> with no connection. Your flashcard/quiz/exam progress is saved on the device.

Repeat on each device (iPhone and iPad) to install it in both places.

---

## Deploy (GitHub Pages — free)

This repo deploys itself with GitHub Actions. One-time setup:

1. Push this branch (already done if you're reading this on GitHub).
2. In the repo: **Settings → Pages → Build and deployment → Source → "GitHub Actions"**.
3. The **Deploy to GitHub Pages** workflow runs automatically on every push to
   `main` (and to the working branch). When it finishes, your live URL appears in
   the workflow run and under **Settings → Pages**, typically:

   `https://<your-username>.github.io/cfp-study-lab/`

4. Open that URL on your devices and follow *Install* above.

To make it live for everyone, merge this branch into `main`.

---

## Project structure

```
index.html                 Launcher home (tiles, exam countdown, install hint)
reference.html             Reference Library (links to the PDFs)
manifest.webmanifest       PWA manifest (name, icons, standalone display)
sw.js                      Service worker (offline caching)
apps/                      The 4 self-contained study apps
  fp511-study.html
  fp511-reading.html
  fp512-study.html
  fp512-reading.html
reference/                 Bundled reference PDFs (offline)
icons/                     App icons (generated; see scripts/)
scripts/
  generate_icons.py        Regenerate icons (pure Python, no deps)
  inject_pwa.mjs           Re-inject PWA hooks into apps/ (idempotent)
.github/workflows/         GitHub Pages deploy workflow
```

## Updating content

- **Replace a study app:** drop the new HTML into `apps/` (same filename), then
  run `node scripts/inject_pwa.mjs` to re-add the Home button + offline hooks.
- **Add/replace a reference PDF:** put the file in `reference/` and add a link in
  `reference.html`.
- **Bump the cache:** increment `VERSION` in `sw.js` so devices fetch fresh files.
- **Regenerate icons:** `python3 scripts/generate_icons.py`.

---

*This is a personal study aid, not official CFP Board material. Always verify
against current CFP Board publications. CFP® is a trademark of the Certified
Financial Planner Board of Standards, Inc.*

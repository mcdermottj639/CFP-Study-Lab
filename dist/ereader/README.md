# CFP Study Lab — e-reader exports

EPUB study documents generated for the **XTEINK X4** (and any EPUB e-reader) so you
can review CFP material on a distraction-free, no-backlight e-ink screen. These are
**passive** — reading here does not sync grades/progress back into the app.

Regenerate after any content change: `node scripts/build_epub.mjs`

## Files (per course: FP511, FP512)
- **`*-Flashcards.epub`** — self-quiz deck. One card's question per screen; turn the
  page (physical buttons) to reveal the answer. Grouped by module.
- **`*-MCQ-Practice.epub`** — a question + options per screen; turn the page for the
  correct answer, the explanation, and why each wrong option is wrong.
- **`*-Exam-Cram.epub`** — per-module cram sheet: key numbers, must-know rules, traps,
  tips, learning objectives. Best fit for the pocket form factor.
- **`*-Reader.epub`** — the full Interactive Reader reflowed into plain e-ink prose
  (one chapter per tab). Charts/interactive bits omitted; the concepts remain.

## Getting them onto the device
1. Open the XTEINK app → **Import** and select the `.epub` (or copy to the microSD card).
2. They're also served from the live site, so on your phone you can download from
   `https://mcdermottj639.github.io/CFP-Study-Lab/dist/ereader/<file>.epub` then Import.

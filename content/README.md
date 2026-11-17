# Content pipeline

Study content (flashcards + practice questions) lives here as JSON, separate
from the app, so new material — including **future courses** — can be added by
dropping in a file and running one command. No need to edit the app by hand.

## How to add content

1. Add one or both files (any prefix; merged by suffix):
   - `*.cards.json` — array of flashcards
   - `*.mcqs.json` — array of multiple-choice questions
2. Run `node scripts/add_content.mjs add` from the repo root.
3. It validates, de-dupes (by front/question text), and merges into `index.html`.
   Commit + push to `main` to deploy.

`add_content.mjs` is **idempotent** — re-running skips items already present, so
it's safe to run repeatedly. It refuses to write if the result wouldn't parse.

## Schemas

**Flashcard** (`*.cards.json`):
```json
{ "m": "FP511", "d": "B", "t": "Time Value of Money", "f": "front / prompt", "b": "back / answer" }
```

**Question** (`*.mcqs.json`):
```json
{ "m": "FP511", "d": "B", "t": "Time Value of Money",
  "q": "question text", "o": ["A","B","C","D"], "a": 2, "e": "why C is right" }
```
`a` is the 0-based index of the correct option. Light HTML is allowed in
`f`/`b`/`e` (`<b>`, `&rarr;`, `&mdash;`, `&le;`, `&ge;`).

## Taxonomy

`m` = module/course id; `d` = domain code (drives the analytics + official
exam-weight readiness).

| `m` | Course | `d` | Domain | Exam weight |
|-----|--------|-----|--------|------|
| FP511 | General Financial Planning, Conduct & Psychology | A | Professional Conduct & Regulation | 8% |
| FP511 | | B | General Principles of Financial Planning | 15% |
| FP511 | | H | Psychology of Financial Planning | 7% |
| FP512 | Risk Management, Insurance & Employee Benefits | C | Risk Management & Insurance Planning | 11% |
| FP513 | Investment Planning | D | Investment Planning | 17% |
| FP514 | Income Tax Planning | E | Tax Planning | 14% |
| FP515 | Retirement Savings & Income Planning | F | Retirement Savings & Income Planning | 18% |
| FP516 | Estate Planning | G | Estate Planning | 10% |

## FP513 (v2.114.0) — authored in `content/fp513/`, built by one script

FP513 is authored per module in `content/fp513/m1`…`m9` (cards, questions, why-rationales,
reader tab, Module Hub data, teach-backs) plus `teach/` (Teach narration), `los.json`
(48 objectives) and the reader overview/formula sources. Every FP513 item carries
`lo` (learning objective), `pg` (printed textbook page) and `k` (CFP Board topic); questions
also carry `kind` (concept/applied/calc/case). Run:

```
python3 content/fp513/validate.py m4          # per-module checks (set FP513_SRC=<private textbook text dir> for the copyright-overlap check)
node scripts/build_fp513.mjs                  # writes content/fp513*.json, mcq-why-fp513.js, module-content/coach-cases/reader-teach blocks,
                                              # card tiers, apps/fp513-reading.html, docs/fp513-coverage-matrix.md
node scripts/build_index.mjs && node scripts/add_content.mjs add
```

**Card order is progress.** Flashcard progress is saved by array index, so FP513 cards must
only ever be appended (tests/fp513-pipeline.test.cjs fingerprints the existing order).

**Rebuild guard.** `content/manifest.json` sets minimum card/question counts per course;
`add_content.mjs` refuses to write if a rebuild would fall below them.

**replace.json rules can be scoped** with `"m":"FP512"` so an old fix never rewrites another
course (the `$640→$660` FSA rule had started rewriting an FP513 option).

**Licensing.** The textbook PDF and its extracted text are never committed; only original
explanations, questions and page references are public.

## Adding a future course (FP514+)

1. Put the textbook in the Drive `CFP` folder.
2. Follow the FP513 layout above (`content/fp51X/m*`, a build script, a manifest minimum).
3. `node scripts/add_content.mjs add` → the FP513/Investment content now flows
   into the app and its domain-readiness chart.

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

## Adding a future course (e.g. FP513 when its textbook arrives)

1. Put the textbook in the Drive `CFP` folder.
2. Generate `fp513.cards.json` / `fp513.mcqs.json` here (tag `"m":"FP513"`,
   `"d":"D"`).
3. `node scripts/add_content.mjs add` → the FP513/Investment content now flows
   into the app and its domain-readiness chart.

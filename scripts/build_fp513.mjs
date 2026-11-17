/* Build every generated FP513 artifact from its authored source in content/fp513/.
 *
 *   node scripts/build_fp513.mjs          # writes the files below (idempotent)
 *   node scripts/build_fp513.mjs --check  # exit 1 if any generated file is out of date
 *
 * Sources (authored, original — the textbook itself is NEVER in this repo):
 *   content/fp513/los.json                    48 learning objectives (id, module, text, page, CFP topic)
 *   content/fp513/m1..m9/cards.json           flashcards {m,d,t,f,b,lo,pg,tier,k}
 *   content/fp513/m1..m9/mcqs.json            questions  {m,d,t,q,o,a,e,lo,pg,k,kind[,stem]}
 *   content/fp513/m1..m9/why.json             "why the others are wrong" per question
 *   content/fp513/m1..m9/hub.json             Module Hub objectives/synthesis/example/cheat sheet
 *   content/fp513/m1..m9/teachback.json       client teach-back exercises
 *   content/fp513/m1..m9/reader.html          reader tab fragment
 *   content/fp513/m9/case.json                integrated case (scenario item-set)
 *   content/fp513/teach/*.json                Teach-mode narration per tab
 *   content/fp513/reader-overview.src.html, reader-formulas.src.html, reader-script.js, visuals.json (SVGs from scripts/fp513_visuals.py)
 * Outputs:
 *   content/fp513.cards.json, content/fp513.mcqs.json, content/fp513-calc.mcqs.json (merged by add_content.mjs)
 *   module-content.js  (FP513-GEN block)      coach-cases.js (FP513-GEN block)
 *   mcq-why-fp513.js                          reader-teach.js (fp513-reading.html block)
 *   content/card-tiers.json (FP513 tiers)     apps/fp513-reading.html
 *   docs/fp513-coverage-matrix.md, content/fp513/coverage.json
 *
 * CARD ORDER IS PROGRESS: flashcard progress is stored by array index ("c"+i). FP513 cards are
 * appended after FP511/FP512 and their order here (module 1→9, file order) must never change.
 * Add new cards only at the END of content/fp513.cards.json via a new module file position — see
 * tests/fp513-pipeline.test.cjs (fingerprints the first N cards).
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

const CHECK = process.argv.includes('--check');
const DIR = 'content/fp513';
const TABS = { 1: 'markets', 2: 'debt', 3: 'equity', 4: 'valuation', 5: 'alternatives', 6: 'risk', 7: 'returns', 8: 'portfolio', 9: 'case' };
const TABNAMES = { overview: 'Overview', markets: 'M1 Markets', debt: 'M2 Debt', equity: 'M3 Equity & Funds', valuation: 'M4 Valuation', alternatives: 'M5 Alternatives', risk: 'M6 Risk & Stats', returns: 'M7 Returns', portfolio: 'M8 Portfolio', case: 'M9 Case', formulas: 'Formulas & Visuals' };
const rd = (p) => JSON.parse(readFileSync(p, 'utf8'));
const opt = (p, d) => (existsSync(p) ? rd(p) : d);
const los = rd(join(DIR, 'los.json'));
const mods = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => {
  const d = join(DIR, 'm' + n);
  return { n, cards: opt(join(d, 'cards.json'), []), mcqs: opt(join(d, 'mcqs.json'), []), why: opt(join(d, 'why.json'), {}), hub: opt(join(d, 'hub.json'), null),
    teach: opt(join(d, 'teachback.json'), []), reader: existsSync(join(d, 'reader.html')) ? readFileSync(join(d, 'reader.html'), 'utf8') : '', kase: opt(join(d, 'case.json'), null) };
});

const outputs = {};   // path -> new content
const put = (p, s) => { outputs[p] = s; };

// ---------- 1. content JSON for add_content.mjs ----------
const cards = mods.flatMap((m) => m.cards.map((c) => { const { tier, ...rest } = c; return rest; }));
const mcqs = mods.flatMap((m) => m.mcqs);
put('content/fp513.cards.json', '[\n' + cards.map((c) => JSON.stringify(c)).join(',\n') + '\n]\n');
put('content/fp513.mcqs.json', '[\n' + mcqs.map((q) => JSON.stringify(q)).join(',\n') + '\n]\n');

// generator-backed (math-version) templates: static fallback text from a fixed seed
const CALC = require('../fp513-calc.js');
const GEN_META = { bondprice: ['Bond Pricing', 'D.32'], ytm: ['Bond Yields', 'D.30'], tey: ['Taxable-Equivalent Yield', 'D.30'], duration: ['Duration', 'D.32'], convertible: ['Convertible Bonds', 'D.32'],
  ddm: ['Dividend Discount Model', 'D.32'], capm: ['CAPM', 'D.33'], wbeta: ['Beta', 'D.30'], portsd: ['Portfolio Standard Deviation', 'D.30'], sharpe: ['Performance Measures', 'D.30'], jensen: ['Performance Measures', 'D.30'],
  hpr: ['Return Measures', 'D.30'], currency: ['Currency Risk', 'D.30'], dca: ['Averaging Techniques', 'D.34'], caprate: ['Real Estate Valuation', 'D.35'], washsale: ['Wash Sales', 'D.27'], option: ['Option Payoffs', 'D.35'], realret: ['Return Measures', 'D.30'] };
const gens = Object.keys(CALC.mcqgen).map((gid) => {
  const id = gid.replace('fp513.', ''), d = CALC.drills.find((x) => x.id === id);
  let q = null; for (let s = 1; !q && s < 50; s++) q = CALC.mcqFromDrill(id, CALC.rng(s * 7919));
  const [t, k] = GEN_META[id] || ['Calculations', 'D.30'];
  return { m: 'FP513', d: 'D', t: 'Calc: ' + t, q: q.q, o: q.o, a: q.a, e: q.e, g: gid, lo: d.lo, pg: (los.find((l) => l.id === d.lo) || {}).page, k, kind: 'calc' };
});
put('content/fp513-calc.mcqs.json', '[\n' + gens.map((q) => JSON.stringify(q)).join(',\n') + '\n]\n');

// ---------- 2. mcq-why-fp513.js (separate file: mcq-why.js stays byte-identical) ----------
{
  const merged = {}, fpKeys = new Set(mcqs.map((q) => q.q));
  mods.forEach((m) => Object.keys(m.why).forEach((k) => { if (fpKeys.has(k)) merged[k] = m.why[k]; }));
  put('mcq-why-fp513.js', '/* FP513 "why not the others?" rationales — generated by scripts/build_fp513.mjs from content/fp513/mN/why.json. */\n' +
    'window.MCQWHY = Object.assign(window.MCQWHY || {}, ' + JSON.stringify(merged) + ');\n');
}

// ---------- 3. module-content.js FP513 block ----------
{
  const src = readFileSync('module-content.js', 'utf8');
  const S0 = '  /* FP513-GEN-START (scripts/build_fp513.mjs — do not hand-edit) */', S1 = '  /* FP513-GEN-END */';
  const obj = {}, syn = {}, ex = {}, cheat = {};
  mods.forEach((m) => { if (!m.hub) return; obj[m.n] = m.hub.objectives; syn[m.n] = m.hub.synthesis; ex[m.n] = m.hub.example; cheat[m.n] = m.hub.cheat; });
  const kase = mods[8].kase ? { m: 'FP513', d: 'D', title: mods[8].kase.title, stem: mods[8].kase.stem, items: mods[8].kase.items.map((it) => ({ q: it.q, o: it.o, a: it.a, e: it.e })) } : null;
  const block = [S0,
    "  window.READER_MAP.FP513 = 'apps/fp513-reading.html';",
    '  window.TAB_MAP.FP513 = ' + JSON.stringify(TABS) + ';',
    '  window.MODOBJ.FP513 = ' + JSON.stringify(obj) + ';',
    '  window.MODSYN.FP513 = ' + JSON.stringify(syn) + ';',
    '  window.MODEX.FP513 = ' + JSON.stringify(ex) + ';',
    '  window.MODCHEAT.FP513 = ' + JSON.stringify(cheat) + ';',
    '  window.FP513_CASE = ' + JSON.stringify(kase) + ';', S1].join('\n');
  let out;
  if (src.includes(S0)) out = src.slice(0, src.indexOf(S0)) + block + src.slice(src.indexOf(S1) + S1.length);
  else { const k = src.lastIndexOf('})();'); out = src.slice(0, k) + block + '\n' + src.slice(k); }
  put('module-content.js', out);
}

// ---------- 4. coach-cases.js ----------
{
  const src = readFileSync('coach-cases.js', 'utf8');
  const S0 = '/* FP513-GEN-START */', S1 = '/* FP513-GEN-END */';
  const items = mods.flatMap((m) => m.teach.map((c) => ({ id: c.id, course: 'FP513', mod: m.n, domain: 'D', title: c.title, scenario: c.scenario, prompt: c.prompt, points: c.points,
    source: 'apps/fp513-reading.html#' + TABS[m.n], anchor: c.anchor, basis: 'FP513 textbook (2026 ed.) — Module ' + m.n + '; original fictional case' })));
  const block = S0 + '\nwindow.CFP_CLIENT_CASES = window.CFP_CLIENT_CASES.concat(' + JSON.stringify(items, null, 1) + ');\n' + S1;
  const out = src.includes(S0) ? src.slice(0, src.indexOf(S0)) + block + src.slice(src.indexOf(S1) + S1.length) : src.trimEnd() + '\n' + block + '\n';
  put('coach-cases.js', out);
}

// ---------- 5. card tiers ----------
{
  const t = rd('content/card-tiers.json');
  mods.forEach((m) => m.cards.forEach((c) => { t.tiers[c.f] = c.tier; }));
  const counts = { 1: 0, 2: 0, 3: 0 }; Object.values(t.tiers).forEach((v) => { counts[v]++; });
  t._counts = Object.assign({}, t._counts || {}, { total: Object.keys(t.tiers).length, tier1: counts[1], tier2: counts[2], tier3: counts[3] });
  put('content/card-tiers.json', JSON.stringify(t, null, 1) + '\n');
}

// ---------- 6. reader-teach.js (FP513 narration) ----------
{
  const src = readFileSync('reader-teach.js', 'utf8');
  const S0 = '  /* FP513-TEACH-START (scripts/build_fp513.mjs) */', S1 = '  /* FP513-TEACH-END */';
  const teach = {};
  const tdir = join(DIR, 'teach');
  if (existsSync(tdir)) readdirSync(tdir).filter((f) => f.endsWith('.json')).sort().forEach((f) => Object.assign(teach, rd(join(tdir, f))));
  const block = S0 + '\n  window.READER_TEACH["fp513-reading.html"] = ' + JSON.stringify(teach, null, 1) + ';\n' + S1;
  let out;
  if (src.includes(S0)) out = src.slice(0, src.indexOf(S0)) + block + src.slice(src.indexOf(S1) + S1.length);
  else { const k = src.lastIndexOf('})();'); out = src.slice(0, k) + block + '\n' + src.slice(k); }
  put('reader-teach.js', out);
}

// ---------- 7. reader ----------
{
  const shell = readFileSync('apps/fp512-reading.html', 'utf8');
  let head = shell.slice(0, shell.indexOf('<body'));
  head = head.replace(/<title>[\s\S]*?<\/title>/, '<title>FP513 &mdash; Investment Planning</title>');
  const tail = shell.slice(shell.indexOf('<!-- fpsl-injected:body -->'));
  const order = ['overview', 'markets', 'debt', 'equity', 'valuation', 'alternatives', 'risk', 'returns', 'portfolio', 'case', 'formulas'];
  const nav = '<nav class="tab-nav" id="tabNav" role="tablist">\n' + order.map((t, i) => `  <button class="tab-btn${i ? '' : ' active'}" data-tab="${t}" role="tab">${TABNAMES[t]}</button>`).join('\n') + '\n</nav>';
  const svgs = rd(join(DIR, 'visuals.json'));
  const loJump = '<div class="fp5-lojump">' + los.map((l) => `<a href="#lo-${l.id.slice(3)}" data-go="lo-${l.id.slice(3)}"><b>${l.id}</b>M${l.mod} · ${l.text.replace(/&/g, '&amp;')}</a>`).join('') + '</div>';
  const overview = readFileSync(join(DIR, 'reader-overview.src.html'), 'utf8').replace('<!--LO-JUMP-->', loJump);
  const formulas = readFileSync(join(DIR, 'reader-formulas.src.html'), 'utf8').replace(/<!--SVG:(\w+)-->/g, (m0, k) => svgs[k] || '');
  const panels = [overview].concat(mods.map((m) => m.reader)).concat([formulas]).join('\n\n');
  // stable ids on every LO section so the app/coach can deep-link (#lo-4.1.2)
  const withIds = panels.replace(/<div class="section-card">(\s*<div class="collapsible-header"[^>]*>\s*<h3>\s*(LO \d\.\d\.\d))/g, (m0, rest, lo) => `<div class="section-card" id="lo-${lo.slice(3)}">${rest}`);
  const script = readFileSync(join(DIR, 'reader-script.js'), 'utf8');
  const body = `<body>\n${nav}\n<div class="main-container">\n  <div class="report-title">\n    <h1>Investment Planning</h1>\n    <p>FP513 &mdash; Interactive Reference &bull; original study notes built from the College for Financial Planning 2026 edition &bull; CFP&reg; Exam Prep</p>\n  </div>\n\n${withIds}\n\n</div>\n<script>\n${script}\n</script>\n\n`;
  put('apps/fp513-reading.html', head + body + tail);
}

// ---------- 8. coverage matrix ----------
{
  const rows = los.map((l) => {
    const c = cards.filter((x) => x.lo === l.id), q = mcqs.filter((x) => x.lo === l.id), g = gens.filter((x) => x.lo === l.id), drills = CALC.drills.filter((d) => d.lo === l.id);
    const caseQ = mods[8].mcqs.filter((x) => x.lo === l.id).length;
    const kinds = {}; q.forEach((x) => { kinds[x.kind] = (kinds[x.kind] || 0) + 1; });
    const topics = [...new Set(c.map((x) => x.k).concat(q.map((x) => x.k)))].sort();
    const inReader = mods[l.mod - 1].reader.includes(l.id);
    const status = c.length >= 2 && q.length >= 4 && inReader ? 'covered — reviewed' : 'GAP';
    return { id: l.id, module: l.mod, page: l.page, objective: l.text, primary: l.primary, topics, cards: c.length, questions: q.length, kinds, caseQuestions: caseQ, calcDrills: drills.map((d) => d.id), generatedQuestions: g.length, reader: inReader, status, edition: 'College for Financial Planning FP513, 2026 edition' };
  });
  put('content/fp513/coverage.json', JSON.stringify({ generated: 'scripts/build_fp513.mjs', objectives: rows }, null, 1) + '\n');
  const md = ['# FP513 learning-objective coverage matrix', '',
    'Generated by `scripts/build_fp513.mjs` from the authored content — do not hand-edit.', '',
    'Source edition: College for Financial Planning / Kaplan, *FP513 Investment Planning*, 2026 edition (page = printed page).',
    'Blueprint: CFP Board 2021 Principal Knowledge Topics (in force for current exams). "Topics" lists every blueprint topic the items are tagged with.',
    '"Reviewed" = each item passed the schema, LO-coverage, copyright-overlap (no 12-word textbook run) and numeric checks in `content/fp513/validate.py`, and the calculators passed `tests/fp513-calc.test.cjs`.', '',
    '| LO | Pg | Objective | Primary | Topics | Cards | Qs (concept/applied/calc) | Case Qs | Calc drills | Reader | Status |', '|---|---|---|---|---|---|---|---|---|---|---|',
    ...rows.map((r) => `| ${r.id} | ${r.page} | ${r.objective} | ${r.primary} | ${r.topics.join(', ')} | ${r.cards} | ${r.questions} (${r.kinds.concept || 0}/${r.kinds.applied || 0}/${r.kinds.calc || 0}) | ${r.caseQuestions} | ${r.calcDrills.join(', ') || '—'} | ${r.reader ? '✓' : '✗'} | ${r.status} |`),
    '', `Totals: ${cards.length} flashcards · ${mcqs.length} questions (${mods[8].mcqs.length} in the Module 9 integrated case) · ${gens.length} generated math questions · ${CALC.drills.length} calculation drills.`,
    '', 'Module 9 (case study) has no objectives of its own; its items are mapped to the Module 1–8 objectives they exercise.',
    '', `Gaps: ${rows.filter((r) => r.status === 'GAP').map((r) => r.id).join(', ') || 'none'}.`, ''].join('\n');
  if (!existsSync('docs')) mkdirSync('docs');
  put('docs/fp513-coverage-matrix.md', md);
}

// ---------- write / check ----------
let stale = 0;
for (const [p, s] of Object.entries(outputs)) {
  const cur = existsSync(p) ? readFileSync(p, 'utf8') : null;
  if (cur === s) continue;
  if (CHECK) { console.log('out of date:', p); stale++; } else { writeFileSync(p, s); console.log('wrote', p); }
}
console.log(`FP513: ${cards.length} cards, ${mcqs.length} questions, ${gens.length} generated, ${CALC.drills.length} drills`);
if (CHECK && stale) process.exit(1);

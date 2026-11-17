/* Build apps/fp513-ai-slides.html — the FP513 "High-yield exam review" whole-course deck
 * (the course card's 📊 link, like FP511/FP512's). Claude-built from this app's own audited
 * FP513 study content — no textbook text:
 *   MODCHEAT.FP513 (key numbers, must-know, traps, tips) + MODEX.FP513 (worked examples)
 *   from module-content.js, content/fp513/visuals.json (original SVGs), and two self-check
 *   questions per module from content/fp513.mcqs.json.
 * Shell (styles + theme/progress scripts + chrome includes) is reused from apps/fp512-ai-slides.html.
 *   node scripts/build_fp513_deck.mjs          # write
 *   node scripts/build_fp513_deck.mjs --check  # exit 1 if the committed file is stale
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const rd = (p) => readFileSync(join(ROOT, p), 'utf8');
const OUT = 'apps/fp513-ai-slides.html';

const ctx = { window: {} };
vm.runInNewContext(rd('module-content.js'), ctx);
const CHEAT = ctx.window.MODCHEAT.FP513, EX = ctx.window.MODEX.FP513 || {};
const META = JSON.parse(rd('src/study-home.src.html').match(/FP513:(\{1:"[^}]*\})/)[1].replace(/(\d):"/g, '"$1":"'));
const SVG = JSON.parse(rd('content/fp513/visuals.json'));
const MCQ = JSON.parse(rd('content/fp513.mcqs.json'));
const VIS = { 4: ['convexity'], 5: ['opt'], 8: ['frontier', 'sml'] };
const ICON = { 1: '🏦', 2: '📜', 3: '📈', 4: '🧮', 5: '🎲', 6: '📊', 7: '💹', 8: '🧭', 9: '👪' };

const shell = rd('apps/fp512-ai-slides.html');
const head = shell.slice(0, shell.indexOf('<body'))
  .replace(/<title>[\s\S]*?<\/title>/, '<title>FP513 · High-Yield Exam Review (Visual Deck)</title>')
  + '<style>.fp5-svg{width:100%;max-width:560px;height:auto;display:block;margin:.5rem auto;color:var(--ink)}.fp5-svg text{font-family:inherit}html[data-theme="dark"] .fp5-svg{color:#e9dccb}.kn .d{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:13px}</style>\n';
const tail = shell.slice(shell.indexOf('<button id="tgl"'));

const esc = (s) => String(s).replace(/&(?![a-zA-Z#0-9]+;)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const letters = 'ABCD';
function quiz(q, label) {
  const stem = q.stem ? `<div class="casebox" style="font-size:13px;margin:6px 0">${q.stem}</div>` : '';
  return `  <details class="quiz">
    <summary><span class="qlab">${label}</span>${stem}<div>${esc(q.q)}</div><div class="opts">${q.o.map((o, i) => letters[i] + '. ' + esc(o)).join(' · ')}</div><div class="tap">▸ Tap to reveal answer</div></summary>
    <div class="ans"><div class="correct">✓ ${letters[q.a]} — ${esc(q.o[q.a])}</div><p>${q.e}</p></div>
  </details>`;
}
function pick(n) {
  const pool = MCQ.filter((q) => (n === 9 ? q.kind === 'case' : q.lo && q.lo.startsWith('LO ' + n + '.') && q.kind !== 'case'));
  const a = pool.find((q) => q.kind === 'concept' || q.kind === 'case');
  const b = pool.find((q) => q !== a && (q.kind === 'calc' || q.kind === 'applied' || q.kind === 'case'));
  return [a, b].filter(Boolean);
}

let body = `<body>
<div id="prog"></div>
<div id="rdrWrap">

  <header class="deck-head">
    <div class="eyebrow">Visual Deck · FP513 · Modules 1–9</div>
    <h1>High-Yield Exam Review</h1>
    <div class="sub">Investment Planning — <b>CFP® Domain D, 17% of the exam</b>. The formulas, numbers, rules and two-plausible-answer traps from all nine FP513 modules, on one scroll.</div>
    <div class="pillrow">
      <span class="pill">🤖 Claude-built from the app's FP513 notes</span>
      <span class="pill">🎯 Domain D · 17% weight</span>
      <span class="pill">🏦 Markets · Bonds · Stocks · Valuation</span>
      <span class="pill">📊 Risk · Returns · Portfolio · Case</span>
    </div>
  </header>

  <div class="callout tip" style="margin-top:16px;"><span class="lab">Read me first</span>Built by Claude from this app's FP513 cheat sheets, worked examples and question bank (all written from the 2026 course text and checked against it). It is a cram layer — the interactive reader is the full-depth source. Calculator steps are generic (N, I/Y, PV, PMT, FV); check them against your own calculator's manual.</div>
`;
for (let n = 1; n <= 9; n++) {
  const c = CHEAT[n] || {}, ex = EX[n];
  body += `
  <!-- ============ MODULE ${n} ============ -->
  <div class="sect"><div class="n">${n}</div><div><div class="lo">Module ${n}</div><h2>${esc(META[n])}</h2></div></div>
`;
  if (c.keyNumbers && c.keyNumbers.length) {
    body += `
  <div class="slide">
    <h3><span class="ic">${ICON[n]}</span>Key numbers &amp; formulas</h3>
    <div class="triad kn">
${c.keyNumbers.map(([k, v]) => `      <div class="opt"><div class="t">${k}</div><div class="d">${v}</div></div>`).join('\n')}
    </div>
  </div>
`;
  }
  if (c.mustKnow && c.mustKnow.length) {
    body += `
  <div class="slide">
    <h3><span class="ic">✅</span>Must know</h3>
    <ul>
${c.mustKnow.map((x) => `      <li>${x}</li>`).join('\n')}
    </ul>
${(VIS[n] || []).map((k) => '    <figure>' + SVG[k] + '</figure>').join('\n')}
  </div>
`;
  }
  if ((c.traps && c.traps.length) || (c.tips && c.tips.length)) {
    body += `
  <div class="slide">
    <h3><span class="ic">⚠️</span>Traps &amp; tips</h3>
${(c.traps || []).map((x) => `    <div class="callout trap"><span class="lab">Trap</span>${x}</div>`).join('\n')}
${(c.tips || []).map((x) => `    <div class="callout tip"><span class="lab">Exam tip</span>${x}</div>`).join('\n')}
  </div>
`;
  }
  if (ex && ex.html) {
    body += `
  <div class="slide">
    <h3><span class="ic">🧾</span>Worked example — ${ex.title}</h3>
    ${ex.html}
  </div>
`;
  }
}
body += `
  <div class="sect"><div class="n">✓</div><div><div class="lo">Check yourself</div><h2>Two questions per module</h2></div></div>
`;
for (let n = 1; n <= 9; n++) body += pick(n).map((q) => quiz(q, 'M' + n + (q.lo ? ' · ' + q.lo.replace('LO ', '') : ''))).join('\n') + '\n';
body += `
  <div class="foot" style="margin:28px 0 8px;font-size:12px;color:var(--muted);text-align:center">
    Built from this app's FP513 study content (cheat sheets, worked examples, question bank). Original wording; no textbook text, Kaplan questions or answer keys.
    Not affiliated with Kaplan / the College for Financial Planning®.
  </div>

</div>

`;
const html = head + body + tail;
if (process.argv.includes('--check')) {
  const cur = existsSync(join(ROOT, OUT)) ? rd(OUT) : '';
  if (cur !== html) { console.error(OUT + ' is stale — run node scripts/build_fp513_deck.mjs'); process.exit(1); }
  console.log(OUT + ' up to date');
} else { writeFileSync(join(ROOT, OUT), html); console.log('wrote ' + OUT + ' (' + html.length + ' bytes)'); }

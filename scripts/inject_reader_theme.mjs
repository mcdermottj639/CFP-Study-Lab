/* Inject the shared reader theme (warm + synced dark mode) into Interactive
 * Readers, and point Chart.js at the local vendored copy so charts work offline.
 * Idempotent. Run on any reader (including future ones):
 *   node scripts/inject_reader_theme.mjs apps/fp511-reading.html apps/fp512-reading.html
 */
import { readFileSync, writeFileSync } from 'node:fs';

const MARK = 'reader-theme-injected';
const files = process.argv.slice(2);
if (!files.length) { console.error('usage: inject_reader_theme.mjs <reader.html> ...'); process.exit(1); }

const HEAD = `
<!-- ${MARK} -->
<link rel="stylesheet" href="../reader-theme.css">
<script>try{var _t=localStorage.getItem('cfpTheme');if(_t==='dark')document.documentElement.setAttribute('data-theme','dark');}catch(e){}</script>
`;
const BODY = `<script src="../reader-theme.js"></script>`;
// In-reader search (loads AFTER reader-theme so its UI sits on <body>, outside the wrapper)
const SEARCH_MARK = 'reader-search-injected';
const SEARCH = `<!-- ${SEARCH_MARK} --><script src="../reader-search.js"></script>`;

for (const f of files) {
  let html = readFileSync(f, 'utf8');
  let changed = false;

  // Point any jsdelivr Chart.js / MathJax at local vendored copies (offline)
  const before = html;
  html = html.replace(/https:\/\/cdn\.jsdelivr\.net\/npm\/chart\.js[^"']*/g, '../vendor/chart.umd.js');
  html = html.replace(/https:\/\/cdn\.jsdelivr\.net\/npm\/mathjax@[0-9.]*\/es5\/tex-mml-[a-z]+\.js/g, '../vendor/mathjax/tex-mml-svg.js');
  if (html !== before) changed = true;

  if (!html.includes(MARK)) {
    // head block after first </title> (fallback: after <head>)
    if (/<\/title>/i.test(html)) html = html.replace(/<\/title>/i, (m) => m + HEAD);
    else html = html.replace(/<head[^>]*>/i, (m) => m + HEAD);
    // body script before last </body>
    const idx = html.lastIndexOf('</body>');
    html = idx !== -1 ? html.slice(0, idx) + BODY + '\n' + html.slice(idx) : html + BODY;
    changed = true;
  }

  // search script (separate marker so it lands on already-themed readers too)
  if (!html.includes(SEARCH_MARK)) {
    const idx = html.lastIndexOf('</body>');
    html = idx !== -1 ? html.slice(0, idx) + SEARCH + '\n' + html.slice(idx) : html + SEARCH;
    changed = true;
  }

  if (changed) { writeFileSync(f, html); console.log('updated:', f); }
  else console.log('unchanged:', f);
}

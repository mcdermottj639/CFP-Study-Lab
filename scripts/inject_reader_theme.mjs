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

for (const f of files) {
  let html = readFileSync(f, 'utf8');
  let changed = false;

  // Point any jsdelivr Chart.js at the local vendored copy
  const before = html;
  html = html.replace(/https:\/\/cdn\.jsdelivr\.net\/npm\/chart\.js[^"']*/g, '../vendor/chart.umd.js');
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

  if (changed) { writeFileSync(f, html); console.log('themed:', f); }
  else console.log('unchanged:', f);
}

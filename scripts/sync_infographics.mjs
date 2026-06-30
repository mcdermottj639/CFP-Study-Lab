/* Sync infographics into the app.
 *
 * Drop image files into  assets/infographics/  named:
 *     FP<course>-M<module>[-Free Text Title].<ext>
 *   e.g.  FP512-M1-Insurance-and-Risk-Management-Guide.png
 *         FP513-M4.png                       (no title -> "Visual guide")
 *
 * Then run:  node scripts/sync_infographics.mjs
 *
 * It rewrites the generated blocks (between the GEN markers) in:
 *   - module-content.js   -> window.INFOGRAPHICS = { COURSE: { MOD: [{src,title}] } }
 *   - sw.js               -> MEDIA_ASSETS precache list (offline-first)
 *
 * No engine change needed to add an image — just name it right and re-run, then
 * rebuild (node scripts/build_index.mjs && node scripts/add_content.mjs add) and
 * bump versions to deploy. Idempotent.
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIR = join(ROOT, 'assets', 'infographics');
const EXT = /\.(png|jpe?g|webp|gif|svg|avif)$/i;
const NAME = /^(FP\d{3})-M(\d+)(?:-(.*))?$/i;

let files = [];
try { files = readdirSync(DIR); } catch { files = []; }
files = files.filter((f) => EXT.test(f)).sort();

const data = {};      // { COURSE: { mod: [{src,title}] } }
const assets = [];    // ['./assets/infographics/<file>']
const skipped = [];

for (const f of files) {
  const base = f.replace(EXT, '');
  const m = base.match(NAME);
  if (!m) { skipped.push(f); continue; }
  const course = m[1].toUpperCase();
  const mod = parseInt(m[2], 10);
  const title = (m[3] || '').replace(/[-_]+/g, ' ').trim() || 'Visual guide';
  const src = 'assets/infographics/' + f;
  (data[course] ||= {});
  (data[course][mod] ||= []);
  data[course][mod].push({ src, title });
  assets.push('./' + src);
}

// Build the INFOGRAPHICS object literal (sorted, stable).
const esc = (s) => String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
let obj;
if (!Object.keys(data).length) {
  obj = 'window.INFOGRAPHICS = {};';
} else {
  const courses = Object.keys(data).sort().map((c) => {
    const mods = Object.keys(data[c]).map(Number).sort((a, b) => a - b).map((mod) => {
      const items = data[c][mod].map((g) => `{ src: '${esc(g.src)}', title: '${esc(g.title)}' }`).join(', ');
      return `      ${mod}: [ ${items} ]`;
    }).join(',\n');
    return `    ${c}: {\n${mods}\n    }`;
  }).join(',\n');
  obj = `window.INFOGRAPHICS = {\n${courses}\n  };`;
}

// Replace a generated block delimited by the GEN markers.
function replaceBlock(text, file, body, indent) {
  const re = /([ \t]*)\/\* INFOGRAPHICS-GEN-START \*\/[\s\S]*?\/\* INFOGRAPHICS-GEN-END \*\//;
  if (!re.test(text)) { console.error(`! markers not found in ${file}`); process.exit(1); }
  return text.replace(re, (full, pad) =>
    `${pad}/* INFOGRAPHICS-GEN-START */\n${indent(body, pad)}\n${pad}/* INFOGRAPHICS-GEN-END */`);
}

// module-content.js
const mcPath = join(ROOT, 'module-content.js');
let mc = readFileSync(mcPath, 'utf8');
mc = replaceBlock(mc, 'module-content.js', obj, (b, pad) =>
  b.split('\n').map((l) => l ? pad + l : l).join('\n'));
writeFileSync(mcPath, mc);

// sw.js
const swPath = join(ROOT, 'sw.js');
let sw = readFileSync(swPath, 'utf8');
const list = assets.map((a) => `'${esc(a)}'`).join(', ');
sw = replaceBlock(sw, 'sw.js', list ? list + ',' : '', (b, pad) => b ? pad + b : '');
writeFileSync(swPath, sw);

const total = Object.values(data).reduce((n, c) => n + Object.values(c).reduce((m, a) => m + a.length, 0), 0);
console.log(`✓ synced ${total} infographic(s) across ${Object.keys(data).length} course(s)`);
for (const c of Object.keys(data).sort())
  for (const mod of Object.keys(data[c]).map(Number).sort((a, b) => a - b))
    console.log(`   ${c} M${mod}: ${data[c][mod].map((g) => g.title).join(' · ')}`);
if (skipped.length) console.warn(`! skipped (bad name, expected FP###-M#-Title.ext): ${skipped.join(', ')}`);

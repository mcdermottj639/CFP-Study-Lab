/* Sync per-module media (infographics + slide decks) into the app.
 *
 * Drop files into the right folder, named  FP<course>-M<module>[-Free Text Title].<ext>
 * for a single module, or  FP<course>[-Free Text Title].<ext>  (no -M#) for a
 * WHOLE-COURSE deck — course-level media lands under module 0 (SLIDES[course][0]),
 * which the Modules-tab course card surfaces above the module list.
 *     assets/infographics/   images (png/jpg/webp/gif/svg/avif)  -> window.INFOGRAPHICS
 *     assets/slides/         slide-deck PDFs                     -> window.SLIDES
 *     assets/video/          video clips (mp4/webm/mov/m4v)      -> window.VIDEO
 *     assets/audio/          audio overviews (mp3/m4a/aac/ogg)   -> window.AUDIO
 *   e.g.  assets/infographics/FP512-M1-Insurance-and-Risk-Management-Guide.png
 *         assets/slides/FP512-M1-Principles-of-Insurance.pdf
 *         assets/slides/FP513-M4.pdf            (no title -> default below)
 *         assets/slides/FP511.pdf               (whole-course deck -> module 0)
 *
 * Then run:  node scripts/sync_media.mjs
 *
 * It rewrites the generated blocks (between the GEN markers) in:
 *   - module-content.js  -> window.INFOGRAPHICS  (INFOGRAPHICS-GEN block)
 *                           window.SLIDES        (SLIDES-GEN block)
 *                           window.VIDEO         (VIDEO-GEN block)
 *                           window.AUDIO         (AUDIO-GEN block)
 *   - sw.js              -> MEDIA_ASSETS precache list (infographics ONLY — slide
 *                           PDFs are large, so they're runtime-cached on first view
 *                           via the SW's cache-first path instead of precached)
 *
 * No engine change needed to add a file — name it right and re-run, then rebuild
 * (node scripts/build_index.mjs && node scripts/add_content.mjs add) and bump
 * versions to deploy. Idempotent.
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const NAME = /^(FP\d{3})-M(\d+)(?:-(.*))?$/i;        // single module: FP511-M3[-Title]
const NAME_COURSE = /^(FP\d{3})(?:-(.*))?$/i;         // whole course: FP511[-Title] -> module 0
const esc = (s) => String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'");

// Media kinds: dir, extension filter, default title, JS global, whether precached.
const KINDS = [
  { dir: 'infographics', ext: /\.(png|jpe?g|webp|gif|svg|avif)$/i, deft: 'Visual guide', global: 'INFOGRAPHICS', precache: true },
  { dir: 'slides',       ext: /\.pdf$/i,                            deft: 'Slide deck',   global: 'SLIDES',       precache: false },
  { dir: 'video',        ext: /\.(mp4|webm|mov|m4v)$/i,             deft: 'Video',        global: 'VIDEO',        precache: false },
  { dir: 'audio',        ext: /\.(mp3|m4a|aac|ogg|wav)$/i,          deft: 'Audio overview', global: 'AUDIO',      precache: false },
];

function scan(kind) {
  let files = [];
  try { files = readdirSync(join(ROOT, 'assets', kind.dir)); } catch { files = []; }
  files = files.filter((f) => kind.ext.test(f)).sort();
  const data = {};      // { COURSE: { mod: [{src,title}] } }
  const assets = [];    // ['./assets/<dir>/<file>']
  const skipped = [];
  for (const f of files) {
    const base = f.replace(kind.ext, '');
    // Module-level (FP511-M3[-Title]) first; else whole-course (FP511[-Title]) -> module 0.
    let m = base.match(NAME), course, mod, title;
    if (m) {
      course = m[1].toUpperCase();
      mod = parseInt(m[2], 10);
      title = (m[3] || '').replace(/[-_]+/g, ' ').trim() || kind.deft;
    } else if ((m = base.match(NAME_COURSE))) {
      course = m[1].toUpperCase();
      mod = 0;
      title = (m[2] || '').replace(/[-_]+/g, ' ').trim() || kind.deft;
    } else { skipped.push(f); continue; }
    const src = 'assets/' + kind.dir + '/' + f;
    (data[course] ||= {});
    (data[course][mod] ||= []);
    data[course][mod].push({ src, title });
    assets.push('./' + src);
  }
  return { data, assets, skipped };
}

// Build a `window.<GLOBAL> = { COURSE: { MOD: [ {src,title} ] } };` literal.
function literal(global, data) {
  if (!Object.keys(data).length) return `window.${global} = {};`;
  const courses = Object.keys(data).sort().map((c) => {
    const mods = Object.keys(data[c]).map(Number).sort((a, b) => a - b).map((mod) => {
      const items = data[c][mod].map((g) => `{ src: '${esc(g.src)}', title: '${esc(g.title)}' }`).join(', ');
      return `      ${mod}: [ ${items} ]`;
    }).join(',\n');
    return `    ${c}: {\n${mods}\n    }`;
  }).join(',\n');
  return `window.${global} = {\n${courses}\n  };`;
}

// Replace a `/* <tag>-GEN-START */ ... /* <tag>-GEN-END */` block, re-indenting body.
function replaceBlock(text, file, tag, body) {
  const re = new RegExp(`([ \\t]*)/\\* ${tag}-GEN-START \\*/[\\s\\S]*?/\\* ${tag}-GEN-END \\*/`);
  if (!re.test(text)) { console.error(`! ${tag} markers not found in ${file}`); process.exit(1); }
  return text.replace(re, (full, pad) => {
    const indented = body.split('\n').map((l) => l ? pad + l : l).join('\n');
    return `${pad}/* ${tag}-GEN-START */\n${indented}\n${pad}/* ${tag}-GEN-END */`;
  });
}

const results = Object.fromEntries(KINDS.map((k) => [k.global, { kind: k, ...scan(k) }]));

// module-content.js — one block per kind, keyed by the global's GEN tag.
const mcPath = join(ROOT, 'module-content.js');
let mc = readFileSync(mcPath, 'utf8');
for (const k of KINDS) mc = replaceBlock(mc, 'module-content.js', k.global, literal(k.global, results[k.global].data));
writeFileSync(mcPath, mc);

// sw.js — MEDIA_ASSETS precache list (precache kinds only).
const swPath = join(ROOT, 'sw.js');
let sw = readFileSync(swPath, 'utf8');
const precached = KINDS.filter((k) => k.precache).flatMap((k) => results[k.global].assets);
const list = precached.map((a) => `'${esc(a)}',`).join('\n');
sw = replaceBlock(sw, 'sw.js', 'INFOGRAPHICS', list);
writeFileSync(swPath, sw);

// Report.
for (const k of KINDS) {
  const { data, skipped } = results[k.global];
  const total = Object.values(data).reduce((n, c) => n + Object.values(c).reduce((m, a) => m + a.length, 0), 0);
  console.log(`✓ ${k.dir}: ${total} file(s) across ${Object.keys(data).length} course(s)${k.precache ? ' (precached)' : ' (runtime-cached on first view)'}`);
  for (const c of Object.keys(data).sort())
    for (const mod of Object.keys(data[c]).map(Number).sort((a, b) => a - b))
      console.log(`   ${c} M${mod}: ${data[c][mod].map((g) => g.title).join(' · ')}`);
  if (skipped.length) console.warn(`  ! skipped (bad name, expected FP###-M#-Title.ext): ${skipped.join(', ')}`);
}

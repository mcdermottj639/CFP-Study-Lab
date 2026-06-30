/* Generate a per-module study infographic (PNG) from the app's own audited
 * cheat-sheet data (MODCHEAT) — an offline, app-styled alternative to the
 * NotebookLM image infographics for courses/modules that don't have one.
 *
 *   node scripts/gen_infographic.mjs FP511 1            # one module
 *   node scripts/gen_infographic.mjs FP511 all          # every module with cheat data
 *
 * Builds an HTML one-pager (header band, key-number pills, must-know rules,
 * traps/tips boxes, term strip) and rasterizes it with the preinstalled Chromium
 * via playwright-core. Output: assets/infographics/FP<c>-M<m>-<slug>.png — which
 * the Module Hub then picks up after `node scripts/sync_media.mjs`.
 *
 * After generating: sync_media -> build_index -> add_content -> bump versions.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { chromium } from 'playwright-core';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CHROME = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

// Module names + domain accent/label, mirrored from src/study-home.src.html.
const META = {
  FP511: { name: 'General Financial Planning, Conduct & Psychology', accent: '#2f5fe0', domain: 'Conduct, General Principles & Psychology',
    mods: { 1: 'Personal Financial Planning', 2: 'Psychology of Financial Planning', 3: 'Financial Statements & Cash Flow', 4: 'Time Value of Money', 5: 'Professional Conduct & Fiduciary', 6: 'Economic Environment & Consumer Protection', 7: 'Education Planning', 8: 'Case Study' } },
  FP512: { name: 'Risk Management, Insurance & Employee Benefits', accent: '#1f9d6b', domain: 'Risk Management & Insurance Planning · 11% of exam',
    mods: { 1: 'Principles of Insurance', 2: 'Property & Casualty', 3: 'Life Insurance', 4: 'Annuities', 5: 'Health, Medicare & Medicaid', 6: 'Disability, LTC & Veterans Benefits', 7: 'Employee Group Benefits', 8: 'Business Risk Solutions' } },
};

// Load MODCHEAT from module-content.js.
global.window = {};
await import('file://' + join(ROOT, 'module-content.js'));
const MODCHEAT = global.window.MODCHEAT || {};

const esc = (s) => String(s).replace(/&(?!(amp|lt|gt|quot|#\d+);)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
// keep <b>…</b> emphasis from the source data, strip everything else
const rich = (s) => esc(s).replace(/&lt;b&gt;/g, '<b>').replace(/&lt;\/b&gt;/g, '</b>');
const slug = (s) => s.replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '');

function html(course, mod) {
  const m = META[course]; if (!m) throw new Error('unknown course ' + course);
  const C = (MODCHEAT[course] || {})[mod] || {};
  const name = m.mods[mod] || ('Module ' + mod);
  const kn = (C.keyNumbers || []).map(k => `<div class="pill"><b>${rich(k[0])}</b><span>${rich(k[1])}</span></div>`).join('');
  const mk = (C.mustKnow || []).map(x => `<li>${rich(x)}</li>`).join('');
  const tr = (C.traps || []).map(x => `<li>${rich(x)}</li>`).join('');
  const tp = (C.tips || []).map(x => `<li>${rich(x)}</li>`).join('');
  const knSec = kn ? `<h2 class="sec">★ Key numbers &amp; concepts</h2><div class="pills">${kn}</div>` : '';
  const mkSec = mk ? `<div class="box mk"><h2 class="sec">Must-know rules</h2><ul>${mk}</ul></div>` : '';
  const trSec = tr ? `<div class="box traps"><h2 class="sec">⚠ Common traps</h2><ul>${tr}</ul></div>` : '';
  const tpSec = tp ? `<div class="box tips"><h2 class="sec">✓ Test-taking tips</h2><ul>${tp}</ul></div>` : '';
  const twoCol = (trSec || tpSec) ? `<div class="row2">${mkSec || '<div></div>'}<div>${trSec}${tpSec}</div></div>` : mkSec;
  return `<!doctype html><html><head><meta charset="utf-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
#sheet{width:1000px;background:#fff;font:18px/1.45 -apple-system,system-ui,"Segoe UI",Roboto,sans-serif;color:#222a30}
.top{background:linear-gradient(135deg,${m.accent},#1d2433);color:#fff;padding:34px 40px}
.crumb{font-size:15px;letter-spacing:.16em;text-transform:uppercase;opacity:.85;font-weight:600}
.top h1{font-size:46px;font-weight:800;margin:8px 0 6px;line-height:1.08}
.top .dom{font-size:17px;opacity:.92}
.body{padding:30px 40px 36px}
.sec{font-size:18px;letter-spacing:.05em;text-transform:uppercase;color:#3a4148;border-bottom:3px solid #eef0f4;padding-bottom:8px;margin-bottom:16px}
.pills{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:28px}
.pill{background:#f6f8fe;border:1px solid #dbe4fb;border-left:5px solid ${m.accent};border-radius:12px;padding:13px 16px}
.pill b{display:block;font-size:19px;color:${m.accent};margin-bottom:3px}
.pill span{font-size:16.5px;color:#3a424a;line-height:1.4}
.row2{display:grid;grid-template-columns:1.05fr .95fr;gap:22px;align-items:start}
.box{border-radius:14px;padding:16px 20px;margin-bottom:18px}
.box ul{margin:0;padding-left:22px}
.box li{margin:9px 0;font-size:17px;line-height:1.45}
.box b{color:#1d2433}
.mk{background:#f7f9fc;border:1px solid #e4e9f2}
.traps{background:#fdf0ed;border:1px solid #f3cdc4}.traps .sec{color:#b3402f;border-color:#f3cdc4}.traps b{color:#b3402f}
.tips{background:#eef8f1;border:1px solid #c8e7d2}.tips .sec{color:#1f7a4d;border-color:#c8e7d2}.tips b{color:#1f7a4d}
.foot{display:flex;justify-content:space-between;color:#9aa3b5;font-size:14px;padding:16px 40px;border-top:1px solid #eef0f4}
</style></head><body><div id="sheet">
<div class="top"><div class="crumb">CFP® Study Lab · ${course} · Module ${mod}</div>
<h1>${esc(name)}</h1><div class="dom">${esc(m.domain)}</div></div>
<div class="body">${knSec}${twoCol}</div>
<div class="foot"><span>${course} · Module ${mod} — ${esc(name)}</span><span>Auto-built from audited study data</span></div>
</div></body></html>`;
}

async function render(course, mod) {
  const m = META[course];
  const name = m.mods[mod] || ('Module ' + mod);
  const outName = `${course}-M${mod}-${slug(name)}.png`;
  const outDir = join(ROOT, 'assets', 'infographics');
  mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox'] });
  const page = await browser.newPage({ deviceScaleFactor: 2 });
  await page.setContent(html(course, mod), { waitUntil: 'networkidle' });
  const el = await page.$('#sheet');
  await el.screenshot({ path: join(outDir, outName) });
  await browser.close();
  console.log('✓ ' + outName);
  return outName;
}

const [course, modArg] = process.argv.slice(2);
if (!course || !modArg) { console.error('usage: gen_infographic.mjs <FP5xx> <module|all>'); process.exit(1); }
const mods = modArg === 'all' ? Object.keys((MODCHEAT[course] || {})).map(Number).sort((a, b) => a - b) : [parseInt(modArg, 10)];
for (const mod of mods) await render(course, mod);

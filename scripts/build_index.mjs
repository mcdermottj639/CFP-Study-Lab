/* Build the root index.html = the CFP Study Home app, with everything this
 * project adds on top of the source artifact:
 *   1. viewport-fit=cover (iPhone safe areas)
 *   2. PWA <head> (manifest, apple meta, icons, theme)
 *   3. Chart.js swapped from the CDN to the local vendored copy (offline-first)
 *   4. A Backup/Restore toolkit + service-worker registration
 *
 * Usage:  node scripts/build_index.mjs <source.html>
 * Then:   node scripts/add_content.mjs add      (re-applies extra content/)
 */
import { readFileSync, writeFileSync } from 'node:fs';

const SRC = process.argv[2];
const OUT = 'index.html';
let html = readFileSync(SRC, 'utf8');

const HEAD = `
<!-- pwa:head -->
<link rel="manifest" href="manifest.webmanifest">
<meta name="theme-color" content="#2f5fe0">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="CFP Study">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="32x32" href="icons/favicon-32.png">
`;

// Backup / Restore toolkit — isolated, namespaced, operates on the app's
// localStorage key. Lets you move progress between iPhone/iPad and keep a
// backup as more courses are added.
const TOOLKIT = `
<!-- pwa:toolkit -->
<button id="cfpTkBtn" aria-label="Backup & tools" title="Backup & tools"
  style="position:fixed;top:max(10px,env(safe-area-inset-top));right:max(10px,env(safe-area-inset-right));z-index:99999;width:34px;height:34px;border:none;border-radius:50%;background:rgba(27,63,168,.9);color:#fff;font-size:17px;line-height:34px;text-align:center;cursor:pointer;box-shadow:0 4px 14px -4px rgba(0,0,0,.5)">&#8943;</button>
<div id="cfpTkModal" style="display:none;position:fixed;inset:0;z-index:100000;background:rgba(13,18,38,.55);align-items:center;justify-content:center;padding:20px">
  <div style="background:#fff;color:#1d2433;max-width:380px;width:100%;border-radius:18px;padding:20px;box-shadow:0 24px 60px -20px rgba(0,0,0,.5);font:15px/1.5 system-ui,-apple-system,sans-serif">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
      <b style="font-size:17px">Backup &amp; tools</b>
      <button id="cfpTkClose" style="border:none;background:none;font-size:22px;cursor:pointer;color:#6b7385;line-height:1">&times;</button>
    </div>
    <p style="font-size:13px;color:#6b7385;margin:0 0 14px">Your progress is saved on this device only. Export a backup to move it to another device or keep it safe.</p>
    <button id="cfpTkExport" style="width:100%;padding:13px;border:none;border-radius:12px;background:#2f5fe0;color:#fff;font:600 15px system-ui;cursor:pointer;margin-bottom:9px">⤓ Export progress</button>
    <label style="display:block;width:100%;padding:13px;border:1px solid #dfe3ee;border-radius:12px;background:#fff;color:#1d2433;font:600 15px system-ui;cursor:pointer;text-align:center;margin-bottom:9px">⤒ Import progress<input id="cfpTkImport" type="file" accept="application/json,.json" style="display:none"></label>
    <button id="cfpTkReset" style="width:100%;padding:11px;border:none;border-radius:12px;background:#fdecea;color:#d6453d;font:600 14px system-ui;cursor:pointer">Reset all progress</button>
    <div id="cfpTkMsg" style="font-size:12.5px;color:#1f9d6b;text-align:center;min-height:16px;margin-top:10px"></div>
  </div>
</div>
<script>
(function(){
  var LS="cfpStudyHome.v1";
  var $=function(id){return document.getElementById(id);};
  var modal=$("cfpTkModal"),msg=$("cfpTkMsg");
  function open(){modal.style.display="flex";msg.textContent="";}
  function close(){modal.style.display="none";}
  $("cfpTkBtn").onclick=open;$("cfpTkClose").onclick=close;
  modal.onclick=function(e){if(e.target===modal)close();};
  $("cfpTkExport").onclick=function(){
    var data=localStorage.getItem(LS)||"{}";
    var blob=new Blob([data],{type:"application/json"});
    var a=document.createElement("a");
    var d=new Date().toISOString().slice(0,10);
    a.href=URL.createObjectURL(blob);a.download="cfp-progress-"+d+".json";
    document.body.appendChild(a);a.click();a.remove();
    msg.style.color="#1f9d6b";msg.textContent="Backup downloaded.";
  };
  $("cfpTkImport").onchange=function(e){
    var f=e.target.files[0];if(!f)return;var r=new FileReader();
    r.onload=function(){
      try{JSON.parse(r.result);localStorage.setItem(LS,r.result);
        msg.style.color="#1f9d6b";msg.textContent="Restored. Reloading…";
        setTimeout(function(){location.reload();},700);
      }catch(err){msg.style.color="#d6453d";msg.textContent="That file isn't a valid backup.";}
    };r.readAsText(f);
  };
  $("cfpTkReset").onclick=function(){
    if(confirm("Erase all saved progress on this device? Export a backup first if unsure.")){
      localStorage.removeItem(LS);msg.style.color="#d6453d";msg.textContent="Cleared. Reloading…";
      setTimeout(function(){location.reload();},700);
    }
  };
})();
</script>
<script>
if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('sw.js').catch(function(){});});}
</script>
`;

// ---- De-cowork: the source was built in cowork with live Drive/Kyle
// connectors that don't exist in a deployed app. Replace that broken behavior
// with direct links to the bundled study labs / readers, and drop the Kyle bits.
const FIXES = [
  // Module map: link straight to the local apps instead of searching Drive
  [
    /function moduleLinks\(id\)\{[\s\S]*?\}\n(?=async function loadDrive)/,
    `function moduleLinks(id){
  var R={FP511:'apps/fp511-reading.html',FP512:'apps/fp512-reading.html'};
  var r=R[id];
  if(!r)return '<span class="muted">Interactive reader arrives with this course.</span>';
  return '<a class="link" href="'+r+'">📖 Open interactive reader</a>';
}
`,
  ],
  // loadDrive: no-op (just render) — no Drive connector in a deployed app
  [
    /async function loadDrive\(\)\{[\s\S]*?renderModules\(\);\n\}/,
    'function loadDrive(){renderModules();}',
  ],
  // Module map subtitle + remove the "Refresh from Drive" button
  [
    'Links read live from your CFP Drive folder. <span id="driveStatus" class="small muted"></span>',
    'Open a module&rsquo;s interactive reader.',
  ],
  [/<button class="btn ghost sm" onclick="loadDrive\(\)">↻ Refresh from Drive<\/button>/, ''],
  // Remove the Kyle "push to Kyle" card, keep the Settings card
  [
    /<section id="mobile" class="hidden">[\s\S]*?<h2>Settings<\/h2>/,
    '<section id="mobile" class="hidden">\n    <div class="card">\n      <h2>Settings</h2>',
  ],
  // Rename the now Settings-only tab
  ['<div class="tab" data-t="mobile">Mobile</div>', '<div class="tab" data-t="mobile">Settings</div>'],
];
for (const [pat, rep] of FIXES) {
  const before = html;
  html = html.replace(pat, rep);
  if (html === before) {
    console.error('WARNING: fix did not match ->', String(pat).slice(0, 70));
    process.exitCode = 2;
  }
}

// ---- Fresh UI: a design-system overlay applied on top of the app's own
// styles (loaded last, so it wins). New palette, premium cards, gradient
// accents, bigger type, motion, and a mobile bottom tab bar.
const FRESH_UI = `
<style id="freshUI">
:root{
  --bg:#eef1fa; --card:#ffffff; --ink:#151a2e; --muted:#6c7488; --line:#e6e9f4;
  --brand:#4b5bf0; --brand2:#7c5cf7; --good:#12a06a; --warn:#e0902a; --bad:#e0485a;
  --grad:linear-gradient(135deg,#4b5bf0 0%,#7c5cf7 100%);
  --shadow:0 1px 2px rgba(21,26,46,.04),0 14px 32px -14px rgba(21,26,46,.18);
  --shadow-lg:0 2px 8px rgba(21,26,46,.06),0 34px 64px -24px rgba(21,26,46,.36);
}
html{-webkit-text-size-adjust:100%}
body{
  background:
    radial-gradient(1100px 560px at 100% -12%,rgba(124,92,247,.12),transparent 60%),
    radial-gradient(900px 480px at -10% 112%,rgba(75,91,240,.12),transparent 55%),
    var(--bg);
  background-attachment:fixed;-webkit-font-smoothing:antialiased;
}
.wrap{max-width:1060px;padding:6px 16px 48px}
h1{font-weight:800;letter-spacing:-.6px}
h2{font-weight:750;letter-spacing:-.3px;font-size:18px}
.sub{font-size:13px;color:var(--muted)}

/* Cards */
.card{border:1px solid var(--line);border-radius:20px;padding:18px;box-shadow:var(--shadow);transition:transform .18s ease,box-shadow .18s ease}
.modcard{position:relative;border-left:none;overflow:hidden}
.modcard::before{content:"";position:absolute;left:0;top:0;bottom:0;width:5px;background:var(--brand)}
.modcard:hover{transform:translateY(-2px);box-shadow:var(--shadow-lg)}

/* KPIs + progress */
.kpi{font-weight:850;letter-spacing:-1px;color:var(--brand)}
@supports((-webkit-background-clip:text) or (background-clip:text)){
  .kpi{background:var(--grad);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
}
.bar{height:10px;background:#eceef6;border-radius:99px}
.bar>i{background:var(--grad)!important;border-radius:99px;transition:width .5s cubic-bezier(.2,.7,.3,1)}
.pill{padding:3px 10px;font-weight:700;letter-spacing:.2px}

/* Buttons */
.btn{border-radius:12px;border:none;background:var(--grad);color:#fff;font-weight:700;padding:11px 16px;box-shadow:0 8px 18px -8px rgba(75,91,240,.7);transition:transform .14s ease,box-shadow .14s ease}
.btn:hover{transform:translateY(-1px)}
.btn:active{transform:translateY(0)}
.btn.ghost{background:#fff;color:var(--brand);border:1px solid var(--line);box-shadow:none}
.btn.gray{background:#eef0f7;color:var(--ink);box-shadow:none}
.btn.sm{padding:7px 12px;font-size:12px}
a.link{color:var(--brand);font-weight:700;text-decoration:none}
a.link:hover{text-decoration:underline}

/* Quiz options + flashcards */
.opt{border-radius:14px;padding:13px 15px;border:1px solid var(--line);transition:.15s;font-weight:500}
.opt:hover{border-color:var(--brand);background:#f6f7ff}
.flash{min-height:230px;border-radius:18px;font-size:19px;font-weight:600;background:linear-gradient(160deg,#fbfbff,#f2f3fe);border:1px solid var(--line)}

/* Tabs — premium segmented bar on desktop */
.tabs{gap:6px;margin:10px 0 18px;padding:8px;background:rgba(255,255,255,.7);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid var(--line);border-radius:16px;box-shadow:var(--shadow);justify-content:center}
.tab{border:none;background:none;color:var(--muted);font-weight:700;border-radius:11px;display:inline-flex;align-items:center;gap:7px}
.tab::before{font-size:15px}
.tab[data-t="dash"]::before{content:"🏠"}
.tab[data-t="modules"]::before{content:"📚"}
.tab[data-t="study"]::before{content:"🎯"}
.tab[data-t="analytics"]::before{content:"📈"}
.tab[data-t="mobile"]::before{content:"⚙️"}
.tab.active{background:var(--grad);color:#fff;box-shadow:0 8px 18px -8px rgba(75,91,240,.7)}

/* Section enter animation */
section:not(.hidden){animation:rise .42s cubic-bezier(.2,.7,.3,1)}
@keyframes rise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}

/* Mobile: turn the tab bar into a fixed bottom nav */
@media(max-width:780px){
  body{padding-bottom:calc(80px + env(safe-area-inset-bottom))}
  .wrap{padding-top:4px}
  .tabs{position:fixed;left:0;right:0;bottom:0;top:auto;margin:0;border-radius:18px 18px 0 0;border:none;border-top:1px solid var(--line);
    padding:8px 6px calc(8px + env(safe-area-inset-bottom));background:rgba(255,255,255,.92);
    box-shadow:0 -10px 30px -16px rgba(21,26,46,.4);gap:2px;justify-content:space-around;flex-wrap:nowrap;z-index:50}
  .tab{flex:1;flex-direction:column;gap:3px;font-size:10.5px;padding:6px 2px;border-radius:12px}
  .tab::before{font-size:21px}
  .tab.active{background:none;color:var(--brand);box-shadow:none}
}
</style>
`;
html = html.replace('</head>', FRESH_UI + '</head>');

// 1. viewport-fit=cover
html = html.replace(
  /<meta name="viewport"[^>]*>/i,
  '<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">'
);
// 2. head block after first </title>
html = html.replace(/<\/title>/i, `</title>${HEAD}`);
// 3. Chart.js -> local vendored copy (offline-first, no CDN)
html = html.replace(
  /<script src="https:\/\/cdn\.jsdelivr\.net\/npm\/chart\.js@[^"]*"[^>]*><\/script>/i,
  '<script src="vendor/chart.umd.js"></script>'
);
// 4. toolkit + SW before last </body>
const idx = html.lastIndexOf('</body>');
html = idx !== -1 ? html.slice(0, idx) + TOOLKIT + html.slice(idx) : html + TOOLKIT;

writeFileSync(OUT, html);
console.log(`wrote ${OUT} (${html.length} bytes)`);

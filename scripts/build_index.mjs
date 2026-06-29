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

const SRC = process.argv[2] || 'src/study-home.src.html';
const OUT = 'index.html';
const APP_VERSION = 'v2.19.0';
let html = readFileSync(SRC, 'utf8');

const HEAD = `
<!-- pwa:head -->
<link rel="manifest" href="manifest.webmanifest">
<meta name="theme-color" content="#d0613a">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="CFP Study">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png?v=5">
<link rel="icon" type="image/png" sizes="32x32" href="icons/favicon-32.png?v=5">
<script>try{var _t=localStorage.getItem('cfpTheme');if(_t)document.documentElement.setAttribute('data-theme',_t);}catch(e){}</script>
`;

// Backup / Restore toolkit — isolated, namespaced, operates on the app's
// localStorage key. Lets you move progress between iPhone/iPad and keep a
// backup as more courses are added.
const TOOLKIT = `
<!-- pwa:toolkit -->
<button id="cfpTkBtn" aria-label="Backup & tools" title="Backup & tools"
  style="position:fixed;top:max(10px,env(safe-area-inset-top));right:max(10px,env(safe-area-inset-right));z-index:99999;width:34px;height:34px;border:none;border-radius:50%;background:rgba(208,97,58,.92);color:#fff;font-size:17px;line-height:34px;text-align:center;cursor:pointer;box-shadow:0 4px 14px -4px rgba(74,48,28,.5)">&#8943;</button>
<div id="cfpTkModal" style="display:none;position:fixed;inset:0;z-index:100000;background:rgba(13,18,38,.55);align-items:center;justify-content:center;padding:20px">
  <div style="background:#fff;color:#1d2433;max-width:380px;width:100%;border-radius:18px;padding:20px;box-shadow:0 24px 60px -20px rgba(0,0,0,.5);font:15px/1.5 system-ui,-apple-system,sans-serif">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
      <b style="font-size:17px">Backup &amp; tools</b>
      <button id="cfpTkClose" style="border:none;background:none;font-size:22px;cursor:pointer;color:#6b7385;line-height:1">&times;</button>
    </div>
    <p style="font-size:13px;color:#6b7385;margin:0 0 14px">Your progress is saved on this device only. Export a backup to move it to another device or keep it safe.</p>
    <button id="cfpTkExport" style="width:100%;padding:13px;border:none;border-radius:12px;background:linear-gradient(135deg,#dc6b3a,#e6a23c);color:#fff;font:600 15px system-ui;cursor:pointer;margin-bottom:9px">⤓ Export progress</button>
    <label style="display:block;width:100%;padding:13px;border:1px solid #dfe3ee;border-radius:12px;background:#fff;color:#1d2433;font:600 15px system-ui;cursor:pointer;text-align:center;margin-bottom:9px">⤒ Import progress<input id="cfpTkImport" type="file" accept="application/json,.json" style="display:none"></label>
    <button id="cfpTkTheme" style="width:100%;padding:12px;border:1px solid #dfe3ee;border-radius:12px;background:#fff;color:#1d2433;font:600 15px system-ui;cursor:pointer;margin-bottom:9px">🌙 Dark mode</button>
    <button id="cfpTkReset" style="width:100%;padding:11px;border:none;border-radius:12px;background:#fdecea;color:#d6453d;font:600 14px system-ui;cursor:pointer">Reset all progress</button>
    <div id="cfpTkMsg" style="font-size:12.5px;color:#1f9d6b;text-align:center;min-height:16px;margin-top:10px"></div>
    <div style="font-size:11px;color:#9aa3b5;text-align:center;margin-top:8px">CFP Study Home · __APP_VERSION__</div>
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
      try{
        var incoming=JSON.parse(r.result);
        var cur={};try{cur=JSON.parse(localStorage.getItem(LS)||"{}");}catch(_){}
        var hasLocal=cur&&Object.keys(cur).length>0;
        var doMerge = hasLocal && typeof window.cfpMergeState==="function" &&
          confirm("Merge this backup with the progress already on THIS device?\\n\\nOK = Merge (combine both)\\nCancel = Replace (use only the imported file)");
        var result = doMerge ? window.cfpMergeState(cur, incoming) : incoming;
        localStorage.setItem(LS, JSON.stringify(result));
        msg.style.color="#1f9d6b";msg.textContent=(doMerge?"Merged":"Restored")+". Reloading…";
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
  var themeBtn=$("cfpTkTheme");
  function syncTheme(){var d=document.documentElement.getAttribute("data-theme")==="dark";themeBtn.textContent=d?"☀️ Light mode":"🌙 Dark mode";}
  themeBtn.onclick=function(){
    var d=document.documentElement.getAttribute("data-theme")==="dark";
    if(d){document.documentElement.removeAttribute("data-theme");localStorage.setItem("cfpTheme","light");}
    else{document.documentElement.setAttribute("data-theme","dark");localStorage.setItem("cfpTheme","dark");}
    syncTheme();
  };
  syncTheme();
})();
</script>
<script src="module-content.js"></script>
<script src="flashcards.js"></script>
<script src="cfp-sync.js"></script>
<script>
if('serviceWorker' in navigator){
  navigator.serviceWorker.register('sw.js').catch(function(){});
  var _cfpReloaded=false;
  navigator.serviceWorker.addEventListener('controllerchange',function(){
    if(_cfpReloaded)return;_cfpReloaded=true;location.reload();
  });
}
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
@font-face{font-family:'Dancing Script';font-style:normal;font-weight:700;font-display:swap;src:url('vendor/fonts/dancing-script-latin-700-normal.woff2') format('woff2')}
@font-face{font-family:'Dancing Script';font-style:normal;font-weight:400;font-display:swap;src:url('vendor/fonts/dancing-script-latin-400-normal.woff2') format('woff2')}
:root{
  --bg:#f4ecdf; --card:#fffdf8; --ink:#2a211a; --muted:#8a7c6b; --line:#ece0cd;
  --brand:#d0613a; --brand2:#e3973c; --good:#3f9d6b; --warn:#d8902f; --bad:#d2553f;
  --grad:linear-gradient(135deg,#dc6b3a 0%,#e6a23c 100%);
  --shadow:0 1px 2px rgba(74,48,28,.05),0 14px 32px -14px rgba(74,48,28,.20);
  --shadow-lg:0 2px 8px rgba(74,48,28,.07),0 34px 64px -24px rgba(74,48,28,.34);
}
html{-webkit-text-size-adjust:100%}
body{
  background:
    radial-gradient(1100px 560px at 100% -12%,rgba(230,162,60,.18),transparent 60%),
    radial-gradient(900px 480px at -10% 112%,rgba(220,107,58,.15),transparent 55%),
    var(--bg);
  background-attachment:fixed;-webkit-font-smoothing:antialiased;
}
.wrap{max-width:1060px;padding:6px 16px 48px}
h1{font-family:"Dancing Script","Snell Roundhand","Brush Script MT",cursive;font-weight:700;letter-spacing:0;font-size:34px;line-height:1.12}
h2{font-family:ui-serif,"New York","Iowan Old Style",Georgia,serif;font-weight:650;letter-spacing:-.2px;font-size:19px}
.sub{font-size:13px;color:var(--muted)}

/* Cards */
.card{border:1px solid var(--line);border-radius:20px;padding:18px;box-shadow:var(--shadow);transition:transform .18s ease,box-shadow .18s ease}
.modcard{position:relative;border-left:none;overflow:hidden}
.modcard::before{content:"";position:absolute;left:0;top:0;bottom:0;width:5px;background:var(--brand)}
.modcard:hover{transform:translateY(-2px);box-shadow:var(--shadow-lg)}

/* KPIs + progress */
.kpi{font-family:ui-serif,"New York","Iowan Old Style",Georgia,serif;font-weight:700;letter-spacing:-.5px;color:var(--brand)}
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
.opt:hover{border-color:var(--brand);background:#fdf3ea}
.flash{min-height:200px;height:auto;border-radius:18px;font-size:17px;font-weight:600;line-height:1.5;flex-direction:column;text-align:center;padding:24px 22px;background:linear-gradient(160deg,#fffdf8,#f7ecda);border:1px solid var(--line)}
.flash>div{max-width:100%}
.flash b{font-weight:800}
.flashseg{display:flex;gap:6px;margin:12px 0 2px;background:#f1e7d6;padding:4px;border-radius:12px}
.flashseg button{flex:1;border:none;background:none;padding:9px;border-radius:9px;font:700 13px system-ui,-apple-system,sans-serif;color:var(--muted);cursor:pointer;transition:.15s}
.flashseg button.on{background:var(--card);color:var(--ink);box-shadow:var(--shadow)}
.flashopts{display:flex;gap:8px;margin:8px 0 2px}
.flashopts button{flex:1;border:1px solid var(--line);background:var(--card);padding:9px;border-radius:11px;font:700 12.5px system-ui,-apple-system,sans-serif;color:var(--muted);cursor:pointer;transition:.15s}
.flashopts button.on{background:var(--grad);color:#fff;border-color:transparent}

/* Module deep-dive list — large, finger-friendly tap targets */
.modlist{margin-top:12px}
.modlist>summary{cursor:pointer;font-weight:700;font-size:14px;padding:10px 6px;list-style:none;border-top:1px solid var(--line)}
.modlist>summary::-webkit-details-marker{display:none}
.modlist>summary:hover{color:var(--brand)}
.modrows{margin-top:4px}
.modrow{display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%;text-align:left;
  min-height:50px;padding:11px 14px;margin:7px 0;border:1px solid var(--line);border-radius:13px;
  background:var(--card);color:var(--ink);font:inherit;cursor:pointer;transition:.13s;box-shadow:var(--shadow)}
.modrow:hover{border-color:var(--brand);background:#fdf3ea}
.modrow:active{transform:scale(.99)}
.modrow[disabled]{cursor:default;opacity:.5;box-shadow:none}
.modrow-l{display:flex;align-items:center;gap:11px;min-width:0}
.modnum{flex:0 0 auto;font-weight:800;font-size:12.5px;padding:4px 9px;border-radius:9px;letter-spacing:.02em}
.modname{font-size:14.5px;font-weight:600;line-height:1.25}
.modrow-r{display:flex;align-items:center;gap:9px;flex:0 0 auto}
.modchev{font-size:22px;color:var(--muted);line-height:1;font-weight:700}

/* Module Hub → quick module switcher (prev/next + M# chips) */
.modswitch{display:flex;flex-wrap:wrap;gap:6px;margin-top:12px}
.modchip{min-width:36px;padding:7px 10px;border:1px solid var(--line);border-radius:9px;background:var(--card);color:var(--ink);font:700 12.5px system-ui,-apple-system,sans-serif;cursor:pointer;transition:.12s}
.modchip.on{background:var(--grad);color:#fff;border-color:transparent}
.modchip[disabled]{opacity:.38;cursor:default}
.modchip:not(.on):not([disabled]):hover{border-color:var(--brand);background:#fdf3ea}
html[data-theme="dark"] .modchip:not(.on):not([disabled]):hover{background:#2f251d}

/* ---- Warm dark mode (opt-in via Settings/toolkit) ---- */
html[data-theme="dark"]{
  --bg:#191310; --card:#241b15; --ink:#f4ece2; --muted:#b4a594; --line:#3a2e25;
  --brand:#ec8a5b; --brand2:#eeae5c; --good:#4cae7a; --warn:#e0a23a; --bad:#e86a59;
  --grad:linear-gradient(135deg,#ec8a5b 0%,#eeae5c 100%);
  --shadow:0 1px 2px rgba(0,0,0,.45),0 14px 32px -14px rgba(0,0,0,.65);
  --shadow-lg:0 2px 8px rgba(0,0,0,.5),0 34px 64px -24px rgba(0,0,0,.72);
  color-scheme:dark;
}
html[data-theme="dark"] body{background:
  radial-gradient(1100px 560px at 100% -12%,rgba(238,174,92,.10),transparent 60%),
  radial-gradient(900px 480px at -10% 112%,rgba(236,138,91,.10),transparent 55%),
  var(--bg);}
html[data-theme="dark"] .flash{background:linear-gradient(160deg,#2b211a,#241b15)}
html[data-theme="dark"] .flashseg{background:#2b211a}
html[data-theme="dark"] .bar{background:#3a2e25}
html[data-theme="dark"] .opt{background:#241b15}
html[data-theme="dark"] .opt:hover{background:#2f251d}
html[data-theme="dark"] .modrow:hover{background:#2f251d}
html[data-theme="dark"] .opt.correct{background:#163420!important;border-color:#2f6b40!important}
html[data-theme="dark"] .opt.wrong{background:#3a1c1c!important;border-color:#7a3232!important}
html[data-theme="dark"] .btn.gray{background:#3a2e25;color:var(--ink)}
html[data-theme="dark"] .tabs{background:rgba(36,27,21,.85)}
html[data-theme="dark"] .expl,html[data-theme="dark"] [style*="#f4f7ff"]{background:#2b2118!important;border-color:#3a2e25!important;color:var(--ink)!important}
html[data-theme="dark"] select,html[data-theme="dark"] input,html[data-theme="dark"] textarea{background:#2b211a!important;color:var(--ink)!important;border:1px solid #3a2e25!important}
html[data-theme="dark"] select option{background:#241b15;color:#f4ece2}
html[data-theme="dark"] ::placeholder{color:#8f8170}
html[data-theme="dark"] .tag{background:#3a2e25;color:#e8d8c6}

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

html = html.replaceAll('__APP_VERSION__', APP_VERSION);
writeFileSync(OUT, html);
console.log(`wrote ${OUT} (${html.length} bytes)`);

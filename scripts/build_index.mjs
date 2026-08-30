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
const APP_VERSION = 'v2.112.1';
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
    <p style="font-size:13px;color:#6b7385;margin:0 0 14px">Connect GitHub auto-sync below to keep your progress backed up and in sync across devices.</p>
    <button id="cfpTkTheme" style="width:100%;padding:12px;border:1px solid #dfe3ee;border-radius:12px;background:#fff;color:#1d2433;font:600 15px system-ui;cursor:pointer;margin-bottom:9px">🌙 Dark mode</button>
    <button id="cfpTkReset" style="width:100%;padding:11px;border:none;border-radius:12px;background:#fdecea;color:#d6453d;font:600 14px system-ui;cursor:pointer">Reset all progress</button>
    <div id="cfpTkVoiceWrap" style="display:none;margin-top:14px;border-top:1px solid #eef0f6;padding-top:13px">
      <label for="cfpTkVoice" style="display:block;font:600 13.5px system-ui;color:#1d2433;margin-bottom:6px">🔊 Read-aloud voice</label>
      <div style="display:flex;gap:8px">
        <select id="cfpTkVoice" style="flex:1;min-width:0;padding:10px;border:1px solid #dfe3ee;border-radius:10px;background:#fff;color:#1d2433;font:14px system-ui"></select>
        <button id="cfpTkVoicePrev" style="flex:0 0 auto;padding:10px 13px;border:1px solid #dfe3ee;border-radius:10px;background:#fff;color:#1d2433;font:600 13px system-ui;cursor:pointer">▶︎</button>
      </div>
      <p style="font-size:11.5px;color:#9aa3b5;margin:8px 0 0;line-height:1.45"><b>On iPhone, keep this on “Automatic.”</b> The app then uses your <b>device default</b> voice — set it in Settings → Accessibility → Spoken Content → <b>Voices → English</b> (download <b>Ava</b> or another Enhanced/Premium voice and tap it to make it the default). iOS doesn’t show Enhanced/Premium labels to web apps and can’t use Siri voices — and forcing a specific voice here often sounds worse than the device default, so the list is mainly for desktop.</p>
    </div>
    <div id="cfpTkMsg" style="font-size:12.5px;color:#1f9d6b;text-align:center;min-height:16px;margin-top:10px"></div>
    <div style="font-size:11px;color:#9aa3b5;text-align:center;margin-top:8px">CFP Study Home · __APP_VERSION__</div>
  </div>
</div>
<script>
(function(){
  var LS="cfpStudyHome.v1";
  var $=function(id){return document.getElementById(id);};
  var modal=$("cfpTkModal"),msg=$("cfpTkMsg");
  function open(){modal.style.display="flex";msg.textContent="";loadVoices();}
  function close(){modal.style.display="none";}
  // ---- Read-aloud voice picker (writes localStorage 'cfpTtsVoice'; honored by
  //      ttsPickVoice() in the app + pickVoice() in reader-tts.js) ----
  var vsel=$("cfpTkVoice"),vprev=$("cfpTkVoicePrev"),vwrap=$("cfpTkVoiceWrap"),ttsOK=("speechSynthesis" in window)&&(typeof SpeechSynthesisUtterance!=="undefined");
  function loadVoices(){
    if(!ttsOK||!vsel)return;
    var vs=[];try{vs=speechSynthesis.getVoices()||[];}catch(e){}
    if(!vs.length)return;                         // populate later via onvoiceschanged
    if(vwrap)vwrap.style.display="block";
    var en=vs.filter(function(v){return /^en/i.test(v.lang||"");});if(!en.length)en=vs;
    var cur="";try{cur=localStorage.getItem("cfpTtsVoice")||"";}catch(e){}
    function esc(s){return String(s).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;");}
    vsel.innerHTML='<option value="">Automatic (device default) — recommended</option>'+en.map(function(v){
      var id=v.voiceURI||v.name,sel=(id===cur||v.name===cur)?" selected":"";
      return '<option value="'+esc(id)+'"'+sel+'>'+esc(v.name)+" ("+esc(v.lang)+")</option>";
    }).join("");
  }
  if(ttsOK){loadVoices();try{speechSynthesis.onvoiceschanged=loadVoices;}catch(e){}}
  if(vsel)vsel.onchange=function(){try{if(vsel.value)localStorage.setItem("cfpTtsVoice",vsel.value);else localStorage.removeItem("cfpTtsVoice");}catch(e){}};
  if(vprev)vprev.onclick=function(){
    if(!ttsOK)return;
    try{speechSynthesis.cancel();
      var u=new SpeechSynthesisUtterance("This is how your read-aloud voice will sound while you study.");u.rate=0.95;
      var pref=vsel&&vsel.value,vs=speechSynthesis.getVoices()||[];
      var v=pref?vs.filter(function(x){return x.voiceURI===pref||x.name===pref;})[0]:null;
      if(v){u.voice=v;u.lang=v.lang;}
      speechSynthesis.speak(u);
    }catch(e){}
  };
  $("cfpTkBtn").onclick=open;$("cfpTkClose").onclick=close;
  modal.onclick=function(e){if(e.target===modal)close();};
  $("cfpTkReset").onclick=function(){
    if(confirm("Erase all saved progress on this device? If GitHub auto-sync is connected, your gist still holds a copy.")){
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
<script src="mcq-why.js"></script>
<script src="card-tiers.js"></script>
<script src="flashcards.js"></script>
<script src="cfp-gist-sync.js"></script>
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
  // Opened course-wide (not from a module) -> clear any stale module-return context.
  return '<a class="link" href="'+r+'" onclick="try{sessionStorage.removeItem(\\'cfpReaderReturn\\')}catch(e){}">📖 Open interactive reader</a>';
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
.modlist-open{display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%;text-align:left;
  margin-top:12px;padding:11px 6px;border:none;border-top:1px solid var(--line);border-radius:0;
  background:transparent;color:var(--ink);font:inherit;font-weight:700;font-size:14px;cursor:pointer;transition:.13s}
.modlist-open:hover{color:var(--brand)}
.modlist-open:active{opacity:.7}
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
/* Dark-mode overrides for surfaces added after this palette was written — each was
   authored with a hardcoded light background and no dark counterpart, so it stayed
   a bright panel in dark mode. Warm-dark tints matching .expl above. */
html[data-theme="dark"] .whynot{background:#2b1e1b;border-color:#4a332e}
html[data-theme="dark"] .wn-h,html[data-theme="dark"] .wn-you{color:#e8907f}
html[data-theme="dark"] .casebox{background:#2b2318;border-color:#4a3a25;border-left-color:#d98a1f}
html[data-theme="dark"] .tts-btn{background:transparent}
html[data-theme="dark"] .tts-btn:hover{background:#2f251d}
html[data-theme="dark"] .btn.ghost{background:transparent}
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

/* ==========================================================================
   CLASSICAL — editorial restyle (v2.112.0).

   STRUCTURE + TYPOGRAPHY ONLY. This block is appended LAST so it overrides
   everything above without deleting any of it, and it reuses every existing
   colour token unchanged (--bg/--card/--ink/--muted/--line/--brand/--good/
   --warn/--bad and the whole warm dark mode). Nothing in the app's markup,
   content or engine JS is touched by this — delete this one block to return
   to the previous look.

   The move: from soft "product UI" (gradients, pill tabs, big radii, drop
   shadows) to a printed-page language — flat warm paper, 2px rules instead
   of boxes, serif figures with tabular numerals, uppercase letterspaced
   kickers, and justified prose.
   ========================================================================== */
:root{
  --serif:ui-serif,"Iowan Old Style","New York",Georgia,"Times New Roman",serif;
  --rule:#d9c9ae;   /* a firmer draw of --line, same warm family */
  --rad:6px;        /* near-square: classical, not pill */
}
html[data-theme="dark"]{--rule:#4a3b2e}

/* Flat paper — drop the corner glows, keep the exact background colour */
body,html[data-theme="dark"] body{background:var(--bg)}

/* --- Type ------------------------------------------------------------- */
/* h1 stays Dancing Script: it's the brand (and the app icon), and a script
   display face over a serif body is a traditional editorial pairing. */
h2,h3{font-family:var(--serif);font-weight:600;letter-spacing:-.01em}
h2{font-size:23px;line-height:1.2}
h3{font-size:18px}

/* .sub becomes the kicker — small, uppercase, letterspaced. Two exceptions:
   the header standfirst and the Module-map line are sentences, not labels. */
.sub{font-size:11px;font-weight:600;letter-spacing:.13em;text-transform:uppercase;
  font-variant-numeric:tabular-nums;line-height:1.35;color:var(--muted)}
#appHeader .sub,h1+.sub,h2+.sub{font-size:13px;font-weight:400;letter-spacing:0;
  text-transform:none;line-height:1.5}

/* Figures: serif, tabular, tight. Solid brand — no gradient text clip. */
.kpi{font-family:var(--serif);font-weight:600;font-variant-numeric:tabular-nums;
  letter-spacing:-.02em;line-height:.95;color:var(--brand);
  background:none!important;-webkit-text-fill-color:currentColor!important}

/* --- Rules instead of boxes ------------------------------------------- */
.card{border:2px solid var(--rule);border-radius:var(--rad);box-shadow:none;transition:none}
.modcard::before{width:3px}
.modcard:hover{transform:none;box-shadow:none}

.bar{height:9px;border:1px solid var(--rule);border-radius:0;background:transparent}
.bar>i{background:var(--brand)!important;border-radius:0}

/* --- Buttons: flat, ruled, no lift ------------------------------------ */
.btn{border-radius:var(--rad);border:2px solid var(--brand);background:var(--brand);
  color:#fff;font-weight:600;box-shadow:none;
  transition:background .14s ease,color .14s ease,border-color .14s ease}
.btn:hover,.btn:active{transform:none}
.btn.ghost{background:transparent;border-color:var(--rule);color:var(--brand);box-shadow:none}
.btn.ghost:hover{border-color:var(--brand)}
.btn.gray{background:transparent;border-color:var(--rule);color:var(--ink);box-shadow:none}
html[data-theme="dark"] .btn.gray{background:transparent;color:var(--ink)}
.btn.sm{padding:7px 12px;font-size:12px}
.revnext .btn{box-shadow:none}
a.link{font-weight:600}

/* Tags outline; .pill keeps its inline status colour (inline style wins) */
.tag{border:2px solid var(--rule);border-radius:4px;background:transparent;
  color:var(--muted);font-weight:600;letter-spacing:.06em;padding:3px 9px}
html[data-theme="dark"] .tag{background:transparent;color:var(--muted)}
.pill{border-radius:4px;font-weight:600;letter-spacing:.06em;font-variant-numeric:tabular-nums}
/* Three pills carry an inline cold blue-grey left over from the original blue
   design system (#eef0f6 / #f0f2f8) — wrong in the warm palette, and bright
   chips in dark mode since they had no dark counterpart. Same attribute-selector
   technique the dark block above already uses for #f4f7ff. */
.pill[style*="#eef0f6"],.pill[style*="#f0f2f8"]{
  background:transparent!important;border:2px solid var(--rule);color:var(--muted)!important}

/* --- Navigation: a ruled masthead on desktop -------------------------- */
.tabs{gap:0;margin:12px 0 20px;padding:8px 0 0;background:var(--bg);  /* sticky: must stay opaque */
  backdrop-filter:none;-webkit-backdrop-filter:none;
  border:none;border-bottom:2px solid var(--rule);border-radius:0;box-shadow:none;
  justify-content:flex-start;flex-wrap:wrap}
html[data-theme="dark"] .tabs{background:var(--bg)}
.tab{font-family:var(--serif);font-size:15px;font-weight:600;color:var(--muted);
  background:none;border:none;border-bottom:3px solid transparent;border-radius:0;
  padding:9px 0;margin-right:22px;gap:0}
.tab::before{display:none}          /* emoji stay on the mobile bar, below */
.tab:hover{color:var(--brand)}
.tab.active{background:none;color:var(--ink);border-bottom-color:var(--brand);box-shadow:none}

/* --- Quiz + flashcards ------------------------------------------------ */
.opt{border:2px solid var(--rule);border-radius:var(--rad);font-weight:500}
.opt:hover{border-color:var(--brand)}

.flash{background:var(--card);border:2px solid var(--rule);border-bottom:3px solid var(--brand);
  border-radius:var(--rad);font-family:var(--serif);font-size:26px;font-weight:600;
  line-height:1.25;text-align:left;align-items:flex-start;justify-content:center;
  padding:28px 26px;text-wrap:pretty}
html[data-theme="dark"] .flash{background:var(--card)}
.flash b{font-weight:700}

.flashseg{background:transparent;border:2px solid var(--rule);border-radius:var(--rad);padding:3px;gap:3px}
html[data-theme="dark"] .flashseg{background:transparent}
.flashseg button{border-radius:3px;font-weight:600}
.flashseg button.on{background:var(--brand);color:#fff;box-shadow:none}
.flashopts button{border:2px solid var(--rule);border-radius:var(--rad);font-weight:600}
.flashopts button.on{background:var(--brand);color:#fff;border-color:var(--brand)}

/* --- Prose blocks: a margin rule, not a coloured box ------------------- */
/* !important is needed to beat the dark-mode .expl rule written above. */
.expl{background:transparent!important;border:none!important;border-radius:0;
  border-left:3px solid var(--brand)!important;padding:2px 0 2px 14px;
  color:var(--ink)!important;line-height:1.65}
.whynot{background:transparent;border:none;border-radius:0;
  border-left:3px solid var(--bad);padding:2px 0 2px 14px}
html[data-theme="dark"] .whynot{background:transparent;border-left-color:var(--bad)}
.casebox{background:transparent;border:none;border-radius:0;
  border-left:3px solid var(--warn);padding:2px 0 2px 14px}
html[data-theme="dark"] .casebox{background:transparent;border-left-color:var(--warn)}
/* Justify only where the measure is wide enough to do it well */
@media(min-width:560px){
  .expl,.casebox,.whynot li{text-align:justify;hyphens:auto}
}
.tts-btn{border-radius:4px;border:2px solid var(--brand);font-weight:600}

/* Today's focus banner (renderTodayFocus, v2.95.0) is inline-styled
   background:#f4ecdf with no dark counterpart, so in dark mode it rendered as a
   bright cream panel with its light headline text invisible on top. A scripted
   sweep of all five tabs confirms this was the only light-on-light surface left. */
[style*="#f4ecdf"]{border-radius:var(--rad)!important}
html[data-theme="dark"] [style*="#f4ecdf"]{background:#2b211a!important}

/* --- Lists, tables, fields, chrome ------------------------------------ */
.modrow{border:2px solid var(--rule);border-radius:var(--rad);box-shadow:none}
.modrow:hover{border-color:var(--brand)}
.modrow:active{transform:none}
.modnum{border-radius:3px;font-weight:600}
.modchip{border:2px solid var(--rule);border-radius:4px;font-weight:600}
.modchip.on{background:var(--brand);color:#fff;border-color:var(--brand)}
.modlist-open,.modlist>summary{border-top:2px solid var(--rule)}

table{font-variant-numeric:tabular-nums}
th{color:var(--ink);font-weight:600;border-bottom:2px solid var(--rule)}
td{border-bottom:1px solid var(--line)}

input,select,textarea{border:2px solid var(--rule);border-radius:4px;max-width:100%}
/* Pre-existing phone overflow: .row is a flex item at min-width:auto, so the
   widest <select>'s intrinsic width pushed it past the card (3px before this
   change, 6px once borders went to 2px). Letting flex items shrink lets the
   max-width above actually clamp. */
.row,.row>*{min-width:0}
html[data-theme="dark"] input,html[data-theme="dark"] select,html[data-theme="dark"] textarea{
  border:2px solid var(--rule)!important}

#studyBar{border:2px solid var(--rule);border-radius:var(--rad)}
.revnext{border-top:2px solid var(--rule);border-radius:0}
.toast{border-radius:var(--rad)}

/* --- Mobile: keep the icon bottom bar, squared off --------------------- */
@media(max-width:780px){
  /* margin:0 is REQUIRED. The desktop .tabs rule above sets margin:12px 0 20px and
     is later in the file than the earlier mobile @media block, so it wins here too —
     and on a position:fixed;bottom:0 bar, margin-bottom lifts it off the bottom edge
     and content scrolls visibly through the gap underneath. */
  .tabs{margin:0;border-bottom:none;border-top:2px solid var(--rule);border-radius:0;
    background:var(--card);box-shadow:none;justify-content:space-around;flex-wrap:nowrap;
    padding:8px 6px calc(8px + env(safe-area-inset-bottom))}
  html[data-theme="dark"] .tabs{background:var(--card)}
  .tab{font-family:inherit;font-size:10.5px;font-weight:600;margin-right:0;
    border-bottom:none;padding:6px 2px;gap:3px}
  .tab::before{display:block;font-size:21px}
  .tab.active{color:var(--brand);border-bottom:none}
  .flash{font-size:22px;padding:22px 20px}
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

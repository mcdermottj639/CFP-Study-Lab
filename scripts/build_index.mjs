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

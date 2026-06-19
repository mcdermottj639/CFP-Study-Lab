/* Inject PWA hooks into each standalone app page (idempotent).
 * - <head>: manifest link, apple/web-app meta, theme-color, icons, viewport-fit
 * - before </body>: a floating "Home" button (no browser chrome in standalone)
 *   and service-worker registration.
 * Relative paths use ../ because these pages live in /apps/.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const FILES = [
  'apps/fp511-study.html',
  'apps/fp511-reading.html',
  'apps/fp512-study.html',
  'apps/fp512-reading.html',
];

const MARKER = 'fpsl-injected';

const HEAD = `
<!-- ${MARKER}:head -->
<link rel="manifest" href="../manifest.webmanifest">
<meta name="theme-color" content="#1f4d3a">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="FP Study Lab">
<link rel="apple-touch-icon" href="../icons/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="32x32" href="../icons/favicon-32.png">
`;

const BODY = `
<!-- ${MARKER}:body -->
<a href="../index.html" id="fpslHome" aria-label="Back to study home"
   style="position:fixed;left:max(14px,env(safe-area-inset-left));bottom:max(14px,env(safe-area-inset-bottom));z-index:9999;display:inline-flex;align-items:center;gap:7px;padding:10px 14px;border-radius:999px;background:#1f4d3a;color:#f4efe4;font:600 13.5px/1 'Hanken Grotesk',system-ui,sans-serif;text-decoration:none;box-shadow:0 6px 20px -6px rgba(35,31,26,.5);border:1px solid rgba(255,255,255,.12)">
  <span style="font-size:15px;line-height:1">⌂</span><span>Home</span>
</a>
<script>
if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('../sw.js').catch(function(){});});}
</script>
`;

let changed = 0;
for (const f of FILES) {
  let html = readFileSync(f, 'utf8');
  if (html.includes(MARKER)) {
    console.log(`skip (already injected): ${f}`);
    continue;
  }
  // ensure viewport has viewport-fit=cover for safe-area insets on iPhone
  html = html.replace(
    /<meta name="viewport"[^>]*>/i,
    '<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">'
  );
  // inject head block right after </title>
  if (/<\/title>/i.test(html)) {
    html = html.replace(/<\/title>/i, `</title>${HEAD}`);
  } else {
    html = html.replace(/<head[^>]*>/i, (m) => `${m}${HEAD}`);
  }
  // inject body block right before </body>
  html = html.replace(/<\/body>/i, `${BODY}</body>`);
  writeFileSync(f, html);
  changed++;
  console.log(`injected: ${f}`);
}
console.log(`done — ${changed} file(s) updated`);

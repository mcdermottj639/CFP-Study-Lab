/* Build the root index.html = the CFP Study Home app, with PWA hooks injected
 * for the site ROOT (no Home button — it's the only app).
 * Source is the uploaded artifact; output is ./index.html.
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

const SW = `
<script>
if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('sw.js').catch(function(){});});}
</script>
`;

// viewport-fit=cover for iPhone safe areas
html = html.replace(
  /<meta name="viewport"[^>]*>/i,
  '<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">'
);

// head block after first </title>
html = html.replace(/<\/title>/i, `</title>${HEAD}`);

// SW registration before last </body>
const idx = html.lastIndexOf('</body>');
html = idx !== -1 ? html.slice(0, idx) + SW + html.slice(idx) : html + SW;

writeFileSync(OUT, html);
console.log(`wrote ${OUT} (${html.length} bytes)`);

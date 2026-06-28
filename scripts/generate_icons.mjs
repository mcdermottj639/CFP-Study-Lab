/* Generate app icons: script "CFP" wordmark (Dancing Script) on the warm brand,
 * rendered via @resvg/resvg-js. Build-time only.
 * Run: node scripts/generate_icons.mjs   (needs: npm i @resvg/resvg-js; font at vendor/fonts/DancingScript-700.ttf) */
import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const require = createRequire(import.meta.url);
const { Resvg } = require('@resvg/resvg-js');

const TTF = 'vendor/fonts/DancingScript-700.ttf';
const BG = '#1f4d3a', FG = '#f6f7fb';
const sizes = { 'icon-192.png':192, 'icon-512.png':512, 'apple-touch-icon.png':180, 'icon-maskable-512.png':512, 'favicon-32.png':32 };

for (const [name, n] of Object.entries(sizes)) {
  const fs = Math.round(n * 0.52);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${n}" height="${n}" viewBox="0 0 ${n} ${n}">
    <rect width="${n}" height="${n}" fill="${BG}"/>
    <text x="${n/2}" y="${n*0.66}" font-family="Dancing Script" font-weight="700" font-size="${fs}" fill="${FG}" text-anchor="middle">CFP</text>
  </svg>`;
  const r = new Resvg(svg, { font: { fontFiles: [TTF], loadSystemFonts: false, defaultFontFamily: 'Dancing Script' }, fitTo: { mode: 'width', value: n } });
  writeFileSync('icons/' + name, r.render().asPng());
  console.log('wrote', name, n + 'px');
}

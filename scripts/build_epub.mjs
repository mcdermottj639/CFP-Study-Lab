/* build_epub.mjs — generate e-ink-friendly EPUBs for the XTEINK X4 (and any e-reader).
 *
 * WHY: the X4 is a passive, page-turn e-ink reader (4.3", 800x480, no backlight) that
 * natively reads EPUB/TXT. None of the app's interactivity ports to it, so instead we
 * emit reflowable EPUB "study documents" from the SAME sources the app uses. This keeps
 * a single source of truth — regenerate after content changes.
 *
 * Sources (no engine change, no new data):
 *   content/*.cards.json  -> Flashcards self-quiz  (Q on a page, answer on the next)
 *   content/*.mcqs.json + mcq-why.js -> MCQ practice (Q+options, then answer+why-wrong)
 *   module-content.js MODCHEAT/MODOBJ/MODSYN -> Exam Cram sheets
 *   apps/fp51x-reading.html -> Reader (tab -> chapter, reflowed to plain e-ink prose)
 *
 * Grouping uses the app's own MODMETA / TOPIC_MOD (parsed out of src/study-home.src.html),
 * so modules match the Study tab exactly.
 *
 * Zero dependencies: EPUB is written by a tiny pure-JS ZIP writer (STORE method + CRC32),
 * so this runs with just Node — no `npm install`, respecting the offline rule.
 *
 *   node scripts/build_epub.mjs           # writes dist/ereader/*.epub
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'dist', 'ereader');
const rd = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8').replace(/\0/g, '');

/* ------------------------------------------------------------------ ZIP (STORE) */
const CRC = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function zip(files) {
  // files: [{name, data:Buffer}]  — all stored (compression method 0)
  const locals = [];
  const central = [];
  let offset = 0;
  for (const f of files) {
    const name = Buffer.from(f.name, 'utf8');
    const data = f.data;
    const crc = crc32(data);
    const lh = Buffer.alloc(30);
    lh.writeUInt32LE(0x04034b50, 0);
    lh.writeUInt16LE(20, 4);              // version needed
    lh.writeUInt16LE(0, 6);              // flags
    lh.writeUInt16LE(0, 8);              // method: store
    lh.writeUInt16LE(0, 10);            // time
    lh.writeUInt16LE(0x21, 12);        // date (arbitrary, deterministic)
    lh.writeUInt32LE(crc, 14);
    lh.writeUInt32LE(data.length, 18);
    lh.writeUInt32LE(data.length, 22);
    lh.writeUInt16LE(name.length, 26);
    lh.writeUInt16LE(0, 28);
    locals.push(lh, name, data);
    const ch = Buffer.alloc(46);
    ch.writeUInt32LE(0x02014b50, 0);
    ch.writeUInt16LE(20, 4);
    ch.writeUInt16LE(20, 6);
    ch.writeUInt16LE(0, 8);
    ch.writeUInt16LE(0, 10);
    ch.writeUInt16LE(0, 12);
    ch.writeUInt16LE(0x21, 14);
    ch.writeUInt32LE(crc, 16);
    ch.writeUInt32LE(data.length, 20);
    ch.writeUInt32LE(data.length, 24);
    ch.writeUInt16LE(name.length, 28);
    ch.writeUInt32LE(0, 42);            // rel offset of local header
    ch.writeUInt32LE(offset, 42);
    central.push(ch, name);
    offset += lh.length + name.length + data.length;
  }
  const cdStart = offset;
  const cd = Buffer.concat(central);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(files.length, 8);
  eocd.writeUInt16LE(files.length, 10);
  eocd.writeUInt32LE(cd.length, 12);
  eocd.writeUInt32LE(cdStart, 16);
  return Buffer.concat([...locals, cd, eocd]);
}

/* ------------------------------------------------------------- text sanitizing */
const ENT = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', mdash: '—',
  ndash: '–', hellip: '…', rsquo: '’', lsquo: '‘',
  ldquo: '“', rdquo: '”', times: '×', divide: '÷',
  deg: '°', le: '≤', ge: '≥', ne: '≠', rarr: '→',
  larr: '←', harr: '↔', darr: '↓', uarr: '↑', bull: '•',
  middot: '·', trade: '™', reg: '®', copy: '©', cent: '¢',
  sect: '§', para: '¶', prime: '′', Prime: '″', frac12: '½',
  frac14: '¼', frac34: '¾', minus: '−', plusmn: '±',
};
function decodeEntities(s) {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&([a-z][a-z0-9]*);/gi, (m, n) => (ENT[n] != null ? ENT[n] : m));
}
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const stripTags = (s) => decodeEntities(String(s).replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();

// keep a small inline whitelist, decode entities, re-escape stray markup -> valid XHTML
const INLINE_OK = new Set(['b', 'strong', 'i', 'em', 'u', 'sup', 'sub', 'br']);
function inlineXhtml(html) {
  if (html == null) return '';
  let s = String(html).replace(/<br\s*\/?>/gi, 'BR');
  const toks = [];
  s = s.replace(/<(\/?)([a-z0-9]+)[^>]*>/gi, (m, slash, tag) => {
    tag = tag.toLowerCase();
    if (tag === 'br') return '';
    if (!INLINE_OK.has(tag)) return '';
    toks.push('<' + slash + tag + '>');
    return 'T' + (toks.length - 1) + '';
  });
  s = esc(decodeEntities(s));
  s = s.replace(/BR/g, '<br/>');
  s = s.replace(/T(\d+)/g, (_, i) => toks[+i]);
  // balance: drop a trailing dangling open tag set is unlikely; collapse whitespace
  return s.replace(/[ \t]+/g, ' ').trim();
}

/* ---------------------------------------------------------------- EPUB assembly */
const CSS = `
body{font-family:Georgia,'Times New Roman',serif;line-height:1.5;margin:0.6em 0.7em;color:#111;}
h1{font-size:1.4em;margin:0.2em 0 0.6em;line-height:1.25;}
h2{font-size:1.2em;margin:1em 0 0.35em;border-bottom:1px solid #999;padding-bottom:0.1em;}
h3{font-size:1.05em;margin:0.9em 0 0.3em;}
p{margin:0.35em 0;}
ul{margin:0.3em 0 0.3em 1.1em;padding:0;}
li{margin:0.2em 0;}
.q{margin-top:0.4em;}
.opt{margin:0.15em 0 0.15em 0.6em;}
.tag{font-size:0.8em;color:#555;letter-spacing:0.03em;}
.ans{font-weight:bold;}
.why{margin:0.2em 0 0.2em 0.6em;font-size:0.95em;}
.pb{page-break-after:always;}
hr{border:0;border-top:1px solid #bbb;margin:0.6em 0;}
.lead{color:#333;font-style:italic;margin:0.3em 0 0.7em;}
.cram h3{background:#eee;padding:0.15em 0.3em;}
`.trim();

function xhtml(title, body) {
  return `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml"><head>
<meta charset="utf-8"/><title>${esc(title)}</title>
<link rel="stylesheet" type="text/css" href="style.css"/>
</head><body>
${body}
</body></html>`;
}

// XHTML chapter body -> clean plain text (for the .txt siblings the X4 also reads natively)
function xhtmlToText(body) {
  let s = body;
  s = s.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, (_, t) => `\n\n===== ${stripTags(t).toUpperCase()} =====\n`);
  s = s.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, (_, t) => `\n\n## ${stripTags(t)}\n`);
  s = s.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, (_, t) => `\n\n-- ${stripTags(t)} --\n`);
  s = s.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, t) => `\n  • ${stripTags(t)}`);
  s = s.replace(/<br\s*\/?>/gi, '\n');
  s = s.replace(/<p[^>]*class="tag"[^>]*>([\s\S]*?)<\/p>/gi, (_, t) => `\n[${stripTags(t)}]`);
  s = s.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (_, t) => `\n${stripTags(t)}`);
  s = decodeEntities(s.replace(/<[^>]+>/g, ''));
  // dividers between cards / questions for scannability
  s = s.replace(/\n\[Card /g, '\n\n——————————\n[Card ');
  s = s.replace(/\n\[Q \d/g, (m) => '\n\n——————————' + m);
  return s.replace(/ +([,.;:!?])/g, '$1').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
}
function writeTxt(outName, meta, chapters) {
  const txt =
    meta.title +
    '\n' +
    '='.repeat(meta.title.length) +
    '\n' +
    (meta.desc ? meta.desc + '\n' : '') +
    chapters.map((c) => xhtmlToText(c.xhtmlBody)).join('\n\n\n');
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, outName.replace(/\.epub$/, '.txt')), txt, 'utf8');
}

let UIDN = 0;
function buildEpub(outName, meta, chapters) {
  writeTxt(outName, meta, chapters);
  // chapters: [{id, title, xhtmlBody}]
  const uid = 'urn:cfp-study-lab:' + outName.replace(/\W+/g, '-') + ':' + (++UIDN);
  const manifestItems = chapters
    .map((c) => `    <item id="${c.id}" href="${c.id}.xhtml" media-type="application/xhtml+xml"/>`)
    .join('\n');
  const spineItems = chapters.map((c) => `    <itemref idref="${c.id}"/>`).join('\n');
  const navPoints = chapters
    .map(
      (c, i) => `    <navPoint id="np${i}" playOrder="${i + 1}"><navLabel><text>${esc(
        c.title
      )}</text></navLabel><content src="${c.id}.xhtml"/></navPoint>`
    )
    .join('\n');

  const opf = `<?xml version="1.0" encoding="utf-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="2.0" unique-identifier="bookid">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf">
    <dc:identifier id="bookid">${uid}</dc:identifier>
    <dc:title>${esc(meta.title)}</dc:title>
    <dc:creator opf:role="aut">CFP Study Lab</dc:creator>
    <dc:language>en</dc:language>
    <dc:subject>${esc(meta.subject || 'CFP Exam Prep')}</dc:subject>
    <dc:description>${esc(meta.desc || '')}</dc:description>
  </metadata>
  <manifest>
    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
    <item id="css" href="style.css" media-type="text/css"/>
${manifestItems}
  </manifest>
  <spine toc="ncx">
${spineItems}
  </spine>
</package>`;

  const ncx = `<?xml version="1.0" encoding="utf-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <head><meta name="dtb:uid" content="${uid}"/></head>
  <docTitle><text>${esc(meta.title)}</text></docTitle>
  <navMap>
${navPoints}
  </navMap>
</ncx>`;

  const files = [
    { name: 'mimetype', data: Buffer.from('application/epub+zip') },
    {
      name: 'META-INF/container.xml',
      data: Buffer.from(
        `<?xml version="1.0"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles>
</container>`
      ),
    },
    { name: 'OEBPS/content.opf', data: Buffer.from(opf) },
    { name: 'OEBPS/toc.ncx', data: Buffer.from(ncx) },
    { name: 'OEBPS/style.css', data: Buffer.from(CSS) },
    ...chapters.map((c) => ({
      name: `OEBPS/${c.id}.xhtml`,
      data: Buffer.from(xhtml(c.title, c.xhtmlBody)),
    })),
  ];
  fs.mkdirSync(OUT, { recursive: true });
  const buf = zip(files);
  fs.writeFileSync(path.join(OUT, outName), buf);
  return buf.length;
}

/* --------------------------------------------------------------- load app data */
function loadWindowGlobals(file) {
  const window = {};
  // eslint-disable-next-line no-new-func
  new Function('window', 'self', 'document', rd(file))(window, window, {});
  return window;
}
const mc = loadWindowGlobals('module-content.js');
const why = loadWindowGlobals('mcq-why.js');
const MCQWHY = why.MCQWHY || {};
const { MODCHEAT = {}, MODOBJ = {}, MODSYN = {} } = mc;

// MODMETA + TOPIC_MOD out of the app source
const src = rd('src/study-home.src.html');
function grabObjLiteral(name) {
  const i = src.indexOf('const ' + name + '=');
  if (i < 0) throw new Error('missing ' + name);
  let j = src.indexOf('{', i);
  let depth = 0,
    k = j;
  for (; k < src.length; k++) {
    if (src[k] === '{') depth++;
    else if (src[k] === '}') {
      depth--;
      if (depth === 0) break;
    }
  }
  // eslint-disable-next-line no-eval
  return eval('(' + src.slice(j, k + 1) + ')');
}
const MODMETA = grabObjLiteral('MODMETA');
const TOPIC_MOD = grabObjLiteral('TOPIC_MOD');
const moduleOf = (x) => (TOPIC_MOD[x && x.m] && TOPIC_MOD[x.m][x.t]) || 0;

const COURSES = {
  FP511: 'FP511 — General Financial Planning, Conduct & Psychology',
  FP512: 'FP512 — Risk Management, Insurance & Employee Benefits',
};
function moduleTitle(course, mod) {
  if (mod === 0) return `${course} · Unsorted`;
  const name = (MODMETA[course] && MODMETA[course][mod]) || '';
  return `${course} · M${mod}${name ? ' ' + name : ''}`;
}
// group a list of {m,t,...} by module number, in module order
function groupByModule(course, items) {
  const by = new Map();
  for (const it of items) {
    const m = moduleOf(it);
    if (!by.has(m)) by.set(m, []);
    by.get(m).push(it);
  }
  return [...by.keys()].sort((a, b) => a - b).map((m) => ({ mod: m, items: by.get(m) }));
}

/* ----------------------------------------------------------------- FLASHCARDS */
function buildFlashcards(course) {
  const cards = JSON.parse(rd(`content/${course.toLowerCase()}-textbook.cards.json`));
  const groups = groupByModule(course, cards);
  const chapters = [
    {
      id: 'ch0',
      title: 'How to use',
      xhtmlBody:
        `<h1>${esc(course)} Flashcards</h1>` +
        `<p class="lead">Self-quiz deck for e-ink page-turn. Read the question, predict the answer, ` +
        `then turn the page to check. One card per screen.</p>` +
        `<p>${cards.length} cards · ${groups.length} sections. Grouped by module to match the app.</p>`,
    },
  ];
  groups.forEach((g, gi) => {
    let body = `<h1>${esc(moduleTitle(course, g.mod))}</h1><p class="tag">${g.items.length} cards</p>`;
    g.items.forEach((c, i) => {
      body +=
        `<div class="pb"><p class="tag">Card ${i + 1} / ${g.items.length}</p>` +
        `<p class="q"><b>Q.</b> ${inlineXhtml(c.f)}</p></div>` +
        `<div class="pb"><p class="tag">Answer</p>` +
        `<p class="ans">${inlineXhtml(c.b)}</p></div>`;
    });
    chapters.push({ id: 'ch' + (gi + 1), title: moduleTitle(course, g.mod), xhtmlBody: body });
  });
  return buildEpub(
    `${course}-Flashcards.epub`,
    { title: `${course} Flashcards — CFP Study Lab`, subject: 'CFP Flashcards', desc: COURSES[course] },
    chapters
  );
}

/* ------------------------------------------------------------------ MCQ PRACTICE */
function whyFor(q) {
  const rec = MCQWHY[q.q];
  if (!rec) return '';
  let out = '';
  q.o.forEach((opt, i) => {
    if (i === q.a) return;
    const key = Object.keys(rec).find((k) => stripTags(k) === stripTags(opt));
    if (key) out += `<p class="why">✗ <b>${inlineXhtml(opt)}</b> — ${inlineXhtml(rec[key])}</p>`;
  });
  return out ? `<p class="tag">Why the others are wrong:</p>${out}` : '';
}
function buildMcq(course) {
  const mcqs = JSON.parse(rd(`content/${course.toLowerCase()}-textbook.mcqs.json`));
  const groups = groupByModule(course, mcqs);
  const LET = ['A', 'B', 'C', 'D', 'E', 'F'];
  const chapters = [
    {
      id: 'ch0',
      title: 'How to use',
      xhtmlBody:
        `<h1>${esc(course)} MCQ Practice</h1>` +
        `<p class="lead">Read the question and options, commit to an answer, then turn the page ` +
        `for the correct choice, the explanation, and why each wrong option is wrong.</p>` +
        `<p>${mcqs.length} questions · ${groups.length} sections.</p>`,
    },
  ];
  groups.forEach((g, gi) => {
    let body = `<h1>${esc(moduleTitle(course, g.mod))}</h1><p class="tag">${g.items.length} questions</p>`;
    g.items.forEach((q, i) => {
      const opts = q.o
        .map((o, k) => `<p class="opt">${LET[k]}. ${inlineXhtml(o)}</p>`)
        .join('');
      body +=
        `<div class="pb"><p class="tag">Q ${i + 1} / ${g.items.length}${q.t ? ' · ' + esc(q.t) : ''}</p>` +
        `<p class="q">${inlineXhtml(q.q)}</p>${opts}</div>` +
        `<div class="pb"><p class="ans">Answer: ${LET[q.a]}. ${inlineXhtml(q.o[q.a])}</p>` +
        (q.e ? `<p>${inlineXhtml(q.e)}</p>` : '') +
        whyFor(q) +
        `</div>`;
    });
    chapters.push({ id: 'ch' + (gi + 1), title: moduleTitle(course, g.mod), xhtmlBody: body });
  });
  return buildEpub(
    `${course}-MCQ-Practice.epub`,
    { title: `${course} MCQ Practice — CFP Study Lab`, subject: 'CFP Practice Questions', desc: COURSES[course] },
    chapters
  );
}

/* -------------------------------------------------------------------- EXAM CRAM */
function buildCram(course) {
  const cheat = MODCHEAT[course] || {};
  const obj = MODOBJ[course] || {};
  const syn = MODSYN[course] || {};
  const mods = Object.keys(MODMETA[course] || {}).map(Number).sort((a, b) => a - b);
  const chapters = [
    {
      id: 'ch0',
      title: 'About',
      xhtmlBody:
        `<h1>${esc(course)} Exam Cram</h1>` +
        `<p class="lead">Pocket cram sheet — key numbers, must-know rules, traps and tips per module. ` +
        `Skim before the exam or between sittings.</p>`,
    },
  ];
  mods.forEach((mod, mi) => {
    const c = cheat[mod];
    const objs = obj[mod];
    const synp = syn[mod];
    if (!c && !objs && !synp) return;
    let body = `<div class="cram"><h1>${esc(moduleTitle(course, mod))}</h1>`;
    if (synp) body += `<p class="lead">${inlineXhtml(synp)}</p>`;
    if (objs && objs.length) {
      body += `<h3>Learning objectives</h3><ul>`;
      objs.forEach((o) => (body += `<li>${inlineXhtml(o)}</li>`));
      body += `</ul>`;
    }
    if (c && c.keyNumbers && c.keyNumbers.length) {
      body += `<h3>★ Key numbers</h3><ul>`;
      c.keyNumbers.forEach(([k, v]) => (body += `<li><b>${inlineXhtml(k)}:</b> ${inlineXhtml(v)}</li>`));
      body += `</ul>`;
    }
    if (c && c.mustKnow && c.mustKnow.length) {
      body += `<h3>Must know</h3><ul>`;
      c.mustKnow.forEach((m) => (body += `<li>${inlineXhtml(m)}</li>`));
      body += `</ul>`;
    }
    if (c && c.traps && c.traps.length) {
      body += `<h3>⚠ Traps</h3><ul>`;
      c.traps.forEach((t) => (body += `<li>${inlineXhtml(t)}</li>`));
      body += `</ul>`;
    }
    if (c && c.tips && c.tips.length) {
      body += `<h3>✓ Tips</h3><ul>`;
      c.tips.forEach((t) => (body += `<li>${inlineXhtml(t)}</li>`));
      body += `</ul>`;
    }
    body += `</div>`;
    chapters.push({ id: 'ch' + (mi + 1), title: moduleTitle(course, mod), xhtmlBody: body });
  });
  return buildEpub(
    `${course}-Exam-Cram.epub`,
    { title: `${course} Exam Cram — CFP Study Lab`, subject: 'CFP Exam Cram', desc: COURSES[course] },
    chapters
  );
}

/* ---------------------------------------------------------------------- READER */
function extractDivBlock(html, openTagIdx) {
  const start = html.indexOf('>', openTagIdx) + 1;
  const re = /<\/?div\b[^>]*>/gi;
  re.lastIndex = start;
  let depth = 1,
    m;
  while ((m = re.exec(html))) {
    if (m[0][1] === '/') {
      if (--depth === 0) return html.slice(start, m.index);
    } else if (!/\/>\s*$/.test(m[0])) depth++;
  }
  return html.slice(start);
}
function tableToBlocks(tbl) {
  const rows = [...tbl.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];
  let hdr = null;
  const out = [];
  for (const r of rows) {
    const cells = [...r[1].matchAll(/<(th|td)[^>]*>([\s\S]*?)<\/\1>/gi)].map((c) => stripTags(c[2]));
    if (!cells.length) continue;
    const isHead = /<th\b/i.test(r[1]);
    if (isHead && !hdr) {
      hdr = cells;
      continue;
    }
    if (hdr && hdr.length === cells.length) {
      out.push('<p>' + cells.map((c, i) => `<b>${esc(hdr[i])}:</b> ${esc(c)}`).join(' · ') + '</p>');
    } else {
      out.push('<p>' + cells.map((c) => esc(c)).join(' · ') + '</p>');
    }
  }
  return '\n' + out.join('\n') + '\n';
}
const GLYPHS = /^[\s−\-–—+▸▾▴▼▶▽△›‹»«]+|[\s−\-+▸▾›‹]+$/g;
const cleanHead = (t) => stripTags(t).replace(GLYPHS, '').replace(/\s*EXAM\s*$/i, '').trim();
function readerChapterBody(panelHtml, chapterTitle) {
  let h = panelHtml
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<svg[\s\S]*?<\/svg>/gi, '')
    .replace(/<canvas[\s\S]*?<\/canvas>/gi, '')
    .replace(/<button[\s\S]*?<\/button>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<table[\s\S]*?<\/table>/gi, (m) => tableToBlocks(m));
  // section headers -> H3 marker
  h = h.replace(
    /<([a-z0-9]+)\b[^>]*class="[^"]*\b(collapsible-header|ch)\b[^"]*"[^>]*>([\s\S]*?)<\/\1>/gi,
    (m, tag, cls, inner) => `H${cleanHead(inner)}/H`
  );
  const blocks = [];
  const re =
    /H([\s\S]*?)\/H|<(h[1-4])\b[^>]*>([\s\S]*?)<\/\2>|<p\b[^>]*>([\s\S]*?)<\/p>|<li\b[^>]*>([\s\S]*?)<\/li>/gi;
  let m;
  let liOpen = false;
  const push = (s) => blocks.push(s);
  while ((m = re.exec(h))) {
    if (m[1] !== undefined) {
      if (liOpen) {
        push('</ul>');
        liOpen = false;
      }
      const t = stripTags(m[1]);
      if (t) push(`<h3>${esc(t)}</h3>`);
    } else if (m[2]) {
      if (liOpen) {
        push('</ul>');
        liOpen = false;
      }
      const t = inlineXhtml(m[3]);
      if (t) push(`<h3>${t}</h3>`);
    } else if (m[4] !== undefined) {
      if (liOpen) {
        push('</ul>');
        liOpen = false;
      }
      const t = inlineXhtml(m[4]);
      if (t) push(`<p>${t}</p>`);
    } else if (m[5] !== undefined) {
      const t = inlineXhtml(m[5]);
      if (t) {
        if (!liOpen) {
          push('<ul>');
          liOpen = true;
        }
        push(`<li>${t}</li>`);
      }
    }
  }
  if (liOpen) push('</ul>');
  return `<h1>${esc(chapterTitle)}</h1>\n` + blocks.join('\n');
}
function buildReader(course) {
  const file = `apps/${course.toLowerCase()}-reading.html`;
  const html = rd(file);
  // tab id -> label
  const tabs = [...html.matchAll(/<button[^>]*class="tab-btn"[^>]*data-tab="([a-z-]+)"[^>]*>([\s\S]*?)<\/button>/gi)].map(
    (m) => ({ id: m[1], label: stripTags(m[2]) })
  );
  const prefix = course === 'FP511' ? 'panel-' : 'tab-';
  const chapters = [
    {
      id: 'ch0',
      title: 'Contents',
      xhtmlBody:
        `<h1>${esc(course)} Interactive Reader</h1>` +
        `<p class="lead">The full course reference, reflowed for e-ink. Charts and interactive ` +
        `bits are omitted; every concept the reader teaches is here as plain prose.</p>` +
        `<ul>${tabs.map((t) => `<li>${esc(t.label)}</li>`).join('')}</ul>`,
    },
  ];
  tabs.forEach((t, ti) => {
    const idAttr = prefix + t.id;
    const idx = html.indexOf(`id="${idAttr}"`);
    if (idx < 0) return;
    const open = html.lastIndexOf('<div', idx);
    const panel = extractDivBlock(html, open);
    const body = readerChapterBody(panel, t.label);
    chapters.push({ id: 'ch' + (ti + 1), title: t.label, xhtmlBody: body });
  });
  return buildEpub(
    `${course}-Reader.epub`,
    { title: `${course} Interactive Reader — CFP Study Lab`, subject: 'CFP Course Reference', desc: COURSES[course] },
    chapters
  );
}

/* -------------------------------------------------------------------------- run */
const fmt = (n) => (n / 1024).toFixed(0) + ' KB';
console.log('Building e-reader EPUBs -> dist/ereader/\n');
for (const course of ['FP511', 'FP512']) {
  const results = [
    ['Flashcards', buildFlashcards(course)],
    ['MCQ Practice', buildMcq(course)],
    ['Exam Cram', buildCram(course)],
    ['Reader', buildReader(course)],
  ];
  for (const [name, size] of results) console.log(`  ${course} ${name.padEnd(14)} ${fmt(size)}`);
}
console.log('\nDone. Import these into the XTEINK app (or copy to the microSD card).');

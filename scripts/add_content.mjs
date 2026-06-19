/* Content pipeline for CFP Study Home.
 *
 * The app stores its study content in three top-level JSON arrays inside
 * index.html:  const CARDS=[...]  and  const MCQ=[...]  (and MODULES/DOMAINS).
 * Because those arrays are valid JSON, we can locate them, JSON.parse them,
 * append new items, and JSON.stringify them back — safe and lossless.
 *
 * Usage:
 *   node scripts/add_content.mjs inspect CARDS        # print an array (parsed)
 *   node scripts/add_content.mjs inspect MODULES
 *   node scripts/add_content.mjs add                  # merge everything in content/
 *
 * Content files (in ./content), any number, merged by type:
 *   *.cards.json  -> array of {m,d,t,f,b}
 *   *.mcqs.json   -> array of {m,d,t,q,o:[...],a,e}
 *
 * De-dupes by normalized front (cards) / question (mcqs), so it is safe to
 * re-run. Refuses to write unless the rebuilt arrays still JSON.parse.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const FILE = 'index.html';
const CONTENT_DIR = 'content';

// Locate `const NAME=[ ... ]` and return {open, close} indices of the brackets.
function locateArray(html, name) {
  const marker = `const ${name}=[`;
  const i = html.indexOf(marker);
  if (i === -1) throw new Error(`array "${name}" not found`);
  const open = i + marker.length - 1; // index of '['
  let depth = 0, inStr = false, esc = false;
  for (let p = open; p < html.length; p++) {
    const c = html[p];
    if (inStr) {
      if (esc) esc = false;
      else if (c === '\\') esc = true;
      else if (c === '"') inStr = false;
    } else if (c === '"') inStr = true;
    else if (c === '[') depth++;
    else if (c === ']') { depth--; if (depth === 0) return { open, close: p }; }
  }
  throw new Error(`unterminated array "${name}"`);
}

function getArray(html, name) {
  const { open, close } = locateArray(html, name);
  return JSON.parse(html.slice(open, close + 1));
}

function setArray(html, name, arr) {
  const { open, close } = locateArray(html, name);
  return html.slice(0, open) + JSON.stringify(arr) + html.slice(close + 1);
}

const norm = (s) => String(s || '').replace(/<[^>]*>/g, '').replace(/&[a-z]+;/gi, '').replace(/\s+/g, ' ').trim().toLowerCase();

const cmd = process.argv[2];
let html = readFileSync(FILE, 'utf8');

if (cmd === 'inspect') {
  const arr = getArray(html, process.argv[3]);
  console.log(`${process.argv[3]}: ${arr.length} items`);
  console.log(JSON.stringify(arr.slice(0, Number(process.argv[4] || 8)), null, 2));
  process.exit(0);
}

if (cmd !== 'add') {
  console.error('usage: add_content.mjs <inspect NAME [n] | add>');
  process.exit(1);
}

if (!existsSync(CONTENT_DIR)) { console.log('no content/ dir — nothing to add'); process.exit(0); }

const files = readdirSync(CONTENT_DIR);
const cardFiles = files.filter((f) => f.endsWith('.cards.json'));
const mcqFiles = files.filter((f) => f.endsWith('.mcqs.json'));

function loadAll(list) {
  let out = [];
  for (const f of list) {
    const data = JSON.parse(readFileSync(join(CONTENT_DIR, f), 'utf8'));
    if (!Array.isArray(data)) throw new Error(`${f} is not a JSON array`);
    out = out.concat(data);
  }
  return out;
}

function validateCard(c, i) {
  for (const k of ['m', 'd', 't', 'f', 'b']) if (!(k in c)) throw new Error(`card #${i} missing "${k}"`);
}
function validateMcq(q, i) {
  for (const k of ['m', 'd', 't', 'q', 'o', 'a', 'e']) if (!(k in q)) throw new Error(`mcq #${i} missing "${k}"`);
  if (!Array.isArray(q.o) || q.o.length < 2) throw new Error(`mcq #${i} needs >=2 options`);
  if (typeof q.a !== 'number' || q.a < 0 || q.a >= q.o.length) throw new Error(`mcq #${i} "a" out of range`);
}

const newCards = loadAll(cardFiles);
const newMcqs = loadAll(mcqFiles);
newCards.forEach(validateCard);
newMcqs.forEach(validateMcq);

const cards = getArray(html, 'CARDS');
const mcqs = getArray(html, 'MCQ');

const haveCard = new Set(cards.map((c) => norm(c.f)));
const haveMcq = new Set(mcqs.map((q) => norm(q.q)));

let addedC = 0, addedM = 0, skipC = 0, skipM = 0;
for (const c of newCards) { const k = norm(c.f); if (haveCard.has(k)) { skipC++; continue; } haveCard.add(k); cards.push(c); addedC++; }
for (const q of newMcqs) { const k = norm(q.q); if (haveMcq.has(k)) { skipM++; continue; } haveMcq.add(k); mcqs.push(q); addedM++; }

html = setArray(html, 'CARDS', cards);
html = setArray(html, 'MCQ', mcqs);

// Safety: confirm both arrays still parse after the edit.
getArray(html, 'CARDS');
getArray(html, 'MCQ');

writeFileSync(FILE, html);
console.log(`cards: +${addedC} (skipped ${skipC} dupes) -> ${cards.length} total`);
console.log(`mcqs:  +${addedM} (skipped ${skipM} dupes) -> ${mcqs.length} total`);

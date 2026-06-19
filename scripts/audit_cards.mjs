/* Audit flashcards in index.html for "answer leakage":
 *  - the term (front / topic) appears verbatim inside the definition (back)
 *  - the definition text appears inside the front
 *  - identical or empty sides
 * Prints a report grouped by severity. Read-only; changes nothing. */
import { readFileSync } from 'node:fs';

const h = readFileSync('index.html', 'utf8');

function getArray(name) {
  const m = 'const ' + name + '=[';
  const i = h.indexOf(m);
  let o = i + m.length - 1, d = 0, s = false, e = false;
  for (let p = o; p < h.length; p++) {
    const c = h[p];
    if (s) { if (e) e = false; else if (c === '\\') e = true; else if (c === '"') s = false; }
    else if (c === '"') s = true;
    else if (c === '[') d++;
    else if (c === ']') { d--; if (!d) return JSON.parse(h.slice(o, p + 1)); }
  }
}

const norm = (s) =>
  String(s || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&[a-z]+;|&#\d+;/gi, ' ')
    .replace(/[^a-z0-9 ]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

const STOP = new Set('the a an of to in is are and or for with on at by from as vs what which how when who key characteristics definition formula examples example overview process step steps client clients planner'.split(' '));

function deriveTerm(c) {
  let f = norm(c.f);
  f = f.replace(/^(what (is|are|does|do|was)|define|name|describe|explain|list|the)\b/g, '').trim();
  f = f.replace(/\b(key characteristics|definition|formula|examples|overview)\b.*$/, '').trim();
  f = f.split(/ [—-] /)[0].trim();
  return f;
}

const cards = getArray('CARDS');
const leaks = [], strong = [], identical = [], empty = [];

for (const c of cards) {
  const b = norm(c.b), f = norm(c.f);
  if (!c.f || !c.b) { empty.push(c); continue; }
  if (b && b === f) { identical.push(c); continue; }
  if (f.length >= 10 && b.includes(f)) { strong.push(c); continue; } // whole prompt inside answer
  const terms = [norm(c.t), deriveTerm(c)].filter((t) => t && t.length >= 4 && !STOP.has(t));
  let hit = null;
  for (const t of [...new Set(terms)]) {
    const re = new RegExp('\\b' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b');
    if (re.test(b)) { hit = t; break; }
  }
  if (hit) leaks.push({ c, term: hit });
}

const snip = (s, n = 90) => norm(s).slice(0, n);
console.log(`Total cards: ${cards.length}`);
console.log(`\n== EMPTY side: ${empty.length}`);
empty.slice(0, 20).forEach((c) => console.log(`  [${c.m}/${c.d}] ${snip(c.f)} || ${snip(c.b)}`));
console.log(`\n== IDENTICAL f/b: ${identical.length}`);
identical.slice(0, 20).forEach((c) => console.log(`  [${c.m}] ${snip(c.f)}`));
console.log(`\n== STRONG (full prompt inside answer): ${strong.length}`);
strong.slice(0, 30).forEach((c) => console.log(`  [${c.m}] F: ${snip(c.f)}\n        B: ${snip(c.b,120)}`));
console.log(`\n== TERM appears in definition: ${leaks.length}`);
leaks.slice(0, 60).forEach((x) => console.log(`  [${x.c.m}] term="${x.term}"  F: ${snip(x.c.f,60)}  B: ${snip(x.c.b,100)}`));

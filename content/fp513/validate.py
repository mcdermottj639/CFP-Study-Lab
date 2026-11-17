#!/usr/bin/env python3
"""Validate one FP513 module folder:  python3 content/fp513/validate.py m3
Checks schema, LO coverage, answer balance, rationale keys, allowed HTML, and verbatim
overlap with the textbook (any 12-word run copied from the source = error).
The licensed textbook text is NEVER committed: point FP513_SRC at a private folder holding
M1.txt..M9.txt to run the copyright-overlap check; without it that check is skipped (warned)."""
import json, re, sys, os, html as H

ROOT = os.path.dirname(os.path.abspath(__file__))
mod = sys.argv[1]                      # m1..m9
n = int(mod[1:])
D = os.path.join(ROOT, mod)
LOS = json.load(open(os.path.join(ROOT, 'los.json')))
ALL_LO = {l['id'] for l in LOS}
MOD_LO = [l['id'] for l in LOS if l['mod'] == n]
KS = {'D.27','D.28','D.29','D.30','D.31','D.32','D.33','D.34','D.35','H.70','H.66','B.6','E.41','F.52','G.55'}
errs, warns = [], []
def E(m): errs.append(m)
def W(m): warns.append(m)

SRCDIR = os.environ.get('FP513_SRC', os.path.join(ROOT, 'src'))
SRCF = os.path.join(SRCDIR, f'M{n}.txt')
src = open(SRCF).read() if os.path.exists(SRCF) else ''
if not src: warns.append('textbook text not available (set FP513_SRC) — copyright-overlap check skipped')
def words(s):
    s = H.unescape(re.sub(r'<[^>]+>', ' ', s))
    return re.findall(r"[a-z0-9$%.]+", s.lower())
SW = words(src)
SH = set(' '.join(SW[i:i+12]) for i in range(len(SW) - 11))
def verbatim(s, where):
    w = words(s)
    for i in range(len(w) - 11):
        if ' '.join(w[i:i+12]) in SH:
            E(f'{where}: 12+ words copied verbatim from textbook: "{" ".join(w[i:i+12])}"'); return

ALLOWED = {'b','i','em','strong','br','sub','sup','u','span','small','ul','ol','li','code','table','thead','tbody','tr','th','td','div','p'}
def tags_ok(s, where):
    for t in re.findall(r'</?([a-zA-Z0-9]+)', s):
        if t.lower() not in ALLOWED: E(f'{where}: tag <{t}> not allowed')

def load(name, required=True):
    p = os.path.join(D, name)
    if not os.path.exists(p):
        if required: E(f'missing {name}')
        return None
    try: return json.load(open(p))
    except Exception as ex: E(f'{name} is not valid JSON: {ex}'); return None

cards = load('cards.json') or []
mcqs = load('mcqs.json') or []
why = load('why.json') or {}
hub = load('hub.json') or {}
cases = load('teachback.json', required=False) or []

# ---- cards
seen = set(); lo_cards = {}
for i, c in enumerate(cards):
    w = f'card#{i}'
    for k in ['m','d','t','f','b','lo','pg','tier','k']:
        if k not in c: E(f'{w} missing {k}')
    if c.get('m') != 'FP513' or c.get('d') != 'D': E(f'{w} m/d must be FP513/D')
    if c.get('lo') not in ALL_LO: E(f'{w} bad lo {c.get("lo")}')
    if n <= 8 and c.get('lo') not in MOD_LO: E(f'{w} lo {c.get("lo")} not in module {n}')
    if c.get('tier') not in (1,2,3): E(f'{w} tier must be 1/2/3')
    if c.get('k') not in KS: E(f'{w} k {c.get("k")} not a recognised blueprint topic')
    f = c.get('f',''); b = c.get('b','')
    if len(re.sub(r'<[^>]+>','',f)) < 12: E(f'{w} front too short / bare label: {f!r}')
    if len(b) > 520: W(f'{w} back long ({len(b)} chars)')
    key = re.sub(r'\W+',' ',re.sub(r'<[^>]+>','',f).lower()).strip()
    if key in seen: E(f'{w} duplicate front');
    seen.add(key)
    tags_ok(f, w); tags_ok(b, w); verbatim(f+' '+b, w)
    lo_cards[c.get('lo')] = lo_cards.get(c.get('lo'),0)+1

# ---- mcqs
seenq = set(); lo_q = {}; pos = [0,0,0,0]; kinds = {}
for i, q in enumerate(mcqs):
    w = f'mcq#{i}'
    for k in ['m','d','t','q','o','a','e','lo','pg','k','kind']:
        if k not in q: E(f'{w} missing {k}')
    if q.get('m') != 'FP513' or q.get('d') != 'D': E(f'{w} m/d must be FP513/D')
    if q.get('lo') not in ALL_LO: E(f'{w} bad lo {q.get("lo")}')
    if n <= 8 and q.get('lo') not in MOD_LO: E(f'{w} lo {q.get("lo")} not in module {n}')
    if q.get('k') not in KS: E(f'{w} k {q.get("k")} not recognised')
    if q.get('kind') not in ('concept','applied','calc','case'): E(f'{w} kind must be concept/applied/calc/case')
    kinds[q.get('kind')] = kinds.get(q.get('kind'),0)+1
    o = q.get('o', [])
    if len(o) != 4 or len(set(o)) != 4: E(f'{w} needs 4 distinct options')
    a = q.get('a')
    if not isinstance(a,int) or not 0 <= a < 4: E(f'{w} a out of range'); continue
    pos[a] += 1
    if len(q.get('e','')) > 650: E(f'{w} explanation too long ({len(q["e"])})')
    for opt in o:
        if re.search(r"[A-Za-z).’\"]\s+\d{1,3}$", re.sub(r'<[^>]+>','',opt)) and not re.search(r'(age|of|than|years?|months?|days?)\s+\d{1,3}$', opt): W(f'{w} option ends with bare number (check bleed): {opt!r}')
    lens = [len(re.sub(r'<[^>]+>','',x)) for x in o]
    if lens and lens[a] == max(lens) and sorted(lens)[-2] and lens[a] > 1.6*sorted(lens)[-2]: W(f'{w} correct option is conspicuously longest')
    key = re.sub(r'\W+',' ',re.sub(r'<[^>]+>','',q.get('q','')).lower()).strip()
    if key in seenq: E(f'{w} duplicate question')
    seenq.add(key)
    tags_ok(q.get('q','')+q.get('e','')+''.join(o)+q.get('stem',''), w)
    verbatim(q.get('q','')+' '+q.get('e','')+' '+' '.join(o), w)
    rat = why.get(q.get('q'))
    if not rat: E(f'{w} no why.json entry (key must be the exact question text)')
    else:
        wrong = {x for j,x in enumerate(o) if j != a}
        if set(rat) != wrong: E(f'{w} why.json keys must equal the 3 wrong options exactly')
    lo_q[q.get('lo')] = lo_q.get(q.get('lo'),0)+1
for k in why:
    if k not in {q.get('q') for q in mcqs}: E(f'why.json orphan key: {k[:60]}')

# ---- LO coverage
if n <= 8:
    for lo in MOD_LO:
        if lo_cards.get(lo,0) < 2: E(f'{lo}: only {lo_cards.get(lo,0)} cards (need >=2)')
        if lo_q.get(lo,0) < 4: E(f'{lo}: only {lo_q.get(lo,0)} questions (need >=4)')
if mcqs and max(pos) > 0.4*len(mcqs): W(f'answer positions unbalanced {pos}')

# ---- reader fragment
rp = os.path.join(D, 'reader.html')
if not os.path.exists(rp): E('missing reader.html')
else:
    r = open(rp).read()
    if not re.search(r'<div id="tab-[a-z-]+" class="section-panel">', r): E('reader.html must start with <div id="tab-..." class="section-panel">')
    if '<script' in r.lower(): E('reader.html must not contain scripts')
    for lo in MOD_LO:
        if lo not in r: E(f'reader.html never mentions {lo}')
    if 'srcref' not in r: E('reader.html has no srcref page anchors')
    verbatim(r, 'reader.html')
    if r.count('<div') != r.count('</div>'): E(f'reader.html unbalanced divs ({r.count("<div")} open vs {r.count("</div>")} close)')

# ---- hub
for k in ['objectives','synthesis','example','cheat','topics']:
    if k not in hub: E(f'hub.json missing {k}')
if hub:
    ch = hub.get('cheat',{})
    for k in ['keyNumbers','mustKnow','traps','tips']:
        if k not in ch: E(f'hub.cheat missing {k}')
    used = {c.get('t') for c in cards} | {q.get('t') for q in mcqs}
    if set(hub.get('topics',[])) != used: E(f'hub.topics must list exactly the topics used: missing {sorted(used-set(hub.get("topics",[])))} extra {sorted(set(hub.get("topics",[]))-used)}')
    verbatim(json.dumps(hub), 'hub.json')

for i, cs in enumerate(cases):
    for k in ['id','title','scenario','prompt','points','anchor']:
        if k not in cs: E(f'teachback#{i} missing {k}')

print(f'{mod}: {len(cards)} cards, {len(mcqs)} mcqs {kinds}, answer positions {pos}, {len(cases)} teach-backs')
for w in warns[:40]: print('WARN', w)
for e in errs[:80]: print('ERROR', e)
print('RESULT', 'FAIL' if errs else 'PASS', f'({len(errs)} errors, {len(warns)} warnings)')
sys.exit(1 if errs else 0)

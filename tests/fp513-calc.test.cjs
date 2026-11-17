/* Independent validation of the FP513 calculation lab (fp513-calc.js).
 * Every formula is checked against a second method (brute-force cash-flow discounting,
 * direct summation, known textbook-standard results) — not against itself. */
const test = require('node:test');
const assert = require('node:assert/strict');
const C = require('../fp513-calc.js');
const { fn, drills, mcqFromDrill, rng } = C;

const close = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg || ''} expected ${b}, got ${a}`);

// brute-force PV of explicit cash flows
function pvFlows(flows, i) { return flows.reduce((s, cf, t) => s + cf / Math.pow(1 + i, t + 1), 0); }
function bondFlows(par, c, n, m) { const N = Math.round(n * m); return Array.from({ length: N }, (_, t) => par * c / m + (t === N - 1 ? par : 0)); }

test('bond price equals discounted cash flows and known values', () => {
  close(fn.bondPrice(1000, 0.06, 0.08, 10, 2), 864.10, 0.01, '6%/8%/10y semiannual');
  close(fn.bondPrice(1000, 0.05, 0.05, 7, 2), 1000, 1e-9, 'par when coupon = yield');
  for (let k = 0; k < 200; k++) {
    const r = rng(k + 1), c = 0.01 + r() * 0.09, y = 0.005 + r() * 0.12, n = 1 + Math.floor(r() * 30);
    close(fn.bondPrice(1000, c, y, n, 2), pvFlows(bondFlows(1000, c, n, 2), y / 2), 1e-6, 'closed form vs sum');
  }
});

test('YTM and YTC reproduce the price', () => {
  for (let k = 0; k < 200; k++) {
    const r = rng(k + 7), c = 0.02 + r() * 0.07, n = 2 + Math.floor(r() * 25), price = 800 + r() * 400;
    const y = fn.ytm(price, 1000, c, n, 2);
    close(fn.bondPrice(1000, c, y, n, 2), price, 1e-6, 'price at solved YTM');
  }
  // YTC drill: re-price with the call price as the terminal value
  const d = drills.find((x) => x.id === 'ytc');
  for (let k = 0; k < 100; k++) {
    const f = { c: 0.07, callYrs: 3, callPx: 1050, price: 1100 + k };
    const g = d.gen(rng(k), f), i = g.answer / 100 / 2;
    close(pvFlows(Array.from({ length: 6 }, (_, t) => 35 + (t === 5 ? 1050 : 0)), i), f.price, 1e-4, 'YTC reprices');
  }
});

test('Macaulay duration: zero = maturity, textbook 3-yr 10% bond = 2.7355', () => {
  close(fn.macaulay(1000, 0, 0.07, 8, 1), 8, 1e-9);
  close(fn.macaulay(1000, 0.10, 0.10, 3, 1), 2.7355, 0.0001);
  // numerical check: −dP/dy × (1+y)/P ≈ Macaulay
  const P = (y) => fn.bondPrice(1000, 0.06, y, 9, 1), y = 0.07, h = 1e-6;
  const num = -(P(y + h) - P(y - h)) / (2 * h) * (1 + y) / P(y);
  close(fn.macaulay(1000, 0.06, 0.07, 9, 1), num, 1e-4, 'derivative definition');
});

test('duration price-change estimate is close to the true change for small moves', () => {
  const D = fn.macaulay(1000, 0.05, 0.06, 10, 1), p0 = fn.bondPrice(1000, 0.05, 0.06, 10, 1), p1 = fn.bondPrice(1000, 0.05, 0.061, 10, 1);
  close(fn.durPriceChange(D, 0.06, 0.001, 1), (p1 - p0) / p0, 0.0002);
});

test('core formulas — known results', () => {
  close(fn.tey(0.03, 0.25), 0.04, 1e-12);
  close(fn.teyState(0.03, 0.24, 0.05), 0.03 / (1 - (0.24 + 0.05 * 0.76)), 1e-12);
  close(fn.ddmConstant(2, 0.05, 0.10), 42, 1e-9);
  close(fn.ddmZero(3, 0.12), 25, 1e-9);
  close(fn.capm(0.03, 1.2, 0.10), 0.114, 1e-12);
  close(fn.currencyAdj(0.10, -0.05), 0.045, 1e-12);
  close(fn.realReturn(0.08, 0.03), 0.048543689, 1e-8);
  close(fn.irr([-100, 110]), 0.10, 1e-9);
  close(fn.irr([-1000, 100, 100, 1100]), 0.10, 1e-9);
  close(fn.twr([0.10, -0.05]), 0.045, 1e-12);
  close(fn.conversionValue(fn.conversionRatio(1000, 40), 35), 875, 1e-9);
  close(fn.conversionPremium(950, 875), 75 / 875, 1e-12);
  close(fn.downsideRisk(950, 800), 150 / 950, 1e-12);
  close(fn.capRateValue(52000, 0.08), 650000, 1e-6);
  close(fn.sharpe(0.12, 0.03, 0.15), 0.6, 1e-12);
  close(fn.treynor(0.12, 0.03, 1.2), 0.075, 1e-12);
  close(fn.jensen(0.12, 0.03, 1.2, 0.10), 0.12 - 0.114, 1e-12);
  close(fn.weightedBeta([0.5, 0.3, 0.2], [1.2, 0.8, 1.5]), 1.14, 1e-12);
});

test('statistics — sample vs population SD, portfolio SD bounds', () => {
  const xs = [10, -5, 15, 20, 5];
  close(fn.mean(xs), 9, 1e-12);
  close(fn.sdSample(xs), Math.sqrt((1 + 196 + 36 + 121 + 16) / 4), 1e-12);
  close(fn.sdPop(xs), Math.sqrt(370 / 5), 1e-12);
  close(fn.portSD2(0.6, 20, 10, 1), 16, 1e-9, 'rho=1 -> weighted average');
  close(fn.portSD2(1 / 3, 20, 10, -1), 0, 1e-6, 'perfect hedge');
  close(fn.portSD2(0.5, 20, 10, 0), Math.sqrt(100 + 25), 1e-9, 'rho=0');
});

test('option payoffs: direction, breakeven, limits', () => {
  // long call: K 50, prem 3
  close(fn.optionPayoff('call', 'long', 50, 3, 60), 7, 1e-12);
  close(fn.optionPayoff('call', 'long', 50, 3, 40), -3, 1e-12, 'max loss = premium');
  close(fn.optionPayoff('call', 'long', 50, 3, 53), 0, 1e-12, 'breakeven K + premium');
  close(fn.optionPayoff('call', 'short', 50, 3, 60), -7, 1e-12);
  close(fn.optionPayoff('call', 'short', 50, 3, 40), 3, 1e-12, 'writer keeps premium');
  // long put: K 50, prem 2
  close(fn.optionPayoff('put', 'long', 50, 2, 40), 8, 1e-12);
  close(fn.optionPayoff('put', 'long', 50, 2, 48), 0, 1e-12, 'breakeven K − premium');
  close(fn.optionPayoff('put', 'long', 50, 2, 0), 48, 1e-12, 'max gain K − premium');
  close(fn.optionPayoff('put', 'short', 50, 2, 60), 2, 1e-12);
});

test('every drill: finite answer, tolerance, distinct error diagnoses, 500 random draws', () => {
  assert.ok(drills.length >= 25, 'drill count');
  for (const d of drills) {
    assert.equal(d.m, 'FP513'); assert.ok(Array.isArray(d.mods) && d.mods.length); assert.match(d.lo, /^LO \d\.\d\.\d$/);
    for (let k = 0; k < 500; k++) {
      const g = d.gen(rng(k * 31 + d.id.length));
      assert.ok(Number.isFinite(g.answer), `${d.id} answer finite`);
      assert.ok(g.tol > 0 && g.formula && g.subst && g.steps.length && g.assumptions.length, `${d.id} fields`);
      assert.ok(g.errors.length >= 1, `${d.id} has error diagnoses`);
      for (const e of g.errors) assert.ok(typeof e.label === 'string' && e.label.length > 5, `${d.id} error label`);
    }
  }
});

test('drill answers agree with an independent recomputation', () => {
  const byId = Object.fromEntries(drills.map((d) => [d.id, d]));
  const bp = byId.bondprice.gen(null, { c: 0.06, y: 0.08, n: 10 });
  close(bp.answer, pvFlows(bondFlows(1000, 0.06, 10, 2), 0.04), 1e-6);
  close(byId.tey.gen(null, { muni: 0.03, t: 0.24 }).answer, 3 / 0.76, 1e-9);
  close(byId.capm.gen(null, { rf: 0.03, rm: 0.10, b: 1.2 }).answer, 11.4, 1e-9);
  close(byId.ddm.gen(null, { d0: 2, g: 0.05, k: 0.10 }).answer, 42, 1e-9);
  close(byId.currency.gen(null, { loc: 0.10, fxr: -0.05 }).answer, 4.5, 1e-9);
  close(byId.convertible.gen(null, { cp: 40, stock: 35, price: 950 }).answer, 75 / 875 * 100, 1e-9);
  close(byId.washsale.gen(null, { sh: 100, cost: 50, sell: 40, buy: 42 }).answer, 4200 + 1000, 1e-9);
  close(byId.dca.gen(null, { amt: 600, ps: [20, 30, 20, 30] }).answer, 2400 / (30 + 20 + 30 + 20), 1e-9);
  close(byId.twrmwr.gen(null, { p0: 50, p1: 60, p2: 66 }).answer, fn.irr([-50, -60, 132]) * 100, 1e-9);
  // sanity: IRR of those flows by brute force NPV ≈ 0
  const i = fn.irr([-50, -60, 132]); close(-50 - 60 / (1 + i) + 132 / (1 + i) ** 2, 0, 1e-6);
  close(byId.option.gen(null, { type: 'put', side: 'long', K: 50, prem: 2, S: 40 }).answer, 800, 1e-9);
  close(byId.caprate.gen(null, { gross: 100000, vac: 0.05, opex: 35000, cap: 0.08 }).answer, 60000 / 0.08, 1e-6);
  close(byId.duration.gen(null, { mac: 8, y: 0.06, dy: 0.01 }).answer, -8 * 0.01 / 1.06 * 100, 1e-9);
});

test('generator-backed MCQs: 4 unique options, keyed answer correct', () => {
  for (const id of Object.keys(C.mcqgen)) {
    let made = 0;
    for (let k = 0; k < 200; k++) {
      const q = mcqFromDrill(id.replace('fp513.', ''), rng(k + 99));
      if (!q) continue; made++;
      assert.equal(q.o.length, 4); assert.equal(new Set(q.o).size, 4, id + ' unique options');
      assert.ok(q.a >= 0 && q.a < 4, id + ' key');
      assert.ok(!/\(enter/i.test(q.q), id + ' no free-entry instruction in MCQ form');
    }
    assert.ok(made > 150, `${id}: generated ${made}/200`);
    // the public MCQGEN entry works with Math.random too
    let ok = false; for (let t = 0; t < 30 && !ok; t++) ok = !!C.mcqgen[id]();
    assert.ok(ok, id + ' mcqgen');
  }
});

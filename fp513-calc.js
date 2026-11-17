/* fp513-calc.js — FP513 Investment Planning calculation lab.
 *
 * Dependency-free (browser + Node). Loaded in <head> before the app so the engine can
 * merge FP513 drills into CALCGEN and FP513 generator-backed questions into MCQGEN.
 *
 *   FP513CALC.fn        pure math (bond price, YTM, duration, CAPM, statistics, ...)
 *   FP513CALC.drills    [{id, m, d, name, mods, lo, gen(rng?, fx?)}]   -> CALCGEN entries
 *   FP513CALC.mcqgen    { 'fp513.xxx': function(fx) -> {q,o,a,e} | null } -> MCQGEN entries
 *
 * Every drill returns:
 *   { prompt, assumptions:[..], answer, tol, unit, formula, subst, steps:[..],
 *     errors:[{label, value}] }   // likely calculator/formula mistakes, numerically computed
 * `tol` is the absolute rounding tolerance used to mark an answer correct.
 * Numbers are validated independently in tests/fp513-calc.test.cjs (brute-force cash-flow
 * discounting, bisection, direct summation) — never trust a formula without a second method.
 * No calculator keystrokes are given: inputs are shown as generic TVM fields (N, I/Y, PV, PMT, FV).
 */
(function (root) {
  'use strict';

  // ---------- RNG (seedable for tests) ----------
  function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function R(rng) {
    rng = rng || Math.random;
    return {
      f: function (a, b) { return a + rng() * (b - a); },
      i: function (a, b) { return Math.floor(a + rng() * (b - a + 1)); },
      pick: function (arr) { return arr[Math.floor(rng() * arr.length)]; },
      step: function (a, b, s) { var n = Math.round((b - a) / s); return +(a + Math.floor(rng() * (n + 1)) * s).toFixed(6); }
    };
  }
  function fx(o, k, d) { return (o && o[k] != null) ? o[k] : d(); }

  // ---------- formatting ----------
  function money(n, dp) { dp = dp == null ? 2 : dp; var s = Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp }); return (n < 0 ? '−$' : '$') + s; }
  function pct(n, dp) { dp = dp == null ? 2 : dp; return (n).toFixed(dp) + '%'; }
  function num(n, dp) { dp = dp == null ? 2 : dp; return Number(n).toFixed(dp); }
  var NAMES = ['Avery', 'Bianca', 'Carlos', 'Deja', 'Elliot', 'Farah', 'Grant', 'Hana', 'Isaac', 'Jules', 'Keiko', 'Luis', 'Maya', 'Nolan', 'Omar', 'Paige', 'Quinn', 'Rhea', 'Sanjay', 'Tessa'];

  // ---------- pure math ----------
  var fn = {
    // Bond price: annual coupon rate c (decimal), par, annual yield y (decimal), years n, m payments/yr
    bondPrice: function (par, c, y, n, m) {
      m = m || 2; var N = Math.round(n * m), i = y / m, C = par * c / m;
      if (Math.abs(i) < 1e-12) return C * N + par;
      return C * (1 - Math.pow(1 + i, -N)) / i + par * Math.pow(1 + i, -N);
    },
    // Yield (annual, bond-equivalent = m × periodic) that equates price to cash flows — bisection
    ytm: function (price, par, c, n, m) {
      m = m || 2; var lo = -0.99 * m, hi = 2 * m, k;
      for (k = 0; k < 300; k++) { var mid = (lo + hi) / 2; if (fn.bondPrice(par, c, mid, n, m) > price) lo = mid; else hi = mid; }
      return (lo + hi) / 2;
    },
    currentYield: function (par, c, price) { return par * c / price; },
    tey: function (taxFree, t) { return taxFree / (1 - t); },
    teyState: function (taxFree, fed, st) { return taxFree / (1 - (fed + st * (1 - fed))); },
    afterTax: function (taxable, t) { return taxable * (1 - t); },
    // Macaulay duration (years) of a level-coupon bond priced at yield y, m payments/yr
    macaulay: function (par, c, y, n, m) {
      m = m || 1; var N = Math.round(n * m), i = y / m, C = par * c / m, pv = 0, w = 0, t;
      for (t = 1; t <= N; t++) { var cf = C + (t === N ? par : 0), d = cf / Math.pow(1 + i, t); pv += d; w += (t / m) * d; }
      return w / pv;
    },
    modDuration: function (mac, y, m) { m = m || 1; return mac / (1 + y / m); },
    durPriceChange: function (mac, y, dy, m) { m = m || 1; return -mac * dy / (1 + y / m); }, // %Δ (decimal)
    conversionRatio: function (par, convPrice) { return par / convPrice; },
    conversionValue: function (ratio, stock) { return ratio * stock; },
    conversionPremium: function (bondPrice, cv) { return (bondPrice - cv) / cv; },
    investmentPremium: function (bondPrice, invValue) { return (bondPrice - invValue) / invValue; },
    downsideRisk: function (bondPrice, invValue) { return (bondPrice - invValue) / bondPrice; },
    ddmConstant: function (d0, g, k) { return d0 * (1 + g) / (k - g); },
    ddmZero: function (d, k) { return d / k; },
    capm: function (rf, beta, rm) { return rf + beta * (rm - rf); },
    hpr: function (begin, end, income) { return (end - begin + (income || 0)) / begin; },
    annualize: function (hprDec, years) { return Math.pow(1 + hprDec, 1 / years) - 1; },
    geoMean: function (rs) { var p = 1; rs.forEach(function (r) { p *= (1 + r); }); return Math.pow(p, 1 / rs.length) - 1; },
    mean: function (xs) { return xs.reduce(function (a, b) { return a + b; }, 0) / xs.length; },
    sdSample: function (xs) { var mu = fn.mean(xs), s = 0; xs.forEach(function (x) { s += (x - mu) * (x - mu); }); return Math.sqrt(s / (xs.length - 1)); },
    sdPop: function (xs) { var mu = fn.mean(xs), s = 0; xs.forEach(function (x) { s += (x - mu) * (x - mu); }); return Math.sqrt(s / xs.length); },
    cv: function (sd, mu) { return sd / mu; },
    covFromCorr: function (rho, s1, s2) { return rho * s1 * s2; },
    portSD2: function (w1, s1, s2, rho) { var w2 = 1 - w1; return Math.sqrt(Math.max(0, w1 * w1 * s1 * s1 + w2 * w2 * s2 * s2 + 2 * w1 * w2 * rho * s1 * s2)); },
    betaFromCorr: function (rho, si, sm) { return rho * si / sm; },
    weightedBeta: function (ws, bs) { var s = 0; ws.forEach(function (w, j) { s += w * bs[j]; }); return s; },
    sharpe: function (rp, rf, sd) { return (rp - rf) / sd; },
    treynor: function (rp, rf, beta) { return (rp - rf) / beta; },
    jensen: function (rp, rf, beta, rm) { return rp - (rf + beta * (rm - rf)); },
    realReturn: function (nom, inf) { return (1 + nom) / (1 + inf) - 1; },
    currencyAdj: function (rLocal, rFx) { return (1 + rLocal) * (1 + rFx) - 1; },
    // IRR for annual cash flows (index = year); bisection on NPV
    irr: function (cfs) {
      function npv(r) { var s = 0; cfs.forEach(function (c, t) { s += c / Math.pow(1 + r, t); }); return s; }
      var lo = -0.99, hi = 5, k; if (npv(lo) * npv(hi) > 0) return NaN;
      for (k = 0; k < 300; k++) { var mid = (lo + hi) / 2; if (npv(lo) * npv(mid) <= 0) hi = mid; else lo = mid; }
      return (lo + hi) / 2;
    },
    twr: function (subs) { var p = 1; subs.forEach(function (r) { p *= (1 + r); }); return p - 1; },
    capRateValue: function (noi, cap) { return noi / cap; },
    optionPayoff: function (type, side, K, prem, S) {
      var intrinsic = type === 'call' ? Math.max(0, S - K) : Math.max(0, K - S);
      var longPL = intrinsic - prem; return side === 'long' ? longPL : -longPL;
    }
  };

  // ---------- drills ----------
  function drill(id, name, mods, lo, gen) { return { id: id, m: 'FP513', d: 'D', name: name, mods: mods, lo: lo, gen: gen }; }

  var drills = [
    drill('bondprice', 'Bond price (semiannual)', [4], 'LO 4.1.1', function (rng, f) {
      var r = R(rng), c = fx(f, 'c', function () { return r.step(0.02, 0.08, 0.005); }),
        y = fx(f, 'y', function () { return r.step(0.02, 0.09, 0.0025); }), n = fx(f, 'n', function () { return r.i(3, 25); }), par = 1000;
      if (Math.abs(c - y) < 1e-9) y += 0.0075;
      var p = fn.bondPrice(par, c, y, n, 2);
      return {
        prompt: 'A $1,000-par bond pays a ' + pct(c * 100) + ' coupon semiannually and matures in ' + n + ' years. Market yield (YTM) is ' + pct(y * 100) + '. What is the bond\'s value?',
        assumptions: ['Semiannual coupons: N = years × 2, I/Y = YTM ÷ 2, PMT = annual coupon ÷ 2', 'Value as of a coupon date (no accrued interest)'],
        answer: p, tol: 1, unit: '$',
        formula: 'Price = Σ coupon ÷ (1+i)<sup>t</sup> + par ÷ (1+i)<sup>N</sup>',
        subst: 'N = ' + (n * 2) + ', I/Y = ' + num(y * 50, 4) + '%, PMT = ' + money(par * c / 2) + ', FV = $1,000 → PV',
        steps: ['Periodic coupon = ' + money(par * c) + ' ÷ 2 = ' + money(par * c / 2), 'Periods = ' + n + ' × 2 = ' + n * 2 + '; periodic yield = ' + pct(y * 100, 3) + ' ÷ 2', 'Solve PV ≈ ' + money(p) + (p < par ? ' — a discount, because the coupon rate is below the market yield.' : ' — a premium, because the coupon rate is above the market yield.')],
        errors: [{ label: 'Used annual periods/coupons instead of semiannual', value: fn.bondPrice(par, c, y, n, 1) }, { label: 'Swapped coupon rate and yield', value: fn.bondPrice(par, y, c, n, 2) }]
      };
    }),
    drill('currentyield', 'Current yield', [7], 'LO 7.4.1', function (rng, f) {
      var r = R(rng), c = fx(f, 'c', function () { return r.step(0.025, 0.08, 0.0025); }), price = fx(f, 'price', function () { return r.i(820, 1180); });
      var cy = fn.currentYield(1000, c, price) * 100;
      return {
        prompt: 'A bond with a ' + pct(c * 100) + ' coupon ($1,000 par) trades at ' + money(price, 0) + '. Current yield?',
        assumptions: ['Current yield uses the annual coupon dollars and today\'s market price'],
        answer: cy, tol: 0.01, unit: '%', formula: 'Current yield = annual coupon $ ÷ market price',
        subst: money(1000 * c) + ' ÷ ' + money(price, 0), steps: ['Annual coupon = ' + pct(c * 100) + ' × $1,000 = ' + money(1000 * c), 'CY = ' + pct(cy, 3)],
        errors: [{ label: 'Divided by par instead of price', value: c * 100 }, { label: 'Used the semiannual coupon', value: cy / 2 }]
      };
    }),
    drill('ytm', 'Yield to maturity', [7, 4], 'LO 7.4.1', function (rng, f) {
      var r = R(rng), c = fx(f, 'c', function () { return r.step(0.03, 0.08, 0.005); }), n = fx(f, 'n', function () { return r.i(4, 20); }),
        price = fx(f, 'price', function () { return r.i(850, 1150); });
      var y = fn.ytm(price, 1000, c, n, 2) * 100;
      return {
        prompt: 'A ' + pct(c * 100) + ' semiannual-coupon bond ($1,000 par) matures in ' + n + ' years and sells for ' + money(price, 0) + '. Yield to maturity (annualized)?',
        assumptions: ['Semiannual: N = ' + n * 2 + ', PMT = ' + money(1000 * c / 2), 'Annual YTM = periodic yield × 2 (bond-equivalent yield)'],
        answer: y, tol: 0.02, unit: '%', formula: 'Solve i so that price = PV of coupons + PV of par; YTM = 2 × i',
        subst: 'N = ' + n * 2 + ', PV = −' + money(price, 0) + ', PMT = ' + money(1000 * c / 2) + ', FV = $1,000 → I/Y × 2',
        steps: ['Periodic i ≈ ' + pct(y / 2, 4), 'YTM ≈ ' + pct(y, 3) + (price < 1000 ? ' (above the coupon rate because the bond trades at a discount)' : ' (below the coupon rate because the bond trades at a premium)')],
        errors: [{ label: 'Forgot to double the semiannual yield', value: y / 2 }, { label: 'Gave the current yield instead', value: 1000 * c / price * 100 }]
      };
    }),
    drill('ytc', 'Yield to call', [7], 'LO 7.4.1', function (rng, f) {
      var r = R(rng), c = fx(f, 'c', function () { return r.step(0.05, 0.09, 0.005); }), callYrs = fx(f, 'callYrs', function () { return r.i(2, 6); }),
        callPx = fx(f, 'callPx', function () { return r.pick([1000, 1020, 1030, 1050]); }), price = fx(f, 'price', function () { return r.i(1040, 1180); });
      // treat call price as the "par" received at the call date
      var N = callYrs * 2, C = 1000 * c / 2, lo = -0.9, hi = 1, k;
      function pv(i) { return C * (1 - Math.pow(1 + i, -N)) / i + callPx * Math.pow(1 + i, -N); }
      for (k = 0; k < 300; k++) { var mid = (lo + hi) / 2; if (pv(mid) > price) lo = mid; else hi = mid; }
      var ytc = (lo + hi) * 100; // ×2 annualized: (lo+hi)/2 × 2
      return {
        prompt: 'A ' + pct(c * 100) + ' semiannual bond trades at ' + money(price, 0) + '. It is callable in ' + callYrs + ' years at ' + money(callPx, 0) + '. Yield to call?',
        assumptions: ['Use the call date and the call price in place of maturity and par', 'Annualize the semiannual rate × 2'],
        answer: ytc, tol: 0.02, unit: '%', formula: 'Solve i: price = PV(coupons to call date) + PV(call price); YTC = 2 × i',
        subst: 'N = ' + N + ', PV = −' + money(price, 0) + ', PMT = ' + money(C) + ', FV = ' + money(callPx, 0) + ' → I/Y × 2',
        steps: ['YTC ≈ ' + pct(ytc, 3), 'For a premium callable bond, the lower of YTM and YTC is the conservative yield to quote.'],
        errors: [{ label: 'Used $1,000 par instead of the call price', value: fn.ytm(price, 1000, c, callYrs, 2) * 100 }, { label: 'Forgot to double the semiannual yield', value: ytc / 2 }]
      };
    }),
    drill('tey', 'Taxable-equivalent yield', [7, 2], 'LO 7.4.1', function (rng, f) {
      var r = R(rng), muni = fx(f, 'muni', function () { return r.step(0.025, 0.05, 0.0025); }), t = fx(f, 't', function () { return r.pick([0.22, 0.24, 0.32, 0.35, 0.37]); });
      var tey = fn.tey(muni, t) * 100;
      return {
        prompt: (r.pick(NAMES)) + ' (federal marginal bracket ' + pct(t * 100, 0) + ') is offered a municipal bond yielding ' + pct(muni * 100) + '. What taxable yield would match it after tax?',
        assumptions: ['Interest is exempt from federal income tax only; state tax ignored', 'Bracket shown is the client\'s marginal rate'],
        answer: tey, tol: 0.01, unit: '%', formula: 'TEY = tax-exempt yield ÷ (1 − marginal tax rate)',
        subst: pct(muni * 100) + ' ÷ (1 − ' + num(t, 2) + ')', steps: ['1 − ' + num(t, 2) + ' = ' + num(1 - t, 2), 'TEY = ' + pct(tey, 3)],
        errors: [{ label: 'Multiplied by (1 − t) — that is the after-tax yield of a taxable bond', value: muni * (1 - t) * 100 }, { label: 'Multiplied by (1 + t)', value: muni * (1 + t) * 100 }]
      };
    }),
    drill('duration', 'Duration price change', [4], 'LO 4.1.2', function (rng, f) {
      var r = R(rng), mac = fx(f, 'mac', function () { return r.step(3, 12, 0.1); }), y = fx(f, 'y', function () { return r.step(0.03, 0.08, 0.0025); }),
        dy = fx(f, 'dy', function () { return r.pick([-0.01, -0.0075, -0.005, 0.005, 0.0075, 0.01, 0.015]); });
      var ch = fn.durPriceChange(mac, y, dy, 1) * 100;
      return {
        prompt: 'A bond has Macaulay duration of ' + num(mac, 1) + ' years and a ' + pct(y * 100) + ' yield. If yields ' + (dy > 0 ? 'rise' : 'fall') + ' by ' + Math.abs(dy * 10000) + ' basis points, what is the approximate % price change? (enter − for a decline)',
        assumptions: ['Annual-compounding modified duration: D ÷ (1 + y)', 'Linear (duration-only) estimate — ignores convexity'],
        answer: ch, tol: 0.02, unit: '%', formula: '%ΔP ≈ −D × [Δy ÷ (1 + y)]',
        subst: '−' + num(mac, 1) + ' × [' + num(dy, 4) + ' ÷ ' + num(1 + y, 4) + ']', steps: ['Modified duration = ' + num(mac, 1) + ' ÷ ' + num(1 + y, 4) + ' = ' + num(mac / (1 + y), 3), '%ΔP ≈ ' + pct(ch, 3) + ' — prices move opposite to yields; convexity makes the true rise slightly larger and the true fall slightly smaller.'],
        errors: [{ label: 'Wrong sign (prices move opposite to yields)', value: -ch }, { label: 'Used Macaulay duration without dividing by (1 + y)', value: -mac * dy * 100 }]
      };
    }),
    drill('macaulay', 'Macaulay duration (annual coupons)', [4], 'LO 4.1.2', function (rng, f) {
      var r = R(rng), c = fx(f, 'c', function () { return r.step(0.03, 0.09, 0.01); }), y = fx(f, 'y', function () { return r.step(0.03, 0.09, 0.005); }), n = fx(f, 'n', function () { return r.i(3, 6); });
      var D = fn.macaulay(1000, c, y, n, 1);
      return {
        prompt: 'Compute the Macaulay duration of a ' + n + '-year, ' + pct(c * 100, 0) + ' annual-coupon bond ($1,000 par) priced at a ' + pct(y * 100) + ' yield.',
        assumptions: ['Annual coupons; weight each year by the PV of its cash flow ÷ bond price'],
        answer: D, tol: 0.01, unit: 'years', formula: 'D = Σ [t × PV(CF<sub>t</sub>)] ÷ Σ PV(CF<sub>t</sub>)',
        subst: 'CF = ' + money(1000 * c) + ' per year, plus $1,000 in year ' + n + '; discount at ' + pct(y * 100),
        steps: ['Price = ' + money(fn.bondPrice(1000, c, y, n, 1)), 'Duration ≈ ' + num(D, 3) + ' years — always less than maturity for a coupon bond'],
        errors: [{ label: 'Gave the maturity (true only for a zero-coupon bond)', value: n }, { label: 'Gave modified duration instead', value: D / (1 + y) }]
      };
    }),
    drill('convertible', 'Convertible bond — conversion value & premium', [2], 'LO 2.2.1', function (rng, f) {
      var r = R(rng), cp = fx(f, 'cp', function () { return r.pick([20, 25, 40, 50]); }), stock = fx(f, 'stock', function () { return r.step(cp * 0.6, cp * 1.2, 0.5); }),
        price = fx(f, 'price', function () { return r.i(900, 1250); });
      var ratio = 1000 / cp, cv = ratio * stock, prem = fn.conversionPremium(price, cv) * 100;
      return {
        prompt: 'A $1,000-par convertible bond is convertible at ' + money(cp, 0) + ' per share. The stock trades at ' + money(stock) + ' and the bond sells for ' + money(price, 0) + '. What is the conversion premium (%)?',
        assumptions: ['Conversion ratio = par ÷ conversion price', 'Premium measured against conversion value'],
        answer: prem, tol: 0.05, unit: '%', formula: 'Conversion premium = (bond price − conversion value) ÷ conversion value',
        subst: 'Ratio = 1,000 ÷ ' + cp + ' = ' + num(ratio, 0) + ' shares; CV = ' + num(ratio, 0) + ' × ' + money(stock) + ' = ' + money(cv),
        steps: ['Conversion value = ' + money(cv), 'Premium = (' + money(price, 0) + ' − ' + money(cv) + ') ÷ ' + money(cv) + ' = ' + pct(prem, 2)],
        errors: [{ label: 'Divided by the bond price instead of conversion value', value: (price - cv) / price * 100 }, { label: 'Gave the dollar premium, not %', value: price - cv }]
      };
    }),
    drill('ddm', 'Constant-growth dividend discount model', [4], 'LO 4.3.1', function (rng, f) {
      var r = R(rng), d0 = fx(f, 'd0', function () { return r.step(0.8, 4, 0.05); }), g = fx(f, 'g', function () { return r.step(0.02, 0.06, 0.005); }), k = fx(f, 'k', function () { return r.step(0.08, 0.13, 0.005); });
      var v = fn.ddmConstant(d0, g, k);
      return {
        prompt: 'A stock just paid a ' + money(d0) + ' dividend that is expected to grow ' + pct(g * 100, 1) + ' per year forever. The investor requires ' + pct(k * 100, 1) + '. Intrinsic value?',
        assumptions: ['"Just paid" = D0, so next year\'s dividend D1 = D0 × (1 + g)', 'Requires k > g'],
        answer: v, tol: 0.02, unit: '$', formula: 'V = D<sub>1</sub> ÷ (k − g)',
        subst: 'D1 = ' + money(d0) + ' × ' + num(1 + g, 3) + ' = ' + money(d0 * (1 + g), 4) + '; k − g = ' + num(k - g, 4),
        steps: ['V = ' + money(d0 * (1 + g), 4) + ' ÷ ' + num(k - g, 4) + ' = ' + money(v)],
        errors: [{ label: 'Used D0 instead of D1', value: d0 / (k - g) }, { label: 'Divided by k + g', value: d0 * (1 + g) / (k + g) }]
      };
    }),
    drill('capm', 'CAPM required return', [8], 'LO 8.2.1', function (rng, f) {
      var r = R(rng), rf = fx(f, 'rf', function () { return r.step(0.02, 0.05, 0.0025); }), rm = fx(f, 'rm', function () { return r.step(0.08, 0.12, 0.005); }), b = fx(f, 'b', function () { return r.step(0.5, 1.8, 0.05); });
      var k = fn.capm(rf, b, rm) * 100;
      return {
        prompt: 'Risk-free rate ' + pct(rf * 100) + ', expected market return ' + pct(rm * 100) + ', stock beta ' + num(b, 2) + '. CAPM required return?',
        assumptions: ['Market risk premium = Rm − Rf'],
        answer: k, tol: 0.01, unit: '%', formula: 'r = Rf + β (Rm − Rf)',
        subst: pct(rf * 100) + ' + ' + num(b, 2) + ' × (' + pct(rm * 100) + ' − ' + pct(rf * 100) + ')',
        steps: ['Market risk premium = ' + pct((rm - rf) * 100), 'r = ' + pct(k, 3)],
        errors: [{ label: 'Multiplied beta by Rm instead of the risk premium', value: (rf + b * rm) * 100 }, { label: 'Forgot to add the risk-free rate', value: b * (rm - rf) * 100 }]
      };
    }),
    drill('wbeta', 'Weighted portfolio beta', [6], 'LO 6.2.1', function (rng, f) {
      var r = R(rng), vals = fx(f, 'vals', function () { return [r.i(2, 9) * 10000, r.i(2, 9) * 10000, r.i(2, 9) * 10000]; }), bs = fx(f, 'bs', function () { return [r.step(0.6, 1.6, 0.05), r.step(0.6, 1.6, 0.05), r.step(0.6, 1.6, 0.05)]; });
      var tot = vals[0] + vals[1] + vals[2], ws = vals.map(function (v) { return v / tot; }), wb = fn.weightedBeta(ws, bs);
      return {
        prompt: 'Portfolio: Stock A ' + money(vals[0], 0) + ' (β ' + num(bs[0], 2) + '), Stock B ' + money(vals[1], 0) + ' (β ' + num(bs[1], 2) + '), Stock C ' + money(vals[2], 0) + ' (β ' + num(bs[2], 2) + '). Portfolio beta?',
        assumptions: ['Weights = market value ÷ total portfolio value'],
        answer: wb, tol: 0.005, unit: '', formula: 'β<sub>p</sub> = Σ w<sub>i</sub> β<sub>i</sub>',
        subst: ws.map(function (w, j) { return num(w, 4) + '×' + num(bs[j], 2); }).join(' + '),
        steps: ['Total = ' + money(tot, 0), 'βp = ' + num(wb, 3)],
        errors: [{ label: 'Simple average of the betas (ignored weights)', value: (bs[0] + bs[1] + bs[2]) / 3 }]
      };
    }),
    drill('sd', 'Mean & standard deviation (sample)', [6], 'LO 6.2.2', function (rng, f) {
      var r = R(rng), xs = fx(f, 'xs', function () { return [r.i(-12, 25), r.i(-12, 25), r.i(-12, 25), r.i(-12, 25), r.i(-12, 25)]; });
      var mu = fn.mean(xs), s = fn.sdSample(xs);
      return {
        prompt: 'Annual returns: ' + xs.map(function (x) { return x + '%'; }).join(', ') + '. Standard deviation of these historical returns (sample)?',
        assumptions: ['Historical data = a sample: divide by n − 1', 'Mean return = ' + pct(mu, 2)],
        answer: s, tol: 0.02, unit: '%', formula: 'σ = √[ Σ (r − r̄)² ÷ (n − 1) ]',
        subst: 'r̄ = ' + num(mu, 2) + '%; n − 1 = ' + (xs.length - 1),
        steps: ['Mean = ' + pct(mu, 2), 'Sample SD ≈ ' + pct(s, 3), 'About 68% of outcomes fall within ±1σ: ' + pct(mu - s, 2) + ' to ' + pct(mu + s, 2)],
        errors: [{ label: 'Population SD (divided by n)', value: fn.sdPop(xs) }, { label: 'Gave the variance', value: s * s }]
      };
    }),
    drill('cv', 'Coefficient of variation', [6], 'LO 6.2.3', function (rng, f) {
      var r = R(rng), mu = fx(f, 'mu', function () { return r.step(4, 14, 0.5); }), s = fx(f, 's', function () { return r.step(6, 25, 0.5); });
      var cv = fn.cv(s, mu);
      return {
        prompt: 'A fund has an average return of ' + pct(mu, 1) + ' and a standard deviation of ' + pct(s, 1) + '. Coefficient of variation?',
        assumptions: ['CV = risk per unit of return; lower is better'],
        answer: cv, tol: 0.005, unit: '', formula: 'CV = σ ÷ mean return',
        subst: num(s, 1) + ' ÷ ' + num(mu, 1), steps: ['CV = ' + num(cv, 3)],
        errors: [{ label: 'Inverted (mean ÷ σ)', value: mu / s }]
      };
    }),
    drill('portsd', 'Two-asset portfolio standard deviation', [6], 'LO 6.2.4', function (rng, f) {
      var r = R(rng), w = fx(f, 'w', function () { return r.step(0.3, 0.7, 0.05); }), s1 = fx(f, 's1', function () { return r.step(10, 25, 1); }), s2 = fx(f, 's2', function () { return r.step(4, 12, 1); }), rho = fx(f, 'rho', function () { return r.step(-0.5, 0.8, 0.1); });
      var sp = fn.portSD2(w, s1, s2, rho);
      return {
        prompt: num(w * 100, 0) + '% in Fund A (σ ' + num(s1, 0) + '%) and ' + num((1 - w) * 100, 0) + '% in Fund B (σ ' + num(s2, 0) + '%); correlation ' + num(rho, 1) + '. Portfolio standard deviation?',
        assumptions: ['Covariance = ρ × σA × σB'],
        answer: sp, tol: 0.02, unit: '%', formula: 'σ<sub>p</sub> = √[w<sub>A</sub>²σ<sub>A</sub>² + w<sub>B</sub>²σ<sub>B</sub>² + 2w<sub>A</sub>w<sub>B</sub>ρσ<sub>A</sub>σ<sub>B</sub>]',
        subst: '√[' + num(w, 2) + '²×' + s1 + '² + ' + num(1 - w, 2) + '²×' + s2 + '² + 2×' + num(w, 2) + '×' + num(1 - w, 2) + '×' + num(rho, 1) + '×' + s1 + '×' + s2 + ']',
        steps: ['σp ≈ ' + pct(sp, 3), 'Weighted average σ would be ' + pct(w * s1 + (1 - w) * s2, 2) + ' — any correlation below +1 lowers risk below that.'],
        errors: [{ label: 'Weighted average of the two σs (assumes ρ = 1)', value: w * s1 + (1 - w) * s2 }, { label: 'Left out the 2 × covariance term', value: Math.sqrt(w * w * s1 * s1 + (1 - w) * (1 - w) * s2 * s2) }]
      };
    }),
    drill('r2', 'Coefficient of determination (R²)', [6], 'LO 6.2.5', function (rng, f) {
      var r = R(rng), rho = fx(f, 'rho', function () { return r.step(0.3, 0.98, 0.01); });
      var r2 = rho * rho * 100;
      return {
        prompt: 'A fund\'s returns have a correlation of ' + num(rho, 2) + ' with its benchmark. What % of the fund\'s return movement is explained by the benchmark (R²)?',
        assumptions: ['R² = correlation squared'],
        answer: r2, tol: 0.1, unit: '%', formula: 'R² = ρ²', subst: num(rho, 2) + '²', steps: ['R² = ' + pct(r2, 1), 'The rest (' + pct(100 - r2, 1) + ') is unexplained / unsystematic.'],
        errors: [{ label: 'Gave ρ itself', value: rho * 100 }]
      };
    }),
    drill('sharpe', 'Sharpe ratio', [7], 'LO 7.2.1', function (rng, f) {
      var r = R(rng), rp = fx(f, 'rp', function () { return r.step(6, 15, 0.5); }), rf = fx(f, 'rf', function () { return r.step(2, 5, 0.25); }), s = fx(f, 's', function () { return r.step(8, 22, 0.5); });
      var sh = fn.sharpe(rp, rf, s);
      return {
        prompt: 'Portfolio return ' + pct(rp, 1) + ', risk-free rate ' + pct(rf, 2) + ', standard deviation ' + pct(s, 1) + '. Sharpe ratio?',
        assumptions: ['Sharpe uses total risk (σ) — right for a client\'s whole, possibly undiversified portfolio'],
        answer: sh, tol: 0.005, unit: '', formula: 'Sharpe = (Rp − Rf) ÷ σp',
        subst: '(' + rp + ' − ' + rf + ') ÷ ' + s, steps: ['Sharpe = ' + num(sh, 3)],
        errors: [{ label: 'Forgot to subtract the risk-free rate', value: rp / s }]
      };
    }),
    drill('treynor', 'Treynor ratio', [7], 'LO 7.2.1', function (rng, f) {
      var r = R(rng), rp = fx(f, 'rp', function () { return r.step(6, 15, 0.5); }), rf = fx(f, 'rf', function () { return r.step(2, 5, 0.25); }), b = fx(f, 'b', function () { return r.step(0.6, 1.6, 0.05); });
      var t = fn.treynor(rp, rf, b);
      return {
        prompt: 'Portfolio return ' + pct(rp, 1) + ', risk-free rate ' + pct(rf, 2) + ', beta ' + num(b, 2) + '. Treynor ratio?',
        assumptions: ['Treynor uses systematic risk (β) — appropriate for a well-diversified portfolio'],
        answer: t, tol: 0.01, unit: '', formula: 'Treynor = (Rp − Rf) ÷ βp',
        subst: '(' + rp + ' − ' + rf + ') ÷ ' + num(b, 2), steps: ['Treynor = ' + num(t, 3)],
        errors: [{ label: 'Forgot to subtract the risk-free rate', value: rp / b }]
      };
    }),
    drill('jensen', 'Jensen\'s alpha', [7, 8], 'LO 7.2.1', function (rng, f) {
      var r = R(rng), rp = fx(f, 'rp', function () { return r.step(5, 16, 0.5); }), rf = fx(f, 'rf', function () { return r.step(2, 5, 0.25); }), rm = fx(f, 'rm', function () { return r.step(7, 12, 0.5); }), b = fx(f, 'b', function () { return r.step(0.6, 1.5, 0.05); });
      var a = fn.jensen(rp, rf, b, rm);
      return {
        prompt: 'A manager earned ' + pct(rp, 1) + ' with beta ' + num(b, 2) + '. Risk-free rate ' + pct(rf, 2) + ', market return ' + pct(rm, 1) + '. Jensen\'s alpha (enter − if negative)?',
        assumptions: ['Alpha = actual return − CAPM required return'],
        answer: a, tol: 0.01, unit: '%', formula: 'α = Rp − [Rf + β (Rm − Rf)]',
        subst: rp + ' − [' + rf + ' + ' + num(b, 2) + ' × (' + rm + ' − ' + rf + ')]',
        steps: ['CAPM return = ' + pct(fn.capm(rf, b, rm), 3), 'α = ' + pct(a, 3) + (a >= 0 ? ' — beat its risk-adjusted benchmark' : ' — underperformed on a risk-adjusted basis')],
        errors: [{ label: 'Compared with the market return instead of the CAPM return', value: rp - rm }, { label: 'Wrong sign', value: -a }]
      };
    }),
    drill('hpr', 'Holding-period & annualized return', [7], 'LO 7.1.1', function (rng, f) {
      var r = R(rng), b = fx(f, 'b', function () { return r.i(20, 80) * 1000; }), e = fx(f, 'e', function () { return Math.round(b * r.f(0.85, 1.7) / 100) * 100; }), inc = fx(f, 'inc', function () { return r.i(0, 6) * 250; }), yrs = fx(f, 'yrs', function () { return r.i(2, 6); });
      var h = fn.hpr(b, e, inc), ann = fn.annualize(h, yrs) * 100;
      return {
        prompt: 'Bought for ' + money(b, 0) + ', sold ' + yrs + ' years later for ' + money(e, 0) + ', with ' + money(inc, 0) + ' of dividends collected (not reinvested). Annualized (compound) return?',
        assumptions: ['HPR = (ending − beginning + income) ÷ beginning', 'Annualize geometrically: (1 + HPR)^(1/n) − 1'],
        answer: ann, tol: 0.02, unit: '%', formula: 'r = (1 + HPR)<sup>1/n</sup> − 1',
        subst: 'HPR = (' + e + ' − ' + b + ' + ' + inc + ') ÷ ' + b + ' = ' + pct(h * 100, 3),
        steps: ['HPR = ' + pct(h * 100, 3), 'Annualized = (1 + ' + num(h, 5) + ')^(1/' + yrs + ') − 1 = ' + pct(ann, 3)],
        errors: [{ label: 'Divided the HPR by the years (simple average)', value: h / yrs * 100 }, { label: 'Gave the total holding-period return', value: h * 100 }]
      };
    }),
    drill('twrmwr', 'Time-weighted vs. dollar-weighted return', [7], 'LO 7.1.1', function (rng, f) {
      var r = R(rng), p0 = fx(f, 'p0', function () { return r.i(40, 60); }), p1 = fx(f, 'p1', function () { return r.i(35, 75); }), p2 = fx(f, 'p2', function () { return r.i(35, 80); });
      // Buy 1 share at t0, buy 1 more at t1, sell 2 at t2 (no dividends)
      var mwr = fn.irr([-p0, -p1, 2 * p2]) * 100, twr = fn.geoMean([p1 / p0 - 1, p2 / p1 - 1]) * 100;
      return {
        prompt: 'An investor buys 1 share at ' + money(p0, 0) + ', buys another share one year later at ' + money(p1, 0) + ', and sells both at year 2 for ' + money(p2, 0) + ' each. No dividends. What is the dollar-weighted (money-weighted) annual return?',
        assumptions: ['Dollar-weighted return = IRR of the investor\'s own cash flows', 'CF0 = −' + p0 + ', CF1 = −' + p1 + ', CF2 = +' + 2 * p2],
        answer: mwr, tol: 0.05, unit: '%', formula: '0 = Σ CF<sub>t</sub> ÷ (1 + IRR)<sup>t</sup>',
        subst: 'CF0 −' + p0 + ', CF1 −' + p1 + ', CF2 +' + 2 * p2 + ' → IRR',
        steps: ['Dollar-weighted (IRR) ≈ ' + pct(mwr, 3), 'Time-weighted (geometric mean of yearly returns, ignores deposit timing) ≈ ' + pct(twr, 3), 'Time-weighted is the right way to judge the MANAGER; dollar-weighted reflects the CLIENT\'s timing.'],
        errors: [{ label: 'Gave the time-weighted return', value: twr }]
      };
    }),
    drill('currency', 'Currency-adjusted foreign return', [5], 'LO 5.5.2', function (rng, f) {
      var r = R(rng), loc = fx(f, 'loc', function () { return r.step(-0.1, 0.2, 0.01); }), fxr = fx(f, 'fxr', function () { return r.step(-0.1, 0.1, 0.01); });
      var tot = fn.currencyAdj(loc, fxr) * 100;
      return {
        prompt: 'A U.S. investor\'s foreign stock returned ' + pct(loc * 100, 0) + ' in local currency while that currency ' + (fxr >= 0 ? 'appreciated' : 'depreciated') + ' ' + pct(Math.abs(fxr) * 100, 0) + ' against the dollar. Return in U.S. dollars?',
        assumptions: ['A stronger foreign currency adds to the dollar return; a weaker one subtracts'],
        answer: tot, tol: 0.01, unit: '%', formula: 'R<sub>$</sub> = (1 + R<sub>local</sub>)(1 + R<sub>currency</sub>) − 1',
        subst: '(1 + ' + num(loc, 2) + ')(1 + ' + num(fxr, 2) + ') − 1', steps: ['R$ = ' + pct(tot, 2)],
        errors: [{ label: 'Simply added the two returns', value: (loc + fxr) * 100 }, { label: 'Applied the currency move in the wrong direction', value: fn.currencyAdj(loc, -fxr) * 100 }]
      };
    }),
    drill('option', 'Option payoff at expiration', [5], 'LO 5.2.2', function (rng, f) {
      var r = R(rng), type = fx(f, 'type', function () { return r.pick(['call', 'put']); }), side = fx(f, 'side', function () { return r.pick(['long', 'short']); }),
        K = fx(f, 'K', function () { return r.i(4, 12) * 5; }), prem = fx(f, 'prem', function () { return r.step(1, 6, 0.5); }), S = fx(f, 'S', function () { return K + r.i(-12, 12); });
      var pl = fn.optionPayoff(type, side, K, prem, S) * 100, be = type === 'call' ? K + prem : K - prem;
      var maxG = side === 'long' ? (type === 'call' ? 'unlimited' : money((K - prem) * 100)) : money(prem * 100);
      var maxL = side === 'long' ? money(prem * 100) : (type === 'call' ? 'unlimited' : money((K - prem) * 100));
      return {
        prompt: 'An investor is ' + side + ' 1 ' + type + ' contract (100 shares), strike ' + money(K, 0) + ', premium ' + money(prem) + '. At expiration the stock is ' + money(S, 0) + '. Profit or loss in dollars? (enter − for a loss)',
        assumptions: ['1 contract = 100 shares; commissions ignored', 'Breakeven = ' + money(be) + '; maximum gain ' + maxG + '; maximum loss ' + maxL],
        answer: pl, tol: 0.5, unit: '$', formula: type === 'call' ? 'Long call P/L = [max(0, S − K) − premium] × 100; short = opposite' : 'Long put P/L = [max(0, K − S) − premium] × 100; short = opposite',
        subst: 'Intrinsic value = ' + money(type === 'call' ? Math.max(0, S - K) : Math.max(0, K - S)) + ' per share',
        steps: ['Per share ' + side + ' ' + type + ' = ' + money(pl / 100), '× 100 = ' + money(pl), 'Breakeven ' + money(be) + ' · max gain ' + maxG + ' · max loss ' + maxL],
        errors: [{ label: 'Flipped long/short', value: -pl }, { label: 'Ignored the premium', value: (side === 'long' ? 1 : -1) * (type === 'call' ? Math.max(0, S - K) : Math.max(0, K - S)) * 100 }]
      };
    }),
    drill('dca', 'Dollar-cost averaging: average cost vs. price', [3], 'LO 3.5.1', function (rng, f) {
      var r = R(rng), amt = fx(f, 'amt', function () { return r.pick([300, 500, 600, 1000]); }), ps = fx(f, 'ps', function () { return [r.i(15, 40), r.i(15, 40), r.i(15, 40), r.i(15, 40)]; });
      var shares = ps.reduce(function (s, p) { return s + amt / p; }, 0), avgCost = amt * ps.length / shares, avgPrice = fn.mean(ps);
      return {
        prompt: 'An investor puts ' + money(amt, 0) + ' into a fund each month for 4 months at share prices of ' + ps.map(function (p) { return money(p, 0); }).join(', ') + '. Average COST per share?',
        assumptions: ['Average cost = total invested ÷ total shares bought (fractional shares allowed)'],
        answer: avgCost, tol: 0.01, unit: '$', formula: 'Average cost = Σ $ invested ÷ Σ shares',
        subst: money(amt * 4, 0) + ' ÷ ' + num(shares, 4) + ' shares',
        steps: ['Shares = ' + ps.map(function (p) { return num(amt / p, 4); }).join(' + ') + ' = ' + num(shares, 4), 'Average cost = ' + money(avgCost), 'Average price = ' + money(avgPrice) + ' — DCA makes the cost ≤ the average price because more shares are bought when prices are low.'],
        errors: [{ label: 'Gave the average price (simple mean of prices)', value: avgPrice }]
      };
    }),
    drill('realret', 'Inflation-adjusted (real) return', [7], 'LO 7.1.1', function (rng, f) {
      var r = R(rng), n = fx(f, 'n', function () { return r.step(0.03, 0.12, 0.005); }), i = fx(f, 'i', function () { return r.step(0.015, 0.05, 0.0025); });
      var rr = fn.realReturn(n, i) * 100;
      return {
        prompt: 'Nominal return ' + pct(n * 100, 1) + ', inflation ' + pct(i * 100, 2) + '. Real (inflation-adjusted) return?',
        assumptions: ['Exact (Fisher) method, not simple subtraction'],
        answer: rr, tol: 0.01, unit: '%', formula: 'Real = [(1 + nominal) ÷ (1 + inflation)] − 1',
        subst: '(' + num(1 + n, 4) + ' ÷ ' + num(1 + i, 4) + ') − 1', steps: ['Real ≈ ' + pct(rr, 3)],
        errors: [{ label: 'Subtracted (approximation)', value: (n - i) * 100 }]
      };
    }),
    drill('caprate', 'Real estate value from NOI (cap rate)', [5], 'LO 5.1.1', function (rng, f) {
      var r = R(rng), gross = fx(f, 'gross', function () { return r.i(8, 30) * 10000; }), vac = fx(f, 'vac', function () { return r.pick([0.03, 0.05, 0.08, 0.1]); }), opex = fx(f, 'opex', function () { return Math.round(gross * r.f(0.25, 0.45) / 100) * 100; }), cap = fx(f, 'cap', function () { return r.step(0.05, 0.1, 0.0025); });
      var noi = gross * (1 - vac) - opex, v = noi / cap;
      return {
        prompt: 'A rental property has potential gross rent of ' + money(gross, 0) + ', a ' + pct(vac * 100, 0) + ' vacancy/collection loss, and operating expenses of ' + money(opex, 0) + ' (excluding debt service and depreciation). Market cap rate ' + pct(cap * 100) + '. Estimated value?',
        assumptions: ['NOI excludes mortgage payments and depreciation', 'Value = NOI ÷ cap rate'],
        answer: v, tol: Math.max(5, v * 0.0005), unit: '$', formula: 'Value = NOI ÷ cap rate; NOI = gross × (1 − vacancy) − operating expenses',
        subst: 'NOI = ' + money(gross, 0) + ' × ' + num(1 - vac, 2) + ' − ' + money(opex, 0) + ' = ' + money(noi, 0),
        steps: ['NOI = ' + money(noi, 0), 'Value = ' + money(noi, 0) + ' ÷ ' + num(cap, 4) + ' = ' + money(v, 0)],
        errors: [{ label: 'Ignored vacancy loss', value: (gross - opex) / cap }, { label: 'Multiplied NOI by the cap rate', value: noi * cap }]
      };
    }),
    drill('washsale', 'Wash sale — adjusted basis of replacement shares', [1], 'LO 1.4.1', function (rng, f) {
      var r = R(rng), sh = fx(f, 'sh', function () { return r.pick([100, 200, 300, 500]); }), cost = fx(f, 'cost', function () { return r.i(30, 80); }), sell = fx(f, 'sell', function () { return cost - r.i(5, 20); }), buy = fx(f, 'buy', function () { return sell + r.i(-4, 4); });
      var loss = (cost - sell) * sh, basis = buy * sh + loss;
      return {
        prompt: 'An investor sells ' + sh + ' shares bought at ' + money(cost, 0) + ' for ' + money(sell, 0) + ' and, 10 days later, buys ' + sh + ' shares of the same stock at ' + money(buy, 0) + '. What is the total basis of the new shares?',
        assumptions: ['Repurchase within 30 days → wash sale: the loss is disallowed now and added to the new shares\' basis', 'Holding period of the old shares tacks on to the new shares'],
        answer: basis, tol: 1, unit: '$', formula: 'New basis = cost of replacement shares + disallowed loss',
        subst: money(buy * sh, 0) + ' + ' + money(loss, 0),
        steps: ['Disallowed loss = (' + cost + ' − ' + sell + ') × ' + sh + ' = ' + money(loss, 0), 'New basis = ' + money(basis, 0) + ' (' + money(basis / sh) + ' per share)'],
        errors: [{ label: 'Forgot to add the disallowed loss', value: buy * sh }, { label: 'Subtracted the loss instead of adding it', value: buy * sh - loss }]
      };
    })
  ];

  // ---------- generator-backed MCQs (math-version exam) ----------
  // Built from a drill: the correct answer + its computed error values (+ a fallback distractor).
  function fmtVal(v, unit) { return unit === '$' ? money(v) : unit === '%' ? pct(v, 2) : unit === 'years' ? num(v, 2) + ' years' : num(v, 3); }
  function shuffle(a, rng) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor((rng || Math.random)() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function mcqFromDrill(id, rng, f) {
    var d = drills.filter(function (x) { return x.id === id; })[0]; if (!d) return null;
    var g = d.gen(rng, f), c = fmtVal(g.answer, g.unit), opts = [c], k;
    g.errors.forEach(function (e) { var s = fmtVal(e.value, g.unit); if (isFinite(e.value) && opts.indexOf(s) < 0 && opts.length < 4) opts.push(s); });
    var bumps = [1.1, 0.9, 1.2, 0.8];
    for (k = 0; opts.length < 4 && k < bumps.length; k++) { var s2 = fmtVal(g.answer * bumps[k], g.unit); if (opts.indexOf(s2) < 0) opts.push(s2); }
    if (opts.length < 4) return null;
    opts = shuffle(opts, rng);
    var q = g.prompt.replace(/\s*\((enter|enter −)[^)]*\)\s*\??$/i, '?');
    return { q: q, o: opts, a: opts.indexOf(c), e: '<b>' + g.formula + '</b><br>' + g.subst + '<br>' + g.steps.join('<br>') };
  }
  var mcqgen = {};
  ['bondprice', 'ytm', 'tey', 'duration', 'convertible', 'ddm', 'capm', 'wbeta', 'portsd', 'sharpe', 'jensen', 'hpr', 'currency', 'dca', 'caprate', 'washsale', 'option', 'realret'].forEach(function (id) {
    mcqgen['fp513.' + id] = function (f) { return mcqFromDrill(id, null, f); };
  });

  var api = { fn: fn, drills: drills, mcqgen: mcqgen, mcqFromDrill: mcqFromDrill, rng: mulberry32, fmtVal: fmtVal };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.FP513CALC = api;
})(typeof window !== 'undefined' ? window : this);

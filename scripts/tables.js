// Generates the two tables the library's corrections read, for sync.js: the
// reference chroma of the saturation correction and the hue shift of the
// OKLab hue axis (see "Saturation correction" and "Hue shift" in
// hsl-star.js). They depend on each other: the reference chroma is measured
// over the hue circle at s = 1, where the hue shift moves the tints, and the
// hue shift below s = 1 is measured with the saturation correction. So they
// are computed in turn until neither changes.
//
// It builds colors itself, from the parts of the library that don't read
// these tables, with the tables being made; the library's own conversions
// are checked against it in js/test/hue-shift.test.js.

import { decode, luminance, lstarFromY, oklabChroma, oklabHue, pureHue, toHsvHue, yFromLstar } from '../js/hsl-star.js';

// As in hsl-star.js.
export const CHROMA_STEPS = 200;
export const SHIFT_STEP = 2.5;
export const SHIFT_WS = [0, 0.02, 0.05, 0.1, 0.25, 0.5, 0.75, 0.98];
export const SHIFT_SS = [0.1, 0.25, 0.5, 0.75, 1];
const ANCHORS = 360 / SHIFT_STEP;
const STRENGTH = 0.6;
const FADE = 0.25;

// The shifted anchors are kept this far ahead of the one before, per degree
// between them, while settling the table; the tests check 0.08.
const REPAIR = 0.085;

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const wrap = (h) => ((h % 360) + 360) % 360;
const hueDiff = (a, b) => ((a - b + 540) % 360) - 180;
const pureOf = (x) => pureHue(wrap(x)).map(decode);
// Each anchor's white share counts from the lightest pure color among it and
// its two neighbours, as in hsl-star.js.
const pureY = Array.from({ length: ANCHORS }, (_, k) => luminance(pureOf(k * SHIFT_STEP)));
const anchorYp = pureY.map((y, k) => Math.max(pureY[(k + ANCHORS - 1) % ANCHORS], y, pureY[(k + 1) % ANCHORS]));
const cell = (k, j, i) => (k * SHIFT_WS.length + j) * SHIFT_SS.length + i;
const PINNED = (j, i) => j === 0 && i === SHIFT_SS.length - 1;

// --- The construction, with given tables -------------------------------------

function referenceAt(table, l) {
  const x = clamp(l, 0, 100) * (CHROMA_STEPS / 100);
  const i = Math.min(CHROMA_STEPS - 1, Math.floor(x));
  return table[i] + (x - i) * (table[i + 1] - table[i]);
}

// The color at HSV hue x (already shifted), L* l and saturation s, with the
// reference chroma table.
function colorAt(x, l, s, reference) {
  const pure = pureOf(x);
  const yp = luminance(pure);
  const y = yFromLstar(clamp(l, 0, 100));
  const a = y <= yp ? y / yp : (1 - y) / (1 - yp);
  const b = y <= yp ? 0 : 1 - a;
  const vivid = pure.map((p) => a * p + b);
  let t = s;
  if (s > 0 && s < 1) {
    const c = oklabChroma(vivid);
    const c0 = referenceAt(reference, l);
    let r = 1;
    if (c > c0 && c > 1e-6) {
      const q = c / c0;
      const f = Math.min(1, (q - 1) / FADE);
      r = 1 + STRENGTH * f * f * (3 - 2 * f) * (q * Math.sqrt(q) - 1);
    }
    t = s / (r + (1 - r) * s);
  }
  return vivid.map((v) => clamp(t * v + (1 - t) * y, 0, 1));
}

// Where v falls among steps, as in hsl-star.js.
function locate(steps, v) {
  const last = steps.length - 1;
  if (v <= steps[0]) return 0;
  if (v >= steps[last]) return last;
  let i = 0;
  while (v > steps[i + 1]) i++;
  return i + (v - steps[i]) / (steps[i + 1] - steps[i]);
}

// Anchor k's shift at luminance y and saturation s, and the cells it reads
// with their weights.
function anchorCells(k, y, s) {
  k = ((k % ANCHORS) + ANCHORS) % ANCHORS;
  const yp = anchorYp[k];
  const wx = locate(SHIFT_WS, y <= yp ? 0 : (y - yp) / (1 - yp));
  const sx = locate(SHIFT_SS, s);
  const j = Math.min(Math.floor(wx), SHIFT_WS.length - 2);
  const i = Math.min(Math.floor(sx), SHIFT_SS.length - 2);
  const [wf, sf] = [wx - j, sx - i];
  return [
    [k, j, i, (1 - wf) * (1 - sf)],
    [k, j, i + 1, (1 - wf) * sf],
    [k, j + 1, i, wf * (1 - sf)],
    [k, j + 1, i + 1, wf * sf],
  ];
}
// The shifted position of anchor k (unwrapped), as anchorCells weighs it,
// without making arrays: the settling below calls it millions of times.
function anchorAt(shift, k, y, s) {
  const kk = ((k % ANCHORS) + ANCHORS) % ANCHORS;
  const yp = anchorYp[kk];
  const wx = locate(SHIFT_WS, y <= yp ? 0 : (y - yp) / (1 - yp));
  const sx = locate(SHIFT_SS, s);
  const j = Math.min(Math.floor(wx), SHIFT_WS.length - 2);
  const i = Math.min(Math.floor(sx), SHIFT_SS.length - 2);
  const wf = wx - j;
  const sf = sx - i;
  const at = cell(kk, j, i);
  const n = SHIFT_SS.length;
  const lo = shift[at] + sf * (shift[at + 1] - shift[at]);
  const hi = shift[at + n] + sf * (shift[at + n + 1] - shift[at + n]);
  return k * SHIFT_STEP + lo + wf * (hi - lo);
}

function shiftHue(shift, x0, y, s) {
  const k = Math.min(ANCHORS - 1, Math.floor(x0 / SHIFT_STEP));
  const g0 = anchorAt(shift, k, y, s);
  return wrap(g0 + (x0 / SHIFT_STEP - k) * (anchorAt(shift, k + 1, y, s) - g0));
}

// --- Measuring ----------------------------------------------------------------

// The reference chroma: at every half L*, the median over 72 hues 5° apart
// on the OKLab axis of the OKLab chroma at s = 1, with the hue shift.
function referenceChroma(shift) {
  return Array.from({ length: CHROMA_STEPS + 1 }, (_, n) => {
    const l = (n * 100) / CHROMA_STEPS;
    const y = yFromLstar(l);
    const chroma = [];
    for (let h = 0; h < 360; h += 5) chroma.push(oklabChroma(colorAt(shiftHue(shift, toHsvHue(h), y, 1), l, 1, null)));
    chroma.sort((a, b) => a - b);
    return (chroma[35] + chroma[36]) / 2;
  });
}

// The shift anchor k needs at white share w and saturation s: the HSV hue,
// near its own, at which the color has the pure color's OKLab hue. Scans
// ±60° in half degrees for where the hue crosses that, takes the crossing
// nearest the anchor and bisects it down.
function measureShift(k, w, s, reference) {
  const a = k * SHIFT_STEP;
  const l = lstarFromY(anchorYp[k] + w * (1 - anchorYp[k]));
  const target = oklabHue(pureOf(a));
  const err = (x) => hueDiff(oklabHue(colorAt(x, l, s, reference)), target);
  let best = null;
  let [px, pe] = [a - 60, err(a - 60)];
  for (let x = a - 59.5; x <= a + 60; x += 0.5) {
    const e = err(x);
    if (pe <= 0 !== e <= 0 && Math.abs(e - pe) < 90) {
      let [lo, hi, elo] = [px, x, pe];
      for (let n = 0; n < 40; n++) {
        const mid = (lo + hi) / 2;
        const em = err(mid);
        if (elo <= 0 === em <= 0) [lo, elo] = [mid, em];
        else hi = mid;
      }
      const root = (lo + hi) / 2;
      if (best === null || Math.abs(root - a) < Math.abs(best - a)) best = root;
    }
    [px, pe] = [x, e];
  }
  return best === null ? 0 : best - a;
}

// Every anchor measured; the pure colors (w 0, s 1) pinned at no shift.
function measureTable(reference) {
  const shift = new Array(ANCHORS * SHIFT_WS.length * SHIFT_SS.length);
  for (let k = 0; k < ANCHORS; k++) {
    SHIFT_WS.forEach((w, j) => SHIFT_SS.forEach((s, i) => (shift[cell(k, j, i)] = PINNED(j, i) ? 0 : measureShift(k, w, s, reference))));
  }
  return shift;
}

// Settles the order: on a grid of L* and s, wherever two neighbouring
// shifted anchors come closer than REPAIR degrees per degree between them,
// the earlier one's cells go down and the later one's up, by the least
// change that closes the gap (a projection); the pinned cells stay. Each
// point is projected as soon as it's found, round after round, which
// converges to a table close to the measured one that keeps every gap,
// until nothing is short by more than a thousandth of a degree.
function settle(shift) {
  for (let round = 0; round < 2000; round++) {
    let short = 0;
    for (let n = 0; n <= 200; n++) {
      const y = yFromLstar(n / 2);
      for (let m = 0; m <= 20; m++) {
        const s = m / 20;
        // Every anchor's position here, kept current as they're repaired.
        const g = Array.from({ length: ANCHORS + 1 }, (_, k) => anchorAt(shift, k, y, s));
        for (let k = 0; k < ANCHORS; k++) {
          const deficit = REPAIR * SHIFT_STEP - (g[k + 1] - g[k]);
          if (deficit <= 1e-4) continue;
          short = Math.max(short, deficit);
          const cells = [
            ...anchorCells(k, y, s).map(([kk, j, i, w]) => [kk, j, i, -w]),
            ...anchorCells(k + 1, y, s),
          ].filter(([, j, i, w]) => w !== 0 && !PINNED(j, i));
          const norm = cells.reduce((sum, [, , , w]) => sum + w * w, 0);
          for (const [kk, j, i, w] of cells) shift[cell(kk, j, i)] += (deficit * w) / norm;
          for (const kk of [k, k + 1]) g[kk] = anchorAt(shift, kk, y, s);
          if (k + 1 === ANCHORS) g[0] = anchorAt(shift, 0, y, s);
        }
      }
    }
    if (short < 1e-3) return round;
  }
  throw new Error('The hue shift table did not settle.');
}

// --- Both tables -----------------------------------------------------------------

let cached = null;

// { referenceChroma, hueShift (flat, anchor × w × s), anchorYref (the
// luminance each anchor's white share counts from), rounds }.
export function generateTables() {
  if (cached) return cached;
  let reference = referenceChroma(new Array(ANCHORS * SHIFT_WS.length * SHIFT_SS.length).fill(0));
  for (let round = 1; round <= 8; round++) {
    const shift = measureTable(reference);
    settle(shift);
    const next = referenceChroma(shift);
    const change = Math.max(...next.map((v, n) => Math.abs(v - reference[n])));
    reference = next;
    if (change < 1e-10) return (cached = { referenceChroma: reference, hueShift: shift, anchorYref: anchorYp, rounds: round });
  }
  throw new Error('The reference chroma and the hue shift did not settle together.');
}

// A color through the construction with the generated tables, for checking
// the library against: { h, l, s } on the OKLab axis to linear sRGB.
export function toLinearWith({ referenceChroma: reference, hueShift: shift }, { h, l, s }) {
  const x = s > 0 ? shiftHue(shift, toHsvHue(h), yFromLstar(clamp(l, 0, 100)), s) : toHsvHue(h);
  return colorAt(x, l, s, reference);
}

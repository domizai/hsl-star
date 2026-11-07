// HSLuv (Alexei Boronine, MIT licence, https://www.hsluv.org/math/), for
// scripts/comparison.js: a port of the reference implementation's maths, on
// linear sRGB, so it's used on the same footing as HSL* and Okhsl.
//
// linearToHsluv([r, g, b]) gives { h, s, l } with s and l from 0 to 100, as
// HSLuv has them, and hsluvToLinear({ h, s, l }) gives [r, g, b].
const M = [
  [3.240969941904521, -1.537383177570093, -0.498610760293],
  [-0.96924363628087, 1.87596750150772, 0.041555057407175],
  [0.055630079696993, -0.20397695888897, 1.056971514242878],
];
const M_INV = [
  [0.41239079926595, 0.35758433938387, 0.18048078840183],
  [0.21263900587151, 0.71516867876775, 0.072192315360733],
  [0.019330818715591, 0.11919477979462, 0.95053215224966],
];
const REF_U = 0.19783000664283;
const REF_V = 0.46831999493879;
const KAPPA = 903.2962962;
const EPSILON = 0.0088564516;

const dot = (row, v) => row[0] * v[0] + row[1] * v[1] + row[2] * v[2];

// The six lines bounding sRGB in the chroma plane at lightness l.
function bounds(l) {
  const sub1 = (l + 16) ** 3 / 1560896;
  const sub2 = sub1 > EPSILON ? sub1 : l / KAPPA;
  const lines = [];
  for (const [m1, m2, m3] of M) {
    for (const t of [0, 1]) {
      const top1 = (284517 * m1 - 94839 * m3) * sub2;
      const top2 = (838422 * m3 + 769860 * m2 + 731718 * m1) * l * sub2 - 769860 * t * l;
      const bottom = (632260 * m3 - 126452 * m2) * sub2 + 126452 * t;
      lines.push([top1 / bottom, top2 / bottom]);
    }
  }
  return lines;
}

// The most chroma sRGB allows at lightness l and hue h (degrees).
function maxChroma(l, h) {
  const rad = (h / 360) * 2 * Math.PI;
  let min = Infinity;
  for (const [slope, intercept] of bounds(l)) {
    const length = intercept / (Math.sin(rad) - slope * Math.cos(rad));
    if (length >= 0) min = Math.min(min, length);
  }
  return min;
}

const yToL = (y) => (y <= EPSILON ? y * KAPPA : 116 * Math.cbrt(y) - 16);
const lToY = (l) => (l <= 8 ? l / KAPPA : ((l + 16) / 116) ** 3);

export function linearToHsluv(rgb) {
  // Linear sRGB → XYZ → LUV → LCh.
  const [x, y, z] = M_INV.map((row) => dot(row, rgb));
  const l = yToL(y);
  let u = 0;
  let v = 0;
  if (l !== 0) {
    const d = x + 15 * y + 3 * z;
    u = 13 * l * ((4 * x) / d - REF_U);
    v = 13 * l * ((9 * y) / d - REF_V);
  }
  const c = Math.sqrt(u * u + v * v);
  let h = c < 1e-8 ? 0 : ((Math.atan2(v, u) * 180) / Math.PI + 360) % 360;
  // LCh → HSLuv.
  if (l > 99.9999999) return { h, s: 0, l: 100 };
  if (l < 1e-8) return { h, s: 0, l: 0 };
  return { h, s: (c / maxChroma(l, h)) * 100, l };
}

export function hsluvToLinear({ h, s, l }) {
  // HSLuv → LCh.
  let c = 0;
  if (l > 99.9999999) l = 100;
  else if (l < 1e-8) l = 0;
  else c = (maxChroma(l, h) / 100) * s;
  // LCh → LUV → XYZ → linear sRGB.
  const rad = (h / 360) * 2 * Math.PI;
  const u = Math.cos(rad) * c;
  const v = Math.sin(rad) * c;
  if (l === 0) return [0, 0, 0];
  const varU = u / (13 * l) + REF_U;
  const varV = v / (13 * l) + REF_V;
  const y = lToY(l);
  const x = -(9 * y * varU) / ((varU - 4) * varV - varU * varV);
  const z = (9 * y - 15 * varV * y - varV * x) / (3 * varV);
  return M.map((row) => dot(row, [x, y, z]));
}

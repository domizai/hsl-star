// Okhsl (Björn Ottosson 2021, MIT licence, https://bottosson.github.io/posts/colorpicker/),
// for scripts/comparison.js: a port following Ottosson's reference
// implementation as coloraide 8.14 has it (spaces/okhsl.py), checked against
// coloraide in experiments/perceptual-hue-consistency.
//
// okhslToLinear(h, s, l) and linearToOkhsl(rgb) convert between Okhsl, with
// h in degrees and s and l from 0 to 1, and linear sRGB. Colors just outside
// the gamut aren't clamped.

const OK_LAB_TO_LMS3 = [[1, 0.3963377773761749, 0.21580375730991364], [1, -0.10556134581565857, -0.0638541728258133], [1, -0.08948417752981186, -1.2914855480194092]];
const OK_LMS_TO_SRGBL = [[4.076741636075959, -3.307711539258062, 0.2309699031821041], [-1.2684379732850313, 2.6097573492876878, -0.3413193760026569], [-0.004196076138675526, -0.703418617935936, 1.7076146940746113]];
const OK_COEFF = [[[-1.8817031, -0.80936501], [1.19086277, 1.76576728, 0.59662641, 0.75515197, 0.56771245]],
                  [[1.8144408, -1.19445267], [0.73956515, -0.45954404, 0.08285427, 0.12541073, -0.14503204]],
                  [[0.13110758, 1.81333971], [1.35733652, -0.00915799, -1.1513021, -0.50559606, 0.00692167]]];
const OK_K1 = 0.206, OK_K2 = 0.03, OK_K3 = (1 + OK_K1) / (1 + OK_K2);
const okToe = x => 0.5 * (OK_K3 * x - OK_K1 + Math.sqrt((OK_K3 * x - OK_K1) ** 2 + 4 * OK_K2 * OK_K3 * x));
const okToeInv = x => (x * x + OK_K1 * x) / (OK_K3 * (x + OK_K2));
const dot3 = (r, v) => r[0] * v[0] + r[1] * v[1] + r[2] * v[2];
function okLabToLinear(lab) { const lms = OK_LAB_TO_LMS3.map(r => dot3(r, lab) ** 3); return OK_LMS_TO_SRGBL.map(r => dot3(r, lms)); }
function okMaxSaturation(a, b) {
  let k, w;
  if (OK_COEFF[0][0][0] * a + OK_COEFF[0][0][1] * b > 1) { k = OK_COEFF[0][1]; w = OK_LMS_TO_SRGBL[0]; }
  else if (OK_COEFF[1][0][0] * a + OK_COEFF[1][0][1] * b > 1) { k = OK_COEFF[1][1]; w = OK_LMS_TO_SRGBL[1]; }
  else { k = OK_COEFF[2][1]; w = OK_LMS_TO_SRGBL[2]; }
  let sat = k[0] + k[1] * a + k[2] * b + k[3] * a * a + k[4] * a * b;
  const kl = OK_LAB_TO_LMS3[0][1] * a + OK_LAB_TO_LMS3[0][2] * b, km = OK_LAB_TO_LMS3[1][1] * a + OK_LAB_TO_LMS3[1][2] * b, ks = OK_LAB_TO_LMS3[2][1] * a + OK_LAB_TO_LMS3[2][2] * b;
  const l_ = 1 + sat * kl, m_ = 1 + sat * km, s_ = 1 + sat * ks;
  const l = l_ ** 3, m = m_ ** 3, s = s_ ** 3;
  const lds = 3 * kl * l_ ** 2, mds = 3 * km * m_ ** 2, sds = 3 * ks * s_ ** 2;
  const lds2 = 6 * kl ** 2 * l_, mds2 = 6 * km ** 2 * m_, sds2 = 6 * ks ** 2 * s_;
  const f = w[0] * l + w[1] * m + w[2] * s, f1 = w[0] * lds + w[1] * mds + w[2] * sds, f2 = w[0] * lds2 + w[1] * mds2 + w[2] * sds2;
  return sat - f * f1 / (f1 * f1 - 0.5 * f * f2);
}
function okCusp(a, b) {
  const sc = okMaxSaturation(a, b), rgb = okLabToLinear([1, sc * a, sc * b]);
  const lc = Math.cbrt(1 / Math.max(rgb[0], rgb[1], rgb[2]));
  return [lc, lc * sc];
}
function okGamutIntersection(a, b, l1, c1, l0, cusp) {
  if ((l1 - l0) * cusp[1] - (cusp[0] - l0) * c1 <= 0) return cusp[1] * l0 / (c1 * cusp[0] + cusp[1] * (l0 - l1));
  let t = cusp[1] * (l0 - 1) / (c1 * (cusp[0] - 1) + cusp[1] * (l0 - l1));
  const dl = l1 - l0, dc = c1;
  const kl = OK_LAB_TO_LMS3[0][1] * a + OK_LAB_TO_LMS3[0][2] * b, km = OK_LAB_TO_LMS3[1][1] * a + OK_LAB_TO_LMS3[1][2] * b, ks = OK_LAB_TO_LMS3[2][1] * a + OK_LAB_TO_LMS3[2][2] * b;
  const ldt = dl + dc * kl, mdt = dl + dc * km, sdt = dl + dc * ks;
  const L = l0 * (1 - t) + t * l1, C = t * c1;
  const l_ = L + C * kl, m_ = L + C * km, s_ = L + C * ks;
  const lms = [l_ ** 3, m_ ** 3, s_ ** 3], d1 = [3 * ldt * l_ ** 2, 3 * mdt * m_ ** 2, 3 * sdt * s_ ** 2], d2 = [6 * ldt ** 2 * l_, 6 * mdt ** 2 * m_, 6 * sdt ** 2 * s_];
  let best = Number.MAX_VALUE;
  for (let i = 0; i < 3; i++) {
    const r = dot3(OK_LMS_TO_SRGBL[i], lms) - 1, r1 = dot3(OK_LMS_TO_SRGBL[i], d1), r2 = dot3(OK_LMS_TO_SRGBL[i], d2);
    const u = r1 / (r1 * r1 - 0.5 * r * r2);
    if (u >= 0) best = Math.min(best, -r * u);
  }
  return t + best;
}
function okStMid(a, b) {
  const s = 0.11516993 + 1 / (7.4477897 + 4.1590124 * b + a * (-2.19557347 + 1.75198401 * b + a * (-2.13704948 - 10.02301043 * b + a * (-4.24894561 + 5.38770819 * b + 4.69891013 * a))));
  const t = 0.11239642 + 1 / (1.6132032 - 0.68124379 * b + a * (0.40370612 + 0.90148123 * b + a * (-0.27087943 + 0.6122399 * b + a * (0.00299215 - 0.45399568 * b - 0.14661872 * a))));
  return [s, t];
}
export function okhslToLinear(hDeg, s, l) {
  const L = okToeInv(l);
  let a = 0, b = 0;
  if (L !== 0 && L !== 1 && s !== 0) {
    const a_ = Math.cos(hDeg * Math.PI / 180), b_ = Math.sin(hDeg * Math.PI / 180);
    const cusp = okCusp(a_, b_), cmax = okGamutIntersection(a_, b_, L, 1, L, cusp);
    const stMax = [cusp[1] / cusp[0], cusp[1] / (1 - cusp[0])];
    const k = cmax / Math.min(L * stMax[0], (1 - L) * stMax[1]);
    const stMid = okStMid(a_, b_);
    let ca = L * stMid[0], cb = (1 - L) * stMid[1];
    const cmid = 0.9 * k * Math.sqrt(Math.sqrt(1 / (1 / ca ** 4 + 1 / cb ** 4)));
    ca = L * 0.4; cb = (1 - L) * 0.8;
    const c0 = Math.sqrt(1 / (1 / ca ** 2 + 1 / cb ** 2));
    let t, k0, k1, k2;
    if (s < 0.8) { t = 1.25 * s; k0 = 0; k1 = 0.8 * c0; k2 = 1 - k1 / cmid; }
    else { t = 5 * (s - 0.8); k0 = cmid; k1 = 0.2 * cmid ** 2 * 1.25 ** 2 / c0; k2 = 1 - k1 / (cmax - cmid); }
    const c = k0 + t * k1 / (1 - k2 * t);
    a = c * a_; b = c * b_;
  }
  return okLabToLinear([L, a, b]);
}

// The inverse, linear sRGB to Okhsl { h (degrees), s, l }, after Ottosson's
// reference srgb_to_okhsl: OKLab, then the same chroma steps (C_0, C_mid,
// C_max) as okhslToLinear, solved for s.
function linearToOklab([r, g, b]) {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

export function linearToOkhsl(rgb) {
  const [L, a, b] = linearToOklab(rgb);
  const C = Math.sqrt(a * a + b * b);
  const l = okToe(L);
  if (C < 1e-9 || L <= 0 || L >= 1) return { h: 0, s: 0, l };
  const [a_, b_] = [a / C, b / C];
  const h = ((Math.atan2(b, a) * 180) / Math.PI + 360) % 360;
  const cusp = okCusp(a_, b_);
  const cmax = okGamutIntersection(a_, b_, L, 1, L, cusp);
  const stMax = [cusp[1] / cusp[0], cusp[1] / (1 - cusp[0])];
  const k = cmax / Math.min(L * stMax[0], (1 - L) * stMax[1]);
  const stMid = okStMid(a_, b_);
  let ca = L * stMid[0];
  let cb = (1 - L) * stMid[1];
  const cmid = 0.9 * k * Math.sqrt(Math.sqrt(1 / (1 / ca ** 4 + 1 / cb ** 4)));
  ca = L * 0.4;
  cb = (1 - L) * 0.8;
  const c0 = Math.sqrt(1 / (1 / ca ** 2 + 1 / cb ** 2));
  let s;
  if (C < cmid) {
    const k1 = 0.8 * c0;
    const k2 = 1 - k1 / cmid;
    s = (C / (k1 + k2 * C)) * 0.8;
  } else {
    const k1 = (0.2 * cmid ** 2 * 1.25 ** 2) / c0;
    const k2 = 1 - k1 / (cmax - cmid);
    s = 0.8 + 0.2 * ((C - cmid) / (k1 + k2 * (C - cmid)));
  }
  return { h, s, l };
}

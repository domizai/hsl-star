// HSL* - Equal-lightness colour space built on sRGB.
//
// Coordinates:
//   h  hue in degrees [0, 360). By default this is the HSV hue of the pure
//      colour on the edge of the RGB cube. With { hue: 'oklab' } the axis is
//      re-spaced so equal steps are equal steps of OKLab hue (0 = red).
//   l  perceived lightness as CIE L* [0, 100]. Every colour with the same l
//      has the same luminance, so it converts to the same grey.
//   s  saturation [0, 1]. 1 is the most vivid colour of that hue and
//      lightness inside sRGB, 0 is the grey of the same lightness.
//
// Construction (all mixing in linear light):
//   below the pure hue's own lightness the pure colour is scaled towards
//   black (a shade), above it the pure colour is mixed with white (a tint).
//   Saturation mixes that vivid colour with the grey of equal luminance.
//   Because luminance is linear in linear RGB, every step is closed form.

const WEIGHTS = [0.2126, 0.7152, 0.0722];
const EPSILON = 216 / 24389;
const KAPPA = 24389 / 27;

export const HUE_MODES = ['hsv', 'oklab'];

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const wrapHue = (h) => (h >= 0 && h < 360 ? h : ((h % 360) + 360) % 360);

// --- sRGB transfer function and luminance ---------------------------------

export function decode(c) {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

export function encode(c) {
  c = clamp(c, 0, 1);
  return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
}

export function luminance([r, g, b]) {
  return WEIGHTS[0] * r + WEIGHTS[1] * g + WEIGHTS[2] * b;
}

export function lstarFromY(y) {
  return y > EPSILON ? 116 * Math.cbrt(y) - 16 : KAPPA * y;
}

export function yFromLstar(l) {
  return l > 8 ? ((l + 16) / 116) ** 3 : l / KAPPA;
}

// --- Hue ------------------------------------------------------------------

// Pure colour of an HSV hue (S = V = 1), gamma-encoded.
export function pureHue(h) {
  const x = wrapHue(h) / 60;
  const i = Math.floor(x) % 6;
  const f = x - Math.floor(x);
  const q = 1 - f;
  return [[1, f, 0], [q, 1, 0], [0, 1, f], [0, q, 1], [f, 0, 1], [1, 0, q]][i];
}

function hsvHueOf([r, g, b]) {
  const max = Math.max(r, g, b);
  const d = max - Math.min(r, g, b);
  if (d === 0) return 0;
  let h;
  if (max === r) h = (g - b) / d;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return wrapHue(h * 60);
}

export function oklabHue([r, g, b]) {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return wrapHue((Math.atan2(bb, a) * 180) / Math.PI);
}

// Lookup table from HSV hue to OKLab hue of the pure colours, unwrapped and
// shifted so red is 0. Index i corresponds to HSV hue i * 360 / LUT_SIZE.
//
// OKLab sees the pure blues between roughly HSV 222° and 242° as almost the
// same hue (it even runs slightly backwards between 232° and 240°). A strictly
// even axis would squeeze them into about 1° and could not be inverted, so
// each HSV degree advances the axis by at least MIN_SLOPE degrees.
const LUT_SIZE = 3600;
const MIN_SLOPE = 0.25;
let perceptualLut = null;

function getPerceptualLut() {
  if (perceptualLut) return perceptualLut;
  const lut = new Float64Array(LUT_SIZE + 1);
  const minStep = (MIN_SLOPE * 360) / LUT_SIZE;
  let start = 0;
  let prev = 0;
  let extra = 0;
  for (let i = 0; i <= LUT_SIZE; i++) {
    let v = oklabHue(pureHue((i * 360) / LUT_SIZE).map(decode));
    if (i === 0) {
      start = prev = v;
      continue;
    }
    while (v - prev > 180) v -= 360;
    while (v - prev < -180) v += 360;
    extra += Math.max(0, minStep - (v - prev));
    lut[i] = v - start + extra;
    prev = v;
  }
  // The last entry is red again, so the total is a full turn plus whatever
  // the minimum slope added. Scale it back to exactly 360.
  const scale = 360 / lut[LUT_SIZE];
  for (let i = 0; i <= LUT_SIZE; i++) lut[i] *= scale;
  perceptualLut = lut;
  return lut;
}

// Convert a hue on the given axis to an HSV hue.
export function toHsvHue(h, { hue = 'oklab' } = {}) {
  h = wrapHue(h);
  if (hue === 'hsv') return h;
  const lut = getPerceptualLut();
  let lo = 0;
  let hi = LUT_SIZE;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (lut[mid] <= h) lo = mid;
    else hi = mid;
  }
  const t = (h - lut[lo]) / (lut[hi] - lut[lo]);
  return wrapHue(((lo + t) * 360) / LUT_SIZE);
}

// Convert an HSV hue to a hue on the given axis.
export function fromHsvHue(h, { hue = 'oklab' } = {}) {
  h = wrapHue(h);
  if (hue === 'hsv') return h;
  const lut = getPerceptualLut();
  const x = (h / 360) * LUT_SIZE;
  const i = Math.min(Math.floor(x), LUT_SIZE - 1);
  return wrapHue(lut[i] + (x - i) * (lut[i + 1] - lut[i]));
}

// --- Forward and inverse ----------------------------------------------------

// Everything that only depends on hue. Compute it once per column when
// rendering a whole plane, then call basisToLinear per pixel.
export function hueBasis(h, { hue = 'oklab' } = {}) {
  const pure = pureHue(toHsvHue(h, { hue })).map(decode);
  return { pure, y: luminance(pure) };
}

export function basisToLinear({ pure, y: yPure }, l, s) {
  const y = yFromLstar(clamp(l, 0, 100));
  s = clamp(s, 0, 1);
  // Vivid colour = a * pure + b (shade if b = 0, tint otherwise).
  const a = y <= yPure ? y / yPure : (1 - y) / (1 - yPure);
  const b = y <= yPure ? 0 : 1 - a;
  const k = s * a;
  const c = s * b + (1 - s) * y;
  return pure.map((p) => clamp(k * p + c, 0, 1));
}

export function toLinear({ h, l, s }, options) {
  return basisToLinear(hueBasis(h, options), l, s);
}

export function fromLinear(rgb, { hue = 'oklab' } = {}) {
  const y = luminance(rgb);
  const l = clamp(lstarFromY(y), 0, 100);
  const max = Math.max(...rgb);
  const min = Math.min(...rgb);
  const range = max - min;
  if (range < 1e-9) return { h: 0, l, s: 0 };

  // Mixing with grey and scaling keep the normalised linear channels equal
  // to the pure colour's, so normalising recovers it exactly.
  const hsv = hsvHueOf(rgb.map((v) => encode((v - min) / range)));
  const pure = pureHue(hsv).map(decode);
  const yPure = luminance(pure);
  const vividRange = y <= yPure ? y / yPure : (1 - y) / (1 - yPure);
  const s = vividRange > 0 ? clamp(range / vividRange, 0, 1) : 0;
  return { h: fromHsvHue(hsv, { hue }), l, s };
}

// Gamma-encoded sRGB, channels in [0, 1].
export function toRgb(coords, options) {
  return toLinear(coords, options).map(encode);
}

export function fromRgb(rgb, options) {
  return fromLinear(rgb.map(decode), options);
}

// --- CIELAB -------------------------------------------------------------------

// sRGB primaries to CIE XYZ, D65 white (IEC 61966-2-1).
const SRGB_TO_XYZ = [
  [0.4124564, 0.3575761, 0.1804375],
  [0.2126729, 0.7151522, 0.072175],
  [0.0193339, 0.119192, 0.9503041],
];
export const D65_WHITE = [0.95047, 1, 1.08883];

export function linearToXyz(rgb) {
  return SRGB_TO_XYZ.map(([r, g, b]) => r * rgb[0] + g * rgb[1] + b * rgb[2]);
}

const labF = (t) => (t > EPSILON ? Math.cbrt(t) : (KAPPA * t + 16) / 116);

// CIE XYZ to L*a*b* relative to the given white.
export function xyzToLab([x, y, z], white = D65_WHITE) {
  const fx = labF(x / white[0]);
  const fy = labF(y / white[1]);
  const fz = labF(z / white[2]);
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

export function linearToLab(rgb) {
  return xyzToLab(linearToXyz(rgb));
}

// --- Formatting and parsing -----------------------------------------------

export function to8bit(rgb) {
  return rgb.map((v) => Math.round(clamp(v, 0, 1) * 255));
}

export function toHex(rgb) {
  return '#' + to8bit(rgb).map((v) => v.toString(16).padStart(2, '0')).join('');
}

export function toRgbString(rgb) {
  return `rgb(${to8bit(rgb).join(', ')})`;
}

// Accepts #rgb, #rrggbb (with or without #), rgb(r, g, b) and "r, g, b"
// with 0–255 channels. Returns gamma-encoded [0, 1] channels or null.
export function parseRgb(input) {
  const str = String(input).trim().toLowerCase();
  let m = str.match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/);
  if (m) {
    let hex = m[1];
    if (hex.length === 3) hex = [...hex].map((c) => c + c).join('');
    return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  }
  m = str.match(/^(?:rgba?\()?\s*(\d{1,3})\s*[,\s]\s*(\d{1,3})\s*[,\s]\s*(\d{1,3})\s*\)?$/);
  if (m) {
    const channels = m.slice(1, 4).map(Number);
    if (channels.every((v) => v <= 255)) return channels.map((v) => v / 255);
  }
  return null;
}

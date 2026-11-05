// HSL* 0.3.0
// A simple color space built on sRGB with perceptual lightness and perceptually spaced hue.
// https://github.com/domizai/hsl-star
// License: MIT
//
// Coordinates:
//   h  hue in degrees [0, 360). By default the axis is re-spaced so equal
//      steps are equal steps of OKLab hue (0 = red). With { hue: 'hsv' } it
//      is the HSV hue of the pure color on the edge of the RGB cube.
//   l  perceived lightness as CIE L* [0, 100]. Every color with the same l
//      has the same luminance, so it converts to the same grey.
//   s  saturation [0, 1]. 1 is the most vivid color of that hue and
//      lightness inside sRGB, 0 is the grey of the same lightness. In
//      between, hues whose most vivid color is more colorful than the
//      median hue's at that lightness are toned down near grey, so equal
//      saturation looks about equally colorful across hues.
//
// Construction (all mixing in linear light):
//   below the pure hue's own lightness the pure color is scaled towards
//   black (a shade), above it the pure color is mixed with white (a tint).
//   Saturation mixes that vivid color with the grey of equal luminance, in
//   the share t = s / (r + (1 − r) s), where r ≥ 1 is the strength of the
//   saturation correction for that hue and lightness (1 = none). Because
//   luminance is linear in linear RGB, every step is closed form, and so
//   is the inverse.

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

// Pure color of an HSV hue (S = V = 1), gamma-encoded.
export function pureHue(h) {
  const x = wrapHue(h) / 60;
  const f = x - Math.floor(x);
  switch (Math.floor(x) % 6) {
    case 0: return [1, f, 0];
    case 1: return [1 - f, 1, 0];
    case 2: return [0, 1, f];
    case 3: return [0, 1 - f, 1];
    case 4: return [f, 0, 1];
    default: return [1, 0, 1 - f];
  }
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

// OKLab a and b of a linear sRGB color (Ottosson 2020).
function oklabAb([r, g, b]) {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s];
}

export function oklabHue(rgb) {
  const [a, b] = oklabAb(rgb);
  return wrapHue((Math.atan2(b, a) * 180) / Math.PI);
}

export function oklabChroma([r, g, b]) {
  return chromaOf(r, g, b);
}

// The same for three channels, without making arrays, for the saturation
// correction, which needs it on every conversion.
function chromaOf(r, g, b) {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return Math.sqrt(a * a + bb * bb);
}

// Lookup table from HSV hue to OKLab hue of the pure colors, unwrapped and
// shifted so red is 0. Index i corresponds to HSV hue i * 360 / LUT_SIZE.
//
// OKLab sees the pure blues between roughly HSV 222° and 242° as almost the
// same hue (it even runs slightly backwards between 232° and 240°). A strictly
// even axis would squeeze them into about 1° and could not be inverted, so
// each HSV degree advances the axis by at least MIN_SLOPE degrees.
const LUT_SIZE = 3600;
const MIN_SLOPE = 0.25;
let perceptualLut = null;

// For going back, which segment of the table a hue falls in: index[b] is the
// last entry at or below the start of bucket b, a tenth of a degree wide.
// The table advances at most a quarter degree per entry, so a lookup walks
// at most a few entries from there instead of searching the whole table.
const INDEX_SIZE = 3600;
let perceptualIndex = null;

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
  const index = new Int32Array(INDEX_SIZE);
  for (let b = 0, i = 0; b < INDEX_SIZE; b++) {
    while (i < LUT_SIZE - 1 && lut[i + 1] <= (b * 360) / INDEX_SIZE) i++;
    index[b] = i;
  }
  perceptualIndex = index;
  perceptualLut = lut;
  return lut;
}

// Convert a hue on the given axis to an HSV hue.
export function toHsvHue(h, { hue = 'oklab' } = {}) {
  h = wrapHue(h);
  if (hue === 'hsv') return h;
  const lut = getPerceptualLut();
  // The last entry at or below h: from its bucket's, a few steps on.
  let lo = perceptualIndex[Math.min(INDEX_SIZE - 1, Math.floor((h * INDEX_SIZE) / 360))];
  while (lo > 0 && lut[lo] > h) lo--;
  while (lo < LUT_SIZE - 1 && lut[lo + 1] <= h) lo++;
  const t = (h - lut[lo]) / (lut[lo + 1] - lut[lo]);
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

// --- Saturation correction ---------------------------------------------------

// The most vivid colors differ hugely in colorfulness between hues, so at
// equal saturation some hues would look far more saturated than others.
// Hues whose most vivid color is more colorful, in OKLab chroma, than the
// median hue's at that lightness are toned down near grey; the others stay
// as they are. The strength r grows with how far a hue stands out, faded in
// smoothly over the first quarter above the median so there's no step
// between hues, and saturation becomes the share t = s / (r + (1 − r) s)
// of the vivid color. r ≥ 1, so t ≤ s: no color gets more colorful, and t
// rises with s, from 0 at 0 to 1 at 1. r depends on hue and lightness
// alone, which both directions know, so they undo each other exactly.
const STRENGTH = 0.6;
const FADE = 0.25;

// BEGIN TABLES (generated by scripts/sync.js, don't edit)
// OKLab chroma of the median hue's most vivid color at L* 0, 0.5, …, 100.
const REFERENCE_CHROMA = [
  0.000000000, 0.022789191, 0.028712581, 0.032867700, 0.036175585, 0.038968968, 0.041410707, 0.043594153,
  0.045578381, 0.047403427, 0.049097823, 0.050682706, 0.052174222, 0.053585014, 0.054925191, 0.056202977,
  0.057425162, 0.058621519, 0.059817877, 0.061014234, 0.062210592, 0.063406949, 0.064603307, 0.065799665,
  0.066996022, 0.068192380, 0.069388737, 0.070585095, 0.071781452, 0.072977810, 0.074174167, 0.075370525,
  0.076566882, 0.077763240, 0.078959597, 0.080155955, 0.081352312, 0.082548670, 0.083745028, 0.084941385,
  0.086137743, 0.087334100, 0.088530458, 0.089726815, 0.090923173, 0.092119530, 0.093315888, 0.094512245,
  0.095708603, 0.096904960, 0.098101318, 0.099297676, 0.100494033, 0.101690391, 0.102886748, 0.104083106,
  0.105279463, 0.106475821, 0.107672178, 0.108868536, 0.110064893, 0.111261251, 0.112457608, 0.113653966,
  0.114850323, 0.116046681, 0.117243039, 0.118439396, 0.119635754, 0.120832111, 0.122028469, 0.123224826,
  0.124421184, 0.125617541, 0.126813899, 0.128010256, 0.129206614, 0.130402971, 0.131599329, 0.132795687,
  0.133992044, 0.135188402, 0.136384759, 0.137581117, 0.138777474, 0.139973832, 0.141170189, 0.142366547,
  0.143562904, 0.144759262, 0.145955619, 0.147151977, 0.148348335, 0.149544692, 0.150741050, 0.151937407,
  0.153133765, 0.154330122, 0.155526480, 0.156722837, 0.157919195, 0.159115552, 0.160311910, 0.161508267,
  0.162704625, 0.163900982, 0.165097340, 0.166293698, 0.167490055, 0.168686413, 0.169882770, 0.171079128,
  0.172275485, 0.173471843, 0.174668200, 0.175864558, 0.177060915, 0.178257273, 0.179453630, 0.179556455,
  0.178599475, 0.176690966, 0.174947304, 0.172568952, 0.171134093, 0.169407800, 0.168949120, 0.167189563,
  0.165619368, 0.164399903, 0.162656621, 0.160951679, 0.161562840, 0.161275635, 0.161076730, 0.158787925,
  0.156607196, 0.154229915, 0.152775872, 0.152659896, 0.151848070, 0.149955572, 0.148043099, 0.147046002,
  0.144883627, 0.143221308, 0.141587648, 0.138913317, 0.137294959, 0.137294702, 0.136109903, 0.134223589,
  0.134442137, 0.134006924, 0.133982859, 0.133414307, 0.131787006, 0.128188987, 0.124630503, 0.120928508,
  0.117287417, 0.113703556, 0.110173613, 0.106694593, 0.103263780, 0.099790373, 0.096252473, 0.092774054,
  0.089352406, 0.085985010, 0.082669526, 0.079403770, 0.076254203, 0.073201133, 0.070177462, 0.067182477,
  0.064215494, 0.061275853, 0.058362921, 0.055476089, 0.052614768, 0.049778393, 0.046966419, 0.044178317,
  0.041426679, 0.038713496, 0.036018430, 0.033341101, 0.030681142, 0.028038202, 0.025411941, 0.022802031,
  0.020208157, 0.017631524, 0.015074828, 0.012530953, 0.009990155, 0.007460522, 0.004952605, 0.002465922,
  0.000000037,
];
// END TABLES

// The median hue's OKLab chroma at s = 1 and lightness l, between the
// table's steps of half an L*.
function referenceChroma(l) {
  const x = clamp(l, 0, 100) * 2;
  const i = Math.min(REFERENCE_CHROMA.length - 2, Math.floor(x));
  return REFERENCE_CHROMA[i] + (x - i) * (REFERENCE_CHROMA[i + 1] - REFERENCE_CHROMA[i]);
}

// The strength r for a hue at lightness l, from its pure color and the
// vivid color's a and b in basisToLinear: vivid = a * pure + b.
function strength([p0, p1, p2], a, b, l) {
  const c = chromaOf(a * p0 + b, a * p1 + b, a * p2 + b);
  const c0 = referenceChroma(l);
  if (!(c > c0) || c <= 1e-6) return 1;
  const q = c / c0;
  const x = Math.min(1, (q - 1) / FADE);
  const fade = x * x * (3 - 2 * x);
  return 1 + STRENGTH * fade * (q * Math.sqrt(q) - 1);
}

// --- Forward and inverse ----------------------------------------------------

// Everything that only depends on hue. Compute it once per column when
// rendering a whole plane, then call basisToLinear per pixel.
export function hueBasis(h, { hue = 'oklab' } = {}) {
  const pure = pureHue(toHsvHue(h, { hue })).map(decode);
  return { pure, y: luminance(pure) };
}

export function basisToLinear({ pure, y: yPure }, l, s) {
  l = clamp(l, 0, 100);
  const y = yFromLstar(l);
  s = clamp(s, 0, 1);
  // Vivid color = a * pure + b (shade if b = 0, tint otherwise).
  const a = y <= yPure ? y / yPure : (1 - y) / (1 - yPure);
  const b = y <= yPure ? 0 : 1 - a;
  // Its share in the mix with grey: s itself at 0 and 1, else corrected.
  let t = s;
  if (s > 0 && s < 1) {
    const r = strength(pure, a, b, l);
    t = s / (r + (1 - r) * s);
  }
  const k = t * a;
  const c = t * b + (1 - t) * y;
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
  // to the pure color's, so normalising recovers it exactly.
  const hsv = hsvHueOf(rgb.map((v) => encode((v - min) / range)));
  const pure = pureHue(hsv).map(decode);
  const yPure = luminance(pure);
  // The vivid color's range, a in basisToLinear, and its share t of it.
  const a = y <= yPure ? y / yPure : (1 - y) / (1 - yPure);
  const t = a > 0 ? clamp(range / a, 0, 1) : 0;
  // Undo the saturation correction with the same strength the forward
  // direction uses: s = r t / (1 − (1 − r) t).
  let s = t;
  if (t > 0 && t < 1) {
    const b = y <= yPure ? 0 : 1 - a;
    const r = strength(pure, a, b, l);
    s = (r * t) / (1 - (1 - r) * t);
  }
  return { h: fromHsvHue(hsv, { hue }), l, s };
}

// Gamma-encoded sRGB, channels in [0, 1].
export function toSrgb(coords, options) {
  return toLinear(coords, options).map(encode);
}

export function fromSrgb(rgb, options) {
  return fromLinear(rgb.map(decode), options);
}

// --- Formatting and parsing -----------------------------------------------

export function to8bit(rgb) {
  return rgb.map((v) => Math.round(clamp(v, 0, 1) * 255));
}

export function toHex(rgb) {
  return '#' + to8bit(rgb).map((v) => v.toString(16).padStart(2, '0')).join('');
}

// Classic HSL, as CSS defines it: h in degrees, s and l in 0–1.
function classicHsl(h, s, l) {
  const k = (n) => (n + wrapHue(h) / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  return [0, 8, 4].map((n) => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1)));
}

// Accepts #rgb, #rrggbb (with or without #), rgb(r, g, b) and "r, g, b"
// with 0–255 channels, and CSS hsl(h, s%, l%). hsl() is read like a browser
// reads it, as classic HSL, not HSL*: commas and % signs are optional, the
// hue may carry deg or turn, and saturation and lightness are clamped to
// 0–100 %. Alpha isn't supported. Returns gamma-encoded [0, 1] channels or
// null.
export function parseSrgb(input) {
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
  m = str.match(/^hsla?\(\s*(-?[\d.]+)(deg|turn)?\s*[,\s]\s*(-?[\d.]+)%?\s*[,\s]\s*(-?[\d.]+)%?\s*\)$/);
  if (m) {
    const h = Number(m[1]) * (m[2] === 'turn' ? 360 : 1);
    const [s, l] = [m[3], m[4]].map((v) => clamp(Number(v) / 100, 0, 1));
    if ([h, s, l].every(Number.isFinite)) return classicHsl(h, s, l);
  }
  return null;
}

// --- Color object ----------------------------------------------------------

// A color, readable in every form. It never changes: with() gives a new one.
// One made from RGB, sRGB or text keeps those exact values, so its hex code
// comes back as given; HSL* is only worked out when it's read. Every form is
// computed once, on first read.
//
// Naming: rgb is 8-bit, 0–255; srgb is gamma-encoded, 0–1.
function makeColor({ srgb = null, coords = null }, hue) {
  const cache = {};
  const once = (key, make) => cache[key] ?? (cache[key] = make());
  const exact = () => once('srgb', () => srgb ?? toSrgb(coords, { hue }));
  const channels = ([r, g, b]) => ({ r, g, b });

  return Object.freeze({
    /** HSL* coordinates { h, l, s } on the color's hue axis. */
    get value() {
      return { ...once('value', () => coords ?? fromSrgb(srgb, { hue })) };
    },
    /** 8-bit RGB, { r, g, b } in 0–255. */
    get rgb() {
      return channels(to8bit(exact()));
    },
    /** Gamma-encoded sRGB, { r, g, b } in 0–1, unrounded. */
    get srgb() {
      return channels(exact());
    },
    /** Linear-light sRGB, { r, g, b } in 0–1. */
    get linear() {
      return channels(exact().map(decode));
    },
    get hex() {
      return toHex(exact());
    },
    /** The same color with some coordinates changed, as a new color. */
    with(changes) {
      return hslStar({ ...this.value, ...changes }, { hue });
    },
    toString() {
      return this.hex;
    },
  });
}

const isCoords = (v) => v && ['h', 'l', 's'].every((k) => Number.isFinite(v[k]));
const isChannels = (v) => v && ['r', 'g', 'b'].every((k) => Number.isFinite(v[k]));

// Three channels from { r, g, b } or [r, g, b], each within 0–max, or an error.
function channelsOf(input, max, name) {
  const values = isChannels(input) ? [input.r, input.g, input.b] : input?.length === 3 ? [...input] : null;
  if (!values?.every((v) => Number.isFinite(v) && v >= 0 && v <= max)) {
    throw new RangeError(`${name} takes { r, g, b } or [r, g, b] with channels from 0 to ${max}.`);
  }
  return values;
}

// Makes a color from HSL* { h, l, s }, RGB { r, g, b } or [r, g, b] in
// 0–255, a hex code or CSS rgb(). The constructors below do the work for
// everything but HSL*.
export default function hslStar(input, options = {}) {
  if (typeof input === 'string') {
    if (/^\s*(rgb|hsl)a?\(/i.test(input)) return hslStar.fromCss(input, options);
    if (/^\s*#?[0-9a-f]+\s*$/i.test(input)) return hslStar.fromHex(input, options);
    throw new Error(`Can't read "${input}" as a color. Use a hex code like '#ee7231', rgb() or hsl().`);
  }
  if (isCoords(input)) {
    const coords = { h: wrapHue(input.h), l: clamp(input.l, 0, 100), s: clamp(input.s, 0, 1) };
    return makeColor({ coords }, options.hue ?? 'oklab');
  }
  if (isChannels(input) || input?.length === 3) return hslStar.fromRgb(input, options);
  throw new TypeError('Make a color from { h, l, s }, { r, g, b }, [r, g, b], a hex code, rgb() or hsl().');
}

/** 8-bit RGB, { r, g, b } or [r, g, b] in 0–255. */
hslStar.fromRgb = (rgb, { hue = 'oklab' } = {}) =>
  makeColor({ srgb: channelsOf(rgb, 255, 'fromRgb').map((v) => v / 255) }, hue);

/** Gamma-encoded sRGB, { r, g, b } or [r, g, b] in 0–1. */
hslStar.fromSrgb = (srgb, { hue = 'oklab' } = {}) => makeColor({ srgb: channelsOf(srgb, 1, 'fromSrgb') }, hue);

/** '#rrggbb' or '#rgb', the # optional. */
hslStar.fromHex = (hex, { hue = 'oklab' } = {}) => {
  const srgb = /^\s*#?([0-9a-f]{3}|[0-9a-f]{6})\s*$/i.test(hex) ? parseSrgb(hex) : null;
  if (!srgb) throw new Error(`Can't read "${hex}" as a hex code. Use six or three hex digits, like '#ee7231' or '#e73'.`);
  return makeColor({ srgb }, hue);
};

/** CSS 'rgb(r, g, b)' with 0–255 channels, or 'hsl(h, s%, l%)' as classic HSL. */
hslStar.fromCss = (css, { hue = 'oklab' } = {}) => {
  const srgb = /^\s*(rgb|hsl)a?\(/i.test(css) ? parseSrgb(css) : null;
  if (!srgb) {
    throw new Error(
      `Can't read "${css}" as CSS. Use rgb() with channels from 0 to 255 or hsl() with percentages, like 'rgb(238, 114, 49)' or 'hsl(20.6, 84.8%, 56.3%)'.`,
    );
  }
  return makeColor({ srgb }, hue);
};

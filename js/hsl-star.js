// HSL* 0.2.1
// A simple colour space built on sRGB with perceptual lightness and perceptually spaced hue.
// https://github.com/domizai/hsl-star
// License: MIT
//
// Coordinates:
//   h  hue in degrees [0, 360). By default the axis is re-spaced so equal
//      steps are equal steps of OKLab hue (0 = red). With { hue: 'hsv' } it
//      is the HSV hue of the pure colour on the edge of the RGB cube.
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

// --- Colour object ----------------------------------------------------------

// A colour, readable in every form. It never changes: with() gives a new one.
// One made from RGB, sRGB or text keeps those exact values, so its hex code
// comes back as given; HSL* is only worked out when it's read. Every form is
// computed once, on first read.
//
// Naming: rgb is 8-bit, 0–255; srgb is gamma-encoded, 0–1.
function makeColour({ srgb = null, coords = null }, hue) {
  const cache = {};
  const once = (key, make) => cache[key] ?? (cache[key] = make());
  const exact = () => once('srgb', () => srgb ?? toSrgb(coords, { hue }));
  const channels = ([r, g, b]) => ({ r, g, b });

  return Object.freeze({
    /** HSL* coordinates { h, l, s } on the colour's hue axis. */
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
    /** The same colour with some coordinates changed, as a new colour. */
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

// Makes a colour from HSL* { h, l, s }, RGB { r, g, b } or [r, g, b] in
// 0–255, a hex code or CSS rgb(). The constructors below do the work for
// everything but HSL*.
export default function hslStar(input, options = {}) {
  if (typeof input === 'string') {
    if (/^\s*(rgb|hsl)a?\(/i.test(input)) return hslStar.fromCss(input, options);
    if (/^\s*#?[0-9a-f]+\s*$/i.test(input)) return hslStar.fromHex(input, options);
    throw new Error(`Can't read "${input}" as a colour. Use a hex code like '#ee7231', rgb() or hsl().`);
  }
  if (isCoords(input)) {
    const coords = { h: wrapHue(input.h), l: clamp(input.l, 0, 100), s: clamp(input.s, 0, 1) };
    return makeColour({ coords }, options.hue ?? 'oklab');
  }
  if (isChannels(input) || input?.length === 3) return hslStar.fromRgb(input, options);
  throw new TypeError('Make a colour from { h, l, s }, { r, g, b }, [r, g, b], a hex code, rgb() or hsl().');
}

/** 8-bit RGB, { r, g, b } or [r, g, b] in 0–255. */
hslStar.fromRgb = (rgb, { hue = 'oklab' } = {}) =>
  makeColour({ srgb: channelsOf(rgb, 255, 'fromRgb').map((v) => v / 255) }, hue);

/** Gamma-encoded sRGB, { r, g, b } or [r, g, b] in 0–1. */
hslStar.fromSrgb = (srgb, { hue = 'oklab' } = {}) => makeColour({ srgb: channelsOf(srgb, 1, 'fromSrgb') }, hue);

/** '#rrggbb' or '#rgb', the # optional. */
hslStar.fromHex = (hex, { hue = 'oklab' } = {}) => {
  const srgb = /^\s*#?([0-9a-f]{3}|[0-9a-f]{6})\s*$/i.test(hex) ? parseSrgb(hex) : null;
  if (!srgb) throw new Error(`Can't read "${hex}" as a hex code. Use six or three hex digits, like '#ee7231' or '#e73'.`);
  return makeColour({ srgb }, hue);
};

/** CSS 'rgb(r, g, b)' with 0–255 channels, or 'hsl(h, s%, l%)' as classic HSL. */
hslStar.fromCss = (css, { hue = 'oklab' } = {}) => {
  const srgb = /^\s*(rgb|hsl)a?\(/i.test(css) ? parseSrgb(css) : null;
  if (!srgb) {
    throw new Error(
      `Can't read "${css}" as CSS. Use rgb() with channels from 0 to 255 or hsl() with percentages, like 'rgb(238, 114, 49)' or 'hsl(20.6, 84.8%, 56.3%)'.`,
    );
  }
  return makeColour({ srgb }, hue);
};

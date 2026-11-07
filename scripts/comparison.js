// Measures and draws the comparisons in COMPARISON.md: HSL, HSLuv, Okhsl
// and HSL* side by side.
//
//   npm run compare
//
// Prints the tables in Markdown and writes the figures to assets/, as SVG
// with the colors drawn in (gradients, swatches, or a PNG inside for the
// planes), so they show up on GitHub in both light and dark mode.
//
// Each space is given by its own coordinates: a hue in degrees, a
// saturation and a lightness from 0 to 1. HSL's hue is the HSV hue, HSLuv's
// the CIELUV hue, Okhsl's the OKLab hue, HSL*'s its own OKLab-spaced axis,
// the default. Where the
// spaces are compared at "the same hue", it's the hue of the same pure
// color, so the rows start from the same red, yellow and so on.

import { deflateSync } from 'node:zlib';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import * as hslStar from '../js/hsl-star.js';
import { okhslToLinear, linearToOkhsl } from './okhsl.js';
import { hsluvToLinear, linearToHsluv } from './hsluv.js';

const clamp01 = (v) => Math.min(1, Math.max(0, v));

// --- The three spaces --------------------------------------------------------

// Classic HSL, gamma-encoded.
function hslToSrgb(h, s, l) {
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  return [0, 8, 4].map((n) => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1)));
}

// Each space: its name, a color from (hue, s, lightness) to linear sRGB, and
// the hue on its own axis of an HSL* hue's pure color.
const SPACES = [
  {
    name: 'HSL',
    toLinear: (h, s, l) => hslToSrgb(h, s, l).map(hslStar.decode),
    hueOf: (h) => hslStar.toHsvHue(h),
  },
  {
    name: 'HSLuv',
    toLinear: (h, s, l) => hsluvToLinear({ h, s: s * 100, l: l * 100 }).map(clamp01),
    hueOf: (h) => linearToHsluv(hslStar.pureHue(hslStar.toHsvHue(h)).map(hslStar.decode)).h,
  },
  {
    name: 'Okhsl',
    toLinear: (h, s, l) => okhslToLinear(h, s, l).map(clamp01),
    hueOf: (h) => hslStar.oklabHue(hslStar.pureHue(hslStar.toHsvHue(h)).map(hslStar.decode)),
  },
  {
    name: 'HSL*',
    toLinear: (h, s, l) => hslStar.toLinear({ h, s, l: l * 100 }),
    hueOf: (h) => h,
  },
];

// The six hues of the rows, HSL* hues of red, yellow, green, cyan, blue and
// magenta.
const HUES = [
  [0, 'red'],
  [79, 'yellow'],
  [113, 'green'],
  [166, 'cyan'],
  [238, 'blue'],
  [300, 'magenta'],
];

// --- Measures -----------------------------------------------------------------

// Linear sRGB to CIELAB (D65).
const WHITE = [0.95047, 1, 1.08883];
function lab([r, g, b]) {
  const xyz = [
    0.4124564 * r + 0.3575761 * g + 0.1804375 * b,
    0.2126729 * r + 0.7151522 * g + 0.072175 * b,
    0.0193339 * r + 0.119192 * g + 0.9503041 * b,
  ];
  const f = (t) => (t > 216 / 24389 ? Math.cbrt(t) : (24389 / 27 * t + 16) / 116);
  const [fx, fy, fz] = xyz.map((v, i) => f(v / WHITE[i]));
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

// CIEDE2000 (Sharma, Wu and Dalal 2005), with kL = kC = kH = 1.
function deltaE2000(lab1, lab2) {
  const [L1, a1, b1] = lab1;
  const [L2, a2, b2] = lab2;
  const rad = Math.PI / 180;
  const C = (Math.hypot(a1, b1) + Math.hypot(a2, b2)) / 2;
  const G = 0.5 * (1 - Math.sqrt(C ** 7 / (C ** 7 + 25 ** 7)));
  const ap1 = (1 + G) * a1;
  const ap2 = (1 + G) * a2;
  const Cp1 = Math.hypot(ap1, b1);
  const Cp2 = Math.hypot(ap2, b2);
  const hp = (b, a) => (b === 0 && a === 0 ? 0 : (Math.atan2(b, a) / rad + 360) % 360);
  const hp1 = hp(b1, ap1);
  const hp2 = hp(b2, ap2);
  const dL = L2 - L1;
  const dC = Cp2 - Cp1;
  let dh = 0;
  if (Cp1 * Cp2 !== 0) {
    dh = hp2 - hp1;
    if (dh > 180) dh -= 360;
    else if (dh < -180) dh += 360;
  }
  const dH = 2 * Math.sqrt(Cp1 * Cp2) * Math.sin((dh / 2) * rad);
  const Lm = (L1 + L2) / 2;
  const Cm = (Cp1 + Cp2) / 2;
  let hm = hp1 + hp2;
  if (Cp1 * Cp2 !== 0) {
    if (Math.abs(hp1 - hp2) <= 180) hm /= 2;
    else hm = hm < 360 ? (hm + 360) / 2 : (hm - 360) / 2;
  }
  const T = 1 - 0.17 * Math.cos((hm - 30) * rad) + 0.24 * Math.cos(2 * hm * rad) + 0.32 * Math.cos((3 * hm + 6) * rad) - 0.2 * Math.cos((4 * hm - 63) * rad);
  const dTheta = 30 * Math.exp(-(((hm - 275) / 25) ** 2));
  const RC = 2 * Math.sqrt(Cm ** 7 / (Cm ** 7 + 25 ** 7));
  const SL = 1 + (0.015 * (Lm - 50) ** 2) / Math.sqrt(20 + (Lm - 50) ** 2);
  const SC = 1 + 0.045 * Cm;
  const SH = 1 + 0.015 * Cm * T;
  const RT = -Math.sin(2 * dTheta * rad) * RC;
  return Math.sqrt((dL / SL) ** 2 + (dC / SC) ** 2 + (dH / SH) ** 2 + RT * (dC / SC) * (dH / SH));
}

// WCAG 2 contrast ratio between two colors in linear sRGB.
const contrast = (a, b) => {
  const [hi, lo] = [hslStar.luminance(a), hslStar.luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

const hueDifference = (a, b) => ((a - b + 540) % 360) - 180;
const median = (values) => {
  const v = [...values].sort((a, b) => a - b);
  return (v[(v.length - 1) >> 1] + v[v.length >> 1]) / 2;
};


// --- Tables -------------------------------------------------------------------

const LIGHTNESSES = [0.1, 0.3, 0.5, 0.7, 0.9];
// One decimal, with a real minus sign and no −0.0.
const fixed = (v) => (Math.abs(v) < 0.05 ? 0 : v).toFixed(1).replace('-', '−');
const table = (head, rows) =>
  [`| ${head.join(' | ')} |`, `|${head.map((_, i) => (i ? '---:' : '---')).join('|')}|`, ...rows.map((r) => `| ${r.join(' | ')} |`)].join('\n');
const section = (title, body) => console.log(`\n### ${title}\n\n${body}`);

// Lightness: the CIE L* a row of equal lightness spans, over 360 hues at
// full saturation.
function lstarRange(space, l) {
  const values = Array.from({ length: 360 }, (_, h) => lab(space.toLinear(h, 1, l))[0]);
  return [Math.min(...values), Math.max(...values)];
}
section(
  'Rows of equal lightness (CIE L* over the hue circle, s = 1)',
  table(
    ['Lightness', ...SPACES.map((s) => s.name)],
    LIGHTNESSES.map((l) => [l.toFixed(1), ...SPACES.map((s) => lstarRange(s, l).map((v) => v.toFixed(1)).join('–'))]),
  ),
);

// Hue steps: CIEDE2000 between neighbouring hues 10° apart on each space's
// own hue axis, at a lightness of 0.5. How even they are: the coefficient
// of variation, and the smallest and largest step.
const HUE_STEP = 10;
function hueSteps(space, s, l) {
  return Array.from({ length: 360 / HUE_STEP }, (_, i) =>
    deltaE2000(lab(space.toLinear(i * HUE_STEP, s, l)), lab(space.toLinear((i + 1) * HUE_STEP, s, l))),
  );
}
const variation = (steps) => {
  const mean = steps.reduce((a, b) => a + b) / steps.length;
  return Math.sqrt(steps.reduce((a, b) => a + (b - mean) ** 2, 0) / steps.length) / mean;
};
section(
  `Hue steps (CIEDE2000 between hues ${HUE_STEP}° apart; spread = standard deviation / mean)`,
  table(
    ['', ...SPACES.map((s) => s.name)],
    [1, 0.5].flatMap((s) =>
      [0.3, 0.5, 0.7].map((l) => [
        `s ${s}, lightness ${l}`,
        ...SPACES.map((space) => {
          const steps = hueSteps(space, s, l);
          return `${Math.round(variation(steps) * 100)} % (${Math.min(...steps).toFixed(1)}–${Math.max(...steps).toFixed(1)})`;
        }),
      ]),
    ),
  ),
);

// Hue of tints, shades and lower saturations: the largest difference in
// OKLab hue from the pure color, along the row from black to white, at
// saturations 0.25 to 1. Colors too close to grey to have a hue are left
// out (OKLab chroma below 0.02).
function drift(space, h) {
  const hue = space.hueOf(h);
  const pure = hslStar.oklabHue(hslStar.pureHue(hslStar.toHsvHue(h)).map(hslStar.decode));
  let worst = 0;
  for (const s of [0.25, 0.5, 0.75, 1]) {
    for (let i = 1; i < 200; i++) {
      const c = space.toLinear(hue, s, i / 200);
      if (hslStar.oklabChroma(c) < 0.02) continue;
      const d = hueDifference(hslStar.oklabHue(c), pure);
      if (Math.abs(d) > Math.abs(worst)) worst = d;
    }
  }
  return worst;
}
section(
  'Hue of tints, shades and lower saturations (largest OKLab hue difference from the pure color, in degrees)',
  table(['Hue', ...SPACES.map((s) => s.name)], HUES.map(([h, name]) => [name, ...SPACES.map((s) => fixed(drift(s, h)))])),
);

// Contrast against white at a lightness of 0.5, over 12 hues 30° apart.
const CONTRAST_L = 0.5;
// The hues are those of HSL*'s 12 hues 30° apart, so each column has the
// same pure color.
const CONTRAST_HUES = Array.from({ length: 12 }, (_, i) => i * 30);
const contrastColor = (space, h) => space.toLinear(space.hueOf(h), 1, CONTRAST_L);
const contrasts = (space) => CONTRAST_HUES.map((h) => contrast(contrastColor(space, h), [1, 1, 1]));
section(
  `Contrast against white (WCAG 2), lightness ${CONTRAST_L}, s = 1, 12 hues`,
  table(['', ...SPACES.map((s) => s.name)], [
    ['Lowest', ...SPACES.map((s) => Math.min(...contrasts(s)).toFixed(2))],
    ['Highest', ...SPACES.map((s) => Math.max(...contrasts(s)).toFixed(2))],
  ]),
);

// Round trip and speed, from and to gamma-encoded sRGB.
function srgbToHsl([r, g, b]) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return [0, 0, l];
  const s = d / (1 - Math.abs(2 * l - 1));
  const h = max === r ? ((g - b) / d + 6) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, s, l];
}
const CONVERSIONS = [
  { name: 'HSL', to: (c) => hslToSrgb(...c), from: srgbToHsl },
  {
    name: 'HSLuv',
    to: ([h, s, l]) => hsluvToLinear({ h, s, l }).map(hslStar.encode),
    from: (rgb) => {
      const { h, s, l } = linearToHsluv(rgb.map(hslStar.decode));
      return [h, s, l];
    },
  },
  {
    name: 'Okhsl',
    to: ([h, s, l]) => okhslToLinear(h, s, l).map(hslStar.encode),
    from: (rgb) => {
      const { h, s, l } = linearToOkhsl(rgb.map(hslStar.decode));
      return [h, s, l];
    },
  },
  {
    name: 'HSL*',
    to: ([h, s, l]) => hslStar.toSrgb({ h, s, l }),
    from: (rgb) => {
      const { h, s, l } = hslStar.fromSrgb(rgb);
      return [h, s, l];
    },
  },
];
function rng(seed) {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 2 ** 32;
  };
}
const random = rng(7);
const COLORS = 20_000;
const samples = Array.from({ length: COLORS }, () => [random(), random(), random()]);
let sink = 0;
function nanoseconds(fn, inputs) {
  const round = () => {
    const start = process.hrtime.bigint();
    for (const input of inputs) sink += fn(input)[0];
    return Number(process.hrtime.bigint() - start) / inputs.length;
  };
  for (let i = 0; i < 3; i++) round();
  return median(Array.from({ length: 9 }, round));
}
section(
  'Round trip and speed (sRGB to the space and back, 20,000 random colors; Node on one core)',
  table(
    ['', 'Worst channel error', 'From sRGB', 'To sRGB'],
    CONVERSIONS.map(({ name, to, from }) => {
      const coords = samples.map(from);
      const worst = Math.max(...samples.map((rgb, i) => Math.max(...to(coords[i]).map((v, k) => Math.abs(v - rgb[k])))));
      return [name, worst.toExponential(1), `${Math.round(nanoseconds(from, samples))} ns`, `${Math.round(nanoseconds(to, coords))} ns`];
    }),
  ),
);
if (Number.isNaN(sink)) console.log(sink);

// In HSL*, the contrast against white follows from L* alone: the lightest
// L* with at least 4.5 : 1, the WCAG AA level for text, for every hue.
section('Lightest HSL* L* with 4.5 : 1 against white', hslStar.lstarFromY(1.05 / 4.5 - 0.05).toFixed(2));

// --- Figures ------------------------------------------------------------------

const ASSETS = new URL('../assets/', import.meta.url);
const write = (name, data) => {
  const path = fileURLToPath(new URL(name, ASSETS));
  writeFileSync(path, data);
  console.log(`\nWrote ${path}`);
};
const hex = (linear) => hslStar.toHex(linear.map((v) => hslStar.encode(clamp01(v))));

// Text in a grey that reads on GitHub's light and dark backgrounds.
const FONT = `font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif" font-size="13" fill="#8b949e"`;
const svg = (width, height, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">\n${body.flat(Infinity).join('\n')}\n</svg>\n`;
const text = (x, y, content, { anchor = 'start', baseline = 'middle', fill } = {}) =>
  `<text x="${x}" y="${y}" text-anchor="${anchor}" dominant-baseline="${baseline}"${fill ? ` fill="${fill}"` : ''}>${content}</text>`;
const escape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

// A strip of colors, from colorAt(0) at the left to colorAt(1) at the
// right, as a gradient with enough stops to follow the colors.
let gradients = 0;
function strip(x, y, width, height, colorAt, stops = 96) {
  const id = `g${++gradients}`;
  return [
    `<linearGradient id="${id}">${Array.from({ length: stops + 1 }, (_, i) => `<stop offset="${(i / stops).toFixed(4)}" stop-color="${hex(colorAt(i / stops))}"/>`).join('')}</linearGradient>`,
    `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="url(#${id})"/>`,
  ];
}

// 1. Rows from black to white: per hue, the three spaces below each other,
// each from its lightness 0 to 1 at full saturation, in a grid of 3 × 2.
{
  const COLUMNS = 2;
  const CELL = 474;
  const GAP = 12;
  const LABEL = 48;
  const ROW = 22;
  const TITLE = 24;
  const cellHeight = TITLE + SPACES.length * (ROW + 4);
  const body = HUES.map(([h, name], i) => {
    const x = (i % COLUMNS) * (CELL + GAP);
    const y = Math.floor(i / COLUMNS) * (cellHeight + 16);
    return [
      text(x, y + 10, `${name[0].toUpperCase()}${name.slice(1)}, HSL* hue ${h}°`),
      SPACES.map((space, k) => {
        const top = y + TITLE + k * (ROW + 4);
        return [text(x, top + ROW / 2, escape(space.name)), strip(x + LABEL, top, CELL - LABEL, ROW, (l) => space.toLinear(space.hueOf(h), 1, l))];
      }),
    ];
  });
  const rows = Math.ceil(HUES.length / COLUMNS);
  write('comparison-rows.svg', svg(COLUMNS * CELL + (COLUMNS - 1) * GAP, rows * cellHeight + (rows - 1) * 16, [`<g ${FONT}>`, body, '</g>']));
}

// 2. Hue steps: per space and saturation, a bar for each step of 10° on its
// hue axis at lightness 0.5, as high as its CIEDE2000, in the color halfway.
{
  const LABEL = 56;
  const CHART = 440;
  const GAP = 24;
  const HEIGHT = 84;
  const TITLE = 24;
  const TOP = 18;
  const BAND = HEIGHT + 20;
  const L = 0.5;
  const y0 = (k) => TITLE + k * BAND + HEIGHT;
  const scale = (v) => (v / TOP) * HEIGHT;
  const body = [1, 0.5].map((s, c) => {
    const x = LABEL + c * (CHART + GAP);
    return [
      text(x, 10, `s = ${s}, lightness ${L}`),
      SPACES.map((space, k) => {
        const steps = hueSteps(space, s, L);
        const width = CHART / steps.length;
        return [
          c ? [] : text(0, y0(k) - HEIGHT / 2, escape(space.name)),
          [5, 10, 15].map((v) => `<line x1="${x}" x2="${x + CHART}" y1="${y0(k) - scale(v)}" y2="${y0(k) - scale(v)}" stroke="#8b949e" stroke-opacity="0.3"/>`),
          steps.map((d, i) => `<rect x="${(x + i * width + 1).toFixed(2)}" y="${(y0(k) - scale(d)).toFixed(2)}" width="${(width - 2).toFixed(2)}" height="${scale(d).toFixed(2)}" fill="${hex(space.toLinear((i + 0.5) * HUE_STEP, s, L))}"/>`),
          `<line x1="${x}" x2="${x + CHART}" y1="${y0(k)}" y2="${y0(k)}" stroke="#8b949e"/>`,
          [5, 10, 15].map((v) => text(x + CHART + 4, y0(k) - scale(v), v, { anchor: 'start' })),
        ];
      }),
    ];
  });
  write('comparison-hue-steps.svg', svg(LABEL + 2 * CHART + GAP + 20, TITLE + SPACES.length * BAND - 20, [`<g ${FONT}>`, body, '</g>']));
}

// 3. Contrast: 12 hues at lightness 0.5 and full saturation, each with its
// contrast against white, written in white.
{
  const LABEL = 56;
  const SWATCH = 70;
  const GAP = 4;
  const HEIGHT = 44;
  const body = SPACES.map((space, k) => {
    const y = k * (HEIGHT + GAP);
    return [
      text(0, y + HEIGHT / 2, escape(space.name)),
      contrasts(space).map((ratio, i) => {
        const x = LABEL + i * (SWATCH + GAP);
        return [
          `<rect x="${x}" y="${y}" width="${SWATCH}" height="${HEIGHT}" fill="${hex(contrastColor(space, CONTRAST_HUES[i]))}"/>`,
          text(x + SWATCH / 2, y + HEIGHT / 2, ratio.toFixed(2), { anchor: 'middle', fill: '#ffffff' }),
        ];
      }),
    ];
  });
  write('comparison-contrast.svg', svg(LABEL + 12 * (SWATCH + GAP) - GAP, SPACES.length * (HEIGHT + GAP) - GAP, [`<g ${FONT}>`, body, '</g>']));
}

// 4. Limits: the hue circle at lightness 0.4 and 0.9 and full saturation,
// on HSL*'s hue axis, so the pure colors line up.
{
  const LABEL = 56;
  const STRIP = 440;
  const GAP = 24;
  const ROW = 28;
  const TITLE = 24;
  const body = [0.4, 0.9].map((l, c) => {
    const x = LABEL + c * (STRIP + GAP);
    return [
      text(x, 10, `Lightness ${l}, s = 1`),
      SPACES.map((space, k) => {
        const y = TITLE + k * (ROW + 4);
        return [c ? [] : text(0, y + ROW / 2, escape(space.name)), strip(x, y, STRIP, ROW, (t) => space.toLinear(space.hueOf(t * 360), 1, l), 180)];
      }),
    ];
  });
  write('comparison-limits.svg', svg(LABEL + 2 * STRIP + GAP, TITLE + SPACES.length * (ROW + 4) - 4, [`<g ${FONT}>`, body, '</g>']));
}

// 5. Lightness: the hue–lightness plane of each space at full saturation,
// hue across on its own axis, white at the top and black at the bottom, and
// beside it the same plane in grey, the luminance of each color. Each row a
// PNG inside the SVG, with the space's name above it.
{
  const W = 480;
  const H = 160;
  const GAP = 12;
  const CAPTION = 24;
  const SPACE = 12;
  const width = 2 * W + GAP;
  const ROW = CAPTION + H + SPACE;
  const body = SPACES.map((space, k) => {
    const pixels = new Uint8Array(width * H * 4); // transparent gap
    for (let y = 0; y < H; y++) {
      const l = 1 - y / (H - 1);
      for (let x = 0; x < W; x++) {
        const color = space.toLinear(((x + 0.5) / W) * 360, 1, l);
        const grey = hslStar.luminance(color);
        const at = (y * width + x) * 4;
        pixels.set([...hslStar.to8bit(color.map(hslStar.encode)), 255], at);
        pixels.set([...hslStar.to8bit([grey, grey, grey].map(hslStar.encode)), 255], at + (W + GAP) * 4);
      }
    }
    const top = k * ROW;
    return [
      text(0, top + 10, escape(space.name)),
      `<image x="0" y="${top + CAPTION}" width="${width}" height="${H}" href="data:image/png;base64,${png(width, H, pixels).toString('base64')}"/>`,
    ];
  });
  write('comparison-lightness.svg', svg(width, SPACES.length * ROW - SPACE, [`<g ${FONT}>`, body, '</g>']));
}

// A PNG, 8-bit RGBA, no filtering.
function png(width, height, pixels) {
  const crcTable = Array.from({ length: 256 }, (_, n) => {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    return c >>> 0;
  });
  const crc32 = (bytes) => {
    let c = 0xffffffff;
    for (const b of bytes) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  };
  const chunk = (type, data) => {
    const out = Buffer.alloc(12 + data.length);
    out.writeUInt32BE(data.length, 0);
    out.write(type, 4, 'ascii');
    Buffer.from(data).copy(out, 8);
    out.writeUInt32BE(crc32(out.subarray(4, 8 + data.length)), 8 + data.length);
    return out;
  };
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header.set([8, 6, 0, 0, 0], 8);
  const raw = Buffer.alloc(height * (width * 4 + 1));
  for (let y = 0; y < height; y++) Buffer.from(pixels.subarray(y * width * 4, (y + 1) * width * 4)).copy(raw, y * (width * 4 + 1) + 1);
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', new Uint8Array(0)),
  ]);
}

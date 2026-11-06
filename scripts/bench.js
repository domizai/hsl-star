// Times the library's conversions in both directions, in nanoseconds per
// call, for comparing changes to the model:
//
//   npm run bench
//
// Each conversion runs over the same 10,000 random colors, first to warm up,
// then in several rounds; the median round counts. The results go into a
// sum that's printed, so the engine can't skip the work.

import * as hslStar from '../js/hsl-star.js';

const COLORS = 10_000;
const ROUNDS = 15;
const PASSES = 20;

// Small deterministic PRNG, as in the tests, so every run times the same colors.
function rng(seed) {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 2 ** 32;
  };
}

const random = rng(7);
const coords = Array.from({ length: COLORS }, () => ({ h: random() * 360, l: random() * 100, s: random() }));
const linear = Array.from({ length: COLORS }, () => [random(), random(), random()]);
const srgb = linear.map((rgb) => rgb.map(hslStar.encode));

let sink = 0;
function time(name, inputs, convert) {
  const round = () => {
    const start = process.hrtime.bigint();
    for (let pass = 0; pass < PASSES; pass++) {
      for (const input of inputs) {
        const out = convert(input);
        sink += Array.isArray(out) ? out[0] : out.s;
      }
    }
    return Number(process.hrtime.bigint() - start) / (PASSES * inputs.length);
  };
  for (let i = 0; i < 3; i++) round();
  const rounds = Array.from({ length: ROUNDS }, round).sort((a, b) => a - b);
  console.log(`${name.padEnd(24)} ${rounds[ROUNDS >> 1].toFixed(0).padStart(6)} ns`);
}

for (const hue of hslStar.HUE_MODES) {
  console.log(`hue: '${hue}'`);
  time('  HSL* → linear RGB', coords, (c) => hslStar.toLinear(c, { hue }));
  time('  linear RGB → HSL*', linear, (rgb) => hslStar.fromLinear(rgb, { hue }));
  time('  HSL* → sRGB', coords, (c) => hslStar.toSrgb(c, { hue }));
  time('  sRGB → HSL*', srgb, (rgb) => hslStar.fromSrgb(rgb, { hue }));
}
console.log(`(checksum ${sink.toFixed(3)})`);

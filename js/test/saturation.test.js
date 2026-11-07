// The saturation correction (see "Saturation correction" in hsl-star.js).
// The reference values started as those of the implementation brief in
// experiments/perceptual-hue-consistency/BRIEF-saturation-correction.md;
// since the hue shift (hue-shift.test.js) they are its own: the shift moves
// tints on the OKLab axis, and with them the reference chroma above L* 55.
// Below that it's unchanged, as the shades of pure colors don't move.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as hslStar from '../hsl-star.js';
import { referenceChroma } from '../../scripts/sync.js';

const close = (a, b, tol, msg) =>
  assert.ok(Math.abs(a - b) <= tol, `${msg ?? ''} expected ${b}, got ${a} (tol ${tol})`);

test('reference chroma at some lightnesses', () => {
  const chroma = referenceChroma();
  const expected = { 10: 0.062211, 25: 0.098101, 40: 0.133992, 50: 0.157919, 60: 0.177910, 75: 0.136877, 90: 0.058026 };
  for (const [l, c] of Object.entries(expected)) close(chroma[l * 2], c, 1e-6, `L* ${l}`);
});

test('reference colors', () => {
  const cases = [
    [264, 40, 0.2, '#5f5a7c'],
    [264, 40, 0.5, '#6350a6'],
    [300, 60, 0.3, '#ad83ab'],
    [30, 60, 0.3, '#a38c7b'],
    [110, 85, 0.25, '#cdd7cc'],
    [190, 50, 0.4, '#5d7c85'],
    [0, 50, 0.2, '#8d706c'],
    [264, 40, 1, '#7704ff'],
    [264, 40, 0, '#5e5e5e'],
    [60, 30, 0.5, '#4d4631'],
  ];
  for (const [h, l, s, hex] of cases) {
    assert.equal(hslStar.toHex(hslStar.toSrgb({ h, l, s })), hex, `h=${h} l=${l} s=${s}`);
  }
});

// --- Properties ---------------------------------------------------------------

// Small deterministic PRNG so failures are reproducible.
function rng(seed) {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 2 ** 32;
  };
}

// The uncorrected model, as before the correction: the vivid color (s = 1,
// which the correction leaves alone) mixed with grey in the share s.
function uncorrected({ h, l, s }, options) {
  const vivid = hslStar.toLinear({ h, l, s: 1 }, options);
  const y = hslStar.yFromLstar(l);
  return vivid.map((v) => s * v + (1 - s) * y);
}

// How far a color is from its grey: the spread of its linear channels,
// which is the vivid color's spread times its share t in the mix.
const spread = (rgb) => Math.max(...rgb) - Math.min(...rgb);

test('saturation rises strictly with s', () => {
  for (let l = 2.5; l < 100; l += 2.5) {
    for (let h = 0; h < 360; h += 2.5) {
      let last = -1;
      for (let i = 0; i <= 100; i++) {
        const now = spread(hslStar.toLinear({ h, l, s: i / 100 }));
        assert.ok(now > last, `h=${h} l=${l} s=${i / 100}: ${now} after ${last}`);
        last = now;
      }
    }
  }
});

// On the HSV axis, where the hue isn't shifted, so the hue stays the same
// and only the saturation correction acts.
test('no color gets more colorful than before', () => {
  for (let l = 2.5; l < 100; l += 2.5) {
    for (let h = 0; h < 360; h += 2.5) {
      for (let i = 1; i < 100; i++) {
        const coords = { h, l, s: i / 100 };
        const now = hslStar.oklabChroma(hslStar.toLinear(coords, { hue: 'hsv' }));
        const before = hslStar.oklabChroma(uncorrected(coords, { hue: 'hsv' }));
        assert.ok(now <= before + 1e-12, `h=${h} l=${l} s=${coords.s}: ${now} > ${before}`);
      }
    }
  }
});

test('s = 0 and s = 1 give the same colors as before', () => {
  for (const hue of hslStar.HUE_MODES) {
    for (let l = 0; l <= 100; l += 2.5) {
      for (let h = 0; h < 360; h += 5) {
        for (const s of [0, 1]) {
          const now = hslStar.toLinear({ h, l, s }, { hue });
          const before = uncorrected({ h, l, s }, { hue });
          now.forEach((v, i) => close(v, before[i], 1e-15, `h=${h} l=${l} s=${s} ${hue}`));
        }
      }
    }
  }
});

test('linear RGB survives a round trip exactly', () => {
  const rand = rng(3);
  const colors = Array.from({ length: 20000 }, () => [rand(), rand(), rand()]);
  // The edges: 8-bit greys, primaries and secondaries, and colors one step
  // from grey or from the cube's edge.
  for (let i = 0; i <= 255; i++) {
    const v = hslStar.decode(i / 255);
    const next = hslStar.decode(Math.min(255, i + 1) / 255);
    colors.push([v, v, v], [v, 0, 0], [0, v, 0], [0, 0, v], [v, v, 0], [0, v, v], [v, 0, v], [next, v, v], [v, next, v]);
  }
  for (const hue of hslStar.HUE_MODES) {
    for (const rgb of colors) {
      const back = hslStar.toLinear(hslStar.fromLinear(rgb, { hue }), { hue });
      back.forEach((v, i) => close(v, rgb[i], 1e-12, `${rgb} ${hue}`));
    }
  }
});

test('no steps between neighbouring hues', () => {
  // OKLab chroma between hues a quarter degree apart may differ by at most
  // the largest such step before the correction, plus a little.
  let before = 0;
  let now = 0;
  for (let l = 5; l < 100; l += 5) {
    for (const s of [0.1, 0.2, 0.3, 0.5, 0.7]) {
      let last = null;
      for (let h = 0; h <= 360; h += 0.25) {
        const c = { now: hslStar.oklabChroma(hslStar.toLinear({ h, l, s })), before: hslStar.oklabChroma(uncorrected({ h, l, s })) };
        if (last) {
          now = Math.max(now, Math.abs(c.now - last.now));
          before = Math.max(before, Math.abs(c.before - last.before));
        }
        last = c;
      }
    }
  }
  assert.ok(now <= before + 0.0005, `largest step ${now}, before ${before}`);
});

// The saturation correction is the same on both axes: on the OKLab axis
// the hue shift moves tints and lower saturations to another HSV hue, but
// the shades of a pure color at s = 1 aren't shifted, and there the two
// axes agree.
test('both hue axes give the same shades for the same hue', () => {
  for (let x = 0; x < 360; x += 2.5) {
    const h = hslStar.fromHsvHue(x);
    const top = hslStar.lstarFromY(hslStar.luminance(hslStar.pureHue(x).map(hslStar.decode)));
    for (let l = 2; l <= top; l += 2) {
      const hsv = hslStar.toLinear({ h: x, l, s: 1 }, { hue: 'hsv' });
      const oklab = hslStar.toLinear({ h, l, s: 1 }, { hue: 'oklab' });
      hsv.forEach((v, i) => close(v, oklab[i], 1e-9, `x=${x} l=${l}`));
    }
  }
});

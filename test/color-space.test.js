import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  decode,
  encode,
  luminance,
  lstarFromY,
  yFromLstar,
  pureHue,
  oklabHue,
  toHsvHue,
  fromHsvHue,
  toLinear,
  toRgb,
  fromRgb,
  toHex,
  toRgbString,
  parseColor,
  HUE_MODES,
} from '../src/hsl-star.js';

const close = (a, b, tol, msg) =>
  assert.ok(Math.abs(a - b) <= tol, `${msg ?? ''} expected ${b}, got ${a} (tol ${tol})`);

const hueDiff = (a, b) => Math.abs(((a - b + 540) % 360) - 180);

// Small deterministic PRNG so failures are reproducible.
function rng(seed) {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 2 ** 32;
  };
}

test('transfer function and L* round trip', () => {
  for (let i = 0; i <= 255; i++) close(encode(decode(i / 255)), i / 255, 1e-12);
  for (let l = 0; l <= 100; l += 0.5) close(lstarFromY(yFromLstar(l)), l, 1e-9);
});

test('known L* of sRGB primaries and secondaries', () => {
  const lstar = (rgb) => lstarFromY(luminance(rgb.map(decode)));
  close(lstar([1, 0, 0]), 53.24, 0.01, 'red');
  close(lstar([1, 1, 0]), 97.14, 0.01, 'yellow');
  close(lstar([0, 0, 1]), 32.30, 0.01, 'blue');
  close(lstar([0.5, 0.5, 0.5]), 53.39, 0.01, 'grey 0.5');
});

test('every row of the plane has constant L*', () => {
  for (const hue of HUE_MODES) {
    for (let l = 0; l <= 100; l += 2.5) {
      for (let h = 0; h < 360; h += 3) {
        for (const s of [0, 0.25, 0.5, 1]) {
          const got = lstarFromY(luminance(toLinear({ h, l, s }, { hue })));
          close(got, l, 1e-9, `h=${h} l=${l} s=${s} ${hue}`);
        }
      }
    }
  }
});

test('8-bit output stays close to the target L*', () => {
  let worst = 0;
  for (let l = 0; l <= 100; l += 1) {
    for (let h = 0; h < 360; h += 2) {
      for (const s of [0, 0.5, 1]) {
        const hex = toHex(toRgb({ h, l, s }));
        const got = lstarFromY(luminance(parseColor(hex).map(decode)));
        worst = Math.max(worst, Math.abs(got - l));
      }
    }
  }
  assert.ok(worst < 0.5, `worst 8-bit deviation ${worst}`);
});

test('pure hues land at s = 1 and their own lightness', () => {
  for (let h = 0; h < 360; h += 15) {
    const rgb = pureHue(h);
    const c = fromRgb(rgb);
    close(c.s, 1, 1e-9, `s at h=${h}`);
    close(c.h, h, 1e-6, `h at h=${h}`);
    close(c.l, lstarFromY(luminance(rgb.map(decode))), 1e-9);
  }
});

test('greys have saturation 0', () => {
  for (const v of [0, 0.2, 0.5, 1]) {
    const c = fromRgb([v, v, v]);
    assert.equal(c.s, 0);
    close(c.l, lstarFromY(decode(v)), 1e-9);
  }
});

test('coordinates survive a round trip', () => {
  const rand = rng(1);
  for (const hue of HUE_MODES) {
    for (let i = 0; i < 5000; i++) {
      const coords = { h: rand() * 360, l: 1 + rand() * 98, s: 0.05 + rand() * 0.95 };
      const back = fromRgb(toRgb(coords, { hue }), { hue });
      assert.ok(hueDiff(back.h, coords.h) < 1e-6, `h ${coords.h} -> ${back.h} (${hue})`);
      close(back.l, coords.l, 1e-9, 'l');
      close(back.s, coords.s, 1e-9, 's');
    }
  }
});

test('every sRGB colour maps into range and back to itself', () => {
  const rand = rng(2);
  for (const hue of HUE_MODES) {
    for (let i = 0; i < 20000; i++) {
      const rgb = [rand(), rand(), rand()].map((v) => Math.round(v * 255) / 255);
      const c = fromRgb(rgb, { hue });
      assert.ok(c.h >= 0 && c.h < 360, `h ${c.h}`);
      assert.ok(c.l >= 0 && c.l <= 100, `l ${c.l}`);
      assert.ok(c.s >= 0 && c.s <= 1, `s ${c.s}`);
      assert.equal(toHex(toRgb(c, { hue })), toHex(rgb));
    }
  }
});

test('perceptual hue axis: monotonic, red at 0, even OKLab steps', () => {
  let prev = -1;
  for (let h = 0; h < 360; h += 0.25) {
    const p = fromHsvHue(h, 'oklab');
    assert.ok(p > prev, `not increasing at hsv ${h}`);
    prev = p;
    close(toHsvHue(p, 'oklab'), h, 1e-6, 'inverse');
  }
  assert.equal(fromHsvHue(0, 'oklab'), 0);

  // The minimum slope through the blues shifts the other steps a little.
  const okOf = (p) => oklabHue(pureHue(toHsvHue(p, 'oklab')).map(decode));
  const red = okOf(0);
  for (let p = 0; p < 360; p += 30) {
    close(hueDiff(okOf(p), red), Math.min(p, 360 - p), 3, `step ${p}`);
  }
});

test('perceptual hue axis keeps the blues reachable', () => {
  const width = fromHsvHue(242, 'oklab') - fromHsvHue(222, 'oklab');
  assert.ok(width >= 4.9, `blue band only ${width}° wide`);
});

test('hsv mode leaves the hue untouched', () => {
  for (let h = 0; h < 360; h += 7.3) {
    assert.equal(toHsvHue(h, 'hsv'), h);
    assert.equal(fromHsvHue(h, 'hsv'), h);
  }
});

test('formatting and parsing', () => {
  assert.equal(toHex([1, 0.5, 0]), '#ff8000');
  assert.equal(toRgbString([1, 0.5, 0]), 'rgb(255, 128, 0)');
  assert.deepEqual(parseColor('#f80').map((v) => v * 255), [255, 136, 0]);
  assert.deepEqual(parseColor('FF8000').map((v) => v * 255), [255, 128, 0]);
  assert.deepEqual(parseColor('rgb(255, 128, 0)').map((v) => v * 255), [255, 128, 0]);
  assert.deepEqual(parseColor('12 34 56').map((v) => v * 255), [12, 34, 56]);
  assert.equal(parseColor('rgb(300, 0, 0)'), null);
  assert.equal(parseColor('#12345'), null);
  assert.equal(parseColor('blue'), null);
});

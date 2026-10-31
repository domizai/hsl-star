import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as hslStar from '../hsl-star.js';

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
  for (let i = 0; i <= 255; i++) close(hslStar.encode(hslStar.decode(i / 255)), i / 255, 1e-12);
  for (let l = 0; l <= 100; l += 0.5) close(hslStar.lstarFromY(hslStar.yFromLstar(l)), l, 1e-9);
});

test('known L* of sRGB primaries and secondaries', () => {
  const lstar = (rgb) => hslStar.lstarFromY(hslStar.luminance(rgb.map(hslStar.decode)));
  close(lstar([1, 0, 0]), 53.24, 0.01, 'red');
  close(lstar([1, 1, 0]), 97.14, 0.01, 'yellow');
  close(lstar([0, 0, 1]), 32.30, 0.01, 'blue');
  close(lstar([0.5, 0.5, 0.5]), 53.39, 0.01, 'grey 0.5');
});

test('every row of the plane has constant L*', () => {
  for (const hue of hslStar.HUE_MODES) {
    for (let l = 0; l <= 100; l += 2.5) {
      for (let h = 0; h < 360; h += 3) {
        for (const s of [0, 0.25, 0.5, 1]) {
          const got = hslStar.lstarFromY(hslStar.luminance(hslStar.toLinear({ h, l, s }, { hue })));
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
        const hex = hslStar.toHex(hslStar.toSrgb({ h, l, s }));
        const got = hslStar.lstarFromY(hslStar.luminance(hslStar.parseSrgb(hex).map(hslStar.decode)));
        worst = Math.max(worst, Math.abs(got - l));
      }
    }
  }
  assert.ok(worst < 0.5, `worst 8-bit deviation ${worst}`);
});

test('pure hues land at s = 1 and their own lightness', () => {
  for (let h = 0; h < 360; h += 15) {
    const rgb = hslStar.pureHue(h);
    const c = hslStar.fromSrgb(rgb, { hue: 'hsv' });
    close(c.s, 1, 1e-9, `s at h=${h}`);
    close(c.h, h, 1e-6, `h at h=${h}`);
    close(c.l, hslStar.lstarFromY(hslStar.luminance(rgb.map(hslStar.decode))), 1e-9);
  }
});

test('the even perceived (oklab) hue axis is the default', () => {
  const coords = { h: 200, l: 55, s: 0.7 };
  assert.deepEqual(hslStar.toSrgb(coords), hslStar.toSrgb(coords, { hue: 'oklab' }));
  assert.notDeepEqual(hslStar.toSrgb(coords), hslStar.toSrgb(coords, { hue: 'hsv' }));
  const blue = hslStar.fromSrgb([0, 0, 1]);
  close(blue.h, hslStar.fromHsvHue(240, { hue: 'oklab' }), 1e-9, 'blue on the oklab axis');
  close(hslStar.toHsvHue(blue.h), 240, 1e-6, 'back to HSV');
});

test('greys have saturation 0', () => {
  for (const v of [0, 0.2, 0.5, 1]) {
    const c = hslStar.fromSrgb([v, v, v]);
    assert.equal(c.s, 0);
    close(c.l, hslStar.lstarFromY(hslStar.decode(v)), 1e-9);
  }
});

test('coordinates survive a round trip', () => {
  const rand = rng(1);
  for (const hue of hslStar.HUE_MODES) {
    for (let i = 0; i < 5000; i++) {
      const coords = { h: rand() * 360, l: 1 + rand() * 98, s: 0.05 + rand() * 0.95 };
      const back = hslStar.fromSrgb(hslStar.toSrgb(coords, { hue }), { hue });
      assert.ok(hueDiff(back.h, coords.h) < 1e-6, `h ${coords.h} -> ${back.h} (${hue})`);
      close(back.l, coords.l, 1e-9, 'l');
      close(back.s, coords.s, 1e-9, 's');
    }
  }
});

test('every sRGB color maps into range and back to itself', () => {
  const rand = rng(2);
  for (const hue of hslStar.HUE_MODES) {
    for (let i = 0; i < 20000; i++) {
      const rgb = [rand(), rand(), rand()].map((v) => Math.round(v * 255) / 255);
      const c = hslStar.fromSrgb(rgb, { hue });
      assert.ok(c.h >= 0 && c.h < 360, `h ${c.h}`);
      assert.ok(c.l >= 0 && c.l <= 100, `l ${c.l}`);
      assert.ok(c.s >= 0 && c.s <= 1, `s ${c.s}`);
      assert.equal(hslStar.toHex(hslStar.toSrgb(c, { hue })), hslStar.toHex(rgb));
    }
  }
});

test('perceptual hue axis: monotonic, red at 0, even OKLab steps', () => {
  let prev = -1;
  for (let h = 0; h < 360; h += 0.25) {
    const p = hslStar.fromHsvHue(h, { hue: 'oklab' });
    assert.ok(p > prev, `not increasing at hsv ${h}`);
    prev = p;
    close(hslStar.toHsvHue(p, { hue: 'oklab' }), h, 1e-6, 'inverse');
  }
  assert.equal(hslStar.fromHsvHue(0, { hue: 'oklab' }), 0);

  // The minimum slope through the blues shifts the other steps a little.
  const okOf = (p) => hslStar.oklabHue(hslStar.pureHue(hslStar.toHsvHue(p, { hue: 'oklab' })).map(hslStar.decode));
  const red = okOf(0);
  for (let p = 0; p < 360; p += 30) {
    close(hueDiff(okOf(p), red), Math.min(p, 360 - p), 3, `step ${p}`);
  }
});

test('perceptual hue axis keeps the blues reachable', () => {
  const width = hslStar.fromHsvHue(242, { hue: 'oklab' }) - hslStar.fromHsvHue(222, { hue: 'oklab' });
  assert.ok(width >= 4.9, `blue band only ${width}° wide`);
});

test('hsv mode leaves the hue untouched', () => {
  for (let h = 0; h < 360; h += 7.3) {
    assert.equal(hslStar.toHsvHue(h, { hue: 'hsv' }), h);
    assert.equal(hslStar.fromHsvHue(h, { hue: 'hsv' }), h);
  }
});

test('formatting and parsing', () => {
  assert.equal(hslStar.toHex([1, 0.5, 0]), '#ff8000');
  assert.deepEqual(hslStar.parseSrgb('#f80').map((v) => v * 255), [255, 136, 0]);
  assert.deepEqual(hslStar.parseSrgb('FF8000').map((v) => v * 255), [255, 128, 0]);
  assert.deepEqual(hslStar.parseSrgb('rgb(255, 128, 0)').map((v) => v * 255), [255, 128, 0]);
  assert.deepEqual(hslStar.parseSrgb('12 34 56').map((v) => v * 255), [12, 34, 56]);
  assert.equal(hslStar.parseSrgb('rgb(300, 0, 0)'), null);
  assert.equal(hslStar.parseSrgb('#12345'), null);
  assert.equal(hslStar.parseSrgb('blue'), null);
});

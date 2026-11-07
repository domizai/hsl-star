// The hue shift on the OKLab axis (see "Hue shift" in hsl-star.js): pure
// colors don't move, the shifted anchors keep their order so the inverse is
// unique, the library follows the generated tables, and the tints and lower
// saturations keep their pure color's OKLab hue.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as hslStar from '../hsl-star.js';
import { generateTables, toLinearWith } from '../../scripts/tables.js';

const hueDiff = (a, b) => ((a - b + 540) % 360) - 180;
const lstarOfPure = (x) => hslStar.lstarFromY(hslStar.luminance(hslStar.pureHue(x).map(hslStar.decode)));

function rng(seed) {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 2 ** 32;
  };
}

test('pure colors keep their place, so h + 180° is the opposite hue', () => {
  for (let x = 0; x < 360; x += 0.5) {
    const h = hslStar.fromHsvHue(x);
    const rgb = hslStar.toLinear({ h, l: lstarOfPure(x), s: 1 });
    const back = hslStar.fromLinear(rgb, { hue: 'hsv' });
    assert.ok(Math.abs(hueDiff(back.h, x)) < 1e-9, `HSV ${x}° came out as ${back.h}°`);
  }
});

test('the HSV axis is not shifted', () => {
  const rand = rng(21);
  for (let i = 0; i < 20000; i++) {
    const c = { h: rand() * 360, l: 1 + rand() * 98, s: 0.02 + rand() * 0.98 };
    const back = hslStar.fromLinear(hslStar.toLinear(c, { hue: 'hsv' }), { hue: 'hsv' });
    assert.ok(Math.abs(hueDiff(back.h, c.h)) < 1e-6, `${c.h} → ${back.h}`);
  }
});

test('the shifted anchors keep their order everywhere', () => {
  // At every L* and s, the colors at the anchor hues (every 2.5° of HSV hue)
  // must come out at rising HSV hues, at least 0.08° per degree apart; else
  // the inverse wouldn't be unique.
  const STEP = 2.5;
  const n = 360 / STEP;
  const hs = Array.from({ length: n }, (_, k) => hslStar.fromHsvHue(k * STEP));
  for (let l = 0.5; l < 100; l += 0.5) {
    for (let s = 0.02; s <= 1; s += 0.02) {
      const xs = hs.map((h) => hslStar.fromLinear(hslStar.toLinear({ h, l, s }), { hue: 'hsv' }).h);
      xs.forEach((x, k) => {
        const gap = ((xs[(k + 1) % n] - x + 360) % 360) || 360;
        assert.ok(gap >= 0.08 * STEP - 1e-6 && gap < 180, `L* ${l}, s ${s.toFixed(2)}: ${k * STEP}° to ${(k + 1) * STEP}° only ${gap.toFixed(3)}° apart`);
      });
    }
  }
});

test('the library follows the generated tables', () => {
  const tables = generateTables();
  const rand = rng(23);
  for (let i = 0; i < 20000; i++) {
    const c = { h: rand() * 360, l: rand() * 100, s: rand() };
    const a = hslStar.toLinear(c);
    const b = toLinearWith(tables, c);
    // The library's table is rounded to a ten-thousandth of a degree.
    a.forEach((v, k) => assert.ok(Math.abs(v - b[k]) < 1e-5, `${JSON.stringify(c)}: ${a} vs ${b}`));
  }
});

test('tints and lower saturations keep their pure color\'s OKLab hue', () => {
  // Weighted by chroma, as hue matters little near grey; the worst case
  // over colors with some chroma.
  let [sum, weights, worst] = [0, 0, 0];
  for (let l = 2; l < 100; l += 2) {
    for (let s = 0.1; s <= 1; s += 0.1) {
      for (let h = 0; h < 360; h += 2) {
        const rgb = hslStar.toLinear({ h, l, s });
        const chroma = hslStar.oklabChroma(rgb);
        const target = hslStar.oklabHue(hslStar.pureHue(hslStar.toHsvHue(h)).map(hslStar.decode));
        const e = Math.abs(hueDiff(hslStar.oklabHue(rgb), target));
        sum += e * chroma;
        weights += chroma;
        if (chroma > 0.03) worst = Math.max(worst, e);
      }
    }
  }
  // Without the shift: mean 3.3°, worst 21.5°; with it about 0.26° and
  // 3.7°. What's left is mostly in the blues, where the order of the
  // anchors holds the shift back.
  assert.ok(sum / weights < 0.4, `mean ${(sum / weights).toFixed(2)}°`);
  assert.ok(worst < 5, `worst ${worst.toFixed(2)}°`);
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as hslStar from '../hsl-star.js';
import { interpolatePalette, toneScale } from '../palette.js';

const stops = ['#1d3557', '#f7694f', '#f4e9b0'].map(hslStar.parseRgb);

test('palette has the requested length and passes through every stop', () => {
  const colours = interpolatePalette(stops, 21);
  assert.equal(colours.length, 21);
  assert.equal(hslStar.toHex(colours[0]), '#1d3557');
  assert.equal(hslStar.toHex(colours[10]), '#f7694f');
  assert.equal(hslStar.toHex(colours[20]), '#f4e9b0');
});

test('lightness changes in even steps between stops', () => {
  const colours = interpolatePalette(stops, 21);
  const l = colours.map((c) => hslStar.fromRgb(c).l);
  for (const [from, to] of [[0, 10], [10, 20]]) {
    const step = (l[to] - l[from]) / 10;
    for (let i = from; i <= to; i++) {
      assert.ok(Math.abs(l[i] - (l[from] + (i - from) * step)) < 0.5, `step ${i}`);
    }
  }
});

test('hue takes the shorter way round', () => {
  // Red (0°) to magenta (300°) should pass through 330°, not through green.
  const colours = interpolatePalette([[1, 0, 0], [1, 0, 1]], 3);
  const h = hslStar.fromRgb(colours[1]).h;
  assert.ok(h > 300 && h < 360, `hue ${h}`);
});

test('greys borrow the hue of their neighbour', () => {
  const colours = interpolatePalette([[0.5, 0.5, 0.5], [0, 0, 1]], 5, { hue: 'hsv' });
  for (const c of colours.slice(1, 4)) {
    const { h } = hslStar.fromRgb(c, { hue: 'hsv' });
    assert.ok(Math.abs(h - 240) < 2, `hue ${h}`);
  }
});

test('stops are validated', () => {
  assert.throws(() => interpolatePalette([stops[0]], 5));
  assert.throws(() => interpolatePalette(stops, 2));
});

test('tone scale steps evenly in L* and leaves out black and white', () => {
  const steps = 10;
  const step = 100 / (steps + 1);
  for (const hex of ['#000000', '#1d3557', '#f7694f', '#f4e9b0', '#ffffff']) {
    const base = hslStar.parseRgb(hex);
    const { shades, tints } = toneScale(base, steps);
    const l = [...shades, base, ...tints].map((c) => hslStar.fromRgb(c).l);
    assert.ok(shades.length + tints.length <= steps, hex);
    for (let i = 1; i < l.length; i++) assert.ok(Math.abs(l[i] - l[i - 1] - step) < 0.5, `${hex} step ${i}`);
    for (const c of [...shades, ...tints]) {
      const lc = hslStar.fromRgb(c).l;
      assert.ok(lc > step / 2 - 0.5 && lc < 100 - step / 2 + 0.5, hex);
    }
  }
  assert.equal(toneScale([0, 0, 0], steps).tints.length, steps);
  assert.equal(toneScale([1, 1, 1], steps).shades.length, steps);
});

test('long hue goes the other way round', () => {
  // Red (0°) to magenta (300°) the long way passes green (120°).
  const colours = interpolatePalette([[1, 0, 0], [1, 0, 1]], 3, { longHue: true });
  const h = hslStar.fromRgb(colours[1]).h;
  assert.ok(Math.abs(h - 150) < 2, `hue ${h}`);
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import hslStar, { toSrgb, fromSrgb } from '../hsl-star.js';

test('from HSL*: every form matches the functions', () => {
  const coords = { h: 18, l: 62, s: 0.9 };
  const c = hslStar(coords);
  assert.deepEqual(c.value, coords);
  const [r, g, b] = toSrgb(coords);
  assert.deepEqual(c.srgb, { r, g, b });
  assert.equal(c.hex, '#ee7231');
  assert.deepEqual(c.rgb, { r: 238, g: 114, b: 49 });
  assert.equal(c.rgb.g, 114);
  assert.equal(String(c), '#ee7231');
});

test('every input goes to its constructor', () => {
  const hex = '#ee7231';
  for (const c of [
    hslStar({ r: 238, g: 114, b: 49 }),
    hslStar([238, 114, 49]),
    hslStar(hex),
    hslStar('ee7231'),
    hslStar('rgb(238, 114, 49)'),
    hslStar.fromRgb({ r: 238, g: 114, b: 49 }),
    hslStar.fromSrgb([238 / 255, 114 / 255, 49 / 255]),
    hslStar.fromHex(hex),
    hslStar.fromCss('rgb(238, 114, 49)'),
  ]) {
    assert.equal(c.hex, hex);
  }
  // Arrays are 8-bit, whatever their values look like.
  assert.equal(hslStar([0.93, 0.45, 0.19]).hex, '#010000');
});

test('from RGB, sRGB or text: the exact values come back', () => {
  for (const hex of ['#0000ff', '#3a7bd5', '#00ff01', '#010203', '#ffffff']) {
    assert.equal(hslStar(hex).hex, hex);
    assert.equal(hslStar(hslStar(hex).rgb).hex, hex);
    assert.equal(hslStar.fromSrgb(hslStar(hex).srgb).hex, hex);
  }
  const srgb = toSrgb({ h: 18, l: 62, s: 0.9 });
  const [r, g, b] = srgb;
  assert.deepEqual(hslStar.fromSrgb(srgb).srgb, { r, g, b });
  assert.deepEqual(hslStar('#3a7bd5').value, fromSrgb([58 / 255, 123 / 255, 213 / 255]));
});

test('each constructor only takes its own format', () => {
  assert.throws(() => hslStar.fromRgb({ r: 300, g: 0, b: 0 }), RangeError);
  assert.throws(() => hslStar.fromSrgb([2, 0, 0]), RangeError);
  assert.throws(() => hslStar.fromHex('rgb(1, 2, 3)'));
  assert.throws(() => hslStar.fromCss('#123456'));
});

test('the hue axis follows the option', () => {
  const coords = { h: 200, l: 55, s: 0.7 };
  assert.equal(hslStar(coords).hex, hslStar(coords, { hue: 'oklab' }).hex);
  assert.notEqual(hslStar(coords).hex, hslStar(coords, { hue: 'hsv' }).hex);
  assert.ok(Math.abs(hslStar('#0000ff', { hue: 'hsv' }).value.h - 240) < 1e-9);
});

test('with() makes a new color and leaves the old one', () => {
  const c = hslStar({ h: 18, l: 62, s: 0.9 });
  const dark = c.with({ l: 30 });
  assert.deepEqual(dark.value, { h: 18, l: 30, s: 0.9 });
  assert.equal(c.value.l, 62);
  assert.ok(Object.isFrozen(c));
  // Changing what a getter returned doesn't change the color.
  c.value.l = 0;
  c.srgb.r = 0;
  assert.equal(c.value.l, 62);
  assert.equal(c.hex, '#ee7231');
});

test('out-of-range input is wrapped or clamped, bad input throws', () => {
  assert.deepEqual(hslStar({ h: 378, l: 120, s: 2 }).value, { h: 18, l: 100, s: 1 });
  for (const bad of ['nope', '#12345', [1, 2], { h: 1, l: 2 }, null, 42]) {
    assert.throws(() => hslStar(bad), undefined, String(bad));
  }
});

test('CSS hsl() is read as classic HSL, like a browser', () => {
  for (const [css, hex] of [
    ['hsl(120, 100%, 50%)', '#00ff00'],
    ['hsl(120 100% 50%)', '#00ff00'],
    ['hsl(120 100 50)', '#00ff00'],
    ['hsla(240, 100%, 50%)', '#0000ff'],
    ['hsl(0.5turn, 100%, 25%)', '#008080'],
    ['hsl(-60deg, 100%, 50%)', '#ff00ff'],
    ['hsl(20.6, 84.8%, 56.3%)', '#ee7231'],
    ['hsl(120, 150%, 50%)', '#00ff00'],
  ]) {
    assert.equal(hslStar(css).hex, hex, css);
    assert.equal(hslStar.fromCss(css).hex, hex, css);
  }
  assert.throws(() => hslStar('hsl(120, 100%, 50%, 0.5)'));
});

test('error messages say what went wrong', () => {
  assert.throws(() => hslStar('nope'), /as a color/);
  assert.throws(() => hslStar('#12345'), /as a hex code/);
  assert.throws(() => hslStar('rgb(300, 0, 0)'), /as CSS/);
  assert.throws(() => hslStar.fromHex('hsl(1, 2%, 3%)'), /as a hex code/);
});

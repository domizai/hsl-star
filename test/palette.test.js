import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fromRgb, toHex, parseColor } from '../src/hsl-star.js';
import { interpolatePalette, paletteToCss, paletteToJson, paletteToAse } from '../src/palette.js';

const stops = ['#1d3557', '#f7694f', '#f4e9b0'].map(parseColor);

test('palette has the requested length and passes through every stop', () => {
  const colours = interpolatePalette(stops, 21);
  assert.equal(colours.length, 21);
  assert.equal(toHex(colours[0]), '#1d3557');
  assert.equal(toHex(colours[10]), '#f7694f');
  assert.equal(toHex(colours[20]), '#f4e9b0');
});

test('lightness changes in even steps between stops', () => {
  const colours = interpolatePalette(stops, 21);
  const l = colours.map((c) => fromRgb(c).l);
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
  const h = fromRgb(colours[1]).h;
  assert.ok(h > 300 && h < 360, `hue ${h}`);
});

test('greys borrow the hue of their neighbour', () => {
  const colours = interpolatePalette([[0.5, 0.5, 0.5], [0, 0, 1]], 5);
  for (const c of colours.slice(1, 4)) {
    const { h } = fromRgb(c);
    assert.ok(Math.abs(h - 240) < 2, `hue ${h}`);
  }
});

test('stops are validated', () => {
  assert.throws(() => interpolatePalette([stops[0]], 5));
  assert.throws(() => interpolatePalette(stops, 2));
});

test('CSS and JSON export', () => {
  const colours = interpolatePalette(stops, 3);
  assert.equal(
    paletteToCss(colours),
    ':root {\n  --palette-1: #1d3557;\n  --palette-2: #f7694f;\n  --palette-3: #f4e9b0;\n}\n',
  );
  const json = JSON.parse(paletteToJson(colours));
  assert.equal(json.colours.length, 3);
  assert.deepEqual(json.colours[1].rgb, [247, 105, 79]);
  assert.equal(json.colours[1].name, '02 #f7694f');
});

test('ASE export has a valid structure', () => {
  const colours = interpolatePalette(stops, 3);
  const bytes = paletteToAse(colours, 'Test');
  const view = new DataView(bytes.buffer);
  assert.equal(String.fromCharCode(...bytes.slice(0, 4)), 'ASEF');
  assert.equal(view.getUint16(4), 1);
  assert.equal(view.getUint32(8), 5); // group start, 3 colours, group end

  // Walk the blocks and read the colours back.
  let o = 12;
  const types = [];
  const read = [];
  while (o < bytes.length) {
    const type = view.getUint16(o);
    const length = view.getUint32(o + 2);
    types.push(type);
    if (type === 0x0001) {
      const nameLength = view.getUint16(o + 6);
      const name = Array.from({ length: nameLength - 1 }, (_, i) => String.fromCharCode(view.getUint16(o + 8 + i * 2))).join('');
      const p = o + 8 + nameLength * 2;
      assert.equal(String.fromCharCode(...bytes.slice(p, p + 4)), 'RGB ');
      const rgb = [0, 1, 2].map((c) => Math.round(view.getFloat32(p + 4 + c * 4) * 255));
      read.push({ name, rgb, kind: view.getUint16(p + 16) });
    }
    o += 6 + length;
  }
  assert.equal(o, bytes.length);
  assert.deepEqual(types, [0xc001, 1, 1, 1, 0xc002]);
  assert.deepEqual(read[1], { name: '02 #f7694f', rgb: [247, 105, 79], kind: 2 });
});

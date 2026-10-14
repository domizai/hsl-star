// Palettes interpolated in HSL* between two or more colours, and export as
// CSS, JSON and Adobe Swatch Exchange (.ase, for Illustrator and InDesign).

import { fromRgb, toRgb, toHex, to8bit } from './hsl-star.js';

// Evenly spaced colours from the first stop to the last, passing through
// every stop. Lightness and saturation change linearly between stops, hue
// takes the shorter way round. Colours are gamma-encoded sRGB in [0, 1].
export function interpolatePalette(stops, steps, { hue = 'hsv' } = {}) {
  if (stops.length < 2) throw new Error('A palette needs at least two colours.');
  if (steps < stops.length) throw new Error('Use at least as many steps as colours.');
  const coords = stops.map((rgb) => fromRgb(rgb, { hue }));

  // Greys have no hue: borrow it from a neighbour so they don't swing to red.
  coords.forEach((c, i) => {
    if (c.s > 1e-6) return;
    const neighbour = coords.slice(i + 1).find((n) => n.s > 1e-6) ?? coords.slice(0, i).reverse().find((n) => n.s > 1e-6);
    if (neighbour) c.h = neighbour.h;
  });

  const segments = stops.length - 1;
  const colours = [];
  for (let i = 0; i < steps; i++) {
    const t = (i / (steps - 1)) * segments;
    const k = Math.min(Math.floor(t), segments - 1);
    const f = t - k;
    const a = coords[k];
    const b = coords[k + 1];
    let dh = b.h - a.h;
    if (dh > 180) dh -= 360;
    if (dh < -180) dh += 360;
    colours.push(
      toRgb({ h: a.h + f * dh, l: a.l + f * (b.l - a.l), s: a.s + f * (b.s - a.s) }, { hue }),
    );
  }
  // Snap the stops themselves to exactly the colours given.
  for (let k = 0; k <= segments; k++) {
    const i = (k / segments) * (steps - 1);
    if (Number.isInteger(i)) colours[i] = stops[k];
  }
  return colours;
}

const swatchName = (i, rgb) => `${String(i + 1).padStart(2, '0')} ${toHex(rgb)}`;

export function paletteToCss(colours, prefix = 'palette') {
  const lines = colours.map((rgb, i) => `  --${prefix}-${i + 1}: ${toHex(rgb)};`);
  return `:root {\n${lines.join('\n')}\n}\n`;
}

export function paletteToJson(colours, { hue = 'hsv' } = {}) {
  const data = colours.map((rgb, i) => {
    const { h, l, s } = fromRgb(rgb, { hue });
    return {
      name: swatchName(i, rgb),
      hex: toHex(rgb),
      rgb: to8bit(rgb),
      hslStar: { h: round(h, 2), l: round(l, 2), s: round(s, 4) },
    };
  });
  return JSON.stringify({ space: 'HSL*', hueAxis: hue, colours: data }, null, 2) + '\n';
}

const round = (v, digits) => Math.round(v * 10 ** digits) / 10 ** digits;

// Adobe Swatch Exchange, version 1.0. Big-endian. One group holding RGB
// process colours; names are UTF-16 with a terminating zero.
export function paletteToAse(colours, groupName = 'HSL* palette') {
  const blocks = [];
  const nameBytes = (name) => {
    const out = new Uint8Array((name.length + 1) * 2);
    for (let i = 0; i < name.length; i++) {
      out[i * 2] = name.charCodeAt(i) >> 8;
      out[i * 2 + 1] = name.charCodeAt(i) & 0xff;
    }
    return out;
  };

  const groupStart = () => {
    const name = nameBytes(groupName);
    const body = new Uint8Array(2 + name.length);
    new DataView(body.buffer).setUint16(0, groupName.length + 1);
    body.set(name, 2);
    return { type: 0xc001, body };
  };

  const colourBlock = (rgb, i) => {
    const label = swatchName(i, rgb);
    const name = nameBytes(label);
    const body = new Uint8Array(2 + name.length + 4 + 12 + 2);
    const view = new DataView(body.buffer);
    view.setUint16(0, label.length + 1);
    body.set(name, 2);
    let o = 2 + name.length;
    body.set([0x52, 0x47, 0x42, 0x20], o); // 'RGB '
    o += 4;
    // Write the 8-bit values, so the swatch matches the hex code exactly.
    to8bit(rgb).forEach((v, c) => view.setFloat32(o + c * 4, v / 255));
    view.setUint16(o + 12, 2); // normal (process) colour
    return { type: 0x0001, body };
  };

  blocks.push(groupStart(), ...colours.map(colourBlock), { type: 0xc002, body: new Uint8Array(0) });

  const size = 12 + blocks.reduce((sum, b) => sum + 6 + b.body.length, 0);
  const out = new Uint8Array(size);
  const view = new DataView(out.buffer);
  out.set([0x41, 0x53, 0x45, 0x46], 0); // 'ASEF'
  view.setUint16(4, 1);
  view.setUint16(6, 0);
  view.setUint32(8, blocks.length);
  let o = 12;
  for (const { type, body } of blocks) {
    view.setUint16(o, type);
    view.setUint32(o + 2, body.length);
    out.set(body, o + 6);
    o += 6 + body.length;
  }
  return out;
}

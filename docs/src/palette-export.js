// Export of HSL* palettes as CSS, JSON and Adobe Swatch Exchange (.ase, for
// Illustrator and InDesign).

import * as hslStar from './hsl-star.js';

// The exports take either a flat list of colours or rows of tones, one row
// per palette colour: { base, shades, tints } as toneScale gives them. Rows
// with tones are written in groups, one per palette colour, darkest shade
// first and lightest tint last.
function toGroups(colours) {
  const rows = colours.map((c) => (Array.isArray(c) ? { base: c, shades: [], tints: [] } : c));
  const number = (i) => String(i + 1).padStart(2, '0');
  const swatches = (row, i) => [
    ...row.shades.map((rgb, k) => ({ rgb, index: i, tone: k - row.shades.length })),
    { rgb: row.base, index: i, tone: 0 },
    ...row.tints.map((rgb, k) => ({ rgb, index: i, tone: k + 1 })),
  ];
  const grouped = rows.some((row) => row.shades.length || row.tints.length);
  if (!grouped) return { grouped, groups: [{ swatches: rows.flatMap(swatches) }] };
  return { grouped, groups: rows.map((row, i) => ({ name: `${number(i)} ${hslStar.toHex(row.base)}`, swatches: swatches(row, i) })) };
}

const toneLabel = (tone) => (tone < 0 ? `dark ${-tone}` : tone > 0 ? `light ${tone}` : '');
const swatchName = ({ rgb, index, tone }) =>
  [String(index + 1).padStart(2, '0'), toneLabel(tone), hslStar.toHex(rgb)].filter(Boolean).join(' ');

export function paletteToCss(colours, prefix = 'palette') {
  const { groups } = toGroups(colours);
  const blocks = groups.map(({ swatches }) =>
    swatches
      .map(({ rgb, index, tone }) => {
        const suffix = toneLabel(tone).replace(' ', '-');
        return `  --${prefix}-${index + 1}${suffix ? `-${suffix}` : ''}: ${hslStar.toHex(rgb)};`;
      })
      .join('\n'),
  );
  return `:root {\n${blocks.join('\n\n')}\n}\n`;
}

export function paletteToJson(colours, { hue = 'hsv' } = {}) {
  const { grouped, groups } = toGroups(colours);
  const entry = (swatch) => {
    const { h, l, s } = hslStar.fromRgb(swatch.rgb, { hue });
    return {
      name: swatchName(swatch),
      ...(grouped && { tone: swatch.tone }),
      hex: hslStar.toHex(swatch.rgb),
      rgb: hslStar.to8bit(swatch.rgb),
      hslStar: { h: round(h, 2), l: round(l, 2), s: round(s, 4) },
    };
  };
  const data = grouped
    ? { groups: groups.map(({ name, swatches }) => ({ name, colours: swatches.map(entry) })) }
    : { colours: groups[0].swatches.map(entry) };
  return JSON.stringify({ space: 'HSL*', hueAxis: hue, ...data }, null, 2) + '\n';
}

const round = (v, digits) => Math.round(v * 10 ** digits) / 10 ** digits;

// Adobe Swatch Exchange, version 1.0. Big-endian. Groups of RGB process
// colours, one for the whole palette or one per palette colour when it has
// tones; names are UTF-16 with a terminating zero.
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

  const groupStart = (label) => {
    const name = nameBytes(label);
    const body = new Uint8Array(2 + name.length);
    new DataView(body.buffer).setUint16(0, label.length + 1);
    body.set(name, 2);
    return { type: 0xc001, body };
  };

  const colourBlock = (swatch) => {
    const { rgb } = swatch;
    const label = swatchName(swatch);
    const name = nameBytes(label);
    const body = new Uint8Array(2 + name.length + 4 + 12 + 2);
    const view = new DataView(body.buffer);
    view.setUint16(0, label.length + 1);
    body.set(name, 2);
    let o = 2 + name.length;
    body.set([0x52, 0x47, 0x42, 0x20], o); // 'RGB '
    o += 4;
    // Write the 8-bit values, so the swatch matches the hex code exactly.
    hslStar.to8bit(rgb).forEach((v, c) => view.setFloat32(o + c * 4, v / 255));
    view.setUint16(o + 12, 2); // normal (process) colour
    return { type: 0x0001, body };
  };

  for (const group of toGroups(colours).groups) {
    const label = group.name ? `${groupName} ${group.name}` : groupName;
    blocks.push(groupStart(label), ...group.swatches.map(colourBlock), { type: 0xc002, body: new Uint8Array(0) });
  }

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

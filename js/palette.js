// HSL* palettes: gradients and evenly spaced steps between two or more
// colours, and the tints and shades of a colour.

import * as hslStar from './hsl-star.js';

// A continuous gradient through two or more colours. Returns a function of
// t in [0, 1] that gives gamma-encoded sRGB in [0, 1]; the stops sit at even
// intervals. Lightness and saturation change linearly between stops, hue
// takes the shorter way round, or the longer one with `longHue`.
export function paletteGradient(stops, { hue = 'hsv', longHue = false } = {}) {
  if (stops.length < 2) throw new Error('A palette needs at least two colours.');
  const coords = stops.map((rgb) => hslStar.fromRgb(rgb, { hue }));

  // Greys have no hue: borrow it from a neighbour so they don't swing to red.
  coords.forEach((c, i) => {
    if (c.s > 1e-6) return;
    const neighbour = coords.slice(i + 1).find((n) => n.s > 1e-6) ?? coords.slice(0, i).reverse().find((n) => n.s > 1e-6);
    if (neighbour) c.h = neighbour.h;
  });

  const segments = stops.length - 1;
  return (position) => {
    const t = Math.min(Math.max(position, 0), 1) * segments;
    const k = Math.min(Math.floor(t), segments - 1);
    const f = t - k;
    const a = coords[k];
    const b = coords[k + 1];
    let dh = b.h - a.h;
    if (dh > 180) dh -= 360;
    if (dh < -180) dh += 360;
    if (longHue && dh !== 0) dh -= Math.sign(dh) * 360;
    return hslStar.toRgb({ h: a.h + f * dh, l: a.l + f * (b.l - a.l), s: a.s + f * (b.s - a.s) }, { hue });
  };
}

// Evenly spaced colours from the first stop to the last, sampled from the
// gradient above.
export function interpolatePalette(stops, steps, options) {
  if (steps < stops.length) throw new Error('Use at least as many steps as colours.');
  const colourAt = paletteGradient(stops, options);
  const colours = Array.from({ length: steps }, (_, i) => colourAt(i / (steps - 1)));
  // Snap the stops themselves to exactly the colours given.
  const segments = stops.length - 1;
  for (let k = 0; k <= segments; k++) {
    const i = (k / segments) * (steps - 1);
    if (Number.isInteger(i)) colours[i] = stops[k];
  }
  return colours;
}

// Shades and tints of one colour: hue and saturation stay, lightness moves in
// even steps of 100 / (steps + 1) L*, so a black base gets `steps` tints and a
// white one `steps` shades. Black and white themselves are left out. Returns
// the shades darkest first and the tints lightest last.
export function toneScale(rgb, steps, { hue = 'hsv' } = {}) {
  const { h, s, l } = hslStar.fromRgb(rgb, { hue });
  const step = 100 / (steps + 1);
  const tone = (k) => hslStar.toRgb({ h, s, l: l + k * step }, { hue });
  // Half a step of slack, so a base just off a level doesn't add a near-black
  // or near-white swatch.
  const below = Math.max(0, Math.ceil(l / step - 0.5) - 1);
  const above = Math.max(0, Math.ceil((100 - l) / step - 0.5) - 1);
  return {
    shades: Array.from({ length: below }, (_, i) => tone(i - below)),
    tints: Array.from({ length: above }, (_, i) => tone(i + 1)),
  };
}

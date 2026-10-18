# HSL* JavaScript module

Two files with no dependencies: `hsl-star.js` holds the colour space, `palette.js` builds palettes on top of it and needs `hsl-star.js` next to it. Both are ES modules and run in current browsers and in Node 18 or later. Copy them into your project and import them by path.

```js
import * as hslStar from './hsl-star.js';

// HSL* to hex
const rgb = hslStar.toRgb({ h: 18, l: 62, s: 0.9 }); 
hslStar.toHex(rgb); // '#f7694f'

// Hex to HSL*
const blue = hslStar.parseRgb('#0000ff'); 
hslStar.fromRgb(blue); // { h: 240, l: 32.30…, s: 1 }

// HSL* to 8-bit sRGB
const green = hslStar.toRgb({ h: 120, l: 50, s: 1 });
hslStar.to8bit(green); // [0, 138, 50]
```

## Coordinates

| | Range | Meaning |
|---|---|---|
| `h` | 0–360 | Hue in degrees. Values outside wrap around. |
| `l` | 0–100 | Lightness as CIE L*. Colours with the same `l` convert to the same grey. |
| `s` | 0–1 | Saturation. 1 is the most vivid sRGB colour of that hue and lightness, 0 the grey of the same lightness. Not a percentage. |

`l` and `s` outside their range are clamped. RGB values are arrays `[r, g, b]` with channels in 0–1.

## Hue axis

The functions that take or return a hue accept an option `{ hue }`:

- `'hsv'` (default): the hue of HSV and HSL, so 0 is red, 120 green, 240 blue.
- `'oklab'`: the same hues re-spaced so that equal steps look like roughly equal changes of hue, following OKLab. 0 is still red. Pure blues, which OKLab sees as almost one hue, are kept from collapsing, so the axis is close to OKLab but not exact.

Use the same option for `toRgb` and `fromRgb`, or the hue will shift. `toHsvHue(h, mode)` and `fromHsvHue(h, mode)` convert a hue between the two axes. `HUE_MODES` lists the valid names.

## Edge cases

- Greys have no hue. `fromRgb` returns them as `{ h: 0, s: 0 }`. If you keep a colour in HSL* while editing it, hold on to the previous hue when `s` reaches 0.
- Every colour HSL* produces lies inside sRGB, and every sRGB colour maps back to exactly one `{ h, l, s }`. Hex output rounds to 8 bits per channel, so a colour read back from its hex code can differ by a few tenths in `l` and `s`.
- `parseRgb` returns `null` for input it can't read.

## Functions

### Converting

`toRgb({ h, l, s }, { hue })`\
HSL* to gamma-encoded sRGB.

`fromRgb(rgb, { hue })`\
Gamma-encoded sRGB to `{ h, l, s }`.

`toLinear({ h, l, s }, { hue })`\
HSL* to linear-light sRGB.

`fromLinear(rgb, { hue })`\
Linear-light sRGB to `{ h, l, s }`.

`hueBasis(h, { hue })`\
Everything that depends on hue alone. Compute it once per hue, for example per column when drawing a plane, and pass it to `basisToLinear`.

`basisToLinear(basis, l, s)`\
Linear-light sRGB for a basis from `hueBasis`. Call it per pixel.

### Hue

`toHsvHue(h, mode)`\
Hue on the given axis to an HSV hue.

`fromHsvHue(h, mode)`\
HSV hue to a hue on the given axis.

`pureHue(h)`\
The fully saturated colour of an HSV hue (S = V = 1), gamma-encoded.

`oklabHue(rgb)`\
OKLab hue angle of a linear-light colour.

### Lightness and transfer function

`decode(c)`\
One sRGB channel, gamma-encoded to linear light.

`encode(c)`\
One channel, linear light to gamma-encoded. Clamps to 0–1.

`luminance(rgb)`\
Relative luminance Y of a linear-light colour (Rec. 709 weights).

`lstarFromY(y)`\
Luminance to CIE L*.

`yFromLstar(l)`\
CIE L* to luminance.

### CIELAB

`linearToLab(rgb)`\
Linear-light sRGB to `[L*, a*, b*]`, D65 white.

`linearToXyz(rgb)`\
Linear-light sRGB to CIE XYZ.

`xyzToLab(xyz, white)`\
CIE XYZ to `[L*, a*, b*]`. `white` defaults to `D65_WHITE`.

### Formatting and parsing

`toHex(rgb)`\
`'#rrggbb'`.

`toRgbString(rgb)`\
`'rgb(r, g, b)'` with 0–255 channels.

`to8bit(rgb)`\
`[r, g, b]` with 0–255 integer channels.

`parseRgb(text)`\
Reads `#rgb`, `#rrggbb` (the `#` is optional), `rgb(r, g, b)` and `r, g, b` with 0–255 channels. Returns gamma-encoded `[r, g, b]` or `null`.

## Palettes

`palette.js` blends colours in HSL*: lightness and saturation change linearly, so the steps between two colours look even. Colours go in and come out as gamma-encoded sRGB.

```js
import * as hslStar from './hsl-star.js';
import { interpolatePalette, toneScale } from './palette.js';

const stops = ['#1d3557', '#f7694f'].map(hslStar.parseRgb);
interpolatePalette(stops, 5).map(hslStar.toHex);
// ['#1d3557', '#3327d7', '#9d2fb4', '#e63369', '#f7694f']

const { shades, tints } = toneScale(stops[1], 4);
shades.map(hslStar.toHex); // ['#621d0c', '#b03b1d']
tints.map(hslStar.toHex);  // ['#fabdb7']
```

All three functions take the `{ hue }` option of the colour space.

`paletteGradient(stops, { hue, longHue })`\
A continuous gradient through two or more colours, spaced evenly. Returns a function that takes a position from 0 to 1 and gives the colour there. Hue takes the shorter way round the circle, or the longer one with `longHue: true`. Greys take the hue of their neighbour, so they don't swing through red.

`interpolatePalette(stops, steps, { hue, longHue })`\
`steps` evenly spaced colours from the first stop to the last, sampled from `paletteGradient`. Stops that fall exactly on a step are returned unchanged. Throws if there are fewer than two stops or fewer steps than stops.

`toneScale(rgb, steps, { hue })`\
The shades and tints of a colour, as `{ shades, tints }`, shades darkest first and tints lightest last. Hue and saturation stay; lightness moves in steps of 100 / (steps + 1) L*, without black and white. A black colour gets `steps` tints, a white one `steps` shades, and anything in between fewer of each, depending on its lightness.

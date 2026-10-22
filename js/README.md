# HSL* JavaScript module

One file with no dependencies, `hsl-star.js`. It is an ES module and runs in current browsers and in Node 18 or later. Copy it into your project and import it by path. For TypeScript and editor hints, copy `hsl-star.d.ts` next to it.

```js
import hslStar from './hsl-star.js';

const colour = hslStar({ h: 18, l: 62, s: 0.9 });
colour.hex;    // '#ee7231'
colour.rgb;    // { r: 238, g: 114, b: 49 }

const blue = hslStar('#0000ff');
blue.value;    // { h: 237.6…, l: 32.30…, s: 1 }
blue.value.l;  // 32.30…

colour.with({ l: 30 }).hex;  // '#743412', same hue and saturation
```

Or load it from jsDelivr without copying anything:

```js
import hslStar from 'https://cdn.jsdelivr.net/gh/domizai/hsl-star@v0.2.0/js/hsl-star.js';
```

Add `.min` before `.js` for a minified copy, e.g. `hsl-star.min.js`.

# Coordinates

| | Range | Meaning |
|---|---|---|
| `h` | 0–360 | Hue in degrees. Values outside wrap around. |
| `l` | 0–100 | Lightness as CIE L*. Colours with the same `l` convert to the same grey. |
| `s` | 0–1 | Saturation. 1 is the most vivid sRGB colour of that hue and lightness, 0 the grey of the same lightness. Not a percentage. |

`l` and `s` outside their range are clamped. The functions below take and return sRGB as arrays `[r, g, b]` with channels in 0–1.

# Hue axis

The functions that take or return a hue accept an option `{ hue }`:

- `'oklab'` (default): the hues of HSV re-spaced so that equal steps look like roughly equal changes of hue, following OKLab. 0 is still red. Pure blues, which OKLab sees as almost one hue, are kept from collapsing, so the axis is close to OKLab but not exact.
- `'hsv'`: the hue of HSV and HSL, so 0 is red, 120 green, 240 blue.

Use the same option for `toSrgb` and `fromSrgb`, or the hue will shift. `toHsvHue(h, { hue })` and `fromHsvHue(h, { hue })` convert a hue between the HSV axis and the given one. `HUE_MODES` lists the valid names.

# Colour object

Throughout the library, **rgb** means 8-bit channels, 0–255, and **srgb** means gamma-encoded channels, 0–1.

`hslStar(input, { hue })` makes a colour and returns an object that reads it in every form. It takes HSL* coordinates `{ h, l, s }` itself and hands everything else to a constructor:

- `{ r, g, b }` or `[r, g, b]` → `hslStar.fromRgb`, 8-bit. An array is always read as 8-bit, even `[0.93, 0.45, 0.19]`.
- text starting with `rgb(` → `hslStar.fromCss`
- other text → `hslStar.fromHex`: `'#ee7231'` or `'#e73'`, the `#` optional

The constructors can be called directly as well. `hslStar.fromSrgb` is the one way in for sRGB 0–1, `{ r, g, b }` or `[r, g, b]`, for example arrays from `toSrgb`. Each takes only its own format and throws for anything else, including channels out of range.

The object never changes. Each form is worked out once, the first time it's read:

`value`\
HSL* coordinates `{ h, l, s }` on the colour's hue axis.

`rgb`\
8-bit RGB, `{ r, g, b }` with 0–255 channels.

`srgb`\
Gamma-encoded sRGB, `{ r, g, b }` in 0–1, unrounded.

`linear`\
Linear-light sRGB, `{ r, g, b }` in 0–1.

`hex`\
`'#rrggbb'`. Also what the colour turns into as a string.

`with(changes)`\
A new colour with some coordinates changed, e.g. `colour.with({ l: 30 })`.

A colour made from RGB, sRGB or text keeps those exact values: `hslStar('#3a7bd5').hex` is always `'#3a7bd5'`, without a detour through HSL*. So do round trips: `hslStar(colour.rgb)` gives the same 8-bit colour, `hslStar.fromSrgb(colour.srgb)` the exact one.

# Edge cases

- Greys have no hue. `fromSrgb` returns them as `{ h: 0, s: 0 }`. If you keep a colour in HSL* while editing it, hold on to the previous hue when `s` reaches 0.
- Every colour HSL* produces lies inside sRGB, and every sRGB colour maps back to exactly one `{ h, l, s }`. Hex output rounds to 8 bits per channel, so a colour read back from its hex code can differ by a few tenths in `l` and `s`.
- `hslStar()` throws for input it can't read, `parseSrgb` returns `null`.

# Functions

The colour object is built on these. They work on plain numbers and arrays, which makes them the faster choice for many colours at once, like drawing a whole plane pixel by pixel. Import them by name: `import { toSrgb, hueBasis } from './hsl-star.js'`. Note that the function `fromSrgb` returns HSL* coordinates, while the constructor `hslStar.fromSrgb` returns a colour object.

## Converting

`toSrgb({ h, l, s }, { hue })`\
HSL* to gamma-encoded sRGB.

`fromSrgb(srgb, { hue })`\
Gamma-encoded sRGB to `{ h, l, s }`.

`toLinear({ h, l, s }, { hue })`\
HSL* to linear-light sRGB.

`fromLinear(rgb, { hue })`\
Linear-light sRGB to `{ h, l, s }`.

`hueBasis(h, { hue })`\
Everything that depends on hue alone. Compute it once per hue, for example per column when drawing a plane, and pass it to `basisToLinear`.

`basisToLinear(basis, l, s)`\
Linear-light sRGB for a basis from `hueBasis`. Call it per pixel.

## Hue

`toHsvHue(h, { hue })`\
Hue on the given axis to an HSV hue. With `'hsv'` it only wraps the hue to 0–360.

`fromHsvHue(h, { hue })`\
HSV hue to a hue on the given axis.

`pureHue(h)`\
The fully saturated colour of an HSV hue (S = V = 1), gamma-encoded.

`oklabHue(rgb)`\
OKLab hue angle of a linear-light colour.

## Lightness and transfer function

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

## Formatting and parsing

`toHex(rgb)`\
`'#rrggbb'`.

`to8bit(rgb)`\
`[r, g, b]` with 0–255 integer channels.

`parseSrgb(text)`\
Reads `#rgb`, `#rrggbb` (the `#` is optional), `rgb(r, g, b)` and `r, g, b` with 0–255 channels. Returns gamma-encoded `[r, g, b]` or `null`.

# Changes from 0.1

- New: the colour object, `hslStar()` and its constructors.
- The default hue axis is now `'oklab'`. Pass `{ hue: 'hsv' }` for the old results.
- Renamed, because they work with sRGB 0–1: `toRgb` → `toSrgb`, `fromRgb` → `fromSrgb`, `parseRgb` → `parseSrgb`.
- Removed: `toRgbString`. The hex code is valid CSS, and `.rgb` gives the numbers for `rgb()`.
- Removed: `linearToXyz`, `xyzToLab`, `linearToLab` and `D65_WHITE`. CIELAB isn't part of HSL*.
- Removed: `palette.js`. It belongs to the picker, which builds its palettes with the library.

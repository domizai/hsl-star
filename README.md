# HSL*

A colour space and picker on top of sRGB in which every horizontal row has the
same perceived lightness. Converted to grey, each row of the picker is one
flat tone.

## Background

### The problem with HSV

In an HSV picker, hue runs across and value (V) runs up and down. Colours with
the same V don't look equally light. Measured as CIE L* (0 = black,
100 = white):

| | Grey | Red | Yellow | Green | Cyan | Blue | Magenta |
|---|---|---|---|---|---|---|---|
| V = 1.0 | 100 | 53 | 97 | 88 | 91 | 32 | 60 |
| V = 0.5 | 53 | 25 | 52 | 46 | 48 | 13 | 30 |

The top row of HSV alone spans almost the whole lightness range, from blue at
32 to yellow at 97. Converted to grey, an HSV picker looks like a mountain range,
not a set of even bands.

### The idea

Keep the HSV hue axis, but move every colour up or down so that each row has
one lightness. Each pure hue then sits at its own lightness: yellow near the
top, blue near the bottom. Below that point the colour is darkened towards
black, as in HSV. Above it, where HSV has no fully saturated colours, it is
mixed with white. This fills the whole rectangle from black to white with no
gaps, and a grayscale conversion of the picker gives perfectly even bands.

Saturation then mixes that vivid colour with the grey of the same lightness,
so lightness stays fixed while saturation changes.

### Prior art

The geometry isn't new. HSL* is a close relative of **HCY** (hue, chroma,
luma) by Kuzma Shapran, published as shader code by
[Chilliant](https://www.chilliant.com/rgb2hsv.html). HCY also uses the HSV
hue and scales chroma relative to the luma of the pure hue with the same
formula, so for each hue the set of colours is the same.

HSL* differs in how the lightness is computed:

| | HCY (Chilliant) | HSL* |
|---|---|---|
| Computed on | RGB as given, usually gamma-encoded | Linear light |
| Weights | Rec. 601 (0.299, 0.587, 0.114) | sRGB / Rec. 709 (0.2126, 0.7152, 0.0722) |
| Vertical axis | Luma Y | CIE L* |
| Hue axis | HSV hue | HSV hue, optionally re-spaced to even OKLab hue |

Used the usual way, on gamma-encoded sRGB, HCY rows are only roughly even.
At full chroma, the row at Y = 0.5 ranges from L* 53 to 76 across hues. HSL*
rows have the same L* to within floating-point precision. The price is a few
power functions per pixel, which matters in a shader but not in a picker.

### HCY or HSL*?

HCY is better when speed and simplicity count:

- It needs only a handful of multiplications per colour, with no power
  functions or cube roots. That's what it was made for: pixel shaders that
  run on every pixel of every frame.
- It works directly on gamma-encoded values, so it fits into an existing
  pipeline without converting to linear light and back.
- The code is shorter, and several implementations already exist.

HSL* is better when the lightness has to be right:

- Rows are exactly equal in lightness. HCY rows can differ by up to about
  23 L* across hues.
- The luminance weights match the sRGB primaries. Rec. 601 weights come from
  standard-definition TV.
- The vertical axis is CIE L*, so equal steps look like equal changes in
  lightness. Equal steps of luma crowd together at the dark end.
- The grey preview matches a CIE L* conversion, so lightness relationships
  you see in the picker hold up when a design is converted to grey.
- The hue axis can optionally be re-spaced to even OKLab hue steps.

Both share the same weaknesses: tints drift slightly in perceived hue, very
saturated colours look a little brighter than their L* suggests, and both are
limited to sRGB.

Other related work:

- [KDE's HCY](https://phabricator.kde.org/D27017) and
  [Krita's HSY′ selector](https://docs.krita.org/reference_manual/dockers/advanced_color_selector.html)
  also work in linear RGB.
- [HSLuv](https://hsluv.org/math) uses the same idea of saturation as a
  share of the maximum sRGB chroma at a given lightness and hue, but is built
  on CIELUV, so its hue axis is different.
- [Okhsl](https://bottosson.github.io/posts/colorpicker/) by Björn Ottosson
  (2021) applies the principle to OKLab. It keeps perceived hue more constant
  when a colour is tinted or shaded, which HSL* doesn't (see Known limits).

HSL* sits between these: exact CIE L* rows that match a standard grayscale
conversion, the familiar HSV hue axis, and the pure sRGB primaries at full
saturation.

## Coordinates

| | Range | Meaning |
|---|---|---|
| `h` | 0–360 | Hue. HSV hue by default; optionally re-spaced to even OKLab hue steps. |
| `l` | 0–100 | Perceived lightness, CIE L*. |
| `s` | 0–1 | Saturation. 1 is the most vivid sRGB colour of that hue and lightness, 0 the grey of the same lightness. |

Below a hue's own lightness the pure colour is darkened towards black; above
it, it is mixed with white. All mixing happens in linear light, so the maths
is closed form and exactly invertible.

## Library

`src/hsl-star.js` is a dependency-free ES module.

```js
import { toRgb, fromRgb, toHex, parseColor } from './src/hsl-star.js';

toHex(toRgb({ h: 18, l: 62, s: 0.9 }));            // '#f7694f'
fromRgb(parseColor('#0000ff'));                   // { h: 240, l: 32.3, s: 1 }
toRgb({ h: 120, l: 50, s: 1 }, { hue: 'oklab' }); // perceptual hue axis
```

`toRgb` and `fromRgb` work with gamma-encoded sRGB channels in [0, 1].
`toLinear`/`fromLinear` do the same in linear light. For rendering whole
planes, compute `hueBasis(h)` once per column and call `basisToLinear` per
pixel.

### Perceptual hue axis

With `{ hue: 'oklab' }` the hue axis is re-spaced so equal steps are roughly
equal steps of OKLab hue, with red at 0°. Only the axis changes: the set of
colours is identical to the HSV mode. OKLab sees the pure blues between about
HSV 222° and 242° as nearly one hue, so the mapping gives them a minimum width
of about 5° to keep them reachable. The steps elsewhere deviate from perfectly
even OKLab steps by up to about 3°.

### Optimal colour solid

`src/optimal-solid.js` computes the optimal colour solid (Rösch–MacAdam
solid) under D65 in CIELAB: every surface colour that is physically possible.
`optimalSolidMesh()` returns its surface and `optimalSolidContours(levels)`
horizontal cuts at given L* values. It uses the CIE 1931 2° colour-matching
functions in the multi-lobe fit by Wyman, Sloan and Shirley (2013) and the
CIE D65 spectrum at 5 nm. The tests check that this reproduces the D65 white
point and that the whole sRGB solid lies inside it. It comes closest at high
lightness around cyan, where sRGB is about 2 chroma units from the physical
limit at L* 90.

`linearToLab`, `linearToXyz` and `xyzToLab` in `src/hsl-star.js` convert to
CIELAB with the D65 white.

### Palettes

`src/palette.js` interpolates between two or more colours in HSL*:
`interpolatePalette(stops, steps, { hue })` returns `steps` colours running
through every stop. Lightness and saturation change linearly, hue takes the
shorter way round. A stop is hit exactly when `(steps − 1)` is divisible by
`(stops − 1)`, for example 21 steps for 3 colours.

Exports: `paletteToCss` (custom properties), `paletteToJson` (hex, RGB and
HSL* coordinates) and `paletteToAse` (Adobe Swatch Exchange with RGB process
colours in one group, for Illustrator and InDesign).

## Picker

Static page: `index.html`, `app.js`, `solid-view.js`, `style.css`. It has the
hue × lightness field, a saturation × lightness square for the current hue,
and a 3D view of the HSL* solid in CIELAB with the optimal colour solid as an
outline. All of them stay in sync. ES modules need a web server, so open it
through one:

```bash
npm run serve
```

Then go to http://localhost:8000.

## Tests

```bash
npm test
```

Uses Node's built-in test runner (Node 18 or later).

## Known limits

- sRGB only. Display P3 or print would need their own gamut.
- CIE L* doesn't model the Helmholtz–Kohlrausch effect: very saturated reds,
  magentas and blues look slightly brighter than a grey with the same L*.
- Tints of a hue can drift slightly in perceived hue (blue towards lavender),
  because hue is held constant in RGB terms, not perceptually.

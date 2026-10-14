# Equal-lightness colour space

A colour space and picker on top of sRGB in which every horizontal row has the
same perceived lightness. Converted to grey, each row of the picker is one
flat tone.

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

`src/color-space.js` is a dependency-free ES module.

```js
import { toRgb, fromRgb, toHex, parseColor } from './src/color-space.js';

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

## Picker

Static page: `index.html`, `app.js`, `style.css`. ES modules need a web
server, so open it through one:

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

# HSL* JavaScript module

The HSL* color space as a single ES module, [hsl-star.js](./hsl-star.js), with no dependencies. Read more about the HSL* color space [here](../README.md).

Some examples:

```js
import hslStar from './hsl-star.js';

let col = hslStar({ h: 18, s: 0.9, l: 62 });
col.value;  // { h: 18, s: 0.9, l: 62 }
col.hex;    // '#ee7231'
col.rgb;    // { r: 238, g: 114, b: 49 }
col.srgb;   // { r: 0.935, g: 0.446, b: 0.191 }
col.linear; // { r: 0.858, g: 0.167, b: 0.03 }

// change lightness
col = col.with({ l: 30 });

// Supported input formats
col = hslStar('#0000ff');
col = hslStar('rgb(0, 0, 255)');
col = hslStar({ r: 0, g: 0, b: 255 });
col = hslStar([0, 0, 255]);

// fromSrgb is the only way in for 0–1 values.
col = hslStar.fromSrgb([1, 0, 1]);
```

Or load it from jsDelivr without copying anything:

```js
import hslStar from 'https://cdn.jsdelivr.net/gh/domizai/hsl-star@latest/js/hsl-star.min.js';
```

For TypeScript and editor hints, copy [hsl-star.d.ts](./hsl-star.d.ts) next to it.


# Properties

`hslStar(input, { hue })` makes a color from HSL* coordinates `{ h, l, s }`, 8-bit RGB as `{ r, g, b }` or `[r, g, b]` with channels from 0 to 255, a hex code, or CSS `rgb()` and `hsl()`. CSS `hsl()` is read as classic HSL, the way a browser reads it, not as HSL*. Gamma-encoded sRGB in 0–1 goes through `hslStar.fromSrgb()`. Every way in throws an error if the input can't be read.

```ts
hslStar(input: HslStar | Channels | number[] | string, options?: HueOptions): Color

// 8-bit RGB, 0–255
hslStar.fromRgb(rgb: Channels | number[], options?: HueOptions): Color

// Gamma-encoded sRGB, 0–1, kept exactly
hslStar.fromSrgb(srgb: Channels | number[], options?: HueOptions): Color

// '#rrggbb' or '#rgb', the # optional
hslStar.fromHex(hex: string, options?: HueOptions): Color

// CSS rgb() with 0–255 channels, or hsl() as classic HSL
hslStar.fromCss(css: string, options?: HueOptions): Color
```

The color never changes. Each of its forms is worked out the first time it's read, and a color made from RGB, sRGB or a hex code keeps those exact values.

```ts
// HSL* coordinates on the color's hue axis
color.value: HslStar

// 8-bit RGB, 0–255
color.rgb: Channels

// Gamma-encoded sRGB, 0–1, unrounded
color.srgb: Channels

// Linear-light sRGB, 0–1
color.linear: Channels

// '#rrggbb', also what the color turns into as a string
color.hex: string

// A new color with some coordinates changed, e.g. color.with({ l: 30 })
color.with(changes: Partial<HslStar>): Color
```

# Functions

The color object is built on these functions. They work on plain numbers and arrays, which makes them the faster choice for many colors at once, for example when drawing a whole plane pixel by pixel. Import them by name. See [types](#types) definition below.

```js
import { toSrgb, hueBasis } from './hsl-star.js';
```

**Converting**

```ts
// HSL* to gamma-encoded sRGB
toSrgb(coords: HslStar, options?: HueOptions): Rgb

// Gamma-encoded sRGB to HSL*. Greys come back with h 0 and s 0.
fromSrgb(srgb: Rgb, options?: HueOptions): HslStar

// HSL* to linear-light sRGB
toLinear(coords: HslStar, options?: HueOptions): Rgb

// Linear-light sRGB to HSL*
fromLinear(linear: Rgb, options?: HueOptions): HslStar

// Everything that depends on hue alone, the pure color in linear light and
// its luminance. Compute it once per hue, for example per column of a plane.
hueBasis(h: number, options?: HueOptions): { pure: Rgb; y: number }

// Linear-light sRGB for a basis from hueBasis. Call it per pixel.
basisToLinear(basis: { pure: Rgb; y: number }, l: number, s: number): Rgb
```

**Hue**

```ts
// Hue on the given axis to an HSV hue. With 'hsv' it only wraps the hue to 0–360.
toHsvHue(h: number, options?: HueOptions): number

// HSV hue to a hue on the given axis
fromHsvHue(h: number, options?: HueOptions): number

// The fully saturated color of an HSV hue (S = V = 1), gamma-encoded
pureHue(h: number): Rgb

// OKLab hue angle of a linear-light color, 0–360
oklabHue(linear: Rgb): number
```

**Lightness and transfer function**

```ts
// One sRGB channel, gamma-encoded to linear light
decode(c: number): number

// One channel, linear light to gamma-encoded. Clamps to 0–1.
encode(c: number): number

// Relative luminance Y of a linear-light color, Rec. 709 weights
luminance(linear: Rgb): number

// Luminance to CIE L*
lstarFromY(y: number): number

// CIE L* to luminance
yFromLstar(l: number): number
```

**Formatting and parsing**

```ts
// '#rrggbb'
toHex(srgb: Rgb): string

// 8-bit channels, 0–255 integers
to8bit(srgb: Rgb): Rgb

// Reads #rgb, #rrggbb (the # optional), rgb(r, g, b), "r, g, b" with
// 0–255 channels, and CSS hsl() as classic HSL. Returns null if it can't.
parseSrgb(text: string): Rgb | null
```

# Types

The signatures above use these names. They're the same as in [hsl-star.d.ts](./hsl-star.d.ts).

```ts
type HslStar = { h: number; l: number; s: number };  // h 0–360, l 0–100 (CIE L*), s 0–1
type Rgb = [r: number, g: number, b: number];        // sRGB or linear light, 0–1
type Channels = { r: number; g: number; b: number };
type HueOptions = { hue?: 'oklab' | 'hsv' };         // hue axis, 'oklab' by default
```
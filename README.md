# HSL*

A simple colour space built on sRGB with perceptual lightness and perceptually spaced hue. HSL* replaces the lightness of HSL with CIE L* and defines saturation relative to the sRGB gamut at a given hue and lightness, and uses OkLab hue for the hue coordinate.


## Motivation

In an HSL picker, hues at the same height don't look perceptually equal and hue steps are also not perceptually uniform.

![HSL compared with HSL*](assets/hsl-vs-hsl-star.png)

Top: HSL at full saturation, and the same plane converted to grey. Bottom: HSL* at full saturation, and its grey conversion.

## Goals

- **Consistent lightness.** All colours in a row of the picker share the same lightness, whatever their hue or saturation: two colours with the same `l` have the same luminance, so they convert to the same grey.
- **Intuitive saturation.** Saturation runs from the neutral grey of that lightness (s = 0) to the edge of the sRGB gamut (s = 1). Every (h, l, s) in range is a real sRGB colour, without clipping.
- **Simple, invertible coordinates.** HSL* and sRGB convert into each other in closed form. Every sRGB colour has exactly one coordinate, and the conversion back is exact (except for greys, which have no hue).

## Limitations

- **Saturation isn't perceptually uniform.** It's a share of what sRGB can show at that hue and lightness, not a measure of colourfulness: at L* 40, a fully saturated blue is more than twice as colourful as a fully saturated yellow, at L* 80 the other way round.
- **Hue is only roughly even.** Shades of a hue can drift slightly in perceived hue (especially for blues).
- **L* has known limits.** It doesn't model the Helmholtz–Kohlrausch effect: very saturated reds, magentas and blues look slightly lighter than a grey with the same L*.
- **sRGB only.** Display P3 or print would need their own gamut.


## Coordinates

- h: hue, OkLab hue [0–360]
- `l`: lightness, CIE L* [0–100]
- `s`: saturation [0–1]

## Luminance and lightness

Everything below works with the relative luminance Y, from 0 for black to 1 for white. Y can be reached from either side, and the conversions use both:

**From an RGB colour.** Each gamma-encoded sRGB channel C′ is first linearised. The standard sRGB transfer function is used.

$$
C = \begin{cases} C' / 12.92 & C' \le 0.04045 \\ \left(\dfrac{C' + 0.055}{1.055}\right)^{2.4} & \text{otherwise} \end{cases}
$$

Y is then the weighted sum of the linear channels, with the Rec. 709 weights of sRGB:

$$
Y = 0.2126\,R + 0.7152\,G + 0.0722\,B
$$

**From a lightness.** The luminance a given L* needs comes from the inverse of the CIE lightness formula, with $κ$ = 24389/27 ≈ 903.3:

$$
Y = \begin{cases} \left(\dfrac{L^* + 16}{116}\right)^3 & L^* > 8 \\ L^* / \kappa & \text{otherwise} \end{cases}
$$

The other way round, with $ε$ = 216/24389 ≈ 0.008856:

$$
L^* = \begin{cases} 116\,\sqrt[3]{Y} - 16 & Y > \varepsilon \\ \kappa\,Y & \text{otherwise} \end{cases}
$$

Because Y is a weighted sum of linear channels, and the weights add up to 1, scaling a colour scales its Y, and mixing two colours mixes their Y in the same proportion. 

## From HSL* to sRGB

All mixing happens in linear light. Vectors are linear RGB, and Y on its own stands for the grey (Y, Y, Y).

1. **Pure colour.** The hue h is turned into an HSV hue (see [Hue axis](#hue-axis)). The pure colour of that hue, HSV (h, 1, 1), linearised, is p. Its luminance is Y<sub>p</sub>, the lightness at which that hue is most vivid.

2. **Target luminance.** Y follows from L*, as above.

3. **Most vivid colour at that luminance.** Below the pure colour, darken it; above it, mix it with white:

   $$
   v = \begin{cases} \dfrac{Y}{Y_p}\,p & Y \le Y_p \\ (1 - t)\,p + t & Y > Y_p, \quad t = \dfrac{Y - Y_p}{1 - Y_p} \end{cases}
   $$

   v has luminance Y in both cases, and it lies on the edge of the sRGB gamut: below Y<sub>p</sub> one channel is 0, above it one channel is 1.

4. **Saturation.** Mix with the grey of the same luminance:

   $$
   c = s\,v + (1 - s)\,Y
   $$

   The luminance stays Y.

5. **Output.** Encode each channel of c with the sRGB transfer function:

   $$
   C' = \begin{cases} 12.92\,C & C \le 0.0031308 \\ 1.055\,C^{1/2.4} - 0.055 & \text{otherwise} \end{cases}
   $$

Every step keeps the luminance at exactly Y, which is why every colour with the same L* has the same luminance.

## From sRGB to HSL*

1. **Linear light.** Linearise the channels, giving c.

2. **Lightness.** Y = 0.2126 R + 0.7152 G + 0.0722 B, and L* from Y, as above.

3. **Channel range.** With m = min(c) and M = max(c), the range is r = M − m. If r = 0, the colour is a grey: s = 0, and the hue is undefined (0).

4. **Hue.** In the forward direction, c is a scaled pure colour plus a grey part. Removing the grey part and the scaling gives the pure colour back:

   $$
   p = \frac{c - m}{r}
   $$

   Encoded, p is an HSV colour with S = V = 1, and its HSV hue is the hue, converted to the hue axis in use.

5. **Saturation.** The most vivid colour of that hue and luminance has the channel range

   $$
   r_{\max} = \begin{cases} Y / Y_p & Y \le Y_p \\ (1 - Y) / (1 - Y_p) & Y > Y_p \end{cases}
   $$

   and mixing with grey scales the range by s, so

   $$
   s = \frac{r}{r_{\max}}
   $$

Each step undoes one step of the forward direction, in closed form, without iteration.

## Hue axis

By default h is the HSV hue re-spaced by OKLab hue (`oklab`), so that equal steps look roughly equal. It measures the OKLab hue of each pure colour once and moves the columns accordingly. This only reorders the columns: colours are still built as above, so tints and shades can drift slightly in hue. The plain HSV hue (`hsv`), whose steps don't look even, is available as an option. Use the same axis in both directions.

## HSLuv, Okhsl and HSL*

All three give an HSL-like interface with perceptually meaningful lightness and saturation limited to the sRGB gamut. They differ in where hue and saturation come from, and how much work the gamut boundary takes.

| | HSLuv | Okhsl | HSL* |
|---|---|---|---|
| Built on | CIELUV | OKLab | sRGB in linear light |
| Lightness | CIE L* | OKLab lightness with a toe function, close to CIE L* | CIE L* |
| Rows of equal lightness | Exact | Close | Exact |
| Hue | CIELUV hue angle | OKLab hue | HSV hue, spaced by OKLab |
| Hue of tints and shades | Constant in CIELUV | Constant in OKLab | Can drift slightly |
| Saturation | CIELUV chroma as a share of the most the gamut allows | Chroma, interpolated through fitted values to behave evenly | Linear mix between grey and the most vivid sRGB colour |
| Gamut boundary | Ray intersected with six lines per lightness | Approximated with fitted functions | Built into the construction |

**HSLuv** ([hsluv.org](https://www.hsluv.org/math/)) has the same lightness as HSL*: both use CIE L*, so both give rows of exactly equal lightness. But HSLuv isn't built on sRGB the way HSL* is. It defines hue, lightness and chroma in the device-independent CIELUV, and only then limits the result to sRGB: saturation is the chroma as a share of the maximum at that lightness and hue, which it finds by intersecting the hue's ray with the six lines where an RGB channel leaves its range. That keeps the hue constant through tints and shades, but every conversion goes through XYZ and CIELUV, and the gamut boundary has to be worked out.

HSL* skips both: it builds colours directly in RGB, where the gamut boundary is simply one channel at 0 or 1. Its saturation is therefore not chroma, and not designed to be perceptually uniform. That's the price of the simplicity, and a deliberate choice: the construction is easy to implement and to invert exactly.

**Okhsl** ([Björn Ottosson](https://bottosson.github.io/posts/colorpicker/)) uses OKLab for lightness, hue and saturation. Its lightness is OKLab's, adjusted to come close to CIE L*, so rows are close to equally light but not exact. Its saturation goes through three reference chroma values with fitted curves, so that it behaves as evenly as possible across hues, and it approximates the sRGB gamut boundary. Okhsl tries harder than HSL* to make hue and saturation perceptually consistent.

HSL* uses OKLab only to space its hue axis, so it isn't equivalent to Okhsl. It's a deliberately simpler alternative that keeps the RGB construction straightforward and the lightness exact.


## Colour picker

The picker runs at https://domizai.github.io/hsl-star/. 

## Library

Currently, there is only a JavaScript implementation, see the [`js`](js/README.md) folder for details.

## References

- [HSLuv: math](https://www.hsluv.org/math/): HSL-like coordinates on CIELUV, saturation as a share of the maximum sRGB chroma.
- [Björn Ottosson: Okhsv and Okhsl](https://bottosson.github.io/posts/colorpicker/) (2021): HSL-like coordinates on OKLab.
- [Björn Ottosson: A perceptual color space for image processing](https://bottosson.github.io/posts/oklab/) (2020): OKLab, whose hue spaces the HSL* hue axis.
- [W3C: WCAG 2.2](https://www.w3.org/TR/WCAG22/): relative luminance and contrast ratio, with the same weights and transfer function as above.

## Licence

MIT, see [LICENSE.txt](LICENSE.txt).

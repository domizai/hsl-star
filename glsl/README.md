# HSL* in GLSL

[hsl-star.glsl](./hsl-star.glsl) is the HSL* color space for shaders, written for GLSL ES 3.00 (WebGL2) and desktop GLSL 1.30 and later. The precision line must be `highp`, or dark tones band on some phones. Read more about the HSL* color space [here](../README.md).

Try it on [Shadertoy](https://www.shadertoy.com/view/NXKXzz).

```glsl
vec3 hslStar = vec3(uv.x * 360.0, uv.y * 100.0, 0.9);
vec3 srgb = hslStarToSrgb(hslStar);
```

# Functions

Coordinates are a `vec3(h, l, s)`, the same as `{ h, l, s }` in the JavaScript module. RGB is a `vec3` with channels from 0 to 1.

The hue axis is either `HSL_STAR_OKLAB` or `HSL_STAR_HSV`. Leave `hueAxis` out for OKLab. An `int` uniform works too, which is handy for switching the axis at runtime.

```glsl
// Gamma-encoded sRGB, the color to show
vec3 hslStarToSrgb(vec3 hls, int hueAxis)
vec3 hslStarFromSrgb(vec3 rgb, int hueAxis)

// Linear-light sRGB, for blending and lighting
vec3 hslStarToLinear(vec3 hls, int hueAxis)
vec3 hslStarFromLinear(vec3 rgb, int hueAxis)
```

The building blocks are available as well.

```glsl
// sRGB transfer function
vec3 hslStarDecode(vec3 srgb)
vec3 hslStarEncode(vec3 linear)

// CIE L* and luminance
float hslStarYFromLstar(float l)
float hslStarLstarFromY(float y)

// Between the HSL* hue on the OKLab axis and the HSV hue
float hslStarToHsvHue(float h)
float hslStarFromHsvHue(float hsv)
```


# Accuracy

The shader stays within a third of an 8-bit step of [hsl-star.js](../js/hsl-star.js), and converting back gives the same L* and saturation, with hues within 0.011°. A round trip from sRGB to HSL* and back returns every color unchanged, apart from float rounding. To check it on your GPU, serve the repository root and open [/glsl/test/](./test/index.html). The OKLab hue axis comes from a table generated from the JavaScript module, read in both directions. `npm run sync` regenerates it, and `npm test` fails if it's out of date.

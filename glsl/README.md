# HSL* in GLSL

[hsl-star.glsl](./hsl-star.glsl) is the HSL* colour space for shaders, written for GLSL ES 3.00 (WebGL2) and desktop GLSL 1.30 and later. The precision line must be `highp`, or dark tones band on some phones. Read more about the HSL* colour space [here](../README.md).

```glsl
vec3 hslStar = vec3(uv.x * 360.0, uv.y * 100.0, 0.9);
vec3 srgb = hslStarToSrgb(hslStar);
```

# Functions

Coordinates are a `vec3(h, l, s)`, the same as `{ h, l, s }` in the JavaScript module. RGB is a `vec3` with channels from 0 to 1.

The hue axis is either `HSL_STAR_OKLAB` or `HSL_STAR_HSV`. Leave `hueAxis` out for OKLab. An `int` uniform works too, which is handy for switching the axis at runtime.

```glsl
// Gamma-encoded sRGB, the colour to show
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

The shader stays within a third of an 8-bit step of [hsl-star.js](../js/hsl-star.js), and converting back gives the same L* and saturation, with hues within 0.003°. To check it on your GPU, serve the repository root and open [/glsl/test/](./test/index.html). The OKLab hue axis comes from two tables generated from the JavaScript module. `npm run glsl` regenerates them, and `npm test` fails if they're out of date.

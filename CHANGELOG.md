# Changelog

## 0.3.0

**Breaking: saturation means something else for strongly colorful hues.** Saturation is now corrected near grey. Hues whose most vivid color is more colorful than the median hue's at that lightness are toned down, so the same s looks about equally colorful across hues. Dark blues and violets, mid magentas and very light yellows and greens change the most, the others not at all. s = 0, s = 1, lightness and hue are unchanged, and the conversion stays closed form and exactly invertible. See [the saturation correction](README.md#the-saturation-correction).

Coordinates saved with 0.2.x, such as links to the site, give a different color where the correction applies. Convert them through RGB with the old version to keep the color.

- The JavaScript module and the GLSL shader share a generated table of reference chroma, kept current by `npm run sync`.
- New: `oklabChroma()` in the JavaScript module and `hslStarOklabChroma()` in the shader.
- Converting a hue on the OKLab axis to HSV is faster, with identical results.

## 0.2.1

The last version before this changelog.

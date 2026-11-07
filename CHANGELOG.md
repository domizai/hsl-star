# Changelog

## 0.3.0

**Breaking: saturation means something else for strongly colorful hues.** Saturation is now corrected near grey. Hues whose most vivid color is more colorful than the median hue's at that lightness are toned down, so the same s looks about equally colorful across hues. Dark blues and violets, mid magentas and very light yellows and greens change the most, the others not at all. s = 0, s = 1, lightness and hue are unchanged, and the conversion stays closed form and exactly invertible. See [the saturation correction](README.md#the-saturation-correction).

**Breaking: on the OKLab hue axis, tints, shades and lower saturations keep their pure color's hue.** Mixing in white or grey moved the OKLab hue, up to 12° in the reds and 22° in the blues; now the HSV hue a color is built from is shifted for its lightness and saturation, so its OKLab hue stays within 0.7° of the pure color's on average, at worst about 9° in the blues. Pure colors, lightness and the HSV hue axis are unchanged, and the conversion stays exactly invertible. See [the hue shift](README.md#the-hue-shift).

Coordinates saved with 0.2.x, such as links to the site, give a different color where either correction applies. Convert them through RGB with the old version to keep the color.

- The JavaScript module and the GLSL shader share generated tables for both corrections, kept current by `npm run sync` (scripts/tables.js makes them).
- `hueBasis()` on the OKLab axis also returns the HSV hue `x`, which `basisToLinear()` shifts per lightness and saturation.
- New: `oklabChroma()` in the JavaScript module and `hslStarOklabChroma()` in the shader, and `shiftHsvHue()`, `unshiftHsvHue()` and `saturationStrength()` in the JavaScript module, the hue shift and the saturation correction's measure on their own.
- Converting a hue on the OKLab axis to HSV is faster, with identical results.

## 0.2.1

The last version before this changelog.

# HSL* JavaScript Module

Usage:

```js
import * as hslStar from 'hsl-star.js';

hslStar.toHex(hslStar.toRgb({ h: 18, l: 62, s: 0.9 }));   // '#f7694f'
hslStar.fromRgb(hslStar.parseColor('#0000ff'));           // { h: 240, l: 32.3, s: 1 }
hslStar.toRgb({ h: 120, l: 50, s: 1 }, { hue: 'oklab' }); // perceptual hue axis
```

`toRgb` and `fromRgb` work with gamma-encoded sRGB channels in [0, 1], `toLinear` and `fromLinear` with linear light. To render a whole plane, compute `hueBasis(h)` once per column and call `basisToLinear` per pixel.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toLinear, linearToLab, lstarFromY, luminance } from '../src/hsl-star.js';
import { optimalSolidMesh, optimalSolidContours } from '../src/optimal-solid.js';

const close = (a, b, tol, msg) =>
  assert.ok(Math.abs(a - b) <= tol, `${msg ?? ''} expected ${b}, got ${a} (tol ${tol})`);

test('CIELAB: white, black and known primaries', () => {
  linearToLab([1, 1, 1]).forEach((v, i) => close(v, [100, 0, 0][i], 1e-3, 'white'));
  linearToLab([0, 0, 0]).forEach((v) => close(v, 0, 1e-9, 'black'));
  const [l, a, b] = linearToLab([1, 0, 0]);
  close(l, 53.24, 0.01, 'red L');
  close(a, 80.09, 0.05, 'red a');
  close(b, 67.2, 0.05, 'red b');
});

test('CIELAB L* agrees with the colour space lightness', () => {
  for (let h = 0; h < 360; h += 10) {
    for (let l = 0; l <= 100; l += 5) {
      const rgb = toLinear({ h, l, s: 1 });
      close(linearToLab(rgb)[0], lstarFromY(luminance(rgb)), 0.01);
    }
  }
});

test('optimal solid: spectral data reproduces the D65 white point', () => {
  const { white } = optimalSolidMesh();
  const sum = white[0] + white[1] + white[2];
  close(white[0] / sum, 0.3127, 0.0005, 'x');
  close(white[1] / sum, 0.329, 0.0005, 'y');
});

test('optimal solid contains the sRGB solid', () => {
  const levels = [10, 20, 30, 40, 50, 60, 70, 80, 90];
  const segments = optimalSolidContours(levels);
  // Largest chroma of the contour at this level along the given hue angle.
  const limit = (level, angle) => {
    let best = 0;
    const dx = Math.cos(angle);
    const dy = Math.sin(angle);
    for (let i = 0; i < segments.length; i += 6) {
      if (Math.abs(segments[i] - level) > 1e-3) continue;
      const ax = segments[i + 1];
      const ay = segments[i + 2];
      const ex = segments[i + 4] - ax;
      const ey = segments[i + 5] - ay;
      const den = dx * ey - dy * ex;
      if (Math.abs(den) < 1e-12) continue;
      const t = (ax * ey - ay * ex) / den;
      const u = (ax * dy - ay * dx) / den;
      if (t > 0 && u >= 0 && u <= 1) best = Math.max(best, t);
    }
    return best;
  };
  for (const level of levels) {
    for (let h = 0; h < 360; h += 3) {
      const [, a, b] = linearToLab(toLinear({ h, l: level, s: 1 }));
      const chroma = Math.hypot(a, b);
      assert.ok(chroma < limit(level, Math.atan2(b, a)), `sRGB outside at L* ${level}, h ${h}`);
    }
  }
});

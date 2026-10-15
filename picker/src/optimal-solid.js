// Optimal colour solid (Rösch–MacAdam solid) under CIE illuminant D65, in
// CIELAB. It holds every surface colour that is physically possible: its
// boundary consists of the "optimal colours", whose reflectance is either 0 or
// 1 with at most two transitions across the spectrum.
//
// Spectral data:
//   colour-matching functions: CIE 1931 2° observer, using the multi-lobe
//   Gaussian fit by Wyman, Sloan and Shirley (2013, JCGT 2(2)).
//   illuminant: CIE D65 relative spectral power, 380–780 nm in 10 nm steps.
// Together they reproduce the D65 white point to four decimals
// (x 0.3127, y 0.3291).

import * as hslStar from './hsl-star.js';

const lobe = (l, mu, s1, s2) => {
  const t = (l - mu) / (l < mu ? s1 : s2);
  return Math.exp(-0.5 * t * t);
};
const xBar = (l) =>
  1.056 * lobe(l, 599.8, 37.9, 31.0) + 0.362 * lobe(l, 442.0, 16.0, 26.7) - 0.065 * lobe(l, 501.1, 20.4, 26.2);
const yBar = (l) => 0.821 * lobe(l, 568.8, 46.9, 40.5) + 0.286 * lobe(l, 530.9, 16.3, 31.1);
const zBar = (l) => 1.217 * lobe(l, 437.0, 11.8, 36.0) + 0.681 * lobe(l, 459.0, 26.0, 13.8);

const D65_SPD = [
  49.9755, 54.6482, 82.7549, 91.486, 93.4318, 86.6823, 104.865, 117.008, 117.812, 114.861,
  115.923, 108.811, 109.354, 107.802, 104.79, 107.689, 104.405, 104.046, 100, 96.3342,
  95.788, 88.6856, 90.0062, 89.5991, 87.6987, 83.2886, 83.6992, 80.0268, 80.2146, 82.2778,
  78.2842, 69.7213, 71.6091, 74.349, 61.604, 69.8856, 75.087, 63.5927, 46.4182, 66.8054,
  63.3828,
];

const STEP = 5;
const START = 380;
const SAMPLES = (780 - START) / STEP + 1;

function d65(l) {
  const x = (l - START) / 10;
  const i = Math.min(Math.floor(x), D65_SPD.length - 2);
  return D65_SPD[i] + (x - i) * (D65_SPD[i + 1] - D65_SPD[i]);
}

// XYZ contribution of each spectral sample, scaled so the perfect white
// reflector has Y = 1.
function sampleContributions() {
  const samples = [];
  for (let i = 0; i < SAMPLES; i++) {
    const l = START + i * STEP;
    const s = d65(l);
    samples.push([s * xBar(l), s * yBar(l), s * zBar(l)]);
  }
  const yTotal = samples.reduce((sum, c) => sum + c[1], 0);
  return samples.map((c) => c.map((v) => v / yTotal));
}

let cached = null;

// Surface mesh of the solid. Vertex (start, width) is the optimal colour that
// reflects the samples start … start + width − 1, wrapping around the
// spectrum, so it covers band-pass and band-stop colours alike. Width 0 is
// black, width SAMPLES is white.
export function optimalSolidMesh() {
  if (cached) return cached;
  const samples = sampleContributions();
  const white = [0, 1, 2].map((k) => samples.reduce((sum, c) => sum + c[k], 0));

  // Prefix sums over the doubled spectrum make every window O(1).
  const prefix = [[0, 0, 0]];
  for (let i = 0; i < 2 * SAMPLES; i++) {
    const p = prefix[i];
    const c = samples[i % SAMPLES];
    prefix.push([p[0] + c[0], p[1] + c[1], p[2] + c[2]]);
  }

  const cols = SAMPLES;
  const rows = SAMPLES + 1;
  const positions = new Float32Array(cols * rows * 3);
  for (let w = 0; w < rows; w++) {
    for (let i = 0; i < cols; i++) {
      const a = prefix[i];
      const b = prefix[i + w];
      const lab = hslStar.xyzToLab([b[0] - a[0], b[1] - a[1], b[2] - a[2]], white);
      positions.set(lab, (w * cols + i) * 3);
    }
  }

  const indices = [];
  for (let w = 0; w < rows - 1; w++) {
    for (let i = 0; i < cols; i++) {
      const j = (i + 1) % cols;
      const v00 = w * cols + i;
      const v10 = w * cols + j;
      const v01 = (w + 1) * cols + i;
      const v11 = (w + 1) * cols + j;
      indices.push(v00, v10, v11, v00, v11, v01);
    }
  }
  cached = { positions, indices: new Uint32Array(indices), white };
  return cached;
}

// Horizontal cuts through the solid at the given L* levels, as line segments:
// a flat array of Lab endpoints, two per segment.
export function optimalSolidContours(levels) {
  const { positions: p, indices } = optimalSolidMesh();
  const out = [];
  for (const level of levels) {
    for (let t = 0; t < indices.length; t += 3) {
      const tri = [indices[t], indices[t + 1], indices[t + 2]];
      const hits = [];
      for (let e = 0; e < 3; e++) {
        const a = tri[e] * 3;
        const b = tri[(e + 1) % 3] * 3;
        const la = p[a];
        const lb = p[b];
        if ((la < level) !== (lb < level)) {
          const f = (level - la) / (lb - la);
          hits.push(level, p[a + 1] + f * (p[b + 1] - p[a + 1]), p[a + 2] + f * (p[b + 2] - p[a + 2]));
        }
      }
      if (hits.length === 6) out.push(...hits);
    }
  }
  return new Float32Array(out);
}

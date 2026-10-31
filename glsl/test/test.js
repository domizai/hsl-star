// Runs the shader on a grid of inputs, reads the results back as floats and
// compares them with the library. Forward: HSL* to sRGB, judged on the
// largest channel difference. Inverse: 8-bit sRGB to HSL*, judged on each
// coordinate; hue only where there is a hue to speak of (s above 0.01).
// Round trip: 8-bit sRGB to HSL* and back, all in the shader, which must
// give the same color.

import * as hslStar from '../../js/hsl-star.js';

const AXES = { oklab: 0, hsv: 1 };

// What counts as a pass. A forward difference under 1/255 can change an
// 8-bit channel by 1 at most.
// A round trip only has float32 rounding to lose, far below 1/255.
const LIMITS = { srgb: 1 / 255, l: 0.01, s: 0.002, h: 0.1, roundTrip: 0.1 / 255 };

function createRunner(library) {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl2');
  if (!gl) throw new Error('This browser has no WebGL2.');
  if (!gl.getExtension('EXT_color_buffer_float')) throw new Error('This GPU cannot render to float textures.');

  const vertex = `#version 300 es
in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`;
  const quad = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quad);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);

  const compile = (type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader));
    return shader;
  };

  // Renders `main` (a GLSL main() writing vec4 o) over width × height pixels
  // with the library included and returns the RGBA floats.
  return function run(main, width, height, axis) {
    const program = gl.createProgram();
    gl.attachShader(program, compile(gl.VERTEX_SHADER, vertex));
    gl.attachShader(
      program,
      compile(gl.FRAGMENT_SHADER, `#version 300 es\nprecision highp float;\nprecision highp int;\n${library}\nuniform int uAxis;\nout vec4 o;\n${main}`),
    );
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
    gl.useProgram(program);
    gl.uniform1i(gl.getUniformLocation(program, 'uAxis'), axis);

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, width, height, 0, gl.RGBA, gl.FLOAT, null);
    const framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

    const location = gl.getAttribLocation(program, 'aPos');
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(location, 2, gl.FLOAT, false, 0, 0);
    gl.viewport(0, 0, width, height);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    const pixels = new Float32Array(width * height * 4);
    gl.readPixels(0, 0, width, height, gl.RGBA, gl.FLOAT, pixels);
    gl.deleteFramebuffer(framebuffer);
    gl.deleteTexture(texture);
    gl.deleteProgram(program);
    return pixels;
  };
}

// --- Forward: hues every half degree, L* every 5, s every 0.25 --------------

const FORWARD = { width: 720, lSteps: 21, sSteps: 5 };
const forwardInput = (x, y) => ({
  h: x * 0.5 + 0.25,
  l: (y % FORWARD.lSteps) * 5,
  s: Math.floor(y / FORWARD.lSteps) * 0.25,
});
const FORWARD_MAIN = `void main() {
  ivec2 p = ivec2(gl_FragCoord.xy);
  vec3 hls = vec3(float(p.x) * 0.5 + 0.25, float(p.y % ${FORWARD.lSteps}) * 5.0, float(p.y / ${FORWARD.lSteps}) * 0.25);
  o = vec4(hslStarToSrgb(hls, uAxis), 1.0);
}`;

function testForward(run, axis) {
  const height = FORWARD.lSteps * FORWARD.sSteps;
  const pixels = run(FORWARD_MAIN, FORWARD.width, height, AXES[axis]);
  let worst = { error: 0 };
  let changed = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < FORWARD.width; x++) {
      const input = forwardInput(x, y);
      const expected = hslStar.toSrgb(input, { hue: axis });
      const k = (y * FORWARD.width + x) * 4;
      const actual = [pixels[k], pixels[k + 1], pixels[k + 2]];
      const error = Math.max(...expected.map((v, i) => Math.abs(v - actual[i])));
      if (error > worst.error) worst = { error, input };
      if (hslStar.toHex(expected) !== hslStar.toHex(actual)) changed++;
    }
  }
  return {
    name: `HSL* to sRGB, ${axis} hue`,
    pass: worst.error < LIMITS.srgb,
    detail: `largest difference ${(worst.error * 255).toFixed(3)} / 255${worst.input ? ` at h ${worst.input.h}, l ${worst.input.l}, s ${worst.input.s}` : ''}; ${changed} of ${FORWARD.width * height} hex codes differ`,
  };
}

// --- Inverse: every 8-bit color with channels in steps of 5 -----------------

const STEPS = 52;
const COUNT = STEPS ** 3;
const INVERSE_WIDTH = 512;
const inverseInput = (i) => [i % STEPS, Math.floor(i / STEPS) % STEPS, Math.floor(i / STEPS ** 2)].map((v) => (v * 5) / 255);
const INVERSE_MAIN = `void main() {
  ivec2 p = ivec2(gl_FragCoord.xy);
  int i = p.y * ${INVERSE_WIDTH} + p.x;
  vec3 rgb = vec3(i % ${STEPS}, (i / ${STEPS}) % ${STEPS}, i / ${STEPS * STEPS}) * (5.0 / 255.0);
  o = vec4(hslStarFromSrgb(rgb, uAxis), 1.0);
}`;

function testInverse(run, axis) {
  const height = Math.ceil(COUNT / INVERSE_WIDTH);
  const pixels = run(INVERSE_MAIN, INVERSE_WIDTH, height, AXES[axis]);
  const worst = { h: 0, l: 0, s: 0 };
  for (let i = 0; i < COUNT; i++) {
    const expected = hslStar.fromSrgb(inverseInput(i), { hue: axis });
    const [h, l, s] = pixels.subarray(i * 4, i * 4 + 3);
    worst.l = Math.max(worst.l, Math.abs(l - expected.l));
    worst.s = Math.max(worst.s, Math.abs(s - expected.s));
    if (expected.s > 0.01) {
      const d = Math.abs(h - expected.h) % 360;
      worst.h = Math.max(worst.h, Math.min(d, 360 - d));
    }
  }
  return {
    name: `sRGB to HSL*, ${axis} hue`,
    pass: worst.h < LIMITS.h && worst.l < LIMITS.l && worst.s < LIMITS.s,
    detail: `largest difference h ${worst.h.toFixed(4)}°, l ${worst.l.toFixed(4)}, s ${worst.s.toFixed(5)} over ${COUNT} colors`,
  };
}

// --- Round trip: every 8-bit color with channels in steps of 3 --------------

const TRIP_STEPS = 86;
const TRIP_COUNT = TRIP_STEPS ** 3;
const TRIP_WIDTH = 1024;
const TRIP_MAIN = `void main() {
  ivec2 p = ivec2(gl_FragCoord.xy);
  int i = p.y * ${TRIP_WIDTH} + p.x;
  vec3 rgb = vec3(i % ${TRIP_STEPS}, (i / ${TRIP_STEPS}) % ${TRIP_STEPS}, i / ${TRIP_STEPS * TRIP_STEPS}) * (3.0 / 255.0);
  o = vec4(hslStarToSrgb(hslStarFromSrgb(rgb, uAxis), uAxis) - rgb, 1.0);
}`;

function testRoundTrip(run, axis) {
  const pixels = run(TRIP_MAIN, TRIP_WIDTH, Math.ceil(TRIP_COUNT / TRIP_WIDTH), AXES[axis]);
  let worst = 0;
  let changed = 0;
  for (let i = 0; i < TRIP_COUNT; i++) {
    const error = Math.max(...pixels.subarray(i * 4, i * 4 + 3).map(Math.abs));
    worst = Math.max(worst, error);
    if (error * 255 >= 0.5) changed++;
  }
  return {
    name: `sRGB to HSL* and back, ${axis} hue`,
    pass: worst < LIMITS.roundTrip,
    detail: `largest difference ${(worst * 255).toFixed(4)} / 255 over ${TRIP_COUNT} colors; ${changed} come back as a different 8-bit color`,
  };
}

// --- Report -------------------------------------------------------------------

async function main() {
  const results = document.getElementById('results');
  try {
    const library = await fetch('../hsl-star.glsl', { cache: 'no-store' }).then((r) => r.text());
    const run = createRunner(library);
    const rows = Object.keys(AXES).flatMap((axis) => [testForward(run, axis), testInverse(run, axis), testRoundTrip(run, axis)]);
    window.glslResults = rows;
    const table = document.createElement('table');
    for (const row of rows) {
      const tr = table.insertRow();
      tr.insertCell().textContent = row.pass ? '✓' : '✗';
      tr.className = row.pass ? 'pass' : 'fail';
      tr.insertCell().textContent = row.name;
      tr.insertCell().textContent = row.detail;
    }
    const failed = rows.filter((row) => !row.pass).length;
    const summary = document.createElement('p');
    summary.textContent = failed ? `${failed} of ${rows.length} failed.` : `All ${rows.length} passed.`;
    results.replaceChildren(table, summary);
  } catch (error) {
    window.glslResults = { error: error.message };
    results.textContent = `Couldn't run: ${error.message}`;
    results.className = 'fail';
  }
}

main();

// 3D view of the HSL* solid in CIELAB, with the optimal colour solid as an
// outline around it. Plain WebGL, no dependencies.
//
// World coordinates: x = a*, y = L* − 50, z = −b*, all divided by 100.

import * as hslStar from './src/hsl-star.js';
import { optimalSolidContours } from './src/optimal-solid.js';

const HUE_STEPS = 180;
const L_STEPS = 100;
const CAP_S_STEPS = 16;
const CONTOUR_LEVELS = [10, 20, 30, 40, 50, 60, 70, 80, 90];
const FOV = (35 * Math.PI) / 180;
const DEFAULT_VIEW = { yaw: -1.1, pitch: 0.12 };

const VERTEX = `
attribute vec3 aLab;
attribute vec3 aColor;
uniform mat4 uMvp;
uniform float uPointSize;
uniform vec2 uOffset;
varying vec3 vColor;
varying float vL;
void main() {
  vColor = aColor;
  vL = aLab.x;
  gl_Position = uMvp * vec4(aLab.y * 0.01, (aLab.x - 50.0) * 0.01, -aLab.z * 0.01, 1.0);
  gl_Position.xy += uOffset * gl_Position.w;
  gl_PointSize = uPointSize;
}`;

const SURFACE_FRAGMENT = `
precision mediump float;
varying vec3 vColor;
varying float vL;
uniform float uCut;
void main() {
  if (vL > uCut) discard;
  gl_FragColor = vec4(vColor, 1.0);
}`;

const LINE_FRAGMENT = `
precision mediump float;
varying float vL;
uniform vec4 uColor;
uniform float uCut;
void main() {
  if (vL > uCut) discard;
  gl_FragColor = uColor;
}`;

// Same look as the DOM markers: colour fill, white ring, dark outline.
const MARKER_FRAGMENT = `
precision mediump float;
uniform vec3 uFill;
void main() {
  float r = length(gl_PointCoord * 2.0 - 1.0);
  if (r > 1.0) discard;
  if (r > 0.88) gl_FragColor = vec4(0.0, 0.0, 0.0, 0.55);
  else if (r > 0.66) gl_FragColor = vec4(1.0);
  else gl_FragColor = vec4(uFill, 1.0);
}`;

// --- Small matrix helpers (column-major) ------------------------------------

function multiply(a, b) {
  const out = new Float32Array(16);
  for (let c = 0; c < 4; c++) {
    for (let r = 0; r < 4; r++) {
      let sum = 0;
      for (let k = 0; k < 4; k++) sum += a[k * 4 + r] * b[c * 4 + k];
      out[c * 4 + r] = sum;
    }
  }
  return out;
}

function perspective(fov, aspect, near, far) {
  const f = 1 / Math.tan(fov / 2);
  const nf = 1 / (near - far);
  return new Float32Array([f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) * nf, -1, 0, 0, 2 * far * near * nf, 0]);
}

function viewMatrix(yaw, pitch, distance) {
  const cy = Math.cos(yaw);
  const sy = Math.sin(yaw);
  const cp = Math.cos(pitch);
  const sp = Math.sin(pitch);
  const rotY = new Float32Array([cy, 0, -sy, 0, 0, 1, 0, 0, sy, 0, cy, 0, 0, 0, 0, 1]);
  const rotX = new Float32Array([1, 0, 0, 0, 0, cp, sp, 0, 0, -sp, cp, 0, 0, 0, 0, 1]);
  const move = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, -distance, 1]);
  return multiply(move, multiply(rotX, rotY));
}

// --- Geometry -----------------------------------------------------------------

const greyOf = (l) => hslStar.encode(hslStar.yFromLstar(l));

// Outer surface of the HSL* solid: saturation 1 over every hue and lightness.
function surfaceGeometry() {
  const cols = HUE_STEPS + 1;
  const rows = L_STEPS + 1;
  const lab = new Float32Array(cols * rows * 3);
  const colour = new Float32Array(cols * rows * 3);
  const grey = new Float32Array(cols * rows * 3);
  for (let j = 0; j < rows; j++) {
    const l = (j / L_STEPS) * 100;
    for (let i = 0; i < cols; i++) {
      const h = (i / HUE_STEPS) * 360;
      const k = (j * cols + i) * 3;
      lab.set(hslStar.linearToLab(hslStar.toLinear({ h, l, s: 1 })), k);
      colour.set(hslStar.toRgb({ h, l, s: 1 }), k);
      grey.fill(greyOf(l), k, k + 3);
    }
  }
  return { lab, colour, grey, indices: gridIndices(cols, rows) };
}

// Flat cut through the solid at one lightness: every hue and saturation.
function capGeometry(l) {
  const cols = HUE_STEPS + 1;
  const rows = CAP_S_STEPS + 1;
  const lab = new Float32Array(cols * rows * 3);
  const colour = new Float32Array(cols * rows * 3);
  const grey = new Float32Array(cols * rows * 3);
  for (let j = 0; j < rows; j++) {
    const s = j / CAP_S_STEPS;
    for (let i = 0; i < cols; i++) {
      const h = (i / HUE_STEPS) * 360;
      const k = (j * cols + i) * 3;
      const labValue = hslStar.linearToLab(hslStar.toLinear({ h, l, s }));
      labValue[0] = l;
      lab.set(labValue, k);
      colour.set(hslStar.toRgb({ h, l, s }), k);
      grey.fill(greyOf(l), k, k + 3);
    }
  }
  return { lab, colour, grey, indices: gridIndices(cols, rows) };
}

function gridIndices(cols, rows) {
  const indices = new Uint16Array((cols - 1) * (rows - 1) * 6);
  let n = 0;
  for (let j = 0; j < rows - 1; j++) {
    for (let i = 0; i < cols - 1; i++) {
      const v = j * cols + i;
      indices.set([v, v + 1, v + cols + 1, v, v + cols + 1, v + cols], n);
      n += 6;
    }
  }
  return indices;
}

function pureHueLine() {
  const lab = new Float32Array((HUE_STEPS + 1) * 3);
  for (let i = 0; i <= HUE_STEPS; i++) {
    lab.set(hslStar.linearToLab(hslStar.pureHue((i / HUE_STEPS) * 360).map(hslStar.decode)), i * 3);
  }
  return lab;
}

const AXIS_LENGTH = 150;
const AXES = new Float32Array([
  0, 0, 0, 100, 0, 0,
  0, -AXIS_LENGTH, 0, 0, AXIS_LENGTH, 0,
  0, 0, -AXIS_LENGTH, 0, 0, AXIS_LENGTH,
]);
const AXIS_LABELS = [
  { text: '+a*', lab: [0, AXIS_LENGTH + 12, 0] },
  { text: '−a*', lab: [0, -AXIS_LENGTH - 12, 0] },
  { text: '+b*', lab: [0, 0, AXIS_LENGTH + 12] },
  { text: '−b*', lab: [0, 0, -AXIS_LENGTH - 12] },
];

// --- View ---------------------------------------------------------------------

export function createSolidView(canvas, labelLayer) {
  const gl = canvas.getContext('webgl', { antialias: true, premultipliedAlpha: false });
  if (!gl) return null;

  function program(fragment) {
    const compile = (type, source) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader));
      return shader;
    };
    const p = gl.createProgram();
    gl.attachShader(p, compile(gl.VERTEX_SHADER, VERTEX));
    gl.attachShader(p, compile(gl.FRAGMENT_SHADER, fragment));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    const loc = (name) => gl.getUniformLocation(p, name);
    return {
      p,
      aLab: gl.getAttribLocation(p, 'aLab'),
      aColor: gl.getAttribLocation(p, 'aColor'),
      uMvp: loc('uMvp'),
      uCut: loc('uCut'),
      uColor: loc('uColor'),
      uFill: loc('uFill'),
      uPointSize: loc('uPointSize'),
      uOffset: loc('uOffset'),
    };
  }

  const surfaceProgram = program(SURFACE_FRAGMENT);
  const lineProgram = program(LINE_FRAGMENT);
  const markerProgram = program(MARKER_FRAGMENT);

  const buffer = (data, target = gl.ARRAY_BUFFER) => {
    const b = gl.createBuffer();
    gl.bindBuffer(target, b);
    gl.bufferData(target, data, gl.STATIC_DRAW);
    return b;
  };

  function meshBuffers(geometry) {
    return {
      lab: buffer(geometry.lab),
      colour: buffer(geometry.colour),
      grey: buffer(geometry.grey),
      indices: buffer(geometry.indices, gl.ELEMENT_ARRAY_BUFFER),
      count: geometry.indices.length,
    };
  }

  const surface = meshBuffers(surfaceGeometry());
  const contours = optimalSolidContours(CONTOUR_LEVELS);
  const contourBuffer = buffer(contours);
  const pureLine = buffer(pureHueLine());
  const axisBuffer = buffer(AXES);
  const markerBuffer = buffer(new Float32Array(3));
  let cap = null;
  let capL = null;

  const labels = AXIS_LABELS.map(({ text }) => {
    const el = document.createElement('span');
    el.textContent = text;
    labelLayer.appendChild(el);
    return el;
  });

  const view = { ...DEFAULT_VIEW };
  let settings = { h: 0, l: 50, s: 1, optimal: true, cut: false, pureLine: false, preview: false };
  let frame = 0;

  const requestDraw = () => {
    if (!frame) frame = requestAnimationFrame(draw);
  };

  function bindAttribute(location, b) {
    gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(location, 3, gl.FLOAT, false, 0, 0);
  }

  function drawMesh(mesh, mvp, cut) {
    const prog = surfaceProgram;
    gl.useProgram(prog.p);
    gl.uniformMatrix4fv(prog.uMvp, false, mvp);
    gl.uniform1f(prog.uCut, cut);
    gl.uniform1f(prog.uPointSize, 1);
    bindAttribute(prog.aLab, mesh.lab);
    bindAttribute(prog.aColor, settings.preview ? mesh.grey : mesh.colour);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.indices);
    gl.drawElements(gl.TRIANGLES, mesh.count, gl.UNSIGNED_SHORT, 0);
    gl.disableVertexAttribArray(prog.aColor);
  }

  // Line colours follow the page's text colour, so they work in both themes.
  function inkColour(alpha) {
    const m = getComputedStyle(canvas).color.match(/[\d.]+/g) || ['128', '128', '128'];
    return [m[0] / 255, m[1] / 255, m[2] / 255, alpha];
  }

  // WebGL lines are one device pixel wide, a hairline on high-density
  // screens. Drawing each line again shifted by a pixel makes it thicker.
  function drawLines(b, count, mode, mvp, rgba, cut = 1000) {
    const prog = lineProgram;
    gl.useProgram(prog.p);
    gl.uniformMatrix4fv(prog.uMvp, false, mvp);
    gl.uniform1f(prog.uCut, cut);
    gl.uniform4fv(prog.uColor, rgba);
    gl.uniform1f(prog.uPointSize, 1);
    bindAttribute(prog.aLab, b);
    const passes = lineThickness();
    for (let i = 0; i < passes; i++) {
      for (let j = 0; j < passes; j++) {
        gl.uniform2f(prog.uOffset, (2 * i) / canvas.width, (2 * j) / canvas.height);
        gl.drawArrays(mode, 0, count);
      }
    }
  }

  const lineThickness = () => (canvas.width / canvas.clientWidth >= 1.5 ? 2 : 1);

  function draw() {
    frame = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.round(canvas.clientWidth * dpr);
    const h = Math.round(canvas.clientHeight * dpr);
    if (!w || !h) return;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    gl.viewport(0, 0, w, h);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Fit the optimal solid (chroma up to 196) or just sRGB (up to 133).
    // Seen from the side the solid is wide and flat, so fit width and height
    // separately; the height depends on how steeply we look down.
    const radius = settings.optimal ? 2.0 : 1.4;
    const aspect = w / h;
    const halfHeight = radius * Math.abs(Math.sin(view.pitch)) + 0.5 * Math.cos(view.pitch);
    const t = Math.tan(FOV / 2);
    const distance = 0.95 * Math.max(radius / (t * aspect), halfHeight / t) + radius * 0.3;
    const mvp = multiply(perspective(FOV, aspect, 0.1, 100), viewMatrix(view.yaw, view.pitch, distance));
    const cut = settings.cut ? settings.l : 1000;

    gl.enable(gl.DEPTH_TEST);
    gl.depthMask(true);
    gl.disable(gl.BLEND);
    gl.enable(gl.POLYGON_OFFSET_FILL);
    gl.polygonOffset(1, 1);
    drawMesh(surface, mvp, cut);
    if (settings.cut) {
      if (capL !== settings.l) {
        cap = meshBuffers(capGeometry(settings.l));
        capL = settings.l;
      }
      drawMesh(cap, mvp, 1000);
    }
    gl.disable(gl.POLYGON_OFFSET_FILL);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.depthMask(false);
    drawLines(axisBuffer, AXES.length / 3, gl.LINES, mvp, inkColour(0.35));
    if (settings.pureLine) drawLines(pureLine, HUE_STEPS + 1, gl.LINE_STRIP, mvp, [0, 0, 0, 0.8], cut);
    if (settings.optimal) drawLines(contourBuffer, contours.length / 3, gl.LINES, mvp, inkColour(0.7));

    // The current colour stays visible even inside the solid.
    gl.disable(gl.DEPTH_TEST);
    const marker = hslStar.linearToLab(hslStar.toLinear(settings));
    gl.bindBuffer(gl.ARRAY_BUFFER, markerBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(marker), gl.DYNAMIC_DRAW);
    gl.useProgram(markerProgram.p);
    gl.uniformMatrix4fv(markerProgram.uMvp, false, mvp);
    gl.uniform1f(markerProgram.uPointSize, 18 * dpr);
    const fill = settings.preview ? Array(3).fill(greyOf(settings.l)) : hslStar.toRgb(settings);
    gl.uniform3fv(markerProgram.uFill, fill);
    bindAttribute(markerProgram.aLab, markerBuffer);
    gl.drawArrays(gl.POINTS, 0, 1);

    placeLabels(mvp, w, h);
  }

  // Labels are HTML on top of the canvas. Hide a label when the solid covers
  // its spot: the solid is the only thing drawn fully opaque.
  const pixel = new Uint8Array(4);
  function placeLabels(mvp, w, h) {
    AXIS_LABELS.forEach(({ lab }, i) => {
      const p = [lab[1] * 0.01, (lab[0] - 50) * 0.01, -lab[2] * 0.01, 1];
      const clip = [0, 1, 2, 3].map((r) => mvp[r] * p[0] + mvp[4 + r] * p[1] + mvp[8 + r] * p[2] + mvp[12 + r] * p[3]);
      const x = (clip[0] / clip[3] + 1) / 2;
      const y = (1 - clip[1] / clip[3]) / 2;
      labels[i].style.left = `${x * 100}%`;
      labels[i].style.top = `${y * 100}%`;
      const px = Math.round(x * w);
      const py = Math.round((1 - y) * h);
      let covered = false;
      if (px >= 0 && px < w && py >= 0 && py < h) {
        gl.readPixels(px, py, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
        covered = pixel[3] > 240;
      }
      labels[i].style.visibility = covered ? 'hidden' : '';
    });
  }

  // --- Interaction -----------------------------------------------------------

  let drag = null;
  canvas.addEventListener('pointerdown', (event) => {
    canvas.setPointerCapture(event.pointerId);
    drag = { x: event.clientX, y: event.clientY };
  });
  canvas.addEventListener('pointermove', (event) => {
    if (!drag || !canvas.hasPointerCapture(event.pointerId)) return;
    rotate((event.clientX - drag.x) * 0.008, (event.clientY - drag.y) * 0.008);
    drag = { x: event.clientX, y: event.clientY };
  });
  canvas.addEventListener('pointerup', () => (drag = null));
  canvas.addEventListener('dblclick', () => {
    Object.assign(view, DEFAULT_VIEW);
    requestDraw();
  });
  canvas.addEventListener('keydown', (event) => {
    const step = event.shiftKey ? 0.3 : 0.08;
    const moves = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
    if (!moves[event.key]) return;
    event.preventDefault();
    rotate(...moves[event.key]);
  });

  function rotate(dYaw, dPitch) {
    view.yaw += dYaw;
    view.pitch = Math.max(-1.45, Math.min(1.45, view.pitch + dPitch));
    requestDraw();
  }

  new ResizeObserver(requestDraw).observe(canvas);
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', requestDraw);

  return {
    update(next) {
      settings = { ...settings, ...next };
      requestDraw();
    },
  };
}

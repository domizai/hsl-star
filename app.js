import {
  decode,
  encode,
  luminance,
  lstarFromY,
  hueBasis,
  basisToLinear,
  toHsvHue,
  fromHsvHue,
  toRgb,
  fromRgb,
  toHex,
  toRgbString,
  parseColor,
} from './src/color-space.js';

// The selected colour is kept as an HSV hue, so switching the hue axis moves
// the marker but never changes the colour.
const state = { hsv: 18, l: 62, s: 0.9, mode: 'hsv', preview: false, pureLine: false };

const $ = (id) => document.getElementById(id);
const field = $('field');
const tone = $('tone');
const sat = $('sat');
const hexInput = $('hex');
const rgbInput = $('rgb');

const DECODE_8BIT = Float64Array.from({ length: 256 }, (_, i) => decode(i / 255));
const to8 = (c) => Math.round(encode(c) * 255);
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

try {
  const saved = localStorage.getItem('hue-mode');
  if (saved === 'hsv' || saved === 'oklab') state.mode = saved;
} catch {}

const axisHue = () => fromHsvHue(state.hsv, state.mode);
const currentRgb = () => toRgb({ h: state.hsv, l: state.l, s: state.s });

// --- Rendering --------------------------------------------------------------
//
// Two pickers share the state:
//   field  hue × lightness at the current saturation
//   tone   saturation × lightness at the current hue

let fieldDirty = true;
let toneDirty = true;
let toneHue = null;
let frame = 0;

function schedule({ field = false, tone = false } = {}) {
  fieldDirty ||= field;
  toneDirty ||= tone;
  if (!frame) frame = requestAnimationFrame(draw);
}

const redrawAll = () => schedule({ field: true, tone: true });

function draw() {
  frame = 0;
  if (fieldDirty) renderField();
  if (toneDirty || toneHue !== state.hsv) renderTone();
  fieldDirty = toneDirty = false;
  renderUi();
}

// Fill a canvas pixel by pixel. column(x) returns a function of y that gives
// the linear RGB colour, so per-column work is done once.
function paint(canvas, column) {
  const w = canvas.width;
  const h = canvas.height;
  const context = canvas.getContext('2d');
  const image = context.createImageData(w, h);
  const d = image.data;
  for (let x = 0; x < w; x++) {
    const colourAt = column(x);
    for (let y = 0; y < h; y++) {
      const [r, g, b] = colourAt(y).map(to8);
      const k = (y * w + x) * 4;
      if (state.preview) {
        // Grey of the 8-bit colour actually shown, not of the ideal value.
        const grey = to8(luminance([DECODE_8BIT[r], DECODE_8BIT[g], DECODE_8BIT[b]]));
        d[k] = d[k + 1] = d[k + 2] = grey;
      } else {
        d[k] = r;
        d[k + 1] = g;
        d[k + 2] = b;
      }
      d[k + 3] = 255;
    }
  }
  context.putImageData(image, 0, 0);
  return context;
}

const lightnessRows = (h) => Float64Array.from({ length: h }, (_, y) => 100 * (1 - y / (h - 1)));
const rowOf = (l, h) => (1 - l / 100) * (h - 1);

function renderField() {
  const { width: w, height: h } = field;
  if (!w || !h) return;
  const rows = lightnessRows(h);
  const pureRows = new Float64Array(w);
  const context = paint(field, (x) => {
    const basis = hueBasis(((x + 0.5) / w) * 360, { hue: state.mode });
    pureRows[x] = rowOf(lstarFromY(basis.y), h);
    return (y) => basisToLinear(basis, rows[y], state.s);
  });
  if (state.pureLine) drawPureLine(context, pureRows);
}

function renderTone() {
  toneHue = state.hsv;
  const { width: w, height: h } = tone;
  if (!w || !h) return;
  const rows = lightnessRows(h);
  const basis = hueBasis(state.hsv);
  const context = paint(tone, (x) => {
    const s = x / (w - 1);
    return (y) => basisToLinear(basis, rows[y], s);
  });
  // The pure hue sits on the right edge; this row is where shades turn into tints.
  if (state.pureLine) drawPureLine(context, new Float64Array(w).fill(rowOf(lstarFromY(basis.y), h)));
}

// Where the hue reaches full saturation without black or white mixed in.
function drawPureLine(context, rows) {
  context.save();
  context.beginPath();
  rows.forEach((y, x) => (x ? context.lineTo(x + 0.5, y) : context.moveTo(0.5, y)));
  context.lineJoin = 'round';
  context.strokeStyle = 'rgba(0, 0, 0, 0.75)';
  context.lineWidth = 1.25;
  context.setLineDash([5, 4]);
  context.stroke();
  context.restore();
}

function placeMarker(marker, x, y, hex) {
  marker.style.left = `${x * 100}%`;
  marker.style.top = `${y * 100}%`;
  marker.style.background = hex;
}

function renderUi() {
  const rgb = currentRgb();
  const hex = toHex(rgb);
  const rgbText = toRgbString(rgb);
  const axis = axisHue();

  placeMarker($('field-marker'), axis / 360, 1 - state.l / 100, hex);
  placeMarker($('tone-marker'), state.s, 1 - state.l / 100, hex);
  field.setAttribute(
    'aria-valuetext',
    `Hue ${axis.toFixed(0)} degrees, lightness ${state.l.toFixed(0)}, ${hex}`,
  );
  tone.setAttribute(
    'aria-valuetext',
    `Saturation ${Math.round(state.s * 100)} percent, lightness ${state.l.toFixed(0)}, ${hex}`,
  );

  const stops = [];
  for (let i = 0; i <= 10; i++) {
    stops.push(toHex(toRgb({ h: state.hsv, l: state.l, s: i / 10 })));
  }
  sat.style.setProperty('--track', `linear-gradient(to right, ${stops.join(', ')})`);
  sat.style.setProperty('--thumb', hex);
  sat.value = (state.s * 100).toFixed(1);
  $('sat-out').textContent = `${Math.round(state.s * 100)}%`;

  $('swatch').style.background = hex;
  if (document.activeElement !== hexInput) hexInput.value = hex;
  if (document.activeElement !== rgbInput) rgbInput.value = rgbText;

  $('out-h').textContent =
    state.mode === 'hsv' ? `${axis.toFixed(1)}°` : `${axis.toFixed(1)}° (HSV ${state.hsv.toFixed(1)}°)`;
  $('out-l').textContent = state.l.toFixed(1);
  $('out-s').textContent = `${(state.s * 100).toFixed(1)}%`;
}

const resizer = new ResizeObserver(() => {
  for (const canvas of [field, tone]) {
    const w = Math.round(canvas.clientWidth);
    const h = Math.round(canvas.clientHeight);
    if (w !== canvas.width || h !== canvas.height) {
      canvas.width = w;
      canvas.height = h;
      schedule(canvas === field ? { field: true } : { tone: true });
    }
  }
});
resizer.observe(field);
resizer.observe(tone);

// --- Picker interaction --------------------------------------------------------

// Pointer dragging on a picker; onPick gets x and y as fractions of its size.
function makeDraggable(canvas, onPick) {
  const wrap = canvas.parentElement;
  const pick = (event) => {
    const rect = canvas.getBoundingClientRect();
    onPick(
      clamp((event.clientX - rect.left) / rect.width, 0, 1),
      clamp((event.clientY - rect.top) / rect.height, 0, 1),
    );
    clearError();
  };
  wrap.addEventListener('pointerdown', (event) => {
    wrap.setPointerCapture(event.pointerId);
    canvas.focus({ preventScroll: true });
    pick(event);
  });
  wrap.addEventListener('pointermove', (event) => {
    if (wrap.hasPointerCapture(event.pointerId)) pick(event);
  });
}

makeDraggable(field, (x, y) => {
  // Stop just short of 360 so the marker never wraps to the left edge.
  state.hsv = toHsvHue(Math.min(x, 0.9999) * 360, state.mode);
  state.l = (1 - y) * 100;
  schedule();
});

makeDraggable(tone, (x, y) => {
  state.s = x;
  state.l = (1 - y) * 100;
  schedule({ field: true });
});

field.addEventListener('keydown', (event) => {
  const step = event.shiftKey ? 10 : 1;
  let axis = axisHue();
  switch (event.key) {
    case 'ArrowLeft': axis -= step; break;
    case 'ArrowRight': axis += step; break;
    case 'ArrowUp': state.l = clamp(state.l + step, 0, 100); break;
    case 'ArrowDown': state.l = clamp(state.l - step, 0, 100); break;
    default: return;
  }
  event.preventDefault();
  state.hsv = toHsvHue(axis, state.mode);
  schedule();
});

tone.addEventListener('keydown', (event) => {
  const step = event.shiftKey ? 10 : 1;
  switch (event.key) {
    case 'ArrowLeft': state.s = clamp(state.s - step / 100, 0, 1); break;
    case 'ArrowRight': state.s = clamp(state.s + step / 100, 0, 1); break;
    case 'ArrowUp': state.l = clamp(state.l + step, 0, 100); break;
    case 'ArrowDown': state.l = clamp(state.l - step, 0, 100); break;
    default: return;
  }
  event.preventDefault();
  schedule({ field: event.key === 'ArrowLeft' || event.key === 'ArrowRight' });
});

// --- Controls ------------------------------------------------------------------

sat.addEventListener('input', () => {
  state.s = Number(sat.value) / 100;
  schedule({ field: true });
});

for (const radio of document.querySelectorAll('input[name="hue-mode"]')) {
  radio.checked = radio.value === state.mode;
  radio.addEventListener('change', () => {
    state.mode = radio.value;
    try {
      localStorage.setItem('hue-mode', state.mode);
    } catch {}
    schedule({ field: true });
  });
}

$('pure-line').addEventListener('change', (event) => {
  state.pureLine = event.target.checked;
  redrawAll();
});

$('preview').addEventListener('change', (event) => {
  state.preview = event.target.checked;
  redrawAll();
});

// --- Hex and RGB input -------------------------------------------------------------

function clearError() {
  $('error').textContent = '';
  hexInput.removeAttribute('aria-invalid');
  rgbInput.removeAttribute('aria-invalid');
}

function commit(input) {
  const rgb = parseColor(input.value);
  if (!rgb) {
    input.setAttribute('aria-invalid', 'true');
    $('error').textContent =
      input === hexInput ? 'Enter a hex value like #3a7bd5.' : 'Enter RGB like rgb(58, 123, 213).';
    return;
  }
  clearError();
  const coords = fromRgb(rgb);
  // Greys have no hue: keep the current one so the marker stays in place.
  if (coords.s > 1e-6) state.hsv = coords.h;
  state.l = coords.l;
  state.s = coords.s;
  input.blur();
  redrawAll();
}

for (const input of [hexInput, rgbInput]) {
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') commit(input);
    if (event.key === 'Escape') {
      // Restore the current value first, so the change event on blur
      // doesn't commit the discarded text.
      const rgb = currentRgb();
      input.value = input === hexInput ? toHex(rgb) : toRgbString(rgb);
      clearError();
      input.blur();
    }
  });
  input.addEventListener('change', () => commit(input));
  input.addEventListener('input', clearError);
}

// --- Copy --------------------------------------------------------------------------

let statusTimer = 0;

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const helper = document.createElement('textarea');
    helper.value = text;
    helper.style.position = 'absolute';
    helper.style.opacity = '0';
    document.body.appendChild(helper);
    helper.select();
    const ok = document.execCommand('copy');
    helper.remove();
    return ok;
  }
}

for (const button of document.querySelectorAll('[data-copy]')) {
  button.addEventListener('click', async () => {
    const rgb = currentRgb();
    const text = button.dataset.copy === 'hex' ? toHex(rgb) : toRgbString(rgb);
    const ok = await copyText(text);
    button.textContent = ok ? 'Copied' : 'Failed';
    $('status').textContent = ok ? `Copied ${text}` : 'Copying isn’t available in this browser.';
    clearTimeout(statusTimer);
    statusTimer = setTimeout(() => {
      for (const b of document.querySelectorAll('[data-copy]')) b.textContent = 'Copy';
      $('status').textContent = '';
    }, 1500);
  });
}

redrawAll();

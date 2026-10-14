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
const ctx = field.getContext('2d');
const wrap = $('field-wrap');
const marker = $('marker');
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

let fieldDirty = true;
let frame = 0;

function schedule(redrawField = false) {
  fieldDirty ||= redrawField;
  if (!frame) frame = requestAnimationFrame(draw);
}

function draw() {
  frame = 0;
  if (fieldDirty) renderField();
  fieldDirty = false;
  renderUi();
}

function renderField() {
  const w = field.width;
  const h = field.height;
  if (!w || !h) return;
  const image = ctx.createImageData(w, h);
  const d = image.data;
  const rows = Float64Array.from({ length: h }, (_, y) => 100 * (1 - y / (h - 1)));
  const pureRows = new Float64Array(w);

  for (let x = 0; x < w; x++) {
    const basis = hueBasis(((x + 0.5) / w) * 360, { hue: state.mode });
    pureRows[x] = (1 - lstarFromY(basis.y) / 100) * (h - 1);
    for (let y = 0; y < h; y++) {
      const [r, g, b] = basisToLinear(basis, rows[y], state.s).map(to8);
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
  ctx.putImageData(image, 0, 0);
  if (state.pureLine) drawPureLine(pureRows);
}

// Where each hue reaches full saturation without black or white mixed in.
function drawPureLine(pureRows) {
  ctx.save();
  ctx.beginPath();
  pureRows.forEach((y, x) => (x ? ctx.lineTo(x + 0.5, y) : ctx.moveTo(0.5, y)));
  ctx.lineJoin = 'round';
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.75)';
  ctx.lineWidth = 1.25;
  ctx.setLineDash([5, 4]);
  ctx.stroke();
  ctx.restore();
}

function renderUi() {
  const rgb = currentRgb();
  const hex = toHex(rgb);
  const rgbText = toRgbString(rgb);
  const axis = axisHue();

  marker.style.left = `${(axis / 360) * 100}%`;
  marker.style.top = `${(1 - state.l / 100) * 100}%`;
  marker.style.background = hex;
  field.setAttribute(
    'aria-valuetext',
    `Hue ${axis.toFixed(0)} degrees, lightness ${state.l.toFixed(0)}, ${hex}`,
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

new ResizeObserver(() => {
  const w = Math.round(field.clientWidth);
  const h = Math.round(field.clientHeight);
  if (w !== field.width || h !== field.height) {
    field.width = w;
    field.height = h;
    schedule(true);
  }
}).observe(field);

// --- Field interaction -------------------------------------------------------

function pickAt(event) {
  const rect = field.getBoundingClientRect();
  // Stop just short of 360 so the marker never wraps to the left edge.
  const x = clamp((event.clientX - rect.left) / rect.width, 0, 0.9999);
  const y = clamp((event.clientY - rect.top) / rect.height, 0, 1);
  state.hsv = toHsvHue(x * 360, state.mode);
  state.l = (1 - y) * 100;
  clearError();
  schedule();
}

wrap.addEventListener('pointerdown', (event) => {
  wrap.setPointerCapture(event.pointerId);
  field.focus({ preventScroll: true });
  pickAt(event);
});
wrap.addEventListener('pointermove', (event) => {
  if (wrap.hasPointerCapture(event.pointerId)) pickAt(event);
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

// --- Controls ------------------------------------------------------------------

sat.addEventListener('input', () => {
  state.s = Number(sat.value) / 100;
  schedule(true);
});

for (const radio of document.querySelectorAll('input[name="hue-mode"]')) {
  radio.checked = radio.value === state.mode;
  radio.addEventListener('change', () => {
    state.mode = radio.value;
    try {
      localStorage.setItem('hue-mode', state.mode);
    } catch {}
    schedule(true);
  });
}

$('pure-line').addEventListener('change', (event) => {
  state.pureLine = event.target.checked;
  schedule(true);
});

$('preview').addEventListener('change', (event) => {
  state.preview = event.target.checked;
  schedule(true);
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
  schedule(true);
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

schedule(true);

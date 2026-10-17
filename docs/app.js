import * as hslStar from './src/hsl-star.js';
import { paletteGradient, interpolatePalette, toneScale, paletteToCss, paletteToJson, paletteToAse } from './src/palette.js';
import { createSolidView } from './solid-view.js';
import { createMiniPicker } from './mini-picker.js';

// The selected colour is kept as an HSV hue, so switching the hue axis moves
// the marker but never changes the colour.
const state = {
  hsv: 18,
  l: 62,
  s: 0.9,
  mode: 'hsv',
  preview: false,
  pureLine: false,
  optimal: true,
  cut: false,
};

const $ = (id) => document.getElementById(id);
const field = $('field');
const tone = $('tone');
const sat = $('sat');
const hexInput = $('hex');
const coordInputs = { h: $('in-h'), l: $('in-l'), s: $('in-s') };
const rgbInput = $('rgb');

let solid = null;
try {
  solid = createSolidView($('solid'), $('solid-labels'));
} catch (error) {
  console.error(error);
}
if (!solid) $('solid-fallback').hidden = false;

const DECODE_8BIT = Float64Array.from({ length: 256 }, (_, i) => hslStar.decode(i / 255));
const to8 = (c) => Math.round(hslStar.encode(c) * 255);
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

try {
  const saved = localStorage.getItem('hue-mode');
  if (saved === 'hsv' || saved === 'oklab') state.mode = saved;
} catch {}

const axisHue = () => hslStar.fromHsvHue(state.hsv, state.mode);
const currentRgb = () => hslStar.toRgb({ h: state.hsv, l: state.l, s: state.s });

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
        const grey = to8(hslStar.luminance([DECODE_8BIT[r], DECODE_8BIT[g], DECODE_8BIT[b]]));
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
    const basis = hslStar.hueBasis(((x + 0.5) / w) * 360, { hue: state.mode });
    pureRows[x] = rowOf(hslStar.lstarFromY(basis.y), h);
    return (y) => hslStar.basisToLinear(basis, rows[y], state.s);
  });
  if (state.pureLine) drawPureLine(context, pureRows);
}

function renderTone() {
  toneHue = state.hsv;
  const { width: w, height: h } = tone;
  if (!w || !h) return;
  const rows = lightnessRows(h);
  const basis = hslStar.hueBasis(state.hsv);
  const context = paint(tone, (x) => {
    const s = x / (w - 1);
    return (y) => hslStar.basisToLinear(basis, rows[y], s);
  });
  // The pure hue sits on the right edge; this row is where shades turn into tints.
  if (state.pureLine) drawPureLine(context, new Float64Array(w).fill(rowOf(hslStar.lstarFromY(basis.y), h)));
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
  solid?.update({
    h: state.hsv,
    l: state.l,
    s: state.s,
    optimal: state.optimal,
    cut: state.cut,
    pureLine: state.pureLine,
    preview: state.preview,
  });

  const rgb = currentRgb();
  const hex = hslStar.toHex(rgb);
  const rgbText = hslStar.toRgbString(rgb);
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
    stops.push(hslStar.toHex(hslStar.toRgb({ h: state.hsv, l: state.l, s: i / 10 })));
  }
  sat.style.setProperty('--track', `linear-gradient(to right, ${stops.join(', ')})`);
  sat.style.setProperty('--thumb', hex);
  sat.value = (state.s * 100).toFixed(1);
  $('sat-out').textContent = `${Math.round(state.s * 100)}%`;

  $('swatch').style.background = hex;
  if (document.activeElement !== hexInput) hexInput.value = hex;
  if (document.activeElement !== rgbInput) rgbInput.value = rgbText;

  // Show the hue on the current axis; the perceptual axis also gets the HSV value.
  const shown = { h: axis, l: state.l, s: state.s * 100 };
  for (const [key, input] of Object.entries(coordInputs)) {
    if (document.activeElement !== input) input.value = shown[key].toFixed(1);
  }
  $('hue-note').textContent = state.mode === 'hsv' ? '' : `HSV ${state.hsv.toFixed(1)}°`;

  scheduleHashWrite();
}

// --- Shareable link ------------------------------------------------------------------
//
// The URL hash holds the selected colour as "h,l,s": HSV hue in degrees, L*,
// saturation in percent, e.g. #236.1,75.4,100.0. The hue is always the HSV
// hue, so a link means the same colour whichever hue axis the viewer uses.

const formatHash = () => `#${[state.hsv, state.l, state.s * 100].map((v) => v.toFixed(1)).join(',')}`;

function parseHash(hash) {
  const parts = decodeURIComponent(hash.replace(/^#/, '')).split(',').map((p) => p.trim());
  if (parts.length !== 3 || parts.some((p) => p === '')) return null;
  const [h, l, s] = parts.map(Number);
  if (![h, l, s].every(Number.isFinite)) return null;
  if (h < 0 || h > 360 || l < 0 || l > 100 || s < 0 || s > 100) return null;
  return { hsv: h % 360, l, s: s / 100 };
}

function applyHash() {
  const coords = parseHash(location.hash);
  if (!coords) return false;
  Object.assign(state, coords);
  return true;
}

// The hash is written when an interaction ends, not while it's going on:
// on release after dragging a picker or the saturation slider, and after a
// short pause for keys and typed values (held arrow keys repeat quickly, and
// browsers limit how often a page may update its history).
let dragging = false;
let hashTimer = 0;

function writeHash() {
  clearTimeout(hashTimer);
  hashTimer = 0;
  const hash = formatHash();
  if (location.hash !== hash) history.replaceState(null, '', hash);
}

function scheduleHashWrite() {
  if (dragging) return;
  clearTimeout(hashTimer);
  hashTimer = setTimeout(writeHash, 250);
}

function trackDrag(element) {
  element.addEventListener('pointerdown', () => (dragging = true));
}

// Listen on the window, so a release outside the element still counts.
for (const type of ['pointerup', 'pointercancel']) {
  window.addEventListener(type, () => {
    if (!dragging) return;
    dragging = false;
    writeHash();
  });
}

window.addEventListener('hashchange', () => {
  if (applyHash()) redrawAll();
});

const shareLink = () => location.href.split('#')[0] + formatHash();

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

trackDrag(field.parentElement);
trackDrag(tone.parentElement);
trackDrag(sat);

makeDraggable(field, (x, y) => {
  // Stop just short of 360 so the marker never wraps to the left edge.
  state.hsv = hslStar.toHsvHue(Math.min(x, 0.9999) * 360, state.mode);
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
  state.hsv = hslStar.toHsvHue(axis, state.mode);
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

$('optimal').addEventListener('change', (event) => {
  state.optimal = event.target.checked;
  schedule();
});

$('cut').addEventListener('change', (event) => {
  state.cut = event.target.checked;
  schedule();
});

// --- Hex and RGB input -------------------------------------------------------------

function clearError() {
  $('error').textContent = '';
  for (const input of [hexInput, rgbInput, ...Object.values(coordInputs)]) {
    input.removeAttribute('aria-invalid');
  }
}

function commit(input) {
  const rgb = hslStar.parseColor(input.value);
  if (!rgb) {
    input.setAttribute('aria-invalid', 'true');
    $('error').textContent =
      input === hexInput ? 'Enter a hex value like #3a7bd5.' : 'Enter RGB like rgb(58, 123, 213).';
    return;
  }
  clearError();
  selectColour(rgb);
  input.blur();
}

function selectColour(rgb) {
  const coords = hslStar.fromRgb(rgb);
  // Greys have no hue: keep the current one so the marker stays in place.
  if (coords.s > 1e-6) state.hsv = coords.h;
  state.l = coords.l;
  state.s = coords.s;
  redrawAll();
}

for (const input of [hexInput, rgbInput]) {
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') commit(input);
    if (event.key === 'Escape') {
      // Restore the current value first, so the change event on blur
      // doesn't commit the discarded text.
      const rgb = currentRgb();
      input.value = input === hexInput ? hslStar.toHex(rgb) : hslStar.toRgbString(rgb);
      clearError();
      input.blur();
    }
  });
  input.addEventListener('change', () => commit(input));
  input.addEventListener('input', clearError);
}

// --- HSL* coordinate input ---------------------------------------------------------

const COORD_LIMITS = {
  h: { max: 360, message: 'Enter a hue from 0 to 360.' },
  l: { max: 100, message: 'Enter a lightness from 0 to 100.' },
  s: { max: 100, message: 'Enter a saturation from 0 to 100.' },
};

function commitCoord(key) {
  const input = coordInputs[key];
  const value = input.value.trim() === '' ? NaN : Number(input.value);
  if (!Number.isFinite(value) || value < 0 || value > COORD_LIMITS[key].max) {
    input.setAttribute('aria-invalid', 'true');
    $('error').textContent = COORD_LIMITS[key].message;
    return;
  }
  clearError();
  if (key === 'h') state.hsv = hslStar.toHsvHue(value % 360, state.mode);
  if (key === 'l') state.l = value;
  if (key === 's') state.s = value / 100;
  redrawAll();
}

for (const [key, input] of Object.entries(coordInputs)) {
  input.addEventListener('change', () => commitCoord(key));
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      commitCoord(key);
      if (!input.hasAttribute('aria-invalid')) input.blur();
    }
    if (event.key === 'Escape') {
      // Restore the current value first, so the change event on blur
      // doesn't commit the discarded text.
      const current = { h: axisHue(), l: state.l, s: state.s * 100 }[key];
      input.value = current.toFixed(1);
      clearError();
      input.blur();
    }
  });
  input.addEventListener('input', () => {
    input.removeAttribute('aria-invalid');
    $('error').textContent = '';
  });
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
    const kind = button.dataset.copy;
    const text = kind === 'hex' ? hslStar.toHex(rgb) : kind === 'rgb' ? hslStar.toRgbString(rgb) : shareLink();
    const ok = await copyText(text);
    button.dataset.label ??= button.textContent;
    button.textContent = ok ? 'Copied' : 'Failed';
    $('status').textContent = ok ? (kind === 'link' ? 'Link copied' : `Copied ${text}`) : 'Copying isn’t available in this browser.';
    clearTimeout(statusTimer);
    statusTimer = setTimeout(() => {
      for (const b of document.querySelectorAll('[data-copy]')) {
        if (b.dataset.label) b.textContent = b.dataset.label;
      }
      $('status').textContent = '';
    }, 1500);
  });
}

// --- Palette -----------------------------------------------------------------------

const palette = {
  stops: ['#1d3557', '#f7694f', '#f4e9b0'],
  steps: 20,
  tones: 10,
  longHue: false,
  colours: [],
  rows: [],
};
const MAX_STEPS = 256;
const MAX_TONES = 50;

// Popover for editing a palette colour. Edits update the colour's row in
// place, so the popover keeps its anchor while you drag.
let editing = null;
const miniPicker = createMiniPicker({
  getHueMode: () => state.mode,
  onChange: (rgb) => {
    if (!editing) return;
    const hex = hslStar.toHex(rgb);
    palette.stops[editing.index] = hex;
    editing.input.value = hex;
    editing.input.removeAttribute('aria-invalid');
    editing.swatch.style.background = hex;
    renderPalette();
  },
  onLoad: (rgb) => selectColour(rgb),
});

function renderStops() {
  miniPicker.close({ restoreFocus: false });
  editing = null;
  const list = $('stops');
  list.replaceChildren(
    ...palette.stops.map((hex, i) => {
      const row = document.createElement('div');
      row.className = 'stop';
      const rgb = hslStar.parseColor(hex);

      const swatch = document.createElement('button');
      swatch.type = 'button';
      swatch.className = 'stop-swatch';
      swatch.style.background = rgb ? hslStar.toHex(rgb) : 'transparent';
      swatch.setAttribute('aria-label', `Edit colour ${i + 1}. Press Alt and an arrow key to move it.`);
      swatch.setAttribute('aria-haspopup', 'dialog');
      swatch.setAttribute('aria-expanded', 'false');
      swatch.title = 'Click to edit, drag to reorder';
      swatch.addEventListener('click', () => {
        // A drag ends with a click; it shouldn't open the editor.
        if (stopDrag.justDropped) return;
        if (miniPicker.isOpenFor(swatch)) {
          miniPicker.close();
          return;
        }
        editing = { index: i, swatch, input };
        // An invalid entry opens on mid grey; picking a colour replaces it.
        miniPicker.open(swatch, hslStar.parseColor(input.value) ?? [0.5, 0.5, 0.5]);
      });

      const input = document.createElement('input');
      input.value = hex;
      input.spellcheck = false;
      input.autocomplete = 'off';
      input.setAttribute('aria-label', `Colour ${i + 1}`);
      if (!rgb) input.setAttribute('aria-invalid', 'true');
      input.addEventListener('change', () => {
        palette.stops[i] = input.value.trim();
        renderStops();
        renderPalette();
      });

      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'stop-remove';
      remove.textContent = 'Remove';
      remove.setAttribute('aria-label', `Remove colour ${i + 1}`);
      remove.addEventListener('click', () => {
        if (palette.stops.length <= 2) {
          $('palette-error').textContent = 'A palette needs at least two colours.';
          return;
        }
        palette.stops.splice(i, 1);
        renderStops();
        renderPalette();
      });

      enableStopDrag(swatch, row, i);
      swatch.addEventListener('keydown', (event) => {
        if (!event.altKey || (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight')) return;
        event.preventDefault();
        const to = i + (event.key === 'ArrowLeft' ? -1 : 1);
        if (to < 0 || to >= palette.stops.length) return;
        moveStop(i, to);
        $('stops').children[to].querySelector('.stop-swatch').focus();
      });

      row.append(swatch, input, remove);
      return row;
    }),
  );
}

function moveStop(from, to) {
  const [stop] = palette.stops.splice(from, 1);
  palette.stops.splice(to, 0, stop);
  renderStops();
  renderPalette();
}

// --- Reordering colours by dragging their swatch -------------------------------------
//
// Pointer events rather than native drag and drop, so it works with touch and
// a click (no movement) still opens the editor.

const DRAG_THRESHOLD = 4;
const stopDrag = { justDropped: false };
const dropMarker = document.createElement('div');
dropMarker.className = 'stop-drop-marker';

// Index (0 … n) before which a colour dropped at (x, y) would be inserted.
function insertionIndex(rows, x, y) {
  const index = rows.findIndex((row) => {
    const r = row.getBoundingClientRect();
    return y < r.top || (y <= r.bottom && x < r.left + r.width / 2);
  });
  return index === -1 ? rows.length : index;
}

function enableStopDrag(swatch, row, index) {
  let start = null;
  let dragging = false;
  let newIndex = index;

  const rows = () => [...$('stops').querySelectorAll('.stop')];

  swatch.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) return;
    start = { x: event.clientX, y: event.clientY, id: event.pointerId };
    // Capture right away, so a fast first move outside the swatch still counts.
    swatch.setPointerCapture(event.pointerId);
  });

  swatch.addEventListener('pointermove', (event) => {
    if (!start || event.pointerId !== start.id) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (!dragging) {
      if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
      dragging = true;
      miniPicker.close({ restoreFocus: false });
      row.classList.add('dragging');
      $('stops').appendChild(dropMarker);
    }
    row.style.transform = `translate(${dx}px, ${dy}px)`;

    // The dragged row follows the pointer, so leave it out: the index among
    // the remaining rows is the new position.
    const others = rows().filter((r) => r !== row);
    newIndex = insertionIndex(others, event.clientX, event.clientY);
    const list = $('stops').getBoundingClientRect();
    const target = others[Math.min(newIndex, others.length - 1)].getBoundingClientRect();
    const x = newIndex < others.length ? target.left - 7 : target.right + 5;
    dropMarker.style.left = `${x - list.left}px`;
    dropMarker.style.top = `${target.top - list.top}px`;
    dropMarker.style.height = `${target.height}px`;
  });

  const finish = (event, cancelled) => {
    if (!start || event.pointerId !== start.id) return;
    start = null;
    if (!dragging) return;
    dragging = false;
    row.classList.remove('dragging');
    row.style.transform = '';
    dropMarker.remove();
    stopDrag.justDropped = true;
    setTimeout(() => (stopDrag.justDropped = false));
    if (!cancelled && newIndex !== index) moveStop(index, newIndex);
  };
  swatch.addEventListener('pointerup', (event) => finish(event, false));
  swatch.addEventListener('pointercancel', (event) => finish(event, true));
}

function renderPalette() {
  const error = $('palette-error');
  const out = $('swatches');
  const stops = palette.stops.map(hslStar.parseColor);
  const steps = palette.steps;
  let message = '';
  if (stops.some((c) => !c)) message = 'Enter every colour as hex or RGB, like #3a7bd5.';
  else if (!Number.isInteger(steps) || steps < 2 || steps > MAX_STEPS) message = `Use between 2 and ${MAX_STEPS} steps.`;
  else if (steps < stops.length) message = 'Use at least as many steps as colours.';
  const tones = palette.tones;
  const tonesValid = Number.isInteger(tones) && tones >= 0 && tones <= MAX_TONES;
  if (!message && !tonesValid) message = `Use between 0 and ${MAX_TONES} tints and shades.`;

  error.textContent = message;
  $('steps').toggleAttribute('aria-invalid', message.includes('steps'));
  $('tones').toggleAttribute('aria-invalid', !tonesValid);
  if (message) {
    palette.colours = [];
    palette.rows = [];
    palette.validStops = null;
    out.replaceChildren();
    renderGradients();
    return;
  }

  palette.colours = interpolatePalette(stops, steps, { hue: state.mode, longHue: palette.longHue });
  palette.validStops = stops;
  renderGradients();
  // One column per palette colour, the colours themselves in the middle row,
  // tints above and shades below. Rows hold equal steps of L* from the base,
  // so every column lines up on its base colour. The swatches are square, so
  // when there are more tones than colours the grid would be taller than
  // wide: then turn it, with the colours in the middle column and the tints
  // to the right.
  palette.rows = palette.colours.map((base) => ({ base, ...toneScale(base, tones, { hue: state.mode }) }));
  const toneCount = tones * 2 + 1;
  const turned = toneCount > palette.rows.length;
  out.style.setProperty('--columns', turned ? toneCount : palette.rows.length);
  out.style.setProperty('--rows', turned ? palette.rows.length : toneCount);
  out.classList.toggle('dense', Math.max(toneCount, palette.rows.length) > 12);
  out.replaceChildren(
    ...palette.rows.flatMap(({ base, shades, tints }, i) =>
      [...tints.slice().reverse(), base, ...shades.slice().reverse()].map((rgb, k) => {
        const item = swatchItem(rgb, rgb === base);
        const position = tones + 1 - tints.length + k; // 1 is the lightest
        item.style.gridColumn = turned ? toneCount + 1 - position : i + 1;
        item.style.gridRow = turned ? i + 1 : position;
        return item;
      }),
    ),
  );
}

function swatchItem(rgb, isBase) {
  const hex = hslStar.toHex(rgb);
  const item = document.createElement('button');
  item.type = 'button';
  item.className = isBase ? 'swatch-item base' : 'swatch-item';
  item.title = `${hex}, click to load into the picker`;
  item.setAttribute('aria-label', `${isBase ? 'Palette colour' : 'Tone'} ${hex}`);
  item.innerHTML = `<span class="chip"></span><span class="hex">${hex}</span>`;
  item.querySelector('.chip').style.background = hex;
  item.addEventListener('click', () => selectColour(rgb));
  return item;
}

// The palette as a continuous gradient and as a stepped bar. Both are drawn
// pixel by pixel, because a CSS gradient would blend in sRGB, not in HSL*.
const gradientCanvas = $('gradient');
const steppedCanvas = $('stepped');

function sizeCanvas(canvas) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.max(1, Math.round(canvas.clientWidth * dpr));
  canvas.height = Math.max(1, Math.round(canvas.clientHeight * dpr));
  return canvas.getContext('2d');
}

// In the lightness preview, show the grey each colour converts to.
const shown = (rgb) =>
  state.preview ? Array(3).fill(hslStar.encode(hslStar.luminance(rgb.map(hslStar.decode)))) : rgb;

function renderGradients() {
  const stops = palette.validStops;
  for (const canvas of [gradientCanvas, steppedCanvas]) sizeCanvas(canvas);
  if (!stops) return;

  const ctx = gradientCanvas.getContext('2d');
  const { width: w, height: h } = gradientCanvas;
  const colourAt = paletteGradient(stops, { hue: state.mode, longHue: palette.longHue });
  const image = ctx.createImageData(w, h);
  for (let x = 0; x < w; x++) {
    const [r, g, b] = hslStar.to8bit(shown(colourAt(x / Math.max(1, w - 1))));
    for (let y = 0; y < h; y++) image.data.set([r, g, b, 255], (y * w + x) * 4);
  }
  ctx.putImageData(image, 0, 0);

  const stepped = steppedCanvas.getContext('2d');
  const n = palette.colours.length;
  palette.colours.forEach((rgb, i) => {
    const x0 = Math.round((i / n) * steppedCanvas.width);
    const x1 = Math.round(((i + 1) / n) * steppedCanvas.width);
    stepped.fillStyle = hslStar.toHex(shown(rgb));
    stepped.fillRect(x0, 0, x1 - x0, steppedCanvas.height);
  });
}

new ResizeObserver(renderGradients).observe(gradientCanvas);
$('preview').addEventListener('change', renderGradients);

$('add-stop').addEventListener('click', () => {
  palette.stops.push(palette.stops[palette.stops.length - 1]);
  renderStops();
  renderPalette();
});

$('add-current').addEventListener('click', () => {
  palette.stops.push(hslStar.toHex(currentRgb()));
  renderStops();
  renderPalette();
});

$('long-hue').checked = palette.longHue;
$('long-hue').addEventListener('change', (event) => {
  palette.longHue = event.target.checked;
  renderPalette();
});

$('tones').value = palette.tones;
$('tones').addEventListener('input', (event) => {
  palette.tones = Number(event.target.value);
  renderPalette();
});

$('steps').value = palette.steps;
$('steps').addEventListener('input', (event) => {
  palette.steps = Number(event.target.value);
  renderPalette();
});

// The hue axis decides which way hues blend, so follow it.
for (const radio of document.querySelectorAll('input[name="hue-mode"]')) {
  radio.addEventListener('change', () => {
    renderPalette();
    miniPicker.refresh();
  });
}

function download(filename, data, type) {
  const url = URL.createObjectURL(new Blob([data], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function paletteStatus(text) {
  $('palette-status').textContent = text;
  clearTimeout(paletteStatus.timer);
  paletteStatus.timer = setTimeout(() => ($('palette-status').textContent = ''), 2000);
}

for (const button of document.querySelectorAll('[data-export]')) {
  button.addEventListener('click', async () => {
    if (!palette.colours.length) return;
    const kind = button.dataset.export;
    const colours = palette.rows;
    if (kind === 'css') download('palette.css', paletteToCss(colours), 'text/css');
    if (kind === 'json') download('palette.json', paletteToJson(colours, { hue: state.mode }), 'application/json');
    if (kind === 'ase') download('palette.ase', paletteToAse(colours), 'application/octet-stream');
    if (kind === 'copy-css') {
      const ok = await copyText(paletteToCss(colours));
      paletteStatus(ok ? 'CSS copied' : 'Copying isn’t available in this browser.');
      return;
    }
    paletteStatus(`Downloaded palette.${kind}`);
  });
}

applyHash();
renderStops();
renderPalette();
redrawAll();

// Compact HSL* picker in a popover: a saturation × lightness square for one
// hue, a hue bar, a swatch, and hex, RGB and HSL* fields. Used to edit the
// palette colours.

import * as hslStar from './src/hsl-star.js';

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const to8 = (c) => Math.round(hslStar.encode(c) * 255);

const TEMPLATE = `
  <div class="mini-area">
    <canvas class="mini-tone" tabindex="0" role="slider"
      aria-label="Saturation and lightness. Use the arrow keys to move, hold Shift for larger steps."></canvas>
    <div class="marker" aria-hidden="true"></div>
  </div>
  <div class="mini-area mini-hue-area">
    <canvas class="mini-hue" tabindex="0" role="slider"
      aria-label="Hue. Use the arrow keys to move, hold Shift for larger steps."></canvas>
    <div class="marker" aria-hidden="true"></div>
  </div>
  <div class="mini-swatch"></div>
  <div class="mini-fields">
    <label>Hex <input data-field="hex" spellcheck="false" autocomplete="off"></label>
    <label>RGB <input data-field="rgb" spellcheck="false" autocomplete="off"></label>
    <div class="mini-coords">
      <label>H <input type="number" data-field="h" min="0" max="360" step="0.1"></label>
      <label>S <input type="number" data-field="s" min="0" max="100" step="0.1"></label>
      <label>L* <input type="number" data-field="l" min="0" max="100" step="0.1"></label>
    </div>
  </div>
  <p class="error mini-error" role="alert"></p>
  <div class="mini-actions">
    <button type="button" data-action="load">Load into picker</button>
    <button type="button" data-action="done">Done</button>
  </div>`;

const FIELD_ERRORS = {
  hex: 'Enter a hex value like #3a7bd5.',
  rgb: 'Enter RGB like rgb(58, 123, 213).',
  h: 'Enter a hue from 0 to 360.',
  s: 'Enter a saturation from 0 to 100.',
  l: 'Enter a lightness from 0 to 100.',
};

export function createMiniPicker({ getHueMode, onChange, onLoad }) {
  const root = document.createElement('div');
  root.className = 'mini-picker';
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-label', 'Edit colour');
  root.hidden = true;
  root.innerHTML = TEMPLATE;
  document.body.appendChild(root);

  const tone = root.querySelector('.mini-tone');
  const hueBar = root.querySelector('.mini-hue');
  const [toneMarker, hueMarker] = root.querySelectorAll('.marker');
  const fields = Object.fromEntries([...root.querySelectorAll('[data-field]')].map((el) => [el.dataset.field, el]));
  const error = root.querySelector('.mini-error');

  // The colour is kept with its HSV hue, like the main picker.
  const colour = { hsv: 0, l: 50, s: 1 };
  let anchor = null;

  const rgb = () => hslStar.toRgb({ h: colour.hsv, l: colour.l, s: colour.s });
  const axisHue = () => hslStar.fromHsvHue(colour.hsv, getHueMode());

  function sizeCanvas(canvas) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(canvas.clientWidth * dpr);
    canvas.height = Math.round(canvas.clientHeight * dpr);
  }

  function paint(canvas, colourAt) {
    const { width: w, height: h } = canvas;
    const ctx = canvas.getContext('2d');
    const image = ctx.createImageData(w, h);
    for (let x = 0; x < w; x++) {
      for (let y = 0; y < h; y++) {
        const [r, g, b] = colourAt(x / Math.max(1, w - 1), y / Math.max(1, h - 1));
        image.data.set([r, g, b, 255], (y * w + x) * 4);
      }
    }
    ctx.putImageData(image, 0, 0);
  }

  function drawTone() {
    const basis = hslStar.hueBasis(colour.hsv);
    paint(tone, (x, y) => hslStar.basisToLinear(basis, (1 - y) * 100, x).map(to8));
  }

  // The hue bar shows the pure hue at every position of the current axis.
  function drawHue() {
    const mode = getHueMode();
    paint(hueBar, (x) => hslStar.to8bit(hslStar.pureHue(hslStar.toHsvHue(Math.min(x, 0.9999) * 360, mode))));
  }

  function render({ tone: redrawTone = false, hue: redrawHue = false, force = false } = {}) {
    if (redrawTone) drawTone();
    if (redrawHue) drawHue();
    const value = rgb();
    const hex = hslStar.toHex(value);
    toneMarker.style.left = `${colour.s * 100}%`;
    toneMarker.style.top = `${(1 - colour.l / 100) * 100}%`;
    toneMarker.style.background = hex;
    hueMarker.style.left = `${(axisHue() / 360) * 100}%`;
    hueMarker.style.top = '50%';
    hueMarker.style.background = hslStar.toHex(hslStar.pureHue(colour.hsv));
    root.querySelector('.mini-swatch').style.background = hex;
    const shown = {
      hex,
      rgb: hslStar.toRgbString(value),
      h: axisHue().toFixed(1),
      s: (colour.s * 100).toFixed(1),
      l: colour.l.toFixed(1),
    };
    for (const [key, input] of Object.entries(fields)) {
      if (force || document.activeElement !== input) input.value = shown[key];
    }
  }

  function changed(redraw) {
    render(redraw);
    onChange?.(rgb());
  }

  function setFromRgb(value) {
    const c = hslStar.fromRgb(value);
    // Greys have no hue: keep the current one.
    if (c.s > 1e-6) colour.hsv = c.h;
    colour.l = c.l;
    colour.s = c.s;
  }

  // --- Dragging and keys ---------------------------------------------------

  function draggable(canvas, onPick) {
    const area = canvas.parentElement;
    const pick = (event) => {
      const rect = canvas.getBoundingClientRect();
      onPick(clamp((event.clientX - rect.left) / rect.width, 0, 1), clamp((event.clientY - rect.top) / rect.height, 0, 1));
    };
    area.addEventListener('pointerdown', (event) => {
      area.setPointerCapture(event.pointerId);
      canvas.focus({ preventScroll: true });
      pick(event);
    });
    area.addEventListener('pointermove', (event) => {
      if (area.hasPointerCapture(event.pointerId)) pick(event);
    });
  }

  draggable(tone, (x, y) => {
    colour.s = x;
    colour.l = (1 - y) * 100;
    changed();
  });

  draggable(hueBar, (x) => {
    // Stop just short of 360 so the marker never wraps to the left edge.
    colour.hsv = hslStar.toHsvHue(Math.min(x, 0.9999) * 360, getHueMode());
    changed({ tone: true });
  });

  tone.addEventListener('keydown', (event) => {
    const step = event.shiftKey ? 10 : 1;
    const moves = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] };
    if (!moves[event.key]) return;
    event.preventDefault();
    colour.s = clamp(colour.s + moves[event.key][0] / 100, 0, 1);
    colour.l = clamp(colour.l + moves[event.key][1], 0, 100);
    changed();
  });

  hueBar.addEventListener('keydown', (event) => {
    const step = event.shiftKey ? 10 : 1;
    const delta = { ArrowLeft: -step, ArrowDown: -step, ArrowRight: step, ArrowUp: step }[event.key];
    if (!delta) return;
    event.preventDefault();
    colour.hsv = hslStar.toHsvHue(axisHue() + delta, getHueMode());
    changed({ tone: true });
  });

  // --- Fields ----------------------------------------------------------------

  function commit(key) {
    const input = fields[key];
    let ok = true;
    if (key === 'hex' || key === 'rgb') {
      const value = hslStar.parseRgb(input.value);
      ok = !!value;
      if (ok) setFromRgb(value);
    } else {
      const value = input.value.trim() === '' ? NaN : Number(input.value);
      const max = key === 'h' ? 360 : 100;
      ok = Number.isFinite(value) && value >= 0 && value <= max;
      if (ok && key === 'h') colour.hsv = hslStar.toHsvHue(value % 360, getHueMode());
      if (ok && key === 's') colour.s = value / 100;
      if (ok && key === 'l') colour.l = value;
    }
    if (!ok) {
      input.setAttribute('aria-invalid', 'true');
      error.textContent = FIELD_ERRORS[key];
      return false;
    }
    input.removeAttribute('aria-invalid');
    error.textContent = '';
    changed({ tone: true, force: true });
    return true;
  }

  for (const [key, input] of Object.entries(fields)) {
    input.addEventListener('change', () => commit(key));
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') commit(key);
    });
    input.addEventListener('input', () => {
      input.removeAttribute('aria-invalid');
      error.textContent = '';
    });
  }

  // --- Opening and closing -------------------------------------------------------

  function position() {
    const rect = anchor.getBoundingClientRect();
    const width = root.offsetWidth;
    const maxLeft = document.documentElement.clientWidth - width - 8;
    root.style.left = `${Math.max(8, Math.min(rect.left, maxLeft)) + window.scrollX}px`;
    root.style.top = `${rect.bottom + 8 + window.scrollY}px`;
  }

  function open(target, value) {
    if (anchor) close({ restoreFocus: false });
    anchor = target;
    anchor.setAttribute('aria-expanded', 'true');
    setFromRgb(value);
    error.textContent = '';
    root.hidden = false;
    position();
    sizeCanvas(tone);
    sizeCanvas(hueBar);
    render({ tone: true, hue: true, force: true });
    tone.focus({ preventScroll: true });
  }

  function close({ restoreFocus = true } = {}) {
    if (!anchor) return;
    // Reset the fields first, so a half-typed value isn't committed on blur.
    render({ force: true });
    for (const input of Object.values(fields)) input.removeAttribute('aria-invalid');
    root.hidden = true;
    anchor.setAttribute('aria-expanded', 'false');
    if (restoreFocus) anchor.focus({ preventScroll: true });
    anchor = null;
  }

  root.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
    }
  });

  root.querySelector('[data-action="done"]').addEventListener('click', () => close());
  root.querySelector('[data-action="load"]').addEventListener('click', () => onLoad?.(rgb()));

  document.addEventListener('pointerdown', (event) => {
    if (anchor && !root.contains(event.target) && !anchor.contains(event.target)) close({ restoreFocus: false });
  });
  window.addEventListener('resize', () => anchor && position());

  return {
    open,
    close,
    isOpenFor: (target) => anchor === target,
    // Redraw after the hue axis changes.
    refresh: () => anchor && render({ hue: true, force: true }),
  };
}

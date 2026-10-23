// The shader's hue table must match the library. The shader itself runs on
// the GPU, so it's checked in the browser: glsl/test/index.html.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { GLSL_FILE, withTables } from '../generate.js';

test('the hue table in hsl-star.glsl is up to date', () => {
  const source = readFileSync(GLSL_FILE, 'utf8');
  assert.ok(source === withTables(source), 'Run "npm run glsl" to regenerate it.');
});

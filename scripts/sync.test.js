// The generated parts of the library files must be current: the version in
// hsl-star.js and hsl-star.glsl, and the shader's hue table. The shader itself
// runs on the GPU, so it's checked in the browser: glsl/test/index.html.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { relative } from 'node:path';
import { synced } from './sync.js';

for (const [file, contents] of Object.entries(synced())) {
  test(`${relative(process.cwd(), file)} is in sync`, () => {
    assert.ok(readFileSync(file, 'utf8') === contents, 'Run "npm run sync" to update it.');
  });
}

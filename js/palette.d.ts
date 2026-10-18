// Type declarations for palette.js.

import type { HueOptions, Rgb, RgbInput } from './hsl-star.js';

export interface PaletteOptions extends HueOptions {
  /** Go the long way round the hue circle. */
  longHue?: boolean;
}

export interface Tones {
  /** Darkest first. */
  shades: Rgb[];
  /** Lightest last. */
  tints: Rgb[];
}

/**
 * A continuous gradient through two or more colours, spaced evenly. Returns a
 * function from a position 0–1 to gamma-encoded sRGB. Throws with fewer than
 * two colours.
 */
export function paletteGradient(stops: readonly RgbInput[], options?: PaletteOptions): (position: number) => Rgb;

/**
 * `steps` evenly spaced colours from the first stop to the last. Stops that
 * fall exactly on a step are returned unchanged. Throws with fewer than two
 * stops or fewer steps than stops.
 */
export function interpolatePalette(stops: readonly RgbInput[], steps: number, options?: PaletteOptions): Rgb[];

/** Shades and tints of a colour in steps of 100 / (steps + 1) L*, without black and white. */
export function toneScale(rgb: RgbInput, steps: number, options?: HueOptions): Tones;

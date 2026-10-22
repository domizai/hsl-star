// Type declarations for hsl-star.js.

/** sRGB or linear-light RGB, channels 0–1. */
export type Rgb = [r: number, g: number, b: number];

/** RGB as accepted by the functions: any three numbers, channels 0–1. */
export type RgbInput = readonly [r: number, g: number, b: number];

/** A colour in HSL*. */
export interface HslStar {
  /** Hue in degrees, 0–360. Values outside wrap around. */
  h: number;
  /** Lightness as CIE L*, 0–100. */
  l: number;
  /** Saturation, 0–1. Not a percentage. */
  s: number;
}

/** `'oklab'`: the HSV hues re-spaced to roughly even perceived steps. `'hsv'`: the hue of HSV and HSL. */
export type HueMode = 'hsv' | 'oklab';

export interface HueOptions {
  /** Hue axis, `'oklab'` by default. Use the same one for both directions. */
  hue?: HueMode;
}

/** What hueBasis computes once per hue, for basisToLinear. */
export interface HueBasis {
  /** The pure colour of the hue, linear light. */
  pure: Rgb;
  /** Its luminance. */
  y: number;
}

/** CIE XYZ. */
export type Xyz = [x: number, y: number, z: number];

/** CIE L*a*b*. */
export type Lab = [l: number, a: number, b: number];

export const HUE_MODES: readonly HueMode[];
export const D65_WHITE: Xyz;

// Converting

/** HSL* to gamma-encoded sRGB. */
export function toRgb(coords: HslStar, options?: HueOptions): Rgb;
/** Gamma-encoded sRGB to HSL*. Greys come back as `{ h: 0, s: 0 }`. */
export function fromRgb(rgb: RgbInput, options?: HueOptions): HslStar;
/** HSL* to linear-light sRGB. */
export function toLinear(coords: HslStar, options?: HueOptions): Rgb;
/** Linear-light sRGB to HSL*. Greys come back as `{ h: 0, s: 0 }`. */
export function fromLinear(rgb: RgbInput, options?: HueOptions): HslStar;
/** Everything that depends on hue alone. Compute it once per hue, then call basisToLinear per pixel. */
export function hueBasis(h: number, options?: HueOptions): HueBasis;
/** Linear-light sRGB for a basis from hueBasis. */
export function basisToLinear(basis: HueBasis, l: number, s: number): Rgb;

// Hue

/** Hue on the given axis to an HSV hue. */
export function toHsvHue(h: number, options?: HueOptions): number;
/** HSV hue to a hue on the given axis. */
export function fromHsvHue(h: number, options?: HueOptions): number;
/** The fully saturated colour of an HSV hue (S = V = 1), gamma-encoded. */
export function pureHue(h: number): Rgb;
/** OKLab hue angle of a linear-light colour, 0–360. */
export function oklabHue(rgb: RgbInput): number;

// Lightness and transfer function

/** One sRGB channel, gamma-encoded to linear light. */
export function decode(c: number): number;
/** One channel, linear light to gamma-encoded. Clamps to 0–1. */
export function encode(c: number): number;
/** Relative luminance Y of a linear-light colour (Rec. 709 weights). */
export function luminance(rgb: RgbInput): number;
/** Luminance to CIE L*. */
export function lstarFromY(y: number): number;
/** CIE L* to luminance. */
export function yFromLstar(l: number): number;

// CIELAB

/** Linear-light sRGB to CIE XYZ, D65 white. */
export function linearToXyz(rgb: RgbInput): Xyz;
/** CIE XYZ to L*a*b* relative to the given white, D65 by default. */
export function xyzToLab(xyz: Readonly<Xyz>, white?: Readonly<Xyz>): Lab;
/** Linear-light sRGB to L*a*b*, D65 white. */
export function linearToLab(rgb: RgbInput): Lab;

// Formatting and parsing

/** `[r, g, b]` with 0–255 integer channels. */
export function to8bit(rgb: RgbInput): Rgb;
/** `'#rrggbb'`. */
export function toHex(rgb: RgbInput): string;
/** `'rgb(r, g, b)'` with 0–255 channels. */
export function toRgbString(rgb: RgbInput): string;
/**
 * Reads `#rgb`, `#rrggbb` (the `#` is optional), `rgb(r, g, b)` and `r, g, b`
 * with 0–255 channels. Returns gamma-encoded sRGB, or null.
 */
export function parseRgb(input: string): Rgb | null;

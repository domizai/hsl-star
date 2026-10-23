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



export const HUE_MODES: readonly HueMode[];

// Converting

/** HSL* to gamma-encoded sRGB. */
export function toSrgb(coords: HslStar, options?: HueOptions): Rgb;
/** Gamma-encoded sRGB to HSL*. Greys come back as `{ h: 0, s: 0 }`. */
export function fromSrgb(rgb: RgbInput, options?: HueOptions): HslStar;
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

// Formatting and parsing

/** `[r, g, b]` with 0–255 integer channels. */
export function to8bit(rgb: RgbInput): Rgb;
/** `'#rrggbb'`. */
export function toHex(rgb: RgbInput): string;
/**
 * Reads `#rgb`, `#rrggbb` (the `#` is optional), `rgb(r, g, b)` and `r, g, b`
 * with 0–255 channels, and CSS `hsl(h, s%, l%)` as classic HSL. Returns
 * gamma-encoded sRGB, or null.
 */
export function parseSrgb(input: string): Rgb | null;

// Colour object

/** RGB channels by name. */
export interface RgbChannels {
  r: number;
  g: number;
  b: number;
}

/** A colour readable in every form. It never changes; with() gives a new one. */
export interface Colour {
  /** HSL* coordinates `{ h, l, s }` on the colour's hue axis. */
  readonly value: HslStar;
  /** 8-bit RGB, `{ r, g, b }` in 0–255. */
  readonly rgb: RgbChannels;
  /** Gamma-encoded sRGB, `{ r, g, b }` in 0–1, unrounded. */
  readonly srgb: RgbChannels;
  /** Linear-light sRGB, `{ r, g, b }` in 0–1. */
  readonly linear: RgbChannels;
  /** `'#rrggbb'`. */
  readonly hex: string;
  /** The same colour with some coordinates changed, as a new colour. */
  with(changes: Partial<HslStar>): Colour;
  /** The hex code. */
  toString(): string;
}

/** Channels as `{ r, g, b }` or `[r, g, b]`. */
export type ChannelsInput = Readonly<RgbChannels> | RgbInput;

/** Makes colours. Naming: rgb is 8-bit (0–255), srgb is gamma-encoded (0–1). */
export interface HslStarFactory {
  /**
   * Makes a colour from HSL* `{ h, l, s }`, 8-bit RGB `{ r, g, b }` or
   * `[r, g, b]` in 0–255, a hex code, or CSS `rgb()` or `hsl()`. CSS `hsl()`
   * is classic HSL, as in a browser, not HSL*. Throws if the input can't be
   * read.
   */
  (input: HslStar | ChannelsInput | string, options?: HueOptions): Colour;
  /** 8-bit RGB, 0–255. Throws outside that range. */
  fromRgb(rgb: ChannelsInput, options?: HueOptions): Colour;
  /** Gamma-encoded sRGB, 0–1, kept exactly. Throws outside that range. */
  fromSrgb(srgb: ChannelsInput, options?: HueOptions): Colour;
  /** `'#rrggbb'` or `'#rgb'`, the `#` optional. */
  fromHex(hex: string, options?: HueOptions): Colour;
  /** CSS `'rgb(r, g, b)'` with 0–255 channels, or `'hsl(h, s%, l%)'` as classic HSL. */
  fromCss(css: string, options?: HueOptions): Colour;
}

declare const hslStar: HslStarFactory;
export default hslStar;

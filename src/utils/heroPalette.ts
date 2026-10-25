import type { CSSProperties } from "react";

// RGB (0–255) → HSL. Used to derive an analogous-but-darker bar color that
// stays in the same family as the cover's dominant color.
function rgbToHsl(r: number, g: number, b: number) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  let h = 0;
  let s = 0;
  if (d) {
    s = d / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case r:
        h = ((((g - b) / d) % 6) + 6) % 6;
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
    }
    h *= 60;
  }
  return { h, s, l };
}

function hslToHex(h: number, s: number, l: number) {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) [r, g] = [c, x];
  else if (h < 120) [r, g] = [x, c];
  else if (h < 180) [g, b] = [c, x];
  else if (h < 240) [g, b] = [x, c];
  else if (h < 300) [r, b] = [x, c];
  else [r, b] = [c, x];
  const to = (v: number) =>
    Math.round((v + m) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`;
}

/** The hero's self-contained color world, derived from a cover's dominant
 *  color. Text/scrim/bar tones are luminance-picked so they read on any cover,
 *  independent of the app theme. */
export interface HeroPalette {
  color: string;
  bar: string;
  text: string;
  subtext: string;
  scrim: string;
  chip: string;
  line: string;
  fill: string;
  shadow: string;
}

export function heroPalette(dominantColor?: string | null): HeroPalette | null {
  const color = dominantColor;
  if (!color) return null;
  const hex = color.replace("#", "");
  if (hex.length !== 6) return null;
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  // Perceived luminance (ITU-R BT.601) → light backgrounds get dark ink.
  const isLight = (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.62;
  // Equalizer bars: analogous hue to the cover, but lightness is pushed to
  // CONTRAST the hero background (darker on light covers, lighter on dark ones)
  // so the bars read on either, and saturation is lifted so they show as color.
  const { h, s, l } = rgbToHsl(r, g, b);
  const barSat = Math.min(1, s * 1.15 + 0.08);
  const barLight = isLight ? Math.max(0.24, l * 0.5) : Math.min(0.82, l + 0.4);
  const bar = hslToHex((h + 340) % 360, barSat, barLight);
  return {
    color,
    bar,
    text: isLight ? "#141414" : "#f5f5f5",
    subtext: isLight ? "rgba(20,20,20,0.66)" : "rgba(245,245,245,0.72)",
    scrim: isLight ? "rgba(255,255,255,0.44)" : "rgba(0,0,0,0.4)",
    chip: isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.12)",
    line: isLight ? "rgba(20,20,20,0.28)" : "rgba(245,245,245,0.34)",
    fill: isLight ? "rgba(20,20,20,0.10)" : "rgba(245,245,245,0.16)",
    // Cover drop-shadow tinted to the dominant hue (darkened) so it grounds the
    // art in the hero's color world instead of flat black.
    shadow: `rgba(${Math.round(r * 0.38)}, ${Math.round(g * 0.38)}, ${Math.round(
      b * 0.38
    )}, 0.32)`,
  };
}

/** Local CSS vars for rendering a hero's own color world. */
export function heroCssVars(palette: HeroPalette): CSSProperties {
  return {
    "--hero-color": palette.color,
    "--hero-bar": palette.bar,
    "--hero-text": palette.text,
    "--hero-subtext": palette.subtext,
    "--hero-scrim": palette.scrim,
    "--hero-chip": palette.chip,
    "--hero-shadow": palette.shadow,
  } as CSSProperties;
}

/** Vars published to :root so fixed siblings (AppBar / ViewNav) tint to the
 *  hero while they float transparently over it. */
export function heroRootVars(palette: HeroPalette): Record<string, string> {
  return {
    "--hero-color": palette.color,
    "--hero-text": palette.text,
    "--hero-subtext": palette.subtext,
    "--hero-line": palette.line,
    "--hero-fill": palette.fill,
  };
}

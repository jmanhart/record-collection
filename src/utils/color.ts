// Small color helpers for deriving a moody, legible palette from album cover
// dominant colors (used by the stats hero mosaic background).

function hexToRgb(hex: string): [number, number, number] | null {
  const h = hex.replace("#", "").trim();
  if (h.length !== 6) return null;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return null;
  return [r, g, b];
}

function rgbToHsl(
  r: number,
  g: number,
  b: number
): { h: number; s: number; l: number } {
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
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
    else if (max === g) h = ((b - r) / d + 2) * 60;
    else h = ((r - g) / d + 4) * 60;
  }
  return { h, s, l };
}

/**
 * Pull a cover's dominant color into a dark, slightly-desaturated tone so a
 * field of them stays moody and keeps light text/chart legible. Clamps
 * lightness to [minL, maxL] and caps saturation. Returns an `hsl()` string;
 * unparseable input falls back to a deep neutral.
 */
export function muteColor(
  hex: string,
  { minL = 0.24, maxL = 0.5, maxS = 0.62 }: { minL?: number; maxL?: number; maxS?: number } = {}
): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return "hsl(255, 32%, 30%)";
  const { h, s, l } = rgbToHsl(rgb[0], rgb[1], rgb[2]);
  const nl = Math.min(maxL, Math.max(minL, l));
  const ns = Math.min(maxS, s);
  return `hsl(${Math.round(h)}, ${Math.round(ns * 100)}%, ${Math.round(nl * 100)}%)`;
}

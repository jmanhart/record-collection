import sharp from "sharp";
import { logError } from "./log.js";

/**
 * Extracts a representative "dominant" color from a cover image buffer.
 *
 * Covers often have a large flat background (near-black/white) plus a smaller
 * area of vivid artwork. A plain average washes that out to mud, so we weight
 * each pixel by its saturation and bucket colors coarsely, then pick the
 * heaviest bucket and return its saturation-weighted mean. If the image is
 * essentially grayscale (no saturated pixels), we fall back to the plain mean
 * so monochrome covers still get a sensible tone.
 *
 * @returns hex string like "#1a2b3c", or null if decoding failed.
 */
export async function extractDominantColor(
  buffer: ArrayBuffer | Buffer
): Promise<string | null> {
  try {
    const input = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
    const { data, info } = await sharp(input)
      .resize(32, 32, { fit: "cover" })
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const channels = info.channels; // 3 after removeAlpha
    const buckets = new Map<
      number,
      { weight: number; r: number; g: number; b: number }
    >();
    let plainR = 0;
    let plainG = 0;
    let plainB = 0;
    let totalWeight = 0;
    let count = 0;
    let best = { weight: 0, r: 0, g: 0, b: 0 };

    for (let i = 0; i < data.length; i += channels) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      plainR += r;
      plainG += g;
      plainB += b;
      count++;

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const sat = max === 0 ? 0 : (max - min) / max;

      // Small base so mildly-colored pixels still register; saturation
      // dominates so vivid artwork outweighs flat backgrounds.
      const weight = 0.05 + sat;
      totalWeight += weight;

      // Coarse 4-bits-per-channel bucket (16 levels each).
      const key = ((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4);
      let bucket = buckets.get(key);
      if (!bucket) {
        bucket = { weight: 0, r: 0, g: 0, b: 0 };
        buckets.set(key, bucket);
      }
      bucket.weight += weight;
      bucket.r += r * weight;
      bucket.g += g * weight;
      bucket.b += b * weight;
      if (bucket.weight > best.weight) best = bucket;
    }

    if (count === 0) return null;

    // Every pixel contributed only the 0.05 base → effectively grayscale;
    // the bucketed pick would be arbitrary noise, so use the plain mean.
    const grayish = totalWeight <= count * 0.08;
    const r = grayish ? plainR / count : best.r / best.weight;
    const g = grayish ? plainG / count : best.g / best.weight;
    const b = grayish ? plainB / count : best.b / best.weight;

    const hex = [r, g, b]
      .map((n) =>
        Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0")
      )
      .join("");
    return `#${hex}`;
  } catch (error) {
    logError("❌ Dominant color extraction failed:", error);
    return null;
  }
}

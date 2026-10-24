import { useMemo } from "react";
import { muteColor } from "../../utils/color";
import styles from "./StatsHeroBackground.module.css";

const COLS = 8;
const ROWS = 6;
const CELLS = COLS * ROWS;

const FALLBACK = ["#4c1d95", "#3b1d80", "#1e1b4b", "#6d28d9", "#312e81"];

// Deterministic shuffle so a given seed (the viewed period) yields a stable
// tile layout — it only reshuffles when you change periods.
function seededShuffle(input: string[], seed: number): string[] {
  const out = [...input];
  let s = seed || 1;
  for (let i = out.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

interface StatsHeroBackgroundProps {
  /** Dominant hex colors of the period's albums (raw). */
  colors: string[];
  /** Stable per period so the mosaic only re-lays-out on period change. */
  seed: number;
}

export function StatsHeroBackground({ colors, seed }: StatsHeroBackgroundProps) {
  const tiles = useMemo(() => {
    const source = colors.length ? colors : FALLBACK;
    const muted = source.map((c) => muteColor(c));
    const shuffled = seededShuffle(muted, seed);
    return Array.from({ length: CELLS }, (_, i) => shuffled[i % shuffled.length]);
  }, [colors, seed]);

  return (
    <div className={styles.bg} aria-hidden>
      <div className={styles.quilt}>
        {tiles.map((color, i) => (
          <span key={i} className={styles.tile} style={{ backgroundColor: color }} />
        ))}
      </div>
      <div className={styles.scrim} />
    </div>
  );
}

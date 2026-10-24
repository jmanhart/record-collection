import { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { muteColor } from "../../utils/color";
import styles from "./StatsHeroBackground.module.css";

const COLS = 8;
const ROWS = 6;
const CELLS = COLS * ROWS;

interface Album {
  color?: string;
  cover?: string;
}

const FALLBACK: Album[] = [
  { color: "#4c1d95" },
  { color: "#3b1d80" },
  { color: "#1e1b4b" },
  { color: "#6d28d9" },
  { color: "#312e81" },
];

// Deterministic shuffle so a given seed (the viewed period) yields a stable
// tile layout — it only reshuffles when you change periods.
function seededShuffle<T>(input: T[], seed: number): T[] {
  const out = [...input];
  let s = seed || 1;
  for (let i = out.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const WASH_POSITIONS = [
  [18, 26],
  [72, 20],
  [40, 66],
  [86, 58],
  [10, 82],
  [58, 44],
];

interface StatsHeroBackgroundProps {
  /** The period's albums (cover art + dominant color). */
  albums: Album[];
  /** Stable per period so the mosaic only re-lays-out on period change. */
  seed: number;
}

export function StatsHeroBackground({ albums, seed }: StatsHeroBackgroundProps) {
  const source = albums.length ? albums : FALLBACK;

  const tiles = useMemo(() => {
    const shuffled = seededShuffle(source, seed);
    return Array.from({ length: CELLS }, (_, i) => shuffled[i % shuffled.length]);
  }, [source, seed]);

  // Soft mesh of a few deeper tones — the atmospheric wash beneath the covers.
  const wash = useMemo(() => {
    const deep = source.map((a) => muteColor(a.color ?? "#3b1d80", { minL: 0.18, maxL: 0.4 }));
    const shuffled = seededShuffle(deep, seed + 7);
    return WASH_POSITIONS.map(
      ([x, y], i) =>
        `radial-gradient(60% 55% at ${x}% ${y}%, ${shuffled[i % shuffled.length]} 0%, transparent 62%)`
    ).join(", ");
  }, [source, seed]);

  return (
    <div className={styles.frame} aria-hidden>
      <AnimatePresence initial={false}>
        <motion.div
          key={seed}
          className={styles.bg}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
        >
          <div className={styles.wash} style={{ backgroundImage: wash }} />
          <div className={styles.quilt}>
            {tiles.map((album, i) => (
              <span
                key={i}
                className={styles.tile}
                style={{
                  backgroundColor: muteColor(album.color ?? "#2a2440"),
                  backgroundImage: album.cover ? `url(${album.cover})` : undefined,
                }}
              />
            ))}
          </div>
          <div className={styles.scrim} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

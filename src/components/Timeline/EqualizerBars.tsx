import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import styles from "./EqualizerBars.module.css";

const BAR_COUNT = 64;

// Deterministic pseudo-random (hash of the index) so each bar keeps its own
// character across renders instead of jumping when the component re-renders.
function rand(seed: number): number {
  const x = Math.sin(seed * 127.1) * 43758.5453;
  return x - Math.floor(x);
}

interface EqualizerBarsProps {
  /** A touch livelier when the record is actually playing. */
  active?: boolean;
}

/**
 * Subtle equalizer pinned to the bottom of the hero: a row of 4px bars that
 * bob independently like a level meter. Animated with Framer Motion; static at
 * a low height when the user prefers reduced motion.
 */
export function EqualizerBars({ active = false }: EqualizerBarsProps) {
  const reduce = useReducedMotion();

  const bars = useMemo(
    () =>
      Array.from({ length: BAR_COUNT }, (_, i) => ({
        peak: 0.35 + rand(i) * (active ? 0.65 : 0.45),
        duration: 0.7 + rand(i + 100) * 0.7,
        delay: rand(i + 200) * 0.6,
      })),
    [active]
  );

  return (
    <div className={styles.bars} aria-hidden>
      {bars.map((bar, i) => (
        <motion.span
          key={i}
          className={styles.bar}
          initial={{ scaleY: 0.15 }}
          animate={reduce ? { scaleY: bar.peak * 0.4 } : { scaleY: [0.15, bar.peak, 0.15] }}
          transition={
            reduce
              ? { duration: 0 }
              : {
                  duration: bar.duration,
                  delay: bar.delay,
                  repeat: Infinity,
                  ease: "easeInOut",
                }
          }
        />
      ))}
    </div>
  );
}

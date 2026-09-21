import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import styles from "./EqualizerBars.module.css";

// Bar (4px) + gap; the count is derived from the available width so the
// spacing stays tight and consistent at any size instead of stretching.
const BAR_PITCH = 8;

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
 * Subtle equalizer pinned to the bottom of the hero, flush with the album's
 * left edge: a row of 4px bars that bob independently like a level meter.
 * Animated with Framer Motion; static at a low height under reduced motion.
 */
export function EqualizerBars({ active = false }: EqualizerBarsProps) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(48);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () =>
      setCount(Math.max(8, Math.floor(el.clientWidth / BAR_PITCH)));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const bars = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        peak: 0.35 + rand(i) * (active ? 0.65 : 0.45),
        duration: 0.7 + rand(i + 100) * 0.7,
        delay: rand(i + 200) * 0.6,
      })),
    [count, active]
  );

  return (
    <div className={styles.bars} ref={ref} aria-hidden>
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

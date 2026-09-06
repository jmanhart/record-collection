import styles from "./TimelineDot.module.css";

interface TimelineDotProps {
  /** When true the dot pulses — reserved for the currently-playing record. */
  pulsing?: boolean;
}

/** The node that sits on the timeline spine. Its own component so it can
 *  pulse when a record is actively playing. */
export function TimelineDot({ pulsing = false }: TimelineDotProps) {
  return (
    <span
      className={`${styles.dot} ${pulsing ? styles.pulsing : ""}`}
      aria-hidden
    />
  );
}

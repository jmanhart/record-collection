import styles from "./TimelineDot.module.css";

interface TimelineDotProps {
  /** When true the dot pulses — reserved for the currently-playing record. */
  pulsing?: boolean;
  /** "purchase" tints the node to mark an acquisition rather than a listen. */
  variant?: "listen" | "purchase";
}

/** The node that sits on the timeline spine. Its own component so it can
 *  pulse when a record is actively playing. */
export function TimelineDot({ pulsing = false, variant = "listen" }: TimelineDotProps) {
  return (
    <span
      className={`${styles.dot} ${variant === "purchase" ? styles.purchase : ""} ${
        pulsing ? styles.pulsing : ""
      }`}
      aria-hidden
    />
  );
}

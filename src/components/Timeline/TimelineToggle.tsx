import styles from "../RecordGrid/RecordGrid.module.css";

interface TimelineToggleProps {
  active: boolean;
  onClick: () => void;
}

/** Pill that switches the collection between the grid and the spins timeline.
 *  Reuses the sort-pill styling so it sits beside Top Spins seamlessly. */
export function TimelineToggle({ active, onClick }: TimelineToggleProps) {
  return (
    <button
      className={`${styles.filterPill} ${styles.sortPill} ${active ? styles.active : ""}`}
      onClick={onClick}
      type="button"
      aria-pressed={active}
    >
      Timeline
    </button>
  );
}

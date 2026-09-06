import styles from "../RecordGrid/RecordGrid.module.css";

interface ViewToggleProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

/** Pill switching the collection between its views (grid / timeline).
 *  Reuses the sort-pill styling so it sits beside Top Spins seamlessly. */
export function ViewToggle({ label, active, onClick }: ViewToggleProps) {
  return (
    <button
      className={`${styles.filterPill} ${styles.sortPill} ${active ? styles.active : ""}`}
      onClick={onClick}
      type="button"
      aria-pressed={active}
    >
      {label}
    </button>
  );
}

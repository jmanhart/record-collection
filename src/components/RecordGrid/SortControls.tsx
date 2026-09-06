import styles from "./RecordGrid.module.css";

interface SortControlsProps {
  sortField: string;
  sortOrder: string;
  onSortFieldChange: (field: string) => void;
  onSortOrderToggle: () => void;
}

const SORT_PILLS: { field: string; label: string }[] = [
  { field: "artist", label: "Artist" },
  { field: "plays", label: "Top plays" },
];

export function SortControls({
  sortField,
  sortOrder,
  onSortFieldChange,
  onSortOrderToggle,
}: SortControlsProps) {
  return (
    <div className={styles.sortGroup}>
      {SORT_PILLS.map(({ field, label }) => {
        const isActive = sortField === field;
        return (
          <button
            key={field}
            className={`${styles.filterPill} ${styles.sortPill} ${isActive ? styles.active : ""}`}
            onClick={() => (isActive ? onSortOrderToggle() : onSortFieldChange(field))}
            type="button"
          >
            <span>{label}</span>
            {isActive && (
              <span className={styles.sortArrow}>
                {sortOrder === "asc" ? " ↑" : " ↓"}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

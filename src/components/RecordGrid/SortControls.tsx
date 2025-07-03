import React from "react";
import styles from "./RecordGrid.module.css";

interface SortControlsProps {
  sortField: string;
  sortOrder: string;
  onSortFieldChange: (field: string) => void;
  onSortOrderToggle: () => void;
}

export function SortControls({
  sortField,
  sortOrder,
  onSortFieldChange,
  onSortOrderToggle,
}: SortControlsProps) {
  return (
    <div>
      <select
        value={sortField}
        onChange={(e) => onSortFieldChange(e.target.value)}
        className={styles.select}
      >
        <option value="dateAdded">Date Added</option>
        <option value="artist">Artist</option>
        <option value="title">Title</option>
        <option value="year">Year</option>
      </select>
      <button
        onClick={onSortOrderToggle}
        aria-label="Toggle sort direction"
        className={styles.sortButton}
      >
        {sortOrder === "asc" ? "↑" : "↓"}
      </button>
    </div>
  );
}

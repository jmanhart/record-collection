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
  const handleArtistClick = () => {
    if (sortField === "artist") {
      // Already on artist, just toggle direction
      onSortOrderToggle();
    } else {
      // Switch to artist sorting
      onSortFieldChange("artist");
    }
  };

  return (
    <>
      <button
        className={`${styles.filterPill} ${styles.sortPill} ${sortField === "artist" ? styles.active : ""}`}
        onClick={handleArtistClick}
        type="button"
      >
        <span>Artist</span>
        <span className={styles.sortArrow}>
          {sortOrder === "asc" ? " ↑" : " ↓"}
        </span>
      </button>
      <button
        className={`${styles.filterPill} ${styles.sortPill} ${sortField === "dateAdded" ? styles.active : ""}`}
        onClick={() => onSortFieldChange("dateAdded")}
        type="button"
      >
        Date Added
      </button>
    </>
  );
}

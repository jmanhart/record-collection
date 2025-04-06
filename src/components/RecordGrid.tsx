import { useState } from "react";
import { useRecords } from "../hooks/useRecords";
import { RecordCard } from "./RecordCard";
import type { Record, SortField, SortOrder } from "../types/Record";
import styles from "./RecordGrid.module.css";

export const RecordGrid = () => {
  const { records, isLoading, error } = useRecords();
  const [selectedRecord, setSelectedRecord] = useState<Record | null>(null);
  const [sortField, setSortField] = useState<SortField>("dateAdded");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  if (isLoading) {
    return <div className={styles.loading}>Loading records...</div>;
  }

  if (error) {
    return (
      <div className={styles.error}>Error loading records: {error.message}</div>
    );
  }

  const sortedRecords = [...records].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    const modifier = sortOrder === "asc" ? 1 : -1;

    if (aValue === undefined) return 1;
    if (bValue === undefined) return -1;

    return aValue < bValue ? -1 * modifier : aValue > bValue ? 1 * modifier : 0;
  });

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.controls}>
        <div className={styles.sortControls}>
          <label>Sort by:</label>
          <select
            value={sortField}
            onChange={(e) => handleSort(e.target.value as SortField)}
            className={styles.select}
          >
            <option value="dateAdded">Date Added</option>
            <option value="artist">Artist</option>
            <option value="title">Title</option>
            <option value="releaseYear">Year</option>
            <option value="listenCount">Listen Count</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className={styles.sortButton}
          >
            {sortOrder === "asc" ? "↑" : "↓"}
          </button>
        </div>
      </div>

      <div className={styles.grid}>
        {sortedRecords.map((record) => (
          <RecordCard
            key={record.id}
            record={record}
            onSelect={setSelectedRecord}
          />
        ))}
      </div>

      {selectedRecord && (
        <div className={styles.modal}>
          {/* We'll implement the record detail modal later */}
          <div className={styles.modalContent}>
            <h2>{selectedRecord.title}</h2>
            <button onClick={() => setSelectedRecord(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

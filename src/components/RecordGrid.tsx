import { useState } from "react";
import { useRecords } from "../hooks/useRecords";
import { RecordCard } from "./RecordCard";
import { Search } from "./ui/Search";
import type { Record, SortField, SortOrder } from "../types/Record";
import styles from "./RecordGrid.module.css";

interface RecordGridProps {
  records: Record[];
  isLoading: boolean;
}

export function RecordGrid({ records, isLoading }: RecordGridProps) {
  const { error } = useRecords();
  const [selectedRecord, setSelectedRecord] = useState<Record | null>(null);
  const [sortField, setSortField] = useState<SortField>("artist");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFormat, setSelectedFormat] = useState<string>("all");
  const [selectedGenre, setSelectedGenre] = useState<string>("all");

  if (isLoading) {
    return <div className={styles.loading}>Loading records...</div>;
  }

  if (error) {
    return (
      <div className={styles.error}>Error loading records: {error.message}</div>
    );
  }

  // Get unique formats and genres
  const formats = Array.from(new Set(records.map((r) => r.format_name)))
    .filter(Boolean)
    .sort();
  const genres = Array.from(
    new Set(records.flatMap((r) => r.genres || []))
  ).sort();

  // Filter records based on search query and categories
  const filteredRecords = records.filter((record) => {
    // Search filter
    const matchesSearch =
      !searchQuery ||
      record.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.artist.toLowerCase().includes(searchQuery.toLowerCase());

    // Format filter
    const matchesFormat =
      selectedFormat === "all" || record.format_name === selectedFormat;

    // Genre filter
    const matchesGenre =
      selectedGenre === "all" || (record.genres || []).includes(selectedGenre);

    return matchesSearch && matchesFormat && matchesGenre;
  });

  // Sort the filtered records
  const sortedRecords = [...filteredRecords].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    const modifier = sortOrder === "asc" ? 1 : -1;

    if (aValue === undefined) return 1;
    if (bValue === undefined) return -1;

    return aValue < bValue ? -1 * modifier : aValue > bValue ? 1 * modifier : 0;
  });

  return (
    <div className={styles.container}>
      <div className={styles.controls}>
        <div className={styles.sortControls}>
          <label>Sort by:</label>
          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value as SortField)}
            className={styles.select}
          >
            <option value="dateAdded">Date Added</option>
            <option value="artist">Artist</option>
            <option value="title">Title</option>
            <option value="year">Year</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className={styles.sortButton}
            aria-label="Toggle sort direction"
          >
            {sortOrder === "asc" ? "↑" : "↓"}
          </button>
        </div>

        <div className={styles.filterControls}>
          <select
            value={selectedFormat}
            onChange={(e) => setSelectedFormat(e.target.value)}
            className={styles.select}
          >
            <option value="all">All Formats</option>
            {formats.map((format) => (
              <option key={format} value={format}>
                {format}
              </option>
            ))}
          </select>

          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className={styles.select}
          >
            <option value="all">All Genres</option>
            {genres.map((genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </select>
        </div>

        <Search
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by title or artist..."
        />
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
          <div className={styles.modalContent}>
            <h2>{selectedRecord.title}</h2>
            <button onClick={() => setSelectedRecord(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

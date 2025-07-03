import { useState, useEffect } from "react";
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

  // Sync searchQuery with URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const query = params.get("search") || "";
    const format = params.get("format") || "all";
    const genre = params.get("genre") || "all";
    setSearchQuery(query);
    setSelectedFormat(format);
    setSelectedGenre(genre);
  }, []);

  const updateURL = (search: string, format: string, genre: string) => {
    const params = new URLSearchParams(window.location.search);
    if (search) params.set("search", search);
    else params.delete("search");
    if (format && format !== "all") params.set("format", format);
    else params.delete("format");
    if (genre && genre !== "all") params.set("genre", genre);
    else params.delete("genre");
    window.history.replaceState(null, "", "?" + params.toString());
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    updateURL(value, selectedFormat, selectedGenre);
  };

  const handleFormatChange = (value: string) => {
    setSelectedFormat(value);
    updateURL(searchQuery, value, selectedGenre);
  };

  const handleGenreChange = (value: string) => {
    setSelectedGenre(value);
    updateURL(searchQuery, selectedFormat, value);
  };

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
            value={selectedGenre}
            onChange={(e) => handleGenreChange(e.target.value)}
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
          onChange={handleSearchChange}
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

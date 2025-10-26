import { useState, useEffect } from "react";
import { RecordCard } from "../RecordCard/RecordCard";
import { Search } from "../Search/Search";
import type { Record, SortField, SortOrder } from "../../types/Record";
import { SortControls } from "./SortControls";
import { FilterControls } from "./FilterControls";
import { RecordGridList } from "./RecordGridList";
import styles from "./RecordGrid.module.css";

interface RecordGridProps {
  records: Record[];
  isLoading: boolean;
}

export function RecordGrid({ records, isLoading }: RecordGridProps) {
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

  // Get unique formats and genres with counts
  const formats = Array.from(new Set(records.map((r) => r.format_name)))
    .filter((f): f is string => typeof f === "string" && !!f)
    .sort();
  const genres = Array.from(
    new Set(records.flatMap((r) => r.genres || []))
  ).sort();

  // Calculate counts for formats and genres
  const formatCounts: Record<string, number> = {};
  const genreCounts: Record<string, number> = {};
  
  records.forEach((record) => {
    if (record.format_name) {
      formatCounts[record.format_name] = (formatCounts[record.format_name] || 0) + 1;
    }
    (record.genres || []).forEach((genre) => {
      genreCounts[genre] = (genreCounts[genre] || 0) + 1;
    });
  });

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
        <SortControls
          sortField={sortField}
          sortOrder={sortOrder}
          onSortFieldChange={(field) => setSortField(field as SortField)}
          onSortOrderToggle={() =>
            setSortOrder(sortOrder === "asc" ? "desc" : "asc")
          }
        />
        
        <Search
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search by title or artist..."
        />

        <FilterControls
          formats={formats}
          genres={genres}
          selectedFormat={selectedFormat}
          selectedGenre={selectedGenre}
          onFormatChange={handleFormatChange}
          onGenreChange={handleGenreChange}
          formatCounts={formatCounts}
          genreCounts={genreCounts}
        />
      </div>

      <div className={styles.grid}>
        <RecordGridList records={sortedRecords} />
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

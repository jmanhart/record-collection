import { useState, useEffect } from "react";
import { Search } from "../Search/Search";
import type { Record, SortField, SortOrder } from "../../types/Record";
import { SortControls } from "./SortControls";
import { RecordGridList } from "./RecordGridList";
import filterConfig from "../../data/filter-config.json";
import styles from "./RecordGrid.module.css";

interface RecordGridProps {
  records: Record[];
  isLoading: boolean;
}

export function RecordGrid({ records, isLoading }: RecordGridProps) {
  const [sortField, setSortField] = useState<SortField>("artist");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFormat, setSelectedFormat] = useState<string>("all");
  const [selectedGenre, setSelectedGenre] = useState<string>("all");

  // Sync state with URL on mount
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

  const handleGenreChange = (value: string) => {
    setSelectedGenre(value);
    updateURL(searchQuery, selectedFormat, value);
  };

  if (isLoading) {
    return <div className={styles.loading}>Loading records...</div>;
  }

  // Get unique genres with counts
  const genres = Array.from(
    new Set(records.flatMap((r) => r.genres || []))
  ).sort();

  const genreCounts: Record<string, number> = {};

  records.forEach((record) => {
    (record.genres || []).forEach((genre) => {
      genreCounts[genre] = (genreCounts[genre] || 0) + 1;
    });
  });

  // Filter records
  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      !searchQuery ||
      record.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.artist.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFormat =
      selectedFormat === "all" || record.format_name === selectedFormat;

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
    <>
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

        <select
          className={styles.genreSelect}
          value={selectedGenre}
          onChange={(e) => handleGenreChange(e.target.value)}
        >
          <option value="all">All Genres</option>
          {genres
            .filter(
              (g) =>
                !filterConfig.excludeGenres.includes(g) &&
                (genreCounts[g] || 0) >= filterConfig.minCount
            )
            .sort((a, b) => (genreCounts[b] || 0) - (genreCounts[a] || 0))
            .map((genre) => (
              <option key={genre} value={genre}>
                {genre} ({genreCounts[genre]})
              </option>
            ))}
        </select>
      </div>

      <div className={styles.grid}>
        <RecordGridList records={sortedRecords} />
      </div>
    </>
  );
}

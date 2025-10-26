import React from "react";
import { Select } from "../common/Select";
import styles from "./RecordGrid.module.css";

interface FilterControlsProps {
  formats: string[];
  genres: string[];
  selectedFormat: string;
  selectedGenre: string;
  onFormatChange: (format: string) => void;
  onGenreChange: (genre: string) => void;
  formatCounts?: Record<string, number>;
  genreCounts?: Record<string, number>;
}

export function FilterControls({
  formats,
  genres,
  selectedFormat,
  selectedGenre,
  onFormatChange,
  onGenreChange,
  formatCounts = {},
  genreCounts = {},
}: FilterControlsProps) {
  // Create genre options for select dropdown
  const totalRecords = Object.values(genreCounts).reduce((sum, count) => sum + count, 0);
  const genreOptions = [
    { value: "all", label: "All Genres", count: totalRecords },
    ...genres.map((genre) => ({
      value: genre,
      label: genre,
      count: genreCounts[genre] || 0,
    })),
  ];

  return (
    <Select
      value={selectedGenre}
      onChange={onGenreChange}
      options={genreOptions}
      placeholder="Select genre..."
      className={styles.genreSelect}
    />
  );
}

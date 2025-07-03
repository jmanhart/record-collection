import React from "react";
import styles from "./RecordGrid.module.css";

interface FilterControlsProps {
  formats: string[];
  genres: string[];
  selectedFormat: string;
  selectedGenre: string;
  onFormatChange: (format: string) => void;
  onGenreChange: (genre: string) => void;
}

export function FilterControls({
  formats,
  genres,
  selectedFormat,
  selectedGenre,
  onFormatChange,
  onGenreChange,
}: FilterControlsProps) {
  return (
    <div>
      <select
        value={selectedFormat}
        onChange={(e) => onFormatChange(e.target.value)}
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
        onChange={(e) => onGenreChange(e.target.value)}
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
  );
}

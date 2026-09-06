import filterConfig from "../../data/filter-config.json";
import type { Record } from "../../types/Record";
import styles from "./RecordGrid.module.css";

interface GenreSelectProps {
  records: Record[];
  value: string;
  onChange: (value: string) => void;
}

export function GenreSelect({ records, value, onChange }: GenreSelectProps) {
  const counts = new Map<string, number>();
  for (const record of records) {
    for (const genre of record.genres || []) {
      counts.set(genre, (counts.get(genre) ?? 0) + 1);
    }
  }

  const genres = Array.from(counts.keys())
    .filter(
      (g) =>
        !filterConfig.excludeGenres.includes(g) &&
        (counts.get(g) ?? 0) >= filterConfig.minCount
    )
    .sort((a, b) => (counts.get(b) ?? 0) - (counts.get(a) ?? 0));

  return (
    <select
      className={styles.filterSelect}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label="Filter by genre"
    >
      <option value="all">All Genres</option>
      {genres.map((genre) => (
        <option key={genre} value={genre}>
          {genre} ({counts.get(genre)})
        </option>
      ))}
    </select>
  );
}

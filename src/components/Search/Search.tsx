import { Search as SearchIcon } from "lucide-react";
import styles from "./Search.module.css";

interface SearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** "compact" renders the pill-shaped, control-skinned bar with a leading
   *  search icon used in the top app bar. */
  variant?: "default" | "compact";
}

export function Search({
  value,
  onChange,
  placeholder = "Search records...",
  variant = "default",
}: SearchProps) {
  const compact = variant === "compact";
  return (
    <div
      className={`${styles.searchContainer} ${compact ? styles.compact : ""}`}
    >
      {compact && (
        <SearchIcon size={20} className={styles.searchIcon} aria-hidden />
      )}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={styles.searchInput}
      />
    </div>
  );
}

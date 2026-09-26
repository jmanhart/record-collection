import { useEffect, useState } from "react";
import { Search as SearchIcon, X } from "lucide-react";
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
  const [focused, setFocused] = useState(false);

  // Dim the album grid (via a body flag) only while the compact search is
  // focused with no query yet — once results are showing they stay fully
  // visible. Cleared on unmount for safety.
  useEffect(() => {
    if (!compact) return;
    const searchMode = focused && value.trim() === "";
    document.body.classList.toggle("search-focused", searchMode);
    return () => document.body.classList.remove("search-focused");
  }, [compact, focused, value]);
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
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      {compact && value && (
        <button
          type="button"
          className={styles.clearButton}
          aria-label="Clear search"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onChange("")}
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}

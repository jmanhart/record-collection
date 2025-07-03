import { Search as SearchIcon } from "lucide-react";
import styles from "./Search.module.css";

interface SearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function Search({
  value,
  onChange,
  placeholder = "Search records...",
}: SearchProps) {
  return (
    <div className={styles.searchContainer}>
      <SearchIcon className={styles.searchIcon} size={18} />
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

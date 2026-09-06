import { Search } from "../Search/Search";
import styles from "./AppBar.module.css";

interface AppBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
}

/**
 * Top-level app bar: pinned on scroll, centered search, bottom divider.
 * The theme toggle is a separate globally-fixed control that floats over
 * this bar's right corner, so it stays put across routes.
 */
export function AppBar({
  search,
  onSearchChange,
  searchPlaceholder = "Search by title or artist...",
}: AppBarProps) {
  return (
    <header className={styles.appBar}>
      <div className={styles.searchSlot}>
        <Search
          value={search}
          onChange={onSearchChange}
          placeholder={searchPlaceholder}
        />
      </div>
    </header>
  );
}

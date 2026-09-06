import type { ReactNode } from "react";
import { Search } from "../Search/Search";
import styles from "./AppBar.module.css";

interface AppBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  /** Controls flanking the search: sort on the left, filters on the right. */
  left?: ReactNode;
  right?: ReactNode;
}

/**
 * Top-level app bar: pinned on scroll, centered search flanked by an
 * optional left (sort) and right (filter) slot, bottom divider. The theme
 * toggle is a separate globally-fixed control that floats over this bar's
 * right corner, so it stays put across routes.
 */
export function AppBar({
  search,
  onSearchChange,
  searchPlaceholder = "Search by title or artist...",
  left,
  right,
}: AppBarProps) {
  return (
    <header className={styles.appBar}>
      <div className={styles.left}>{left}</div>
      <div className={styles.searchSlot}>
        <Search
          value={search}
          onChange={onSearchChange}
          placeholder={searchPlaceholder}
        />
      </div>
      <div className={styles.right}>{right}</div>
    </header>
  );
}

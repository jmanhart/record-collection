import { Search } from "../ui/Search";
import styles from "./Header.module.css";

interface HeaderProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  children?: React.ReactNode;
}

export function Header({ searchValue, onSearchChange, children }: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.leftContent}>
        <h1 className={styles.title}>Record Collection</h1>
      </div>
      <div className={styles.rightContent}>
        <Search value={searchValue} onChange={onSearchChange} />
        <div className={styles.actions}>{children}</div>
      </div>
    </header>
  );
}

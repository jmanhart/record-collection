import styles from "./FilterChips.module.css";

interface FilterChipsProps {
  label: string;
  options: string[];
  counts: Record<string, number>;
  selected: string;
  onSelect: (value: string) => void;
  excludeList?: string[];
  minCount?: number;
}

export function FilterChips({
  label,
  options,
  counts,
  selected,
  onSelect,
  excludeList = [],
  minCount = 1,
}: FilterChipsProps) {
  const filteredOptions = options
    .filter(
      (option) =>
        !excludeList.includes(option) && (counts[option] || 0) >= minCount
    )
    .sort((a, b) => (counts[b] || 0) - (counts[a] || 0));

  const totalCount = Object.values(counts).reduce(
    (sum, count) => sum + count,
    0
  );

  const handleClick = (value: string) => {
    if (value === selected) {
      onSelect("all");
    } else {
      onSelect(value);
    }
  };

  return (
    <div className={styles.chipRow}>
      <span className={styles.label}>{label}</span>
      <button
        className={`${styles.filterPill} ${selected === "all" ? styles.active : ""}`}
        onClick={() => onSelect("all")}
      >
        <span className={styles.filterPillText}>All</span>
        <span className={styles.filterPillCount}>({totalCount})</span>
      </button>
      {filteredOptions.map((option) => (
        <button
          key={option}
          className={`${styles.filterPill} ${selected === option ? styles.active : ""}`}
          onClick={() => handleClick(option)}
        >
          <span className={styles.filterPillText}>{option}</span>
          <span className={styles.filterPillCount}>
            ({counts[option] || 0})
          </span>
        </button>
      ))}
    </div>
  );
}

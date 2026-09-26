import { useMemo } from "react";
import { SearchX } from "lucide-react";
import type { Record, SortField, SortOrder } from "../../types/Record";
import { RecordGridList } from "./RecordGridList";
import { useListens } from "../../hooks/useListens";
import styles from "./RecordGrid.module.css";

interface RecordGridProps {
  records: Record[];
  isLoading: boolean;
  search: string;
  sortField: SortField;
  sortOrder: SortOrder;
  genre: string;
}

export function RecordGrid({
  records,
  isLoading,
  search,
  sortField,
  sortOrder,
  genre,
}: RecordGridProps) {
  const { listens } = useListens();
  const playsByReleaseId = useMemo(() => {
    const counts = new Map<number, number>();
    for (const listen of listens) {
      counts.set(listen.release_id, (counts.get(listen.release_id) ?? 0) + 1);
    }
    return counts;
  }, [listens]);

  if (isLoading) {
    return <div className={styles.loading}>Loading records...</div>;
  }

  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      !search ||
      record.title.toLowerCase().includes(search.toLowerCase()) ||
      record.artist.toLowerCase().includes(search.toLowerCase());

    const matchesGenre =
      genre === "all" || (record.genres || []).includes(genre);

    return matchesSearch && matchesGenre;
  });

  const sortedRecords = [...filteredRecords].sort((a, b) => {
    const modifier = sortOrder === "asc" ? 1 : -1;

    if (sortField === "plays") {
      const aPlays = playsByReleaseId.get(a.id) ?? 0;
      const bPlays = playsByReleaseId.get(b.id) ?? 0;
      return (aPlays - bPlays) * modifier;
    }

    const aValue = a[sortField];
    const bValue = b[sortField];
    if (aValue === undefined) return 1;
    if (bValue === undefined) return -1;
    return aValue < bValue ? -1 * modifier : aValue > bValue ? 1 * modifier : 0;
  });

  if (sortedRecords.length === 0) {
    return (
      <div className={styles.empty}>
        <SearchX size={40} className={styles.emptyIcon} aria-hidden />
        <p className={styles.emptyTitle}>
          {search ? `No results for “${search}”` : "No records to show"}
        </p>
        {search && (
          <p className={styles.emptyHint}>Try a different title or artist.</p>
        )}
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      <RecordGridList records={sortedRecords} playsByReleaseId={playsByReleaseId} />
    </div>
  );
}

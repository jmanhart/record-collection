import { RecordCard } from "../RecordCard/RecordCard";
import type { Record } from "../../types/Record";
import styles from "./WishlistList.module.css";

interface WishlistListProps {
  records: Record[];
  isLoading: boolean;
  search: string;
}

export function WishlistList({ records, isLoading, search }: WishlistListProps) {
  if (isLoading) {
    return <div className={styles.loading}>Loading wishlist...</div>;
  }

  const filteredRecords = records.filter((record) => {
    if (!search) return true;
    const query = search.toLowerCase();
    return (
      record.title.toLowerCase().includes(query) ||
      record.artist.toLowerCase().includes(query)
    );
  });

  const sortedRecords = [...filteredRecords].sort((a, b) =>
    a.artist.localeCompare(b.artist)
  );

  return (
    <>
      <div className={styles.grid}>
        {sortedRecords.map((record) => (
          <RecordCard key={record.id} record={record} />
        ))}
      </div>
    </>
  );
}

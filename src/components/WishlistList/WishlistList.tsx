import { useState } from "react";
import { Search } from "../Search/Search";
import { RecordCard } from "../RecordCard/RecordCard";
import type { Record } from "../../types/Record";
import styles from "./WishlistList.module.css";

interface WishlistListProps {
  records: Record[];
  isLoading: boolean;
}

export function WishlistList({ records, isLoading }: WishlistListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  if (isLoading) {
    return <div className={styles.loading}>Loading wishlist...</div>;
  }

  const filteredRecords = records.filter((record) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
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
      <div className={styles.controls}>
        <Search
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search wishlist..."
        />
      </div>
      <div className={styles.grid}>
        {sortedRecords.map((record) => (
          <RecordCard key={record.id} record={record} />
        ))}
      </div>
    </>
  );
}

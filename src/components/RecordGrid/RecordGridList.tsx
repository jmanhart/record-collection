import { useMemo } from "react";
import { RecordCard } from "../RecordCard/RecordCard";
import { hasArticle } from "../../content/articles/articleIds";
import { useListens } from "../../hooks/useListens";
import type { Record } from "../../types/Record";

interface RecordGridListProps {
  records: Record[];
}

export function RecordGridList({ records }: RecordGridListProps) {
  const { listens } = useListens();

  const playsByReleaseId = useMemo(() => {
    const counts = new Map<number, number>();
    for (const listen of listens) {
      counts.set(listen.release_id, (counts.get(listen.release_id) ?? 0) + 1);
    }
    return counts;
  }, [listens]);

  return (
    <>
      {records.map((record) => (
        <RecordCard
          key={record.id}
          record={record}
          hasArticle={hasArticle(record.id)}
          plays={playsByReleaseId.get(record.id) ?? 0}
        />
      ))}
    </>
  );
}

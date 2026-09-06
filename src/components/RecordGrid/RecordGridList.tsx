import { RecordCard } from "../RecordCard/RecordCard";
import { hasArticle } from "../../content/articles/articleIds";
import type { Record } from "../../types/Record";

interface RecordGridListProps {
  records: Record[];
  playsByReleaseId: Map<number, number>;
}

export function RecordGridList({ records, playsByReleaseId }: RecordGridListProps) {
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

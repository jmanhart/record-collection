import React from "react";
import { RecordCard } from "../RecordCard/RecordCard";
import { hasArticle } from "../../content/articles/articleIds";
import type { Record } from "../../types/Record";

interface RecordGridListProps {
  records: Record[];
}

export function RecordGridList({ records }: RecordGridListProps) {
  return (
    <>
      {records.map((record) => (
        <RecordCard
          key={record.id}
          record={record}
          hasArticle={hasArticle(record.id)}
        />
      ))}
    </>
  );
}

import React from "react";
import { RecordCard } from "../RecordCard/RecordCard";
import { hasArticle } from "../../content/articles/articleIds";
import { useNfcTags } from "../../hooks/useNfcTags";
import type { Record } from "../../types/Record";

interface RecordGridListProps {
  records: Record[];
}

export function RecordGridList({ records }: RecordGridListProps) {
  const { hasNfcTag } = useNfcTags();

  return (
    <>
      {records.map((record) => (
        <RecordCard
          key={record.id}
          record={record}
          hasArticle={hasArticle(record.id)}
          hasNfc={hasNfcTag(record.id)}
        />
      ))}
    </>
  );
}

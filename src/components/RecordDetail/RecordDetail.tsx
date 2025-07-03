import React from "react";
import { useParams, Link } from "react-router-dom";
import { useRecords } from "../../hooks/useRecords";
import { useArticle } from "../../hooks/useArticle";
import ReactMarkdown from "react-markdown";
import styles from "./RecordDetail.module.css";

export function RecordDetail() {
  const { id } = useParams();
  const { records } = useRecords();
  const record = records?.find((r) => r.id === Number(id));

  const { article, isLoading: isLoadingArticle } = useArticle(Number(id));

  if (!record) {
    return (
      <div className={styles.container}>
        <p>Record not found</p>
        <Link to="/" className={styles.backLink}>
          ← Back to collection
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Link to="/" className={styles.backLink}>
        ← Back to collection
      </Link>

      <div className={styles.header}>
        <img
          src={record.supabase_image_url || record.coverImage}
          alt={`${record.title} cover`}
          className={styles.cover}
        />
        <div className={styles.info}>
          <h1>{record.title}</h1>
          <h2>{record.artist}</h2>
          <p>Format: {record.format_name}</p>
          {record.year && <p>Year: {record.year}</p>}
          {record.genres && <p>Genres: {record.genres.join(", ")}</p>}
        </div>
      </div>

      {(isLoadingArticle || article) && (
        <div className={styles.article}>
          <div className={styles.articleHeader}></div>

          {isLoadingArticle ? (
            <div className={styles.loading}>Loading...</div>
          ) : (
            article && (
              <div className={styles.markdown}>
                <ReactMarkdown>{article.content}</ReactMarkdown>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}

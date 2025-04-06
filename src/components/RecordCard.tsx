import { useState } from "react";
import { type Record } from "../types/Record";
import styles from "./RecordCard.module.css";

interface RecordCardProps {
  record: Record;
  onSelect: (record: Record) => void;
}

export const RecordCard = ({ record, onSelect }: RecordCardProps) => {
  const [imageError, setImageError] = useState(false);
  const [showDebug, setShowDebug] = useState(false);

  return (
    <div
      className={styles.card}
      onClick={() => onSelect(record)}
      onDoubleClick={() => setShowDebug(!showDebug)}
    >
      <div className={styles.imageContainer}>
        {record.coverImage && !imageError ? (
          <img
            src={record.coverImage}
            alt={`${record.title} by ${record.artist}`}
            className={styles.image}
            onError={(e) => {
              console.error("Image load error:", {
                src: record.coverImage,
                error: e,
              });
              setImageError(true);
            }}
          />
        ) : (
          <div className={styles.placeholder}>
            <span>{record.title[0]}</span>
            {imageError && <span className={styles.errorIndicator}>!</span>}
          </div>
        )}
      </div>
      <div className={styles.info}>
        <h3 className={styles.title}>{record.title}</h3>
        <p className={styles.artist}>{record.artist}</p>
        <p className={styles.year}>{record.releaseYear}</p>
        {record.listenCount !== undefined && (
          <p className={styles.listens}>Plays: {record.listenCount}</p>
        )}
        {showDebug && (
          <div className={styles.debug}>
            <small>Image path: {record.coverImage || "none"}</small>
          </div>
        )}
      </div>
    </div>
  );
};

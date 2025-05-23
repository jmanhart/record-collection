import { useState } from "react";
import { Link } from "react-router-dom";
import { type Record } from "../types/Record";
import styles from "./RecordCard.module.css";

interface RecordCardProps {
  record: Record;
}

export const RecordCard = ({ record }: RecordCardProps) => {
  const [imageError, setImageError] = useState(false);
  const [showDebug, setShowDebug] = useState(false);

  return (
    <Link to={`/records/${record.id}`} className={styles.cardLink}>
      <div
        className={styles.card}
        onDoubleClick={(e) => {
          e.preventDefault();
          setShowDebug(!showDebug);
        }}
      >
        <div className={styles.imageContainer}>
          {record.supabase_image_url && !imageError ? (
            <img
              src={record.supabase_image_url}
              alt={`${record.title} by ${record.artist}`}
              className={styles.image}
              onError={(e) => {
                console.error("Image load error:", {
                  src: record.supabase_image_url,
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
          {record.year && <p className={styles.year}>{record.year}</p>}
          {record.format_name && (
            <p className={styles.format}>{record.format_name}</p>
          )}
          {showDebug && (
            <div className={styles.debug}>
              <small>Image path: {record.supabase_image_url || "none"}</small>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

import { useEffect } from "react";
import { X } from "lucide-react";
import type { ActivityEvent } from "../../hooks/useActivity";
import { TrackList } from "../TrackList/TrackList";
import { formatRuntimeCompact } from "../../utils/formatDuration";
import styles from "./RecordPanel.module.css";

interface RecordPanelProps {
  event: ActivityEvent;
  plays: number;
  /** Pre-formatted so the panel stays presentational. */
  dayLabel: string;
  timeRange: string;
  onClose: () => void;
}

/** Right-side drawer showing the album's contents for a selected spin.
 *  Same shape as the old timeline's detail panel, decoupled from its
 *  block model so the feed can drive it directly. */
export function RecordPanel({
  event,
  plays,
  dayLabel,
  timeRange,
  onClose,
}: RecordPanelProps) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const record = event.record;
  if (!record) return null;

  const cover = record.supabase_image_url || record.coverImage;
  const trackCount =
    record.tracklist?.filter((t) => t.type_ !== "heading").length ?? 0;
  const meta = [
    record.year,
    record.format_descriptions?.length
      ? record.format_descriptions.join(", ")
      : record.format_name,
    record.genres?.length ? record.genres.join(", ") : null,
  ].filter(Boolean);

  return (
    <aside className={styles.panel} aria-label="Record details">
      <button
        type="button"
        className={styles.close}
        onClick={onClose}
        aria-label="Close details"
      >
        <X size={18} />
      </button>

      <div className={styles.scroll}>
        {cover ? (
          <img src={cover} alt="" className={styles.cover} />
        ) : (
          <div className={styles.coverPlaceholder} />
        )}

        <h2 className={styles.title}>{record.title}</h2>
        <p className={styles.artist}>{record.artist}</p>

        {meta.length > 0 && <p className={styles.meta}>{meta.join(" · ")}</p>}

        <dl className={styles.stats}>
          <div className={`${styles.stat} ${styles.statWide}`}>
            <dt className={styles.statLabel}>Played</dt>
            <dd className={styles.statValue}>{timeRange}</dd>
            <dd className={styles.statSub}>{dayLabel}</dd>
          </div>
          <div className={styles.stat}>
            <dt className={styles.statLabel}>Plays</dt>
            <dd className={styles.statValue}>{plays}</dd>
            <dd className={styles.statSub}>all time</dd>
          </div>
          <div className={styles.stat}>
            <dt className={styles.statLabel}>Tracks</dt>
            <dd className={styles.statValue}>{trackCount}</dd>
            {record.duration_seconds ? (
              <dd className={styles.statSub}>
                {formatRuntimeCompact(record.duration_seconds)} total
              </dd>
            ) : null}
          </div>
        </dl>

        {record.tracklist && record.tracklist.length > 0 && (
          <div className={styles.tracks}>
            <TrackList
              tracks={record.tracklist}
              totalSeconds={record.duration_seconds}
            />
          </div>
        )}
      </div>
    </aside>
  );
}

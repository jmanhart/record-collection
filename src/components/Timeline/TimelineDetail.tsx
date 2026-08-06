import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { TrackList } from "../TrackList/TrackList";
import type { TimelineBlock } from "../../hooks/useTimelineDays";
import { formatDayLabel, formatSpan, formatTimeOfDay } from "./format";
import styles from "./TimelineDetail.module.css";

interface TimelineDetailProps {
  block: TimelineBlock;
  dateKey: string;
  /** How many times this record appears anywhere on the timeline */
  totalListens: number;
  onClose: () => void;
}

export function TimelineDetail({
  block,
  dateKey,
  totalListens,
  onClose,
}: TimelineDetailProps) {
  const record = block.record;
  const cover = record?.supabase_image_url || record?.coverImage;
  const playedMin = block.endMin - block.startMin;
  const trackCount =
    record?.tracklist?.filter((t) => t.type_ !== "heading").length ?? 0;

  const closeRef = useRef<HTMLButtonElement>(null);

  // Escape closes from anywhere, matching the [X]
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const meta = [
    record?.year,
    record?.format_descriptions?.length
      ? record.format_descriptions.join(", ")
      : record?.format_name,
    record?.genres?.length ? record.genres.join(", ") : null,
  ].filter(Boolean);

  return (
    <aside className={styles.panel} aria-label="Listen details">
      <button
        ref={closeRef}
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

        <h2 className={styles.title}>
          {record?.title ?? `Release ${block.releaseId}`}
        </h2>
        <p className={styles.artist}>{record?.artist ?? "Unknown artist"}</p>

        {meta.length > 0 && <p className={styles.meta}>{meta.join(" · ")}</p>}

        <dl className={styles.stats}>
          <div className={styles.stat}>
            <dt className={styles.statLabel}>Played</dt>
            <dd className={styles.statValue}>
              {formatTimeOfDay(block.startMin)}
            </dd>
            <dd className={styles.statSub}>{formatDayLabel(dateKey)}</dd>
          </div>
          <div className={styles.stat}>
            <dt className={styles.statLabel}>On the platter</dt>
            <dd className={styles.statValue}>{formatSpan(playedMin)}</dd>
            {block.truncated && (
              <dd className={styles.statSub}>
                of {formatSpan(block.fullRuntimeMin)}
              </dd>
            )}
          </div>
          <div className={styles.stat}>
            <dt className={styles.statLabel}>Listens</dt>
            <dd className={styles.statValue}>{totalListens}</dd>
            <dd className={styles.statSub}>all time</dd>
          </div>
          <div className={styles.stat}>
            <dt className={styles.statLabel}>Tracks</dt>
            <dd className={styles.statValue}>{trackCount}</dd>
            {record?.duration_seconds ? (
              <dd className={styles.statSub}>
                {formatSpan(Math.round(record.duration_seconds / 60))} total
              </dd>
            ) : null}
          </div>
        </dl>

        {record?.tracklist && record.tracklist.length > 0 && (
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

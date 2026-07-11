import type { TrackListEntry } from "../../types/Record";
import { formatClock } from "../../utils/formatDuration";
import styles from "./TrackList.module.css";

interface TrackListProps {
  tracks: TrackListEntry[];
  totalSeconds?: number;
}

export function TrackList({ tracks, totalSeconds }: TrackListProps) {
  let trackNumber = 0;
  return (
    <div className={styles.container}>
      {tracks.map((track, index) => {
        if (track.type_ === "heading") {
          return (
            <p key={index} className={styles.heading}>
              {track.title}
            </p>
          );
        }
        trackNumber += 1;
        return (
          <div key={index} className={styles.row}>
            <span className={styles.position}>{trackNumber}</span>
            <span className={styles.title}>{track.title}</span>
            {track.duration && (
              <span className={styles.duration}>{track.duration}</span>
            )}
          </div>
        );
      })}
      {(totalSeconds ?? 0) > 0 && (
        <div className={styles.totalRow}>
          <span className={styles.totalLabel}>Total Time</span>
          <span className={styles.duration}>{formatClock(totalSeconds!)}</span>
        </div>
      )}
    </div>
  );
}

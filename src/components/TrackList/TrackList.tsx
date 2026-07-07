import type { TrackListEntry } from "../../types/Record";
import styles from "./TrackList.module.css";

interface TrackListProps {
  tracks: TrackListEntry[];
}

export function TrackList({ tracks }: TrackListProps) {
  return (
    <div className={styles.container}>
      {tracks.map((track, index) =>
        track.type_ === "heading" ? (
          <p key={index} className={styles.heading}>
            {track.title}
          </p>
        ) : (
          <div key={index} className={styles.row}>
            <span className={styles.position}>{track.position}</span>
            <span className={styles.title}>{track.title}</span>
            {track.duration && (
              <span className={styles.duration}>{track.duration}</span>
            )}
          </div>
        )
      )}
    </div>
  );
}

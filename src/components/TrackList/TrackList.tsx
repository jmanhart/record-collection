import type { TrackListEntry } from "../../types/Record";
import styles from "./TrackList.module.css";

interface TrackListProps {
  tracks: TrackListEntry[];
}

export function TrackList({ tracks }: TrackListProps) {
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
    </div>
  );
}

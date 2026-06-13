import { useArtistList } from "../../hooks/useDiscography";
import styles from "./ArtistProgressList.module.css";

interface ArtistProgressListProps {
  onArtistSelect: (slug: string) => void;
}

export function ArtistProgressList({ onArtistSelect }: ArtistProgressListProps) {
  const { artists, isLoading } = useArtistList();

  if (isLoading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.grid}>
        {artists.map((artist) => {
          const pct = artist.progress.total > 0
            ? Math.round((artist.progress.owned / artist.progress.total) * 100)
            : 0;

          return (
            <button
              key={artist.slug}
              onClick={() => onArtistSelect(artist.slug)}
              className={styles.cardLink}
            >
              <div className={styles.card}>
                <h3 className={styles.artistName}>{artist.artist}</h3>
                <div className={styles.fraction}>
                  {artist.progress.owned} / {artist.progress.total}
                </div>
                <div className={styles.progressTrack}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </button>
          );
        })}
    </div>
  );
}

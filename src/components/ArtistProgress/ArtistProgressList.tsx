import { Link } from "react-router-dom";
import { useArtistList } from "../../hooks/useDiscography";
import styles from "./ArtistProgressList.module.css";

export function ArtistProgressList() {
  const { artists, isLoading } = useArtistList();

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h2>Collecting</h2>
        <p className={styles.subtitle}>Tracking progress on artist discographies</p>
      </header>
      <div className={styles.grid}>
        {artists.map((artist) => {
          const pct = artist.progress.total > 0
            ? Math.round((artist.progress.owned / artist.progress.total) * 100)
            : 0;

          return (
            <Link
              key={artist.slug}
              to={`/collecting/${artist.slug}`}
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
            </Link>
          );
        })}
      </div>
    </div>
  );
}

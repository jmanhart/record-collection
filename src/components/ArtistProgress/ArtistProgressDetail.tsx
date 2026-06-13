import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useArtistDiscography } from "../../hooks/useDiscography";
import { slugify } from "../../utils/slugify";
import styles from "./ArtistProgressDetail.module.css";

interface ArtistProgressDetailProps {
  artistSlug: string;
  onBack: () => void;
}

export function ArtistProgressDetail({ artistSlug, onBack }: ArtistProgressDetailProps) {
  const { artist, albums, progress, isLoading } = useArtistDiscography(
    artistSlug
  );

  if (isLoading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (!artist) {
    return <div className={styles.loading}>Artist not found</div>;
  }

  return (
    <>
      <button onClick={onBack} className={styles.backLink}>
        <ArrowLeft size={16} />
        Back to Collecting
      </button>
      <header className={styles.header}>
        <h2>{artist}</h2>
        <p className={styles.subtitle}>
          {progress.owned} / {progress.total} albums collected
        </p>
      </header>
      <div className={styles.grid}>
        {albums.map((album) => (
          <AlbumCard key={album.releaseId} album={album} />
        ))}
      </div>
    </>
  );
}

function AlbumCard({
  album,
}: {
  album: {
    releaseId: number;
    title: string;
    year: number | null;
    imageUrl: string | null;
    owned: boolean;
    artist: string;
  };
}) {
  const [imageError, setImageError] = useState(false);

  const content = (
    <div className={`${styles.card} ${album.owned ? "" : styles.unowned}`}>
      <div className={styles.imageContainer}>
        {album.imageUrl && !imageError ? (
          <img
            src={album.imageUrl}
            alt={`${album.title} by ${album.artist}`}
            className={styles.image}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className={styles.placeholder}>
            <span>{album.title[0]}</span>
          </div>
        )}
      </div>
      <div className={styles.info}>
        <h4 className={styles.title}>{album.title}</h4>
        {album.year && <span className={styles.year}>{album.year}</span>}
      </div>
    </div>
  );

  if (album.owned) {
    return (
      <Link
        to={`/${slugify(album.artist)}/${slugify(album.title)}`}
        className={styles.cardLink}
      >
        {content}
      </Link>
    );
  }

  return <div className={styles.cardLink}>{content}</div>;
}

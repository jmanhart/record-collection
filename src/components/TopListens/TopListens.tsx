import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { LayoutGrid } from "lucide-react";
import { AppBar } from "../AppBar/AppBar";
import { CircleLink } from "./CircleLink";
import { useListens } from "../../hooks/useListens";
import { useRecords } from "../../hooks/useRecords";
import { slugify } from "../../utils/slugify";
import type { Record } from "../../types/Record";
import feed from "../Timeline/TimelineFeed.module.css";
import styles from "./TopListens.module.css";

/** A single ranked album, styled as a timeline row with a rank numeral on the
 *  spine in place of the listen dot. */
function TopRow({
  rank,
  record,
  plays,
}: {
  rank: number;
  record: Record;
  plays: number;
}) {
  const [imageError, setImageError] = useState(false);
  const showImage = record.supabase_image_url && !imageError;

  return (
    <div className={feed.row}>
      <span className={feed.node}>
        <span className={styles.rankMarker}>{rank}</span>
      </span>
      <Link
        to={`/${slugify(record.artist)}/${slugify(record.title)}`}
        className={feed.card}
      >
        <div className={feed.thumb}>
          {showImage ? (
            <img
              src={record.supabase_image_url}
              alt={`${record.title} by ${record.artist}`}
              className={feed.image}
              loading="lazy"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className={feed.placeholder}>
              <span>{record.title[0]}</span>
            </div>
          )}
        </div>
        <div className={feed.meta}>
          <span className={feed.when}>
            Played {plays} {plays === 1 ? "time" : "times"}
          </span>
          <h3 className={feed.title}>{record.title}</h3>
          <p className={feed.artist}>{record.artist}</p>
        </div>
      </Link>
    </div>
  );
}

/**
 * Top Listens: every played record ranked by all-time spin count, newest listen
 * data shared with the timeline via react-query so the route loads instantly.
 * Deliberately mirrors the timeline's spine + row look; the marker carries the
 * rank number instead of a dot.
 */
export default function TopListens() {
  const { listens, isLoading: listensLoading } = useListens();
  const { records, isLoading: recordsLoading } = useRecords();

  const ranked = useMemo(() => {
    const counts = new Map<number, number>();
    for (const listen of listens) {
      counts.set(listen.release_id, (counts.get(listen.release_id) ?? 0) + 1);
    }
    return (records ?? [])
      .filter((r) => counts.has(r.id))
      .map((record) => ({ record, plays: counts.get(record.id) as number }))
      .sort(
        (a, b) =>
          b.plays - a.plays || a.record.title.localeCompare(b.record.title)
      );
  }, [listens, records]);

  const isLoading = listensLoading || recordsLoading;

  return (
    <div className="app">
      <AppBar search="" onSearchChange={() => {}} showSearch={false} />
      <CircleLink to="/" label="Back to collection" placement="corner">
        <LayoutGrid size={20} />
      </CircleLink>
      <div className="container">
        <main className="main">
          <header className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>Top Listens</h1>
            <p className={styles.pageSubtitle}>Your most-played records</p>
          </header>

          {isLoading ? (
            <p className={feed.status}>Loading...</p>
          ) : ranked.length === 0 ? (
            <p className={feed.status}>No spins yet.</p>
          ) : (
            <div className={feed.feed}>
              {ranked.map(({ record, plays }, i) => (
                <TopRow key={record.id} rank={i + 1} record={record} plays={plays} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

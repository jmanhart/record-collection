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

/** A single ranked album, styled as a timeline row. The spine marker carries
 *  the album's rank number, or a dash when it shares its play count with the
 *  album ranked directly above it. */
function TopRow({
  marker,
  shared,
  record,
  plays,
}: {
  marker: string;
  shared: boolean;
  record: Record;
  plays: number;
}) {
  const [imageError, setImageError] = useState(false);
  const showImage = record.supabase_image_url && !imageError;

  return (
    <div className={feed.row}>
      <span className={feed.node}>
        <span className={styles.rankMarker} aria-hidden={shared}>{marker}</span>
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
 * Deliberately mirrors the timeline's spine + row look; the marker carries each
 * album's rank, or a dash when its play count is tied.
 */
export default function TopListens() {
  const { listens, isLoading: listensLoading } = useListens();
  const { records, isLoading: recordsLoading } = useRecords();

  const ranked = useMemo(() => {
    const counts = new Map<number, number>();
    const lastListened = new Map<number, string>();
    for (const listen of listens) {
      counts.set(listen.release_id, (counts.get(listen.release_id) ?? 0) + 1);
      const prev = lastListened.get(listen.release_id);
      if (!prev || listen.listened_at > prev) {
        lastListened.set(listen.release_id, listen.listened_at);
      }
    }

    const items = (records ?? [])
      .filter((r) => counts.has(r.id))
      .map((record) => ({
        record,
        plays: counts.get(record.id) as number,
        last: lastListened.get(record.id) ?? "",
      }))
      // Most plays first; ties ordered by most-recent listen, then title so the
      // order is stable even when recency also ties.
      .sort(
        (a, b) =>
          b.plays - a.plays ||
          b.last.localeCompare(a.last) ||
          a.record.title.localeCompare(b.record.title)
      );

    // Dense ranking: each distinct play count is one place, so tiers read 1st,
    // 2nd, 3rd… with no gaps for ties — a 5-play album sitting below a 6-play
    // tie is 3rd, not 5th. The leader of each tier carries the number; the
    // albums sharing its count show a dash.
    const rankByPlays = new Map<number, number>();
    for (const it of items) {
      if (!rankByPlays.has(it.plays)) rankByPlays.set(it.plays, rankByPlays.size + 1);
    }

    const numbered = new Set<number>();
    return items.map((it) => {
      const shared = numbered.has(it.plays);
      numbered.add(it.plays);
      return {
        ...it,
        shared,
        marker: shared ? "\u2013" : String(rankByPlays.get(it.plays)),
      };
    });
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
              {ranked.map(({ record, plays, marker, shared }) => (
                <TopRow
                  key={record.id}
                  marker={marker}
                  shared={shared}
                  record={record}
                  plays={plays}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

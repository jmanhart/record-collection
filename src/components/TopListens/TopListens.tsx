import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AppBar } from "../AppBar/AppBar";
import { ViewNav } from "../ViewNav/ViewNav";
import { useListens } from "../../hooks/useListens";
import { useRecords } from "../../hooks/useRecords";
import { slugify } from "../../utils/slugify";
import feed from "../Timeline/TimelineFeed.module.css";
import styles from "./TopListens.module.css";

type Mode = "albums" | "artists";

interface Rankable {
  /** Total spins — the ranked metric. */
  plays: number;
  /** Most-recent listen ISO timestamp, for ordering ties. */
  last: string;
  /** Final stable tiebreak when plays and recency both tie. */
  sortKey: string;
}

/**
 * Dense ranking: sort by plays (ties broken by recency, then sortKey), then give
 * each distinct play count one place — so tiers read 1st, 2nd, 3rd with no gaps.
 * The first item at a count carries its number; the rest sharing that count get
 * a dash, since a distinct number there would imply an order among equals.
 */
function assignRanks<T extends Rankable>(items: T[]): (T & { marker: string; shared: boolean })[] {
  const sorted = [...items].sort(
    (a, b) =>
      b.plays - a.plays ||
      b.last.localeCompare(a.last) ||
      a.sortKey.localeCompare(b.sortKey)
  );

  const rankByPlays = new Map<number, number>();
  for (const it of sorted) {
    if (!rankByPlays.has(it.plays)) rankByPlays.set(it.plays, rankByPlays.size + 1);
  }

  const numbered = new Set<number>();
  return sorted.map((it) => {
    const shared = numbered.has(it.plays);
    numbered.add(it.plays);
    return { ...it, shared, marker: shared ? "\u2013" : String(rankByPlays.get(it.plays)) };
  });
}

interface RowData {
  id: string | number;
  marker: string;
  shared: boolean;
  cover?: string;
  fallback: string;
  when: string;
  title: string;
  subtitle: string;
  /** Present only for album rows; artist rows are informational. */
  to?: string;
}

/** A ranked row styled as a timeline row: rank numeral (or dash) on the spine,
 *  cover, and metadata. Links to the album detail when `to` is set. */
function TopRow({ data }: { data: RowData }) {
  const [imageError, setImageError] = useState(false);
  const showImage = data.cover && !imageError;

  const body = (
    <>
      <div className={feed.thumb}>
        {showImage ? (
          <img
            src={data.cover}
            alt={data.title}
            className={feed.image}
            loading="lazy"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className={feed.placeholder}>
            <span>{data.fallback}</span>
          </div>
        )}
      </div>
      <div className={feed.meta}>
        <span className={feed.when}>{data.when}</span>
        <h3 className={feed.title}>{data.title}</h3>
        <p className={feed.artist}>{data.subtitle}</p>
      </div>
    </>
  );

  return (
    <div className={feed.row}>
      <span className={feed.node}>
        <span className={styles.rankMarker} aria-hidden={data.shared}>
          {data.marker}
        </span>
      </span>
      {data.to ? (
        <Link to={data.to} className={feed.card}>
          {body}
        </Link>
      ) : (
        <div className={`${feed.card} ${styles.staticCard}`}>{body}</div>
      )}
    </div>
  );
}

function plural(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

/**
 * Top Listens: records — or artists — ranked by all-time spin count. Shares the
 * timeline's react-query data (so the route loads instantly) and its spine + row
 * look; the marker carries each entry's dense rank, or a dash when tied.
 */
export default function TopListens() {
  const { listens, isLoading: listensLoading } = useListens();
  const { records, isLoading: recordsLoading } = useRecords();
  const [mode, setMode] = useState<Mode>("albums");

  // Per-record play counts and most-recent listen, shared by both rankings.
  const perRecord = useMemo(() => {
    const counts = new Map<number, number>();
    const lastListened = new Map<number, string>();
    for (const listen of listens) {
      counts.set(listen.release_id, (counts.get(listen.release_id) ?? 0) + 1);
      const prev = lastListened.get(listen.release_id);
      if (!prev || listen.listened_at > prev) {
        lastListened.set(listen.release_id, listen.listened_at);
      }
    }
    return { counts, lastListened };
  }, [listens]);

  const albumRows = useMemo<RowData[]>(() => {
    const items = (records ?? [])
      .filter((r) => perRecord.counts.has(r.id))
      .map((record) => ({
        record,
        plays: perRecord.counts.get(record.id) as number,
        last: perRecord.lastListened.get(record.id) ?? "",
        sortKey: record.title,
      }));
    return assignRanks(items).map(({ record, plays, marker, shared }) => ({
      id: record.id,
      marker,
      shared,
      cover: record.supabase_image_url,
      fallback: record.title[0] ?? "?",
      when: `Played ${plural(plays, "time")}`,
      title: record.title,
      subtitle: record.artist,
      to: `/${slugify(record.artist)}/${slugify(record.title)}`,
    }));
  }, [records, perRecord]);

  const artistRows = useMemo<RowData[]>(() => {
    const byArtist = new Map<
      string,
      { artist: string; plays: number; albums: number; cover?: string; coverPlays: number; last: string }
    >();
    for (const record of records ?? []) {
      const plays = perRecord.counts.get(record.id);
      if (!plays) continue;
      const last = perRecord.lastListened.get(record.id) ?? "";
      const entry = byArtist.get(record.artist);
      if (!entry) {
        byArtist.set(record.artist, {
          artist: record.artist,
          plays,
          albums: 1,
          cover: record.supabase_image_url,
          coverPlays: plays,
          last,
        });
      } else {
        entry.plays += plays;
        entry.albums += 1;
        if (last > entry.last) entry.last = last;
        // Represent the artist with their most-played album's cover.
        if (plays > entry.coverPlays) {
          entry.cover = record.supabase_image_url;
          entry.coverPlays = plays;
        }
      }
    }

    const items = [...byArtist.values()].map((e) => ({ ...e, sortKey: e.artist }));
    return assignRanks(items).map((e) => ({
      id: e.artist,
      marker: e.marker,
      shared: e.shared,
      cover: e.cover,
      fallback: e.artist[0] ?? "?",
      when: `Played ${plural(e.plays, "time")}`,
      title: e.artist,
      subtitle: plural(e.albums, "album"),
    }));
  }, [records, perRecord]);

  const isLoading = listensLoading || recordsLoading;
  const rows = mode === "albums" ? albumRows : artistRows;

  return (
    <div className="app">
      <AppBar search="" onSearchChange={() => {}} showSearch={false} />
      <ViewNav />
      <div className="container">
        <main className="main">
          <header className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>Top Listens</h1>
            <p className={styles.pageSubtitle}>
              Your most-played {mode === "albums" ? "records" : "artists"}
            </p>
            <div className={styles.modeToggle} role="tablist" aria-label="Rank by">
              {(["albums", "artists"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  role="tab"
                  aria-selected={mode === m}
                  className={`${styles.modeButton} ${mode === m ? styles.modeButtonActive : ""}`}
                  onClick={() => setMode(m)}
                >
                  {m === "albums" ? "Albums" : "Artists"}
                </button>
              ))}
            </div>
          </header>

          {isLoading ? (
            <p className={feed.status}>Loading...</p>
          ) : rows.length === 0 ? (
            <p className={feed.status}>No spins yet.</p>
          ) : (
            <div className={feed.feed}>
              {rows.map((data) => (
                <TopRow key={data.id} data={data} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

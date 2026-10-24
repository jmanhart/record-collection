import { useState, useEffect, useMemo } from "react";
import { useActivity } from "../../hooks/useActivity";
import { useRecords } from "../../hooks/useRecords";
import type { Measure } from "../../hooks/useListeningStats";
import { ViewNav } from "../ViewNav/ViewNav";
import { StatsHeroBackground } from "./StatsHeroBackground";
import { DailyListensChart } from "./DailyListensChart";
import { CollectionByYear } from "./CollectionByYear";
import { CollectionByDecade } from "./CollectionByDecade";
import { formatRuntimeCompact } from "../../utils/formatDuration";
import styles from "./StatsPage.module.css";

// Published to :root while this page is mounted so the fixed ViewNav tints
// light-on-dark over the mosaic hero — same mechanism the timeline hero uses.
const HERO_VARS: Record<string, string> = {
  "--hero-text": "#f5f5f5",
  "--hero-line": "rgba(245, 245, 245, 0.34)",
  "--hero-fill": "rgba(245, 245, 245, 0.16)",
};

export default function StatsPage() {
  const { events, byDay, isLoading } = useActivity();
  const { records } = useRecords();
  const [measure, setMeasure] = useState<Measure>("time");

  // All-time roll-ups from the full listen stream.
  const totals = useMemo(() => {
    let listens = 0;
    let seconds = 0;
    const albums = new Set<number>();
    for (const e of events) {
      if (e.type !== "listen") continue;
      listens += 1;
      seconds += e.record?.duration_seconds ?? 0;
      albums.add(e.releaseId);
    }
    return { listens, seconds, albums: albums.size };
  }, [events]);

  const topAlbums = useMemo(() => {
    const counts = new Map<number, number>();
    const rec = new Map<number, (typeof events)[number]["record"]>();
    for (const e of events) {
      if (e.type !== "listen" || !e.record) continue;
      counts.set(e.releaseId, (counts.get(e.releaseId) ?? 0) + 1);
      if (!rec.has(e.releaseId)) rec.set(e.releaseId, e.record);
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([id, count]) => ({ id, count, record: rec.get(id)! }));
  }, [events]);

  const topArtists = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of events) {
      if (e.type !== "listen" || !e.record?.artist) continue;
      map.set(
        e.record.artist,
        (map.get(e.record.artist) ?? 0) + (e.record.duration_seconds ?? 0)
      );
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
  }, [events]);

  const newRecords = useMemo(
    () =>
      records
        .filter((r) => r.acquired_at)
        .sort((a, b) => (b.acquired_at ?? "").localeCompare(a.acquired_at ?? ""))
        .slice(0, 10),
    [records]
  );

  // Mosaic background: the most recently listened albums (cover + dominant
  // color), falling back to a slice of the collection when nothing's tracked.
  const heroAlbums = useMemo(() => {
    const seen = new Set<number>();
    const out: { color?: string; cover?: string }[] = [];
    for (const e of events) {
      if (e.type !== "listen" || !e.record || seen.has(e.releaseId)) continue;
      seen.add(e.releaseId);
      const cover = e.record.supabase_image_url || e.record.coverImage;
      if (cover || e.record.dominant_color) {
        out.push({ color: e.record.dominant_color ?? undefined, cover });
      }
      if (out.length >= 48) break;
    }
    if (out.length) return out;
    return records
      .filter((r) => r.dominant_color || r.supabase_image_url || r.coverImage)
      .slice(0, 48)
      .map((r) => ({
        color: r.dominant_color ?? undefined,
        cover: r.supabase_image_url || r.coverImage,
      }));
  }, [events, records]);

  useEffect(() => {
    const root = document.documentElement;
    for (const [k, v] of Object.entries(HERO_VARS)) root.style.setProperty(k, v);
    document.body.classList.add("nav-over-hero");
    return () => {
      for (const k of Object.keys(HERO_VARS)) root.style.removeProperty(k);
      document.body.classList.remove("nav-over-hero");
    };
  }, []);

  return (
    <div className={styles.page}>
      <ViewNav />

      <section className={styles.hero} data-stats-hero>
        <StatsHeroBackground albums={heroAlbums} seed={0} />
        <div className={styles.controls}>
          <span className={styles.heroHeading}>Listens</span>
          <div className={styles.toggle} role="group" aria-label="Chart measure">
            <button
              className={`${styles.toggleButton} ${measure === "time" ? styles.toggleActive : ""}`}
              onClick={() => setMeasure("time")}
              aria-pressed={measure === "time"}
            >
              Time
            </button>
            <button
              className={`${styles.toggleButton} ${measure === "albums" ? styles.toggleActive : ""}`}
              onClick={() => setMeasure("albums")}
              aria-pressed={measure === "albums"}
            >
              Albums
            </button>
          </div>
        </div>
        {isLoading ? (
          <p className={styles.status}>Loading…</p>
        ) : totals.listens === 0 ? (
          <p className={styles.status}>No listens tracked yet.</p>
        ) : (
          <DailyListensChart byDay={byDay} measure={measure} />
        )}
      </section>

      <section className={styles.statsBand}>
        <div className={styles.statsBandInner}>
          <div className={styles.bandItem}>
            <span className={styles.bandValue}>{totals.listens}</span>
            <span className={styles.bandLabel}>
              listens · {totals.albums} albums
            </span>
          </div>
          <div className={styles.bandItem}>
            <span className={styles.bandValue}>
              {formatRuntimeCompact(totals.seconds)}
            </span>
            <span className={styles.bandLabel}>all time</span>
          </div>
          <div className={styles.bandItem}>
            <span className={styles.bandValue}>{records.length}</span>
            <span className={styles.bandLabel}>in collection</span>
          </div>
        </div>
      </section>

      <section className={styles.lists}>
        <div className={styles.listCol}>
          <span className={styles.listLabel}>Top albums</span>
          <div className={styles.list}>
            {topAlbums.length === 0 ? (
              <p className={styles.listEmpty}>No listens yet.</p>
            ) : (
              topAlbums.map((album, index) => {
                const cover =
                  album.record?.supabase_image_url || album.record?.coverImage;
                return (
                  <div key={album.id} className={styles.albumRow}>
                    <span className={styles.rank}>{index + 1}</span>
                    {cover ? (
                      <img
                        src={cover}
                        alt=""
                        className={styles.cover}
                        loading="lazy"
                      />
                    ) : (
                      <span className={styles.coverPlaceholder}>
                        {album.record?.title[0]}
                      </span>
                    )}
                    <span className={styles.albumMeta}>
                      <span className={styles.albumTitle}>
                        {album.record?.title}
                      </span>
                      <span className={styles.albumArtist}>
                        {album.record?.artist}
                      </span>
                    </span>
                    <span className={styles.count}>
                      {album.count} {album.count === 1 ? "listen" : "listens"}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className={styles.listCol}>
          <span className={styles.listLabel}>Top artists</span>
          <div className={styles.list}>
            {topArtists.length === 0 ? (
              <p className={styles.listEmpty}>No listens yet.</p>
            ) : (
              topArtists.map(([artist, seconds], index) => (
                <div key={artist} className={styles.artistRow}>
                  <span className={styles.rank}>{index + 1}</span>
                  <span className={styles.artistName}>{artist}</span>
                  <span className={styles.count}>
                    {formatRuntimeCompact(seconds)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className={styles.listCol}>
          <span className={styles.listLabel}>Recently added</span>
          <div className={styles.list}>
            {newRecords.length === 0 ? (
              <p className={styles.listEmpty}>No records yet.</p>
            ) : (
              newRecords.map((record) => {
                const cover = record.supabase_image_url || record.coverImage;
                return (
                  <div key={record.id} className={styles.albumRow}>
                    {cover ? (
                      <img
                        src={cover}
                        alt=""
                        className={styles.cover}
                        loading="lazy"
                      />
                    ) : (
                      <span className={styles.coverPlaceholder}>
                        {record.title[0]}
                      </span>
                    )}
                    <span className={styles.albumMeta}>
                      <span className={styles.albumTitle}>{record.title}</span>
                      <span className={styles.albumArtist}>{record.artist}</span>
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      <CollectionByYear records={records} />
      <CollectionByDecade records={records} />
    </div>
  );
}

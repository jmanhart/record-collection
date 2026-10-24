import { useState, useEffect, useMemo, useRef } from "react";
import { useActivity } from "../../hooks/useActivity";
import { useRecords } from "../../hooks/useRecords";
import { ViewNav } from "../ViewNav/ViewNav";
import { StatsHeroBackground } from "./StatsHeroBackground";
import { DailyListensChart, type DayFocus } from "./DailyListensChart";
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
  const [focusedDay, setFocusedDay] = useState<DayFocus | null>(null);
  // Day-plays list: follows the centered day, but settles (debounced) so it
  // doesn't thrash while scrubbing fast.
  const [centerKey, setCenterKey] = useState<string | null>(null);
  const [settledKey, setSettledKey] = useState<string | null>(null);
  const settleTimer = useRef<number | null>(null);
  const settleStart = useRef<number | null>(null);

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

  // Listens grouped by day, newest-first within each day (events already come
  // sorted newest-first).
  const playsByDay = useMemo(() => {
    const map = new Map<string, typeof events>();
    for (const e of events) {
      if (e.type !== "listen") continue;
      const arr = map.get(e.dateKey);
      if (arr) arr.push(e);
      else map.set(e.dateKey, [e]);
    }
    return map;
  }, [events]);

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

  // Settle the list on the centered day. The first one lands immediately; after
  // that the list skeletons out and only loads once scrubbing pauses (~300ms of
  // stillness), and always shows the skeleton for a visible minimum (~450ms) so
  // the load-in reads as a deliberate state, not a flash.
  useEffect(() => {
    if (centerKey == null || centerKey === settledKey) {
      settleStart.current = null;
      return;
    }
    if (settledKey == null) {
      setSettledKey(centerKey);
      return;
    }
    if (settleStart.current == null) settleStart.current = performance.now();
    if (settleTimer.current != null) window.clearTimeout(settleTimer.current);
    const shownFor = performance.now() - settleStart.current;
    const delay = Math.max(300, 450 - shownFor);
    settleTimer.current = window.setTimeout(() => {
      settleStart.current = null;
      setSettledKey(centerKey);
    }, delay);
    return () => {
      if (settleTimer.current != null) window.clearTimeout(settleTimer.current);
    };
  }, [centerKey, settledKey]);

  const isSettling = centerKey != null && centerKey !== settledKey;

  // The centered day's plays grouped by album (count + first/last listen time),
  // most recently played first.
  const dayAlbums = useMemo(() => {
    const plays = settledKey ? playsByDay.get(settledKey) ?? [] : [];
    const groups = new Map<
      number,
      { record: (typeof events)[number]["record"]; times: string[] }
    >();
    for (const p of plays) {
      const g = groups.get(p.releaseId);
      if (g) g.times.push(p.timestamp);
      else groups.set(p.releaseId, { record: p.record, times: [p.timestamp] });
    }
    return [...groups.entries()]
      .map(([id, g]) => {
        const sorted = g.times.slice().sort();
        return {
          id,
          record: g.record,
          count: g.times.length,
          first: sorted[0],
          last: sorted[sorted.length - 1],
        };
      })
      .sort((a, b) => b.last.localeCompare(a.last));
  }, [settledKey, playsByDay, events]);

  const dayStat = settledKey ? byDay.get(settledKey) : undefined;
  const dayLabel = useMemo(() => {
    if (!settledKey) return "";
    const d = new Date(`${settledKey}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = Math.round((today.getTime() - d.getTime()) / 86400000);
    if (diff === 0) return "Today";
    if (diff === 1) return "Yesterday";
    return d.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }, [settledKey]);

  return (
    <div className={styles.page}>
      <ViewNav />

      <section className={styles.hero} data-stats-hero>
        <StatsHeroBackground albums={heroAlbums} seed={0} />
        <div className={styles.controls}>
          <span className={styles.heroHeading}>Listens</span>
        </div>
        {isLoading ? (
          <p className={styles.status}>Loading…</p>
        ) : totals.listens === 0 ? (
          <p className={styles.status}>No listens tracked yet.</p>
        ) : (
          <DailyListensChart
            byDay={byDay}
            onFocus={setFocusedDay}
            onCenterChange={setCenterKey}
          />
        )}
      </section>

      <section className={styles.statsBand}>
        <div className={styles.statsBandInner}>
          <div className={styles.bandItem}>
            <span className={styles.bandValue}>
              {formatRuntimeCompact(
                focusedDay ? focusedDay.seconds : totals.seconds
              )}
            </span>
            <span className={styles.bandLabel}>
              {focusedDay
                ? `${focusedDay.albums} ${
                    focusedDay.albums === 1 ? "album" : "albums"
                  }`
                : "all time"}
            </span>
          </div>
        </div>
      </section>

      <section className={styles.dayList}>
        <div className={styles.dayListInner}>
          {isSettling ? (
            <div className={styles.timeline}>
              <div className={`${styles.row} ${styles.dayHeaderRow}`}>
                <span className={styles.rail}>
                  <span className={styles.ring} />
                </span>
                <span className={`${styles.skelBar} ${styles.skelDay}`} />
              </div>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className={styles.row}>
                  <span className={styles.rail}>
                    <span className={styles.dot} />
                  </span>
                  <span className={`${styles.cover} ${styles.skeleton}`} />
                  <span className={styles.entryMeta}>
                    <span className={`${styles.skelBar} ${styles.skelTime}`} />
                    <span className={`${styles.skelBar} ${styles.skelTitle}`} />
                    <span className={`${styles.skelBar} ${styles.skelArtist}`} />
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.timeline} key={settledKey ?? ""}>
              <div className={`${styles.row} ${styles.dayHeaderRow}`}>
                <span className={styles.rail}>
                  <span className={styles.ring} />
                </span>
                <span className={styles.dayHeader}>
                  <span className={styles.dayName}>{dayLabel}</span>
                  {dayStat && (
                    <span className={styles.dayMeta}>
                      {dayStat.albumCount}{" "}
                      {dayStat.albumCount === 1 ? "album" : "albums"} ·{" "}
                      {formatRuntimeCompact(dayStat.seconds)}
                    </span>
                  )}
                </span>
              </div>
              {dayAlbums.length === 0 ? (
                <p className={styles.dayEmpty}>No listens on {dayLabel}.</p>
              ) : (
                dayAlbums.map((album, idx) => {
                  const cover =
                    album.record?.supabase_image_url ||
                    album.record?.coverImage;
                  const fmt = (iso: string) =>
                    new Date(iso).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    });
                  const range =
                    album.count > 1
                      ? `${fmt(album.first)} — ${fmt(album.last)}`
                      : fmt(album.first);
                  return (
                    <div
                      key={album.id}
                      className={styles.row}
                      style={{ animationDelay: `${(idx + 1) * 70}ms` }}
                    >
                      <span className={styles.rail}>
                        <span className={styles.dot} />
                      </span>
                      {cover ? (
                        <img
                          src={cover}
                          alt=""
                          className={styles.cover}
                          loading="lazy"
                        />
                      ) : (
                        <span className={`${styles.cover} ${styles.coverPlaceholder}`}>
                          {album.record?.title[0]}
                        </span>
                      )}
                      <span className={styles.entryMeta}>
                        <span className={styles.entryTime}>{range}</span>
                        <span className={styles.entryTitle}>
                          {album.record?.title}
                        </span>
                        <span className={styles.entryArtist}>
                          {album.record?.artist}
                        </span>
                        <span className={styles.entryCount}>
                          {album.count === 1
                            ? "Played once"
                            : `Played ${album.count} times`}
                        </span>
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </section>

      {/* Hidden for now — kept so the work isn't lost; flip to re-enable. */}
      {false && (
        <>
          <CollectionByYear records={records} />
          <CollectionByDecade records={records} />
        </>
      )}
    </div>
  );
}

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

  // Settle the list on the centered day: first one immediately, later changes
  // after a short pause so fast scrubbing shows a skeleton instead of thrashing.
  useEffect(() => {
    if (centerKey == null || centerKey === settledKey) return;
    if (settledKey == null) {
      setSettledKey(centerKey);
      return;
    }
    if (settleTimer.current != null) window.clearTimeout(settleTimer.current);
    settleTimer.current = window.setTimeout(() => setSettledKey(centerKey), 300);
    return () => {
      if (settleTimer.current != null) window.clearTimeout(settleTimer.current);
    };
  }, [centerKey, settledKey]);

  const isSettling = centerKey != null && centerKey !== settledKey;
  const dayPlays = settledKey ? playsByDay.get(settledKey) ?? [] : [];
  const dayLabel = settledKey
    ? new Date(`${settledKey}T00:00:00`).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      })
    : "";

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
                  } · ${focusedDay.date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}`
                : "all time"}
            </span>
          </div>
        </div>
      </section>

      <section className={styles.dayList}>
        <div className={styles.dayListInner}>
          <span className={styles.dayListLabel}>{dayLabel}</span>
          {isSettling ? (
            <div className={styles.timeline}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className={styles.playRow}>
                  <span className={styles.rail}>
                    <span className={styles.dot} />
                  </span>
                  <span className={`${styles.playCover} ${styles.skeleton}`} />
                  <span className={styles.playMeta}>
                    <span className={`${styles.skelBar} ${styles.skelTitle}`} />
                    <span className={`${styles.skelBar} ${styles.skelArtist}`} />
                  </span>
                </div>
              ))}
            </div>
          ) : dayPlays.length === 0 ? (
            <p className={styles.dayEmpty}>No listens on {dayLabel}.</p>
          ) : (
            <div className={styles.timeline}>
              {dayPlays.map((play) => {
                const cover =
                  play.record?.supabase_image_url || play.record?.coverImage;
                const time = new Date(play.timestamp).toLocaleTimeString(
                  "en-US",
                  { hour: "numeric", minute: "2-digit" }
                );
                return (
                  <div key={play.id} className={styles.playRow}>
                    <span className={styles.rail}>
                      <span className={styles.dot} />
                    </span>
                    {cover ? (
                      <img
                        src={cover}
                        alt=""
                        className={styles.playCover}
                        loading="lazy"
                      />
                    ) : (
                      <span className={styles.playCoverPlaceholder}>
                        {play.record?.title[0]}
                      </span>
                    )}
                    <span className={styles.playMeta}>
                      <span className={styles.playTitle}>
                        {play.record?.title}
                      </span>
                      <span className={styles.playArtist}>
                        {play.record?.artist}
                      </span>
                    </span>
                    <span className={styles.playTime}>{time}</span>
                  </div>
                );
              })}
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

import {
  useEffect,
  useMemo,
  useRef,
  useCallback,
  Fragment,
  useState,
} from "react";
import { useActivity } from "../../hooks/useActivity";
import { useRecords } from "../../hooks/useRecords";
import { ViewNav } from "../ViewNav/ViewNav";
import { StatsHeroBackground } from "./StatsHeroBackground";
import {
  DailyListensChart,
  NOW_KEY,
  type ChartHandle,
  type NowInfo,
} from "./DailyListensChart";
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

// Human label for a day key, relative where it reads naturally.
function dayLabel(key: string): string {
  const d = new Date(`${key}T00:00:00`);
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
}

const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

// "Currently spinning": the freshest listen that hasn't been stopped and whose
// album runtime still reaches past now (mirrors the timeline's playingNow).
function isPlayingEvent(
  ev: {
    timestamp: string;
    endedAt?: string | null;
    record?: { duration_seconds?: number } | null;
  },
  nowMs: number
): boolean {
  if (ev.endedAt) return false;
  const duration = ev.record?.duration_seconds;
  if (!duration) return false;
  const startMs = new Date(ev.timestamp).getTime();
  return startMs <= nowMs && startMs + duration * 1000 > nowMs;
}

export default function StatsPage() {
  const { events, byDay, isLoading } = useActivity();
  const { records } = useRecords();

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

  // The continuous diary: every day with listens, newest-first, each day's
  // plays grouped by album (count + first/last listen time).
  const diary = useMemo(() => {
    const keys = [...playsByDay.keys()].sort().reverse();
    return keys.map((key) => {
      const plays = playsByDay.get(key)!;
      const groups = new Map<
        number,
        { record: (typeof events)[number]["record"]; times: string[] }
      >();
      for (const p of plays) {
        const g = groups.get(p.releaseId);
        if (g) g.times.push(p.timestamp);
        else groups.set(p.releaseId, { record: p.record, times: [p.timestamp] });
      }
      const albums = [...groups.entries()]
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
      return { key, stat: byDay.get(key), albums };
    });
  }, [playsByDay, byDay, events]);

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

  // The currently/last played album — drives the now-playing banner and the
  // album-tinted background when the now slot is centered. (Playing state is
  // sampled when events change; it refreshes on the next activity refetch.)
  const nowEvent = useMemo(
    () => events.find((e) => e.type === "listen" && e.record) ?? null,
    [events]
  );
  const now = useMemo<NowInfo | null>(() => {
    if (!nowEvent?.record) return null;
    const playing = isPlayingEvent(nowEvent, Date.now());
    return {
      title: nowEvent.record.title,
      artist: nowEvent.record.artist,
      cover: nowEvent.record.supabase_image_url || nowEvent.record.coverImage,
      color: nowEvent.record.dominant_color ?? undefined,
      statusLabel: playing ? "Now Playing" : "Last played",
      statusDetail: playing
        ? `since ${fmtTime(nowEvent.timestamp)}`
        : dayLabel(nowEvent.dateKey),
      playing,
    };
  }, [nowEvent]);
  const playing = now?.playing ?? false;
  // Mirror into a ref so the scroll handler (bound once) reads the live value.
  const playingRef = useRef(false);
  playingRef.current = playing;

  useEffect(() => {
    const root = document.documentElement;
    for (const [k, v] of Object.entries(HERO_VARS)) root.style.setProperty(k, v);
    document.body.classList.add("nav-over-hero");
    return () => {
      for (const k of Object.keys(HERO_VARS)) root.style.removeProperty(k);
      document.body.classList.remove("nav-over-hero");
    };
  }, []);

  // --- Two-way sync between the diary list and the chart -------------------
  // The day at the anchor (just under the sticky header) is the focus. Scrolling
  // the list centers that day in the chart; scrubbing the chart scrolls the list
  // to the nearest listened day. A short driver lock stops the two from echoing.
  const chartApi = useRef<ChartHandle>(null);
  const diaryRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const driver = useRef<"list" | "chart" | null>(null);
  const driverTimer = useRef<number | null>(null);
  const focusedKeyRef = useRef<string | null>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  // Whether the chart is centered on the now slot (vs a historical day) — gates
  // the album-tinted background crossfade. Opens true (chart starts on now).
  const [onNowSlot, setOnNowSlot] = useState(true);

  const claim = useCallback((who: "list" | "chart") => {
    driver.current = who;
    if (driverTimer.current != null) window.clearTimeout(driverTimer.current);
    driverTimer.current = window.setTimeout(() => {
      driver.current = null;
    }, 180);
  }, []);

  const applyFocus = useCallback((key: string) => {
    if (focusedKeyRef.current === key) return;
    focusedKeyRef.current = key;
  }, []);

  const anchorY = () =>
    stickyRef.current?.getBoundingClientRect().bottom ?? 0;

  // Seed the focus on today (the top of the diary) once data is in.
  useEffect(() => {
    if (diary.length && focusedKeyRef.current == null) {
      focusedKeyRef.current = playing ? NOW_KEY : diary[0].key;
    }
  }, [diary, playing]);

  // Diary -> chart: on page scroll, find the day crossing the anchor and center
  // the chart on it (silently).
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        if (driver.current === "chart") return;
        const headers = diaryRef.current?.querySelectorAll<HTMLElement>(
          "[data-day-key]"
        );
        if (!headers || !headers.length) return;
        const y = anchorY();
        // Above the first day-header = the now slot (top of the diary).
        let cur: string;
        if (
          playingRef.current &&
          headers[0].getBoundingClientRect().top - y > 1
        ) {
          cur = NOW_KEY;
        } else {
          cur = headers[0].dataset.dayKey!;
          for (const h of headers) {
            if (h.getBoundingClientRect().top - y <= 1) cur = h.dataset.dayKey!;
            else break;
          }
        }
        if (cur !== focusedKeyRef.current) {
          claim("list");
          applyFocus(cur);
          chartApi.current?.centerKey(cur);
          setOnNowSlot(cur === NOW_KEY);
        }
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [claim, applyFocus]);

  // Chart -> diary: a user scrub reports the centered day; scroll the list to
  // the nearest listened day at or before it.
  const handleCenter = useCallback(
    (key: string) => {
      if (driver.current === "list") return;
      if (key === NOW_KEY) {
        claim("chart");
        applyFocus(NOW_KEY);
        setOnNowSlot(true);
        window.scrollTo({ top: 0, behavior: "auto" });
        return;
      }
      setOnNowSlot(false);
      // Nearest diary day at or before the centered key (diary is newest-first).
      let dKey: string | null = null;
      for (const d of diary) {
        if (d.key <= key) {
          dKey = d.key;
          break;
        }
      }
      if (dKey == null) dKey = diary.length ? diary[diary.length - 1].key : null;
      if (dKey == null) return;
      claim("chart");
      applyFocus(dKey);
      const h = diaryRef.current?.querySelector<HTMLElement>(
        `[data-day-key="${CSS.escape(dKey)}"]`
      );
      if (h) {
        const top = window.scrollY + h.getBoundingClientRect().top - anchorY();
        window.scrollTo({ top, behavior: "auto" });
      }
    },
    [diary, claim, applyFocus]
  );

  // Gently reveal each row as it scrolls into view (once). The observer is
  // created lazily on the first row so it exists before the ref callbacks run.
  const revealObs = useRef<IntersectionObserver | null>(null);
  const observeRow = useCallback((el: HTMLDivElement | null) => {
    if (!el) return;
    if (!revealObs.current) {
      revealObs.current = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) {
              e.target.classList.add(styles.rowVisible);
              revealObs.current?.unobserve(e.target);
            }
          }
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.01 }
      );
    }
    revealObs.current.observe(el);
  }, []);
  useEffect(() => () => revealObs.current?.disconnect(), []);

  // Covers fade in once decoded (handles cache hits via the complete check).
  const markCoverLoaded = useCallback((el: HTMLImageElement | null) => {
    if (el?.complete) el.classList.add(styles.coverLoaded);
  }, []);

  // Collapse the header as you scroll the LIST — but accumulate only genuine
  // list scroll. A graph scrub (driver === "chart") moves the list via the sync
  // yet must NOT collapse the header. `collapse` is also clamped to the scroll
  // position, so the header never leaves a gap above the list and scrubbing back
  // toward the top re-expands it. Fractions come from the CSS vars.
  useEffect(() => {
    const el = pageRef.current;
    if (!el) return;
    let raf = 0;
    let collapse = 0;
    let lastY = window.scrollY;
    const toPx = (v: string) => {
      const n = parseFloat(v);
      if (Number.isNaN(n)) return 0;
      return v.includes("vh") ? (n / 100) * window.innerHeight : n;
    };
    const apply = () => {
      const cs = getComputedStyle(el);
      const expanded = toPx(cs.getPropertyValue("--stats-header-expanded"));
      const collapsed = toPx(cs.getPropertyValue("--stats-header-collapsed"));
      const range = Math.max(0, expanded - collapsed);
      const y = window.scrollY;
      const delta = y - lastY;
      lastY = y;
      // Only a real list scroll changes the collapse; a graph scrub does not.
      if (driver.current !== "chart") collapse += delta;
      collapse = Math.max(0, Math.min(collapse, range, y));
      el.style.setProperty("--stats-header-h", `${expanded - collapse}px`);
      el.style.setProperty(
        "--stats-header-progress",
        range > 0 ? `${collapse / range}` : "0"
      );
    };
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        apply();
      });
    };
    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", apply);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", apply);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className={styles.page} ref={pageRef}>
      <ViewNav />

      <div className={styles.stickyHeader} ref={stickyRef}>
        <section className={styles.hero} data-stats-hero>
          <StatsHeroBackground albums={heroAlbums} seed={0} />
          {now?.playing && (
            <div
              className={`${styles.nowBg}${
                onNowSlot ? ` ${styles.nowBgActive}` : ""
              }`}
              style={now.color ? { backgroundColor: now.color } : undefined}
              aria-hidden
            >
              {now.cover ? (
                <img src={now.cover} className={styles.nowBgImage} alt="" />
              ) : null}
            </div>
          )}
          {isLoading ? (
            <p className={styles.status}>Loading…</p>
          ) : totals.listens === 0 ? (
            <p className={styles.status}>No listens tracked yet.</p>
          ) : (
            <DailyListensChart
              ref={chartApi}
              byDay={byDay}
              onCenterChange={handleCenter}
              now={now}
            />
          )}
        </section>
      </div>

      <section className={styles.dayList}>
        <div className={styles.dayListInner}>
          {!isLoading && totals.listens > 0 && (
            <div className={styles.timeline} ref={diaryRef}>
              {diary.map((day) => (
                <Fragment key={day.key}>
                  <div
                    className={`${styles.row} ${styles.dayHeaderRow}`}
                    data-day-key={day.key}
                    ref={observeRow}
                  >
                    <span className={styles.rail}>
                      <span className={styles.ring} />
                    </span>
                    <span className={styles.dayHeader}>
                      <span className={styles.dayName}>{dayLabel(day.key)}</span>
                      {day.stat && (
                        <span className={styles.dayMeta}>
                          {day.stat.albumCount}{" "}
                          {day.stat.albumCount === 1 ? "album" : "albums"} ·{" "}
                          {formatRuntimeCompact(day.stat.seconds)}
                        </span>
                      )}
                    </span>
                  </div>
                  {day.albums.map((album) => {
                    const cover =
                      album.record?.supabase_image_url ||
                      album.record?.coverImage;
                    const range =
                      album.count > 1
                        ? `${fmtTime(album.first)} — ${fmtTime(album.last)}`
                        : fmtTime(album.first);
                    const isNowEntry =
                      playing &&
                      !!nowEvent &&
                      day.key === nowEvent.dateKey &&
                      album.id === nowEvent.releaseId;
                    return (
                      <div
                        key={`${day.key}-${album.id}`}
                        className={`${styles.row}${
                          isNowEntry ? ` ${styles.nowRow}` : ""
                        }`}
                        ref={observeRow}
                      >
                        <span className={styles.rail}>
                          <span className={styles.dot} />
                        </span>
                        {cover ? (
                          <img
                            src={cover}
                            alt=""
                            className={`${styles.cover} ${styles.coverFade}`}
                            loading="lazy"
                            ref={markCoverLoaded}
                            onLoad={(e) =>
                              e.currentTarget.classList.add(styles.coverLoaded)
                            }
                          />
                        ) : (
                          <span
                            className={`${styles.cover} ${styles.coverPlaceholder}`}
                          >
                            {album.record?.title[0]}
                          </span>
                        )}
                        <span className={styles.entryMeta}>
                          {isNowEntry ? (
                            <span
                              className={`${styles.nowTag} ${styles.nowTagPlaying}`}
                            >
                              Now Playing
                            </span>
                          ) : null}
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
                  })}
                </Fragment>
              ))}
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

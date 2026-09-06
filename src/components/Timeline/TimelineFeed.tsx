import { useMemo, useState, useEffect } from "react";
import { useActivity, toDateKey } from "../../hooks/useActivity";
import { useListens } from "../../hooks/useListens";
import type { ActivityEvent } from "../../hooks/useActivity";
import { RecordPanel } from "./RecordPanel";
import { TIMEZONE } from "../../utils/timezone";
import { formatRuntimeCompact } from "../../utils/formatDuration";
import { DateIndicator, type MonthMarker } from "../DateIndicator/DateIndicator";
import { TimelineDot } from "./TimelineDot";
import styles from "./TimelineFeed.module.css";

interface TimelineFeedProps {
  search: string;
}

const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function monthKey(dateKey: string): string {
  return dateKey.slice(0, 7);
}

function monthLabel(key: string): string {
  const [year, month] = key.split("-").map(Number);
  return `${MONTHS_SHORT[month - 1]} '${String(year).slice(2)}`;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function formatDay(dateKey: string, todayKey: string): string {
  if (dateKey === todayKey) return "Today";

  const [ty, tm, td] = todayKey.split("-").map(Number);
  const yesterday = new Date(ty, tm - 1, td - 1, 12);
  const yesterdayKey = `${yesterday.getFullYear()}-${pad(yesterday.getMonth() + 1)}-${pad(
    yesterday.getDate()
  )}`;
  if (dateKey === yesterdayKey) return "Yesterday";

  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day, 12).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function timeOf(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString("en-US", {
    timeZone: TIMEZONE,
    hour: "numeric",
    minute: "2-digit",
  });
}

// The stop time is explicit when logged, otherwise inferred from the album's
// runtime (a full listen), so a range is always available.
function endOf(event: ActivityEvent): string | null {
  if (event.endedAt) return timeOf(event.endedAt);
  const duration = event.record?.duration_seconds;
  if (!duration) return null;
  const end = new Date(new Date(event.timestamp).getTime() + duration * 1000);
  return timeOf(end.toISOString());
}

function timeRange(event: ActivityEvent): string {
  const start = timeOf(event.timestamp);
  const end = endOf(event);
  return end ? `${start} – ${end}` : start;
}

// "Currently spinning": the freshest listen that hasn't been stopped and
// whose full-album runtime still reaches past now.
function playingNow(event: ActivityEvent, nowMs: number): boolean {
  if (event.type !== "listen" || event.endedAt) return false;
  const duration = event.record?.duration_seconds;
  if (!duration) return false;
  const startMs = new Date(event.timestamp).getTime();
  return startMs <= nowMs && startMs + duration * 1000 > nowMs;
}

function TimelineRow({
  event,
  ordinal,
  playing,
  selected,
  onSelect,
}: {
  event: ActivityEvent;
  ordinal: number;
  playing: boolean;
  selected: boolean;
  onSelect: (event: ActivityEvent) => void;
}) {
  const [imageError, setImageError] = useState(false);
  const record = event.record;
  if (!record) return null;

  const showImage = record.supabase_image_url && !imageError;

  return (
    <div className={styles.row}>
      <span className={styles.node}>
        <TimelineDot pulsing={playing} />
      </span>
      <button
        type="button"
        className={`${styles.card} ${selected ? styles.cardActive : ""}`}
        onClick={() => onSelect(event)}
      >
        <div className={styles.thumb}>
          {showImage ? (
            <img
              src={record.supabase_image_url}
              alt={`${record.title} by ${record.artist}`}
              className={styles.image}
              loading="lazy"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className={styles.placeholder}>
              <span>{record.title[0]}</span>
            </div>
          )}
          {ordinal === 1 && (
            <span className={styles.firstPlayBadge}>1st Play</span>
          )}
        </div>
        <div className={styles.meta}>
          {playing ? (
            <span className={styles.when}>
              <span className={styles.liveTag}>Now Playing</span>
              <span className={styles.since}>since {timeOf(event.timestamp)}</span>
            </span>
          ) : (
            <span className={styles.when}>{timeRange(event)}</span>
          )}
          <h3 className={styles.title}>{record.title}</h3>
          <p className={styles.artist}>{record.artist}</p>
          <span className={styles.playCount}>
            {ordinal === 1 ? "First time played" : `Played ${ordinal} times`}
          </span>
        </div>
      </button>
    </div>
  );
}

export function TimelineFeed({ search }: TimelineFeedProps) {
  const { events, isLoading } = useActivity();
  const { listens } = useListens();
  const todayKey = toDateKey(new Date().toISOString());
  const [selected, setSelected] = useState<ActivityEvent | null>(null);
  const [nowMs, setNowMs] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNowMs(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);

  const playsByReleaseId = useMemo(() => {
    const counts = new Map<number, number>();
    for (const listen of listens) {
      counts.set(listen.release_id, (counts.get(listen.release_id) ?? 0) + 1);
    }
    return counts;
  }, [listens]);

  // How many times each record had been played through a given spin
  // (chronological), so the first-ever listen reads "First time played".
  const playOrdinalByEventId = useMemo(() => {
    const byRelease = new Map<number, ActivityEvent[]>();
    for (const e of events) {
      if (e.type !== "listen") continue;
      const arr = byRelease.get(e.releaseId);
      if (arr) arr.push(e);
      else byRelease.set(e.releaseId, [e]);
    }
    const ordinals = new Map<string, number>();
    for (const list of byRelease.values()) {
      list
        .slice()
        .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
        .forEach((e, i) => ordinals.set(e.id, i + 1));
    }
    return ordinals;
  }, [events]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return events.filter((e) => {
      if (e.type !== "listen" || !e.record) return false;
      if (!q) return true;
      return (
        e.record.title.toLowerCase().includes(q) ||
        e.record.artist.toLowerCase().includes(q)
      );
    });
  }, [events, search]);

  // Only the newest spin can still be on the platter.
  const playingId =
    filtered.length > 0 && playingNow(filtered[0], nowMs) ? filtered[0].id : null;

  // Group by day, preserving the newest-first order of `filtered`.
  const days = useMemo(() => {
    const map = new Map<string, ActivityEvent[]>();
    for (const e of filtered) {
      const arr = map.get(e.dateKey);
      if (arr) arr.push(e);
      else map.set(e.dateKey, [e]);
    }
    return Array.from(map.entries());
  }, [filtered]);

  const months = useMemo<MonthMarker[]>(() => {
    const seen = new Set<string>();
    const markers: MonthMarker[] = [];
    for (const [dateKey] of days) {
      const key = monthKey(dateKey);
      if (!seen.has(key)) {
        seen.add(key);
        markers.push({ key, label: monthLabel(key) });
      }
    }
    return markers;
  }, [days]);

  if (isLoading) {
    return <p className={styles.status}>Loading...</p>;
  }

  if (filtered.length === 0) {
    return <p className={styles.status}>No spins to show.</p>;
  }

  return (
    <>
      <DateIndicator months={months} />
      <div className={styles.feed}>
        {days.map(([dateKey, dayEvents]) => {
          const albumCount = new Set(dayEvents.map((e) => e.releaseId)).size;
          const seconds = dayEvents.reduce(
            (sum, e) => sum + (e.record?.duration_seconds || 0),
            0
          );
          return (
            <section
              key={dateKey}
              className={styles.dayGroup}
              data-month={monthKey(dateKey)}
            >
              <div className={styles.dayHeader}>
                <span className={styles.dayMarker} />
                <div className={styles.dayHeading}>
                  <span className={styles.dayLabel}>
                    {formatDay(dateKey, todayKey)}
                  </span>
                  <span className={styles.dayStats}>
                    {albumCount} {albumCount === 1 ? "album" : "albums"} ·{" "}
                    {formatRuntimeCompact(seconds)}
                  </span>
                </div>
              </div>
              {dayEvents.map((event) => (
                <TimelineRow
                  key={event.id}
                  event={event}
                  ordinal={playOrdinalByEventId.get(event.id) ?? 1}
                  playing={event.id === playingId}
                  selected={selected?.id === event.id}
                  onSelect={setSelected}
                />
              ))}
            </section>
          );
        })}
      </div>
      {selected && (
        <RecordPanel
          event={selected}
          plays={playsByReleaseId.get(selected.releaseId) ?? 0}
          dayLabel={formatDay(selected.dateKey, todayKey)}
          timeRange={timeRange(selected)}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}

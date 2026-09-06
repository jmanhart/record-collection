import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useActivity, toDateKey } from "../../hooks/useActivity";
import { useListens } from "../../hooks/useListens";
import type { ActivityEvent } from "../../hooks/useActivity";
import { slugify } from "../../utils/slugify";
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

function TimelineRow({
  event,
  plays,
  playing,
}: {
  event: ActivityEvent;
  plays: number;
  playing: boolean;
}) {
  const [imageError, setImageError] = useState(false);
  const record = event.record;
  if (!record) return null;

  const to = `/${slugify(record.artist)}/${slugify(record.title)}`;
  const showImage = record.supabase_image_url && !imageError;

  return (
    <div className={styles.row}>
      <span className={styles.node}>
        <TimelineDot pulsing={playing} />
      </span>
      <Link to={to} className={styles.card}>
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
          {plays > 0 && (
            <span
              className={styles.playsBadge}
              title={`${plays} ${plays === 1 ? "play" : "plays"}`}
            >
              {plays}
            </span>
          )}
        </div>
        <div className={styles.meta}>
          <span className={styles.when}>{timeRange(event)}</span>
          <h3 className={styles.title}>{record.title}</h3>
          <p className={styles.artist}>{record.artist}</p>
        </div>
      </Link>
    </div>
  );
}

export function TimelineFeed({ search }: TimelineFeedProps) {
  const { events, isLoading } = useActivity();
  const { listens } = useListens();
  const todayKey = toDateKey(new Date().toISOString());

  const playsByReleaseId = useMemo(() => {
    const counts = new Map<number, number>();
    for (const listen of listens) {
      counts.set(listen.release_id, (counts.get(listen.release_id) ?? 0) + 1);
    }
    return counts;
  }, [listens]);

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
                  plays={playsByReleaseId.get(event.releaseId) ?? 0}
                  playing={false}
                />
              ))}
            </section>
          );
        })}
      </div>
    </>
  );
}

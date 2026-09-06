import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useActivity } from "../../hooks/useActivity";
import { useListens } from "../../hooks/useListens";
import type { ActivityEvent } from "../../hooks/useActivity";
import { slugify } from "../../utils/slugify";
import { TIMEZONE } from "../../utils/timezone";
import { DateIndicator, type MonthMarker } from "../DateIndicator/DateIndicator";
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

function formatWhen(timestamp: string): string {
  const d = new Date(timestamp);
  const date = d.toLocaleDateString("en-US", {
    timeZone: TIMEZONE,
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const time = d.toLocaleTimeString("en-US", {
    timeZone: TIMEZONE,
    hour: "numeric",
    minute: "2-digit",
  });
  return `${date} · ${time}`;
}

function TimelineRow({ event, plays }: { event: ActivityEvent; plays: number }) {
  const [imageError, setImageError] = useState(false);
  const record = event.record;
  if (!record) return null;

  const to = `/${slugify(record.artist)}/${slugify(record.title)}`;
  const showImage = record.supabase_image_url && !imageError;

  return (
    <div className={styles.row} data-month={monthKey(event.dateKey)}>
      <div className={styles.spine}>
        <span className={styles.node} />
      </div>
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
          <span className={styles.when}>{formatWhen(event.timestamp)}</span>
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

  const months = useMemo<MonthMarker[]>(() => {
    const seen = new Set<string>();
    const markers: MonthMarker[] = [];
    for (const e of filtered) {
      const key = monthKey(e.dateKey);
      if (!seen.has(key)) {
        seen.add(key);
        markers.push({ key, label: monthLabel(key) });
      }
    }
    return markers;
  }, [filtered]);

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
        {filtered.map((event) => (
          <TimelineRow
            key={event.id}
            event={event}
            plays={playsByReleaseId.get(event.releaseId) ?? 0}
          />
        ))}
      </div>
    </>
  );
}

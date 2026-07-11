import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { slugify } from "../../utils/slugify";
import { TIMEZONE } from "../../utils/timezone";
import { formatRuntime } from "../../utils/formatDuration";
import type { ActivityEvent } from "../../hooks/useActivity";
import styles from "./ActivityFeed.module.css";

interface ActivityFeedProps {
  events: ActivityEvent[];
  todayKey: string;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function formatDayHeading(dateKey: string, todayKey: string): string {
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
    year: year !== ty ? "numeric" : undefined,
  });
}

function formatTime(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString("en-US", {
    timeZone: TIMEZONE,
    hour: "numeric",
    minute: "2-digit",
  });
}

export function ActivityFeed({ events, todayKey }: ActivityFeedProps) {
  if (events.length === 0) {
    return <p className={styles.empty}>No activity this month.</p>;
  }

  const groups = new Map<string, ActivityEvent[]>();
  for (const event of events) {
    const group = groups.get(event.dateKey);
    if (group) {
      group.push(event);
    } else {
      groups.set(event.dateKey, [event]);
    }
  }

  return (
    <div className={styles.feed}>
      {Array.from(groups.entries()).map(([dateKey, items]) => {
        const listens = items.filter((e) => e.type === "listen");
        const purchases = items.filter((e) => e.type === "purchase");
        const albumCount = new Set(listens.map((e) => e.releaseId)).size;
        const seconds = listens.reduce(
          (sum, e) => sum + (e.record?.duration_seconds || 0),
          0
        );
        const summaryParts: string[] = [];
        if (albumCount > 0) {
          summaryParts.push(`${albumCount} ${albumCount === 1 ? "album" : "albums"}`);
          const runtime = formatRuntime(seconds);
          if (runtime) summaryParts.push(runtime);
        }
        if (purchases.length > 0) {
          summaryParts.push(`${purchases.length} added`);
        }

        return (
          <div key={dateKey} className={styles.group}>
            <h4 className={styles.dateHeading}>
              <span>{formatDayHeading(dateKey, todayKey)}</span>
              <span className={styles.daySummary}>{summaryParts.join(" · ")}</span>
            </h4>
            <div className={styles.entries}>
              {items.map((event) => {
                const record = event.record;
                const coverSrc = record?.supabase_image_url || record?.coverImage;
                const isPurchase = event.type === "purchase";
                const content = (
                  <div
                    className={`${styles.entry} ${isPurchase ? styles.purchase : ""}`}
                  >
                    <div className={styles.cover}>
                      {coverSrc ? (
                        <img src={coverSrc} alt="" loading="lazy" />
                      ) : (
                        <div className={styles.coverPlaceholder} />
                      )}
                    </div>
                    <div className={styles.info}>
                      <span className={styles.title}>
                        {record?.title || `Release ${event.releaseId}`}
                      </span>
                      <span className={styles.artist}>
                        {record?.artist || "Unknown artist"}
                      </span>
                    </div>
                    {isPurchase ? (
                      <span className={styles.purchaseBadge}>
                        <Plus size={12} />
                        Added to collection
                      </span>
                    ) : (
                      <span className={styles.time}>{formatTime(event.timestamp)}</span>
                    )}
                  </div>
                );

                return record ? (
                  <Link
                    key={event.id}
                    to={`/${slugify(record.artist)}/${slugify(record.title)}`}
                    className={styles.entryLink}
                  >
                    {content}
                  </Link>
                ) : (
                  <div key={event.id}>{content}</div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

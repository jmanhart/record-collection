import { Link } from "react-router-dom";
import { useListens } from "../../hooks/useListens";
import { useRecords } from "../../hooks/useRecords";
import { slugify } from "../../utils/slugify";
import { TIMEZONE } from "../../utils/timezone";
import type { Listen } from "../../services/supabase";
import type { Record } from "../../types/Record";
import styles from "./Timeline.module.css";

interface ListenWithRecord extends Listen {
  record?: Record;
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: TIMEZONE,
  year: "numeric",
  month: "numeric",
  day: "numeric",
});

function getCalendarDate(date: Date): string {
  const parts = dateFormatter.formatToParts(date);
  const year = parts.find((p) => p.type === "year")!.value;
  const month = parts.find((p) => p.type === "month")!.value.padStart(2, "0");
  const day = parts.find((p) => p.type === "day")!.value.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const todayKey = getCalendarDate(now);
  const listenKey = getCalendarDate(date);

  if (listenKey === todayKey) return "Today";

  const yesterday = new Date(now.getTime() - 86400000);
  const yesterdayKey = getCalendarDate(yesterday);
  if (listenKey === yesterdayKey) return "Yesterday";

  const year = listenKey.slice(0, 4);
  const nowYear = todayKey.slice(0, 4);
  return date.toLocaleDateString("en-US", {
    timeZone: TIMEZONE,
    month: "long",
    day: "numeric",
    year: year !== nowYear ? "numeric" : undefined,
  });
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("en-US", {
    timeZone: TIMEZONE,
    hour: "numeric",
    minute: "2-digit",
  });
}

function groupByDate(listens: ListenWithRecord[]): Map<string, ListenWithRecord[]> {
  const groups = new Map<string, ListenWithRecord[]>();
  for (const listen of listens) {
    const key = formatDate(listen.listened_at);
    const group = groups.get(key);
    if (group) {
      group.push(listen);
    } else {
      groups.set(key, [listen]);
    }
  }
  return groups;
}

export function Timeline() {
  const { listens, isLoading: isLoadingListens } = useListens();
  const { records, isLoading: isLoadingRecords } = useRecords();

  const isLoading = isLoadingListens || isLoadingRecords;

  if (isLoading) {
    return <div className={styles.loading}>Loading timeline...</div>;
  }

  if (listens.length === 0) {
    return <div className={styles.empty}>No listening activity yet.</div>;
  }

  const recordMap = new Map(records.map((r) => [r.id, r]));
  const enriched: ListenWithRecord[] = listens.map((l) => ({
    ...l,
    record: recordMap.get(l.release_id),
  }));

  const grouped = groupByDate(enriched);

  return (
    <div className={styles.timeline}>
      {Array.from(grouped.entries()).map(([date, items]) => (
        <div key={date} className={styles.group}>
          <h4 className={styles.dateHeading}>{date}</h4>
          <div className={styles.entries}>
            {items.map((item) => {
              const record = item.record;
              const coverSrc = record?.coverImage || record?.supabase_image_url;
              const content = (
                <div className={styles.entry}>
                  <div className={styles.cover}>
                    {coverSrc ? (
                      <img src={coverSrc} alt="" />
                    ) : (
                      <div className={styles.coverPlaceholder} />
                    )}
                  </div>
                  <div className={styles.info}>
                    <span className={styles.title}>
                      {record?.title || `Release ${item.release_id}`}
                    </span>
                    <span className={styles.artist}>{record?.artist || "Unknown artist"}</span>
                  </div>
                  <span className={styles.time}>{formatTime(item.listened_at)}</span>
                </div>
              );

              return record ? (
                <Link
                  key={item.id}
                  to={`/${slugify(record.artist)}/${slugify(record.title)}`}
                  className={styles.entryLink}
                >
                  {content}
                </Link>
              ) : (
                <div key={item.id}>{content}</div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

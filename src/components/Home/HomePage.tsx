import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";
import { useActivity, toDateKey, type ActivityEvent } from "../../hooks/useActivity";
import { StatCard, StatCardRow } from "../StatCard/StatCard";
import { MonthCalendar } from "./MonthCalendar";
import { WeeklyBars, type WeekBucket } from "./WeeklyBars";
import { ActivityFeed } from "./ActivityFeed";
import { slugify } from "../../utils/slugify";
import { TIMEZONE } from "../../utils/timezone";
import { formatRuntimeCompact } from "../../utils/formatDuration";
import styles from "./HomePage.module.css";

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function getWeekBuckets(
  year: number,
  month: number,
  events: ActivityEvent[]
): WeekBucket[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = new Date(year, month, 1, 12).getDay();
  const monthShort = new Date(year, month, 1).toLocaleDateString("en-US", {
    month: "short",
  });

  // Calendar weeks (Sun–Sat), clipped to the month, matching the grid rows
  const weeks: { start: number; end: number }[] = [];
  let start = 1;
  let end = Math.min(7 - firstWeekday, daysInMonth);
  while (start <= daysInMonth) {
    weeks.push({ start, end });
    start = end + 1;
    end = Math.min(end + 7, daysInMonth);
  }

  const prefix = `${year}-${pad(month + 1)}-`;
  return weeks.map(({ start, end }) => {
    const startKey = `${prefix}${pad(start)}`;
    const endKey = `${prefix}${pad(end)}`;
    const weekListens = events.filter(
      (e) => e.type === "listen" && e.dateKey >= startKey && e.dateKey <= endKey
    );
    const albums = new Set(weekListens.map((e) => e.releaseId)).size;
    const seconds = weekListens.reduce(
      (sum, e) => sum + (e.record?.duration_seconds || 0),
      0
    );
    return {
      label: `${monthShort} ${start}–${end}`,
      albums,
      minutes: Math.round(seconds / 60),
    };
  });
}

function formatHeroWhen(event: ActivityEvent, todayKey: string): string {
  const time = new Date(event.timestamp).toLocaleTimeString("en-US", {
    timeZone: TIMEZONE,
    hour: "numeric",
    minute: "2-digit",
  });
  if (event.dateKey === todayKey) return `Today · ${time}`;

  const [year, month, day] = event.dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day, 12).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: year !== Number(todayKey.slice(0, 4)) ? "numeric" : undefined,
  });
  return `${date} · ${time}`;
}

export default function HomePage() {
  const { events, byDay, isLoading } = useActivity();

  const todayKey = toDateKey(new Date().toISOString());
  const [cursor, setCursor] = useState(() => ({
    year: Number(todayKey.slice(0, 4)),
    month: Number(todayKey.slice(5, 7)) - 1,
  }));
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const handleNavigate = (delta: number) => {
    setCursor(({ year, month }) => {
      const next = new Date(year, month + delta, 1);
      return { year: next.getFullYear(), month: next.getMonth() };
    });
    setSelectedDay(null);
  };

  const yearPrefix = `${todayKey.slice(0, 4)}-`;
  const yearStats = useMemo(() => {
    const yearListens = events.filter(
      (e) => e.type === "listen" && e.dateKey.startsWith(yearPrefix)
    );
    const albums = new Set(yearListens.map((e) => e.releaseId)).size;
    const seconds = yearListens.reduce(
      (sum, e) => sum + (e.record?.duration_seconds || 0),
      0
    );

    // Current Sun–Sat week, matching the calendar rows
    const [ty, tm, td] = todayKey.split("-").map(Number);
    const today = new Date(ty, tm - 1, td, 12);
    const weekStart = new Date(ty, tm - 1, td - today.getDay(), 12);
    const weekStartKey = `${weekStart.getFullYear()}-${pad(weekStart.getMonth() + 1)}-${pad(
      weekStart.getDate()
    )}`;
    const weekSeconds = events
      .filter(
        (e) =>
          e.type === "listen" && e.dateKey >= weekStartKey && e.dateKey <= todayKey
      )
      .reduce((sum, e) => sum + (e.record?.duration_seconds || 0), 0);

    return { listens: yearListens.length, albums, seconds, weekSeconds };
  }, [events, yearPrefix, todayKey]);

  const monthPrefix = `${cursor.year}-${pad(cursor.month + 1)}-`;
  const monthEvents = useMemo(
    () => events.filter((e) => e.dateKey.startsWith(monthPrefix)),
    [events, monthPrefix]
  );

  const weekBuckets = useMemo(
    () => getWeekBuckets(cursor.year, cursor.month, monthEvents),
    [cursor.year, cursor.month, monthEvents]
  );

  const feedEvents = selectedDay
    ? monthEvents.filter((e) => e.dateKey === selectedDay)
    : monthEvents;

  const latestListen = events.find((e) => e.type === "listen");
  const heroRecord = latestListen?.record;
  const heroCover = heroRecord?.supabase_image_url || heroRecord?.coverImage;

  return (
    <div className={styles.container}>
      <header className={styles.pageHeader}>
        <Link to="/" className={styles.backLink}>
          ← Collection
        </Link>
      </header>

      {isLoading ? (
        <p className={styles.status}>Loading...</p>
      ) : (
        <>
          {latestListen && heroRecord && (
            <Link
              to={`/${slugify(heroRecord.artist)}/${slugify(heroRecord.title)}`}
              className={styles.heroLink}
            >
              <div className={styles.hero}>
                {heroCover ? (
                  <img src={heroCover} alt="" className={styles.heroCover} />
                ) : (
                  <div className={styles.heroCoverPlaceholder} />
                )}
                <div className={styles.heroInfo}>
                  <span className={styles.heroLabel}>Latest listen</span>
                  <span className={styles.heroTitle}>{heroRecord.title}</span>
                  <span className={styles.heroArtist}>{heroRecord.artist}</span>
                  <span className={styles.heroWhen}>
                    {formatHeroWhen(latestListen, todayKey)}
                  </span>
                </div>
              </div>
            </Link>
          )}

          <StatCardRow>
            <StatCard
              label="Listens this year"
              value={yearStats.listens}
              sub={`${yearStats.albums} different albums`}
            />
            <StatCard
              label="Time listened"
              value={formatRuntimeCompact(yearStats.seconds)}
              sub="this year"
            />
            <StatCard
              label="This week"
              value={formatRuntimeCompact(yearStats.weekSeconds)}
              sub="time listened"
            />
          </StatCardRow>

          <div className={styles.vizSection}>
            <MonthCalendar
              year={cursor.year}
              month={cursor.month}
              byDay={byDay}
              todayKey={todayKey}
              selectedDay={selectedDay}
              onSelectDay={setSelectedDay}
              onNavigate={handleNavigate}
            />
            <WeeklyBars buckets={weekBuckets} />
          </div>

          <div className={styles.feedSection}>
            <div className={styles.feedHeader}>
              <h3 className={styles.feedTitle}>Activity</h3>
              {selectedDay && (
                <button
                  className={styles.clearChip}
                  onClick={() => setSelectedDay(null)}
                >
                  {selectedDay.slice(8, 10).replace(/^0/, "")}{" "}
                  {new Date(cursor.year, cursor.month, 1).toLocaleDateString("en-US", {
                    month: "short",
                  })}
                  <X size={12} />
                </button>
              )}
            </div>
            <ActivityFeed events={feedEvents} todayKey={todayKey} />
          </div>
        </>
      )}
    </div>
  );
}

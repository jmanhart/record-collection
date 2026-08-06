import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useTimelineDays, toLocalMinutes } from "../../hooks/useTimelineDays";
import { DayRow } from "./DayRow";
import styles from "./TimelinePage.module.css";

/** Quarter-day ticks; noon carries the midpoint the layout is built around. */
const AXIS_TICKS = [
  { at: 0, label: "12a" },
  { at: 25, label: "6a" },
  { at: 50, label: "12p" },
  { at: 75, label: "6p" },
  { at: 100, label: "12a" },
];

function monthLabel(dateKey: string): string {
  const [year, month] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export default function TimelinePage() {
  const { days, isLoading } = useTimelineDays();

  const nowMinutes = useMemo(() => toLocalMinutes(new Date().toISOString()), []);

  // Days arrive newest-first; grouping preserves that order within each month
  const months = useMemo(() => {
    const groups: { key: string; label: string; days: typeof days }[] = [];
    for (const day of days) {
      const key = day.dateKey.slice(0, 7);
      const last = groups[groups.length - 1];
      if (last && last.key === key) last.days.push(day);
      else groups.push({ key, label: monthLabel(day.dateKey), days: [day] });
    }
    return groups;
  }, [days]);

  const totalListens = days.reduce((sum, d) => sum + d.blocks.length, 0);

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <Link to="/" className={styles.backLink}>
          ← Collection
        </Link>
        <h2 className={styles.title}>Timeline</h2>
        <p className={styles.subtitle}>
          {isLoading
            ? "Loading…"
            : `${totalListens} listens across ${days.length} days · each row is one day, midnight to midnight`}
        </p>
      </header>

      {/* The axis rides inside the scroller so it stays aligned with the rows
          when the canvas is scrolled sideways on narrow screens. */}
      <div className={styles.scroller}>
        <div className={styles.canvas}>
          <div className={styles.axis}>
            <div className={styles.axisGutter} />
            <div className={styles.axisTrack}>
              {AXIS_TICKS.map(({ at, label }) => (
                <span
                  key={`${at}-${label}`}
                  className={`${styles.axisTick} ${at === 50 ? styles.axisNoon : ""}`}
                  style={{ left: `${at}%` }}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>

          {isLoading ? (
            <p className={styles.status}>Loading timeline…</p>
          ) : (
            months.map((month) => (
              <section key={month.key} className={styles.month}>
                <h3 className={styles.monthHeading}>{month.label}</h3>
                {month.days.map((day) => (
                  <DayRow
                    key={day.dateKey}
                    day={day}
                    nowMinutes={day.isToday ? nowMinutes : undefined}
                  />
                ))}
              </section>
            ))
          )}
        </div>
      </div>

      <p className={styles.footnote}>
        Block length is the album's runtime, trimmed when the next record
        started first. Playback isn't measured, so these are close estimates.
      </p>
    </div>
  );
}

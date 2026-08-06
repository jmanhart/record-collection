import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useTimelineDays, toLocalMinutes } from "../../hooks/useTimelineDays";
import { DayRow } from "./DayRow";
import styles from "./TimelinePage.module.css";

/** One tick an hour, plus the closing midnight. */
const AXIS_TICKS = Array.from({ length: 25 }, (_, hour) => {
  const suffix = hour < 12 || hour === 24 ? "a" : "p";
  const display = hour % 12 === 0 ? 12 : hour % 12;
  return { hour, label: `${display}${suffix}` };
});

export default function TimelinePage() {
  const { days, isLoading } = useTimelineDays();

  const nowMinutes = useMemo(() => toLocalMinutes(new Date().toISOString()), []);

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

      {/* Scrolls in both directions. The axis pins to its top and the day
          labels to its left, which only works because this container is the
          scrollport for both axes. */}
      <div className={styles.scroller}>
        <div className={styles.canvas}>
          <div className={styles.axis}>
            <div className={styles.axisGutter} />
            <div className={styles.axisTrack}>
              {AXIS_TICKS.map(({ hour, label }) => (
                <span
                  key={hour}
                  className={`${styles.axisTick} ${hour === 12 ? styles.axisNoon : ""}`}
                  style={{ left: `${(hour / 24) * 100}%` }}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>

          {isLoading ? (
            <p className={styles.status}>Loading timeline…</p>
          ) : (
            days.map((day) => (
              <DayRow
                key={day.dateKey}
                day={day}
                nowMinutes={day.isToday ? nowMinutes : undefined}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

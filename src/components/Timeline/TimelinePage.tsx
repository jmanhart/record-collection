import { useLayoutEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import {
  useTimelineDays,
  toLocalMinutes,
  MINUTES_PER_DAY,
} from "../../hooks/useTimelineDays";
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

  const scrollerRef = useRef<HTMLDivElement>(null);
  const hasCentered = useRef(false);

  // Open on the current time of day rather than at midnight, which is seven
  // hours of empty canvas away from anything. Measured off the rendered track
  // so it stays right if the zoom changes. Layout effect so it lands before
  // paint instead of visibly jumping.
  useLayoutEffect(() => {
    if (isLoading || hasCentered.current) return;
    const scroller = scrollerRef.current;
    const track = scroller?.querySelector<HTMLElement>(`.${styles.axisTrack}`);
    if (!scroller || !track) return;

    const trackRect = track.getBoundingClientRect();
    const trackStart =
      trackRect.left - scroller.getBoundingClientRect().left + scroller.scrollLeft;
    const nowX = trackStart + (nowMinutes / MINUTES_PER_DAY) * trackRect.width;

    // The browser clamps for us at either end of the day
    scroller.scrollLeft = nowX - scroller.clientWidth / 2;
    hasCentered.current = true;
  }, [isLoading, nowMinutes]);

  return (
    <div className={styles.page}>
      <header className={styles.appBar}>
        <Link to="/" className={styles.backLink}>
          <span aria-hidden="true">←</span> Timeline
        </Link>
        {!isLoading && (
          <span className={styles.appBarMeta}>
            {totalListens} listens · {days.length} days
          </span>
        )}
      </header>

      {/* Scrolls in both directions. The axis pins to its top and the day
          labels to its left, which only works because this container is the
          scrollport for both axes. */}
      <div className={styles.scroller} ref={scrollerRef}>
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

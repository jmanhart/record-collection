import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link } from "react-router-dom";
import type { CSSProperties } from "react";
import {
  useTimelineDays,
  toLocalMinutes,
  MINUTES_PER_DAY,
} from "../../hooks/useTimelineDays";
import {
  useTimelineZoom,
  sliderToZoom,
  zoomToSlider,
} from "../../hooks/useTimelineZoom";
import { DayRow } from "./DayRow";
import { TimelineDetail } from "./TimelineDetail";
import { Button } from "../Button/Button";
import styles from "./TimelinePage.module.css";

/**
 * How finely the axis is divided at a given zoom. Chosen so labels stay
 * roughly 60–150px apart and hash marks 30–50px apart at every level —
 * dense enough to read against, never crowded.
 */
const AXIS_SCALE = [
  { from: 460, labelEvery: 15, tickEvery: 5 },
  { from: 260, labelEvery: 30, tickEvery: 10 },
  { from: 150, labelEvery: 60, tickEvery: 15 },
  { from: 56, labelEvery: 60, tickEvery: 30 },
  { from: 40, labelEvery: 120, tickEvery: 60 },
  { from: 26, labelEvery: 180, tickEvery: 60 },
  { from: 0, labelEvery: 360, tickEvery: 120 },
];

function axisScaleFor(hourWidth: number) {
  return AXIS_SCALE.find((step) => hourWidth >= step.from) ?? AXIS_SCALE[AXIS_SCALE.length - 1];
}

/** Hours read as "5p"; anything finer is a bare ":15" under its hour. */
function axisLabel(minutes: number): string {
  const minute = minutes % 60;
  if (minute !== 0) return `:${String(minute).padStart(2, "0")}`;
  const hour = Math.floor(minutes / 60) % 24;
  const suffix = hour < 12 ? "a" : "p";
  return `${hour % 12 === 0 ? 12 : hour % 12}${suffix}`;
}

export default function TimelinePage() {
  const { days, isLoading } = useTimelineDays();

  const nowMinutes = useMemo(() => toLocalMinutes(new Date().toISOString()), []);

  const totalListens = days.reduce((sum, d) => sum + d.blocks.length, 0);

  const scrollerRef = useRef<HTMLDivElement>(null);
  const hasCentered = useRef(false);

  const getTrack = useCallback(
    () => scrollerRef.current?.querySelector<HTMLElement>(`.${styles.axisTrack}`) ?? null,
    []
  );

  const { hourWidth, minHourWidth, zoomTo } = useTimelineZoom({
    scrollerRef,
    getTrack,
    focusFraction: nowMinutes / MINUTES_PER_DAY,
  });

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [closeGaps, setCloseGaps] = useState(false);

  const selection = useMemo(() => {
    if (!selectedId) return null;
    for (const day of days) {
      const block = day.blocks.find((b) => b.id === selectedId);
      if (block) return { block, dateKey: day.dateKey };
    }
    return null;
  }, [selectedId, days]);

  /** How often the selected record appears anywhere on the timeline */
  const selectionListens = useMemo(() => {
    if (!selection) return 0;
    return days.reduce(
      (sum, day) =>
        sum +
        day.blocks.filter((b) => b.releaseId === selection.block.releaseId).length,
      0
    );
  }, [selection, days]);

  // Bring the selection into the middle of whatever width is left beside the
  // panel. Runs after the panel has taken its space, so the measurement is of
  // the shrunken scrollport rather than the full-width one.
  useEffect(() => {
    if (!selectedId) return;
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const frame = requestAnimationFrame(() => {
      const el = scroller.querySelector<HTMLElement>(
        `[data-block-id="${CSS.escape(selectedId)}"]`
      );
      if (!el) return;

      const scrollerRect = scroller.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      const blockCentre =
        elRect.left - scrollerRect.left + scroller.scrollLeft + elRect.width / 2;
      scroller.scrollLeft = blockCentre - scroller.clientWidth / 2;

      // Vertical only when the row would otherwise sit against an edge
      const top = elRect.top - scrollerRect.top;
      const margin = scroller.clientHeight * 0.15;
      if (top < margin || top > scroller.clientHeight - margin) {
        scroller.scrollTop +=
          top - (scroller.clientHeight - elRect.height) / 2;
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [selectedId, hourWidth]);

  const { labelEvery, tickEvery } = axisScaleFor(hourWidth);

  // Only the labels are elements; the hash marks are painted by a gradient,
  // which keeps the DOM flat while a pinch re-renders this every frame.
  const axisMarks = useMemo(() => {
    const marks: { at: number; label: string }[] = [];
    for (let m = 0; m <= MINUTES_PER_DAY; m += labelEvery) {
      marks.push({ at: m, label: axisLabel(m) });
    }
    return marks;
  }, [labelEvery]);

  // Open on the current time of day rather than at midnight, which is seven
  // hours of empty canvas away from anything. Measured off the rendered track
  // so it stays right if the zoom changes. Layout effect so it lands before
  // paint instead of visibly jumping.
  useLayoutEffect(() => {
    if (isLoading || hasCentered.current) return;
    const scroller = scrollerRef.current;
    const track = getTrack();
    if (!scroller || !track) return;

    const trackRect = track.getBoundingClientRect();
    const trackStart =
      trackRect.left - scroller.getBoundingClientRect().left + scroller.scrollLeft;
    const nowX = trackStart + (nowMinutes / MINUTES_PER_DAY) * trackRect.width;

    // The browser clamps for us at either end of the day
    scroller.scrollLeft = nowX - scroller.clientWidth / 2;
    hasCentered.current = true;
  }, [isLoading, nowMinutes, getTrack]);

  return (
    <div
      className={`${styles.page} ${closeGaps ? styles.closeGaps : ""}`}
      style={
        {
          "--hour-width": `${hourWidth}px`,
          // Grid lines follow the labels so every labelled column has an edge;
          // the finer hash marks live only in the axis bar.
          "--grid-step": `${(labelEvery / 60) * hourWidth}px`,
          "--tick-step": `${(tickEvery / 60) * hourWidth}px`,
        } as CSSProperties
      }
    >
      <header className={styles.appBar}>
        <Link to="/" className={styles.backLink}>
          <span aria-hidden="true">←</span> Timeline
        </Link>

        <div className={styles.appBarRight}>
          <Button
            type="button"
            variant={closeGaps ? "primary" : "ghost"}
            size="sm"
            aria-pressed={closeGaps}
            onClick={() => setCloseGaps((value) => !value)}
          >
            {closeGaps ? "Spread Out" : "Close the Gaps"}
          </Button>
          <label className={styles.zoom}>
            <span className={styles.zoomLabel}>Zoom</span>
            <input
              type="range"
              className={styles.zoomSlider}
              min={0}
              max={100}
              step={0.5}
              value={zoomToSlider(hourWidth, minHourWidth)}
              onChange={(event) =>
                zoomTo(sliderToZoom(Number(event.target.value), minHourWidth))
              }
              aria-label="Timeline zoom"
              aria-valuetext={`${Math.round(hourWidth)} pixels per hour`}
              disabled={closeGaps}
              tabIndex={closeGaps ? -1 : 0}
            />
          </label>
          {!isLoading && (
            <span className={styles.appBarMeta}>
              {totalListens} listens · {days.length} days
            </span>
          )}
        </div>
      </header>

      <div className={styles.body}>
      {/* Scrolls in both directions. The axis pins to its top and the day
          labels to its left, which only works because this container is the
          scrollport for both axes. */}
      <div className={styles.scroller} ref={scrollerRef}>
        <div className={styles.canvas}>
          <div className={styles.axis}>
            <div className={styles.axisGutter} />
            <div className={styles.axisTrack}>
              {axisMarks.map(({ at, label }) => (
                <span
                  key={at}
                  className={[
                    styles.axisTick,
                    at % 60 === 0 ? styles.axisHour : styles.axisMinute,
                    at === 720 ? styles.axisNoon : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  style={{ left: `${(at / MINUTES_PER_DAY) * 100}%` }}
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
                selectedId={selectedId}
                onSelect={setSelectedId}
                closeGaps={closeGaps}
              />
            ))
          )}
        </div>
      </div>

        {selection && (
          <TimelineDetail
            block={selection.block}
            dateKey={selection.dateKey}
            totalListens={selectionListens}
            onClose={() => setSelectedId(null)}
          />
        )}
      </div>
    </div>
  );
}

import {
  useMemo,
  useRef,
  useState,
  useLayoutEffect,
  forwardRef,
  useImperativeHandle,
  type PointerEvent as ReactPointerEvent,
} from "react";
import type { DayStats } from "../../hooks/useActivity";
import styles from "./DailyListensChart.module.css";
import { formatRuntimeCompact } from "../../utils/formatDuration";

export interface DayFocus {
  date: Date;
  seconds: number;
  albums: number;
  listens: number;
}

/** Imperative API: center a given day's column under the line without emitting
 *  a center-change (used when the diary list drives the chart). */
export interface ChartHandle {
  centerKey: (dateKey: string) => void;
}

/** Sentinel key for the "now playing" slot at the right end of the chart. */
export const NOW_KEY = "__now__";

interface Props {
  byDay: Map<string, DayStats>;
  /** Called with the dateKey under the center line on a *user* scrub only.
   *  Emits NOW_KEY when the now-playing slot is centered. */
  onCenterChange?: (dateKey: string) => void;
  /** True while an album is playing — adds the now slot and pushes the bars
   *  left. The now-playing display itself is the parent's NowPlayingHero. */
  playing?: boolean;
}

// Fixed per-day geometry so the chart scrolls; today starts centered under the
// fixed center line, and the bar under that line drives the tooltip.
const SLOT = 32;
const BAR_W = 28;
// How far the bar strip is pushed left (fraction of viewport width) while an
// album is playing, so the centered banner dominates. Scrubbing pulls the bars
// back into view.
const NOW_GAP_FRAC = 0.32;
// Tallest bar as a % of the chart height, so bars scale as the header grows or
// shrinks. Empty days fall back to .bar's min-height for a tiny stub.
const MAX_BAR_PCT = 44;
// Days with no listens still get a short gray stub so the timeline reads as
// continuous.
const EMPTY_COLOR = "var(--bar-empty)";
// Bars are colored in tiers by distance from the selected (centered) day, each
// tier a CSS variable (see .chart) so the palette is easy to tweak. CSS
// transitions animate a bar as it crosses between tiers.
const NEAR_RANGE = 10; // the 10 bars either side of the selected one
const MID_RANGE = 20; // the next 10 either side
function barColor(dist: number): string {
  if (dist === 0) return "var(--bar-selected)";
  if (dist <= NEAR_RANGE) return "var(--bar-near)";
  if (dist <= MID_RANGE) return "var(--bar-mid)";
  return "var(--bar-far)";
}

const pad = (n: number) => String(n).padStart(2, "0");
const keyOf = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// Relative day label: Today / Yesterday / full date.
const relativeDate = (d: Date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((today.getTime() - d.getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

interface DayDatum {
  key: string;
  date: Date;
  seconds: number;
  albums: number;
  listens: number;
  monthStart: boolean;
  isNow?: boolean;
}

const barPct = (seconds: number, max: number) =>
  seconds > 0 && max > 0 ? (seconds / max) * MAX_BAR_PCT : 0;

export const DailyListensChart = forwardRef<ChartHandle, Props>(
  function DailyListensChart({ byDay, onCenterChange, playing = false }, ref) {
    const days = useMemo<DayDatum[]>(() => {
      const keys = [...byDay.keys()].sort();
      if (!keys.length) return [];
      // Start at the first of the earliest listen's month so that month's
      // leading empty days (and its month line) are shown.
      const first = new Date(`${keys[0]}T00:00:00`);
      const start = new Date(first.getFullYear(), first.getMonth(), 1);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const out: DayDatum[] = [];
      for (let d = new Date(start); d <= today; d.setDate(d.getDate() + 1)) {
        const stat = byDay.get(keyOf(d));
        out.push({
          key: keyOf(d),
          date: new Date(d),
          seconds: stat?.seconds ?? 0,
          albums: stat?.albumCount ?? 0,
          listens: stat?.listenCount ?? 0,
          monthStart: d.getDate() === 1,
        });
      }
      // "Now" slot at the right end — only while an album is actually playing,
      // so the banner takes center stage with the bars pushed left. Past
      // listens show the standard chart (no now slot).
      if (playing) {
        out.push({
          key: NOW_KEY,
          date: new Date(today),
          seconds: 0,
          albums: 0,
          listens: 0,
          monthStart: false,
          isNow: true,
        });
      }
      return out;
    }, [byDay, playing]);

    const max = useMemo(
      () => days.reduce((m, d) => Math.max(m, d.seconds), 0),
      [days]
    );

    const chartRef = useRef<HTMLDivElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const firstColRef = useRef<HTMLDivElement>(null);
    const rafRef = useRef<number | null>(null);
    const animRef = useRef<number | null>(null);
    const axisScrollRef = useRef<HTMLDivElement>(null);
    const dragRef = useRef<{ x: number; left: number } | null>(null);
    const barsSyncing = useRef(false);
    const axisSyncing = useRef(false);
    // Set while the scroll position is being driven by code (mount-center or the
    // diary list) so onScroll doesn't echo a center-change back out.
    const programmatic = useRef(false);
    const [active, setActive] = useState(0);

    // Index of the day whose column is under the fixed center line. Emits the
    // centered key only when `emit` (a genuine user scrub).
    const computeActive = (emit: boolean) => {
      const chart = chartRef.current;
      const first = firstColRef.current;
      if (!chart || !first || !days.length) return;
      const cr = chart.getBoundingClientRect();
      const centerX = cr.left + cr.width / 2;
      const firstCenter =
        first.getBoundingClientRect().left + first.offsetWidth / 2;
      const idx = Math.round((centerX - firstCenter) / SLOT);
      const clamped = Math.max(0, Math.min(idx, days.length - 1));
      setActive((prev) => (prev === clamped ? prev : clamped));
      if (emit) onCenterChange?.(days[clamped].key);
    };

    // Smoothly animate the chart to a target scrollLeft (snap off during the
    // tween). No emit — used by the diary list to keep the chart in sync.
    const animateScroll = (target: number) => {
      const sc = scrollRef.current;
      if (!sc) return;
      if (animRef.current != null) cancelAnimationFrame(animRef.current);
      const start = sc.scrollLeft;
      const dist = target - start;
      if (Math.abs(dist) < 1) return;
      programmatic.current = true;
      sc.style.scrollSnapType = "none";
      const t0 = performance.now();
      const step = (now: number) => {
        const p = Math.min(1, (now - t0) / 240);
        sc.scrollLeft = start + dist * (1 - Math.pow(1 - p, 3));
        if (p < 1) animRef.current = requestAnimationFrame(step);
        else {
          animRef.current = null;
          sc.style.scrollSnapType = "";
          programmatic.current = false;
        }
      };
      animRef.current = requestAnimationFrame(step);
    };

    // Center a given column, easing into place (no emit). Used by the diary list.
    const centerColumn = (idx: number) => {
      const sc = scrollRef.current;
      const chart = chartRef.current;
      const first = firstColRef.current;
      if (!sc || !chart || !first) return;
      const rect = chart.getBoundingClientRect();
      const chartCenter = rect.left + rect.width / 2;
      const firstCenter =
        first.getBoundingClientRect().left + first.offsetWidth / 2;
      const gap = days[idx]?.isNow ? window.innerWidth * NOW_GAP_FRAC : 0;
      animateScroll(
        sc.scrollLeft + (firstCenter + idx * SLOT + gap - chartCenter)
      );
    };

    useImperativeHandle(
      ref,
      () => ({
        centerKey(dateKey: string) {
          const idx = days.findIndex((d) => d.key === dateKey);
          if (idx >= 0) centerColumn(idx);
        },
      }),
      [days]
    );

    // Ease the clicked day to the center line (snap off during the tween so it
    // doesn't fight each frame), emitting as it goes so the diary follows.
    const centerIndex = (i: number) => {
      const sc = scrollRef.current;
      const chart = chartRef.current;
      const first = firstColRef.current;
      if (!sc || !chart || !first) return;
      const rect = chart.getBoundingClientRect();
      const chartCenter = rect.left + rect.width / 2;
      const firstCenter =
        first.getBoundingClientRect().left + first.offsetWidth / 2;
      const start = sc.scrollLeft;
      const gap = days[i]?.isNow ? window.innerWidth * NOW_GAP_FRAC : 0;
      const dist = firstCenter + i * SLOT + gap - chartCenter;
      if (Math.abs(dist) < 1) return;
      sc.style.scrollSnapType = "none";
      const t0 = performance.now();
      const step = (now: number) => {
        const p = Math.min(1, (now - t0) / 420);
        sc.scrollLeft = start + dist * (1 - Math.pow(1 - p, 3));
        if (p < 1) requestAnimationFrame(step);
        else {
          sc.style.scrollSnapType = "";
          computeActive(true);
        }
      };
      requestAnimationFrame(step);
    };

    // Center the most recent listened day on mount (silently — no emit).
    useLayoutEffect(() => {
      const sc = scrollRef.current;
      const chart = chartRef.current;
      const first = firstColRef.current;
      if (!sc || !chart || !first || !days.length) return;
      const rect = chart.getBoundingClientRect();
      const chartCenter = rect.left + rect.width / 2;
      const firstCenter =
        first.getBoundingClientRect().left + first.offsetWidth / 2;
      // When playing, open on the now slot (right end, bars pushed left) so the
      // banner leads. Otherwise open on the most recent listened day.
      let startIdx = days.length - 1;
      if (!playing) {
        for (let i = days.length - 1; i >= 0; i--) {
          if (days[i].seconds > 0) {
            startIdx = i;
            break;
          }
        }
      }
      const gap = days[startIdx]?.isNow ? window.innerWidth * NOW_GAP_FRAC : 0;
      programmatic.current = true;
      sc.scrollLeft += firstCenter + startIdx * SLOT + gap - chartCenter;
      setActive(startIdx);
      window.setTimeout(() => {
        programmatic.current = false;
      }, 80);
    }, [days.length]);

    const onScroll = () => {
      const sc = scrollRef.current;
      const prog = programmatic.current;
      // Mirror to the axis, unless this scroll is the axis syncing into the bars.
      if (barsSyncing.current) {
        barsSyncing.current = false;
      } else if (
        sc &&
        axisScrollRef.current &&
        axisScrollRef.current.scrollLeft !== sc.scrollLeft
      ) {
        axisSyncing.current = true;
        axisScrollRef.current.scrollLeft = sc.scrollLeft;
      }
      if (rafRef.current != null) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        computeActive(!prog);
      });
    };

    // Dragging/scrubbing the axis drives the bars (which drive the list).
    const onAxisScroll = () => {
      const sc = scrollRef.current;
      const ax = axisScrollRef.current;
      // Ignore the scroll we caused by mirroring the bars into the axis.
      if (axisSyncing.current) {
        axisSyncing.current = false;
        return;
      }
      if (sc && ax && sc.scrollLeft !== ax.scrollLeft) {
        barsSyncing.current = true;
        sc.scrollLeft = ax.scrollLeft;
      }
    };
    const onAxisPointerDown = (e: ReactPointerEvent) => {
      if (e.pointerType !== "mouse") return; // touch uses native scroll
      const ax = axisScrollRef.current;
      if (!ax) return;
      dragRef.current = { x: e.clientX, left: ax.scrollLeft };
      ax.setPointerCapture(e.pointerId);
    };
    const onAxisPointerMove = (e: ReactPointerEvent) => {
      const ax = axisScrollRef.current;
      if (!ax || !dragRef.current) return;
      ax.scrollLeft = dragRef.current.left - (e.clientX - dragRef.current.x);
    };
    const onAxisPointerUp = (e: ReactPointerEvent) => {
      dragRef.current = null;
      axisScrollRef.current?.releasePointerCapture?.(e.pointerId);
    };

    if (!days.length) return null;

    const activeDay = days[active];
    const activeLabel = relativeDate(activeDay.date);
    const activeStats =
      activeDay.albums > 0
        ? `${formatRuntimeCompact(activeDay.seconds)} · ${activeDay.albums} ${
            activeDay.albums === 1 ? "album" : "albums"
          }`
        : "No listens";

    return (
      <div className={styles.chartWrap}>
        <div className={styles.chart} ref={chartRef}>
          <div className={styles.scroll} ref={scrollRef} onScroll={onScroll}>
            <div className={styles.track}>
              {days.map((day, i) => (
                <div
                  key={day.key}
                  ref={i === 0 ? firstColRef : undefined}
                  className={styles.col}
                  style={
                    day.isNow
                      ? { width: SLOT, marginLeft: `${NOW_GAP_FRAC * 100}vw` }
                      : { width: SLOT }
                  }
                  onClick={() => centerIndex(i)}
                >
                  {day.isNow ? (
                    <span
                      className={`${styles.nowNode}${
                        playing ? ` ${styles.nowNodePlaying}` : ""
                      }`}
                      aria-hidden
                    />
                  ) : (
                    <div
                      className={styles.bar}
                      style={{
                        width: BAR_W,
                        height: `${barPct(day.seconds, max)}%`,
                        background:
                          day.seconds > 0
                            ? barColor(Math.abs(i - active))
                            : EMPTY_COLOR,
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
          {/* The now slot's display is the parent's NowPlayingHero overlay;
              here we only show the scrubbed day's metric. */}
          {activeDay.isNow ? null : (
            <div className={styles.metric}>
              <span className={styles.metricDate}>{activeLabel}</span>
              <span className={styles.metricStats}>{activeStats}</span>
            </div>
          )}
          {/* Center line connects the metric down to the bar under it. */}
          <span className={styles.centerLine} />
        </div>
        {/* Hash-mark x-axis: dashes aligned under the bars; drag or swipe to
            scrub. Edge-faded, light-gray bordered panel — editable later. */}
        <div className={styles.axis}>
          <div
            className={styles.axisScroll}
            ref={axisScrollRef}
            onScroll={onAxisScroll}
            onPointerDown={onAxisPointerDown}
            onPointerMove={onAxisPointerMove}
            onPointerUp={onAxisPointerUp}
            onPointerCancel={onAxisPointerUp}
          >
            <div className={styles.axisTrack}>
              {days.map((day, i) => (
                <div
                  key={day.key}
                  className={styles.tickCol}
                  style={
                    day.isNow
                      ? { width: SLOT, marginLeft: `${NOW_GAP_FRAC * 100}vw` }
                      : { width: SLOT }
                  }
                  onClick={() => centerIndex(i)}
                >
                  {day.isNow ? (
                    <span
                      className={`${styles.nowTick}${
                        playing ? ` ${styles.nowTickPlaying}` : ""
                      }`}
                      aria-hidden
                    />
                  ) : day.monthStart ? (
                    <span className={styles.monthLetter}>
                      {day.date.toLocaleDateString("en-US", { month: "short" })}
                    </span>
                  ) : (
                    <span
                      className={`${styles.tick}${
                        i === active ? ` ${styles.tickActive}` : ""
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
          <span className={styles.axisCenter} />
        </div>
      </div>
    );
  }
);

import { useMemo, useRef, useState, useLayoutEffect } from "react";
import type { DayStats } from "../../hooks/useActivity";
import { formatRuntimeCompact } from "../../utils/formatDuration";
import styles from "./DailyListensChart.module.css";

interface Props {
  byDay: Map<string, DayStats>;
}

// Fixed per-day geometry so the chart scrolls; today starts centered under the
// fixed center line, and the bar under that line drives the tooltip.
const SLOT = 13;
const BAR_W = 9;
const CHART_H = 190;
const MAX_BAR = 140;
// Days with no listens still get a short gray stub so the timeline reads as
// continuous.
const EMPTY_H = 3;
const EMPTY_COLOR = "rgba(245, 245, 245, 0.26)";

// teal #5eead4 -> blue #60a5fa across the whole timeline, left (oldest) to
// right (today) — same spectrum as the By Year chart.
const FROM = [94, 234, 212];
const TO = [96, 165, 250];
function dayColor(t: number): string {
  const c = FROM.map((v, i) => Math.round(v + (TO[i] - v) * t));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}

const pad = (n: number) => String(n).padStart(2, "0");
const keyOf = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

interface DayDatum {
  key: string;
  date: Date;
  seconds: number;
  albums: number;
  monthStart: boolean;
}

const barHeight = (seconds: number, max: number) =>
  seconds > 0 ? (max > 0 ? (seconds / max) * MAX_BAR : 0) : EMPTY_H;

export function DailyListensChart({ byDay }: Props) {
  const days = useMemo<DayDatum[]>(() => {
    const keys = [...byDay.keys()].sort();
    if (!keys.length) return [];
    // Start at the first of the earliest listen's month so that month's leading
    // empty days (and its month line) are shown.
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
        monthStart: d.getDate() === 1,
      });
    }
    return out;
  }, [byDay]);

  const max = useMemo(
    () => days.reduce((m, d) => Math.max(m, d.seconds), 0),
    [days]
  );

  const chartRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const firstColRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const [active, setActive] = useState(0);

  // Index of the day whose column is under the fixed center line.
  const computeActive = () => {
    const chart = chartRef.current;
    const first = firstColRef.current;
    if (!chart || !first || !days.length) return;
    const cr = chart.getBoundingClientRect();
    const centerX = cr.left + cr.width / 2;
    const firstCenter = first.getBoundingClientRect().left + first.offsetWidth / 2;
    const idx = Math.round((centerX - firstCenter) / SLOT);
    const clamped = Math.max(0, Math.min(idx, days.length - 1));
    setActive((prev) => (prev === clamped ? prev : clamped));
  };

  // Center today on mount and mark it active.
  useLayoutEffect(() => {
    const sc = scrollRef.current;
    const chart = chartRef.current;
    const first = firstColRef.current;
    if (!sc || !chart || !first || !days.length) return;
    const chartCenter =
      chart.getBoundingClientRect().left + chart.getBoundingClientRect().width / 2;
    const firstCenter =
      first.getBoundingClientRect().left + first.offsetWidth / 2;
    const todayCenter = firstCenter + (days.length - 1) * SLOT;
    sc.scrollLeft += todayCenter - chartCenter;
    setActive(days.length - 1);
  }, [days.length]);

  const onScroll = () => {
    if (rafRef.current != null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      computeActive();
    });
  };

  if (!days.length) return null;

  const activeDay = days[active];
  const activeTime = formatRuntimeCompact(activeDay.seconds);
  const activeMeta = `${activeDay.albums} ${
    activeDay.albums === 1 ? "album" : "albums"
  } · ${activeDay.date.getMonth() + 1}/${activeDay.date.getDate()}`;

  return (
    <div className={styles.chart} ref={chartRef} style={{ height: CHART_H }}>
      <div className={styles.scroll} ref={scrollRef} onScroll={onScroll}>
        <div className={styles.track}>
          {days.map((day, i) => {
            // Month line passes through normally but hides as it crosses center.
            const showMonth = day.monthStart && Math.abs(i - active) > 1;
            return (
              <div
                key={day.key}
                ref={i === 0 ? firstColRef : undefined}
                className={`${styles.col}${showMonth ? ` ${styles.monthStart}` : ""}`}
                style={{ width: SLOT }}
              >
                {showMonth && (
                  <span className={styles.monthLabel}>
                    {day.date.toLocaleDateString("en-US", { month: "short" })}
                  </span>
                )}
                <div
                  className={styles.bar}
                  style={{
                    width: BAR_W,
                    height: barHeight(day.seconds, max),
                    background:
                      day.seconds > 0
                        ? dayColor(days.length > 1 ? i / (days.length - 1) : 0)
                        : EMPTY_COLOR,
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
      {/* Fixed center line; the tooltip above it shows the centered day. */}
      <span className={styles.centerLine} />
      <div className={styles.tooltip}>
        <span className={styles.tooltipValue}>{activeTime}</span>
        <span className={styles.tooltipMeta}>{activeMeta}</span>
      </div>
    </div>
  );
}

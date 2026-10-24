import { useMemo, useRef, useState, useLayoutEffect } from "react";
import type { DayStats } from "../../hooks/useActivity";
import type { Measure } from "../../hooks/useListeningStats";
import { formatRuntimeCompact } from "../../utils/formatDuration";
import styles from "./DailyListensChart.module.css";

interface Props {
  byDay: Map<string, DayStats>;
  measure: Measure;
}

// Fixed per-day geometry so the chart scrolls; today starts centered and the
// user can scroll either direction. Bar + gap keep roughly the previous ratio,
// just ~25% wider bars.
const SLOT = 13;
const BAR_W = 9;
const CHART_H = 190;
const MAX_BAR = 140;
// Days with no listens still get a short gray stub so the timeline reads as
// continuous; it still shows a "0" tooltip on hover.
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

interface HoverState {
  i: number;
  left: number;
  barPx: number;
}

export function DailyListensChart({ byDay, measure }: Props) {
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
    () =>
      days.reduce(
        (m, d) => Math.max(m, measure === "time" ? d.seconds : d.albums),
        0
      ),
    [days, measure]
  );

  const chartRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const todayRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<HoverState | null>(null);

  // Start with today centered in the header.
  useLayoutEffect(() => {
    const sc = scrollRef.current;
    const t = todayRef.current;
    if (!sc || !t) return;
    sc.scrollLeft +=
      t.getBoundingClientRect().left -
      sc.getBoundingClientRect().left -
      (sc.clientWidth - t.offsetWidth) / 2;
  }, [days.length]);

  if (!days.length) return null;

  const hovered = hover ? days[hover.i] : null;
  const hoveredValue = hovered
    ? measure === "time"
      ? formatRuntimeCompact(hovered.seconds)
      : `${hovered.albums} ${hovered.albums === 1 ? "album" : "albums"}`
    : "";
  const hoveredDate = hovered
    ? `${hovered.date.getMonth() + 1}/${hovered.date.getDate()}`
    : "";

  return (
    <div className={styles.chart} ref={chartRef} style={{ height: CHART_H }}>
      <div className={styles.scroll} ref={scrollRef}>
        <div className={styles.track}>
          {days.map((day, i) => {
            const value = measure === "time" ? day.seconds : day.albums;
            const barH =
              value > 0 ? (max > 0 ? (value / max) * MAX_BAR : 0) : EMPTY_H;
            const isToday = i === days.length - 1;
            return (
              <div
                key={day.key}
                ref={isToday ? todayRef : undefined}
                className={`${styles.col}${day.monthStart ? ` ${styles.monthStart}` : ""}`}
                style={{ width: SLOT }}
                onMouseEnter={(e) => {
                  const col = e.currentTarget.getBoundingClientRect();
                  const box = chartRef.current?.getBoundingClientRect();
                  const center = box ? col.left - box.left + col.width / 2 : 0;
                  const half = 46;
                  const left = box
                    ? Math.max(half, Math.min(center, box.width - half))
                    : center;
                  setHover({ i, left, barPx: barH });
                }}
                onMouseLeave={() => setHover(null)}
              >
                {day.monthStart && (
                  <span className={styles.monthLabel}>
                    {day.date.toLocaleDateString("en-US", { month: "short" })}
                  </span>
                )}
                {isToday && (
                  <>
                    <span className={styles.todayLabel}>Today</span>
                    <span className={styles.todayLine} />
                  </>
                )}
                <div
                  className={styles.bar}
                  style={{
                    width: BAR_W,
                    height: barH,
                    background:
                      value > 0
                        ? dayColor(days.length > 1 ? i / (days.length - 1) : 0)
                        : EMPTY_COLOR,
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
      {hovered && (
        <div
          className={styles.tooltip}
          style={{ left: hover!.left, bottom: hover!.barPx + 8 }}
        >
          <span className={styles.tooltipValue}>{hoveredValue}</span>
          <span className={styles.tooltipMeta}>{hoveredDate}</span>
        </div>
      )}
    </div>
  );
}

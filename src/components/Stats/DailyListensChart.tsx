import { useMemo, useRef, useState } from "react";
import type { DayStats } from "../../hooks/useActivity";
import type { Measure } from "../../hooks/useListeningStats";
import { formatRuntimeCompact } from "../../utils/formatDuration";
import styles from "./DailyListensChart.module.css";

interface Props {
  byDay: Map<string, DayStats>;
  measure: Measure;
}

// Chart box height and the tallest a bar may grow — the gap leaves headroom at
// the top for the month labels and the hover tooltip.
const CHART_H = 190;
const MAX_BAR = 140;

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
    const start = new Date(`${keys[0]}T00:00:00`);
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
  const [hover, setHover] = useState<HoverState | null>(null);

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
      <div className={styles.track}>
        {days.map((day, i) => {
          const value = measure === "time" ? day.seconds : day.albums;
          const barPx = max > 0 ? (value / max) * MAX_BAR : 0;
          return (
            <div
              key={day.key}
              className={`${styles.col}${day.monthStart ? ` ${styles.monthStart}` : ""}`}
              onMouseEnter={(e) => {
                if (value <= 0) {
                  setHover(null);
                  return;
                }
                const col = e.currentTarget.getBoundingClientRect();
                const box = chartRef.current?.getBoundingClientRect();
                const center = box ? col.left - box.left + col.width / 2 : 0;
                // Keep the tooltip inside the chart at the left/right edges.
                const half = 46;
                const left = box
                  ? Math.max(half, Math.min(center, box.width - half))
                  : center;
                setHover({ i, left, barPx });
              }}
              onMouseLeave={() => setHover(null)}
            >
              {day.monthStart && (
                <span className={styles.monthLabel}>
                  {day.date.toLocaleDateString("en-US", { month: "short" })}
                </span>
              )}
              {value > 0 && (
                <div
                  className={styles.bar}
                  style={{
                    height: barPx,
                    background: dayColor(
                      days.length > 1 ? i / (days.length - 1) : 0
                    ),
                  }}
                />
              )}
            </div>
          );
        })}
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

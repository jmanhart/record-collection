import { useMemo, useRef, useState, useLayoutEffect } from "react";
import type { DayStats } from "../../hooks/useActivity";
import type { Measure } from "../../hooks/useListeningStats";
import { formatRuntimeCompact } from "../../utils/formatDuration";
import styles from "./DailyListensChart.module.css";

interface Props {
  byDay: Map<string, DayStats>;
  measure: Measure;
}

// Width of each day's slot in px; kept thin to match the By Year chart's bars.
const DAY_SLOT = 8;

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
      const key = keyOf(d);
      const stat = byDay.get(key);
      out.push({
        key,
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

  const scrollRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<HoverState | null>(null);

  // Pin the initial scroll to the right so today is in view.
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, [days.length]);

  if (!days.length) return null;

  const hovered = hover ? days[hover.i] : null;
  const hoveredValue = hovered
    ? measure === "time"
      ? formatRuntimeCompact(hovered.seconds)
      : `${hovered.albums} ${hovered.albums === 1 ? "album" : "albums"}`
    : "";

  return (
    <div className={styles.chart} ref={chartRef}>
      {hovered && (
        <div
          className={styles.tooltip}
          style={{ left: hover!.left }}
          aria-hidden
        >
          <span className={styles.tooltipValue}>{hoveredValue}</span>
          <span className={styles.tooltipMeta}>
            {hovered.date.toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
      )}
      <div className={styles.scroll} ref={scrollRef}>
        <div className={styles.track} style={{ width: days.length * DAY_SLOT }}>
          {days.map((day, i) => {
            const value = measure === "time" ? day.seconds : day.albums;
            const h = max > 0 ? (value / max) * 100 : 0;
            return (
              <div
                key={day.key}
                className={`${styles.col}${day.monthStart ? ` ${styles.monthStart}` : ""}`}
                style={{ width: DAY_SLOT }}
                onMouseEnter={(e) => {
                  const col = e.currentTarget.getBoundingClientRect();
                  const box = chartRef.current?.getBoundingClientRect();
                  setHover({
                    i,
                    left: box ? col.left - box.left + col.width / 2 : 0,
                  });
                }}
                onMouseLeave={() => setHover(null)}
              >
                {value > 0 && (
                  <div
                    className={styles.bar}
                    style={{
                      height: `${h}%`,
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
      </div>
    </div>
  );
}

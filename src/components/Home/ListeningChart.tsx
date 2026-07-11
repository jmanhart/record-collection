import { useMemo, useState } from "react";
import { Bar, BarChart, LabelList, ResponsiveContainer, XAxis } from "recharts";
import type { ActivityEvent } from "../../hooks/useActivity";
import { formatRuntimeCompact } from "../../utils/formatDuration";
import styles from "./ListeningChart.module.css";

type Range = "week" | "month" | "year";
type Measure = "time" | "albums";

interface ChartBucket {
  label: string;
  albums: number;
  minutes: number;
}

interface Span {
  label: string;
  startKey: string;
  endKey: string;
}

interface ListeningChartProps {
  events: ActivityEvent[];
  todayKey: string;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function keyOf(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// Noon keeps day arithmetic safe across DST transitions
function parseKey(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day, 12);
}

function monthShort(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short" });
}

// Current Sun–Sat week as 7 one-day spans
function weekSpans(todayKey: string): Span[] {
  const today = parseKey(todayKey);
  const sunday = new Date(today);
  sunday.setDate(today.getDate() - today.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(sunday);
    day.setDate(sunday.getDate() + i);
    const key = keyOf(day);
    return {
      label: `${day.toLocaleDateString("en-US", { weekday: "short" })} ${day.getDate()}`,
      startKey: key,
      endKey: key,
    };
  });
}

// Full Sun–Sat weeks overlapping the current month; edge weeks may
// spill into the neighboring months
function monthSpans(todayKey: string): Span[] {
  const today = parseKey(todayKey);
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 12);
  const cursor = new Date(today.getFullYear(), today.getMonth(), 1, 12);
  cursor.setDate(cursor.getDate() - cursor.getDay());

  const spans: Span[] = [];
  while (cursor <= monthEnd) {
    const weekEnd = new Date(cursor);
    weekEnd.setDate(cursor.getDate() + 6);
    const label =
      cursor.getMonth() === weekEnd.getMonth()
        ? `${monthShort(cursor)} ${cursor.getDate()}–${weekEnd.getDate()}`
        : `${monthShort(cursor)} ${cursor.getDate()}–${monthShort(weekEnd)} ${weekEnd.getDate()}`;
    spans.push({ label, startKey: keyOf(cursor), endKey: keyOf(weekEnd) });
    cursor.setDate(cursor.getDate() + 7);
  }
  return spans;
}

// Jan–Dec of the current year
function yearSpans(todayKey: string): Span[] {
  const year = Number(todayKey.slice(0, 4));
  return Array.from({ length: 12 }, (_, month) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return {
      label: monthShort(new Date(year, month, 1, 12)),
      startKey: `${year}-${pad(month + 1)}-01`,
      endKey: `${year}-${pad(month + 1)}-${pad(daysInMonth)}`,
    };
  });
}

const SPAN_BUILDERS: Record<Range, (todayKey: string) => Span[]> = {
  week: weekSpans,
  month: monthSpans,
  year: yearSpans,
};

function toBuckets(spans: Span[], events: ActivityEvent[]): ChartBucket[] {
  return spans.map(({ label, startKey, endKey }) => {
    const listens = events.filter(
      (e) => e.type === "listen" && e.dateKey >= startKey && e.dateKey <= endKey
    );
    const albums = new Set(listens.map((e) => e.releaseId)).size;
    const seconds = listens.reduce(
      (sum, e) => sum + (e.record?.duration_seconds || 0),
      0
    );
    return { label, albums, minutes: Math.round(seconds / 60) };
  });
}

const RANGE_OPTIONS: { value: Range; label: string }[] = [
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "year", label: "Year" },
];

export function ListeningChart({ events, todayKey }: ListeningChartProps) {
  const [range, setRange] = useState<Range>("month");
  const [measure, setMeasure] = useState<Measure>("time");

  const buckets = useMemo(
    () => toBuckets(SPAN_BUILDERS[range](todayKey), events),
    [range, todayKey, events]
  );

  const isEmpty = buckets.every((b) => b.albums === 0 && b.minutes === 0);

  const formatLabel = (value: unknown): string => {
    const n = Number(value);
    if (!n) return "";
    return measure === "time" ? formatRuntimeCompact(n * 60) : String(n);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.toggle} role="group" aria-label="Chart range">
          {RANGE_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              className={`${styles.toggleButton} ${range === value ? styles.toggleActive : ""}`}
              onClick={() => setRange(value)}
              aria-pressed={range === value}
            >
              {label}
            </button>
          ))}
        </div>
        <div className={styles.toggle} role="group" aria-label="Chart measure">
          <button
            className={`${styles.toggleButton} ${measure === "time" ? styles.toggleActive : ""}`}
            onClick={() => setMeasure("time")}
            aria-pressed={measure === "time"}
          >
            Time
          </button>
          <button
            className={`${styles.toggleButton} ${measure === "albums" ? styles.toggleActive : ""}`}
            onClick={() => setMeasure("albums")}
            aria-pressed={measure === "albums"}
          >
            Albums
          </button>
        </div>
      </div>

      {isEmpty ? (
        <p className={styles.empty}>No listens this {range}.</p>
      ) : (
        <div className={styles.chart}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={buckets}
              margin={{ top: 24, right: 8, bottom: 0, left: 8 }}
            >
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                interval={0}
              />
              <Bar
                dataKey={measure === "time" ? "minutes" : "albums"}
                radius={[4, 4, 0, 0]}
                maxBarSize={48}
                isAnimationActive={false}
              >
                <LabelList
                  dataKey={measure === "time" ? "minutes" : "albums"}
                  position="top"
                  formatter={formatLabel}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

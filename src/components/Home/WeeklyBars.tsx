import { useState } from "react";
import { Bar, BarChart, LabelList, ResponsiveContainer, XAxis } from "recharts";
import { formatRuntimeCompact } from "../../utils/formatDuration";
import styles from "./WeeklyBars.module.css";

export interface WeekBucket {
  label: string;
  albums: number;
  minutes: number;
}

interface WeeklyBarsProps {
  buckets: WeekBucket[];
}

type Measure = "time" | "albums";

export function WeeklyBars({ buckets }: WeeklyBarsProps) {
  const [measure, setMeasure] = useState<Measure>("time");

  const isEmpty = buckets.every((b) => b.albums === 0 && b.minutes === 0);

  const formatLabel = (value: unknown): string => {
    const n = Number(value);
    if (!n) return "";
    return measure === "time" ? formatRuntimeCompact(n * 60) : String(n);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.title}>Listening by week</span>
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
        <p className={styles.empty}>No listens this month.</p>
      ) : (
        <div className={styles.chart}>
          <ResponsiveContainer width="100%" height={200}>
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

import { useState } from "react";
import { Bar, BarChart, LabelList, ResponsiveContainer, XAxis } from "recharts";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ActivityEvent } from "../../hooks/useActivity";
import { StatCard, StatCardRow } from "../StatCard/StatCard";
import { formatRuntimeCompact } from "../../utils/formatDuration";
import {
  useListeningStats,
  RANGE_OPTIONS,
  type Range,
  type Measure,
} from "../../hooks/useListeningStats";
import styles from "./ListeningChart.module.css";

interface ListeningChartProps {
  events: ActivityEvent[];
  todayKey: string;
}
export function ListeningChart({ events, todayKey }: ListeningChartProps) {
  const [range, setRange] = useState<Range>("month");
  const [measure, setMeasure] = useState<Measure>("time");
  // 0 = current period; each increment walks one whole period into the past.
  const [offset, setOffset] = useState(0);

  const stats = useListeningStats(range, offset, events, todayKey);
  const { buckets, periodTitle, isEmpty } = stats;

  const formatLabel = (value: unknown): string => {
    const n = Number(value);
    if (!n) return "";
    return measure === "time" ? formatRuntimeCompact(n * 60) : String(n);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerGroup}>
          <div className={styles.toggle} role="group" aria-label="Chart range">
            {RANGE_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                className={`${styles.toggleButton} ${range === value ? styles.toggleActive : ""}`}
                onClick={() => {
                  setRange(value);
                  setOffset(0);
                }}
                aria-pressed={range === value}
              >
                {label}
              </button>
            ))}
          </div>
          <div className={styles.periodNav}>
            <button
              className={styles.navButton}
              onClick={() => setOffset((o) => o + 1)}
              aria-label={`Previous ${range}`}
            >
              <ChevronLeft size={16} aria-hidden />
            </button>
            <span className={styles.periodLabel}>{periodTitle}</span>
            <button
              className={styles.navButton}
              onClick={() => setOffset((o) => Math.max(0, o - 1))}
              disabled={offset === 0}
              aria-label={`Next ${range}`}
            >
              <ChevronRight size={16} aria-hidden />
            </button>
          </div>
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

      <div className={styles.stats}>
        <StatCardRow>
          <StatCard
            size="sm"
            label="Listens"
            value={stats.listens}
            sub={`${stats.albums} different albums`}
          />
          <StatCard
            size="sm"
            label="Time listened"
            value={formatRuntimeCompact(stats.seconds)}
            sub={offset === 0 ? `this ${range}` : periodTitle}
          />
          <StatCard
            size="sm"
            label={`Last ${range}`}
            value={formatRuntimeCompact(stats.prevSeconds)}
            sub="time listened"
          />
        </StatCardRow>
      </div>

      {isEmpty ? (
        <p className={styles.empty}>No listens in {periodTitle}.</p>
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
              {/* Keyed on the current selection so switching range or measure
                  remounts the series and replays the grow-in, rather than
                  snapping to the new values. Animation is left at its 'auto'
                  default, which sits out when prefers-reduced-motion is set. */}
              <Bar
                key={`${range}-${measure}-${offset}`}
                dataKey={measure === "time" ? "minutes" : "albums"}
                radius={[4, 4, 0, 0]}
                maxBarSize={48}
                animationDuration={450}
                animationEasing="ease-out"
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

      {stats.topArtists.length > 0 && (
        <div className={styles.topArtists}>
          <span className={styles.topArtistsLabel}>
            {offset === 0 ? `Top artists this ${range}` : `Top artists · ${periodTitle}`}
          </span>
          <div className={styles.topArtistsList}>
            {stats.topArtists.map(({ artist, count }, index) => (
              <div key={artist} className={styles.topArtistRow}>
                <span className={styles.topArtistRank}>{index + 1}</span>
                <span className={styles.topArtistName}>{artist}</span>
                <span className={styles.topArtistCount}>
                  {count} {count === 1 ? "listen" : "listens"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

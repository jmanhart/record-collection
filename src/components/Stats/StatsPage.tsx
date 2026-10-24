import { useState, useEffect, useRef, useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useActivity, toDateKey } from "../../hooks/useActivity";
import { useRecords } from "../../hooks/useRecords";
import {
  useListeningStats,
  RANGE_OPTIONS,
  type Range,
  type Measure,
} from "../../hooks/useListeningStats";
import { ViewNav } from "../ViewNav/ViewNav";
import { StatsHeroBackground } from "./StatsHeroBackground";
import { formatRuntimeCompact } from "../../utils/formatDuration";
import styles from "./StatsPage.module.css";

// Published to :root while this page is mounted so the fixed ViewNav tints
// light-on-dark over the gradient hero — same mechanism the timeline hero uses.
const HERO_VARS: Record<string, string> = {
  "--hero-text": "#f5f5f5",
  "--hero-line": "rgba(245, 245, 245, 0.34)",
  "--hero-fill": "rgba(245, 245, 245, 0.16)",
};

// Bar fills: solid for real values, a muted stub for past periods with no
// listens so the chart doesn't read as sparse. Future periods get no stub.
// While a bar is hovered, the others recede to BAR_DIM so it reads as focus.
const BAR_FILL = "rgba(255, 255, 255, 0.88)";
const BAR_DIM = "rgba(255, 255, 255, 0.32)";
const BAR_EMPTY_FILL = "rgba(245, 245, 245, 0.16)";

export default function StatsPage() {
  const { events, isLoading } = useActivity();
  const todayKey = toDateKey(new Date().toISOString());

  const [range, setRange] = useState<Range>("month");
  const [measure, setMeasure] = useState<Measure>("time");
  // 0 = current period; each increment walks one whole period into the past.
  const [offset, setOffset] = useState(0);
  // Index of the bar under the cursor; drives the pinned hover label.
  const [hovered, setHovered] = useState<number | null>(null);
  // Bar grow-in runs only right after a selection change, never on the hover
  // re-renders — otherwise recharts replays the animation on every hover.
  const [animateBars, setAnimateBars] = useState(true);
  const chartRef = useRef<HTMLDivElement>(null);
  // Pixel position (relative to the chart box) of the hovered bar's value label.
  const [labelPos, setLabelPos] = useState<{
    left: number;
    top: number;
    text: string;
  } | null>(null);

  const stats = useListeningStats(range, offset, events, todayKey);
  const { buckets, periodTitle, isEmpty, topAlbums } = stats;
  const metricKey = measure === "time" ? "minutes" : "albums";
  // Top time-spans of the frame (days in a week, weeks in a month, months in a
  // year) ranked by listening time — sits under the "time this period" card.
  const periodUnit =
    range === "week" ? "days" : range === "month" ? "weeks" : "months";
  const topPeriods = buckets
    .filter((bucket) => bucket.minutes > 0)
    .sort((a, b) => b.minutes - a.minutes);

  // Records acquired within the viewed frame — "new this period".
  const { records } = useRecords();
  const newRecords = useMemo(
    () =>
      records
        .filter((r) => {
          if (!r.acquired_at) return false;
          const key = toDateKey(r.acquired_at);
          return key >= stats.startKey && key <= stats.endKey;
        })
        .sort((a, b) =>
          (b.acquired_at ?? "").localeCompare(a.acquired_at ?? "")
        ),
    [records, stats.startKey, stats.endKey]
  );

  // Mosaic background: the period's albums (cover + dominant color), falling
  // back to a slice of the whole collection when nothing was listened to.
  const heroAlbums = useMemo(() => {
    const fromPeriod = topAlbums
      .filter((album) => album.coverImage || album.color)
      .map((album) => ({
        color: album.color ?? undefined,
        cover: album.coverImage,
      }));
    if (fromPeriod.length) return fromPeriod;
    return records
      .filter((r) => r.dominant_color || r.supabase_image_url || r.coverImage)
      .slice(0, 48)
      .map((r) => ({
        color: r.dominant_color ?? undefined,
        cover: r.supabase_image_url || r.coverImage,
      }));
  }, [topAlbums, records]);
  const heroSeed = useMemo(
    () =>
      stats.anchor
        .split("")
        .reduce((sum, ch) => sum + ch.charCodeAt(0), 0),
    [stats.anchor]
  );

  useEffect(() => {
    const root = document.documentElement;
    for (const [k, v] of Object.entries(HERO_VARS)) root.style.setProperty(k, v);
    document.body.classList.add("nav-over-hero");
    return () => {
      for (const k of Object.keys(HERO_VARS)) root.style.removeProperty(k);
      document.body.classList.remove("nav-over-hero");
    };
  }, []);

  // Re-arm the grow-in when the viewed series changes, then disable it so
  // hover-driven re-renders don't replay the animation.
  useEffect(() => {
    setAnimateBars(true);
    const timer = window.setTimeout(() => setAnimateBars(false), 650);
    return () => window.clearTimeout(timer);
  }, [range, measure, offset]);

  // Pin the value label above the hovered bar by reading the bar's rendered
  // geometry — recharts stops invoking LabelList content once the grow-in ends,
  // so the label lives outside the chart as an HTML overlay.
  useEffect(() => {
    const container = chartRef.current;
    const index = hovered;
    const bucket = index == null ? undefined : buckets[index];
    const value = bucket ? bucket[metricKey] : 0;
    if (!container || index == null || !bucket || value <= 0) {
      setLabelPos(null);
      return;
    }
    const bars = container.querySelectorAll(".recharts-bar .recharts-rectangle");
    const barEl = bars[index];
    if (!barEl) {
      setLabelPos(null);
      return;
    }
    const barRect = barEl.getBoundingClientRect();
    const boxRect = container.getBoundingClientRect();
    setLabelPos({
      left: barRect.left - boxRect.left + barRect.width / 2,
      top: barRect.top - boxRect.top,
      text:
        measure === "time" ? formatRuntimeCompact(value * 60) : String(value),
    });
  }, [hovered, buckets, metricKey, measure]);

  return (
    <div className={styles.page}>
      <ViewNav />

      <section className={styles.hero} data-stats-hero>
        <StatsHeroBackground albums={heroAlbums} seed={heroSeed} />
        <div className={styles.controls}>
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
        {isLoading ? (
          <p className={styles.status}>Loading…</p>
        ) : isEmpty ? (
          <p className={styles.status}>No listens in {periodTitle}.</p>
        ) : (
          <div className={styles.chart} ref={chartRef}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={buckets}
                margin={{ top: 28, right: 0, bottom: 0, left: 0 }}
                onMouseMove={(state) => {
                  const raw = state?.activeTooltipIndex;
                  const idx = raw == null ? null : Number(raw);
                  const next =
                    state?.isTooltipActive && idx !== null && !Number.isNaN(idx)
                      ? idx
                      : null;
                  setHovered((prev) => (prev === next ? prev : next));
                }}
                onMouseLeave={() => setHovered(null)}
              >
                <CartesianGrid
                  vertical={false}
                  stroke="rgba(245, 245, 245, 0.1)"
                  strokeDasharray="2 5"
                />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={{ stroke: "rgba(245, 245, 245, 0.28)" }}
                  interval={0}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={46}
                  allowDecimals={false}
                  tickFormatter={(value) => {
                    if (measure !== "time") return String(value);
                    const mins = Number(value);
                    return mins < 60 ? `${mins}m` : `${Math.round(mins / 60)}h`;
                  }}
                />
                {/* Invisible: present only so the chart tracks the active bar
                    index via onMouseMove. The value is drawn as an HTML overlay
                    pinned above the bar; the cursor is the lone column tint. */}
                <Tooltip
                  cursor={{ fill: "rgba(245, 245, 245, 0.06)" }}
                  content={() => null}
                />
                {/* Keyed on the selection so switching range/measure remounts
                    the series and replays the grow-in. */}
                <Bar
                  key={`${range}-${measure}-${offset}`}
                  dataKey={metricKey}
                  radius={[6, 6, 0, 0]}
                  maxBarSize={56}
                  minPointSize={(value, index) =>
                    (value ?? 0) > 0 || buckets[index]?.future ? 0 : 4
                  }
                  isAnimationActive={animateBars}
                  animationDuration={500}
                  animationEasing="ease-out"
                >
                  {buckets.map((bucket, index) => {
                    const value = bucket[metricKey];
                    const dimmed = hovered !== null && hovered !== index;
                    const fill =
                      value > 0
                        ? dimmed
                          ? BAR_DIM
                          : BAR_FILL
                        : bucket.future
                          ? "transparent"
                          : BAR_EMPTY_FILL;
                    return <Cell key={index} fill={fill} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            {/* Value pinned above the hovered bar — consistent spot, shown only
                on hover, nothing on empty bars. */}
            {labelPos && (
              <div
                className={styles.hoverLabel}
                style={{ left: labelPos.left, top: labelPos.top }}
              >
                {labelPos.text}
              </div>
            )}
          </div>
        )}

      </section>

      <section className={styles.statsBand}>
        <div className={styles.statsBandInner}>
          <div className={styles.bandItem}>
            <span className={styles.bandValue}>{stats.listens}</span>
            <span className={styles.bandLabel}>
              listens · {stats.albums} albums
            </span>
          </div>
          <div className={styles.bandItem}>
            <span className={styles.bandValue}>
              {formatRuntimeCompact(stats.seconds)}
            </span>
            <span className={styles.bandLabel}>
              {offset === 0 ? `this ${range}` : periodTitle}
            </span>
          </div>
          <div className={styles.bandItem}>
            <span className={styles.bandValue}>{newRecords.length}</span>
            <span className={styles.bandLabel}>new records</span>
          </div>
        </div>
      </section>

      <section className={styles.lists}>
        <div className={styles.listCol}>
          <span className={styles.listLabel}>
            {offset === 0
              ? `Top albums this ${range}`
              : `Top albums · ${periodTitle}`}
          </span>
          <div className={styles.list}>
            {topAlbums.length === 0 ? (
              <p className={styles.listEmpty}>No albums in {periodTitle}.</p>
            ) : (
              topAlbums.map((album, index) => (
                <div key={album.releaseId} className={styles.albumRow}>
                  <span className={styles.rank}>{index + 1}</span>
                  {album.coverImage ? (
                    <img
                      src={album.coverImage}
                      alt=""
                      className={styles.cover}
                      loading="lazy"
                    />
                  ) : (
                    <span className={styles.coverPlaceholder}>
                      {album.title[0]}
                    </span>
                  )}
                  <span className={styles.albumMeta}>
                    <span className={styles.albumTitle}>{album.title}</span>
                    <span className={styles.albumArtist}>{album.artist}</span>
                  </span>
                  <span className={styles.count}>
                    {album.count} {album.count === 1 ? "listen" : "listens"}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className={styles.listCol}>
          <span className={styles.listLabel}>
            {offset === 0
              ? `Top ${periodUnit} this ${range}`
              : `Top ${periodUnit} · ${periodTitle}`}
          </span>
          <div className={styles.list}>
            {topPeriods.length === 0 ? (
              <p className={styles.listEmpty}>No listens in {periodTitle}.</p>
            ) : (
              topPeriods.map((period, index) => (
                <div key={period.label} className={styles.artistRow}>
                  <span className={styles.rank}>{index + 1}</span>
                  <span className={styles.artistName}>{period.label}</span>
                  <span className={styles.count}>
                    {formatRuntimeCompact(period.minutes * 60)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className={styles.listCol}>
          <span className={styles.listLabel}>
            {offset === 0
              ? `New records this ${range}`
              : `New records · ${periodTitle}`}
          </span>
          <div className={styles.list}>
            {newRecords.length === 0 ? (
              <p className={styles.listEmpty}>
                No records added in {periodTitle}.
              </p>
            ) : (
              newRecords.map((record) => {
                const cover = record.supabase_image_url || record.coverImage;
                return (
                  <div key={record.id} className={styles.albumRow}>
                    {cover ? (
                      <img
                        src={cover}
                        alt=""
                        className={styles.cover}
                        loading="lazy"
                      />
                    ) : (
                      <span className={styles.coverPlaceholder}>
                        {record.title[0]}
                      </span>
                    )}
                    <span className={styles.albumMeta}>
                      <span className={styles.albumTitle}>{record.title}</span>
                      <span className={styles.albumArtist}>{record.artist}</span>
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

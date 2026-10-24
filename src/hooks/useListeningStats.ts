import { useMemo } from "react";
import type { ActivityEvent } from "./useActivity";

export type Range = "week" | "month" | "year";
export type Measure = "time" | "albums";

export interface ChartBucket {
  label: string;
  albums: number;
  minutes: number;
  /** The span lies entirely after today — render no empty-state stub for it. */
  future: boolean;
}

interface Span {
  label: string;
  startKey: string;
  endKey: string;
}

export interface TopArtist {
  artist: string;
  count: number;
}

export interface TopAlbum {
  releaseId: number;
  title: string;
  artist: string;
  coverImage?: string;
  color?: string | null;
  count: number;
}

export interface ListeningStats {
  /** Anchor day (YYYY-MM-DD) of the viewed frame. */
  anchor: string;
  /** Human label for the viewed frame, e.g. "August 2026". */
  periodTitle: string;
  /** One bar per span in the frame. */
  buckets: ChartBucket[];
  listens: number;
  albums: number;
  seconds: number;
  prevSeconds: number;
  topArtists: TopArtist[];
  topAlbums: TopAlbum[];
  /** True when the frame has no listens to chart. */
  isEmpty: boolean;
  /** Calendar bounds of the viewed frame (YYYY-MM-DD, inclusive). */
  startKey: string;
  endKey: string;
}

export const RANGE_OPTIONS: { value: Range; label: string }[] = [
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "year", label: "Year" },
];

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

interface PeriodBounds {
  startKey: string;
  endKey: string;
  prevStartKey: string;
  prevEndKey: string;
}

// True calendar bounds for the stat cards and top lists. The chart's month
// view instead buckets by full Sun–Sat weeks, so its edge bars may include a
// few days from neighboring months that these stats don't count.
function periodBounds(range: Range, todayKey: string): PeriodBounds {
  const today = parseKey(todayKey);
  if (range === "week") {
    const start = new Date(today);
    start.setDate(today.getDate() - today.getDay());
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    const prevStart = new Date(start);
    prevStart.setDate(start.getDate() - 7);
    const prevEnd = new Date(start);
    prevEnd.setDate(start.getDate() - 1);
    return {
      startKey: keyOf(start),
      endKey: keyOf(end),
      prevStartKey: keyOf(prevStart),
      prevEndKey: keyOf(prevEnd),
    };
  }
  if (range === "month") {
    const year = today.getFullYear();
    const month = today.getMonth();
    return {
      startKey: keyOf(new Date(year, month, 1, 12)),
      endKey: keyOf(new Date(year, month + 1, 0, 12)),
      prevStartKey: keyOf(new Date(year, month - 1, 1, 12)),
      prevEndKey: keyOf(new Date(year, month, 0, 12)),
    };
  }
  const year = today.getFullYear();
  return {
    startKey: `${year}-01-01`,
    endKey: `${year}-12-31`,
    prevStartKey: `${year - 1}-01-01`,
    prevEndKey: `${year - 1}-12-31`,
  };
}

// Anchor date for the viewed period. offset 0 = current; each step walks one
// whole period back. Month/year rebuild from day 1 to dodge month-length
// rollover (e.g. Mar 31 → Feb).
function anchorKey(range: Range, todayKey: string, offset: number): string {
  const today = parseKey(todayKey);
  if (range === "week") {
    const d = new Date(today);
    d.setDate(today.getDate() - offset * 7);
    return keyOf(d);
  }
  if (range === "month") {
    return keyOf(new Date(today.getFullYear(), today.getMonth() - offset, 1, 12));
  }
  return keyOf(new Date(today.getFullYear() - offset, today.getMonth(), 1, 12));
}

// Human label for the viewed frame, shown between the nav arrows.
function periodLabel(range: Range, anchor: string): string {
  const d = parseKey(anchor);
  if (range === "week") {
    const start = new Date(d);
    start.setDate(d.getDate() - d.getDay());
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    const startStr = `${monthShort(start)} ${start.getDate()}`;
    const endStr =
      start.getMonth() === end.getMonth()
        ? String(end.getDate())
        : `${monthShort(end)} ${end.getDate()}`;
    return `${startStr} – ${endStr}`;
  }
  if (range === "month") {
    return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  }
  return String(d.getFullYear());
}

function toBuckets(
  spans: Span[],
  events: ActivityEvent[],
  todayKey: string
): ChartBucket[] {
  return spans.map(({ label, startKey, endKey }) => {
    const listens = events.filter(
      (e) => e.type === "listen" && e.dateKey >= startKey && e.dateKey <= endKey
    );
    const albums = new Set(listens.map((e) => e.releaseId)).size;
    const seconds = listens.reduce(
      (sum, e) => sum + (e.record?.duration_seconds || 0),
      0
    );
    return {
      label,
      albums,
      minutes: Math.round(seconds / 60),
      future: startKey > todayKey,
    };
  });
}

/**
 * Single source of truth for every listening aggregation shown on the home
 * metrics pane and the stats page: resolves the viewed frame (range + offset),
 * builds the chart buckets, and rolls up the period's totals and rankings.
 */
export function useListeningStats(
  range: Range,
  offset: number,
  events: ActivityEvent[],
  todayKey: string
): ListeningStats {
  const anchor = useMemo(
    () => anchorKey(range, todayKey, offset),
    [range, todayKey, offset]
  );
  const periodTitle = periodLabel(range, anchor);

  const buckets = useMemo(
    () => toBuckets(SPAN_BUILDERS[range](anchor), events, todayKey),
    [range, anchor, events, todayKey]
  );

  const rollup = useMemo(() => {
    const bounds = periodBounds(range, anchor);
    const inPeriod = (e: ActivityEvent, startKey: string, endKey: string) =>
      e.type === "listen" && e.dateKey >= startKey && e.dateKey <= endKey;

    const listens = events.filter((e) =>
      inPeriod(e, bounds.startKey, bounds.endKey)
    );
    const albums = new Set(listens.map((e) => e.releaseId)).size;
    const seconds = listens.reduce(
      (sum, e) => sum + (e.record?.duration_seconds || 0),
      0
    );
    const prevSeconds = events
      .filter((e) => inPeriod(e, bounds.prevStartKey, bounds.prevEndKey))
      .reduce((sum, e) => sum + (e.record?.duration_seconds || 0), 0);

    const artistCounts = new Map<string, number>();
    const albumAgg = new Map<number, TopAlbum>();
    for (const e of listens) {
      const artist = e.record?.artist;
      if (artist)
        artistCounts.set(artist, (artistCounts.get(artist) ?? 0) + 1);

      const existing = albumAgg.get(e.releaseId);
      if (existing) {
        existing.count += 1;
      } else {
        albumAgg.set(e.releaseId, {
          releaseId: e.releaseId,
          title: e.record?.title ?? `Release ${e.releaseId}`,
          artist: e.record?.artist ?? "Unknown artist",
          coverImage: e.record?.supabase_image_url || e.record?.coverImage,
          color: e.record?.dominant_color,
          count: 1,
        });
      }
    }

    const topArtists = Array.from(artistCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([artist, count]) => ({ artist, count }));

    const topAlbums = Array.from(albumAgg.values()).sort(
      (a, b) => b.count - a.count
    );

    return {
      startKey: bounds.startKey,
      endKey: bounds.endKey,
      listens: listens.length,
      albums,
      seconds,
      prevSeconds,
      topArtists,
      topAlbums,
    };
  }, [range, anchor, events]);

  const isEmpty = buckets.every((b) => b.albums === 0 && b.minutes === 0);

  return { anchor, periodTitle, buckets, ...rollup, isEmpty };
}

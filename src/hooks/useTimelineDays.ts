import { useMemo } from "react";
import { useActivity, toDateKey } from "./useActivity";
import { TIMEZONE } from "../utils/timezone";
import type { Record } from "../types/Record";

/** The timeline opens here; the first real listen lands 2026-07-04. */
export const TIMELINE_START_KEY = "2026-07-01";

export const MINUTES_PER_DAY = 1440;

/** Mirrors the inferred-playback window used elsewhere for unknown runtimes */
const FALLBACK_DURATION_SECONDS = 2700;

/** Keeps a very short album from collapsing to an unclickable sliver */
const MIN_BLOCK_MINUTES = 6;

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: TIMEZONE,
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

/** Minutes since local midnight, in the site timezone rather than UTC. */
export function toLocalMinutes(isoTimestamp: string): number {
  const parts = timeFormatter.formatToParts(new Date(isoTimestamp));
  const hour = Number(parts.find((p) => p.type === "hour")!.value);
  const minute = Number(parts.find((p) => p.type === "minute")!.value);
  // Some engines render midnight as hour 24
  return (hour % 24) * 60 + minute;
}

export interface TimelineBlock {
  id: string;
  releaseId: number;
  record?: Record;
  /** Minutes from midnight; x-position of the block's leading edge */
  startMin: number;
  /** Minutes from midnight; may be earlier than the album's runtime implies */
  endMin: number;
  /** Untrimmed album runtime, for the hover detail */
  fullRuntimeMin: number;
  /** Cut short because the next record started before this one could finish */
  truncated: boolean;
  /** Ran past midnight and was clamped to the end of the day */
  continues: boolean;
}

export interface TimelineDay {
  dateKey: string;
  blocks: TimelineBlock[];
  isToday: boolean;
  /** Sum of the blocks as drawn, so it matches what's on screen */
  playedMinutes: number;
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

/** Every calendar day from endKey back to startKey, newest first. */
function descendingDayKeys(startKey: string, endKey: string): string[] {
  const keys: string[] = [];
  const cursor = parseKey(endKey);
  const start = parseKey(startKey);
  while (cursor >= start) {
    keys.push(keyOf(cursor));
    cursor.setDate(cursor.getDate() - 1);
  }
  return keys;
}

/**
 * Buckets listens into one row per calendar day, positioned by time of day.
 *
 * A record's block runs for its own runtime, except that it stops the moment
 * the next record starts — you can't have two records on the platter at once,
 * so overlapping runtimes mean the earlier one came off early. 22 of 132
 * listens are trimmed this way; the rest draw at their full length.
 */
export function useTimelineDays(startKey: string = TIMELINE_START_KEY) {
  const { events, isLoading } = useActivity();

  const days = useMemo<TimelineDay[]>(() => {
    const todayKey = toDateKey(new Date().toISOString());

    const listensByDay = new Map<string, typeof events>();
    for (const event of events) {
      if (event.type !== "listen") continue;
      const bucket = listensByDay.get(event.dateKey);
      if (bucket) bucket.push(event);
      else listensByDay.set(event.dateKey, [event]);
    }

    return descendingDayKeys(startKey, todayKey).map((dateKey) => {
      const listens = (listensByDay.get(dateKey) ?? [])
        .slice()
        .sort(
          (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );

      const blocks: TimelineBlock[] = listens.map((listen, index) => {
        const startMin = toLocalMinutes(listen.timestamp);
        const runtimeSec =
          listen.record?.duration_seconds || FALLBACK_DURATION_SECONDS;
        const fullRuntimeMin = Math.round(runtimeSec / 60);

        const naturalEnd = startMin + fullRuntimeMin;
        const nextStart = listens[index + 1]
          ? toLocalMinutes(listens[index + 1].timestamp)
          : MINUTES_PER_DAY;

        // Whichever comes first: the album ending, the next record starting,
        // or midnight
        const cappedEnd = Math.min(naturalEnd, nextStart, MINUTES_PER_DAY);

        return {
          id: listen.id,
          releaseId: listen.releaseId,
          record: listen.record,
          startMin,
          endMin: Math.max(cappedEnd, Math.min(startMin + MIN_BLOCK_MINUTES, MINUTES_PER_DAY)),
          fullRuntimeMin,
          truncated: nextStart < naturalEnd,
          continues: naturalEnd > MINUTES_PER_DAY,
        };
      });

      return {
        dateKey,
        blocks,
        isToday: dateKey === todayKey,
        playedMinutes: blocks.reduce((sum, b) => sum + (b.endMin - b.startMin), 0),
      };
    });
  }, [events, startKey]);

  return { days, isLoading };
}

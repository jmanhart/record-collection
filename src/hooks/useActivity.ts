import { useMemo } from "react";
import { useListens } from "./useListens";
import { useRecords } from "./useRecords";
import { TIMEZONE } from "../utils/timezone";
import type { Record } from "../types/Record";

export type ActivityType = "listen" | "purchase";

export interface ActivityEvent {
  id: string;
  type: ActivityType;
  releaseId: number;
  /** Calendar day in the site timezone, YYYY-MM-DD */
  dateKey: string;
  /** Full timestamp for listens; date-only for purchases */
  timestamp: string;
  /** Explicit stop time for listens; null/undefined means full-album inferred */
  endedAt?: string | null;
  record?: Record;
}

export interface DayStats {
  listenCount: number;
  albumCount: number;
  seconds: number;
  purchaseCount: number;
}

// Purchase events are hidden for now — flip this to surface them again
// in the feed, calendar dots, and stats
const INCLUDE_PURCHASES = false;

// en-CA locale formats as YYYY-MM-DD
const dateKeyFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function toDateKey(isoTimestamp: string): string {
  return dateKeyFormatter.format(new Date(isoTimestamp));
}

/**
 * Merges listens and purchases (records with acquired_at) into one
 * chronological event stream, with per-day roll-ups. Every /home view is
 * a different aggregation of this array.
 */
export function useActivity() {
  const { listens, isLoading: isLoadingListens } = useListens();
  const { records, isLoading: isLoadingRecords } = useRecords();

  const events = useMemo(() => {
    const recordMap = new Map(records.map((r) => [r.id, r]));
    const all: ActivityEvent[] = [];

    for (const listen of listens) {
      all.push({
        id: `listen-${listen.id}`,
        type: "listen",
        releaseId: listen.release_id,
        dateKey: toDateKey(listen.listened_at),
        timestamp: listen.listened_at,
        endedAt: listen.ended_at,
        record: recordMap.get(listen.release_id),
      });
    }

    // Hand-entered acquired dates come from the admin date picker and land
    // at exactly UTC midnight; dates backfilled from Discogs' date_added
    // carry a real time-of-day. Only hand-entered dates are meaningful
    // purchase events — the Discogs backlog is import noise.
    const isHandEntered = (acquiredAt: string) =>
      /^\d{4}-\d{2}-\d{2}(T00:00:00(\.\d+)?(\+00:?00|Z))?$/.test(acquiredAt);

    for (const record of records) {
      if (!INCLUDE_PURCHASES) break;
      if (!record.acquired_at || !isHandEntered(record.acquired_at)) continue;
      all.push({
        id: `purchase-${record.id}`,
        type: "purchase",
        releaseId: record.id,
        // acquired_at is date-only (or UTC midnight); slicing avoids the
        // timezone rollback that new Date() would introduce
        dateKey: record.acquired_at.slice(0, 10),
        timestamp: record.acquired_at,
        record,
      });
    }

    all.sort((a, b) =>
      a.dateKey === b.dateKey
        ? b.timestamp.localeCompare(a.timestamp)
        : b.dateKey.localeCompare(a.dateKey)
    );
    return all;
  }, [listens, records]);

  const byDay = useMemo(() => {
    const map = new Map<string, DayStats>();
    const albumsPerDay = new Map<string, Set<number>>();

    for (const event of events) {
      let day = map.get(event.dateKey);
      if (!day) {
        day = { listenCount: 0, albumCount: 0, seconds: 0, purchaseCount: 0 };
        map.set(event.dateKey, day);
        albumsPerDay.set(event.dateKey, new Set());
      }
      if (event.type === "listen") {
        day.listenCount += 1;
        day.seconds += event.record?.duration_seconds || 0;
        albumsPerDay.get(event.dateKey)!.add(event.releaseId);
      } else {
        day.purchaseCount += 1;
      }
    }

    for (const [key, albums] of albumsPerDay) {
      map.get(key)!.albumCount = albums.size;
    }
    return map;
  }, [events]);

  return {
    events,
    byDay,
    isLoading: isLoadingListens || isLoadingRecords,
  };
}

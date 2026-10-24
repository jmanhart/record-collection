import type { Record } from "../types/Record";

type DatedRecord = Pick<Record, "original_release_date" | "year">;

/**
 * Year of the album's ORIGINAL release (parsed from `original_release_date`),
 * falling back to the owned pressing's `year` when no original date is known.
 * Used to group the collection by year/decade on the album's real era.
 */
export function releaseYear(record: DatedRecord): number | undefined {
  const iso = record.original_release_date;
  if (iso) {
    const year = parseInt(iso.slice(0, 4), 10);
    if (year > 0) return year;
  }
  return record.year;
}

export const TIMEZONE = "America/Los_Angeles";

/**
 * Formats a date-only value (e.g. "2023-10-20" or a timestamptz string
 * stored at UTC midnight) without going through a timezone-converting
 * `Date` object — `new Date(str).toLocaleDateString()` rolls the date back
 * a day for anyone west of UTC, since the stored value has no real time
 * component.
 */
export function formatDateOnly(isoDateStr: string): string {
  const [year, month, day] = isoDateStr.slice(0, 10).split("-").map(Number);
  return `${month}/${day}/${year}`;
}

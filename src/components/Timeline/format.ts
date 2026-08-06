/**
 * Shared by the day rows and the detail panel. Named for time-of-day to keep
 * them distinct from utils/formatDuration's formatClock, which renders a
 * track's length rather than a moment.
 */

/** Minutes from midnight as a clock time, e.g. 1135 -> "6:55pm". */
export function formatTimeOfDay(minutes: number): string {
  const hour = Math.floor(minutes / 60) % 24;
  const minute = Math.round(minutes % 60);
  const suffix = hour < 12 ? "am" : "pm";
  const display = hour % 12 === 0 ? 12 : hour % 12;
  return `${display}:${String(minute).padStart(2, "0")}${suffix}`;
}

/** A count of minutes as a readable span, e.g. 95 -> "1hr 35min". */
export function formatSpan(minutes: number): string {
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours}hr` : `${hours}hr ${rest}min`;
}

/** A day key (YYYY-MM-DD) as a readable date, e.g. "Wed, Aug 5". */
export function formatDayLabel(dateKey: string): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day, 12).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

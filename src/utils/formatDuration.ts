/** "76 hours 32 min" — empty string for zero/negative input */
export function formatRuntime(totalSeconds: number): string {
  if (totalSeconds <= 0) return "";
  const totalMinutes = Math.round(totalSeconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) return `${hours} hours${minutes > 0 ? ` ${minutes} min` : ""}`;
  return `${minutes} min`;
}

/** "41:45" or "1:12:05" — clock style, matching tracklist durations */
export function formatClock(totalSeconds: number): string {
  if (totalSeconds <= 0) return "";
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const mm = hours > 0 ? String(minutes).padStart(2, "0") : String(minutes);
  const ss = String(seconds).padStart(2, "0");
  return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`;
}

/** "76h 32m" — for compact display like stat tiles */
export function formatRuntimeCompact(totalSeconds: number): string {
  if (totalSeconds <= 0) return "0m";
  const totalMinutes = Math.round(totalSeconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

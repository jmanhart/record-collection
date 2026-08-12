import { MINUTES_PER_DAY, type TimelineDay } from "../../hooks/useTimelineDays";
import { formatSpan, formatTimeOfDay } from "./format";
import styles from "./DayRow.module.css";

interface DayRowProps {
  day: TimelineDay;
  /** Minutes from midnight for the live "now" marker; only on today's row */
  nowMinutes?: number;
  selectedId?: string | null;
  onSelect: (blockId: string) => void;
  closeGaps: boolean;
}

const percent = (minutes: number) => `${(minutes / MINUTES_PER_DAY) * 100}%`;

export function DayRow({ day, nowMinutes, selectedId, onSelect, closeGaps }: DayRowProps) {
  const [year, month, dayOfMonth] = day.dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, dayOfMonth, 12);
  const weekday = date.toLocaleDateString("en-US", { weekday: "short" });
  const dayLabel = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const isWeekend = date.getDay() === 0 || date.getDay() === 6;

  return (
    <div className={`${styles.row} ${day.isToday ? styles.today : ""}`}>
      <div className={`${styles.label} ${isWeekend ? styles.weekend : ""}`}>
        <span className={styles.labelDate}>{dayLabel}</span>
        <span className={styles.labelWeekday}>{weekday}</span>
      </div>

      <div className={`${styles.track} ${closeGaps ? styles.closeGaps : ""}`}>
        <span className={styles.noon} style={{ left: "50%" }} />

        {nowMinutes !== undefined && (
          <span className={styles.now} style={{ left: percent(nowMinutes) }} />
        )}

        {day.blocks.map((block) => {
          const record = block.record;
          const cover = record?.supabase_image_url || record?.coverImage;
          const shownMin = block.endMin - block.startMin;
          const layoutStart = closeGaps ? block.packedStartMin : block.startMin;

          const detail = (
            <span className={styles.tooltip} aria-hidden="true">
              <span className={styles.tooltipTitle}>
                {record?.title ?? `Release ${block.releaseId}`}
              </span>
              <span className={styles.tooltipArtist}>
                {record?.artist ?? "Unknown artist"}
              </span>
              <span className={styles.tooltipMeta}>
                {formatTimeOfDay(block.startMin)} · {formatSpan(shownMin)}
                {block.truncated && ` of ${formatSpan(block.fullRuntimeMin)}`}
              </span>
            </span>
          );

          const label = `${record?.title ?? `Release ${block.releaseId}`} by ${
            record?.artist ?? "unknown artist"
          }, ${formatTimeOfDay(block.startMin)}`;

          // The card carries the chrome rather than the block itself: a
          // container query can't style its own container, and the block is
          // the container whose width is being queried.
          const body = (
            <>
              <span
                className={`${styles.card} ${block.continues ? styles.continues : ""}`}
              >
                {cover ? (
                  <img src={cover} alt="" className={styles.blockCover} />
                ) : (
                  <span className={styles.blockFallback} />
                )}
                <span className={styles.blockText}>
                  <span className={styles.blockTitle}>
                    {record?.title ?? `Release ${block.releaseId}`}
                  </span>
                  <span className={styles.blockTime}>
                    {formatTimeOfDay(block.startMin)}
                  </span>
                </span>
              </span>
              {detail}
            </>
          );

          return (
            <button
              key={block.id}
              type="button"
              data-block-id={block.id}
              className={`${styles.block} ${
                selectedId === block.id ? styles.selected : ""
              }`}
              style={{
                left: percent(layoutStart),
                width: percent(shownMin),
              }}
              aria-label={label}
              aria-pressed={selectedId === block.id}
              onClick={() => onSelect(block.id)}
            >
              {body}
            </button>
          );
        })}
      </div>
    </div>
  );
}

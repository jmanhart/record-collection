import { ChevronLeft, ChevronRight } from "lucide-react";
import type { DayStats } from "../../hooks/useActivity";
import styles from "./MonthCalendar.module.css";

interface MonthCalendarProps {
  year: number;
  /** 0-indexed month */
  month: number;
  byDay: Map<string, DayStats>;
  todayKey: string;
  selectedDay: string | null;
  onSelectDay: (key: string | null) => void;
  onNavigate: (delta: number) => void;
}

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function MonthCalendar({
  year,
  month,
  byDay,
  todayKey,
  selectedDay,
  onSelectDay,
  onNavigate,
}: MonthCalendarProps) {
  const monthLabel = new Date(year, month, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // Noon avoids any DST edge when asking for the weekday
  const firstWeekday = new Date(year, month, 1, 12).getDay();

  const currentMonthKey = todayKey.slice(0, 7);
  const cursorMonthKey = `${year}-${pad(month + 1)}`;
  const atCurrentMonth = cursorMonthKey >= currentMonthKey;

  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className={styles.calendar}>
      <div className={styles.header}>
        <button
          className={styles.navButton}
          onClick={() => onNavigate(-1)}
          aria-label="Previous month"
        >
          <ChevronLeft size={18} />
        </button>
        <span className={styles.monthLabel}>{monthLabel}</span>
        <button
          className={styles.navButton}
          onClick={() => onNavigate(1)}
          disabled={atCurrentMonth}
          aria-label="Next month"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className={styles.grid}>
        {WEEKDAYS.map((day, i) => (
          <span key={`${day}-${i}`} className={styles.weekday}>
            {day}
          </span>
        ))}
        {cells.map((day, i) => {
          if (day === null) {
            return <span key={`blank-${i}`} />;
          }
          const key = `${year}-${pad(month + 1)}-${pad(day)}`;
          const stats = byDay.get(key);
          const hasActivity = !!stats && (stats.listenCount > 0 || stats.purchaseCount > 0);
          const isFuture = key > todayKey;
          const classes = [
            styles.day,
            hasActivity ? styles.dayActive : "",
            key === todayKey ? styles.dayToday : "",
            key === selectedDay ? styles.daySelected : "",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <button
              key={key}
              className={classes}
              disabled={isFuture || !hasActivity}
              onClick={() => onSelectDay(selectedDay === key ? null : key)}
              aria-pressed={selectedDay === key}
              aria-label={`${monthLabel} ${day}${
                stats ? `, ${stats.listenCount} listens` : ""
              }`}
            >
              <span className={styles.dayNumber}>{day}</span>
              {stats && stats.listenCount > 0 && (
                <span className={styles.dayCount}>{stats.listenCount}</span>
              )}
              {stats && stats.purchaseCount > 0 && (
                <span className={styles.purchaseDot} aria-hidden="true" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

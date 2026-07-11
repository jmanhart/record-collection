import type { ReactNode } from "react";
import styles from "./StatCard.module.css";

interface StatCardRowProps {
  children: ReactNode;
}

export function StatCardRow({ children }: StatCardRowProps) {
  return <div className={styles.row}>{children}</div>;
}

interface StatCardProps {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  /** 0-100; renders a slim meter under the value */
  meterPercent?: number;
  /** Renders as a toggle button */
  onClick?: () => void;
  active?: boolean;
  title?: string;
}

export function StatCard({
  label,
  value,
  sub,
  meterPercent,
  onClick,
  active = false,
  title,
}: StatCardProps) {
  const content = (
    <>
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>{value}</span>
      {meterPercent !== undefined && (
        <span className={styles.meter}>
          <span
            className={styles.meterFill}
            style={{ width: `${Math.min(100, Math.max(0, meterPercent))}%` }}
          />
        </span>
      )}
      {sub && <span className={styles.sub}>{sub}</span>}
    </>
  );

  if (onClick) {
    return (
      <button
        className={`${styles.card} ${styles.action} ${active ? styles.active : ""}`}
        onClick={onClick}
        aria-pressed={active}
        title={title}
      >
        {content}
      </button>
    );
  }

  return <div className={styles.card}>{content}</div>;
}

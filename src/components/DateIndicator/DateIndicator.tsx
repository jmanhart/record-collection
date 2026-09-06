import { useState, useEffect, useRef } from "react";
import styles from "./DateIndicator.module.css";

export interface MonthMarker {
  /** YYYY-MM, matches the data-month attribute on timeline rows */
  key: string;
  /** Compact rail label, e.g. "Sep '26" */
  label: string;
}

interface DateIndicatorProps {
  months: MonthMarker[];
}

// Rows sit far enough below the sticky app bar that this offset lands the
// "active" month on the entry actually under the fold.
const SCROLL_OFFSET = 150;

/**
 * Month-year sibling of AlphabetIndicator: a fixed left rail that tracks the
 * timeline's scroll position and scrubs to a month on click/drag. Rows are
 * newest-first, so the rail runs newest month at the top.
 */
export function DateIndicator({ months }: DateIndicatorProps) {
  const [activeKey, setActiveKey] = useState<string>(months[0]?.key ?? "");
  const [hoveredKey, setHoveredKey] = useState<string>("");
  const [isScrubbing, setIsScrubbing] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const rows = document.querySelectorAll("[data-month]");
      if (rows.length === 0) return;

      let current = months[0]?.key ?? "";
      const scrollPosition = window.scrollY + SCROLL_OFFSET;

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i] as HTMLElement;
        const absoluteTop = row.getBoundingClientRect().top + window.scrollY;
        if (absoluteTop <= scrollPosition) {
          const key = row.getAttribute("data-month");
          if (key) current = key;
        } else {
          break;
        }
      }
      setActiveKey(current);
    };

    handleScroll();

    let ticking = false;
    const scrollListener = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", scrollListener, { passive: true });
    return () => window.removeEventListener("scroll", scrollListener);
  }, [months]);

  const scrollToMonth = (key: string, smooth = true) => {
    const firstRow = document.querySelector(`[data-month="${key}"]`);
    if (firstRow) {
      const scrollTop =
        window.scrollY + firstRow.getBoundingClientRect().top - SCROLL_OFFSET;
      window.scrollTo({ top: scrollTop, behavior: smooth ? "smooth" : "auto" });
    }
  };

  const monthFromMouse = (clientY: number): string | null => {
    if (!containerRef.current || months.length === 0) return null;
    const rect = containerRef.current.getBoundingClientRect();
    const index = Math.floor((clientY - rect.top) / (rect.height / months.length));
    if (index >= 0 && index < months.length) return months[index].key;
    return null;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsScrubbing(true);
    const key = monthFromMouse(e.clientY);
    if (key) {
      setHoveredKey(key);
      scrollToMonth(key, false);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isScrubbing) return;
    const key = monthFromMouse(e.clientY);
    if (key) {
      setHoveredKey(key);
      scrollToMonth(key, false);
    }
  };

  const handleMouseUp = () => {
    setIsScrubbing(false);
    setHoveredKey("");
  };

  const handleMouseLeave = () => {
    if (isScrubbing) setIsScrubbing(false);
    setHoveredKey("");
  };

  useEffect(() => {
    if (!isScrubbing) return;
    const onUp = () => {
      setIsScrubbing(false);
      setHoveredKey("");
    };
    window.addEventListener("mouseup", onUp);
    return () => window.removeEventListener("mouseup", onUp);
  }, [isScrubbing]);

  if (months.length === 0) return null;

  return (
    <div
      className={styles.container}
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      <div className={styles.months}>
        {months.map(({ key, label }) => {
          const isActive = key === activeKey;
          const showLabel = isActive || key === hoveredKey;
          return (
            <div
              key={key}
              className={`${styles.monthItem} ${isActive ? styles.active : ""} ${
                isScrubbing ? styles.scrubbing : ""
              }`}
              onMouseEnter={() => !isScrubbing && setHoveredKey(key)}
              onMouseLeave={() => !isScrubbing && setHoveredKey("")}
              onClick={() => !isScrubbing && scrollToMonth(key)}
            >
              <span className={styles.hash}>—</span>
              {showLabel && <span className={styles.label}>{label}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

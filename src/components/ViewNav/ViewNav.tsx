import { useState, useEffect } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import {
  LayoutGrid,
  Clock,
  ListOrdered,
  BarChart3,
  Waypoints,
  Menu,
  X,
} from "lucide-react";
import styles from "./ViewNav.module.css";

type ViewKey = "grid" | "timeline" | "top" | "stats" | "web";

const ITEMS: { key: ViewKey; to: string; label: string; Icon: typeof LayoutGrid }[] = [
  { key: "grid", to: "/", label: "Collection grid", Icon: LayoutGrid },
  { key: "timeline", to: "/?view=timeline", label: "Timeline", Icon: Clock },
  { key: "top", to: "/top-listens", label: "Top listens", Icon: ListOrdered },
  { key: "stats", to: "/stats", label: "Stats", Icon: BarChart3 },
  { key: "web", to: "/web", label: "Web", Icon: Waypoints },
];

/**
 * Persistent top-right view switcher. On desktop it's a cluster of circle
 * buttons; on mobile it collapses to a single hamburger that opens a sheet so
 * the buttons never fight the page's own controls for the top row.
 */
export function ViewNav() {
  const { pathname } = useLocation();
  const [params] = useSearchParams();
  const [open, setOpen] = useState(false);

  const current: ViewKey =
    pathname === "/top-listens"
      ? "top"
      : pathname === "/stats"
        ? "stats"
        : pathname === "/web"
          ? "web"
          : params.get("view") === "timeline"
            ? "timeline"
            : "grid";

  // Close the sheet whenever the destination changes, and on Escape.
  useEffect(() => setOpen(false), [pathname, params]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <nav className={styles.nav} aria-label="Views">
        {ITEMS.map(({ key, to, label, Icon }) => (
          <Link
            key={key}
            to={to}
            aria-label={label}
            aria-current={key === current ? "page" : undefined}
            className={`${styles.button} ${key === current ? styles.buttonActive : ""}`}
          >
            <Icon size={20} />
          </Link>
        ))}
      </nav>

      <button
        type="button"
        className={`${styles.button} ${styles.hamburger}`}
        aria-label="Open navigation"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <Menu size={20} />
      </button>

      {open && (
        <div
          className={styles.sheetOverlay}
          onClick={() => setOpen(false)}
          role="presentation"
        >
          <div
            className={styles.sheet}
            role="dialog"
            aria-label="Views"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.sheetHeader}>
              <span className={styles.sheetTitle}>Views</span>
              <button
                type="button"
                className={styles.sheetClose}
                aria-label="Close navigation"
                onClick={() => setOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
            {ITEMS.map(({ key, to, label, Icon }) => (
              <Link
                key={key}
                to={to}
                aria-current={key === current ? "page" : undefined}
                className={`${styles.sheetItem} ${key === current ? styles.sheetItemActive : ""}`}
              >
                <Icon size={20} aria-hidden />
                <span>{label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

import { Link, useLocation, useSearchParams } from "react-router-dom";
import { LayoutGrid, Clock, ListOrdered } from "lucide-react";
import styles from "./ViewNav.module.css";

type ViewKey = "grid" | "timeline" | "top";

const ITEMS: { key: ViewKey; to: string; label: string; Icon: typeof LayoutGrid }[] = [
  { key: "grid", to: "/", label: "Collection grid", Icon: LayoutGrid },
  { key: "timeline", to: "/?view=timeline", label: "Timeline", Icon: Clock },
  { key: "top", to: "/top-listens", label: "Top listens", Icon: ListOrdered },
];

/**
 * Persistent top-right cluster linking the three collection views. Rendered
 * identically on each so you can jump between them from anywhere; the current
 * view's button is marked active. Grid/timeline are `view` params on `/`; top
 * listens is its own route.
 */
export function ViewNav() {
  const { pathname } = useLocation();
  const [params] = useSearchParams();
  const current: ViewKey =
    pathname === "/top-listens"
      ? "top"
      : params.get("view") === "timeline"
        ? "timeline"
        : "grid";

  return (
    <nav className={styles.nav} aria-label="Views">
      {ITEMS.map(({ key, to, label, Icon }) => {
        const active = key === current;
        return (
          <Link
            key={key}
            to={to}
            aria-label={label}
            aria-current={active ? "page" : undefined}
            className={`${styles.button} ${active ? styles.buttonActive : ""}`}
          >
            <Icon size={20} />
          </Link>
        );
      })}
    </nav>
  );
}

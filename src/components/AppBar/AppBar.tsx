import { useState, useEffect } from "react";
import { Search } from "../Search/Search";
import styles from "./AppBar.module.css";

interface AppBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  /** Hidden on views that don't search (e.g. the timeline). */
  showSearch?: boolean;
  /** True on views with a full-bleed hero the bar should overlay while it's
   *  still on screen (currently the timeline). */
  hasHero?: boolean;
}

/**
 * Top-level app bar: fixed overlay holding a compact search aligned to the
 * page's left gutter. Transparent at the top; on a hero view
 * it stays transparent and tints its controls to the hero (via body class)
 * until the hero scrolls past, then turns solid. On other views it turns solid
 * as soon as the page scrolls. The view switch is a separate globally-fixed
 * control that floats over the right corner.
 */
export function AppBar({
  search,
  onSearchChange,
  searchPlaceholder = "Search...",
  showSearch = true,
  hasHero = false,
}: AppBarProps) {
  const [solid, setSolid] = useState(false);
  const [overHero, setOverHero] = useState(false);
  useEffect(() => {
    let raf = 0;
    const navHeight =
      parseInt(
        getComputedStyle(document.documentElement).getPropertyValue(
          "--nav-height"
        )
      ) || 64;
    const compute = () => {
      raf = 0;
      const hero = hasHero
        ? document.querySelector<HTMLElement>("[data-timeline-hero]")
        : null;
      if (hero) {
        // On the timeline the bar carries no controls, so it never becomes a
        // solid backdrop — it stays transparent and the corner buttons float
        // on their own (hero-tinted over the hero, solid chips once past it).
        setOverHero(hero.getBoundingClientRect().bottom > navHeight + 4);
        setSolid(false);
      } else {
        setOverHero(false);
        setSolid(window.scrollY > 8);
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(compute);
    };
    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    // The hero mounts after its data loads (feed shows a loader first), so
    // recompute on layout changes too — otherwise the bar would miss it.
    const ro = new ResizeObserver(onScroll);
    ro.observe(document.body);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      ro.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [hasHero]);

  // Let global controls (view switch, pills) adopt the hero palette while the
  // bar overlays it.
  useEffect(() => {
    document.body.classList.toggle("nav-over-hero", overHero);
    return () => document.body.classList.remove("nav-over-hero");
  }, [overHero]);

  return (
    <header className={`${styles.appBar} ${solid ? styles.scrolled : ""}`}>
      {showSearch && (
        <Search
          value={search}
          onChange={onSearchChange}
          placeholder={searchPlaceholder}
          variant="compact"
        />
      )}
    </header>
  );
}

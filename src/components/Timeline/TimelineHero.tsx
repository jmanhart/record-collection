import { useMemo, useEffect } from "react";
import type { ActivityEvent } from "../../hooks/useActivity";
import { NowPlayingHero } from "../common/NowPlayingHero/NowPlayingHero";
import {
  heroPalette,
  heroCssVars,
  heroRootVars,
} from "../../utils/heroPalette";
import styles from "./TimelineHero.module.css";

interface TimelineHeroProps {
  event: ActivityEvent;
  playing: boolean;
  ordinal: number;
  /** Total lifetime listen count for this release. */
  plays: number;
  /** Pre-formatted in the feed, which owns the time helpers. */
  dayLabel: string;
  timeRange: string;
  since: string;
  onSelect: (event: ActivityEvent) => void;
}

/**
 * Oversized "now playing / last played" spotlight at the top of the timeline.
 * The self-contained color world + content live in the shared NowPlayingHero;
 * this wraps it in the clickable, full-bleed 80vh container and publishes the
 * cover palette to :root so the fixed AppBar tints to the art.
 */
export function TimelineHero({
  event,
  playing,
  ordinal,
  plays,
  dayLabel,
  timeRange,
  since,
  onSelect,
}: TimelineHeroProps) {
  const record = event.record;

  // Tint the hero to the cover and pick text/scrim tones that stay legible on
  // it, independent of the app theme (the hero has its own color world).
  const palette = useMemo(
    () => heroPalette(record?.dominant_color),
    [record?.dominant_color]
  );

  // Publish the palette to :root so the fixed AppBar (a DOM sibling) can tint
  // its controls to the hero while it's transparent over it.
  useEffect(() => {
    if (!palette) return;
    const root = document.documentElement;
    const vars = heroRootVars(palette);
    for (const [k, v] of Object.entries(vars)) root.style.setProperty(k, v);
    return () => {
      for (const k of Object.keys(vars)) root.style.removeProperty(k);
    };
  }, [palette]);

  if (!record) return null;

  const cssVars = palette ? heroCssVars(palette) : undefined;

  return (
    <button
      type="button"
      className={styles.hero}
      style={cssVars}
      onClick={() => onSelect(event)}
      aria-label={`${record.title} by ${record.artist} — open details`}
      data-timeline-hero
    >
      <NowPlayingHero
        record={record}
        playing={playing}
        statusLabel={playing ? "Now Playing" : "Last played"}
        statusDetail={
          playing
            ? `since ${since}`
            : `${dayLabel}${timeRange ? ` · ${timeRange}` : ""}`
        }
        ordinal={ordinal}
        plays={plays}
        showSpine
      />
    </button>
  );
}

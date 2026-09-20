import { useMemo, useState } from "react";
import { Disc3 } from "lucide-react";
import type { ActivityEvent } from "../../hooks/useActivity";
import { formatRuntimeCompact } from "../../utils/formatDuration";
import styles from "./TimelineHero.module.css";

interface TimelineHeroProps {
  event: ActivityEvent;
  playing: boolean;
  ordinal: number;
  plays: number;
  /** Pre-formatted in the feed, which owns the time helpers. */
  dayLabel: string;
  timeRange: string;
  since: string;
  onSelect: (event: ActivityEvent) => void;
}

/**
 * Oversized "now playing / last played" spotlight at the top of the timeline.
 * Background is tinted to the cover's precomputed dominant color plus a blurred
 * copy of the art, so the hero visually belongs to whatever is on the platter.
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
  const [imageError, setImageError] = useState(false);
  const record = event.record;

  // Tint the hero to the cover and pick text/scrim tones that stay legible on
  // it, independent of the app theme (the hero has its own color world).
  const palette = useMemo(() => {
    const color = record?.dominant_color;
    if (!color) return null;
    const hex = color.replace("#", "");
    if (hex.length !== 6) return null;
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    // Perceived luminance (ITU-R BT.601) → light backgrounds get dark ink.
    const isLight = (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.62;
    return {
      color,
      text: isLight ? "#141414" : "#f5f5f5",
      subtext: isLight ? "rgba(20,20,20,0.66)" : "rgba(245,245,245,0.72)",
      scrim: isLight ? "rgba(255,255,255,0.44)" : "rgba(0,0,0,0.4)",
      chip: isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.12)",
    };
  }, [record?.dominant_color]);

  if (!record) return null;

  const cover = record.supabase_image_url || record.coverImage;
  const showImage = cover && !imageError;
  const trackCount =
    record.tracklist?.filter((t) => t.type_ !== "heading").length ?? 0;
  const meta = [
    record.year,
    record.format_descriptions?.length
      ? record.format_descriptions.join(", ")
      : record.format_name,
    record.genres?.length ? record.genres.join(", ") : null,
  ].filter(Boolean) as (string | number)[];

  const cssVars = palette
    ? ({
        "--hero-color": palette.color,
        "--hero-text": palette.text,
        "--hero-subtext": palette.subtext,
        "--hero-scrim": palette.scrim,
        "--hero-chip": palette.chip,
      } as React.CSSProperties)
    : undefined;

  return (
    <button
      type="button"
      className={styles.hero}
      style={cssVars}
      onClick={() => onSelect(event)}
      aria-label={`${record.title} by ${record.artist} — open details`}
    >
      {showImage && (
        <div
          className={styles.ambient}
          style={{ backgroundImage: `url(${cover})` }}
          aria-hidden
        />
      )}
      <div className={styles.scrim} aria-hidden />

      <div className={styles.content}>
        <span className={styles.status}>
          {playing ? (
            <>
              <Disc3 size={15} className={styles.spin} />
              <span className={styles.statusLabel}>Now Playing</span>
              <span className={styles.statusDetail}>since {since}</span>
            </>
          ) : (
            <>
              <span className={styles.statusLabel}>Last played</span>
              <span className={styles.statusDetail}>
                {dayLabel}
                {timeRange ? ` · ${timeRange}` : ""}
              </span>
            </>
          )}
        </span>

        <div className={styles.body}>
          <div className={styles.cover}>
            {/* Spine drops from the dot down into the feed (clipped at the
                hero's bottom), so the timeline reads as continuous below the
                status header without a stub above the dot. */}
            <span className={styles.spine} aria-hidden />
            <span className={styles.node} aria-hidden />
            {showImage ? (
              <img
                src={cover}
                alt={`${record.title} by ${record.artist}`}
                className={styles.image}
                onError={() => setImageError(true)}
              />
            ) : (
              <div className={styles.placeholder}>
                <span>{record.title[0]}</span>
              </div>
            )}
          </div>

          <div className={styles.info}>
            <h2 className={styles.title}>{record.title}</h2>
            <p className={styles.artist}>{record.artist}</p>

            {meta.length > 0 && (
              <ul className={styles.chips}>
                {meta.map((m) => (
                  <li key={String(m)} className={styles.chip}>
                    {m}
                  </li>
                ))}
              </ul>
            )}

            <div className={styles.footer}>
              <span className={styles.footItem}>
                {ordinal === 1 ? "First time played" : `Played ${plays} times`}
              </span>
              {trackCount > 0 && (
                <span className={styles.footItem}>
                  {trackCount} {trackCount === 1 ? "track" : "tracks"}
                  {record.duration_seconds
                    ? ` · ${formatRuntimeCompact(record.duration_seconds)}`
                    : ""}
                </span>
              )}
              {ordinal === 1 && <span className={styles.badge}>1st Spin</span>}
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}

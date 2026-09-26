import { useMemo, useState, useEffect } from "react";
import { Disc3 } from "lucide-react";
import type { ActivityEvent } from "../../hooks/useActivity";
import { formatRuntimeCompact } from "../../utils/formatDuration";
import { EqualizerBars } from "./EqualizerBars";
import styles from "./TimelineHero.module.css";

// RGB (0–255) → HSL. Used to derive an analogous-but-darker bar color that
// stays in the same family as the cover's dominant color.
function rgbToHsl(r: number, g: number, b: number) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  let h = 0;
  let s = 0;
  if (d) {
    s = d / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case r:
        h = (((g - b) / d) % 6 + 6) % 6;
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
    }
    h *= 60;
  }
  return { h, s, l };
}

function hslToHex(h: number, s: number, l: number) {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) [r, g] = [c, x];
  else if (h < 120) [r, g] = [x, c];
  else if (h < 180) [g, b] = [c, x];
  else if (h < 240) [g, b] = [x, c];
  else if (h < 300) [r, b] = [x, c];
  else [r, b] = [c, x];
  const to = (v: number) =>
    Math.round((v + m) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`;
}

interface TimelineHeroProps {
  event: ActivityEvent;
  playing: boolean;
  ordinal: number;
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
    // Equalizer bars: same color family as the hero background, hue nudged for
    // an analogous relationship and lightness halved so they read as a darker
    // shade of the backdrop rather than generic ink.
    const { h, s, l } = rgbToHsl(r, g, b);
    const bar = hslToHex((h + 340) % 360, s, Math.max(0.08, l * 0.5));
    return {
      color,
      bar,
      text: isLight ? "#141414" : "#f5f5f5",
      subtext: isLight ? "rgba(20,20,20,0.66)" : "rgba(245,245,245,0.72)",
      scrim: isLight ? "rgba(255,255,255,0.44)" : "rgba(0,0,0,0.4)",
      chip: isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.12)",
      // Borders / fills for nav controls that adopt the hero's color world.
      line: isLight ? "rgba(20,20,20,0.28)" : "rgba(245,245,245,0.34)",
      fill: isLight ? "rgba(20,20,20,0.10)" : "rgba(245,245,245,0.16)",
    };
  }, [record?.dominant_color]);

  // Publish the palette to :root so the fixed AppBar (a DOM sibling) can tint
  // its controls to the hero while it's transparent over it. Cleared on
  // unmount / when leaving the timeline.
  useEffect(() => {
    if (!palette) return;
    const root = document.documentElement;
    const vars: Record<string, string> = {
      "--hero-color": palette.color,
      "--hero-text": palette.text,
      "--hero-subtext": palette.subtext,
      "--hero-line": palette.line,
      "--hero-fill": palette.fill,
    };
    for (const [k, v] of Object.entries(vars)) root.style.setProperty(k, v);
    return () => {
      for (const k of Object.keys(vars)) root.style.removeProperty(k);
    };
  }, [palette]);

  if (!record) return null;

  const cover = record.supabase_image_url || record.coverImage;
  const showImage = cover && !imageError;
  const trackCount =
    record.tracklist?.filter((t) => t.type_ !== "heading").length ?? 0;
  const metaTags = [
    record.year ? String(record.year) : null,
    ...(record.format_descriptions?.length
      ? record.format_descriptions
      : record.format_name
        ? [record.format_name]
        : []),
    ...(record.genres ?? []),
  ].filter(Boolean) as string[];

  const cssVars = palette
    ? ({
        "--hero-color": palette.color,
        "--hero-bar": palette.bar,
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
      data-timeline-hero
    >
      {showImage && (
        <div
          className={styles.ambient}
          style={{ backgroundImage: `url(${cover})` }}
          aria-hidden
        />
      )}
      <div className={styles.scrim} aria-hidden />
      <EqualizerBars active={playing} />

      <div className={styles.content}>
        <span className={styles.status}>
          {/* Spine drops from the marker down into the feed (clipped at the
              hero's bottom). When playing, the marker becomes the spinning
              disc; otherwise it's the timeline dot. */}
          <span className={styles.spine} aria-hidden />
          {playing ? (
            <span className={styles.playingIcon} aria-hidden>
              <Disc3 size={26} className={styles.spin} />
            </span>
          ) : (
            <span className={styles.node} aria-hidden />
          )}
          {playing ? (
            <>
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

            {metaTags.length > 0 && (
              <div className={styles.meta}>
                {metaTags.map((tag, i) => (
                  <span key={`${i}-${tag}`} className={styles.metaTag}>
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className={styles.footer}>
              {trackCount > 0 && (
                <span className={styles.footItem}>
                  {trackCount} {trackCount === 1 ? "track" : "tracks"}
                </span>
              )}
              {record.duration_seconds ? (
                <span className={styles.metaTag}>
                  {formatRuntimeCompact(record.duration_seconds)}
                </span>
              ) : null}
              {ordinal === 1 && <span className={styles.metaTag}>1st Spin</span>}
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}

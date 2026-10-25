import { useState, type ReactNode, type PointerEvent } from "react";
import { Disc3 } from "lucide-react";
import type { Record as RecordType } from "../../../types/Record";
import { formatRuntimeCompact } from "../../../utils/formatDuration";
import { EqualizerBars } from "./EqualizerBars";
import styles from "./NowPlayingHero.module.css";

interface NowPlayingHeroProps {
  record: RecordType;
  playing: boolean;
  /** "Now Playing" | "Last played" — the label on the status line. */
  statusLabel: string;
  /** "since 3:40 PM" or "Yesterday · 6:15 PM" — the detail under the label. */
  statusDetail: ReactNode;
  /** Lifetime listen count for the "N listens" pill. */
  plays?: number;
  /** 1 marks the first-ever spin (shows a "1st Spin" pill). */
  ordinal?: number;
  /** Drop the timeline continuity spine (on in the timeline, off in stats). */
  showSpine?: boolean;
  /** Equalizer spans the full hero width instead of hugging the album edge. */
  equalizerFullBleed?: boolean;
}

/**
 * The shared "now playing / last played" spotlight: a self-contained color
 * world (the cover's dominant color + a blurred copy of the art + scrim) with
 * the cover, status, title/artist and meta, plus the equalizer pinned to the
 * bottom. Renders as a fragment inside a positioned, cssVar-bearing container
 * (the timeline hero button, or the stats immersive layer).
 */
export function NowPlayingHero({
  record,
  playing,
  statusLabel,
  statusDetail,
  plays = 0,
  ordinal = 0,
  showSpine = false,
  equalizerFullBleed = false,
}: NowPlayingHeroProps) {
  const [imageError, setImageError] = useState(false);
  const cover = record.supabase_image_url || record.coverImage;
  const showImage = cover && !imageError;

  const trackCount =
    record.tracklist?.filter((t) => t.type_ !== "heading").length ?? 0;
  const trackLabel =
    trackCount > 0
      ? `${trackCount} ${trackCount === 1 ? "track" : "tracks"}`
      : null;
  const runtime = record.duration_seconds
    ? formatRuntimeCompact(record.duration_seconds)
    : null;
  const metaTags = [record.year ? String(record.year) : null].filter(
    Boolean
  ) as string[];

  // Subtle 3D tilt: the cover leans away from the cursor. Written straight to
  // CSS vars (no state) so the hero doesn't re-render on every pointer move.
  const handleTilt = (e: PointerEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const nx = ((e.clientX - r.left) / r.width - 0.5) * 2;
    const ny = ((e.clientY - r.top) / r.height - 0.5) * 2;
    const MAX = 4;
    el.style.setProperty("--ry", `${nx * MAX}deg`);
    el.style.setProperty("--rx", `${-ny * MAX}deg`);
  };
  const resetTilt = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.style.setProperty("--rx", "0deg");
    e.currentTarget.style.setProperty("--ry", "0deg");
  };

  return (
    <>
      {showImage && (
        <div
          className={styles.ambient}
          style={{ backgroundImage: `url(${cover})` }}
          aria-hidden
        />
      )}
      <div className={styles.scrim} aria-hidden />
      {showImage && (
        <div
          className={styles.edgeArt}
          style={{ backgroundImage: `url(${cover})` }}
          aria-hidden
        />
      )}
      <EqualizerBars active={playing} fullBleed={equalizerFullBleed} />

      <div className={styles.content}>
        <span className={styles.status}>
          {showSpine && <span className={styles.spine} aria-hidden />}
          {playing ? (
            <span className={styles.playingIcon} aria-hidden>
              <Disc3 size={26} className={styles.spin} />
            </span>
          ) : (
            <span className={styles.node} aria-hidden />
          )}
          <span className={styles.statusLabel}>{statusLabel}</span>
          <span className={styles.statusDetail}>{statusDetail}</span>
        </span>

        <div className={styles.body}>
          <div
            className={styles.cover}
            onPointerMove={handleTilt}
            onPointerLeave={resetTilt}
          >
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

            {(metaTags.length > 0 ||
              trackLabel ||
              runtime ||
              plays > 0 ||
              ordinal === 1) && (
              <div className={styles.meta}>
                {metaTags.map((tag, i) => (
                  <span key={`${i}-${tag}`} className={styles.metaTag}>
                    {tag}
                  </span>
                ))}
                {(trackLabel || runtime) && (
                  <span className={styles.metaTag}>
                    {trackLabel}
                    {trackLabel && runtime && <span className={styles.sep}>|</span>}
                    {runtime}
                  </span>
                )}
                {plays > 0 && (
                  <span className={styles.metaTag}>
                    {plays} {plays === 1 ? "listen" : "listens"}
                  </span>
                )}
                {ordinal === 1 && <span className={styles.metaTag}>1st Spin</span>}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

import { useCallback, useEffect, useRef, useState } from "react";

/** Even a 16-minute album clears the card threshold. */
export const MAX_HOUR_WIDTH = 600;
export const DEFAULT_HOUR_WIDTH = 300;

/** Absolute floor, only used before the scroller has been measured. */
const FALLBACK_MIN_HOUR_WIDTH = 50;

const HOURS_PER_DAY = 24;

/**
 * Zoom reads as multiplicative, so the slider is logarithmic — a step near
 * the zoomed-out end changes as much proportionally as one near the top.
 * The bottom of the range is whatever width makes a day exactly fill the
 * viewport, so zooming out can never leave dead canvas beside the grid.
 */
export function zoomToSlider(hourWidth: number, min: number): number {
  const range = Math.log(MAX_HOUR_WIDTH / min);
  if (range <= 0) return 100;
  return (Math.log(hourWidth / min) / range) * 100;
}

export function sliderToZoom(value: number, min: number): number {
  const range = Math.log(MAX_HOUR_WIDTH / min);
  return min * Math.exp((value / 100) * range);
}

interface Options {
  scrollerRef: React.RefObject<HTMLDivElement | null>;
  /** Resolves the day track, whose width and offset anchor the zoom */
  getTrack: () => HTMLElement | null;
  /**
   * Point in the day (0–1) the slider zooms about, held at the centre of the
   * viewport — the current time, so zooming converges on now rather than on
   * whatever happens to be mid-screen. Gestures ignore this and follow the
   * pointer instead.
   */
  focusFraction?: number;
}

/**
 * Zoom state for the timeline, driven by a slider, trackpad pinch, or a
 * two-finger touch gesture. Every path keeps the time under the anchor point
 * fixed — without that, zooming throws you to a different hour and feels
 * broken.
 */
export function useTimelineZoom({
  scrollerRef,
  getTrack,
  focusFraction,
}: Options) {
  const [hourWidth, setHourWidth] = useState(DEFAULT_HOUR_WIDTH);
  const [minHourWidth, setMinHourWidth] = useState(FALLBACK_MIN_HOUR_WIDTH);

  const focusRef = useRef(focusFraction);
  focusRef.current = focusFraction;

  // Gestures fire faster than React re-renders, so they read the live value
  // from a ref rather than the captured state
  const hourWidthRef = useRef(hourWidth);
  hourWidthRef.current = hourWidth;
  const minRef = useRef(minHourWidth);
  minRef.current = minHourWidth;

  /** The width at which one day exactly fills the space beside the gutter. */
  const measureFit = useCallback(() => {
    const scroller = scrollerRef.current;
    const track = getTrack();
    if (!scroller || !track) return null;
    const gutter =
      track.getBoundingClientRect().left -
      scroller.getBoundingClientRect().left +
      scroller.scrollLeft;
    return (scroller.clientWidth - gutter) / HOURS_PER_DAY;
  }, [scrollerRef, getTrack]);

  const zoomTo = useCallback(
    (next: number, anchorClientX?: number) => {
      const target = Math.min(
        MAX_HOUR_WIDTH,
        Math.max(minRef.current, next)
      );
      const scroller = scrollerRef.current;
      const track = getTrack();
      if (!scroller || !track) {
        setHourWidth(target);
        return;
      }

      const scrollerRect = scroller.getBoundingClientRect();
      const trackRect = track.getBoundingClientRect();

      // Where the day track begins within the scrollable content. Unaffected
      // by zoom, since the gutter is a fixed width.
      const trackStart =
        trackRect.left - scrollerRect.left + scroller.scrollLeft;

      let anchorX: number;
      let dayFraction: number;

      if (anchorClientX != null) {
        // Gesture: hold whatever moment is under the pointer exactly where
        // it already sits, so the canvas tracks the fingers.
        anchorX = anchorClientX - scrollerRect.left;
        dayFraction =
          (scroller.scrollLeft + anchorX - trackStart) / trackRect.width;
      } else if (focusRef.current != null) {
        // Slider: pivot on the focus time and bring it to the middle of the
        // viewport, so zooming converges on now instead of on mid-screen.
        anchorX = scroller.clientWidth / 2;
        dayFraction = focusRef.current;
      } else {
        anchorX = scroller.clientWidth / 2;
        dayFraction =
          (scroller.scrollLeft + anchorX - trackStart) / trackRect.width;
      }

      setHourWidth(target);

      // Re-anchor once the new width has been laid out
      requestAnimationFrame(() => {
        scroller.scrollLeft =
          trackStart + dayFraction * HOURS_PER_DAY * target - anchorX;
      });
    },
    [scrollerRef, getTrack]
  );

  // The fit floor moves with the viewport, so it's re-measured on resize —
  // and the current zoom is pushed back up if a wider window has raised it.
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const sync = () => {
      const fit = measureFit();
      if (!fit || !Number.isFinite(fit) || fit <= 0) return;
      setMinHourWidth(fit);
      setHourWidth((current) => Math.max(current, fit));
    };

    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(scroller);
    return () => observer.disconnect();
  }, [scrollerRef, measureFit]);

  // Trackpad pinch on macOS arrives as a wheel event with ctrlKey set, which
  // also covers ctrl/cmd + wheel on a mouse. Must be non-passive to cancel
  // the browser's own page zoom.
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    let frame = 0;
    let pendingDelta = 0;
    let pendingX = 0;

    // Several wheel events can land in one frame; accumulate their delta and
    // apply it once, rather than acting on whichever arrived first.
    const onWheel = (event: WheelEvent) => {
      if (!event.ctrlKey && !event.metaKey) return;
      event.preventDefault();
      pendingDelta += event.deltaY;
      pendingX = event.clientX;
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const delta = pendingDelta;
        pendingDelta = 0;
        zoomTo(hourWidthRef.current * Math.exp(-delta * 0.01), pendingX);
      });
    };

    scroller.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      scroller.removeEventListener("wheel", onWheel);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [scrollerRef, zoomTo]);

  // Two-finger pinch. `touch-action: pan-x pan-y` on the scroller omits
  // pinch-zoom, so the browser leaves the gesture to us while one-finger
  // panning stays native.
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const spread = (touches: TouchList) =>
      Math.hypot(
        touches[0].clientX - touches[1].clientX,
        touches[0].clientY - touches[1].clientY
      );

    let startSpread = 0;
    let startZoom = 0;
    let latestRatio = 1;
    let latestAnchor = 0;
    let frame = 0;

    const onStart = (event: TouchEvent) => {
      if (event.touches.length !== 2) return;
      startSpread = spread(event.touches);
      startZoom = hourWidthRef.current;
      latestRatio = 1;
      latestAnchor = (event.touches[0].clientX + event.touches[1].clientX) / 2;
    };

    // Ratio is measured against the spread at touchstart, so the gesture
    // stays absolute rather than drifting. The newest sample in a frame wins;
    // acting on a stale one makes a fast pinch under-shoot.
    const onMove = (event: TouchEvent) => {
      if (event.touches.length !== 2 || !startSpread) return;
      event.preventDefault();
      latestRatio = spread(event.touches) / startSpread;
      latestAnchor = (event.touches[0].clientX + event.touches[1].clientX) / 2;
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        zoomTo(startZoom * latestRatio, latestAnchor);
      });
    };

    const onEnd = () => {
      startSpread = 0;
    };

    scroller.addEventListener("touchstart", onStart, { passive: true });
    scroller.addEventListener("touchmove", onMove, { passive: false });
    scroller.addEventListener("touchend", onEnd, { passive: true });
    scroller.addEventListener("touchcancel", onEnd, { passive: true });
    return () => {
      scroller.removeEventListener("touchstart", onStart);
      scroller.removeEventListener("touchmove", onMove);
      scroller.removeEventListener("touchend", onEnd);
      scroller.removeEventListener("touchcancel", onEnd);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [scrollerRef, zoomTo]);

  return { hourWidth, minHourWidth, zoomTo };
}

-- Dominant cover color, precomputed at ingest.
-- Covers are immutable, so this is extracted once (sync tool / backfill) and
-- stored as a hex string (e.g. "#1a2b3c"). Powers the timeline hero's ambient
-- background + color seam without per-render canvas extraction. NULL until
-- backfilled or for records without a cover; consumers fall back to theme bg.

ALTER TABLE records ADD COLUMN IF NOT EXISTS dominant_color text;

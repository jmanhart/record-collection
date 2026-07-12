-- Explicit listen end times
-- ended_at is NULL for listens assumed to run the full album (all history);
-- set when the listen was explicitly stopped. Powers accurate "not playing
-- anymore" state in external now-playing widgets via listen_details.

ALTER TABLE listens ADD COLUMN ended_at TIMESTAMPTZ;

-- Ends whatever is currently playing. No arguments: acts only on the most
-- recent listen still inside its inferred playing window, so it can't edit
-- history and double calls are harmless (second call matches nothing).
-- Call via supabase.rpc('end_listen')
CREATE OR REPLACE FUNCTION end_listen()
RETURNS SETOF listens
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE listens
  SET ended_at = now()
  WHERE id = (
    SELECT l.id
    FROM listens l
    LEFT JOIN records r ON r.id = l.release_id
    WHERE l.ended_at IS NULL
      AND now() < l.listened_at + make_interval(secs => COALESCE(r.duration_seconds, 2700) + 300)
    ORDER BY l.listened_at DESC
    LIMIT 1
  )
  RETURNING *;
$$;

-- Recreate the view: explicit ended_at wins over the inferred one, and
-- is_playing turns false the moment a listen is explicitly ended.
-- Column names/types/order match the original, with stopped_early appended,
-- so CREATE OR REPLACE works and existing consumers are unaffected.
CREATE OR REPLACE VIEW listen_details
WITH (security_invoker = on) AS
SELECT
  l.id,
  l.release_id,
  l.listened_at,
  l.source,
  r.title,
  r.artist,
  r.duration_seconds,
  r.supabase_image_url,
  COALESCE(
    l.ended_at,
    l.listened_at + make_interval(secs => COALESCE(r.duration_seconds, 2700))
  ) AS ended_at,
  l.ended_at IS NULL
    AND now() < l.listened_at + make_interval(secs => COALESCE(r.duration_seconds, 2700) + 300)
    AS is_playing,
  l.ended_at IS NOT NULL AS stopped_early
FROM listens l
LEFT JOIN records r ON r.id = l.release_id;

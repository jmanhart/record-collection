-- Listen details view
-- Joins listens with records (no FK exists between them, so PostgREST can't
-- embed the join) and computes when each listen ended based on album runtime.
-- Powers external "now playing" widgets with a single request:
--   GET /rest/v1/listen_details?order=listened_at.desc&limit=1
--
-- ended_at assumes the full album played from the moment the listen was
-- logged; is_playing includes 5 minutes of slack for flipping the record.
-- Records without a duration fall back to 45 minutes.
CREATE VIEW listen_details
WITH (security_invoker = on) AS  -- run as caller so RLS on listens/records applies
SELECT
  l.id,
  l.release_id,
  l.listened_at,
  l.source,
  r.title,
  r.artist,
  r.duration_seconds,
  r.supabase_image_url,
  l.listened_at + make_interval(secs => COALESCE(r.duration_seconds, 2700)) AS ended_at,
  now() < l.listened_at + make_interval(secs => COALESCE(r.duration_seconds, 2700) + 300) AS is_playing
FROM listens l
LEFT JOIN records r ON r.id = l.release_id;

-- Underlying tables are public-read via RLS; the view itself still needs a grant
GRANT SELECT ON listen_details TO anon, authenticated;

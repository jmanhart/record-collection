-- Server-side function to log a listen with 2-minute cooldown.
-- Call via supabase.rpc('log_listen', { p_release_id: 123, p_source: 'nfc' })
--
-- Returns the new listen row on success, empty result if cooldown is active.
-- The cooldown is global (any record) because you can only play one record at a time.
CREATE OR REPLACE FUNCTION log_listen(
  p_release_id INTEGER,
  p_source TEXT DEFAULT 'nfc'
)
RETURNS SETOF listens
LANGUAGE sql
SECURITY DEFINER
AS $$
  INSERT INTO listens (release_id, source)
  SELECT p_release_id, p_source
  WHERE NOT EXISTS (
    SELECT 1 FROM listens
    WHERE listened_at > now() - interval '2 minutes'
  )
  RETURNING *;
$$;

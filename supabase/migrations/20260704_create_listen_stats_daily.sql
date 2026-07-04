-- Daily listening stats rollup table
-- Precomputes per-day aggregates from listens + records for instant analytics queries.
-- Populated by a trigger on listens INSERT and backfilled for existing data.

CREATE TABLE listen_stats_daily (
  date                   DATE PRIMARY KEY,
  listen_count           INTEGER NOT NULL DEFAULT 0,
  total_duration_seconds INTEGER NOT NULL DEFAULT 0,
  unique_albums          INTEGER NOT NULL DEFAULT 0,
  unique_artists         INTEGER NOT NULL DEFAULT 0,
  earliest_listen        TIMESTAMPTZ,
  latest_listen          TIMESTAMPTZ,
  top_genre              TEXT
);

-- RLS: public read only (trigger writes via SECURITY DEFINER)
ALTER TABLE listen_stats_daily ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access"
  ON listen_stats_daily
  FOR SELECT
  TO anon
  USING (true);

-- Trigger function: recomputes a single day's stats after each listen insert
CREATE OR REPLACE FUNCTION refresh_daily_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  listen_date DATE;
  stats RECORD;
  genre TEXT;
BEGIN
  listen_date := (NEW.listened_at AT TIME ZONE 'UTC')::date;

  -- Aggregate stats for the day
  SELECT
    COUNT(*)::integer AS listen_count,
    COALESCE(SUM(r.duration_seconds), 0)::integer AS total_duration_seconds,
    COUNT(DISTINCT l.release_id)::integer AS unique_albums,
    COUNT(DISTINCT r.artist)::integer AS unique_artists,
    MIN(l.listened_at) AS earliest_listen,
    MAX(l.listened_at) AS latest_listen
  INTO stats
  FROM listens l
  LEFT JOIN records r ON r.id = l.release_id
  WHERE (l.listened_at AT TIME ZONE 'UTC')::date = listen_date;

  -- Compute top genre by unnesting genres arrays and counting
  SELECT g INTO genre
  FROM (
    SELECT unnest(r.genres) AS g, COUNT(*) AS cnt
    FROM listens l
    JOIN records r ON r.id = l.release_id
    WHERE (l.listened_at AT TIME ZONE 'UTC')::date = listen_date
      AND r.genres IS NOT NULL
    GROUP BY g
    ORDER BY cnt DESC, g ASC
    LIMIT 1
  ) sub;

  -- Upsert the daily row
  INSERT INTO listen_stats_daily (
    date, listen_count, total_duration_seconds,
    unique_albums, unique_artists,
    earliest_listen, latest_listen, top_genre
  ) VALUES (
    listen_date, stats.listen_count, stats.total_duration_seconds,
    stats.unique_albums, stats.unique_artists,
    stats.earliest_listen, stats.latest_listen, genre
  )
  ON CONFLICT (date) DO UPDATE SET
    listen_count           = EXCLUDED.listen_count,
    total_duration_seconds = EXCLUDED.total_duration_seconds,
    unique_albums          = EXCLUDED.unique_albums,
    unique_artists         = EXCLUDED.unique_artists,
    earliest_listen        = EXCLUDED.earliest_listen,
    latest_listen          = EXCLUDED.latest_listen,
    top_genre              = EXCLUDED.top_genre;

  RETURN NEW;
END;
$$;

-- Attach trigger to listens table
CREATE TRIGGER trg_refresh_daily_stats
  AFTER INSERT ON listens
  FOR EACH ROW
  EXECUTE FUNCTION refresh_daily_stats();

-- Backfill: aggregate all existing listens into listen_stats_daily
WITH daily_stats AS (
  SELECT
    (l.listened_at AT TIME ZONE 'UTC')::date AS date,
    COUNT(*)::integer AS listen_count,
    COALESCE(SUM(r.duration_seconds), 0)::integer AS total_duration_seconds,
    COUNT(DISTINCT l.release_id)::integer AS unique_albums,
    COUNT(DISTINCT r.artist)::integer AS unique_artists,
    MIN(l.listened_at) AS earliest_listen,
    MAX(l.listened_at) AS latest_listen
  FROM listens l
  LEFT JOIN records r ON r.id = l.release_id
  GROUP BY (l.listened_at AT TIME ZONE 'UTC')::date
),
daily_top_genre AS (
  SELECT DISTINCT ON (date)
    date, g AS top_genre
  FROM (
    SELECT
      (l.listened_at AT TIME ZONE 'UTC')::date AS date,
      unnest(r.genres) AS g,
      COUNT(*) AS cnt
    FROM listens l
    JOIN records r ON r.id = l.release_id
    WHERE r.genres IS NOT NULL
    GROUP BY (l.listened_at AT TIME ZONE 'UTC')::date, g
  ) genre_counts
  ORDER BY date, cnt DESC, g ASC
)
INSERT INTO listen_stats_daily (
  date, listen_count, total_duration_seconds,
  unique_albums, unique_artists,
  earliest_listen, latest_listen, top_genre
)
SELECT
  s.date, s.listen_count, s.total_duration_seconds,
  s.unique_albums, s.unique_artists,
  s.earliest_listen, s.latest_listen, g.top_genre
FROM daily_stats s
LEFT JOIN daily_top_genre g ON g.date = s.date
ON CONFLICT (date) DO NOTHING;

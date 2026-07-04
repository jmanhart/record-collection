-- Listen log table
-- One row per listen. Created when an NFC tag is tapped (or manually logged).
-- The listened_at timestamp powers the timeline and analytics features.
CREATE TABLE listens (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  release_id  INTEGER NOT NULL,         -- Discogs release ID (matches records.id)
  listened_at TIMESTAMPTZ DEFAULT now(), -- when the listen happened
  source      TEXT DEFAULT 'nfc'         -- 'nfc', 'manual', 'arduino', etc.
);

-- Index for timeline queries (most recent first) and cooldown checks
CREATE INDEX idx_listens_listened_at ON listens (listened_at DESC);

-- Index for per-record analytics (most played, listen count per album)
CREATE INDEX idx_listens_release_id ON listens (release_id);

-- Allow anonymous read access (timeline, analytics views)
ALTER TABLE listens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access"
  ON listens
  FOR SELECT
  TO anon
  USING (true);

-- Allow anonymous insert (NFC tap opens a URL — no auth context)
-- Cooldown is enforced by the log_listen function, not RLS
CREATE POLICY "Allow public insert"
  ON listens
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- NFC tag to record mapping table
-- Each row links a physical NTAG215's hardware UID to a Discogs release ID.
-- Populated during the one-time pairing flow (Web NFC API on record detail page).
CREATE TABLE nfc_tags (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nfc_uid     TEXT UNIQUE NOT NULL,   -- hardware serial from NTAG215, e.g. "04:a2:3b:1a:2c:5e:80"
  release_id  INTEGER NOT NULL,       -- Discogs release ID (matches records.id)
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Allow anonymous read access (listen route needs to look up tags)
ALTER TABLE nfc_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access"
  ON nfc_tags
  FOR SELECT
  TO anon
  USING (true);

-- Restrict inserts to authenticated/service role (pairing flow only)
CREATE POLICY "Allow authenticated insert"
  ON nfc_tags
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

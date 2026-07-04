-- NFC tag to record mapping table
-- Each row links a physical NTAG215's hardware UID to a Discogs release ID.
-- Populated during the one-time pairing flow (Web NFC API on record detail page).
CREATE TABLE nfc_tags (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nfc_uid     TEXT UNIQUE NOT NULL,   -- hardware serial from NTAG215, colons stripped, e.g. "04a23b1a2c5e80"
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

-- Allow anonymous insert and update (no auth on this site, pairing flow needs this)
CREATE POLICY "Allow public insert"
  ON nfc_tags
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow anonymous update (re-pairing a tag to a different record)
CREATE POLICY "Allow public update"
  ON nfc_tags
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Allow anonymous delete (unlinking a tag)
CREATE POLICY "Allow public delete"
  ON nfc_tags
  FOR DELETE
  TO anon
  USING (true);

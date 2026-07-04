-- Patch: update nfc_tags RLS policies
-- Run this if you already created the nfc_tags table with the original migration.
-- Drops the old authenticated-only insert policy and adds anonymous insert/update/delete.

DROP POLICY IF EXISTS "Allow authenticated insert" ON nfc_tags;

CREATE POLICY "Allow public insert"
  ON nfc_tags
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow public update"
  ON nfc_tags
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete"
  ON nfc_tags
  FOR DELETE
  TO anon
  USING (true);

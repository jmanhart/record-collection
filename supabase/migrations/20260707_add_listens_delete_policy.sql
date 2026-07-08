-- listens had public SELECT/INSERT (see 20260703_create_listens.sql) but no
-- DELETE policy, so the new admin "delete a listen" feature was silently
-- blocked by RLS. Same public-write trade-off already accepted for
-- nfc_tags (20260703_patch_nfc_tags_policies.sql): no user-auth system on
-- this site, so the anon key needs it; the admin UI gate is a client-side
-- convenience, not real authorization.
CREATE POLICY "Allow public delete"
  ON listens
  FOR DELETE
  TO anon
  USING (true);

-- Original release date of the album (the master's first release), as opposed to
-- records.year which is the owned PRESSING's year (often a reissue, e.g. a 2010
-- repress of Kind Of Blue). Stored as a text ISO 8601 string with whatever
-- precision the source has: "1959-08-17", "1972-03", or "1959". Sourced from
-- MusicBrainz (release-group first-release-date), falling back to the Discogs
-- master year. Backfilled by tools/sync `backfill:release-dates`. The app groups
-- the collection by year/decade on this.
--
-- NOTE: applied to the linked project via the Management API (the migration
-- history on this project is out of sync with these files); kept here for
-- provenance / parity with the live schema.

ALTER TABLE records ADD COLUMN IF NOT EXISTS original_release_date text;
